
from pydantic import BaseModel
from sqlalchemy import  and_
from sqlalchemy.orm import Session
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from auth import get_current_user, hr_or_admin_required
from database import get_db
from models import Department, DepartmentRole, Employee, EmployeeCompetency, Role, RoleCompetency, RoleJob, User
from schemas import EmployeeCreate, EmployeeCreateResponse, EmployeeResponse, ManagerResponse
from security import get_password_hash


router = APIRouter()






@router.get("/employees/", response_model=List[EmployeeResponse])
def get_employees(db: Session = Depends(get_db), current_user: Dict = Depends(get_current_user)):
   

    results = (
        db.query(Employee, RoleJob.job_name)
        .join(RoleJob, Employee.job_code == RoleJob.job_code)
        .filter(Employee.employee_number != "100000000")
        .all()
    )

    response = []
    for emp, job_name in results:
        emp_data = emp.__dict__.copy()
        emp_data["job_name"] = job_name
        response.append(EmployeeResponse(**emp_data))

    return response




@router.get("/employees/{employee_number}", response_model=EmployeeResponse)
def get_employee(employee_number: str, db: Session = Depends(get_db), current_user: Dict = Depends(get_current_user)):
  

    result = (
        db.query(Employee, RoleJob.job_name)
        .join(RoleJob, Employee.job_code == RoleJob.job_code)
        .filter(Employee.employee_number == employee_number)
        .first()
    )

    if not result:
        raise HTTPException(status_code=404, detail="Employee not found")

    emp, job_name = result
    emp_data = emp.__dict__.copy()
    emp_data["job_name"] = job_name

    return EmployeeResponse(**emp_data)






@router.post("/employees/", response_model=EmployeeCreateResponse)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db),current_user: Dict = Depends(hr_or_admin_required)):
    # Validate department exists
    department = db.query(Department).filter(Department.id == employee.department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Validate role exists
    role = db.query(Role).filter(Role.id == employee.role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Validate department-role relate using join and filter
    dept_role = db.query(DepartmentRole).filter(
        and_(
            DepartmentRole.department_id == employee.department_id,
            DepartmentRole.role_id == employee.role_id
        )
    ).first()
    
    if not dept_role:
        raise HTTPException(status_code=400, detail="This role is not available for the selected department")
    
    # Validate reporting manager if provided
    if employee.reporting_to:
      
        manager_query = db.query(Employee).join(
            User, User.employee_number == Employee.employee_number
        ).filter(
            and_(
                Employee.employee_number == employee.reporting_to,
                User.role == "Manager"
            )
        )
        
        manager = manager_query.first()
        if not manager:
            raise HTTPException(status_code=404, detail="Reporting manager not found or not a manager")
    
    # Create employee
    try:
        db_employee = Employee(
            employee_number=employee.employee_number.strip(),
            employee_name=employee.employee_name.strip(),
            job_code=employee.job_code,
            reporting_to=employee.reporting_to,
            role_id=employee.role_id,
            department_id=employee.department_id,
           
        )
        print(db_employee.evaluation_status)
        db.add(db_employee)
        db.commit()
        db.refresh(db_employee)
        print("2")

        role_competencies = db.query(RoleCompetency).filter(RoleCompetency.role_id == employee.role_id).all()
        print("3")
        
        employee_competencies = [
            EmployeeCompetency(
                employee_number=employee.employee_number,
                competency_code=comp.competency_code,
                required_score=comp.role_competency_required_score,
                actual_score=0
            )
            for comp in role_competencies
        ]
        print("4")

      
        db.add_all(employee_competencies)
        db.commit()
        db_user = User(
            employee_number=employee.employee_number,
            email=f"{employee.employee_number}@company.com", 
            hashed_password=get_password_hash(employee.employee_number),  
            role="Employee" 
        )
        print("5")
        
        db.add(db_user)
        db.commit()
        db.refresh(db_employee)
        db.refresh(db_user)

        return db_employee
    except:
        raise HTTPException(status_code=400, detail="Employee with this number already exists")







@router.put("/employees/{employee_number}", response_model=EmployeeCreateResponse)
def update_employee(employee_number: str, employee_update: EmployeeCreate, db: Session = Depends(get_db),current_user: Dict = Depends(hr_or_admin_required)):

    db_employee = db.query(Employee).filter(Employee.employee_number == employee_number).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Validate department if updated
    if employee_update.department_id:
        department = db.query(Department).filter(Department.id == employee_update.department_id).first()
        if not department:
            raise HTTPException(status_code=404, detail="Department not found")
    
    # Validate role if updated
    if employee_update.role_id:
        role = db.query(Role).filter(Role.id == employee_update.role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
    
    # Validate department-role relationship if both are updated
    if employee_update.department_id and employee_update.role_id:
        dept_role = db.query(DepartmentRole).filter(
            and_(
                DepartmentRole.department_id == employee_update.department_id,
                DepartmentRole.role_id == employee_update.role_id
            )
        ).first()
        
        if not dept_role:
            raise HTTPException(status_code=400, detail="This role is not available for the selected department")
    
    # Validate reporting manager if updated
    if employee_update.reporting_to:
        manager_query = db.query(Employee).join(
            User, User.employee_number == Employee.employee_number
        ).filter(
            and_(
                Employee.employee_number == employee_update.reporting_to,
                User.role == "Manager"
            )
        )
        
        manager = manager_query.first()
        if not manager:
            raise HTTPException(status_code=404, detail="Reporting manager not found or not a manager")
    
    try:
        role_changed = employee_update.role_id and employee_update.role_id != db_employee.role_id

        db_employee.employee_number = employee_update.employee_number.strip()
        db_employee.employee_name = employee_update.employee_name.strip()
        db_employee.job_code = employee_update.job_code
   
        db_employee.reporting_to = employee_update.reporting_to
        db_employee.role_id = employee_update.role_id
        db_employee.department_id = employee_update.department_id
        db.commit()
        db.refresh(db_employee)

        # If role changed, flush existing competencies
        if role_changed:
            db.query(EmployeeCompetency).filter(EmployeeCompetency.employee_number == employee_number).delete()
            db.commit()

            # Assign new competencies based on the updated role
            role_competencies = db.query(RoleCompetency).filter(RoleCompetency.role_id == employee_update.role_id).all()

            new_employee_competencies = [
                EmployeeCompetency(
                    employee_number=employee_number,
                    competency_code=comp.competency_code,
                    required_score=comp.role_competency_required_score,
                    actual_score=0
                )
                for comp in role_competencies
            ]

            db.add_all(new_employee_competencies)
            db.commit()

        return db_employee
    
    except :
       
        raise HTTPException(status_code=400, detail="Update failed due to integrity constraint")
    






@router.delete("/employees/{employee_number}")
def delete_employee(employee_number: str, db: Session = Depends(get_db),current_user: Dict = Depends(hr_or_admin_required)):
    db_employee = db.query(Employee).filter(Employee.employee_number == employee_number).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
  
  
    # Check if any employees report to this employee
    reporting_employees = db.query(Employee).filter(Employee.reporting_to == employee_number).all()

    if reporting_employees:
        raise HTTPException(status_code=400, detail="Cannot delete employee who has direct reports")
    

    db.query(User).filter(User.employee_number == employee_number).delete()
    db.query(EmployeeCompetency).filter(EmployeeCompetency.employee_number == employee_number).delete()
    db.commit()
    db.delete(db_employee)
    db.commit()
    return None











#for testing


class UserCreate(BaseModel):
    employee_number: Optional[str] = None
    username: str
    email: str
    password: str  # Plain password before hashing
    role: str
class UserResponse(BaseModel):
    id: int
    employee_number: Optional[str] = None
    username: str
    email: str
    role: str


@router.put("/users")
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if username or email already exists
    existing_user = db.query(User).filter(User.employee_number==user_data.employee_number).first()
    
    existing_user.role=user_data.role
    db.commit()
    db.refresh(existing_user)
    return existing_user
   