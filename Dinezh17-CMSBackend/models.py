from datetime import datetime
from sqlalchemy import JSON, Boolean, Column, Date, DateTime, Integer, Null, Sequence, String, ForeignKey
from database import Base



class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    employee_number = Column(String, ForeignKey("employees.employee_number"), nullable=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) 




class Employee(Base):
    __tablename__ = "employees"
    employee_number = Column(String, primary_key=True, index=True)
    employee_name = Column(String)
    job_code = Column(String, ForeignKey("role_job.job_code"),nullable=True)
    reporting_to = Column(String, ForeignKey("employees.employee_number"), nullable=True)
    role_id = Column(Integer, ForeignKey("roles.id"))
    department_id = Column(Integer, ForeignKey("departments.id"))
    sent_to_evaluation_by=Column(String,default="Not sent by anyone",nullable=True)
    evaluation_status = Column(String ,nullable=True)
    evaluation_by = Column(String,default="Not evaluated", nullable=True)
    last_evaluated_date = Column(Date, nullable=True)
 

class RoleJob(Base):
    __tablename__ = "role_job"
    job_code = Column(String,primary_key=True, index=True)
    job_name = Column(String, index=True)
    role_code = Column(String ,ForeignKey("roles.role_code"))
    job_status = Column(Boolean,default=True)


#tested
class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer,primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    business_division_id = Column(Integer, ForeignKey("business_division.id"))
 

#new 
class BusinessDivision(Base):
    __tablename__ = "business_division"
    id = Column(Integer,primary_key=True, index=True)
    name = Column(String, unique=True, index=True)




#tested
class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    role_code = Column(String, unique=True)
    role_name = Column(String)
    role_category = Column(String)
    assigned_comp_count = Column(Integer,default = 0)


class Competency(Base):
    __tablename__ = "competencies"
    competency_code = Column(String, primary_key=True, index=True)
    competency_name = Column(String)
    competency_description = Column(String)

    
class DepartmentRole(Base):
    __tablename__ = "department_roles"
    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer,ForeignKey("departments.id"), nullable=False)
    role_id = Column(Integer,ForeignKey("roles.id"), nullable=False)
    
 

class RoleCompetency(Base):
    __tablename__ = "role_competencies"
    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(String, ForeignKey("roles.id"))
    competency_code = Column(String, ForeignKey("competencies.competency_code"))
    role_competency_required_score = Column(Integer ,default=1)



 

class EmployeeCompetency(Base):
    __tablename__ = "employee_competencies"
    employee_competencies_id = Column(Integer, primary_key=True, autoincrement=True, index=True,)
    employee_number = Column(String, ForeignKey("employees.employee_number"))
    competency_code = Column(String, ForeignKey("competencies.competency_code"))
    required_score = Column(Integer)
    actual_score = Column(Integer,default=0)



