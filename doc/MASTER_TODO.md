# SiftMail — Master Roadmap & Implementation TODO

---

## 🎯 Project Overview
**SiftMail**: AI-Powered Smart Email Sorter that intelligently organizes, categorizes, prioritizes, and summarizes emails using Machine Learning and NLP.

**Target Stack**:
- **Backend**: Python 3.11+ (FastAPI + Uvicorn + Pydantic + `google-genai` SDK)
- **Frontend**: Pure React 18 + Vite (Vanilla CSS Tokens, Dark Glassmorphism)
- **Database**: PostgreSQL 16 + SQLAlchemy 2.0 (Async) + Alembic

---

## 📅 Phase-by-Phase Roadmap

### 🟩 Phase 1: Architecture, Core Infrastructure & Documentation
- [x] Configure git repository and sync upstream with `origin/main`
- [x] Author comprehensive documentation suite (`PRD`, `TRD`, `DFD`, `HLD`, `LLD`, `UI_WIREFRAMES`, `USER_STORIES`, `DATABASE_DESIGN`, `API_DESIGN`, `MASTER_TODO`)
- [ ] Initialize Python backend environment:
  - [ ] Create `requirements.txt` (`fastapi`, `uvicorn[standard]`, `pydantic`, `sqlalchemy[asyncio]`, `asyncpg`, `alembic`, `google-genai`, `python-jose`, `passlib[bcrypt]`, `python-dotenv`)
  - [ ] Setup FastAPI directory structure (`app/api/`, `app/core/`, `app/db/`, `app/models/`, `app/schemas/`, `app/services/`)
- [ ] Initialize Pure React 18 Vite frontend:
  - [ ] Setup Pure React project structure (`src/components/`, `src/context/`, `src/services/`, `src/styles/`)

---

### 🟨 Phase 2: PostgreSQL Database & SQLAlchemy 2.0 Models
- [ ] Setup PostgreSQL database schema and connection pool (`app/db/session.py`)
- [ ] Define SQLAlchemy ORM Models:
  - [ ] `User` (`app/models/user.py`)
  - [ ] `Email` (`app/models/email.py`)
  - [ ] `AIAnalysis` (`app/models/ai_analysis.py`)
  - [ ] `Task` (`app/models/task.py`)
  - [ ] `AnalyticsSnapshot` (`app/models/analytics.py`)
- [ ] Configure Alembic migrations & initial database seeding script (`app/db/seed.py`)

---

### 🟧 Phase 3: Python AI Intelligence Engine & FastAPI Endpoints
- [ ] Implement `AIService` (`app/services/ai_service.py`):
  - [ ] Google Gemini 2.5 Flash API structured JSON extraction
  - [ ] Built-in Python heuristic & regex NLP engine for zero-key/offline fallback
  - [ ] Multi-tone Smart Reply generator
- [ ] Implement FastAPI APIRouters:
  - [ ] `app/api/v1/endpoints/auth.py` (Register, Login, Demo Session)
  - [ ] `app/api/v1/endpoints/emails.py` (List, Filter, Sift `/sift`, Reply `/reply`, Star/Read mutations)
  - [ ] `app/api/v1/endpoints/tasks.py` (CRUD Kanban tasks, status transitions)
  - [ ] `app/api/v1/endpoints/analytics.py` (Health score, urgency distribution, velocity metrics)

---

### 🟦 Phase 4: Pure React Frontend & Glassmorphic UI
- [ ] Build pure CSS design tokens (`src/styles/index.css`) with dark glassmorphic styling
- [ ] Build **Inbox View**:
  - [ ] Search bar & multi-criteria filters (`Urgent`, `Work`, `Starred`, `All`)
  - [ ] Email card list with dynamic urgency badges & score progress
  - [ ] Split-view email reader with rendered body & header details
- [ ] Build **AI Sifter Inspector Panel**:
  - [ ] Urgency score meter & sentiment badge
  - [ ] Executive TL;DR summary card
  - [ ] Bulleted key takeaways with entity highlighting
  - [ ] Auto-extracted action items with 1-click sync to Kanban
- [ ] Build **Action Items & Kanban Board**:
  - [ ] 3-Column workflow: `Pending` | `In Progress` | `Completed`
  - [ ] Priority tags (`Urgent`, `High`, `Medium`, `Low`) and deadline displays
  - [ ] Source email backlink navigation
- [ ] Build **Smart Reply Assistant Modal**:
  - [ ] Tone switcher (`Professional`, `Friendly`, `Concise`, `Formal`)
  - [ ] Custom guidance prompt input
  - [ ] 1-Click copy-to-clipboard and send actions
- [ ] Build **Analytics Dashboard**:
  - [ ] Inbox Health Score ring
  - [ ] KPI cards (Emails Processed, AI Time Saved, Pending Actions)
  - [ ] Visual Urgency breakdown bar and 7-day velocity chart

---

### 🟪 Phase 5: Testing, Verification & Production Hardening
- [ ] Verify FastAPI backend endpoints with Swagger UI (`/docs`)
- [ ] Verify Pure React build (`npm run build`)
- [ ] Test end-to-end integration: Ingest Email ➔ Trigger AI Sift ➔ Auto-extract Tasks ➔ Update Kanban ➔ Generate Reply ➔ View Analytics
- [ ] Create Docker Compose file (`docker-compose.yml`) for local PostgreSQL + FastAPI + React orchestration
