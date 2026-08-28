# SiftMail — API Design & Interface Specifications

---

## 1. Global API Standards

- **Base URL**: `http://localhost:5000/api` (Production: `https://api.siftmail.ai/api`)
- **Transport**: HTTPS (TLS 1.3)
- **Data Format**: `application/json; charset=utf-8`
- **Authentication**: `Authorization: Bearer <JWT_TOKEN>` (Demo requests fall back to guest session automatically).

---

## 2. API Endpoints Catalog

### 2.1 System & Health

#### `GET /api/health`
- **Description**: Verifies API availability and AI engine connectivity.
- **Response**: `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2026-08-28T14:15:00.000Z",
  "service": "SiftMail Backend API",
  "aiEngine": "gemini-2.5-flash (active)"
}
```

---

### 2.2 Emails & Sifting Endpoints

#### `GET /api/emails`
- **Description**: Retrieves emails filtered by folder, urgency, or search term.
- **Query Params**:
  - `folder` (optional, default: `inbox`): `inbox | sent | starred | archive | trash`
  - `urgency` (optional): `critical | high | medium | low`
  - `q` (optional): search query string
- **Response**: `200 OK`
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": "em-001",
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

#### `POST /api/emails/:id/sift`
- **Description**: Triggers AI analysis on a specific email, computes urgency score, generates takeaways, and auto-syncs action items to the task board.
- **URL Param**: `id` (e.g. `em-001`)
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "Email successfully sifted and action items extracted",
  "data": {
    "emailId": "em-001",
    "aiAnalysis": {
      "urgency": "critical",
      "urgencyScore": 94,
      "sentiment": "urgent",
      "summary": "Executive summary of the thread...",
      "keyTakeaways": ["Item 1", "Item 2"],
      "suggestedReplies": [
        { "tone": "Concise", "text": "Received. Handling this now." }
      ],
      "extractedTasks": [
        {
          "title": "Verify infrastructure expenditure",
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

#### `POST /api/emails/:id/reply`
- **Description**: Generates an intelligent, context-aware email reply draft based on selected tone and custom user notes.
- **Request Body**:
```json
{
  "tone": "Friendly" | "Professional" | "Concise" | "Executive",
  "customNotes": "Mention I can join the meeting 10 minutes early"
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "tone": "Friendly",
  "replyText": "Hey Sarah,\n\nThanks for the update! I will review the budget line items and send over the PDF before 2:00 PM. Also, I can join the board meeting 10 minutes early if you'd like to sync beforehand.\n\nBest,\nPragyan"
}
```

---

### 2.3 Task & Kanban Endpoints

#### `GET /api/tasks`
- **Description**: Returns all extracted and custom action items.
- **Response**: `200 OK`
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": "tsk-101",
      "title": "Verify infrastructure expenditure in Q3 budget sheet 3",
      "dueDate": "Today, 1:30 PM",
      "priority": "urgent",
      "status": "pending",
      "sourceEmailId": "em-001",
      "sourceSubject": "URGENT: Client Review Q3 Roadmap & Budget Sign-off",
      "createdAt": "2026-08-28T13:45:00.000Z"
    }
  ]
}
```

#### `PATCH /api/tasks/:id`
- **Description**: Updates task status, priority, or deadline.
- **Request Body**:
```json
{
  "status": "in_progress" | "completed" | "pending",
  "priority": "urgent" | "high" | "medium" | "low"
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "tsk-101",
    "status": "in_progress",
    "updatedAt": "2026-08-28T14:20:00.000Z"
  }
}
```

---

### 2.4 Analytics Endpoints

#### `GET /api/analytics`
- **Description**: Aggregates inbox productivity KPIs, urgency distributions, and weekly velocity.
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
