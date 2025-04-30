from typing import Dict, List
import pandas as pd
import re
from io import BytesIO
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from datetime import datetime
 
from auth import hr_or_admin_required
from models import Employee, Department, Role, Competency, DepartmentRole, RoleCompetency, EmployeeCompetency, RoleJob, User
from security import get_password_hash


def parse_employee_data_from_csv_lines(csv_lines: List[str]) -> Dict:
    """Parse employee data from CSV-formatted lines extracted from Excel."""
    words = []
    current_employee = {
        "EmployeeNumber": "",
        "EmployeeName": "",
        "JobCode": "",
        "ReportingNumber": "",
        "RoleCode": "",
        "Department": "",
        "Competencies": []
    }
    in_competencies_section = False
    rpl_apl_count = 0
    
    # Extract all words first
    for line in csv_lines:
        line = line.strip()
        if not line:
            continue
        
        raw_parts = line.split(',')
        line_words = []
        
        for part in raw_parts:
            stripped_word = part.strip()
            if stripped_word:
                line_words.append(stripped_word)
        
        words.extend(line_words)

    i = 0
    while i < len(words):
        try:
            word = words[i]  
            word = word.lower()
            
            if not in_competencies_section:
                if word == "employee number" and i+1 < len(words):
                    current_employee["EmployeeNumber"] = words[i+1]
                    i += 2
                elif word == "employee name" and i+1 < len(words):
                    name = words[i+1]
                    current_employee["EmployeeName"] = "no name given" if name.strip() == '' else name
                    i += 2  
                elif word == "job code" and i+1 < len(words):
                    current_employee["JobCode"] = words[i+1]
                    i += 2
                elif word == "reporting employee number" and i+1 < len(words):
                    current_employee["ReportingNumber"] = words[i+1]
                    i += 2
                elif word == "role code" and i+1 < len(words):
                    current_employee["RoleCode"] = words[i+1]
                    i += 2
            
                elif word == "department & cost centre" and i+1 < len(words):
                    current_employee["Department"] = words[i+1]
                    i += 2
                elif word == "rpl/apl":
                    rpl_apl_count += 1
                    if rpl_apl_count == 2:  # Second occurrence starts competencies
                        in_competencies_section = True
                    i += 1
                else:
                    i += 1
            else:
                if i + 2 < len(words):
                    try:
                        raw_score = words[i+2]
                        score = int(raw_score.split('/')[0])
                        current_employee["Competencies"].append({
                            "Code": words[i+1],
                            "Score": score
                        })
                    except (ValueError, AttributeError, IndexError):

                        print(raw_score)
                        print(f"Warning: Failed to parse competency at index {i}. Finishing employee processing.{current_employee}")
                        break
                    i += 3
                else:
                    # Not enough words left for a competency data
                    break
                    
        except Exception as e:
            # always if try failed  increment i to avoid getting stuck
            print(f"Error processing word at index {i}: {e}")
            i += 1

    print(current_employee)
        

    if (
    current_employee["EmployeeNumber"]
    and current_employee["EmployeeName"]
    and current_employee["JobCode"]
    and current_employee["ReportingNumber"]
    and current_employee["RoleCode"]
    and current_employee["Department"]
    and current_employee["Competencies"]):
        return current_employee
     
    else:
        current_employee["EmployeeNumber"] =None
        return current_employee
  
  
 

def convert_excel_sheet_to_csv_lines(df: pd.DataFrame) -> List[str]:
    """Convert an Excel sheet DataFrame to cleaned CSV lines for parsing."""
    csv_lines = []
    for row in df.values:
        if any("managing points" in str(cell).strip().lower() for cell in row if pd.notna(cell)):
            return csv_lines
             
        clean_row = [str(cell).strip().replace(',', '/') if pd.notna(cell) else "" for cell in row]
        
        cleaned = []
        prev_empty = False
        for cell in clean_row:
            if cell == "":
                if not prev_empty:
                    cleaned.append(cell)
                prev_empty = True
            else:
                cleaned.append(cell)
                prev_empty = False
        
        csv_line = ",".join([cell for cell in cleaned if cell != ""]) + ","
        csv_line = re.sub(r',,+', ',', csv_line)
        
        if csv_line.strip(','):
            csv_lines.append(csv_line + "\n")
    return csv_lines

def check_department_exists(db: Session, department_name: str) -> Department:
    """Check if a department exists by name."""
    return db.query(Department).filter(Department.name == department_name).first()
 
   
def check_role_exists(db: Session, role_code: str) -> Role:
    """Check if a role exists by role_code."""
    return db.query(Role).filter(Role.role_code == role_code).first()
  



def check_job_code_exists(db: Session, job_code: str) -> RoleJob:
    """Check if a job code exists in the RoleJob table."""
    return db.query(RoleJob).filter(RoleJob.job_code == job_code,RoleJob.job_status==True).first()


def check_competency_exists(db: Session, competency_code: str) -> Competency:
    """Check if a competency exists by competency_code."""
    return db.query(Competency).filter(Competency.competency_code == competency_code).first()

# def ensure_department_role_link(db: Session, department_id: int, role_id: int) -> None:
#     """Ensure there's a link between department and role."""
#     link = db.query(DepartmentRole).filter(
#         DepartmentRole.department_id == department_id,
#         DepartmentRole.role_id == role_id
#     ).first()
    
#     if not link:
#         link = DepartmentRole(department_id=department_id, role_id=role_id)
#         db.add(link)
#         db.commit()



def process_employee_data(db: Session, employee_data: dict) -> dict:
    """Process employee data and determine if it can be successfully created/updated."""
    employee_number = employee_data["EmployeeNumber"]
    result = {
        "employee_number": employee_number,
        "employee_name": employee_data["EmployeeName"],
        "status": "processed",
        "failure_reason": None
    }
    
    # Check if department exists
    department = check_department_exists(db, employee_data["Department"])
    if not department:
        result["status"] = "failed"
        result["failure_reason"] = f"Department '{employee_data['Department']}' does not exist"
        return result
    
    # Check if role exists
    role = check_role_exists(db, employee_data["RoleCode"])
    if not role:
        result["status"] = "failed"
        result["failure_reason"] = f"Role '{employee_data['RoleCode']}' does not exist"
        return result
    


    job_code = employee_data["JobCode"]
    role_job = check_job_code_exists(db, job_code)
    if not role_job:
        result["status"] = "failed"
        result["failure_reason"] = f"Job code '{job_code}' does not exist"
        return result
    
    conflicting_employee = db.query(Employee).filter(
        Employee.job_code == job_code,
        Employee.employee_number != employee_number
    ).first()
    if conflicting_employee:
        result["status"] = "failed"
        result["failure_reason"] = f"Job code '{job_code}' is already assigned to another employee"
        return result



    for comp_data in employee_data["Competencies"]:
        competency = check_competency_exists(db, comp_data["Code"])
        if not competency:
            result["status"] = "failed"
            result["failure_reason"] = f"Competencies '{comp_data['Code']}' does not exist"
            return result
    


    # Create or update employee
    try:  
        employee = create_or_update_employee(db, employee_data, department,role)
        if employee == "error":
            result["status"] = "failed"
            result["failure_reason"] = "Database error occurred"
        else:
            result["status"] = employee
            
    except Exception as e:
        result["status"] = "failed"
        result["failure_reason"] = str(e)
    
    return result

def create_or_update_employee(db: Session, employee_data: dict, department: Department, 
                             role: Role) -> Employee:
    """Create or update an employee based on the parsed data."""
    employee_number = employee_data["EmployeeNumber"]
  
    # Check if employee already exists
    employee = db.query(Employee).filter(Employee.employee_number == employee_number).first()
    
    # Check if reporting employee exists, if not create a dummy one
    if employee_data["ReportingNumber"]:
        reporting_employee = db.query(Employee).filter(
            Employee.employee_number == employee_data["ReportingNumber"]
        ).first()
        
        if not reporting_employee:
          
            
            reporting_employee = Employee(
                employee_number=employee_data["ReportingNumber"],
                employee_name=f"Manager {employee_data['ReportingNumber']}",
                job_code="dummy100",
                reporting_to="100000000",
                role_id=100,
                department_id=100
            )
            db.add(reporting_employee)
            db.commit()
            db.refresh(reporting_employee)
            
            # Create user for the dummy reporting employee
            create_manager(db, reporting_employee.employee_number)
            
           
    
    # Ensure department-role link if both entities exist
    # ensure_department_role_link(db, department.id, role.id)
    
    if not employee:
        # Create new employee
        status ="Created"
        employee = Employee(
            employee_number=employee_number,
            employee_name=employee_data["EmployeeName"],
            job_code=employee_data["JobCode"],
            reporting_to=employee_data["ReportingNumber"],
            role_id=role.id,
            department_id=department.id
        )
        db.add(employee)
        db.commit()
        db.refresh(employee)
        
        # Create user for the new employee and manger role for reported officer
        update_user(db,employee.reporting_to)

        create_user(db, employee.employee_number)
    else:
          # Update employee details
        status ="Updated"
        employee.employee_name = employee_data["EmployeeName"]
        employee.reporting_to = employee_data["ReportingNumber"]
        employee.job_code=employee_data["JobCode"]
        #need to test this^
        employee.role_id = role.id
        employee.department_id = department.id

        
        db.commit()
        db.refresh(employee)


        update_user(db,employee.reporting_to)
    # Update employee competencies
    update_employee_competencies(db, employee, employee_data)
    
    # return employee
    return status

def update_employee_competencies(db: Session, employee: Employee, employee_data:Dict) -> None:
    # Update employee competencies  table without deleting existing ones.

    role_id = employee.role_id

    # # Fetch existing role competencies for this role
    # role_competency_map = {
    #     rc.competency_code: rc for rc in db.query(RoleCompetency).filter(RoleCompetency.role_id == role_id).all()
    # }

    # Fetch existing employee competencies
    emp_competency_map = {
        ec.competency_code: ec for ec in db.query(EmployeeCompetency).filter(
            EmployeeCompetency.employee_number == employee.employee_number
        ).all()
    }

    for comp_data in employee_data["Competencies"]:
        code = comp_data["Code"]
        score = comp_data["Score"]

        # 1. Update or create EmployeeCompetency
        if code in emp_competency_map:
            # Update required_score if different
            ec = emp_competency_map[code]
            if ec.required_score != score:
                ec.required_score = score
        else:
            # Create new EmployeeCompetency
            db.add(EmployeeCompetency(
                employee_number=employee.employee_number,
                competency_code=code,
                required_score=score,
                actual_score=0
            ))

        # # 2. Update or create RoleCompetency
        # if code in role_competency_map:
        #     rc = role_competency_map[code]
        #     if rc.role_competency_required_score != score:
        #         rc.role_competency_required_score = score
        # else:
        #     db.add(RoleCompetency(
        #         role_id=role_id,
        #         competency_code=code,
        #         role_competency_required_score=score
        #     ))

    db.commit()





def create_user(db: Session, employee_number: str) -> User:
    """Create user for an employee if doesn't exist."""
    # Check if employee has direct reports
   
    reporting_employees = db.query(Employee).filter(Employee.reporting_to == employee_number).count()
    role = "Manager" if reporting_employees > 0 else "Employee"

    user = db.query(User).filter(User.employee_number == employee_number).first()
    if not user:
        user = User(
            employee_number=employee_number,
            email=f"{employee_number}@company.com",
            hashed_password=get_password_hash(employee_number),
            role=role
        )
        db.add(user)
    else: 
        if user.role != role:  # Update role only if it has changed
            user.role = role
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
    
    return user



def update_user(db: Session, employee_number: str) -> User:
    """Create user for an employee if doesn't exist."""
    user = db.query(User).filter(User.employee_number == employee_number).first()
    if not user:
        user = User(
            employee_number=employee_number,
            email=f"{employee_number}@company.com",
            hashed_password=get_password_hash(employee_number),
            role="Manager"
        )
        db.add(user)
    else: 
        if user.role != "Manager":  # Update role only if it has changed
            user.role = "Manager"
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
    
    return user



def create_manager(db: Session, employee_number: str) -> User:
  
    user = db.query(User).filter(User.employee_number == employee_number).first()
    if not user:
        user = User(
            employee_number=employee_number,
            email=f"{employee_number}@company.com",
            hashed_password=get_password_hash(employee_number),
            role="Manager"
        )
        db.add(user)
    else: 
        if user.role != "Manager":  # Update role only if it has changed
            user.role = "Manager"
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
    
    return user

def  extract_employee_data_from_excel(excel_content: bytes, db: Session) -> List[dict]:
    """Extract employee data from Excel file bytes and process it in the database."""
    xls = pd.ExcelFile(BytesIO(excel_content))
    processed_results = []
    
    for sheet_name in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet_name, header=None)
        csv_lines = convert_excel_sheet_to_csv_lines(df)
        employee_data = parse_employee_data_from_csv_lines(csv_lines)
        
        if employee_data != "error" and employee_data["EmployeeNumber"]:
            # Process the employee data
            result = process_employee_data(db, employee_data)
            processed_results.append(result)
        else:
            print("Employee data xl sheet is failded")
    return processed_results




from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter()

@router.post("/employees/upload-employee-data/")
async def upload_employee_data(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),current_user: Dict = Depends(hr_or_admin_required)
):
    contents = await file.read()
    processed_results = extract_employee_data_from_excel(contents, db)

    success_count = sum(1 for result in processed_results if result["status"] == "processed" or result["status"] == "Updated")
    failure_count = sum(1 for result in processed_results if result["status"] == "failed")
    

    return {
        "status": "success",
        "summary": {
            "total": len(processed_results),
            "processed": success_count,
            "failed": failure_count
        },
        "processed_employees": processed_results
    }


