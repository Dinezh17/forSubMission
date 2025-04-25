from datetime import date
from http.client import HTTPException
from typing import Dict, List
from auth import get_current_user, hr_or_admin_required
from database import get_db
from fastapi import APIRouter, Depends
from models import Employee, User
from schemas import BulkEvaluationStatusUpdate,EmployeeResponse
from sqlalchemy.orm import Session



router = APIRouter()





@router.patch("/employees/evaluation-status", response_model=List[str])
async def bulk_update_evaluation_status(
    update_data: BulkEvaluationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(hr_or_admin_required)
):  
    
    employees = db.query(Employee).filter(
        Employee.employee_number.in_(update_data.employee_numbers)
    ).all()
    
    if not employees:
        raise HTTPException(status_code=404, detail="No employees found")
    user = db.query(Employee).filter(Employee.employee_number==current_user["username"]).first()
    
    name = user.employee_name if user else  "No name"
    for employee in employees:
        employee.evaluation_status = "False"
        employee.sent_to_evaluation_by = name
 
    mangers = db.query(Employee.reporting_to).filter(
        Employee.employee_number.in_(update_data.employee_numbers)
    ).group_by(Employee.reporting_to).all()
    

    mangers = [mn[0] for mn in mangers]

    emails = db.query(User.email).filter(User.employee_number.in_(mangers)).all()

    emails = [em[0] for em in emails]

    print("email sent to these managers", emails , "subject - finish your teams competency evaluation")

    db.commit()
    return (emp.employee_number for emp in employees) 