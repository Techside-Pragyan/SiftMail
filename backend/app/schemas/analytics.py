from typing import Dict, List, Any
from pydantic import BaseModel

class DayVolume(BaseModel):
    day: str
    received: int
    sifted: int

class AnalyticsData(BaseModel):
    healthScore: int
    emailsProcessed: int
    pendingTasksCount: int
    completedTasksCount: int
    timeSavedMinutes: int
    urgencyBreakdown: Dict[str, int]
    weeklyVolume: List[DayVolume]

class AnalyticsResponse(BaseModel):
    success: bool = True
    data: AnalyticsData
