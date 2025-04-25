
from typing import List
from fastapi import Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session
from fastapi import APIRouter
from auth import get_current_user, hr_or_admin_required
from database import get_db
from models import Department, DepartmentRole, Employee, Role, RoleJob
from schemas import RoleCreate, RoleCreateWithDepartment, RoleResponse


router = APIRouter()

#tested

@router.post("/roles", response_model=RoleResponse)
def create_role_with_department(
    role_data: RoleCreateWithDepartment, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(hr_or_admin_required)
):
    if current_user["role"] not in ["HR", "ADMIN"]:
        raise HTTPException(status_code=401, detail="No access")

    # Check if role already exists
    existing_role = db.query(Role).filter(
        or_(Role.role_name == role_data.role_name, Role.role_code == role_data.role_code)
    ).first()
    if existing_role:
        raise HTTPException(status_code=400, detail="Role code or name already exists")

    # Check if department exists if provided
    if role_data.department_id:
        department = db.query(Department).filter(Department.id == role_data.department_id).first()
        if not department:
            raise HTTPException(status_code=404, detail="Department not found")

    # Create new role
    new_role = Role(
        role_code=role_data.role_code.strip(),
        role_name=role_data.role_name.strip(),
        role_category=role_data.role_category.strip()
    )
    db.add(new_role)
    db.commit()
    db.refresh(new_role)

    # Assign to department if provided
    if role_data.department_id:
        # Check if assignment already exists 
        existing_assignment = db.query(DepartmentRole).filter(
            DepartmentRole.department_id == role_data.department_id,
            DepartmentRole.role_id == new_role.id
        ).first()
        
        if not existing_assignment:
            new_assignment = DepartmentRole(
                department_id=role_data.department_id,
                role_id=new_role.id
            )
            db.add(new_assignment)
            db.commit()

    return new_role





@router.get("/roles")
def get_all_roles_with_departments(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    results = (
        db.query(Role, Department.name.label("department_name"))
        .join(DepartmentRole, DepartmentRole.role_id == Role.id)
        .join(Department, Department.id == DepartmentRole.department_id)
        .filter(Role.id != 100)
        .all()
    )

    # Build list of dicts combining Role fields and department_name
    roles_with_dept = []
    for role, department_name in results:
        role_data = {
            "id": role.id,
            "role_code": role.role_code,
            "role_name": role.role_name,
            "role_category": role.role_category,
            "assigned_comp_count": role.assigned_comp_count,
            "department_name": department_name
        }
        roles_with_dept.append(role_data)

    return roles_with_dept





# role name details
@router.get("/getrole/{role_id}", response_model=RoleResponse)
def get_role_by_id(role_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role





@router.put("/roles/{role_id}", response_model=RoleResponse)
def update_role(role_id: int, role_data: RoleCreate, db: Session = Depends(get_db), current_user: dict = Depends(hr_or_admin_required)):
  

    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    existing_role = db.query(Role).filter(
        or_(Role.role_name == role_data.role_name, Role.role_code == role_data.role_code),
        Role.id != role_id  # Exclude the current role being modified
    ).first()

    if existing_role:
        raise HTTPException(status_code=400, detail="Role name or code is already in use by another role")
    
    role.role_code = role_data.role_code
    role.role_name = role_data.role_name.strip()
    role.role_category = role_data.role_category.strip()

    db.commit()
    db.refresh(role)

    return role



@router.delete("/roles/{role_id}", response_model=dict)
def delete_role(role_id: int, db: Session = Depends(get_db), current_user: dict = Depends(hr_or_admin_required)):

    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    employees_in_dept = db.query(Employee).filter(Employee.role_id == role.id).first()
    if employees_in_dept:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete department. Employees are still assigned to this role."
        )
    print(role.role_code)
    job =db.query(RoleJob.job_code).filter(RoleJob.role_code ==role.role_code ).first()
   
    if job:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete role jobs are still Assigned to this role"
        )
    db.query(DepartmentRole).filter(DepartmentRole.role_id==role_id).delete(synchronize_session=False)
    db.delete(role)
    db.commit()

    return {"message": "Role deleted successfully"}

