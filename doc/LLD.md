# SiftMail — Low-Level Design (LLD)

---

## 1. Class & Data Models (Python / SQLAlchemy / Pydantic)

### 1.1 SQLAlchemy Database Models (`app/models/`)

```mermaid
classDiagram
    class User {
        +UUID id
        +str email
        +str hashed_password
        +str full_name
        +datetime created_at
    }

    class EmailModel {
        +UUID id
        +UUID user_id
        +str message_id
        +str sender_name
        +str sender_email
        +str recipient_email
        +str subject
        +str body
        +str snippet
        +str folder
        +bool is_read
        +bool is_starred
        +datetime received_at
    }

    class AIAnalysisModel {
        +UUID id
        +UUID email_id
        +str urgency
        +int urgency_score
        +str sentiment
        +str summary
        +List[str] key_takeaways
        +List[dict] suggested_replies
        +datetime analyzed_at
    }

    class TaskModel {
        +UUID id
        +UUID user_id
        +UUID source_email_id
        +str title
        +str due_date
        +str priority
        +str status
        +datetime created_at
        +datetime completed_at
    }

    User "1" --> "0..*" EmailModel : owns
    EmailModel "1" --> "0..1" AIAnalysisModel : has
    EmailModel "1" --> "0..*" TaskModel : originates
    User "1" --> "0..*" TaskModel : assigned_to
```

---

## 2. Pydantic Schemas (`app/schemas/`)

### 2.1 Pydantic DTOs for AI & Email

```python
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum

class UrgencyLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

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
    suggestedReplies: List[SuggestedReply]
    extractedTasks: List[ExtractedTaskSchema]

class EmailResponse(BaseModel):
    id: str
    sender: str
    senderEmail: str
    recipient: str
    subject: str
    body: str
    snippet: str
    folder: str
    isRead: bool
    isStarred: bool
    receivedAt: datetime
    tags: List[str]
    aiAnalysis: Optional[AIAnalysisSchema] = None

class TaskResponse(BaseModel):
    id: str
    title: str
    dueDate: Optional[str]
    priority: str
    status: TaskStatus
    sourceEmailId: Optional[str]
    sourceSubject: Optional[str]
    createdAt: datetime
```

---

## 3. Python Service & Router Architecture

### 3.1 `AIService` Implementation Pattern (`app/services/ai_service.py`)

```python
import os
import json
from app.schemas.ai_schema import AIAnalysisSchema

class AIService:
    @staticmethod
    async def analyze_email(subject: str, body: str, sender: str) -> AIAnalysisSchema:
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key and api_key.strip():
            try:
                # Invoke Google GenAI Gemini 2.5 Flash SDK
                from google import genai
                client = genai.Client(api_key=api_key)
                prompt = f"""Analyze this email and output JSON adhering to the schema:
Sender: {sender}
Subject: {subject}
Body: {body}"""
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config={"response_mime_type": "application/json"}
                )
                return AIAnalysisSchema.model_validate_json(response.text)
            except Exception as e:
                # Log and trigger graceful fallback
                pass
        
        # Local Python Heuristic Fallback
        return AIService._heuristic_analyze(subject, body, sender)

    @staticmethod
    def _heuristic_analyze(subject: str, body: str, sender: str) -> AIAnalysisSchema:
        # Regex and keyword priority classifier
        ...
```

---

## 4. Sequence Workflows

### 4.1 Sift Email & PostgreSQL Persistence Workflow

```mermaid
sequenceDiagram
    autonumber
    actor ReactClient as React 18 Frontend
    participant FastAPI as FastAPI Router (/api/emails/{id}/sift)
    participant AIService as Python AIService
    participant Gemini as Google Gemini 2.5 Flash
    participant SQLAlchemy as SQLAlchemy Async Session
    participant Postgres as PostgreSQL 16 DB

    ReactClient->>FastAPI: POST /api/emails/{id}/sift
    FastAPI->>SQLAlchemy: select(Email).where(Email.id == id)
    SQLAlchemy->>Postgres: Execute SELECT query
    Postgres-->>SQLAlchemy: email_record
    SQLAlchemy-->>FastAPI: EmailModel instance

    FastAPI->>AIService: analyze_email(subject, body, sender)
    alt Gemini Active
        AIService->>Gemini: generate_content(prompt, JSON schema)
        Gemini-->>AIService: Validated JSON text
    else Offline Fallback
        AIService->>AIService: _heuristic_analyze(subject, body, sender)
    end
    AIService-->>FastAPI: AIAnalysisSchema object

    FastAPI->>SQLAlchemy: Insert/Update AIAnalysis & Tasks records
    SQLAlchemy->>Postgres: Execute INSERT / UPDATE transactions
    Postgres-->>SQLAlchemy: Transaction Committed
    
    FastAPI-->>ReactClient: HTTP 200 OK (Email with enriched aiAnalysis + Tasks)
```
