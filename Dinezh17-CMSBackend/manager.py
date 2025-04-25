
from sqlalchemy import and_
from sqlalchemy.orm import Session
from typing import Dict, List
from fastapi import APIRouter, Depends
from auth import get_current_user, hr_or_admin_required
from database import get_db
from models import  Employee, RoleJob, User
from schemas import EmployeeResponse, ManagerResponse



router = APIRouter()


 
@router.get("/manager/employees", response_model=List[EmployeeResponse])
def get_employees(db: Session = Depends(get_db),
                  current_user: dict = Depends(get_current_user)):
    
    
    results = (
            db.query(Employee, RoleJob.job_name)
            .join(RoleJob, Employee.job_code == RoleJob.job_code)
            .filter(and_(Employee.reporting_to==current_user["username"],Employee.employee_number != "100000000"))
            .all()
        )

    response = []
    for emp, job_name in results:
            emp_data = emp.__dict__.copy()
            emp_data["job_name"] = job_name
            response.append(EmployeeResponse(**emp_data))

    return response






@router.get("/managers/", response_model = List[ManagerResponse])
def get_managers(db: Session = Depends(get_db),current_user: Dict = Depends(hr_or_admin_required)):
    
    managers = db.query(Employee.employee_name,Employee.employee_number).join(
        User, User.employee_number == Employee.employee_number
    ).filter(and_(
        User.role == "Manager",Employee.employee_number != 100000000
    )).all()
   
    return managers



