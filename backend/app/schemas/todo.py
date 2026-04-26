from pydantic import BaseModel
from typing import Optional
from datetime import date

class TodoBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[int] = 1

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[int] = None

class TodoResponse(TodoBase):
    id: str
    user_id: str
    status: str

    class Config:
        from_attributes = True
