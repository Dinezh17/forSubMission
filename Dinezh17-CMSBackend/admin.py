from fastapi import Depends
from sqlalchemy.orm import Session
from models import User
from database import SessionLocal
from auth import get_password_hash  


db: Session = SessionLocal()

admin = db.query(User).filter(User.employee_number == "admin").first()
if not admin:
    new_admin = User(
        employee_number="admin",
        email = "admin@123.com",
        hashed_password=get_password_hash("admin"),
        role="ADMIN",
   

    )
    db.add(new_admin)
    db.commit()
    print("Admin user created.")
else:
    admin.role ="ADMIN"
    db.commit()
    print("Admin already exists.")
    



# from sqlalchemy.orm import Session
# from models import User, Employee
# from database import SessionLocal
# from auth import get_password_hash  # assuming this hashes the password using bcrypt

# # List of manager employee_numbers
# manager_ids = ['EMP002', 'EMP003', 'EMP004', 'EMP005']

# # Start DB session
# db: Session = SessionLocal()

# # Get all employees
# employees = db.query(Employee).all()

# for emp in employees:
#     existing_user = db.query(User).filter(User.employee_number == emp.employee_number).first()
    
#     if not existing_user:
#         role = "Manager" if emp.employee_number in manager_ids else "Employee"
#         new_user = User(
#             employee_number=emp.employee_number,
#             email=f"{emp.employee_number.lower()}@example.com",
#             hashed_password=get_password_hash(emp.employee_number),
#             role=role
#         )
#         db.add(new_user)
#         print(f"Created user for {emp.employee_number} with role {role}")
#     else:
#         print(f"User already exists for {emp.employee_number}")

# db.commit()
# db.close()
