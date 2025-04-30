
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Competency, Department, Employee, EmployeeCompetency, Role, RoleJob

router = APIRouter()





# used in hr employee details view page and manger evalute page gets the employee number as path parameter

@router.get("/employee-details/{employee_number}")
def get_employee_details(employee_number: str, db: Session = Depends(get_db)):
    # Get basic employee info
    employee = db.query(Employee).filter(Employee.employee_number == employee_number).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Get reporting manager name
    reporting_name = None
    if employee.reporting_to:
        reporting_emp = db.query(Employee).filter(Employee.employee_number == employee.reporting_to).first()
        reporting_name = reporting_emp.employee_name if reporting_emp else None
    
    # Get department and role names
    department = db.query(Department).filter(Department.id == employee.department_id).first()
    role = db.query(Role).filter(Role.id == employee.role_id).first()
    # Get job name
    job = db.query(RoleJob).filter(RoleJob.job_code == employee.job_code).first()

    # Get competencies separated classified by fun or behav
    functional_comps = db.query(
        Competency.competency_code,
        Competency.competency_name,
        Competency.competency_description,
        EmployeeCompetency.required_score,
        EmployeeCompetency.actual_score,
        (EmployeeCompetency.required_score - EmployeeCompetency.actual_score).label("gap")
    ).join(
        EmployeeCompetency,
        EmployeeCompetency.competency_code == Competency.competency_code
    ).filter(
        EmployeeCompetency.employee_number == employee_number,
        Competency.competency_description == "Functional"
    ).all()
    
    behavioral_comps = db.query(
        Competency.competency_code,
        Competency.competency_name,
        Competency.competency_description,
        EmployeeCompetency.required_score,
        EmployeeCompetency.actual_score,
        (EmployeeCompetency.required_score - EmployeeCompetency.actual_score).label("gap")
    ).join(
        EmployeeCompetency,
        EmployeeCompetency.competency_code == Competency.competency_code
    ).filter(
        EmployeeCompetency.employee_number == employee_number,
        Competency.competency_description == "Behavioral"
    ).all()
    
    # Convert  results to dictionaries
    functional_competencies = [
        {
            "competency_code": comp.competency_code,
            "competency_name": comp.competency_name,
            "competency_description": comp.competency_description,

            "required_score": comp.required_score,
            "actual_score": comp.actual_score,
            "gap": comp.gap
        }
        for comp in functional_comps
    ]
    
    behavioral_competencies = [
        {
            "competency_code": comp.competency_code,
            "competency_name": comp.competency_name,
            "competency_description": comp.competency_description,
            "required_score": comp.required_score,
            "actual_score": comp.actual_score,
            "gap": comp.gap
        }
        for comp in behavioral_comps
    ]
    
    return {
        "employee": {
            "employee_number": employee.employee_number,
            "employee_name": employee.employee_name,
            "job_code": employee.job_code,
            "job_name": job.job_name if job else None,
            "reporting_employee_name": reporting_name,
            "department": department.name if department else None,
            "role": role.role_name if role else None,
            "role_code": role.role_code if role else None,
            "role_category":role.role_category,
            "evaluation_status": employee.evaluation_status,
            "sent_to_evaluation_by": employee.sent_to_evaluation_by,
            "evaluation_by": employee.evaluation_by,
            "last_evaluated_date": employee.last_evaluated_date
        },
        "functional_competencies": functional_competencies,
        "behavioral_competencies": behavioral_competencies
    }