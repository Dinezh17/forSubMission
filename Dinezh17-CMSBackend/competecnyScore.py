from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_
from sqlalchemy.orm import Session
from typing import Dict, List
from auth import get_current_user, hr_or_admin_required
from database import get_db
from models import Competency, Employee, EmployeeCompetency, Role, RoleCompetency
from schemas import CompetencyScoreUpdate



router = APIRouter()






@router.post("/evaluations/{employee_number}")
def submit_evaluation(
    employee_number: str,
    evaluation_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    role =current_user["role"] 
    if role not in ["ADMIN","HOD","Manager"]:
        raise HTTPException(status_code=401, detail="No access")   
    # Validate input
    if "scores" not in evaluation_data:
        raise HTTPException(status_code=400, detail="Invalid evaluation data format")
    
   
    # Check if employee exists
    employee = db.query(Employee).filter(Employee.employee_number == employee_number).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Process each competency score
    for score in evaluation_data["scores"]:
        has_competency_code = "competency_code" in score
        has_actual_score = "actual_score" in score

        if not (has_competency_code and has_actual_score):
            continue
            
        # Update    competency record
        competency = db.query(EmployeeCompetency).filter(
            EmployeeCompetency.employee_number == employee_number,
            EmployeeCompetency.competency_code == score["competency_code"]
        ).first()
        
        if competency:
            # Update existing record
            competency.actual_score = score["actual_score"]

    evaluator_id=db.query(Employee).filter(Employee.employee_number==current_user["username"]).first()
    if not evaluator_id:
        raise HTTPException(status_code=404, detail="Evaluator not found")
    


    employee.evaluation_status = "True"
    employee.evaluation_by = evaluator_id.employee_name
    employee.last_evaluated_date = datetime.utcnow()
    db.commit()

    res = db.query(Employee.employee_number).filter(and_(Employee.reporting_to == evaluator_id.employee_number,Employee.evaluation_status=="False")).all()

    if not res:
        print ("all the evaluations of my team members are done from -" ,evaluator_id.employee_name )


    
    
    return {"message": "Evaluation submitted successfully"}





