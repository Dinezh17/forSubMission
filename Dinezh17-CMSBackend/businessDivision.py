from auth import get_current_user, hr_or_admin_required
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import BusinessDivision, Department
from schemas import BusinessDivisionBase, BusinessDivisionResponse
from database import get_db


router = APIRouter()


# tested
@router.post("/business-divisions/", response_model=BusinessDivisionResponse)
def create_business_division(
    division: BusinessDivisionBase,
    db: Session = Depends(get_db),
    current_user: dict = Depends(hr_or_admin_required)
):
    existing = db.query(BusinessDivision).filter(BusinessDivision.name == division.name.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Business Division already exists")

    new_division = BusinessDivision(name=division.name.strip())
    db.add(new_division)
    db.commit()
    db.refresh(new_division)
    return new_division


@router.get("/business-divisions/", response_model=list[BusinessDivisionResponse])
def get_business_divisions(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(BusinessDivision).all()


@router.get("/business-divisions/{division_id}", response_model=BusinessDivisionResponse)
def get_business_division(
    division_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    division = db.query(BusinessDivision).filter(BusinessDivision.id == division_id).first()
    if not division:
        raise HTTPException(status_code=404, detail="Business Division not found")
    return division

@router.put("/business-divisions/{division_id}", response_model=BusinessDivisionResponse)
def update_business_division(
    division_id: int,
    division_data: BusinessDivisionBase,
    db: Session = Depends(get_db),
    current_user: dict = Depends(hr_or_admin_required)
):
    division = db.query(BusinessDivision).filter(BusinessDivision.id == division_id).first()
    if not division:
        raise HTTPException(status_code=404, detail="Business Division not found")
    
    division.name = division_data.name.strip()
    db.commit()
    db.refresh(division)
    return division


@router.delete("/business-divisions/{division_id}", response_model=dict)
def delete_business_division(
    division_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(hr_or_admin_required)
):
    division = db.query(BusinessDivision).filter(BusinessDivision.id == division_id).first()
    if not division:
        raise HTTPException(status_code=404, detail="Business Division not found")

    # Check for associated departments
    associated_departments = db.query(Department).filter(Department.business_division_id == division_id).first()
    if associated_departments:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete business division. Departments are still assigned to it."
        )

    db.delete(division)
    db.commit()
    return {"message": "Business Division deleted successfully"}