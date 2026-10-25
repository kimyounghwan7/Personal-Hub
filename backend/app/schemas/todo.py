from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field

TodoStatus = Literal["pending", "completed"]


class TodoBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    due_date: Optional[datetime] = None
    priority: Optional[int] = Field(default=1, ge=1, le=5)


class TodoCreate(TodoBase):
    pass


class TodoUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: Optional[TodoStatus] = None
    due_date: Optional[datetime] = None
    priority: Optional[int] = Field(default=None, ge=1, le=5)


class TodoResponse(TodoBase):
    id: str
    user_id: str
    status: str

    class Config:
        from_attributes = True

