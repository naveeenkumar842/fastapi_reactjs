# backend/app/crud.py

from sqlalchemy.orm import Session
# from models import User, Task
# from schemas import UserCreate, TaskCreate, TaskUpdate
# from auth import get_password_hash
from typing import Optional
# backend/app/crud.py

from app.models import User, Task
from app.schemas import UserCreate, TaskCreate, TaskUpdate
from app.auth import get_password_hash
# ============================================
# USER CRUD
# ============================================

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user: UserCreate) -> User:
    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=get_password_hash(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ============================================
# TASK CRUD
# ============================================

def get_tasks(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> list[Task]:
    return db.query(Task).filter(Task.user_id == user_id).offset(skip).limit(limit).all()

def get_task_by_id(db: Session, task_id: int, user_id: int) -> Optional[Task]:
    return db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()

def create_task(db: Session, task: TaskCreate, user_id: int) -> Task:
    db_task = Task(
        title=task.title,
        description=task.description,
        user_id=user_id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, user_id: int, task_update: TaskUpdate) -> Optional[Task]:
    db_task = get_task_by_id(db, task_id, user_id)
    if not db_task:
        return None
    
    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int, user_id: int) -> bool:
    db_task = get_task_by_id(db, task_id, user_id)
    if not db_task:
        return False
    
    db.delete(db_task)
    db.commit()
    return True