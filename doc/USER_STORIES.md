# SiftMail — User Stories & Acceptance Criteria

---

## Epic 1: Intelligent Email Sifting & Urgency Scoring

### Story 1.1: Automatic Urgency & Sentiment Scoring
- **As a** busy software engineer or founder,
- **I want** incoming emails to be automatically analyzed for urgency and sentiment,
- **So that** I can immediately prioritize mission-critical client/investor requests over routine notification noise.
- **Story Points**: 5 | **Priority**: P0 (Must-Have)

#### Acceptance Criteria (Gherkin Syntax):
```gherkin
Scenario: Email received with critical deadline keywords
  Given an incoming email with subject "URGENT: Sign-off by 2 PM"
  When the SiftMail AI engine processes the email
  Then the email urgency badge should display "CRITICAL"
  And the urgency score should be >= 90
  And the email should be highlighted with a red glow border in the inbox list.

Scenario: Routine newsletter received
  Given an incoming email with subject "Weekly Tech Roundup Newsletter"
  When the SiftMail AI engine processes the email
  Then the urgency badge should display "LOW"
  And the urgency score should be <= 30.
```

---

### Story 1.2: Executive Summary & Key Takeaways Extraction
- **As an** executive or manager,
- **I want** to see a 2-sentence TL;DR summary and bulleted takeaways for any long email thread,
- **So that** I don't have to read through pages of back-and-forth messages to understand the bottom line.
- **Story Points**: 5 | **Priority**: P0 (Must-Have)

#### Acceptance Criteria:
```gherkin
Scenario: Viewing an email with multiple paragraphs
  Given an email thread containing over 300 words
  When the user selects the email from the inbox list
  Then the AI Sifter panel should display an "Executive Summary" card
  And the card should contain 2 to 4 bulleted "Key Takeaways"
  And each key takeaway should highlight key deliverables, deadlines, or stakeholder requests.
```

---

## Epic 2: Automated Action Item & Task Extraction

### Story 2.1: Extract Actionable Commitments to Kanban Board
- **As a** knowledge worker,
- **I want** questions and tasks assigned to me in emails to be automatically converted into tracked Kanban cards,
- **So that** no task falls through the cracks or requires manual copy-pasting into task managers.
- **Story Points**: 8 | **Priority**: P0 (Must-Have)

#### Acceptance Criteria:
```gherkin
Scenario: Sifting an email with explicit requests
  Given an email body containing "Could you please verify sheet 3 and send the PDF by 2 PM"
  When the email is analyzed by SiftMail
  Then 2 distinct action items should be generated in the Tasks store
  And the tasks should automatically link back to the source email ID and sender
  And the tasks should appear in the "Pending" column on the Action Kanban Board.

Scenario: User moves task to In Progress or Done
  Given an extracted task in the "Pending" column
  When the user clicks "Start" or drags to "In Progress"
  Then the task status should update to "in_progress"
  And the analytics pending count should decrement in real-time.
```

---

## Epic 3: AI Contextual Smart Reply Engine

### Story 3.1: Multi-Tone Reply Generation
- **As a** professional communicating with diverse stakeholders,
- **I want** to generate high-quality email replies in selectable tones (Professional, Friendly, Concise, Formal),
- **So that** I can respond appropriately in seconds with minimal typing.
- **Story Points**: 5 | **Priority**: P1 (High)

#### Acceptance Criteria:
```gherkin
Scenario: Generating a concise affirmative reply
  Given an open email from a client requesting a budget sign-off
  When the user opens the Smart Reply modal and selects the "Concise" tone
  Then a draft response confirming receipt and deadline commitment should be generated
  And the user should be able to edit the text before copying or sending.

Scenario: Ingesting custom user guidance
  Given the user enters custom guidance "Tell them I can only do Friday at 4 PM"
  When the user clicks "Regenerate Draft"
  Then the generated reply should incorporate the Friday 4 PM constraint accurately.
```

---

## Epic 4: Productivity & Inbox Analytics

### Story 4.1: Inbox Health & AI Hours Saved Visualization
- **As a** team lead or productivity enthusiast,
- **I want** to track my inbox health score, urgency distribution, and estimated hours saved by AI,
- **So that** I can quantify my communication efficiency gains.
- **Story Points**: 3 | **Priority**: P1 (High)

#### Acceptance Criteria:
```gherkin
Scenario: Viewing the Analytics Dashboard
  Given the user navigates to the Analytics tab
  Then the system should display:
    | Metric | Expected Value |
    | Inbox Health Score | Percentage (0 - 100%) |
    | Total Emails Processed | Numeric count |
    | Time Saved by AI | Formatted hours / minutes |
    | Urgency Breakdown | Breakdown of Critical, High, Medium, Low |
    | Weekly Velocity Chart | 7-day bar chart showing daily volumes |
```
