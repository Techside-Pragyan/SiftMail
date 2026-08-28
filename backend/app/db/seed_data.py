from datetime import datetime, timezone, timedelta

DEMO_USER_ID = "usr_demo_pragyan_01"
DEMO_USER_EMAIL = "pragyan@siftmail.ai"

now = datetime.now(timezone.utc)

SEED_EMAILS = [
  {
    "id": "em-001",
    "user_id": DEMO_USER_ID,
    "sender": "Sarah Jenkins",
    "sender_email": "sarah.j@acmepartners.com",
    "recipient": DEMO_USER_EMAIL,
    "subject": "URGENT: Client Review Q3 Roadmap & Budget Sign-off by EOD",
    "snippet": "Hi team, We need the updated Q3 budget spreadsheet and presentation slides finalized...",
    "body": """Hi Pragyan,

I hope you are having a productive week. 

Following up on our sprint review, we need the updated Q3 budget spreadsheet and presentation slides finalized before our meeting with the board today at 4:30 PM EST. 

Could you please:
1. Verify the infrastructure expenditure line items in sheet 3.
2. Update slide 8 with the newly onboarded enterprise leads.
3. Send me the PDF export by 2:00 PM EST so I can do a pre-read.

Let me know if there are any blockers or discrepancies.

Best regards,
Sarah Jenkins
VP of Operations, Acme Partners""",
    "folder": "inbox",
    "is_read": False,
    "is_starred": True,
    "received_at": now - timedelta(minutes=35),
    "tags": ["Work", "Urgent", "Budget"],
    "ai_analysis": {
      "urgency": "critical",
      "urgency_score": 94,
      "sentiment": "urgent",
      "summary": "Sarah requires urgent verification of Q3 budget sheet line items and slide 8 updates with a hard deadline of 2:00 PM EST for the pre-read before the 4:30 PM board meeting.",
      "key_takeaways": [
        "Deadline: Send PDF export by 2:00 PM EST today.",
        "Action: Review infrastructure line items in sheet 3.",
        "Action: Add new enterprise leads to slide 8.",
        "Board meeting is scheduled for 4:30 PM EST."
      ],
      "suggested_replies": [
        {
          "tone": "Professional & Affirmative",
          "text": "Hi Sarah, I am already on it. I am verifying the sheet 3 line items now and updating slide 8. You will receive the clean PDF export before 2:00 PM EST."
        },
        {
          "tone": "Concise",
          "text": "Received Sarah. Working on the updates now, PDF will be in your inbox before 2:00 PM EST."
        }
      ],
      "extracted_tasks": [
        {
          "title": "Verify infrastructure expenditure in Q3 budget sheet 3",
          "dueDate": "Today, 1:30 PM",
          "priority": "urgent"
        },
        {
          "title": "Update slide 8 with onboarded enterprise leads",
          "dueDate": "Today, 1:45 PM",
          "priority": "high"
        },
        {
          "title": "Export & email PDF pre-read to Sarah Jenkins",
          "dueDate": "Today, 2:00 PM",
          "priority": "urgent"
        }
      ]
    }
  },
  {
    "id": "em-002",
    "user_id": DEMO_USER_ID,
    "sender": "Devin Thorne",
    "sender_email": "devin@cloudscale.io",
    "recipient": DEMO_USER_EMAIL,
    "subject": "Architecture Sync: GraphQL Migration & Redis Caching Layer",
    "snippet": "Hey! Just reviewed the RFC for migrating our secondary REST endpoints to GraphQL...",
    "body": """Hey Pragyan,

Just reviewed the RFC for migrating our secondary REST endpoints to GraphQL and adding the Redis caching layer. 

The strategy looks solid overall. I left a few minor comments on GitHub regarding cache invalidation patterns and fallback resilience when the cluster scales down.

When you get a chance tomorrow, take a look at the benchmark numbers on PR #142 and let's hop on a quick 15-min huddle on Thursday morning to approve the rollout plan.

Cheers,
Devin""",
    "folder": "inbox",
    "is_read": True,
    "is_starred": False,
    "received_at": now - timedelta(hours=3),
    "tags": ["Engineering", "RFC"],
    "ai_analysis": {
      "urgency": "medium",
      "urgency_score": 58,
      "sentiment": "positive",
      "summary": "Devin approved the GraphQL & Redis RFC and requested a review of PR #142 benchmarks tomorrow followed by a 15-minute sync on Thursday.",
      "key_takeaways": [
        "RFC approved with minor caching comments on GitHub.",
        "Review benchmark numbers on PR #142 by tomorrow.",
        "Schedule 15-min sync for Thursday morning."
      ],
      "suggested_replies": [
        {
          "tone": "Friendly Engineering",
          "text": "Thanks Devin! I will check your notes on PR #142 tomorrow morning. Looking forward to connecting on Thursday to finalize the rollout."
        }
      ],
      "extracted_tasks": [
        {
          "title": "Review benchmark stats and cache comments on PR #142",
          "dueDate": "Tomorrow",
          "priority": "medium"
        },
        {
          "title": "Schedule 15-min sync with Devin for Thursday morning",
          "dueDate": "Thursday",
          "priority": "low"
        }
      ]
    }
  },
  {
    "id": "em-003",
    "user_id": DEMO_USER_ID,
    "sender": "Elena Rostova",
    "sender_email": "elena.rostova@venturecap.com",
    "recipient": DEMO_USER_EMAIL,
    "subject": "Intro / Follow up: AI Product Demo & Seed Round Pitch",
    "snippet": "Hi, Great meeting you at the AI Founders Demo Day last week. We were impressed...",
    "body": """Hi Pragyan,

Great connecting with you at the AI Founders Demo Day last week. Our investment committee was very impressed by SiftMail's agentic inbox triage capability and the automated action item extraction pipeline.

We would love to invite you to our partner meeting next Tuesday at 11:00 AM PST for a 30-minute deep dive into your product roadmap and traction metrics.

Please send over your latest pitch deck and financial projections ahead of time if possible.

Looking forward,
Elena Rostova
Partner, Apex Global Ventures""",
    "folder": "inbox",
    "is_read": True,
    "is_starred": True,
    "received_at": now - timedelta(hours=7),
    "tags": ["Investors", "Pitch", "High Priority"],
    "ai_analysis": {
      "urgency": "high",
      "urgency_score": 88,
      "sentiment": "positive",
      "summary": "Apex Global Ventures invited SiftMail to present at their partner meeting next Tuesday at 11:00 AM PST. They requested the pitch deck and traction metrics in advance.",
      "key_takeaways": [
        "Partner meeting invite: Tuesday at 11:00 AM PST (30 mins).",
        "Action item: Send updated pitch deck and financial metrics before Tuesday.",
        "High opportunity investor interest."
      ],
      "suggested_replies": [
        {
          "tone": "Executive & Enthusiastic",
          "text": "Hi Elena, Thank you for the invitation! I would be delighted to present to the partner team on Tuesday at 11:00 AM PST. I will share our latest pitch deck and traction sheet by Friday."
        }
      ],
      "extracted_tasks": [
        {
          "title": "Prepare updated SiftMail pitch deck & financial projections",
          "dueDate": "Friday",
          "priority": "high"
        },
        {
          "title": "Confirm partner meeting attendance for Tuesday 11 AM PST",
          "dueDate": "Today",
          "priority": "high"
        }
      ]
    }
  },
  {
    "id": "em-004",
    "user_id": DEMO_USER_ID,
    "sender": "GitHub Notifications",
    "sender_email": "notifications@github.com",
    "recipient": DEMO_USER_EMAIL,
    "subject": "[Security Alert] 1 dependabot vulnerability detected in siftmail-core",
    "snippet": "A vulnerability in axios package was detected in repository...",
    "body": """Dependabot detected 1 vulnerability in siftmail-core repository:
- Package: axios (<1.7.4)
- Severity: Moderate (CVE-2024-39338)
- Recommended fix: Bump axios to version 1.7.4 or later.

A pull request has been automatically created: PR #88.""",
    "folder": "inbox",
    "is_read": False,
    "is_starred": False,
    "received_at": now - timedelta(hours=12),
    "tags": ["Security", "Automated"],
    "ai_analysis": {
      "urgency": "medium",
      "urgency_score": 62,
      "sentiment": "neutral",
      "summary": "Moderate security alert in axios package detected by Dependabot with automated PR #88 available.",
      "key_takeaways": [
        "Moderate severity CVE-2024-39338 in axios.",
        "PR #88 is ready for merge."
      ],
      "suggested_replies": [],
      "extracted_tasks": [
        {
          "title": "Review and merge Dependabot security PR #88 for axios",
          "dueDate": "This Week",
          "priority": "medium"
        }
      ]
    }
  }
]

SEED_TASKS = [
  {
    "id": "tsk-101",
    "user_id": DEMO_USER_ID,
    "title": "Verify infrastructure expenditure in Q3 budget sheet 3",
    "due_date": "Today, 1:30 PM",
    "priority": "urgent",
    "status": "pending",
    "source_email_id": "em-001",
    "source_subject": "URGENT: Client Review Q3 Roadmap & Budget Sign-off",
    "created_at": now - timedelta(minutes=30)
  },
  {
    "id": "tsk-102",
    "user_id": DEMO_USER_ID,
    "title": "Update slide 8 with onboarded enterprise leads",
    "due_date": "Today, 1:45 PM",
    "priority": "high",
    "status": "in_progress",
    "source_email_id": "em-001",
    "source_subject": "URGENT: Client Review Q3 Roadmap & Budget Sign-off",
    "created_at": now - timedelta(minutes=30)
  },
  {
    "id": "tsk-103",
    "user_id": DEMO_USER_ID,
    "title": "Prepare updated SiftMail pitch deck & financial projections",
    "due_date": "Friday",
    "priority": "high",
    "status": "pending",
    "source_email_id": "em-003",
    "source_subject": "Intro / Follow up: AI Product Demo & Seed Round Pitch",
    "created_at": now - timedelta(hours=6)
  },
  {
    "id": "tsk-104",
    "user_id": DEMO_USER_ID,
    "title": "Review benchmark stats and cache comments on PR #142",
    "due_date": "Tomorrow",
    "priority": "medium",
    "status": "completed",
    "source_email_id": "em-002",
    "source_subject": "Architecture Sync: GraphQL Migration & Redis Caching Layer",
    "created_at": now - timedelta(hours=2),
    "completed_at": now - timedelta(minutes=15)
  }
]
