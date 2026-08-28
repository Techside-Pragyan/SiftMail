from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.base import Base
from app.db.session import engine
from app.core.security import get_password_hash
from app.models.user import User
from app.models.email import Email, AIAnalysis
from app.models.task import Task
from app.db.seed_data import DEMO_USER_ID, DEMO_USER_EMAIL, SEED_EMAILS, SEED_TASKS

async def init_db():
    # Create all tables asynchronously
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed demo user & initial emails/tasks if not present
    from app.db.session import AsyncSessionLocal
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.id == DEMO_USER_ID))
        existing_user = result.scalar_one_or_none()

        if not existing_user:
            demo_user = User(
                id=DEMO_USER_ID,
                email=DEMO_USER_EMAIL,
                full_name="Pragyan Paramita",
                hashed_password=get_password_hash("demo1234"),
                preferences={"theme": "dark", "auto_sift": True, "default_tone": "Professional"}
            )
            session.add(demo_user)
            await session.commit()

            # Seed Emails
            for em_data in SEED_EMAILS:
                ai_data = em_data.get("ai_analysis")
                email = Email(
                    id=em_data["id"],
                    user_id=em_data["user_id"],
                    sender=em_data["sender"],
                    sender_email=em_data["sender_email"],
                    recipient=em_data["recipient"],
                    subject=em_data["subject"],
                    snippet=em_data["snippet"],
                    body=em_data["body"],
                    folder=em_data["folder"],
                    is_read=em_data["is_read"],
                    is_starred=em_data["is_starred"],
                    received_at=em_data["received_at"],
                    tags=em_data["tags"]
                )
                session.add(email)
                await session.flush()

                if ai_data:
                    ai_analysis = AIAnalysis(
                        email_id=email.id,
                        urgency=ai_data["urgency"],
                        urgency_score=ai_data["urgency_score"],
                        sentiment=ai_data["sentiment"],
                        summary=ai_data["summary"],
                        key_takeaways=ai_data["key_takeaways"],
                        suggested_replies=ai_data["suggested_replies"],
                        extracted_tasks=ai_data["extracted_tasks"]
                    )
                    session.add(ai_analysis)

            # Seed Tasks
            for tsk_data in SEED_TASKS:
                task = Task(
                    id=tsk_data["id"],
                    user_id=tsk_data["user_id"],
                    title=tsk_data["title"],
                    due_date=tsk_data.get("due_date"),
                    priority=tsk_data["priority"],
                    status=tsk_data["status"],
                    source_email_id=tsk_data.get("source_email_id"),
                    source_subject=tsk_data.get("source_subject"),
                    created_at=tsk_data["created_at"],
                    completed_at=tsk_data.get("completed_at")
                )
                session.add(task)

            await session.commit()
            print("[Database] Successfully initialized schema and seeded demo dataset.")
