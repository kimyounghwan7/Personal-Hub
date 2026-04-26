from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    is_approved: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
