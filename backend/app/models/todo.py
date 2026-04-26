from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Todo(Base):
    __tablename__ = "Todos"

    id = Column(String, primary_key=True, index=True, server_default=func.gen_random_uuid())
    user_id = Column(String, ForeignKey("Profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, default="pending")
    due_date = Column(DateTime(timezone=True), nullable=True)
    priority = Column(Integer, default=1)
    
    # Relationship (optional, if we want to load the user info)
    owner = relationship("Profile")
