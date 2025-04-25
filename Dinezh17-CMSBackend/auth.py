from typing import Dict
from fastapi import APIRouter, Depends, Form, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from models import  User
from schemas import PasswordResetOrEmailChange, UserLogin,RefreshTokenRequest
from database import get_db
from security import create_refresh_token, get_password_hash, verify_password, create_access_token
from datetime import timedelta
from jose import JWTError, jwt

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/logindev/")

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"




@router.post("/reset-password-or-email/")
def reset_password_or_email(data: PasswordResetOrEmailChange, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.employee_number == data.employee_number).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

   
    if not verify_password(data.old_password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect old password")


    if data.new_password:
        user.hashed_password = get_password_hash(data.new_password.strip())


    if data.new_email:
        existing_email = db.query(User).filter(User.email == data.new_email.strip()).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = data.new_email.strip()

    db.commit()

    return {"message": "Update successful"}







@router.post("/login/")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.employee_number == user.employee_number).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": db_user.employee_number, "role": db_user.role},
        expires_delta=timedelta(minutes=30)  
    )

    refresh_token = create_refresh_token(
        data={"sub": db_user.employee_number}
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": db_user.employee_number,
        "role": db_user.role,
    }





@router.post("/logindev/")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
   
    db_user = db.query(User).filter(User.employee_number == form_data.username).first()

    if not db_user or not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": db_user.employee_number, "role": db_user.role},
        expires_delta=timedelta(minutes=30)
    )

    refresh_token = create_refresh_token(
        data={"sub": db_user.employee_number}
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": db_user.employee_number,
        "role": db_user.role,
    }










@router.post("/refresh_token")
def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(req.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # Optional: Verify user still exists in DB
    user = db.query(User).filter(User.employee_number == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Create new access token
    new_access_token = create_access_token(
        data={
            "sub": user.employee_number,
            "role": user.role,
            
        },expires_delta=timedelta(minutes=30) 
    )

    return {"access_token": new_access_token, "token_type": "bearer"}








def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
       

        if username is None or role is None:
            raise HTTPException(status_code=401, detail="Invalid token data")

        user = db.query(User).filter(User.employee_number == username).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return {"username": username, "role": role}

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )
    








def hr_or_admin_required(current_user: Dict = Depends(get_current_user)):
    role = current_user.get("role")
    if role not in ["HR", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No access"
        )
    return current_user
