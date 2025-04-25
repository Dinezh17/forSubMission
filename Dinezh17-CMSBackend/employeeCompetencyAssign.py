from typing import List
from auth import get_current_user, hr_or_admin_required
from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models import Competency, Employee, EmployeeCompetency
from sqlalchemy.orm import Session

from schemas import  EmpCompetencyScoreUpdate

router = APIRouter()




@router.post("/assign-employees/{employee_number}/competencies", response_model=List[str])
def assign_competencies_to_employee(
    employee_number: str,
    competency_codes: List[str],
    db: Session = Depends(get_db),
    current_user: dict = Depends(hr_or_admin_required)
):
    # 1. Verify employee exists
    employee = db.query(Employee).filter(Employee.employee_number == employee_number).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # 2. Check for existing assignments
    existing_assignments = db.query(EmployeeCompetency.competency_code).filter(
        EmployeeCompetency.employee_number == employee_number
    ).all()
    existing_codes = {e.competency_code for e in existing_assignments}

    # 3. Filter new competencies
    new_codes = set(competency_codes) - existing_codes
    if not new_codes:
        return []

    # 4. Validate that the competency codes exist
    valid_codes = {c.competency_code for c in db.query(Competency).filter(
        Competency.competency_code.in_(new_codes)
    ).all()}
    missing = new_codes - valid_codes
    if missing:
        raise HTTPException(status_code=404, detail=f"Competencies not found: {missing}")

    # 5. Assign new competencies
    for code in new_codes:
        db.add(EmployeeCompetency(
            employee_number=employee_number,
            competency_code=code,
            required_score=3,
            actual_score=0
        ))
    db.commit()

    return list(new_codes)






@router.delete("/assign-employees/{employee_number}/competencies", response_model=List[str])
def remove_competencies_from_employee(
    employee_number: str,
    competency_codes: List[str],
    db: Session = Depends(get_db),
    current_user: dict = Depends(hr_or_admin_required)
):
    # 1. Verify employee exists
    employee = db.query(Employee).filter(Employee.employee_number == employee_number).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # 2. Delete comp mappings
    deleted = db.query(EmployeeCompetency).filter(
        EmployeeCompetency.employee_number == employee_number,
        EmployeeCompetency.competency_code.in_(competency_codes)
    ).delete(synchronize_session=False)

    if deleted == 0:
        raise HTTPException(status_code=404, detail="No matching competencies found")

    db.commit()
    return competency_codes





@router.put("/assign-employees/{employee_number}/competencies/scores")
def update_employee_competency_scores(
    employee_number: str,
    
    competency_updates: List[EmpCompetencyScoreUpdate],
    db: Session = Depends(get_db),
    current_user: dict = Depends(hr_or_admin_required)
):
    # 1. Verify employee exists
    employee = db.query(Employee).filter(Employee.employee_number == employee_number).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    updated_count = 0
    for update in competency_updates:
        ec = db.query(EmployeeCompetency).filter(
            EmployeeCompetency.employee_number == employee_number,
            EmployeeCompetency.competency_code == update.competency_code
        ).first()
        if ec:
            ec.required_score = update.required_score
            updated_count += 1

    if updated_count == 0:
        raise HTTPException(status_code=404, detail="No matching competencies found")

    db.commit()
    return {"message": f"Updated actual scores for {updated_count} competencies"}







@router.get("/assign-employees/{employee_number}/competencies")
def get_employee_competencies(
    employee_number: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    employee = db.query(Employee).filter(Employee.employee_number == employee_number).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    competencies = db.query(EmployeeCompetency).filter(
        EmployeeCompetency.employee_number == employee_number
    ).all()

    result =  [
        {
            "competency_code": ec.competency_code,
            "required_score": ec.required_score,
        }
        for ec in competencies
    ]
    print(result)
    return result

