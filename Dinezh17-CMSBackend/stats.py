from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import asc, case, func
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from auth import get_current_user
from database import get_db
from models import Department, Employee, EmployeeCompetency, Competency, RoleCompetency

router = APIRouter()


@router.get("/fetch-all-competency-score-data")
def get_competency_gap_data(db: Session = Depends(get_db)):
   
    competencies = db.query(Competency).all()
    result = []

    for comp in competencies:
        gap1 = 0
        gap2 = 0
        gap3 = 0
        gap4=0
        # Get all employee competencies for this competency
        records = db.query(EmployeeCompetency).join(Employee, Employee.employee_number == EmployeeCompetency.employee_number).filter(
            EmployeeCompetency.competency_code == comp.competency_code,
            Employee.evaluation_status == "True"  # or .ilike("true") for case-insensitive match
        ).all()


        for record in records:
            if record.required_score is not None and record.actual_score is not None:
                gap = record.required_score - record.actual_score
                if gap == 1:
                    gap1 += 1
                elif gap == 2:
                    gap2 += 1
                elif gap == 3:
                    gap3 += 1
                elif gap == 4:
                    gap4 += 1
                    

        result.append({
            "competencyCode": comp.competency_code,
            "competencyName": comp.competency_name,
            "classification":comp.competency_description,
            "gap1": gap1,
            "gap2": gap2,
            "gap3": gap3,
            "gap4": gap4,
            "totalGapEmployees": gap1 + gap2 + gap3+gap4
        })
    result.sort(key=lambda x: x["totalGapEmployees"], reverse=True)

    return result



@router.get("/employee-competencies/details")
def get_all_employee_competency_details(
    db: Session = Depends(get_db),
):
    results = (
        db.query(
            Employee.employee_number,
            Employee.employee_name,
            Employee.evaluation_status,
            Competency.competency_code.label("competency_code"),
            Competency.competency_name.label("competency_name"),
            Competency.competency_description.label("competency_description"),
            EmployeeCompetency.required_score,
            EmployeeCompetency.actual_score
        ).filter(Employee.evaluation_status=="True")
        .join(Employee, Employee.employee_number == EmployeeCompetency.employee_number)
        .join(Competency, Competency.competency_code == EmployeeCompetency.competency_code)
        .order_by(asc(Employee.employee_number))
        .all()
    )

    return [
        {
            "employeeNumber": r.employee_number,
            "employeeName": r.employee_name,
            "competencyCode": r.competency_code,
            "competencyName": r.competency_name,
            "competencyDescription": r.competency_description,
            "requiredScore": r.required_score,
            "actualScore": r.actual_score if r.evaluation_status == "True" else "-",
            "gap": (r.required_score - r.actual_score) if r.evaluation_status == "True" else "-"
        }
        for r in results
    ]

@router.get("/score-emp-details/by-competency/{compcode}")
def get_employee_gaps_by_competency(
    compcode: str,
    db: Session = Depends(get_db),
):
    records = (
        db.query(EmployeeCompetency, Employee)
        .join(Employee, Employee.employee_number == EmployeeCompetency.employee_number)
        .filter(EmployeeCompetency.competency_code == compcode)
        .all()
    )

    result = []

    for comp, emp in records:
        if emp.evaluation_status == "True" and comp.required_score is not None and comp.actual_score is not None:
            gap = comp.required_score - comp.actual_score
            result.append({
                "employeeNumber": comp.employee_number,
                "employeeName": emp.employee_name,
                "requiredScore": comp.required_score,
                "actualScore": comp.actual_score,
                "gap": gap
            })
        else:
            result.append({
                "employeeNumber": comp.employee_number,
                "employeeName": emp.employee_name,
                "requiredScore": comp.required_score,
                "actualScore": "-",
                "gap": "-"
            })
    
    evaluated = [r for r in result if isinstance(r["gap"], (int, float))]
    unevaluated = [r for r in result if r["gap"] == "-"]

    # Sort evaluated by gap
    evaluated_sorted = sorted(evaluated, key=lambda x: x["gap"], reverse=False)

    # Final sorted result
    final_result = evaluated_sorted + unevaluated
    
    return final_result








    
 

 
@router.get("/stats/department-performance/{department_id}", response_model=Dict[str, Any])
def get_competency_by_department_stats(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)

):
    role =current_user["role"] 
    if role not in ["HR","ADMIN"]:
        raise HTTPException(status_code=401, detail="No access")  
    """
    Get department performance statistics showing all competencies
    for a specific department with rankings.
    """
    # Verify department exists
    department = db.query(Department).filter(Department.id== department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail=f"Department with code {department_id} not found")
    
    result = {}
    
    # Get all competencies with their average scores for this department
    competency_stats = (
        db.query(
            Competency.competency_code,
            Competency.competency_name,
            Competency.competency_description,
            func.avg(EmployeeCompetency.required_score).label("competency_required_score"),
            func.avg(EmployeeCompetency.actual_score).label("average_score"),
            func.sum(
                case(
                    (EmployeeCompetency.actual_score >= EmployeeCompetency.required_score, 1),
                    else_=0
                )
            ).label("meeting_required"),
            func.count(EmployeeCompetency.employee_competencies_id).label("total_evaluations"),
        )
        .join(
            EmployeeCompetency,
            EmployeeCompetency.competency_code == Competency.competency_code
        )
        .join(
            Employee,
            Employee.employee_number == EmployeeCompetency.employee_number
        )
        .filter(Employee.department_id == department_id)  # Filter by department code
        .group_by(Competency.competency_code)
        .all()
    )
    
    # Format department competency stats
    competencies_list = []
    
    for comp_stat in competency_stats:
        fulfillment_rate = (comp_stat.meeting_required / comp_stat.total_evaluations * 100) if comp_stat.total_evaluations > 0 else 0
        
        competencies_list.append({
            "competency_code": comp_stat.competency_code,
            "competency_name": comp_stat.competency_name,
            "description": comp_stat.competency_description,
            "average_required_score": comp_stat.competency_required_score,
            "average_score": round(comp_stat.average_score, 2),
            "fulfillment_rate": round(fulfillment_rate, 2),
            "employees_evaluated": comp_stat.total_evaluations,
            "employees_meeting_required": comp_stat.meeting_required
        })
    
    # Sort competencies by average score (best to worst performing)
    competencies_list = sorted(competencies_list, key=lambda x: x["average_score"], reverse=True)
    
    # Add ranking
    for i, comp in enumerate(competencies_list, 1):
        comp["rank"] = i
    
    # Calculate overall department performance
    if competencies_list:
        avg_score = sum(comp["average_score"] for comp in competencies_list) / len(competencies_list)
        avg_fulfillment = sum(comp["fulfillment_rate"] for comp in competencies_list) / len(competencies_list)
    else:
        avg_score = 0
        avg_fulfillment = 0
    departmentCode = str(department.id)    
    result[departmentCode] = {
        "department_name": department.name,
        "overall_average_score": round(avg_score, 2),
        "overall_fulfillment_rate": round(avg_fulfillment, 2),
        "competencies": competencies_list
    }
    
    return result






@router.get("/stats/manager-wise-performance/{manager_number}", response_model=Dict[str, Any])
def get_competency_by_department_stats(
    manager_number:str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)

):
    role =current_user["role"] 
    if role not in ["HR","ADMIN"]:
        raise HTTPException(status_code=401, detail="No access")  
    """
    Get department performance statistics showing all competencies
    for a specific department with rankings.
    """
    # Verify department exists
    manager = db.query(Employee).filter(Employee.employee_number== manager_number).first()
    if not manager:
        raise HTTPException(status_code=404, detail=f" {manager_number} not found")
    
    result = {}
    
    # Get all competencies with their average scores for this department
    competency_stats = (
        db.query(
            Competency.competency_code,
            Competency.competency_name,
            Competency.competency_description,
            func.avg(EmployeeCompetency.required_score).label("competency_required_score"),
            func.avg(EmployeeCompetency.actual_score).label("average_score"),
            func.sum(
                case(
                    (EmployeeCompetency.actual_score >= EmployeeCompetency.required_score, 1),
                    else_=0
                )
            ).label("meeting_required"),
            func.count(EmployeeCompetency.employee_competencies_id).label("total_evaluations"),
        )
        .join(
            EmployeeCompetency,
            EmployeeCompetency.competency_code == Competency.competency_code
        )
        .join(
            Employee,
            Employee.employee_number == EmployeeCompetency.employee_number
        )
        .filter(Employee.reporting_to == manager_number)  # Filter by manger code  code
        .group_by(Competency.competency_code)
        .all()
    )
    
    # Format manger wise  competency stats
    competencies_list = []
    
    for comp_stat in competency_stats:
        fulfillment_rate = (comp_stat.meeting_required / comp_stat.total_evaluations * 100) if comp_stat.total_evaluations > 0 else 0
        
        competencies_list.append({
            "competency_code": comp_stat.competency_code,
            "competency_name": comp_stat.competency_name,
            "description": comp_stat.competency_description,
            "average_required_score": comp_stat.competency_required_score,
            "average_score": round(comp_stat.average_score, 2),
            "fulfillment_rate": round(fulfillment_rate, 2),
            "employees_evaluated": comp_stat.total_evaluations,
            "employees_meeting_required": comp_stat.meeting_required
        })
    
    # Sort competencies by average score (best to worst performing order )
    competencies_list = sorted(competencies_list, key=lambda x: x["average_score"], reverse=True)
    
    # Add ranking
    for i, comp in enumerate(competencies_list, 1):
        comp["rank"] = i
    
    # Calculate overall Manager wise  performance
    if competencies_list:
        avg_score = sum(comp["average_score"] for comp in competencies_list) / len(competencies_list)
        avg_fulfillment = sum(comp["fulfillment_rate"] for comp in competencies_list) / len(competencies_list)
    else:
        avg_score = 0
        avg_fulfillment = 0
    manager_number = str(manager_number)    
    result[manager_number] = {
        "manager_name": manager.employee_name,
        "overall_average_score": round(avg_score, 2),
        "overall_fulfillment_rate": round(avg_fulfillment, 2),
        "competencies": competencies_list
    }
    
    return result

















class OverallCompetencyPerformance(BaseModel):
    rank: int
    competency_code: str
    competency_name: str
    description: str
    average_required_score: float
    average_score: float
    fulfillment_rate: float  # Percentage of employees meeting required score
    total_evaluations: int
    employees_meeting_required: int
    performance_gap: float  # Difference between average and required score



@router.get("/stats/overall-competency-performance", response_model=List[OverallCompetencyPerformance])
def get_overall_competency_performance(db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)):
    
    role =current_user["role"] 
    if role not in ["HR","ADMIN"]:
        raise HTTPException(status_code=401, detail="No access")  
    """
    Get overall competency performance statistics ranked from best to worst performing
    across the entire organization.
    """
    # Query to calculate statistics for each competency across all departments
    competency_stats = (
        db.query(
            Competency.competency_code,
            Competency.competency_name,
            Competency.competency_description,
            func.avg(EmployeeCompetency.required_score).label("average_required_score"),
            func.avg(EmployeeCompetency.actual_score).label("average_score"),
            func.count(EmployeeCompetency.employee_competencies_id).label("total_evaluations"),
            func.sum(
                case(
                    (EmployeeCompetency.actual_score >= EmployeeCompetency.required_score, 1),
                    else_=0
                )
            ).label("meeting_required")
        )
        .join(
            EmployeeCompetency,
            EmployeeCompetency.competency_code == Competency.competency_code
        )
        .group_by(Competency.competency_code)
        .all()
    )
    
    # Process and rank the results 
    result = []
    
    for comp_stat in competency_stats:
        avg_score = comp_stat.average_score or 0
        fulfillment_rate = (comp_stat.meeting_required / comp_stat.total_evaluations * 100) if comp_stat.total_evaluations > 0 else 0
        performance_gap =  comp_stat.average_required_score - avg_score 
        
        result.append({
            "competency_code": comp_stat.competency_code,
            "competency_name": comp_stat.competency_name,
            "description": comp_stat.competency_description,
            "average_required_score": comp_stat.average_required_score,
            "average_score": round(avg_score, 2),
            "fulfillment_rate": round(fulfillment_rate, 2),
            "total_evaluations": comp_stat.total_evaluations,
            "employees_meeting_required": comp_stat.meeting_required,
            "performance_gap": round(performance_gap, 2)
        })
    


    result = sorted(result, key=lambda x: (x["fulfillment_rate"], x["average_score"]), reverse=True)
    
    # Add ranking
    ranked_result = []
    for i, comp in enumerate(result, 1):
        ranked_result.append(
            OverallCompetencyPerformance(
                rank=i,
                competency_code=comp["competency_code"],
                competency_name=comp["competency_name"],
                description=comp["description"],
                average_required_score=comp["average_required_score"],
                average_score=comp["average_score"],
                fulfillment_rate=comp["fulfillment_rate"],
                total_evaluations=comp["total_evaluations"],
                employees_meeting_required=comp["employees_meeting_required"],
                performance_gap=comp["performance_gap"]
            )
        )
    
    
    return ranked_result
