from typing import Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from auth import get_current_user, hr_or_admin_required
from models import Department, DepartmentRole, Employee, BusinessDivision
from schemas import DepartmentBase, DepartmentResponse
from database import get_db

router = APIRouter()
# tested
@router.post("/departments/", response_model=DepartmentResponse)
def create_department(department: DepartmentBase, db: Session = Depends(get_db),
    current_user: Dict = Depends(hr_or_admin_required)):
    
    # Check if department name already exists
    existing_department = db.query(Department).filter(Department.name == department.name).first()
    if existing_department:
        raise HTTPException(status_code=400, detail="Department already exists")
    
  
    new_department = Department(
        name=department.name.strip(),
    )
    db.add(new_department)
    db.commit()
    db.refresh(new_department)

    return new_department








@router.get("/departments/", response_model=List[DepartmentResponse])
def get_departments(db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)):
    return db.query(Department).filter(Department.id != 100).all()






@router.get("/departments/{department_id}", response_model=DepartmentResponse)
def get_department(department_id: int, db: Session = Depends(get_db), 
    current_user: Dict = Depends(get_current_user)):
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department





@router.put("/departments/{department_id}", response_model=DepartmentResponse)
def update_department(department_id: int, department_data: DepartmentBase, 
    db: Session = Depends(get_db), current_user: Dict = Depends(hr_or_admin_required)):
    
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Check if business division exists
    business_division = db.query(BusinessDivision).filter(
        BusinessDivision.id == department_data.business_division_id
    ).first()
    if not business_division:
        raise HTTPException(status_code=404, detail="Business division not found")
    
    # Check if name is being changed to an existing name
    if department.name != department_data.name:
        existing_department = db.query(Department).filter(
            Department.name == department_data.name
        ).first()
        if existing_department:
            raise HTTPException(status_code=400, detail="Department name already exists")

    department.name = department_data.name.strip()
    db.commit()
    db.refresh(department)

    return department








@router.delete("/departments/{department_id}", response_model=dict)
def delete_department(department_id: int, db: Session = Depends(get_db),
    current_user: Dict = Depends(hr_or_admin_required)):
    
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    employees_in_dept = db.query(Employee).filter(
        Employee.department_id == department_id
    ).first()
    if employees_in_dept:
        raise HTTPException(
            status_code=400,
            detail="to delete department Employees are still Assigned to this departments"
        )
    role = db.query(DepartmentRole).filter(DepartmentRole.department_id==department_id).first()
    if role:
        raise HTTPException(
            status_code=400,
            detail="to delete department role are still Assigned to this departments"
        )
    db.delete(department)
    db.commit()

    return {"message": "Department deleted successfully"} 