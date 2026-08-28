# SiftMail — High-Level Design (HLD)

---

## 1. Architectural Philosophy & Principles
SiftMail is structured as a decoupled, modern three-tier web platform consisting of:
1. **Pure React Presentation Tier**: High-speed, responsive Single Page Application built in Pure React + Vite, communicating exclusively via REST APIs.
2. **Python FastAPI Intelligence Tier**: Asynchronous Python ASGI server handling business logic, email ingestion, NLP extraction, and LLM orchestration.
3. **PostgreSQL Relational Persistence Tier**: ACID-compliant relational data store with JSONB support, indexing, and foreign key integrity.

---

## 2. High-Level Architecture Diagram

```mermaid
graph TB
    subgraph ClientLayer ["1. Presentation Layer (Pure React + Vanilla CSS)"]
        UI_Inbox["Inbox & Email Viewer"]
        UI_Sifter["AI Sifter & Priority Inspector"]
        UI_Kanban["Action Items Kanban Board"]
        UI_Analytics["Analytics Dashboard"]
        UI_Composer["Smart Reply Modal"]
    end

    subgraph APILayer ["2. FastAPI ASGI Application Server (:8000)"]
        Uvicorn["Uvicorn ASGI Server"]
        CORSMid["CORS & Security Middleware"]
        AuthMid["JWT & OAuth2 Interceptor"]
        
        subgraph Routers ["FastAPI APIRouters"]
            AuthRouter["/api/auth (Login/Register/Me)"]
            EmailRouter["/api/emails (List, Sift, Reply)"]
            TaskRouter["/api/tasks (CRUD, Status)"]
            AnalyticsRouter["/api/analytics (KPIs, Velocity)"]
        end
    end

    subgraph ServiceLayer ["3. Python Intelligence & Service Layer"]
        AIService["AI Engine (Gemini 2.5 + Python Heuristics)"]
        EmailService["Email Pipeline & Parsing Engine"]
        TaskService["Task Extraction & Sync Manager"]
        AnalyticsService["Metrics Aggregator"]
    end

    subgraph DBLayer ["4. PostgreSQL Database Layer (:5432)"]
        SQLAlchemy["SQLAlchemy 2.0 Async Session Pool"]
        Alembic["Alembic Schema Migrations"]
        PostgresDB[("PostgreSQL 16 DB (users, emails, tasks, ai_analyses)")]
    end

    ClientLayer -->|REST / JSON| Uvicorn
    Uvicorn --> CORSMid --> AuthMid
    AuthMid --> Routers
    
    EmailRouter --> EmailService
    EmailRouter --> AIService
    TaskRouter --> TaskService
    AnalyticsRouter --> AnalyticsService
    
    EmailService --> SQLAlchemy
    TaskService --> SQLAlchemy
    AnalyticsService --> SQLAlchemy
    
    SQLAlchemy --> PostgresDB
    Alembic -.-> PostgresDB
```

---

## 3. Component Deep Dive

### 3.1 Frontend Presentation Tier (Pure React)
- **Framework**: Pure React 18 with Vite.
- **Styling Architecture**: Vanilla CSS using custom CSS properties (`var(--accent-purple)`, `var(--bg-glass)`), providing dark-mode first glassmorphism without heavy third-party CSS dependencies.
- **Key Modules**:
  - `InboxView.jsx`: Thread list, urgency indicators, search bar, and reader.
  - `AISifterView.jsx`: Deep breakdown of AI insights, urgency dials, and key takeaways.
  - `TaskBoardView.jsx`: Interactive 3-column Kanban board (`Pending`, `In Progress`, `Completed`).
  - `AnalyticsView.jsx`: Visual KPI cards and SVG-based velocity trend charts.

### 3.2 Backend Service Tier (Python FastAPI)
- **FastAPI**: Async ASGI application leveraging Python type hints (`pydantic.BaseModel`).
- **AI Service**: Orchestrates Google Gemini 2.5 Flash API calls with fallback to Python heuristic tokenizers and regex extractors.
- **Dependency Injection**: FastAPI `Depends(get_db)` provides per-request async database sessions with automatic rollback on error.

### 3.3 Database Tier (PostgreSQL)
- **PostgreSQL 16**: Houses relational tables (`users`, `emails`, `ai_analyses`, `tasks`, `analytics_snapshots`).
- **JSONB Capabilities**: Stores dynamic AI output arrays (`key_takeaways`, `suggested_replies`) with full JSON querying capabilities.
- **Connection Pooling**: Managed via `asyncpg` driver for maximum concurrent throughput.
