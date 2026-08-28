from typing import Optional, List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, desc
from app.db.session import get_db
from app.models.user import User
from app.models.email import Email, AIAnalysis
from app.models.task import Task
from app.schemas.email import EmailResponse, EmailListResponse, EmailCreate, EmailUpdate
from app.schemas.ai import ReplyGenerateRequest
from app.services.ai_service import AIService
from app.api.deps import get_current_user

router = APIRouter()

def _serialize_email(email: Email) -> EmailResponse:
    ai_data = None
    if email.ai_analysis:
        ai_data = {
            "urgency": email.ai_analysis.urgency,
            "urgencyScore": email.ai_analysis.urgency_score,
            "sentiment": email.ai_analysis.sentiment,
            "summary": email.ai_analysis.summary,
            "keyTakeaways": email.ai_analysis.key_takeaways or [],
            "suggestedReplies": email.ai_analysis.suggested_replies or [],
            "extractedTasks": email.ai_analysis.extracted_tasks or []
        }

    return EmailResponse(
        id=email.id,
        sender=email.sender,
        senderEmail=email.sender_email,
        recipient=email.recipient,
        subject=email.subject,
        snippet=email.snippet,
        body=email.body,
        folder=email.folder,
        isRead=email.is_read,
        isStarred=email.is_starred,
        receivedAt=email.received_at,
        tags=email.tags or [],
        aiAnalysis=ai_data
    )

@router.get("", response_model=EmailListResponse)
async def list_emails(
    folder: Optional[str] = Query("inbox"),
    urgency: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Email).where(Email.user_id == current_user.id)

    if folder:
        if folder == "starred":
            query = query.where(Email.is_starred == True)
        else:
            query = query.where(Email.folder == folder)

    if q:
        search = f"%{q}%"
        query = query.where(
            or_(
                Email.subject.ilike(search),
                Email.sender.ilike(search),
                Email.sender_email.ilike(search),
                Email.body.ilike(search)
            )
        )

    query = query.order_by(desc(Email.received_at))
    result = await db.execute(query)
    emails = result.scalars().all()

    # Filter by urgency if requested
    filtered = []
    for em in emails:
        if urgency and em.ai_analysis and em.ai_analysis.urgency.lower() != urgency.lower():
            continue
        filtered.append(_serialize_email(em))

    return EmailListResponse(success=True, count=len(filtered), data=filtered)

@router.get("/{id}", response_model=EmailResponse)
async def get_email(id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Email).where(and_(Email.id == id, Email.user_id == current_user.id)))
    email = result.scalar_one_or_none()
    if not email:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found")
    return _serialize_email(email)

@router.post("", response_model=EmailResponse)
async def create_email(email_in: EmailCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    snippet = email_in.snippet or (email_in.body[:140] + "..." if len(email_in.body) > 140 else email_in.body)
    email = Email(
        user_id=current_user.id,
        sender=email_in.sender,
        sender_email=email_in.senderEmail,
        recipient=email_in.recipient,
        subject=email_in.subject,
        snippet=snippet,
        body=email_in.body,
        folder=email_in.folder,
        tags=email_in.tags,
        received_at=datetime.now(timezone.utc)
    )
    db.add(email)
    await db.commit()
    await db.refresh(email)
    return _serialize_email(email)

@router.patch("/{id}", response_model=EmailResponse)
async def update_email(id: str, update_in: EmailUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Email).where(and_(Email.id == id, Email.user_id == current_user.id)))
    email = result.scalar_one_or_none()
    if not email:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found")

    if update_in.isRead is not None:
        email.is_read = update_in.isRead
    if update_in.isStarred is not None:
        email.is_starred = update_in.isStarred
    if update_in.folder is not None:
        email.folder = update_in.folder
    if update_in.tags is not None:
        email.tags = update_in.tags

    await db.commit()
    await db.refresh(email)
    return _serialize_email(email)

@router.post("/{id}/sift")
async def sift_email(id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Triggers AI analysis on the email, updates urgency/takeaways/replies,
    and automatically creates tasks on the Kanban board.
    """
    result = await db.execute(select(Email).where(and_(Email.id == id, Email.user_id == current_user.id)))
    email = result.scalar_one_or_none()
    if not email:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found")

    # Run AI Analysis
    analysis = await AIService.analyze_email(email.subject, email.body, email.sender)

    # Upsert AIAnalysis record
    if email.ai_analysis:
        email.ai_analysis.urgency = analysis.urgency.value
        email.ai_analysis.urgency_score = analysis.urgencyScore
        email.ai_analysis.sentiment = analysis.sentiment
        email.ai_analysis.summary = analysis.summary
        email.ai_analysis.key_takeaways = analysis.keyTakeaways
        email.ai_analysis.suggested_replies = [r.model_dump() for r in analysis.suggestedReplies]
        email.ai_analysis.extracted_tasks = [t.model_dump() for t in analysis.extractedTasks]
        email.ai_analysis.analyzed_at = datetime.now(timezone.utc)
    else:
        ai_record = AIAnalysis(
            email_id=email.id,
            urgency=analysis.urgency.value,
            urgency_score=analysis.urgencyScore,
            sentiment=analysis.sentiment,
            summary=analysis.summary,
            key_takeaways=analysis.keyTakeaways,
            suggested_replies=[r.model_dump() for r in analysis.suggestedReplies],
            extracted_tasks=[t.model_dump() for t in analysis.extractedTasks],
            analyzed_at=datetime.now(timezone.utc)
        )
        db.add(ai_record)

    # Sync extracted tasks to Kanban board if not already added
    created_count = 0
    for task_item in analysis.extractedTasks:
        task = Task(
            user_id=current_user.id,
            source_email_id=email.id,
            source_subject=email.subject,
            title=task_item.title,
            due_date=task_item.dueDate,
            priority=task_item.priority,
            status="pending"
        )
        db.add(task)
        created_count += 1

    await db.commit()
    await db.refresh(email)

    return {
        "success": True,
        "message": "Email successfully sifted and tasks synchronized",
        "email": _serialize_email(email),
        "createdTasksCount": created_count
    }

@router.post("/{id}/reply")
async def generate_reply(
    id: str,
    req: ReplyGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generates customized reply draft in specified tone.
    """
    result = await db.execute(select(Email).where(and_(Email.id == id, Email.user_id == current_user.id)))
    email = result.scalar_one_or_none()
    if not email:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found")

    reply_text = await AIService.generate_reply(
        subject=email.subject,
        body=email.body,
        sender=email.sender,
        tone=req.tone,
        custom_notes=req.customNotes
    )

    return {
        "success": True,
        "tone": req.tone,
        "replyText": reply_text
    }
