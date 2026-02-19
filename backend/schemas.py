from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from models import TaskStatus, TaskPriority

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str
    full_name: str
    mobile_number: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    profile_image: Optional[str] = None
    mobile_number: Optional[str] = None

class User(UserBase):
    id: int
    full_name: str
    is_active: bool
    profile_image: Optional[str] = None
    mobile_number: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    created_at: datetime
    task_id: int
    author_id: int
    author: User

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    time_spent: Optional[float] = 0.0

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    time_spent: Optional[float] = None

class Attachment(BaseModel):
    id: int
    filename: str
    file_path: str
    uploaded_at: datetime
    task_id: int

    class Config:
        from_attributes = True

class Task(TaskBase):
    id: int
    created_at: datetime
    owner_id: int
    owner: User
    comments: List[Comment] = []
    attachments: List[Attachment] = []

    class Config:
        from_attributes = True

class DailyStat(BaseModel):
    date: str
    count: int
    hours: float = 0.0

class BreakdownItem(BaseModel):
    label: str
    value: int

class TaskStats(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    high_priority_tasks: int
    completion_rate: float
    daily_activity: List[DailyStat] = []
    priority_breakdown: List[BreakdownItem] = []
    status_breakdown: List[BreakdownItem] = []
    avg_completion_time: float = 0.0
    current_streak: int = 0

class EmailSchema(BaseModel):
    email: str

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    email: str
    otp: str
    new_password: str

