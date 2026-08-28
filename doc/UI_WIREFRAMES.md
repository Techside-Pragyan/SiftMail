# SiftMail — UI & Wireframe Specifications

---

## 1. Visual Design System & Design Tokens

SiftMail utilizes a high-contrast, modern glassmorphic Dark Theme designed for reduced cognitive load and rapid visual scanning.

### 1.1 Color Palette Tokens

```css
:root {
  /* Surface & Background */
  --bg-primary: #0b0f19;       /* Deep space navy-black */
  --bg-secondary: #111827;     /* Dark obsidian panel */
  --bg-tertiary: #1f2937;      /* Muted card surface */
  --bg-glass: rgba(17, 24, 39, 0.75); /* Glassmorphic panel */
  --border-glass: rgba(255, 255, 255, 0.08);

  /* Primary & Accent Branding */
  --accent-purple: #8b5cf6;    /* SiftMail Violet */
  --accent-blue: #3b82f6;      /* Electric Cyan-Blue */
  --accent-gradient: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);

  /* Urgency & Status Indicators */
  --urgency-critical: #ef4444; /* Vivid Red */
  --urgency-high: #f97316;     /* Amber Orange */
  --urgency-medium: #eab308;   /* Warm Yellow */
  --urgency-low: #10b981;      /* Emerald Green */

  /* Text & Typography */
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
}
```

---

## 2. Global Layout Architecture

```
+------------------------------------------------------------------------------------------------------+
| [SiftMail Logo]  | Search emails, tasks, senders... [Q] | [AI Status: Online] | [👤 Pragyan P.]       |
+------------------------------------------------------------------------------------------------------+
| SIDEBAR          | MAIN CONTENT VIEW AREA                                                            |
|                  |                                                                                   |
| 📥 Inbox (4)     |  [ Tab Navigation: 📬 All Emails | 🧠 AI Sifter | 📋 Action Board | 📊 Analytics ]|
| ⭐ Starred (2)   | +-------------------------------------------------------------------------------+ |
| 🏷️ High Urgency  | |                                                                               | |
| 📋 Tasks (4)     | |  [ Dynamic View Content ]                                                     | |
| 📊 Analytics     | |                                                                               | |
| ⚙️ Settings      | |                                                                               | |
|                  | |                                                                               | |
| ──────────────── | |                                                                               | |
| [⚡ Sift All]    | +-------------------------------------------------------------------------------+ |
+------------------------------------------------------------------------------------------------------+
```

---

## 3. Screen Wireframes

### 3.1 Screen 1: Inbox & Split Email Reader

```
+---------------------------------------------+--------------------------------------------------------+
| EMAIL LIST PANEL (Width: 42%)               | EMAIL DETAIL & AI SUMMARY PANEL (Width: 58%)          |
| [Search...] [Filter: Urgent | Work | All]   |                                                        |
+---------------------------------------------+--------------------------------------------------------+
| 🔴 Sarah Jenkins          35m ago           | Subject: URGENT: Client Review Q3 Roadmap             |
| URGENT: Client Review Q3 Roadmap            | From: Sarah Jenkins <sarah.j@acmepartners.com>         |
| Hi team, we need the updated Q3 budget...   | Date: Today, 3:45 PM                                   |
| [CRITICAL 94] [3 Tasks]                     | ------------------------------------------------------ |
|---------------------------------------------| 🧠 AI SIFT SUMMARY                                     |
| 🟡 Devin Thorne            3h ago           | Sarah requires urgent verification of Q3 budget sheet  |
| Architecture Sync: GraphQL Migration        | line items before the 4:30 PM board meeting.           |
| Just reviewed the RFC for migrating...      |                                                        |
| [MEDIUM 58] [2 Tasks]                       | 🎯 KEY TAKEAWAYS                                       |
|---------------------------------------------| • Deadline: Send PDF export by 2:00 PM EST             |
| 🟠 Elena Rostova           7h ago           | • Action: Verify infrastructure line items in sheet 3. |
| Intro / Follow up: AI Product Demo Pitch    |                                                        |
| Great connecting with you at Demo Day...    | 📋 EXTRACTED ACTION ITEMS                              |
| [HIGH 88] [2 Tasks]                         | [✓] Verify infrastructure expenditure [Urgent]        |
|---------------------------------------------| [ ] Update slide 8 with enterprise leads [High]        |
| 🟢 GitHub Notifications    12h ago          | ------------------------------------------------------ |
| [Security Alert] 1 dependabot CVE           | FULL EMAIL BODY                                        |
| [LOW 25] [1 Task]                           | Hi Pragyan, I hope you are having a productive week... |
|                                             | [ ✍️ AI Smart Reply ] [ ➕ Add Task ] [ 🗑️ Archive ]   |
+---------------------------------------------+--------------------------------------------------------+
```

### 3.2 Screen 2: Action Items & Kanban Board

```
+------------------------------------------------------------------------------------------------------+
| ACTION ITEMS KANBAN BOARD                                              [+ New Custom Task] [Filter] |
+----------------------------------+----------------------------------+--------------------------------+
| 📌 PENDING (2)                   | ⏳ IN PROGRESS (1)               | ✅ COMPLETED (1)               |
+----------------------------------+----------------------------------+--------------------------------+
| [🔴 URGENT]                      | [🟠 HIGH PRIORITY]               | [🟡 MEDIUM]                    |
| Verify infrastructure expendi-   | Update slide 8 with onboarded    | Review benchmark stats and     |
| ture in Q3 budget sheet 3        | enterprise leads                 | cache comments on PR #142      |
| Due: Today, 1:30 PM              | Due: Today, 1:45 PM              | Completed: Today 11:20 AM      |
| Source: Sarah Jenkins (Email)    | Source: Sarah Jenkins (Email)    | Source: Devin Thorne (Email)   |
| [Start ->]                       | [Mark Done ->]                   | [Re-open]                      |
|                                  |                                  |                                |
| [🟠 HIGH PRIORITY]               |                                  |                                |
| Prepare updated SiftMail pitch   |                                  |                                |
| deck & financial projections     |                                  |                                |
| Due: Friday                      |                                  |                                |
| Source: Elena Rostova (Email)    |                                  |                                |
| [Start ->]                       |                                  |                                |
+----------------------------------+----------------------------------+--------------------------------+
```

### 3.3 Screen 3: Analytics & Productivity Dashboard

```
+------------------------------------------------------------------------------------------------------+
| 📊 INBOX HEALTH & AI PRODUCTIVITY METRICS                                                            |
+----------------------+----------------------+----------------------+---------------------------------+
| 💖 INBOX HEALTH      | 📬 EMAILS PROCESSED  | ⏳ TIME SAVED BY AI  | 📋 ACTION ITEMS PENDING        |
| 88%                  | 142                  | 4.2 Hours            | 3 Urgent / 2 Upcoming           |
| Optimal Triage Rate  | +18% this week       | ~28 min per workday  | 82% on-time completion          |
+----------------------+----------------------+----------------------+---------------------------------+
| URGENCY DISTRIBUTION                        | WEEKLY EMAIL VOLUME & PROCESSED VELOCITY               |
| [■ Critical: 14%]  [■ High: 28%]            | 40 |      *                                          |
| [■ Medium: 36%]    [■ Low: 22%]             | 30 |    * *   *                                      |
|                                             | 20 |  * * * * * *                                    |
| Average Urgency Score: 64/100               | 10 |  * * * * * * *                                  |
|                                             | 0  +-----------------                                |
|                                             |    Mon Tue Wed Thu Fri Sat Sun                       |
+---------------------------------------------+--------------------------------------------------------+
```

### 3.4 Screen 4: Smart Reply Composer Modal

```
+----------------------------------------------------------------------+
| ✍️ SiftMail AI Reply Assistant                         [X Close]    |
+----------------------------------------------------------------------+
| Replying to: Sarah Jenkins <sarah.j@acmepartners.com>                |
| Subject: Re: URGENT: Client Review Q3 Roadmap & Budget Sign-off      |
|                                                                      |
| Choose AI Tone:                                                      |
| [✨ Professional & Affirmative] [🤝 Friendly] [⚡ Concise] [👔 Formal]|
|                                                                      |
| Custom Guidance (Optional):                                          |
| [ e.g., Tell her I will finish slide 8 before 1:30 PM...           ] |
|                                                                      |
| Generated Response Preview:                                          |
| +------------------------------------------------------------------+ |
| | Hi Sarah,                                                        | |
| |                                                                  | |
| | I am already on it. I am verifying the sheet 3 line items now and| |
| | updating slide 8. You will receive the clean PDF export before   | |
| | 2:00 PM EST.                                                     | |
| |                                                                  | |
| | Best regards,                                                    | |
| | Pragyan Paramita                                                 | |
| +------------------------------------------------------------------+ |
|                                                                      |
| [📋 Copy to Clipboard]  [🔄 Regenerate Draft]   [🚀 Send Reply]      |
+----------------------------------------------------------------------+
```
