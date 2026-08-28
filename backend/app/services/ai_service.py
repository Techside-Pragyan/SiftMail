import os
import json
import re
from typing import Optional, List
from app.core.config import settings
from app.schemas.ai import AIAnalysisSchema, UrgencyLevel, SuggestedReply, ExtractedTaskSchema

class AIService:
    @staticmethod
    async def analyze_email(subject: str, body: str, sender: str) -> AIAnalysisSchema:
        """
        Sift through email content using Gemini 2.5 Flash if API key configured,
        or fallback to native Python NLP heuristic analyzer.
        """
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        if api_key and api_key.strip() and api_key != "your_gemini_api_key_here":
            try:
                from google import genai
                client = genai.Client(api_key=api_key)
                prompt = f"""You are SiftMail AI, an executive email intelligence engine.
Analyze this email thoroughly and return a valid JSON object strictly matching this schema:
{{
  "urgency": "low" | "medium" | "high" | "critical",
  "urgencyScore": integer (0 to 100),
  "sentiment": "positive" | "neutral" | "urgent" | "frustrated" | "inquiry",
  "summary": "1-2 sentence executive TL;DR summary",
  "keyTakeaways": ["key takeaway 1", "key takeaway 2", ...],
  "suggestedReplies": [
    {{"tone": "Professional & Affirmative", "text": "draft reply..."}},
    {{"tone": "Concise", "text": "draft reply..."}}
  ],
  "extractedTasks": [
    {{"title": "action item", "dueDate": "optional deadline", "priority": "low" | "medium" | "high" | "urgent"}}
  ]
}}

Sender: {sender}
Subject: {subject}
Body:
{body}
"""
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config={"response_mime_type": "application/json"}
                )
                if response.text:
                    data = json.loads(response.text)
                    return AIAnalysisSchema.model_validate(data)
            except Exception as e:
                print(f"[AIService] Gemini API error: {e}, using heuristic fallback.")

        return AIService._heuristic_analyze(subject, body, sender)

    @staticmethod
    async def generate_reply(subject: str, body: str, sender: str, tone: str = "Professional", custom_notes: Optional[str] = None) -> str:
        """
        Generate contextual smart reply using Gemini 2.5 Flash or heuristic templates.
        """
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        if api_key and api_key.strip() and api_key != "your_gemini_api_key_here":
            try:
                from google import genai
                client = genai.Client(api_key=api_key)
                prompt = f"""You are SiftMail AI. Draft a high-quality email response to the following email.
Target Tone: {tone}
{f'Custom User Guidance: {custom_notes}' if custom_notes else ''}

Original Sender: {sender}
Subject: {subject}
Original Body:
{body}

Output only the formatted response text in markdown without conversational pleasantries."""
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                if response.text:
                    return response.text.strip()
            except Exception as e:
                print(f"[AIService] Gemini reply error: {e}, using heuristic draft.")

        return AIService._heuristic_reply(subject, body, sender, tone, custom_notes)

    @staticmethod
    def _heuristic_analyze(subject: str, body: str, sender: str) -> AIAnalysisSchema:
        combined = f"{subject} {body}".lower()

        # Urgency detection
        is_critical = any(kw in combined for kw in ["urgent", "asap", "eod", "immediately", "deadline", "emergency", "critical", "board meeting"])
        is_high = any(kw in combined for kw in ["today", "important", "priority", "review", "sign-off", "pitch", "investor"])
        is_security = any(kw in combined for kw in ["vulnerability", "security", "alert", "cve", "breach"])

        if is_critical:
            urgency = UrgencyLevel.CRITICAL
            urgency_score = 94
        elif is_high or is_security:
            urgency = UrgencyLevel.HIGH
            urgency_score = 82
        elif any(kw in combined for kw in ["fyi", "newsletter", "digest", "roundup", "weekly"]):
            urgency = UrgencyLevel.LOW
            urgency_score = 25
        else:
            urgency = UrgencyLevel.MEDIUM
            urgency_score = 60

        # Sentiment detection
        if any(kw in combined for kw in ["delighted", "impressed", "great", "excellent", "solid", "congrats"]):
            sentiment = "positive"
        elif is_critical:
            sentiment = "urgent"
        elif any(kw in combined for kw in ["delay", "issue", "blocker", "error", "failed", "discrepancy"]):
            sentiment = "frustrated"
        elif "?" in body:
            sentiment = "inquiry"
        else:
            sentiment = "neutral"

        # Action line extraction
        lines = [l.strip() for l in body.split("\n") if l.strip()]
        action_lines = []
        for line in lines:
            if re.match(r"^(\d+\.|\*|-|could you|please|we need|let's|verify|update|send)", line, re.IGNORECASE):
                cleaned = re.sub(r"^(\d+\.|\*|-)\s*", "", line)
                if len(cleaned) > 10:
                    action_lines.append(cleaned)

        key_takeaways = action_lines[:4]
        if not key_takeaways:
            key_takeaways = [
                f"Subject Focus: {subject}",
                f"From: {sender}",
                "Review message details for pending context."
            ]

        extracted_tasks: List[ExtractedTaskSchema] = []
        for item in key_takeaways[:3]:
            extracted_tasks.append(ExtractedTaskSchema(
                title=item if len(item) <= 90 else item[:87] + "...",
                dueDate="Today, EOD" if is_critical else "Upcoming",
                priority="urgent" if urgency == UrgencyLevel.CRITICAL else "high" if urgency == UrgencyLevel.HIGH else "medium"
            ))

        first_name = sender.split()[0] if sender else "there"
        suggested_replies = [
            SuggestedReply(
                tone="Professional & Affirmative",
                text=f"Hi {first_name},\n\nThank you for reaching out regarding \"{subject}\". I have reviewed the requirements and am actively coordinating the deliverables.\n\nBest regards,\nPragyan"
            ),
            SuggestedReply(
                tone="Concise",
                text=f"Hi {first_name}, received and noted. Looking into this right away and will follow up shortly."
            )
        ]

        return AIAnalysisSchema(
            urgency=urgency,
            urgencyScore=urgency_score,
            sentiment=sentiment,
            summary=f"Automated Sift: Email from {sender} concerning '{subject}'. Identified {len(extracted_tasks)} critical discussion points.",
            keyTakeaways=key_takeaways,
            suggestedReplies=suggested_replies,
            extractedTasks=extracted_tasks
        )

    @staticmethod
    def _heuristic_reply(subject: str, body: str, sender: str, tone: str, custom_notes: Optional[str]) -> str:
        first_name = sender.split()[0] if sender else "there"
        tone_lower = tone.lower()

        extra = f"\n\nNote: {custom_notes}" if custom_notes else ""

        if "urgent" in tone_lower or "concise" in tone_lower:
            return f"Hi {first_name},\n\nReceived and noted. I am addressing the key action items for \"{subject}\" right now and will update you shortly.{extra}\n\nBest,\nPragyan"
        elif "friendly" in tone_lower:
            return f"Hey {first_name},\n\nThanks for reaching out! This looks great. I'll review the details regarding \"{subject}\" and get back to you with next steps.{extra}\n\nHave a great week,\nPragyan"
        elif "formal" in tone_lower or "executive" in tone_lower:
            return f"Dear {first_name},\n\nThank you for your correspondence regarding \"{subject}\". I have noted the deliverables and our team is actively moving forward on the timeline.{extra}\n\nSincerely,\nPragyan Paramita"
        else:
            return f"Hi {first_name},\n\nThank you for the update. I have reviewed the details for \"{subject}\" and will follow up with the required deliverables on schedule.{extra}\n\nBest regards,\nPragyan"
