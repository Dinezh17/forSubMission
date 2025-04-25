from typing import Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_
from sqlalchemy.orm import Session
from auth import  get_current_user, hr_or_admin_required
from models import Department, DepartmentRole, Role
from database import get_db
from schemas import DepartmentRoleBase, DepartmentRoleResponse, RoleResponse

router = APIRouter()



@router.get("/departments/{department_id}/roles", response_model=List[int])
def get_department_roles(
    department_id: int,
    db: Session = Depends(get_db),
   current_user: Dict = Depends(get_current_user)
):
   
    # Get all role assignments for the department
    roles = db.query(Role.id).join(
        DepartmentRole, DepartmentRole.role_id == Role.id
    ).filter(
        DepartmentRole.department_id == department_id 
    ).all()
    rolesres = (r.id for r in roles)   

    return rolesres



@router.get("/withname/departments/{department_id}/roles", response_model=List[RoleResponse])
def get_department_roles(
    department_id: int,
    db: Session = Depends(get_db),
   current_user: Dict = Depends(get_current_user)
):
    roles = db.query(Role).join(
        DepartmentRole, DepartmentRole.role_id == Role.id
    ).filter(
        DepartmentRole.department_id == department_id 
    ).all()
    
    return roles





@router.post("/departments/{department_id}/roles")
def assign_roles_to_department(
    department_id: int,
    role_id: List[int],
    db: Session = Depends(get_db),
    current_user: Dict = Depends(hr_or_admin_required)
):
  
    # Verify department exists
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Verify all roles exist
    roles = db.query(Role.id).filter(Role.id.in_(role_id)).all()
    existing_roles = {role.id for role in roles}
    
    invalid_roles = set(role_id) - existing_roles
    if invalid_roles:
        raise HTTPException(
            status_code=404,
            detail=f"The following role codes don't exist: {invalid_roles}"
        )
    
    # Get existing assignments to avoid duplicates
    existing_assignments = {
        dr.role_id for dr in db.query(DepartmentRole.role_id).filter(and_(
            DepartmentRole.department_id == department_id,
            DepartmentRole.role_id.in_(role_id))
        ).all()
    }
  
    c=0
    for role_id in role_id:
        if role_id not in existing_assignments:
            new_assignment = DepartmentRole(
                department_id=department_id,
                role_id=role_id
            )
            db.add(new_assignment)
            c+=1
    
    db.commit()
    
    return c






@router.delete("/departments/{department_id}/roles")
def remove_roles_from_department(
    department_id: int,
    role_id: List[int],
    db: Session = Depends(get_db),
    current_user: Dict = Depends(hr_or_admin_required)):


    # Verify department exists
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Delete the specified role assignments
    delete_count = db.query(DepartmentRole).filter(
        DepartmentRole.department_id == department_id,
        DepartmentRole.role_id.in_(role_id)
    ).delete(synchronize_session=False)
    
    db.commit()
    
    return {"message": f"Successfully removed {delete_count} role assignments"}








@router.post("/department-roles-assign", response_model=DepartmentRoleResponse)
def assign_role_to_department(
    assignment: DepartmentRoleBase,
    db: Session = Depends(get_db),
    current_user: dict = Depends(hr_or_admin_required)
):
    # Check if department exists
    department = db.query(Department).filter(Department.id == assignment.department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Check if role exists
    role = db.query(Role).filter(Role.id == assignment.role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Check if assignment already exists
    existing_assignment = db.query(DepartmentRole).filter(
        DepartmentRole.department_id == assignment.department_id,
        DepartmentRole.role_id == assignment.role_id
    ).first()
    
    if existing_assignment:
        raise HTTPException(status_code=400, detail="This role is already assigned to this department")

    # Create new assignment
    new_assignment = DepartmentRole(
        department_id=assignment.department_id,
        role_id=assignment.role_id
    )
    
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    
    return new_assignment