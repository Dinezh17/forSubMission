
from typing import List
from fastapi import Depends, HTTPException
from sqlalchemy import and_
from sqlalchemy.orm import Session
from fastapi import APIRouter
from auth import get_current_user, hr_or_admin_required
from database import get_db
from models import Competency, Employee, EmployeeCompetency, Role, RoleCompetency
from schemas import CompetencyScoreUpdate

router = APIRouter()













@router.post("/roles/{role_id}/competencies", response_model=List[str])
def assign_competencies_to_role(
    role_id: int,
    competency_codeds: List[str],
    db: Session = Depends(get_db),
    current_user: dict = Depends(hr_or_admin_required)
):
    # 1. Verify role exists
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    # 2. Get existing role-competency assignments
    existing_assignments = db.query(RoleCompetency.competency_code).filter(
        RoleCompetency.role_id == role_id
    ).all()
    existing_codes = {a.competency_code for a in existing_assignments}

    # 3. Filter new competencies to assign
    new_codes = set(competency_codeds) - existing_codes
    if not new_codes:
        return []

    # 4. Verify all competencies exist
    existing_competencies = {c.competency_code for c in db.query(Competency.competency_code).filter(
        Competency.competency_code.in_(new_codes)
    ).all()}
    missing = new_codes - existing_competencies
    if missing:
        raise HTTPException(
            status_code=404,
            detail=f"Competencies not found: {missing}"
        )

    # 5. Create new RoleCompetency assignments
    for comp_code in new_codes:
        db.add(RoleCompetency(
            role_id=role_id,
            competency_code=comp_code,
            role_competency_required_score=3  # default required score
        ))
    db.commit()

    role.assigned_comp_count= db.query(RoleCompetency).filter(RoleCompetency.role_id==role_id).count()
    # 6. Reflect changes in EmployeeCompetency
    # Get all employees with this role
    employees = db.query(Employee).filter(Employee.role_id == role_id).all()

    # For each new competency, update employees
    for comp_code in new_codes:
       
        for emp in employees:
            # Check if already exists
            existing = db.query(EmployeeCompetency).filter_by(
                employee_number=emp.employee_number,
                competency_code=comp_code
            ).first()
            if not existing:
                # Create EmployeeCompetency
                db.add(EmployeeCompetency(
                    employee_number=emp.employee_number,
                    competency_code=comp_code,
                    required_score=3,
                    actual_score=0
                ))
    db.commit()




    return list(new_codes)








@router.delete("/roles/{editing_role_id}/competencies", response_model=List[str])
def remove_competencies_from_role(
    editing_role_id: int,
    competency_codes: List[str],
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    role = current_user["role"]
    if role not in ["HR", "ADMIN"]:
        raise HTTPException(status_code=401, detail="No access")

    # 1. Verify role exists
    role_obj = db.query(Role).filter(Role.id == editing_role_id).first()
    if not role_obj:
        raise HTTPException(status_code=404, detail="Role not found")

    # 2. Delete RoleCompetency mappings
    deleted = db.query(RoleCompetency).filter(
        RoleCompetency.role_id == editing_role_id,
        RoleCompetency.competency_code.in_(competency_codes)
    ).delete(synchronize_session=False)



    role_obj.assigned_comp_count= db.query(RoleCompetency).filter(RoleCompetency.role_id==editing_role_id).count()
    if deleted == 0:
        db.commit()
        raise HTTPException(
            status_code=404,
            detail="No matching competency assignments found"
        )

    # 3. Delete from EmployeeCompetency for employees with this role
    employee_numbers = db.query(Employee.employee_number).filter(
        Employee.role_id == editing_role_id
    ).all()
    employee_numbers = [e.employee_number for e in employee_numbers]

    if employee_numbers:
        db.query(EmployeeCompetency).filter(
            EmployeeCompetency.employee_number.in_(employee_numbers),
            EmployeeCompetency.competency_code.in_(competency_codes)
        ).delete(synchronize_session=False)

    db.commit()
    return competency_codes








@router.get("/roles/{role_id}/competencies/detailed")
def get_role_competencies_with_scores(role_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Check if role exists
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Get role competencies with scores
    role_competencies = db.query(RoleCompetency).filter(
        RoleCompetency.role_id == role_id
    ).all()
    
    # Return as list of dicts with competency_code and score
    result = [
        {
            "competency_code": rc.competency_code,
            "role_competency_required_score": rc.role_competency_required_score 
        }
        for rc in role_competencies
    ]
    print(result)
    return result







# Update competency scores for a role
@router.put("/roles/{role_id}/competencies/scores")
def update_role_competency_scores(
    role_id: str,
    competency_updates: List[CompetencyScoreUpdate],
    db: Session = Depends(get_db),
    current_user: dict = Depends(hr_or_admin_required)
):
    # 1. Check if role exists
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        print(1)
        raise HTTPException(status_code=404, detail="Role not found")

    # 2. Get employees for this role
    employees = db.query(Employee.employee_number).filter(
        Employee.role_id == role_id
    ).all()
    employee_numbers = [e.employee_number for e in employees]

    # 3. Update each competency score in RoleCompetency and EmployeeCompetency
    updated_count = 0
    for update in competency_updates:
        # Update RoleCompetency
        role_comp = db.query(RoleCompetency).filter(
            and_(
                RoleCompetency.role_id == role_id,
                RoleCompetency.competency_code == update.competency_code
            )
        ).first()

        if role_comp:
            role_comp.role_competency_required_score = update.role_competency_required_score
            updated_count += 1

            # Update required_score in EmployeeCompetency for all related employees
            db.query(EmployeeCompetency).filter(
                EmployeeCompetency.employee_number.in_(employee_numbers),
                EmployeeCompetency.competency_code == update.competency_code
            ).update(
                {EmployeeCompetency.required_score: update.role_competency_required_score},
                synchronize_session=False
            )

    if updated_count == 0:
        raise HTTPException(status_code=404, detail="No matching competencies found for this role")

    db.commit()
    return {"message": f"Updated scores for {updated_count} competencies"}
