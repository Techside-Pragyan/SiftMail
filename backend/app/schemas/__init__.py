from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, UserUpdate
from app.schemas.ai import AIAnalysisSchema, SuggestedReply, ExtractedTaskSchema, ReplyGenerateRequest
from app.schemas.email import EmailResponse, EmailListResponse, EmailCreate, EmailUpdate
from app.schemas.task import TaskResponse, TaskListResponse, TaskCreate, TaskUpdate, TaskStatus
from app.schemas.analytics import AnalyticsResponse, AnalyticsData

__all__ = [
    "UserCreate", "UserLogin", "UserResponse", "Token", "UserUpdate",
    "AIAnalysisSchema", "SuggestedReply", "ExtractedTaskSchema", "ReplyGenerateRequest",
    "EmailResponse", "EmailListResponse", "EmailCreate", "EmailUpdate",
    "TaskResponse", "TaskListResponse", "TaskCreate", "TaskUpdate", "TaskStatus",
    "AnalyticsResponse", "AnalyticsData"
]
