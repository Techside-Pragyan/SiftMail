import uuid
from datetime import datetime, date, timezone
from sqlalchemy import Column, String, Integer, Float, Date, DateTime, ForeignKey, JSON
from app.db.base import Base

class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    snapshot_date = Column(Date, default=lambda: date.today(), index=True)
    emails_processed = Column(Integer, default=0)
    pending_tasks = Column(Integer, default=0)
    completed_tasks = Column(Integer, default=0)
    hours_saved = Column(Float, default=0.0)
    urgency_breakdown = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
