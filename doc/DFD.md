# SiftMail — Data Flow Diagrams (DFD)

---

## 1. Context Diagram (Level 0 DFD)

The Level 0 Context Diagram represents SiftMail as a single unified system interacting with external entities (Users, Email Service Providers, and AI LLM Services).

```mermaid
graph TD
    User(["👤 User / Client Browser"])
    ESP(["📧 Email Provider (Gmail / Outlook / SMTP)"])
    Gemini(["🤖 Google Gemini / LLM Engine"])
    
    System[["⚡ SiftMail Intelligence Platform"]]
    
    User -->|"1. View Inbox / Trigger Sift / Edit Tasks / Send Reply"| System
    System -->|"2. Render Sifted Emails, Action Items, Analytics & Drafts"| User
    
    ESP -->|"3. Stream Incoming Raw Emails & Metadata"| System
    System -->|"4. Send Dispatched Email Replies"| ESP
    
    System -->|"5. Send Unstructured Email Body & Extraction Prompt"| Gemini
    Gemini -->|"6. Return Structured JSON (Summary, Urgency, Tasks, Replies)"| System
```

---

## 2. Level 1 DFD — Subsystem Data Flow

Level 1 breaks down SiftMail into its core internal processes and data stores.

```mermaid
graph LR
    subgraph ExternalEntities ["External Entities"]
        User(["👤 User"])
        ESP(["📧 Mail Provider"])
        LLM(["🤖 Gemini 2.5"])
    end

    subgraph Processes ["Core System Processes"]
        P1["1.0 Email Ingestion & Normalization"]
        P2["2.0 AI Sifting & NLP Pipeline"]
        P3["3.0 Action Item & Task Manager"]
        P4["4.0 Reply Generator & Composer"]
        P5["5.0 Analytics & Metrics Engine"]
    end

    subgraph DataStores ["Data Stores"]
        D1[("D1: Emails Store")]
        D2[("D2: Tasks & Actions Store")]
        D3[("D3: User Preferences & Auth")]
        D4[("D4: Analytics Metrics Log")]
    end

    %% Ingestion Flow
    ESP -->|"Raw Email Payloads"| P1
    P1 -->|"Cleaned Email Object"| D1

    %% Sifting Flow
    D1 -->|"Unprocessed Email"| P2
    P2 -->|"Structured Prompt"| LLM
    LLM -->|"Categorization, Urgency, Takeaways"| P2
    P2 -->|"Enriched AI Analysis"| D1
    P2 -->|"Extracted Action Items"| P3
    P2 -->|"Sift Activity Record"| D4

    %% Task Management
    P3 -->|"Create/Update Tasks"| D2
    User -->|"Toggle Status / Due Date"| P3
    D2 -->|"Active Kanban List"| User

    %% Reply Generation
    User -->|"Select Tone / Custom Prompt"| P4
    D1 -->|"Email Thread Context"| P4
    P4 -->|"Draft Request"| LLM
    LLM -->|"Generated Markdown Draft"| P4
    P4 -->|"Editable Draft"| User
    User -->|"Dispatch Send"| P4
    P4 -->|"Outgoing Email"| ESP

    %% Analytics
    D1 -->|"Email Counts & Urgency"| P5
    D2 -->|"Task Completion Rates"| P5
    D4 -->|"AI Time Metrics"| P5
    P5 -->|"Live Dashboard KPI Payload"| User
```

---

## 3. Level 2 DFD — Deep Dive: AI Sifting & Action Item Extraction Pipeline

This diagram illustrates the precise step-by-step data transformation when an email is sifted by the AI engine.

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Client
    participant Controller as Email Controller
    participant Normalizer as MIME & Text Sanitizer
    participant AIService as AI Sifting Engine
    participant LLM as Google Gemini 2.5
    participant Heuristic as Fallback Heuristic Engine
    participant TaskRepo as Task Repository
    participant EmailDB as Email Database

    User->>Controller: POST /api/emails/:id/sift
    Controller->>EmailDB: Fetch Email by ID
    EmailDB-->>Controller: Raw Email Record
    Controller->>Normalizer: Clean HTML tags & format thread quotes
    Normalizer-->>Controller: Sanitized Subject + Body + Sender
    
    Controller->>AIService: analyzeEmail(subject, body, sender)
    
    alt Gemini API Key Configured & Available
        AIService->>LLM: generateContent(Prompt, responseMimeType="application/json")
        LLM-->>AIService: Structured JSON Result
    else API Key Missing / Timeout / Quota Exceeded
        AIService->>Heuristic: heuristicAnalyze(subject, body, sender)
        Heuristic-->>AIService: Calculated Urgency, Takeaways & Tasks
    end

    AIService-->>Controller: Complete AIAnalysis Object
    
    Controller->>EmailDB: Update Email with aiAnalysis object
    
    loop For each extracted task in aiAnalysis
        Controller->>TaskRepo: createOrSyncTask(title, dueDate, priority, emailId)
        TaskRepo-->>Controller: Created Task Record
    end
    
    Controller-->>User: HTTP 200 OK (Enriched Email + Extracted Tasks)
```

---

## 4. Data Dictionary (Key Flows)

| Flow Name | Source | Destination | Data Elements |
| :--- | :--- | :--- | :--- |
| `Raw Email Payload` | Email Provider / Input | `1.0 Normalizer` | `messageId, from, to, subject, headers, bodyHtml, bodyText, timestamp` |
| `Sanitized Email` | `1.0 Normalizer` | `D1: Emails Store` | `id, sender, senderEmail, subject, body, snippet, isRead, tags, folder` |
| `AI Sift Payload` | `2.0 AI Engine` | `D1 / D2 Stores` | `urgency (low/med/high/critical), urgencyScore (0-100), sentiment, summary, keyTakeaways[], suggestedReplies[], extractedTasks[]` |
| `Task Mutation` | User UI | `3.0 Task Manager` | `taskId, status (pending/in_progress/completed), priority, dueDate, title` |
| `Reply Draft` | `4.0 Reply Generator` | User Composer | `draftText, tone, recipient, subject, customNotes` |
| `Analytics Summary` | `5.0 Analytics Engine` | User Dashboard | `healthScore, emailsProcessed, pendingTasksCount, timeSavedMinutes, urgencyBreakdown, weeklyVolume[]` |
