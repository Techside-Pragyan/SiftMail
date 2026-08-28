# SiftMail — FastAPI & REST API Design Specification

---

## 1. Global API Standards

- **Backend Framework**: Python FastAPI 0.110+ (ASGI)
- **Base URL**: `http://localhost:8000/api` (Production: `https://api.siftmail.ai/api`)
- **Interactive Documentation**:
  - Swagger UI: `http://localhost:8000/docs`
  - ReDoc: `http://localhost:8000/redoc`
  - OpenAPI JSON: `http://localhost:8000/openapi.json`
- **Data Format**: `application/json`
- **Authentication**: `Authorization: Bearer <JWT_TOKEN>` (Demo guest access supported for instant evaluation).

---

## 2. FastAPI Endpoints Catalog

### 2.1 Health & Diagnostics

#### `GET /api/health`
- **Response**: `200 OK`
```json
{
  "status": "healthy",
  "service": "SiftMail Python Backend (FastAPI)",
  "database": "PostgreSQL 16 (Connected)",
  "aiEngine": "Google Gemini 2.5 Flash + Python NLP Heuristics",
  "timestamp": "2026-08-28T14:25:00.000Z"
}
```

---

### 2.2 Emails & AI Sifting

#### `GET /api/emails`
- **Description**: Returns emails for the authenticated user with optional folder/urgency filtering and search.
- **Query Parameters**:
  - `folder` (string, optional, default: `"inbox"`): `inbox | sent | starred | archive | trash`
  - `urgency` (string, optional): `critical | high | medium | low`
  - `q` (string, optional): Search query
- **Response**: `200 OK`
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": "7b5b7625-1e3e-4b45-a9f8-b3915bcfa001",
      "sender": "Sarah Jenkins",
      "senderEmail": "sarah.j@acmepartners.com",
      "recipient": "me@siftmail.ai",
      "subject": "URGENT: Client Review Q3 Roadmap & Budget Sign-off by EOD",
      "snippet": "Hi team, We need the updated Q3 budget spreadsheet...",
      "folder": "inbox",
      "isRead": false,
      "isStarred": true,
      "receivedAt": "2026-08-28T13:40:00.000Z",
      "tags": ["Work", "Urgent", "Budget"],
      "aiAnalysis": {
        "urgency": "critical",
        "urgencyScore": 94,
        "sentiment": "urgent",
        "summary": "Sarah requires urgent verification of Q3 budget sheet line items before 4:30 PM board meeting.",
        "keyTakeaways": [
          "Deadline: Send PDF export by 2:00 PM EST today.",
          "Action: Review infrastructure line items in sheet 3."
        ],
        "suggestedReplies": [
          {
            "tone": "Professional & Affirmative",
            "text": "Hi Sarah, I am already on it. Verifying sheet 3 now."
          }
        ],
        "extractedTasks": [
          {
            "title": "Verify infrastructure expenditure in Q3 budget sheet 3",
            "dueDate": "Today, 1:30 PM",
            "priority": "urgent"
          }
        ]
      }
    }
  ]
}
```

---

#### `POST /api/emails/{id}/sift`
- **Description**: Triggers Python AI service to analyze email, extract tasks, and persist structured analysis to PostgreSQL.
- **URL Param**: `id` (UUID)
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "Email successfully sifted and tasks extracted",
  "data": {
    "emailId": "7b5b7625-1e3e-4b45-a9f8-b3915bcfa001",
    "aiAnalysis": {
      "urgency": "critical",
      "urgencyScore": 94,
      "sentiment": "urgent",
      "summary": "Sarah requires urgent verification of Q3 budget sheet line items...",
      "keyTakeaways": ["Deadline: 2:00 PM EST"],
      "suggestedReplies": [
        { "tone": "Concise", "text": "Received. Working on updates now." }
      ],
      "extractedTasks": [
        {
          "title": "Verify infrastructure expenditure in sheet 3",
          "dueDate": "Today, 1:30 PM",
          "priority": "urgent"
        }
      ]
    },
    "createdTasksCount": 3
  }
}
```

---

#### `POST /api/emails/{id}/reply`
- **Description**: Generates an intelligent markdown email reply in specified tone.
- **Request Body**:
```json
{
  "tone": "Professional" | "Friendly" | "Concise" | "Executive",
  "customNotes": "Let her know I can join the sync 10 mins early"
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "tone": "Professional",
  "replyText": "Hi Sarah,\n\nThank you for the update. I am verifying the sheet 3 line items now and updating slide 8. You will receive the clean PDF export before 2:00 PM EST.\n\nBest regards,\nPragyan Paramita"
}
```

---

### 2.3 Tasks & Kanban Endpoints

#### `GET /api/tasks`
- **Description**: Retrieves all extracted tasks from PostgreSQL.
- **Response**: `200 OK`
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": "e8d64115-4c6e-44db-99e9-d91ab2d80101",
      "title": "Verify infrastructure expenditure in Q3 budget sheet 3",
      "dueDate": "Today, 1:30 PM",
      "priority": "urgent",
      "status": "pending",
      "sourceEmailId": "7b5b7625-1e3e-4b45-a9f8-b3915bcfa001",
      "sourceSubject": "URGENT: Client Review Q3 Roadmap & Budget Sign-off",
      "createdAt": "2026-08-28T13:45:00.000Z"
    }
  ]
}
```

#### `PATCH /api/tasks/{id}`
- **Description**: Updates task status (`pending`, `in_progress`, `completed`) or priority.
- **Request Body**:
```json
{
  "status": "in_progress",
  "priority": "urgent"
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "e8d64115-4c6e-44db-99e9-d91ab2d80101",
    "status": "in_progress",
    "updatedAt": "2026-08-28T14:30:00.000Z"
  }
}
```

---

### 2.4 Analytics Endpoints

#### `GET /api/analytics`
- **Description**: Aggregates inbox productivity KPIs, urgency distributions, and weekly velocity from PostgreSQL.
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "healthScore": 88,
    "emailsProcessed": 142,
    "pendingTasksCount": 3,
    "completedTasksCount": 18,
    "timeSavedMinutes": 252,
    "urgencyBreakdown": {
      "critical": 14,
      "high": 28,
      "medium": 36,
      "low": 22
    },
    "weeklyVolume": [
      { "day": "Mon", "received": 24, "sifted": 24 },
      { "day": "Tue", "received": 38, "sifted": 36 },
      { "day": "Wed", "received": 31, "sifted": 30 },
      { "day": "Thu", "received": 28, "sifted": 28 },
      { "day": "Fri", "received": 21, "sifted": 20 }
    ]
  }
}
```
