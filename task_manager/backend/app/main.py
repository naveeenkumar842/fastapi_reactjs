# backend/app/main.py - COMPLETE FIXED VERSION

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Response
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta

# ============================================
# FIXED IMPORTS - Using app. prefix
# ============================================
# Add User to the imports from app.models
from app.models import Base, User, Task  # ← Added User and Task
from app.database import engine, get_db
from app.models import Base
from app.schemas import (
    UserCreate, UserResponse,
    TaskCreate, TaskUpdate, TaskResponse,
    Token
)
from app.crud import (
    get_user_by_username, get_user_by_email,
    create_user, get_tasks, get_task_by_id,
    create_task, update_task, delete_task
)
from app.auth import (
    verify_password, create_access_token,
    get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
)

# ============================================
# CREATE TABLES
# ============================================

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Task Manager API",
    version="1.0.0",
    description="Complete Task Management System with JWT Authentication"
)

# ============================================
# CORS MIDDLEWARE
# ============================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# OPTIONS HANDLER - FIXES CORS PREFLIGHT
# ============================================

@app.options("/{path:path}")
async def options_any(path: str):
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
    )

# ============================================
# AUTH ROUTES
# ============================================

@app.post("/auth/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_username(db, user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    existing_email = get_user_by_email(db, user.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = create_user(db, user)
    return db_user

@app.post("/auth/login", response_model=Token)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = get_user_by_username(db, form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# ============================================
# USER ROUTES
# ============================================

@app.get("/users/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/users/", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).all()
    return users

# ============================================
# TASK ROUTES
# ============================================

@app.get("/tasks/", response_model=List[TaskResponse])
def get_user_tasks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks = get_tasks(db, current_user.id, skip, limit)
    return tasks

@app.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = get_task_by_id(db, task_id, current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.post("/tasks/", response_model=TaskResponse)
def create_new_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_task(db, task, current_user.id)

@app.put("/tasks/{task_id}", response_model=TaskResponse)
def update_existing_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = update_task(db, task_id, current_user.id, task_update)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.delete("/tasks/{task_id}")
def delete_existing_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    deleted = delete_task(db, task_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

# ============================================
# HEALTH CHECK
# ============================================

@app.get("/")
def root():
    return {"message": "Task Manager API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}


# backend/app/main.py - Add this new endpoint

from app.schemas import UserLogin  # Add this import

@app.post("/auth/login-json", response_model=Token)
def login_user_json(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login endpoint that accepts JSON instead of form data"""
    user = get_user_by_username(db, user_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# ============================================
# RUN (for development)
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)



