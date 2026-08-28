from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from enum import Enum

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class TaskBase(BaseModel):
    title: str
    dueDate: Optional[str] = None
    priority: str = "medium"
    status: TaskStatus = TaskStatus.PENDING
    sourceEmailId: Optional[str] = None
    sourceSubject: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    dueDate: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[TaskStatus] = None

class TaskResponse(BaseModel):
    id: str
    title: str
    dueDate: Optional[str] = None
    priority: str
    status: TaskStatus
    sourceEmailId: Optional[str] = None
    sourceSubject: Optional[str] = None
    createdAt: datetime
    completedAt: Optional[datetime] = None

    class Config:
        from_attributes = True

class TaskListResponse(BaseModel):
    success: bool = True
    count: int
    data: List[TaskResponse]
