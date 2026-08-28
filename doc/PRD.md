# SiftMail — Product Requirements Document (PRD)

---

## 1. Executive Summary
**SiftMail** is an enterprise-grade, AI-powered Smart Email Intelligence & Action Management Workspace designed to solve inbox overload, communication fatigue, and lost action items. Modern professionals receive over 120 emails per day, wasting an average of 2.6 hours daily reading, triaging, drafting replies, and tracking action items across disparate tools.

SiftMail uses advanced Natural Language Processing (NLP), Large Language Models (LLMs), and Machine Learning classifiers to automatically:
1. **Intelligently categorize** incoming emails into contextual buckets (Work, High Priority, Finance, Engineering, Newsletters, Social).
2. **Score urgency & importance** (0–100) using multi-factor heuristics and semantic intent analysis.
3. **Generate executive TL;DR summaries** and key takeaways in real-time.
4. **Extract actionable tasks** (commitments, questions, deadlines) with one-click synchronization to a Kanban board.
5. **Draft contextual smart replies** across multiple tones (Professional, Friendly, Urgent, Executive, Concise).
6. **Provide inbox health analytics**, tracking time saved, email velocity, and response SLAs.

---

## 2. Vision & Objectives

### 2.1 Vision Statement
Transform the email inbox from a chaotic communication dumping ground into an automated, proactive productivity command center.

### 2.2 Core OKRs (Objectives & Key Results)
- **Objective 1: Cut Inbox Triage Time by 70%**
  - KR 1.1: Reduce average time spent reading long email threads from 4.5 minutes to under 30 seconds via AI Summaries.
  - KR 1.2: Achieve 95%+ precision on critical email classification.
- **Objective 2: Zero Lost Action Items**
  - KR 2.1: Automatically extract 100% of explicit deadlines and action items from emails.
  - KR 2.2: Provide 1-click conversion from email thread to task board.
- **Objective 3: Supercharge Response Efficiency**
  - KR 3.1: Enable 1-click personalized reply drafting with user tone customization.
  - KR 3.2: 80% user adoption of generated response drafts with minor edits.

---

## 3. Target Audience & Personas

| Persona | Role | Key Pain Points | SiftMail Value Proposition |
| :--- | :--- | :--- | :--- |
| **Tech Lead / Engineering Manager** | Manages PRs, architecture RFPs, cross-team requests | Buried under GitHub notifications, RFCs, and urgent production threads | Priority scoring separates critical bugs/RFCs from notification noise; auto-extracts review tasks. |
| **Startup Founder / CEO** | Interacts with investors, customers, press, candidates | High context switching; missing investor replies or time-sensitive deals | Executive digests highlight investor/client emails with suggested high-impact reply drafts. |
| **Product / Operations Manager** | Manages roadmap sign-offs, sprint blockers, status updates | Manually copy-pasting email action items into Jira/Linear/Trello | Automatic task extraction with due dates directly to Kanban board. |
| **Freelancer / Consultant** | Handles multiple client communications simultaneously | Risk of missing deliverables or SLA breaches | Urgency radar alerts when high-value client emails go unanswered past SLA thresholds. |

---

## 4. Key Functional Requirements (FR)

### 4.1 AI Email Ingestion & Parsing
- **FR-1.1**: Connect to standard email providers via OAuth2 (Gmail, Outlook) and IMAP/SMTP.
- **FR-1.2**: Support simulated ingestion / sample email feeds for offline/demo operation.
- **FR-1.3**: Sanitize HTML, parse multipart MIME bodies, extract attachments metadata and quoted thread history.

### 4.2 Machine Learning & NLP Categorization
- **FR-2.1 Dynamic Taxonomy**: Classify emails into categories:
  - `High Priority / Urgent`
  - `Action Required`
  - `General Discussion / Work`
  - `Financial / Invoices`
  - `Investor / Client`
  - `Automated / CI/CD Notifications`
  - `Newsletters / Marketing`
- **FR-2.2 Multi-Factor Urgency Scoring (0–100)**:
  - Urgency determined by deadline proximity, sender VIP status, action verbs, and tone sentiment.
  - Urgency levels: `Critical (90-100)`, `High (75-89)`, `Medium (40-74)`, `Low (0-39)`.

### 4.3 Intelligent Summarization & Key Takeaways
- **FR-3.1**: Generate 2-sentence executive summaries for individual emails and multi-message threads.
- **FR-3.2**: Extract 3–5 bulleted "Key Takeaways" with bolded entity tags (Dates, Dollar amounts, Deliverables).

### 4.4 Automated Action Item & Task Extraction
- **FR-4.1**: Detect actionable commitments using NLP dependency parsing and LLM zero-shot extraction.
- **FR-4.2**: Extract task metadata: Title, Due Date/Time, Inferred Priority (`Urgent`, `High`, `Medium`, `Low`), Assignee, and source email link.
- **FR-4.3**: Task Management Board supporting status workflows: `Pending` ➔ `In Progress` ➔ `Completed`.

### 4.5 Contextual Smart Reply Engine
- **FR-5.1**: Generate 2–3 contextual reply variations per email thread.
- **FR-5.2 Tone Selector**:
  - *Professional & Affirmative*
  - *Friendly & Collaborative*
  - *Concise & Direct*
  - *Executive / Formal*
- **FR-5.3**: Support custom instruction injection (e.g., "Tell them I can only meet on Friday at 3 PM").

### 4.6 Analytics & Productivity Insights Dashboard
- **FR-6.1**: Real-time Inbox Health Score (0–100%).
- **FR-6.2**: Metrics on Total Emails Processed, Pending Tasks, Urgency Distribution, and AI Hours Saved.
- **FR-6.3**: Email Velocity trends over time (Hourly, Daily, Weekly).

---

## 5. Non-Functional Requirements (NFR)

### 5.1 Performance & Latency
- **NFR-1.1**: Email list rendering under 100ms for up to 5,000 cached messages.
- **NFR-1.2**: AI Sifting / analysis response time $\le 1.8\text{s}$ using Gemini 2.5 Flash / streaming.
- **NFR-1.3**: Heuristic fallback execution time $\le 25\text{ms}$ when offline.

### 5.2 Security & Privacy
- **NFR-2.1**: Zero-storage option for sensitive email bodies (process-in-memory only).
- **NFR-2.2**: End-to-end TLS 1.3 encryption in transit; AES-256 for persistent database storage.
- **NFR-2.3**: JWT token expiration (24h) with secure HTTP-only cookies / Authorization headers.
- **NFR-2.4**: Strict data minimization; no email content used for public model training without explicit consent.

### 5.3 Reliability & Availability
- **NFR-3.1**: 99.9% uptime for backend API endpoints.
- **NFR-3.2**: Graceful offline degradation with local heuristic fallback engine.

### 5.4 Usability & Accessibility
- **NFR-4.1**: Modern glassmorphic Dark/Light interface compliant with WCAG 2.1 AA standards.
- **NFR-4.2**: Full keyboard navigation support (`j`/`k` for email navigation, `e` to archive, `s` to sift).

---

## 6. Success Metrics & KPIs
- **Daily Active Users (DAU) / Monthly Active Users (MAU) Ratio**: $\ge 60\%$
- **Average Time Saved Per User**: $\ge 45\text{ minutes/day}$
- **Action Item Conversion Rate**: $\ge 35\%$ of high-priority emails converted to tracked tasks
- **Smart Reply Acceptance Rate**: $\ge 70\%$ of replies dispatched with $\le 20\%$ edit distance
- **Classification Accuracy**: $\ge 96\%$ user agreement with AI urgency badges
