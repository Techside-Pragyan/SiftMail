import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base

class Email(Base):
    __tablename__ = "emails"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    sender = Column(String, nullable=False)
    sender_email = Column(String, nullable=False)
    recipient = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    snippet = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    folder = Column(String, default="inbox", index=True)
    is_read = Column(Boolean, default=False, index=True)
    is_starred = Column(Boolean, default=False)
    received_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    tags = Column(JSON, default=list)

    # Relationships
    ai_analysis = relationship("AIAnalysis", back_populates="email", uselist=False, cascade="all, delete-orphan", lazy="joined")
    tasks = relationship("Task", back_populates="email", cascade="all, delete-orphan")

class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email_id = Column(String, ForeignKey("emails.id", ondelete="CASCADE"), unique=True, nullable=False)
    urgency = Column(String, nullable=False, default="medium")  # low, medium, high, critical
    urgency_score = Column(Integer, nullable=False, default=50)  # 0 to 100
    sentiment = Column(String, nullable=False, default="neutral")
    summary = Column(Text, nullable=False)
    key_takeaways = Column(JSON, default=list)
    suggested_replies = Column(JSON, default=list)
    extracted_tasks = Column(JSON, default=list)
    analyzed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    email = relationship("Email", back_populates="ai_analysis")
