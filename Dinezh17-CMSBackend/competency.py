
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, List
from auth import get_current_user, hr_or_admin_required
from database import get_db
from models import Competency, EmployeeCompetency
from schemas import CompetencyCreate, CompetencyResponse
from typing import List, Optional
from fastapi import  Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel
from database import get_db 


router = APIRouter()




@router.post("/competency", response_model=CompetencyResponse)
def create_competency(
    competency: CompetencyCreate, 
    db: Session = Depends(get_db), 
    current_user: Dict = Depends(hr_or_admin_required)
):
   
    existing_competency = db.query(Competency).filter(Competency.competency_code == competency.competency_code).first()
    if existing_competency:
        raise HTTPException(status_code=400, detail="Competency code already exists")
    
  
    new_competency = Competency(
        competency_code=competency.competency_code.strip(),
        competency_name=competency.competency_name.strip(),
        competency_description=competency.competency_description.strip(),
    )

    try:
        db.add(new_competency)
        db.commit()
        db.refresh(new_competency)
        return new_competency
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Competency with this code already exists")






@router.get("/competency", response_model=List[CompetencyResponse])
def get_all_competencies(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(Competency).all()



@router.put("/competency/{competency_code}", response_model=CompetencyResponse)
def update_competency(
    competency_code: str,
    competency: CompetencyCreate, 
    db: Session = Depends(get_db), 
    current_user: Dict = Depends(hr_or_admin_required)
):
  
    
    db_competency = db.query(Competency).filter(Competency.competency_code == competency_code).first()
    if not db_competency:
        raise HTTPException(status_code=404, detail="Competency not found")
     
    if competency.competency_code != db_competency.competency_code:
        existing_code = db.query(Competency).filter(Competency.competency_code == competency.competency_code).first()
        if existing_code:
            raise HTTPException(status_code=400, detail="Competency code already exists")

  
    db_competency.competency_code = competency.competency_code.strip()
    db_competency.competency_name = competency.competency_name.strip()
    db_competency.competency_description = competency.competency_description.strip()

    db.commit()
    db.refresh(db_competency)
    
    return db_competency






@router.delete("/competency/{competency_code}")
def delete_competency(
    competency_code: str, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    role = current_user["role"] 
    if role not in ["HR", "ADMIN"]:
        raise HTTPException(status_code=401, detail="No access")  
    
    competency = db.query(Competency).filter(Competency.competency_code == competency_code).first()
    if not competency:
        raise HTTPException(status_code=404, detail="Competency not found")
    
    employees_in_competency = db.query(EmployeeCompetency).filter(EmployeeCompetency.competency_code == competency.competency_code).first()
    if employees_in_competency:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete competency. Employees are still assigned to this competency."
        )
    
    db.delete(competency)
    db.commit()
    return {"message": "Competency deleted successfully"}



















