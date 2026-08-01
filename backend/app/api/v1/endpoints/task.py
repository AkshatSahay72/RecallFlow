from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.tasks import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter()

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db:Session=Depends(get_db),
    current_user: User=Depends(get_current_user)
):
    db_task = Task(**task_in.model_dump(),owner_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/", response_model=List[TaskResponse])
def read_tasks(db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)):
    statement = select(Task).where(Task.owner_id == current_user.id)
    tasks = db.execute(statement).scalars().all()
    return tasks

@router.get("/{task_id}", response_model=TaskResponse)
def read_task(
    task_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    statement = select(Task).where(Task.id == task_id, Task.owner_id == current_user.id)
    db_task = db.execute(statement).scalar_one_or_none()
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Task not found or access denied"
        )
    return db_task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int, 
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    statement = select(Task).where(Task.id == task_id, Task.owner_id == current_user.id)
    db_task = db.execute(statement).scalar_one_or_none()
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail = "Task not found or access denied"
        )
    
    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    statement = select(Task).where(Task.id == task_id, Task.owner_id == current_user.id)
    db_task = db.execute(statement).scalar_one_or_none()

    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied"
        )
    db.delete(db_task)
    db.commit()
    return None

