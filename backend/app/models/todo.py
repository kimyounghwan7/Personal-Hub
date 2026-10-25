from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Todo(Base):
    """Account-isolated todo item supporting multi-day calendar spans and S7 soft-delete.

    S2: Same user may create multiple todos with identical titles on different dates.
    S6/S7: Live queries filter `deleted_at IS NULL`.
    """

    __tablename__ = "Todos"

    id = Column(String, primary_key=True, index=True, server_default=func.gen_random_uuid())
    user_id = Column(
        String,
        ForeignKey("Profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(200), nullable=False)
    description = Column(String(2000), nullable=True)
    status = Column(String(20), nullable=False, default="pending", server_default="pending")
    category = Column(String(20), nullable=False, default="Work", server_default="Work")
    started_on = Column(Date, nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    priority = Column(Integer, nullable=False, default=2, server_default="2")
    google_event_id = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    deleted_by = Column(String, nullable=True)
    delete_reason = Column(String(200), nullable=True)

    owner = relationship("Profile")
