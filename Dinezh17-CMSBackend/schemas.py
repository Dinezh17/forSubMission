from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date, datetime




#depts schemas
class DepartmentBase(BaseModel):
    name: str
    business_division_id: int

class DepartmentResponse(DepartmentBase):
    id: int
    class Config:
        from_attributes = True




#roles schemas
class RoleBase(BaseModel):
    role_code: str
    role_name: str
    role_category: str


class RoleCreate(RoleBase):
    pass
class RoleCreateWithDepartment(RoleCreate):
    department_id: Optional[int] = None

    
class RoleResponse(BaseModel):
    id: int
    role_code: str
    role_name: str
    role_category: str
    class Config:
        from_attributes = True




class CreateJobsRequest(BaseModel):
    role_code: str
    job_name: str
    prefix: str
    start: int
    count: int
#comp schemas



class JobCodeResponse(BaseModel):
    job_code: str
    job_name: str
    
    class Config:
        from_attributes = True





class CompetencyBase(BaseModel):
    competency_code: str
    competency_name: str
    competency_description: Optional[str] = None
 

class CompetencyCreate(CompetencyBase):
    pass

class CompetencyResponse(CompetencyBase):
    pass
    class Config:
        from_attributes = True






class EmployeeCompetencyResponse(BaseModel):
    id: int
    employee_number: str
    competency_code: str
    required_score: int
    actual_score: Optional[int]  

    class Config:
        from_attributes = True











class EmployeeCreate(BaseModel):
    employee_number: str
    employee_name: str
    job_code: str
    reporting_to: Optional[str] = None
    role_id: int
    department_id: int





class EmployeeResponse(BaseModel):
    employee_number: str
    employee_name: str
    job_code: str
    job_name: str
    reporting_to: Optional[str] = None
    role_id: int
    department_id: int
    sent_to_evaluation_by: Optional[str] = None
    evaluation_status: Optional[str] =None
    evaluation_by: Optional[str] = None
    last_evaluated_date: Optional[date] = None
    
    class Config:
        from_attributes = True




class EmployeeCreateResponse(BaseModel):
    employee_number: str
    employee_name: str
    job_code: str
    reporting_to: Optional[str] = None
    role_id: int
    department_id: int
    sent_to_evaluation_by: Optional[str] = None
    evaluation_status: Optional[str] =None
    evaluation_by: Optional[str] = None
    last_evaluated_date: Optional[date] = None
    
    class Config:
        from_attributes = True




class ManagerResponse(BaseModel):
    employee_name: str
    employee_number: str


    
class CompetencyScoreUpdate(BaseModel):
    competency_code: str
    role_competency_required_score: int



class EmpCompetencyScoreUpdate(BaseModel):
    competency_code: str
    required_score: int





class BulkEvaluationStatusUpdate(BaseModel):
    employee_numbers: List[str]



    


class UserLogin(BaseModel):
    employee_number: str
    password: str



class RefreshTokenRequest(BaseModel):
    refresh_token: str






class PasswordResetOrEmailChange(BaseModel):
    employee_number: str
    old_password: str
    new_password: Optional[str] = None
    new_email: Optional[str] = None










class JobDeleteRequest(BaseModel):
    job_name: str
    role_code: str
    count: int





class BusinessDivisionBase(BaseModel):
    name: str

class BusinessDivisionResponse(BusinessDivisionBase):
    id: int
    class Config:
        orm_mode = True



class DepartmentRoleBase(BaseModel):
    department_id: int
    role_id: int

class DepartmentRoleResponse(DepartmentRoleBase):
    id: int
    class Config:
        from_attributes = True