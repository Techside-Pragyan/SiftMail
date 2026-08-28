from fastapi import APIRouter
from app.api.v1.endpoints import auth, emails, tasks, analytics

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(emails.router, prefix="/emails", tags=["Emails & AI Sifter"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks & Kanban"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Productivity Analytics"])
