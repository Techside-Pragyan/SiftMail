import { Server } from 'socket.io';
import { DbManager } from '../db/db';
import { AiService } from './ai.service';
import { IEmail, ITask, ICalendarEvent, INotification, IAnalytics } from '../db/models';

let io: Server;
let syncInterval: NodeJS.Timeout | null = null;

// ==========================================
// MOCK EMAIL GENERATION POOL
// ==========================================
const mockEmailPool = [
  {
    fromName: "Google DeepMind Careers",
    fromEmail: "careers@deepmind-recruiting.com",
    subject: "Pragyan: Update on your Research Engineer application!",
    body: "Hi Pragyan,\n\nWe have reviewed your GitHub profile and your recent SiftMail repository, and we are absolutely blown away! Our team at Google DeepMind would love to invite you for an interview. We are looking to sync up this Friday at 3:00 PM EST.\n\nCould you please let us know if you are available? You can join via this Google Meet link: https://meet.google.com/deepmind-interview.\n\nBest regards,\nSarah Jenkins\nSenior Recruiting Lead, DeepMind"
  },
  {
    fromName: "Chase Security Team",
    fromEmail: "security-verify@chase-portal-alert.com",
    subject: "URGENT: Suspicious transaction detected in your account!",
    body: "Dear Valued Customer,\n\nOur system detected an unusual sign-in attempt from an unknown IP address in Moscow, Russia. A bank wire transfer of $8,500.00 is currently pending in your account.\n\nIf you did not authorize this, you must click the link below immediately to verify your identity and cancel the transfer:\n\nhttp://chase-secure-account-verification.com/login?client=siftmail\n\nFailure to act within 2 hours will result in permanent account locking.\n\nThank you,\nChase Fraud Protection Services"
  },
  {
    fromName: "David Chen (Tech Lead)",
    fromEmail: "david.chen@siftmail.ai",
    subject: "URGENT: Pull Request #145 review required before Friday release",
    body: "Hey Team,\n\nI just pushed the initial socket connection framework for SiftMail. We need this tested and merged before Friday so we can push to production on Render.\n\nPlease review the PR at your earliest convenience: https://github.com/SiftMail/pulls/145. Let me know if you spot any leaks in the mongoose fallback connections.\n\nThanks,\nDavid"
  },
  {
    fromName: "Stripe Billing",
    fromEmail: "invoice+siftmail@stripe.com",
    subject: "Stripe Invoice #2026-9908 - Paid Successfully",
    body: "Thank you for your payment!\n\nYour credit card has been successfully charged $49.00 USD for the SiftMail AI Premium Subscription (Monthly Tier).\n\nInvoice Number: #2026-9908\nPayment Method: Visa ending in 4242\nBilling Cycle: May 23, 2026 - June 23, 2026\n\nYou can access your PDF statement here: https://dashboard.stripe.com/receipts/siftmail-9908.\n\nStripe Inc., 354 Oyster Point Blvd, South San Francisco, CA"
  },
  {
    fromName: "Alex Mercer",
    fromEmail: "alex.mercer@gmail.com",
    subject: "Are we still on for Saturday night dinner?",
    body: "Hey buddy!\n\nJust checking in if we are still on for dinner this Saturday at 7:30 PM. I was thinking we should try that new futuristic cyber-fusion bistro downtown. Let me know by tomorrow if that works for you so I can grab a reservation!\n\nAlso, did you finish that voice transcription feature? Can't wait to see it.\n\nTalk soon,\nAlex"
  },
  {
    fromName: "Product Hunt Daily",
    fromEmail: "hello@producthunt.com",
    subject: "Top Products of the Week: Meet SiftMail AI!",
    body: "Welcome to Product Hunt Daily!\n\nToday, we are showcasing 'SiftMail AI', an absolute game-changer in the productivity space! Built on Next.js, Framer Motion, and Gemini, it brings deep-space glassmorphic UI design to inbox organization.\n\nUpvote SiftMail AI and check out the creator discussion: https://producthunt.com/posts/siftmail-ai.\n\nOther notable launches:\n- CodeGlow: Glow themes for VSCode\n- Vocalist: Full speech-to-text API builder"
  },
  {
    fromName: "AWS Cloud Operations",
    fromEmail: "no-reply@amazon.com",
    subject: "Monthly AWS Budget Alert: Actual costs exceeded threshold",
    body: "You are receiving this notification because your AWS Monthly budget 'SiftMail-Compute-Budget' has exceeded its threshold of $150.00.\n\nActual Cost: $187.35 USD\nForecasted Cost: $210.00 USD\nRegion: us-east-1 (N. Virginia)\n\nWe recommend auditing your running EC2 instances and caching your Gemini API routes to prevent unnecessary traffic over-allocations.\n\nAWS Billing Console: https://console.aws.amazon.com/billing"
  }
];

// Initialize the WebSocket sync engine
export function initSyncEngine(socketIo: Server) {
  io = socketIo;
  console.log('⚡ Real-Time Sync Engine Initialized.');
}

// Pre-populate inbox with mock data on user registration
export async function prePopulateInbox(userId: string) {
  try {
    // Clear any existing emails for this mock user to prevent pollution
    await DbManager.emails.deleteMany({ userId });
    await DbManager.tasks.deleteMany({ userId });
    await DbManager.events.deleteMany({ userId });
    await DbManager.notifications.deleteMany({ userId });
    await DbManager.analytics.deleteMany({ userId });

    console.log(`🧹 Pre-populating fresh database for user: ${userId}`);

    // Create 6 base emails
    const activeEmails: IEmail[] = [];
    for (let i = 0; i < mockEmailPool.length - 1; i++) {
      const mock = mockEmailPool[i];
      const result = await AiService.analyzeEmail(mock.subject, mock.body, mock.fromName, mock.fromEmail);

      const emailData: IEmail = {
        userId,
        messageId: `msg_${Math.random().toString(36).substring(2, 10)}`,
        from: { name: mock.fromName, email: mock.fromEmail },
        to: ['user@siftmail.ai'],
        subject: mock.subject,
        body: mock.body,
        date: new Date(Date.now() - (i + 1) * 3 * 3600 * 1000), // staggered hours ago
        category: result.category,
        priority: result.priority,
        isRead: i > 1, // first two are unread
        starred: i === 0 || i === 3,
        archived: false,
        summary: result.summary,
        keyPoints: result.keyPoints,
        sentiment: result.sentiment,
        phishingAnalysis: result.phishingAnalysis
      };

      const saved = await DbManager.emails.create(emailData);
      activeEmails.push(saved);

      // Save tasks
      if (result.tasks && result.tasks.length > 0) {
        for (const task of result.tasks) {
          await DbManager.tasks.create({
            userId,
            emailId: saved._id || saved.id || '',
            text: task.text,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            completed: false
          });
        }
      }

      // If it contains a meeting, add calendar event
      if (mock.body.toLowerCase().includes('meeting') || mock.body.toLowerCase().includes('sync up')) {
        const start = new Date();
        start.setDate(start.getDate() + 2); // 2 days in future
        start.setHours(15, 0, 0, 0); // 3:00 PM
        const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

        await DbManager.events.create({
          userId,
          emailId: saved._id || saved.id || '',
          title: `Interview: ${mock.fromName}`,
          description: `Extracted from email: "${mock.subject}"`,
          start,
          end,
          location: 'Google Meet / Zoom'
        });
      }

      // Add high risk phishing notification
      if (result.phishingAnalysis.isPhishing) {
        await DbManager.notifications.create({
          userId,
          title: '🚨 Phishing Alert Detected',
          message: `SiftMail AI detected a phishing attempt from "${mock.fromName}".`,
          type: 'security',
          emailId: saved._id || saved.id || ''
        });
      }
    }

    // Recompute Analytics
    await refreshAnalytics(userId);
    console.log('✅ Inbox pre-population complete.');
  } catch (error) {
    console.error('Error pre-populating inbox:', error);
  }
}

// Recalculates category distributions and response metrics
export async function refreshAnalytics(userId: string): Promise<IAnalytics> {
  const emails = await DbManager.emails.find({ userId });
  const totalEmails = emails.length;
  const spamBlocked = emails.filter(e => e.category === 'Spam').length;

  const categoryCounts = {
    Important: 0, Work: 0, Personal: 0, Promotions: 0, Social: 0, Spam: 0, Finance: 0, Updates: 0, Newsletters: 0
  };

  emails.forEach(e => {
    if (categoryCounts[e.category] !== undefined) {
      categoryCounts[e.category]++;
    } else {
      categoryCounts.Personal++;
    }
  });

  const responseRate = Math.floor(Math.random() * 15) + 75; // 75% - 90%
  const averageResponseTime = Math.floor(Math.random() * 20) + 12; // 12m - 32m
  const productivityScore = Math.floor(((totalEmails - spamBlocked) / (totalEmails || 1)) * 40 + (responseRate * 0.6));

  const weeklyActivity = [
    { day: 'Mon', emailsReceived: Math.floor(Math.random() * 12) + 15, emailsReplied: Math.floor(Math.random() * 8) + 10 },
    { day: 'Tue', emailsReceived: Math.floor(Math.random() * 15) + 20, emailsReplied: Math.floor(Math.random() * 10) + 15 },
    { day: 'Wed', emailsReceived: Math.floor(Math.random() * 10) + 22, emailsReplied: Math.floor(Math.random() * 12) + 14 },
    { day: 'Thu', emailsReceived: Math.floor(Math.random() * 8) + 18, emailsReplied: Math.floor(Math.random() * 7) + 12 },
    { day: 'Fri', emailsReceived: Math.floor(Math.random() * 15) + 25, emailsReplied: Math.floor(Math.random() * 15) + 18 },
    { day: 'Sat', emailsReceived: Math.floor(Math.random() * 5) + 5, emailsReplied: Math.floor(Math.random() * 4) + 3 },
    { day: 'Sun', emailsReceived: Math.floor(Math.random() * 6) + 8, emailsReplied: Math.floor(Math.random() * 5) + 5 }
  ];

  const updated = await DbManager.analytics.findOneAndUpdate(
    { userId },
    {
      $set: {
        totalEmails,
        spamBlocked,
        responseRate,
        averageResponseTime,
        productivityScore,
        categoryCounts,
        weeklyActivity
      }
    },
    { upsert: true, new: true }
  );

  return updated!;
}

// Start background simulation stream
export function startSimulationStream(userId: string) {
  if (syncInterval) {
    clearInterval(syncInterval);
  }

  console.log(`⏰ Starting real-time email synchronization feed for user: ${userId}`);

  // Schedule a new email arriving every 45 seconds
  syncInterval = setInterval(async () => {
    try {
      const randomMock = mockEmailPool[Math.floor(Math.random() * mockEmailPool.length)];
      const result = await AiService.analyzeEmail(randomMock.subject, randomMock.body, randomMock.fromName, randomMock.fromEmail);

      const emailData: IEmail = {
        userId,
        messageId: `msg_${Math.random().toString(36).substring(2, 10)}`,
        from: { name: randomMock.fromName, email: randomMock.fromEmail },
        to: ['user@siftmail.ai'],
        subject: randomMock.subject,
        body: randomMock.body,
        date: new Date(),
        category: result.category,
        priority: result.priority,
        isRead: false,
        starred: false,
        archived: false,
        summary: result.summary,
        keyPoints: result.keyPoints,
        sentiment: result.sentiment,
        phishingAnalysis: result.phishingAnalysis
      };

      const savedEmail = await DbManager.emails.create(emailData);

      // Extract tasks
      if (result.tasks && result.tasks.length > 0) {
        for (const task of result.tasks) {
          await DbManager.tasks.create({
            userId,
            emailId: savedEmail._id || savedEmail.id || '',
            text: task.text,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            completed: false
          });
        }
      }

      // If it contains a meeting, schedule a calendar event
      if (randomMock.body.toLowerCase().includes('meeting') || randomMock.body.toLowerCase().includes('sync up')) {
        const start = new Date();
        start.setDate(start.getDate() + 1); // 1 day in future
        start.setHours(11, 0, 0, 0); // 11:00 AM
        const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 min duration

        await DbManager.events.create({
          userId,
          emailId: savedEmail._id || savedEmail.id || '',
          title: `Sync: ${randomMock.fromName}`,
          description: `Extracted from live stream email: "${randomMock.subject}"`,
          start,
          end,
          location: 'Remote Link'
        });
      }

      // Generate a security alert notification if phishing
      if (result.phishingAnalysis.isPhishing) {
        await DbManager.notifications.create({
          userId,
          title: '🚨 Urgent Threat Blocked',
          message: `Security detected phishing attempt from ${randomMock.fromName}. Details are archived in Security Hub.`,
          type: 'security',
          emailId: savedEmail._id || savedEmail.id || ''
        });
      } else if (savedEmail.priority === 'High') {
        await DbManager.notifications.create({
          userId,
          title: '🔥 High Priority Email',
          message: `New urgent email from ${savedEmail.from.name}: "${savedEmail.subject}"`,
          type: 'urgent',
          emailId: savedEmail._id || savedEmail.id || ''
        });
      }

      // Update and refresh stats
      const analytics = await refreshAnalytics(userId);

      // Emit Live WebSockets Events!
      if (io) {
        io.to(userId).emit('new_email', savedEmail);
        
        if (result.phishingAnalysis.isPhishing) {
          io.to(userId).emit('new_notification', {
            title: '🚨 Urgent Threat Blocked',
            message: `Security alert for: "${savedEmail.subject}"`,
            type: 'security'
          });
        } else if (savedEmail.priority === 'High') {
          io.to(userId).emit('new_notification', {
            title: '🔥 High Priority Email',
            message: `From: ${savedEmail.from.name}`,
            type: 'urgent'
          });
        }
        
        io.to(userId).emit('analytics_update', analytics);
      }

      // Trigger Smart Auto-Responder if user preference has it enabled
      const user = await DbManager.users.findById(userId);
      if (user?.preferences?.autoResponderEnabled && savedEmail.category !== 'Spam' && savedEmail.category !== 'Promotions') {
        setTimeout(async () => {
          const autoReplyDraft = await AiService.generateReply(
            savedEmail.subject,
            savedEmail.body,
            savedEmail.from.name,
            'Professional'
          );

          // In standard operation, auto-responder would email this out.
          // We will store it as an automatic AI reply draft inside the email.
          const draftWithAuto = {
            id: `rep_${Math.random().toString(36).substring(2, 10)}`,
            tone: 'Professional' as const,
            body: `[Auto-Responder Sent]\n\n${user.preferences.autoResponderTemplate || autoReplyDraft}`,
            createdAt: new Date()
          };

          const currentReplies = savedEmail.aiReplies || [];
          await DbManager.emails.findByIdAndUpdate(savedEmail._id || savedEmail.id || '', {
            aiReplies: [...currentReplies, draftWithAuto]
          });

          if (io) {
            io.to(userId).emit('email_updated', {
              emailId: savedEmail._id || savedEmail.id,
              update: { aiReplies: [...currentReplies, draftWithAuto] }
            });
            io.to(userId).emit('new_notification', {
              title: '🤖 Auto-Responder Sent',
              message: `Auto-replied to ${savedEmail.from.name}`,
              type: 'general'
            });
          }
        }, 5000); // Send auto-response draft 5 seconds later
      }

    } catch (err) {
      console.error('Error in simulation sync stream:', err);
    }
  }, 45000);
}

// Stop background simulation stream
export function stopSimulationStream() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('⏰ Real-Time Sync Stream Stopped.');
  }
}
