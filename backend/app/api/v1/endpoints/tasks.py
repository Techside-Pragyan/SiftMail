from typing import Optional, List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from app.db.session import get_db
from app.models.user import User
from app.models.task import Task
from app.schemas.task import TaskResponse, TaskListResponse, TaskCreate, TaskUpdate, TaskStatus
from app.api.deps import get_current_user

router = APIRouter()

def _serialize_task(task: Task) -> TaskResponse:
    return TaskResponse(
        id=task.id,
        title=task.title,
        dueDate=task.due_date,
        priority=task.priority,
        status=TaskStatus(task.status),
        sourceEmailId=task.source_email_id,
        sourceSubject=task.source_subject,
        createdAt=task.created_at,
        completedAt=task.completed_at
    )

@router.get("", response_model=TaskListResponse)
async def list_tasks(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Task).where(Task.user_id == current_user.id)
    if status_filter:
        query = query.where(Task.status == status_filter)
    if priority_filter:
        query = query.where(Task.priority == priority_filter)

    query = query.order_by(desc(Task.created_at))
    result = await db.execute(query)
    tasks = result.scalars().all()

    serialized = [_serialize_task(t) for t in tasks]
    return TaskListResponse(success=True, count=len(serialized), data=serialized)

@router.post("", response_model=TaskResponse)
async def create_task(
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    task = Task(
        user_id=current_user.id,
        title=task_in.title,
        due_date=task_in.dueDate,
        priority=task_in.priority,
        status=task_in.status.value,
        source_email_id=task_in.sourceEmailId,
        source_subject=task_in.sourceSubject,
        created_at=datetime.now(timezone.utc)
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return _serialize_task(task)

@router.patch("/{id}", response_model=TaskResponse)
async def update_task(
    id: str,
    update_in: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Task).where(and_(Task.id == id, Task.user_id == current_user.id)))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if update_in.title is not None:
        task.title = update_in.title
    if update_in.dueDate is not None:
        task.due_date = update_in.dueDate
    if update_in.priority is not None:
        task.priority = update_in.priority
    if update_in.status is not None:
        task.status = update_in.status.value
        if update_in.status == TaskStatus.COMPLETED:
            task.completed_at = datetime.now(timezone.utc)
        else:
            task.completed_at = None

    await db.commit()
    await db.refresh(task)
    return _serialize_task(task)

@router.delete("/{id}")
async def delete_task(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Task).where(and_(Task.id == id, Task.user_id == current_user.id)))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    await db.delete(task)
    await db.commit()
    return {"success": True, "message": "Task successfully deleted"}
