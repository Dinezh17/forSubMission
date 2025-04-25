# Add these to your existing FastAPI router

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Competency, Department, Employee, EmployeeCompetency, Role, RoleJob

router = APIRouter()
 




 
@router.get("/myscores/employee-details/")
def get_employee_details(db: Session = Depends(get_db),current_user: dict = Depends(get_current_user)):
    
    # Get basic employee info
    

    employee = db.query(Employee).filter(Employee.employee_number == current_user["username"]).first()
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
    job = db.query(RoleJob).filter(RoleJob.job_code == employee.job_code).first()
    
    # Get competencies separated by type
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
        EmployeeCompetency.employee_number == current_user["username"],
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
        EmployeeCompetency.employee_number == current_user["username"],
        Competency.competency_description == "Behavioral"
    ).all()
    
    # Convert query results to dictionaries
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
            "evaluation_status": employee.evaluation_status,
            "sent_to_evaluation_by": employee.sent_to_evaluation_by,
            "evaluation_by": employee.evaluation_by,
            "last_evaluated_date": employee.last_evaluated_date
        },
        "functional_competencies": functional_competencies,
        "behavioral_competencies": behavioral_competencies
    }








# used for the bar stats in the myscore page


@router.get("/stats-bar/employee/{employee_number}/competency-stats")
def get_employee_competency_stats(employee_number: str, db: Session = Depends(get_db)):

    records = db.query(EmployeeCompetency).filter(EmployeeCompetency.employee_number == employee_number).all()

    if not records:
        raise HTTPException(status_code=404, detail="Employee competency records not found")

    total_required_score = 0
    total_actual_score = 0
    fulfilled_count = 0

    for record in records:
        total_required_score += record.required_score
        total_actual_score += record.actual_score
        if record.actual_score >= record.required_score:
            fulfilled_count += 1

    total_competencies = len(records)
    avg_fulfillment_rate = (fulfilled_count / total_competencies) * 100 if total_competencies > 0 else 0

    stats = {
        "employee_number": employee_number,
        "total_competencies": total_competencies,
        "average_fulfillment_rate_percentage": avg_fulfillment_rate,
        "total_required_score": total_required_score,
        "total_actual_score": total_actual_score
    }

    return stats
