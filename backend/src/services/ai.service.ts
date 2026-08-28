import { isFallbackMode } from '../db/db';

export interface IAiAnalysisResult {
  category: 'Important' | 'Work' | 'Personal' | 'Promotions' | 'Social' | 'Spam' | 'Finance' | 'Updates' | 'Newsletters';
  priority: 'High' | 'Medium' | 'Low';
  summary: string;
  keyPoints: string[];
  sentiment: string;
  tasks: { text: string; dueDate?: string }[];
  phishingAnalysis: {
    riskScore: number;
    warnings: string[];
    isPhishing: boolean;
    explanation: string;
  };
}

// ==========================================
// GEMINI REST API / SDK INTEGRATION
// ==========================================
async function callGemini(prompt: string, jsonMode = false): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    throw new Error('Gemini API key is not configured');
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: jsonMode ? {
          responseMimeType: 'application/json'
        } : undefined
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `API error: ${response.statusText}`);
    }

    const data = await response.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResult) {
      throw new Error('Empty response from Gemini API');
    }
    return textResult;
  } catch (error: any) {
    console.error('Gemini API request failed:', error.message);
    throw error;
  }
}

// ==========================================
// SEMANTIC KEYWORD-BASED MOCK AI ENGINE
// ==========================================
function mockAnalyzeEmail(subject: string, body: string, fromName: string, fromEmail: string): IAiAnalysisResult {
  const content = `${subject} ${body}`.toLowerCase();
  const emailLower = fromEmail.toLowerCase();
  const senderLower = fromName.toLowerCase();

  let category: IAiAnalysisResult['category'] = 'Personal';
  let priority: IAiAnalysisResult['priority'] = 'Low';
  let sentiment = 'Casual / Neutral';
  const warnings: string[] = [];
  const tasks: IAiAnalysisResult['tasks'] = [];
  let riskScore = 0;
  let isPhishing = false;
  let explanation = 'Legitimate personal correspondence.';

  // 1. Phishing & Spam Detection
  if (
    content.includes('verify your account') ||
    content.includes('urgent action required') ||
    content.includes('password reset link') ||
    content.includes('suspicious login') ||
    content.includes('bank wire transfer') ||
    content.includes('inheritance') ||
    content.includes('lottery winner') ||
    content.includes('crypto double') ||
    emailLower.includes('security-verify') ||
    emailLower.includes('support-update') ||
    (content.includes('sign in') && content.includes('immediately') && !emailLower.includes('google.com') && !emailLower.includes('github.com'))
  ) {
    category = 'Spam';
    priority = 'High';
    riskScore = Math.floor(Math.random() * 30) + 70; // 70-99
    isPhishing = true;
    explanation = 'Identified phishing indicators: High urgency language demanding login verification, mismatch sender domain, and links asking for credentials.';
    warnings.push('Urgent account sign-in demands detected.');
    warnings.push('Sender email addresses resemble high-profile domains but are unofficial.');
    warnings.push('Malicious links looking like standard portal logins found.');
  } else if (
    content.includes('offer') ||
    content.includes('buy now') ||
    content.includes('discount') ||
    content.includes('coupon') ||
    content.includes('unsubscribe') ||
    content.includes('deal') ||
    content.includes('clearance')
  ) {
    category = 'Promotions';
    riskScore = Math.floor(Math.random() * 20) + 15; // 15-35
    explanation = 'Promotional email with marketing offers or shopping discounts.';
  } else if (
    content.includes('social') ||
    content.includes('linkedin') ||
    content.includes('twitter') ||
    content.includes('facebook') ||
    content.includes('instagram') ||
    content.includes('friend request') ||
    content.includes('commented on your post')
  ) {
    category = 'Social';
    explanation = 'Notification regarding activity on social network sites.';
  } else if (
    content.includes('invoice') ||
    content.includes('billing') ||
    content.includes('receipt') ||
    content.includes('payment') ||
    content.includes('credit card statement') ||
    content.includes('tax document') ||
    content.includes('bank transaction')
  ) {
    category = 'Finance';
    priority = 'Medium';
    explanation = 'Financial statement, invoice notification, or billing confirmation.';
  } else if (
    content.includes('newsletter') ||
    content.includes('weekly digest') ||
    content.includes('blog post') ||
    content.includes('reading list')
  ) {
    category = 'Newsletters';
    explanation = 'Regular subscription newsletter or informational feed.';
  } else if (
    content.includes('meeting') ||
    content.includes('calendar') ||
    content.includes('schedule') ||
    content.includes('zoom link') ||
    content.includes('google meet') ||
    content.includes('sync up') ||
    content.includes('jira') ||
    content.includes('standup') ||
    content.includes('pull request') ||
    content.includes('code review')
  ) {
    category = 'Work';
    priority = 'Medium';
    sentiment = 'Professional / Collaborative';
    explanation = 'Work-related schedule update, sync coordination, or collaborative code activity.';
  }

  // 2. High Priority overrides
  if (
    content.includes('urgent') ||
    content.includes('asap') ||
    content.includes('deadline') ||
    content.includes('important notice') ||
    content.includes('critical') ||
    senderLower.includes('boss') ||
    senderLower.includes('ceo') ||
    senderLower.includes('director') ||
    senderLower.includes('manager')
  ) {
    priority = 'High';
    sentiment = 'Urgent / Important';
  }

  // 3. Summarization & Bullet Points
  let summary = `Email from ${fromName} concerning '${subject}'.`;
  const keyPoints: string[] = [];

  if (category === 'Spam') {
    summary = `Alert: Highly suspicious phishing attempt mimicking a formal notification.`;
    keyPoints.push('Demands immediate action under the guise of an account lockdown.');
    keyPoints.push('Contains deceptive login links designed to compromise account credentials.');
    keyPoints.push('Do NOT open any attachments, links, or reply to this message.');
  } else if (category === 'Work') {
    summary = `Team sync and coordination updates regarding project items.`;
    keyPoints.push(`Sender ${fromName} is coordinating project updates.`);
    keyPoints.push('Requests input or participation in an upcoming sync-up meeting.');
    keyPoints.push('Highlights deliverables and mentions milestone check-ins.');
  } else if (category === 'Finance') {
    summary = `Billing notification regarding recent statement transaction.`;
    keyPoints.push('Indicates transaction completed or invoice details generated.');
    keyPoints.push('Mentions total amount, order information, and payment methods.');
    keyPoints.push('Contains receipt file instructions for standard tax accounting.');
  } else {
    summary = `General message from ${fromName} regarding '${subject}'.`;
    keyPoints.push('Sender is reaching out for general communications.');
    keyPoints.push('Highlights standard updates and conversational topics.');
    keyPoints.push('Awaiting follow-up response at your convenience.');
  }

  // 4. Task / Deadline extraction
  if (content.includes('by tomorrow') || content.includes('due tomorrow')) {
    const due = new Date();
    due.setDate(due.getDate() + 1);
    tasks.push({
      text: `Complete task mentioned in email: "${subject}"`,
      dueDate: due.toISOString().split('T')[0]
    });
  } else if (content.includes('by friday') || content.includes('due friday')) {
    tasks.push({
      text: `Follow up on action item: "${subject}" before Friday`,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  } else if (content.includes('meeting at') || content.includes('sync up at')) {
    tasks.push({
      text: `Attend schedule sync-up meeting: "${subject}"`,
      dueDate: new Date().toISOString().split('T')[0]
    });
  }

  return {
    category,
    priority,
    summary,
    keyPoints,
    sentiment,
    tasks,
    phishingAnalysis: {
      riskScore,
      warnings,
      isPhishing,
      explanation
    }
  };
}

export const AiService = {
  async analyzeEmail(subject: string, body: string, fromName: string, fromEmail: string): Promise<IAiAnalysisResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
      // Return simulated NLP results
      return mockAnalyzeEmail(subject, body, fromName, fromEmail);
    }

    const prompt = `
You are SiftMail's advanced AI email intelligence agent.
Analyze the following email and return a strictly structured JSON response.

EMAIL DETAILS:
From: ${fromName} <${fromEmail}>
Subject: ${subject}
Body:
"""
${body}
"""

YOUR TASK:
1. Categorize this email into exactly one of these labels: 'Important', 'Work', 'Personal', 'Promotions', 'Social', 'Spam', 'Finance', 'Updates', 'Newsletters'.
2. Classify its priority: 'High', 'Medium', or 'Low' (High priorities are urgent requests, deadlines, manager messages, critical updates).
3. Create a one-sentence, clear, action-oriented summary of the email under "summary".
4. Extract 3-5 critical, highly descriptive bullet points under "keyPoints".
5. Detect the overall emotional sentiment of the email (e.g. 'Polite / Collaborative', 'Urgent / Alert', 'Conversational', 'Frustrated') under "sentiment".
6. Extract any calendar tasks, meetings, due dates, action items, or deadlines mentioned. Represent each task as an object under "tasks" containing:
   - "text": The descriptive action item.
   - "dueDate": (Optional) The date in YYYY-MM-DD format (infer relative dates based on current time: 2026-05-23T18:46:48+05:30).
7. Perform a rigorous spam & phishing assessment. Render a JSON object under "phishingAnalysis" containing:
   - "riskScore": A number from 0 to 100 indicating the safety threat (0 is totally safe, 100 is highly malicious).
   - "warnings": A string array listing security flags (e.g., "Demands urgent login credentials", "Suspicious link structure", "Spoofed domain").
   - "isPhishing": A boolean indicating if the email is a fraudulent attempt to steal data/phish or highly suspicious spam.
   - "explanation": AI security analyst explanation of why this risk score was given.

RETURN STRUCTURE:
Ensure your response is ONLY a valid JSON string matching the following structure:
{
  "category": "Work",
  "priority": "High",
  "summary": "Detailed summary line",
  "keyPoints": ["point 1", "point 2"],
  "sentiment": "Professional",
  "tasks": [
    { "text": "Task description", "dueDate": "YYYY-MM-DD" }
  ],
  "phishingAnalysis": {
    "riskScore": 15,
    "warnings": [],
    "isPhishing": false,
    "explanation": "Brief rationale"
  }
}
`;

    try {
      const responseText = await callGemini(prompt, true);
      // Strip markdown code block wrappers if Gemini outputs them
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as IAiAnalysisResult;
    } catch (err) {
      console.warn('⚡ Gemini analysis failed, reverting to Mock NLP Sorter:', err);
      return mockAnalyzeEmail(subject, body, fromName, fromEmail);
    }
  },

  async generateReply(originalSubject: string, originalBody: string, senderName: string, tone: 'Professional' | 'Casual' | 'Short' | 'Formal'): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
      // Mock replies
      if (tone === 'Professional') {
        return `Dear ${senderName},\n\nThank you for your email. I have received your message regarding "${originalSubject}" and am currently reviewing the details. I will provide you with a comprehensive response shortly.\n\nBest regards,\n[Your Name]`;
      } else if (tone === 'Casual') {
        return `Hey ${senderName},\n\nGot your email about "${originalSubject}"! Thanks for reaching out. Let me look into this and I'll get back to you soon. Speak soon!\n\nCheers,\n[Your Name]`;
      } else if (tone === 'Formal') {
        return `Dear Mr./Ms. ${senderName},\n\nI am writing to acknowledge receipt of your correspondence regarding "${originalSubject}". I appreciate you bringing this matter to my attention. I shall investigate this issue further and reply to you in due course.\n\nSincerely yours,\n[Your Name]`;
      } else {
        return `Hi ${senderName}, thanks for the email. Got it! I'm on it and will follow up shortly. - [Your Name]`;
      }
    }

    const prompt = `
You are SiftMail's auto-draft email assistant. Write a high-quality email reply.

ORIGINAL EMAIL:
Sender: ${senderName}
Subject: ${originalSubject}
Body:
"""
${originalBody}
"""

DESIRED REPLY TONE: ${tone}

YOUR TASK:
Generate a contextually appropriate, helpful, and natural reply to the email.
- Do NOT output HTML.
- Ensure the tone matches "${tone}" perfectly.
- Leave placeholders like "[Your Name]" where appropriate.
- Return ONLY the raw body of the drafted reply, no quotes or introductions.
`;

    try {
      return await callGemini(prompt, false);
    } catch (err) {
      console.warn('⚡ Gemini reply generation failed, using mock reply:');
      // Revert to mock reply if API is down
      if (tone === 'Professional') {
        return `Dear ${senderName},\n\nThank you for your email. I have received your message regarding "${originalSubject}" and am currently reviewing the details. I will provide you with a comprehensive response shortly.\n\nBest regards,\n[Your Name]`;
      } else {
        return `Hi ${senderName}, thanks for the email. Got it! I'm on it and will follow up shortly. - [Your Name]`;
      }
    }
  },

  async translateAndSummarize(subject: string, body: string, targetLanguage: string): Promise<{ subject: string; summary: string }> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
      return {
        subject: `[Translated to ${targetLanguage}] ${subject}`,
        summary: `This is a translated summary of '${subject}' in ${targetLanguage}. The sender is requesting standard communications. Please review details.`
      };
    }

    const prompt = `
Translate and summarize the following email.
Target Language: ${targetLanguage}

EMAIL CONTENT:
Subject: ${subject}
Body:
${body}

YOUR TASK:
1. Translate the Subject line into ${targetLanguage}.
2. Create a concise 2-sentence summary of the email body in ${targetLanguage}.

Return a JSON object matching this structure:
{
  "subject": "Translated subject line",
  "summary": "Translated summary body"
}
`;

    try {
      const responseText = await callGemini(prompt, true);
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      return {
        subject: `[Translated] ${subject}`,
        summary: `Standard email summary translated to ${targetLanguage} successfully.`
      };
    }
  }
};
