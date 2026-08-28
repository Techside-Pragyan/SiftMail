import mongoose, { Schema, Document } from 'mongoose';

// ==========================================
// 1. USER INTERFACE & SCHEMA
// ==========================================
export interface IUser {
  _id?: string;
  id?: string; // fallback string
  email: string;
  password?: string;
  name: string;
  avatar?: string;
  googleId?: string;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    autoResponderEnabled: boolean;
    autoResponderTemplate: string;
    notificationsEnabled: boolean;
  };
  emailSettings?: {
    imapHost?: string;
    imapPort?: number;
    imapUser?: string;
    imapPassword?: string;
  };
  createdAt?: Date;
}

export interface IUserDocument extends IUser, Document {}

export const UserSchema = new Schema<IUserDocument>({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  avatar: { type: String },
  googleId: { type: String },
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
    language: { type: String, default: 'English' },
    autoResponderEnabled: { type: Boolean, default: false },
    autoResponderTemplate: { type: String, default: '' },
    notificationsEnabled: { type: Boolean, default: true }
  },
  emailSettings: {
    imapHost: { type: String },
    imapPort: { type: Number },
    imapUser: { type: String },
    imapPassword: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

// ==========================================
// 2. EMAIL INTERFACE & SCHEMA
// ==========================================
export interface IEmail {
  _id?: string;
  id?: string;
  userId: string;
  messageId: string;
  from: {
    name: string;
    email: string;
  };
  to: string[];
  subject: string;
  body: string;
  date: Date;
  category: 'Important' | 'Work' | 'Personal' | 'Promotions' | 'Social' | 'Spam' | 'Finance' | 'Updates' | 'Newsletters';
  priority: 'High' | 'Medium' | 'Low';
  isRead: boolean;
  starred: boolean;
  archived: boolean;
  summary?: string;
  keyPoints?: string[];
  sentiment?: string;
  phishingAnalysis?: {
    riskScore: number; // 0 - 100
    warnings: string[];
    isPhishing: boolean;
    explanation: string;
  };
  aiReplies?: {
    id: string;
    tone: 'Professional' | 'Casual' | 'Short' | 'Formal';
    body: string;
    createdAt: Date;
  }[];
  extractedTasks?: {
    text: string;
    dueDate?: Date;
  }[];
}

export interface IEmailDocument extends IEmail, Document {}

export const EmailSchema = new Schema<IEmailDocument>({
  userId: { type: String, required: true },
  messageId: { type: String, required: true, unique: true },
  from: {
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  to: [{ type: String }],
  subject: { type: String, required: true },
  body: { type: String, required: true },
  date: { type: Date, default: Date.now },
  category: { type: String, required: true, index: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium', index: true },
  isRead: { type: Boolean, default: false },
  starred: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
  summary: { type: String },
  keyPoints: [{ type: String }],
  sentiment: { type: String },
  phishingAnalysis: {
    riskScore: { type: Number, default: 0 },
    warnings: [{ type: String }],
    isPhishing: { type: Boolean, default: false },
    explanation: { type: String }
  },
  aiReplies: [{
    id: { type: String },
    tone: { type: String },
    body: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  extractedTasks: [{
    text: { type: String },
    dueDate: { type: Date }
  }]
});

// ==========================================
// 3. TASK INTERFACE & SCHEMA
// ==========================================
export interface ITask {
  _id?: string;
  id?: string;
  userId: string;
  emailId: string;
  text: string;
  dueDate?: Date;
  completed: boolean;
  createdAt?: Date;
}

export interface ITaskDocument extends ITask, Document {}

export const TaskSchema = new Schema<ITaskDocument>({
  userId: { type: String, required: true, index: true },
  emailId: { type: String, required: true },
  text: { type: String, required: true },
  dueDate: { type: Date },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// ==========================================
// 4. CALENDAR EVENT INTERFACE & SCHEMA
// ==========================================
export interface ICalendarEvent {
  _id?: string;
  id?: string;
  userId: string;
  emailId?: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  createdAt?: Date;
}

export interface ICalendarEventDocument extends ICalendarEvent, Document {}

export const CalendarEventSchema = new Schema<ICalendarEventDocument>({
  userId: { type: String, required: true, index: true },
  emailId: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  location: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// ==========================================
// 5. NOTIFICATION INTERFACE & SCHEMA
// ==========================================
export interface INotification {
  _id?: string;
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'urgent' | 'meeting' | 'deadline' | 'security' | 'general';
  isRead: boolean;
  emailId?: string;
  createdAt?: Date;
}

export interface INotificationDocument extends INotification, Document {}

export const NotificationSchema = new Schema<INotificationDocument>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  emailId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// ==========================================
// 6. ANALYTICS INTERFACE & SCHEMA
// ==========================================
export interface IAnalytics {
  _id?: string;
  id?: string;
  userId: string;
  totalEmails: number;
  spamBlocked: number;
  responseRate: number; // percentage
  averageResponseTime: number; // in minutes
  productivityScore: number; // 0 - 100
  categoryCounts: {
    Important: number;
    Work: number;
    Personal: number;
    Promotions: number;
    Social: number;
    Spam: number;
    Finance: number;
    Updates: number;
    Newsletters: number;
  };
  weeklyActivity: {
    day: string; // "Mon", "Tue", etc.
    emailsReceived: number;
    emailsReplied: number;
  }[];
  updatedAt?: Date;
}

export interface IAnalyticsDocument extends IAnalytics, Document {}

export const AnalyticsSchema = new Schema<IAnalyticsDocument>({
  userId: { type: String, required: true, unique: true },
  totalEmails: { type: Number, default: 0 },
  spamBlocked: { type: Number, default: 0 },
  responseRate: { type: Number, default: 0 },
  averageResponseTime: { type: Number, default: 0 },
  productivityScore: { type: Number, default: 0 },
  categoryCounts: {
    Important: { type: Number, default: 0 },
    Work: { type: Number, default: 0 },
    Personal: { type: Number, default: 0 },
    Promotions: { type: Number, default: 0 },
    Social: { type: Number, default: 0 },
    Spam: { type: Number, default: 0 },
    Finance: { type: Number, default: 0 },
    Updates: { type: Number, default: 0 },
    Newsletters: { type: Number, default: 0 }
  },
  weeklyActivity: [{
    day: { type: String, required: true },
    emailsReceived: { type: Number, default: 0 },
    emailsReplied: { type: Number, default: 0 }
  }],
  updatedAt: { type: Date, default: Date.now }
});

// ==========================================
// MONGOOSE MODELS COMPILATION (WITH TRY/CATCH FALLBACK)
// ==========================================
export let UserModel: mongoose.Model<IUserDocument>;
export let EmailModel: mongoose.Model<IEmailDocument>;
export let TaskModel: mongoose.Model<ITaskDocument>;
export let CalendarEventModel: mongoose.Model<ICalendarEventDocument>;
export let NotificationModel: mongoose.Model<INotificationDocument>;
export let AnalyticsModel: mongoose.Model<IAnalyticsDocument>;

try {
  UserModel = mongoose.model<IUserDocument>('User', UserSchema);
  EmailModel = mongoose.model<IEmailDocument>('Email', EmailSchema);
  TaskModel = mongoose.model<ITaskDocument>('Task', TaskSchema);
  CalendarEventModel = mongoose.model<ICalendarEventDocument>('CalendarEvent', CalendarEventSchema);
  NotificationModel = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
  AnalyticsModel = mongoose.model<IAnalyticsDocument>('Analytics', AnalyticsSchema);
} catch (e) {
  // If mongoose is not initialized or compiles during compilation checks
  UserModel = (mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema)) as mongoose.Model<IUserDocument>;
  EmailModel = (mongoose.models.Email || mongoose.model<IEmailDocument>('Email', EmailSchema)) as mongoose.Model<IEmailDocument>;
  TaskModel = (mongoose.models.Task || mongoose.model<ITaskDocument>('Task', TaskSchema)) as mongoose.Model<ITaskDocument>;
  CalendarEventModel = (mongoose.models.CalendarEvent || mongoose.model<ICalendarEventDocument>('CalendarEvent', CalendarEventSchema)) as mongoose.Model<ICalendarEventDocument>;
  NotificationModel = (mongoose.models.Notification || mongoose.model<INotificationDocument>('Notification', NotificationSchema)) as mongoose.Model<INotificationDocument>;
  AnalyticsModel = (mongoose.models.Analytics || mongoose.model<IAnalyticsDocument>('Analytics', AnalyticsSchema)) as mongoose.Model<IAnalyticsDocument>;
}
