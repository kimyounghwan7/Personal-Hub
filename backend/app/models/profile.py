from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class Profile(Base):
    __tablename__ = "Profiles"

    id = Column(String, primary_key=True, index=True) # UUID from auth.users
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="user", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
