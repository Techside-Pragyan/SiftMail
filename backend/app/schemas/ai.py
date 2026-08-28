from typing import List, Optional
from pydantic import BaseModel
from enum import Enum

class UrgencyLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class SuggestedReply(BaseModel):
    tone: str
    text: str

class ExtractedTaskSchema(BaseModel):
    title: str
    dueDate: Optional[str] = None
    priority: str = "medium"

class AIAnalysisSchema(BaseModel):
    urgency: UrgencyLevel
    urgencyScore: int
    sentiment: str
    summary: str
    keyTakeaways: List[str]
    suggestedReplies: List[SuggestedReply] = []
    extractedTasks: List[ExtractedTaskSchema] = []

    class Config:
        from_attributes = True

class ReplyGenerateRequest(BaseModel):
    tone: str = "Professional"
    customNotes: Optional[str] = None
