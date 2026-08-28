import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    source_email_id = Column(String, ForeignKey("emails.id", ondelete="SET NULL"), nullable=True)
    source_subject = Column(String, nullable=True)
    title = Column(Text, nullable=False)
    due_date = Column(String, nullable=True)
    priority = Column(String, default="medium", index=True)  # low, medium, high, urgent
    status = Column(String, default="pending", index=True)    # pending, in_progress, completed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    email = relationship("Email", back_populates="tasks")
