# SiftMail Backend (Python FastAPI + PostgreSQL / SQLite)

High-performance, asynchronous REST API for AI-powered email intelligence, urgency categorization, task extraction, and smart replies.

## Tech Stack
- **Python 3.11+ / 3.14**
- **FastAPI** (Async ASGI framework)
- **SQLAlchemy 2.0 (Async)** + **asyncpg** (PostgreSQL) / **aiosqlite** (Local Dev)
- **Google GenAI SDK** (`google-genai` / Gemini 2.5 Flash)
- **Pydantic v2**
- **Uvicorn**

---

## Quick Start

### 1. Create Virtual Environment & Install Dependencies
```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment (`.env`)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
To connect PostgreSQL:
```env
DATABASE_URL="postgresql+asyncpg://user:password@localhost:5432/siftmail_db"
```
Or for zero-setup local SQLite:
```env
DATABASE_URL="sqlite+aiosqlite:///./siftmail.db"
```

To enable Gemini AI:
```env
GEMINI_API_KEY="your-gemini-api-key"
```
*(Note: If no API key is provided, SiftMail's built-in Python NLP heuristic engine runs automatically with zero downtime!)*

### 3. Run Development Server
```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Interactive API Documentation
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)
