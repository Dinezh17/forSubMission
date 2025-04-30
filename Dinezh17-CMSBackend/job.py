from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Department, DepartmentRole, Employee, Role, RoleJob
from schemas import CreateJobsRequest, JobCodeResponse, JobDeleteRequest
from sqlalchemy import func, desc

router = APIRouter()


@router.post("/jobs")
def create_jobs(request: CreateJobsRequest, db: Session = Depends(get_db)):
    for i in range(request.start, request.start + request.count):
        job_code = f"{request.prefix}{str(i).zfill(4)}"
        db_job = RoleJob(
            job_code=job_code,
            job_name=request.job_name,
            role_code=request.role_code
        )
        db.add(db_job)
    db.commit()
    return {"message": f"{request.count} jobs created for {request.job_name}"}



@router.get("/jobs-summary")
def get_jobs_summary(db: Session = Depends(get_db)):
    jobs = (
        db.query(
            Department.name.label("department_name"),
            Role.role_code,
            Role.role_name,
            Role.role_category,
            RoleJob.job_name,
            func.count(RoleJob.job_code).label("count"),
            func.max(RoleJob.job_code).label("LastCode")
        )
        .join(Role, Role.role_code == RoleJob.role_code)
        .join(DepartmentRole, DepartmentRole.role_id == Role.id)
        .join(Department, Department.id == DepartmentRole.department_id)
        .filter(RoleJob.job_code != "dummy100")
        .group_by(
            Department.name,
            Role.role_code,
            Role.role_name,
            Role.role_category,
            RoleJob.job_name
        )
        .order_by(desc("count"))
        .all()
    )

    return {
        "jobs_by_name": [
            {
                "department_name": job.department_name,
                "role_name": job.role_name,
                "role_code": job.role_code,
                "role_category": job.role_category,
                "job_name": job.job_name,
                "count": job.count,
                "LastCode": job.LastCode
            }
            for job in jobs
        ]
    }


@router.get("/available-job-codes/{role_code}", response_model=List[JobCodeResponse])
def get_available_job_codes(role_code: str , employee_number: str = Query(...), db: Session = Depends(get_db)):
   
    # Get all job codes already assigned to employees
    print(employee_number,"number")
    assigned_job_codes = [code[0] for code in db.query(Employee.job_code).filter(Employee.employee_number!=employee_number).all()]
    print(assigned_job_codes)
    # Get unique job names for the requested role
    job_names = db.query(RoleJob.job_name)\
                  .filter(RoleJob.role_code == role_code)\
                  .distinct()\
                  .all()
    
    result = []
    
    # For each job name, find the next   first available job code
    for job_name_tuple in job_names:
        job_name = job_name_tuple[0]
        
        # Find first available job code for this job name
        available = db.query(RoleJob)\
                            .filter(
                                RoleJob.role_code == role_code,
                                RoleJob.job_name == job_name,
                                ~RoleJob.job_code.in_(assigned_job_codes),
                                RoleJob.job_status==True
                            ).all()
        
        for first_available in available:
            result.append({
                "job_code": first_available.job_code,
                "job_name": first_available.job_name
            })
    
    
    return result








@router.delete("/jobs")
async def delete_jobs(delete_request: JobDeleteRequest, db: Session = Depends(get_db)):
    
    jobs = db.query(RoleJob)\
        .filter(RoleJob.job_name == delete_request.job_name)\
        .filter(RoleJob.role_code == delete_request.role_code)\
        .order_by(RoleJob.job_code.desc())\
        .limit(delete_request.count)\
        .all()
    
    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs found to delete")
    
    # Extract job codes
    job_codes_to_delete = [job.job_code for job in jobs]

    # Check if any employee uses these job codes
    existing_employees = db.query(Employee)\
        .filter(Employee.job_code.in_(job_codes_to_delete))\
        .all()
    
    if existing_employees:
        used_codes = list({emp.job_code for emp in existing_employees})
        raise HTTPException(
            status_code=400,
            detail=f" to delete Job  Employees still Assigned to this Job"
        )

    # Safe to delete
    for job in jobs:
        db.delete(job)
    
    db.commit()
    
    return {"message": f"Successfully deleted {len(jobs)} jobs"}







class RoleJobOut(BaseModel):
    job_code: str
    job_name: str
    job_status: bool

    class Config:
        orm_mode = True







@router.get("/jobs/by-role/{role_code}/{job_name}", response_model=List[RoleJobOut])
def get_jobs_by_role(role_code: str, job_name : str, db: Session = Depends(get_db)):
    jobs = db.query(RoleJob).filter(RoleJob.role_code == role_code,RoleJob.job_name==job_name).all()
    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs found for this role code")
    return jobs


@router.put("/jobs/deactivate", response_model=dict)
def deactivate_jobs(job_codes: List[str], db: Session = Depends(get_db)):
    # Check if job code is assigned to any employees
    assigned_employees = db.query(Employee.employee_number).filter(Employee.job_code.in_(job_codes)).all()
    
    if assigned_employees:
        res =assigned_employees[0].employee_number
        raise HTTPException(
            status_code=400,
            detail=f"Error Cannot deactivate job. Job code is assigned to employee : {res}"
        )
    updated = db.query(RoleJob).filter(RoleJob.job_code.in_(job_codes)).update(
        {RoleJob.job_status: False}, synchronize_session=False
    )
    db.commit()
    return {"updated": updated, "status": "deactivated"}

@router.put("/jobs/activate", response_model=dict)
def activate_jobs(job_codes: List[str], db: Session = Depends(get_db)):
   
    updated = db.query(RoleJob).filter(RoleJob.job_code.in_(job_codes)).update(
        {RoleJob.job_status: True}, synchronize_session=False
    )
    db.commit()
    return {"updated": updated, "status": "activated"}
