from datetime import datetime 
from typing import Optional 
from pydantic import BaseModel, ConfigDict

class TaskBase(BaseModel):
    title: str
    description: str = None
    is_completed: bool = False
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass 

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    due_date: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime 

    model_config = ConfigDict(from_attributes=True)

