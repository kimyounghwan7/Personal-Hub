from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field, model_validator

TodoStatus = Literal["pending", "completed"]
TodoCategory = Literal["Work", "Personal", "Infra", "Study"]


class TodoBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    started_on: Optional[date] = None
    due_date: Optional[datetime] = None
    priority: Optional[int] = Field(default=2, ge=1, le=5)
    category: Optional[TodoCategory] = "Work"

    @model_validator(mode="after")
    def validate_date_span(self) -> "TodoBase":
        if self.started_on and self.due_date and self.started_on > self.due_date.date():
            raise ValueError("started_on cannot be later than due_date")
        return self


class TodoCreate(TodoBase):
    pass


class TodoUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: Optional[TodoStatus] = None
    started_on: Optional[date] = None
    due_date: Optional[datetime] = None
    priority: Optional[int] = Field(default=None, ge=1, le=5)
    category: Optional[TodoCategory] = None

    @model_validator(mode="after")
    def validate_update_date_span(self) -> "TodoUpdate":
        if self.started_on and self.due_date and self.started_on > self.due_date.date():
            raise ValueError("started_on cannot be later than due_date")
        return self


class TodoResponse(TodoBase):
    id: str
    user_id: str
    status: str

    class Config:
        from_attributes = True
