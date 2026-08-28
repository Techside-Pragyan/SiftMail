# SiftMail — Technical Requirements Document (TRD)

---

## 1. System Architecture & Tech Stack Overview

### 1.1 Technology Stack Matrix

| Layer | Technology | Rationale & Tradeoffs |
| :--- | :--- | :--- |
| **Backend Framework** | **Python 3.11+ (FastAPI + Uvicorn)** | High-performance asynchronous ASGI framework with native type hinting, automatic OpenAPI docs, and seamless integration with ML/NLP libraries. |
| **AI / NLP Engine** | **Google Gemini 2.5 SDK (`google-genai`) + Spacy / Heuristics** | Rapid LLM structured extraction paired with native Python NLP capabilities for offline fallback and token preprocessing. |
| **Database & ORM** | **PostgreSQL 16 + SQLAlchemy 2.0 (Async) + Alembic** | Robust relational persistence, JSONB support for dynamic AI metadata, ACID compliance, and Alembic database version control. |
| **Frontend Framework** | **Pure React 18 + Vite (JavaScript / TypeScript)** | Ultra-clean, modular Component architecture without heavy boilerplate, blazing fast HMR and sub-second builds. |
| **Styling & UI Tokens** | **Pure Vanilla CSS (CSS Custom Properties + Glassmorphism)** | 100% control over design tokens, dark glassmorphic aesthetics, zero runtime CSS-in-JS overhead. |
| **Authentication** | **OAuth2 + JWT (python-jose + passlib[bcrypt])** | Standard stateless bearer authentication with optional demo guest fallback. |

---

## 2. Technical Architecture Diagram

```mermaid
graph TD
    Client["Client Browser (Pure React 18 + Vanilla CSS)"]
    API["FastAPI Gateway / Uvicorn ASGI Server (:8000)"]
    AuthMid["JWT & Demo Auth Security Middleware"]
    
    subgraph Services ["Python Backend Services Layer"]
        AIService["AI Service (google-genai + NLP Engine)"]
        EmailService["Email Ingestion & Sifting Service"]
        TaskService["Task & Commitment Sync Service"]
        AnalyticsService["Analytics & Metric Aggregator"]
    end

    subgraph DataLayer ["PostgreSQL Persistence Layer"]
        PostgresDB[("PostgreSQL 16 Database")]
        SQLAlchemy["SQLAlchemy 2.0 Async Session Manager"]
        Alembic["Alembic Migration Engine"]
    end

    Client -->|HTTP/REST (JSON)| API
    API --> AuthMid
    AuthMid --> EmailService
    AuthMid --> TaskService
    AuthMid --> AnalyticsService
    
    EmailService --> AIService
    EmailService --> SQLAlchemy
    TaskService --> SQLAlchemy
    AnalyticsService --> SQLAlchemy
    
    SQLAlchemy --> PostgresDB
    Alembic -.-> PostgresDB
```

---

## 3. Python Service Specifications

### 3.1 AI Service (`app/services/ai_service.py`)
- **Primary SDK**: `google-genai` (Gemini 2.5 Flash)
- **Schema Enforcement**: Pydantic v2 `BaseModel` parsing with strict output formatting.
- **Failover Strategy**:
  1. Inspect `GEMINI_API_KEY` from environment variables.
  2. Invoke Gemini 2.5 Flash with a 3.5s timeout.
  3. If rate-limited or offline, invoke local Python heuristic NLP parser (`heuristic_analyze`).

### 3.2 Database Engine (`app/db/session.py`)
- **Async Engine**: `create_async_engine("postgresql+asyncpg://user:pass@localhost:5432/siftmail_db")`
- **Session Factory**: `async_sessionmaker(bind=engine, expire_on_commit=False)`
- **Connection Pool**: Min 5 connections, max 20 connections with automatic recycling.

### 3.3 Task Sync & Sifter Service (`app/services/email_service.py`)
- Automatically generates relational `Task` records in PostgreSQL with foreign key references to the source `Email` upon sifting.
- De-duplicates action items using a composite hash (`email_id + title`).

---

## 4. API Interface Technical Contract

### 4.1 Global Response Standard
All FastAPI responses return validated Pydantic models:
```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {
    "timestamp": "2026-08-28T14:20:00Z",
    "version": "1.0.0"
  }
}
```

### 4.2 Error Handling Standard
| HTTP Status | Error Code | Description |
| :--- | :--- | :--- |
| `400 Bad Request` | `VALIDATION_ERROR` | Pydantic validation failure on request payload |
| `401 Unauthorized` | `UNAUTHORIZED` | Invalid or missing JWT token |
| `404 Not Found` | `RESOURCE_NOT_FOUND` | Email or Task UUID not found in PostgreSQL |
| `429 Too Many Requests`| `RATE_LIMIT_EXCEEDED` | AI endpoint request limit reached |
| `500 Server Error` | `INTERNAL_ERROR` | Unhandled backend exception |
