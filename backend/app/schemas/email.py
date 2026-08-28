from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from app.schemas.ai import AIAnalysisSchema

class EmailBase(BaseModel):
    sender: str
    senderEmail: str
    recipient: str
    subject: str
    body: str
    snippet: Optional[str] = None
    folder: str = "inbox"
    tags: List[str] = []

class EmailCreate(EmailBase):
    pass

class EmailUpdate(BaseModel):
    isRead: Optional[bool] = None
    isStarred: Optional[bool] = None
    folder: Optional[str] = None
    tags: Optional[List[str]] = None

class EmailResponse(BaseModel):
    id: str
    sender: str
    senderEmail: str
    recipient: str
    subject: str
    snippet: str
    body: str
    folder: str
    isRead: bool
    isStarred: bool
    receivedAt: datetime
    tags: List[str]
    aiAnalysis: Optional[AIAnalysisSchema] = None

    class Config:
        from_attributes = True

class EmailListResponse(BaseModel):
    success: bool = True
    count: int
    data: List[EmailResponse]
