import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import {
  UserModel,
  EmailModel,
  TaskModel,
  CalendarEventModel,
  NotificationModel,
  AnalyticsModel,
  IUser,
  IEmail,
  ITask,
  ICalendarEvent,
  INotification,
  IAnalytics
} from './models';

const FALLBACK_FILE_PATH = path.join(__dirname, '../../db_fallback.json');

export let isFallbackMode = false;

// Default initial database structure for fallback mode
interface IFallbackDb {
  users: IUser[];
  emails: IEmail[];
  tasks: ITask[];
  events: ICalendarEvent[];
  notifications: INotification[];
  analytics: IAnalytics[];
}

const defaultFallbackDb: IFallbackDb = {
  users: [],
  emails: [],
  tasks: [],
  events: [],
  notifications: [],
  analytics: []
};

// Local cache for fallback mode
let fallbackCache: IFallbackDb = { ...defaultFallbackDb };

// Save fallback database to file
function saveFallbackDb() {
  try {
    fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(fallbackCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing fallback database file:', err);
  }
}

// Load fallback database from file
function loadFallbackDb() {
  try {
    if (fs.existsSync(FALLBACK_FILE_PATH)) {
      const data = fs.readFileSync(FALLBACK_FILE_PATH, 'utf-8');
      fallbackCache = JSON.parse(data);
      // Ensure all arrays exist
      fallbackCache.users = fallbackCache.users || [];
      fallbackCache.emails = fallbackCache.emails || [];
      fallbackCache.tasks = fallbackCache.tasks || [];
      fallbackCache.events = fallbackCache.events || [];
      fallbackCache.notifications = fallbackCache.notifications || [];
      fallbackCache.analytics = fallbackCache.analytics || [];
    } else {
      fallbackCache = { ...defaultFallbackDb };
      saveFallbackDb();
    }
  } catch (err) {
    console.error('Error reading fallback database file, using empty memory cache:', err);
    fallbackCache = { ...defaultFallbackDb };
  }
}

// MongoDB Connection Routine
export async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn('⚠️ MONGO_URI not found in environment variables. Running SiftMail in Persistence Fallback Mode (JSON File Store).');
    isFallbackMode = true;
    loadFallbackDb();
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000 // fail quickly (5s) to boot fallback mode
    });
    console.log('🔌 Connected to MongoDB Successfully!');
  } catch (error: any) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.warn('⚠️ Switching SiftMail to Persistence Fallback Mode (JSON File Store).');
    isFallbackMode = true;
    loadFallbackDb();
  }
}

// Helper to generate custom string IDs in fallback mode
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// ============================================================================
// DYNAMIC DATABASE WRAPPERS (DB MANAGER)
// ============================================================================
export const DbManager = {
  users: {
    async findOne(query: Partial<IUser>): Promise<IUser | null> {
      if (!isFallbackMode) {
        return await UserModel.findOne(query).lean();
      }
      return fallbackCache.users.find(u => {
        return Object.entries(query).every(([key, val]) => (u as any)[key] === val);
      }) || null;
    },
    async findById(id: string): Promise<IUser | null> {
      if (!isFallbackMode) {
        return await UserModel.findById(id).lean();
      }
      return fallbackCache.users.find(u => u.id === id || u._id === id) || null;
    },
    async create(data: IUser): Promise<IUser> {
      if (!isFallbackMode) {
        const doc = new UserModel(data);
        const res = await doc.save();
        return res.toObject();
      }
      const newUser: IUser = {
        ...data,
        id: generateId(),
        _id: generateId(),
        createdAt: new Date()
      };
      fallbackCache.users.push(newUser);
      saveFallbackDb();
      return newUser;
    },
    async findByIdAndUpdate(id: string, update: Partial<IUser>): Promise<IUser | null> {
      if (!isFallbackMode) {
        return await UserModel.findByIdAndUpdate(id, update, { new: true }).lean();
      }
      const idx = fallbackCache.users.findIndex(u => u.id === id || u._id === id);
      if (idx === -1) return null;
      fallbackCache.users[idx] = {
        ...fallbackCache.users[idx],
        ...update,
        preferences: {
          ...fallbackCache.users[idx].preferences,
          ...update.preferences
        }
      };
      saveFallbackDb();
      return fallbackCache.users[idx];
    }
  },

  emails: {
    async find(query: any = {}): Promise<IEmail[]> {
      if (!isFallbackMode) {
        return await EmailModel.find(query).sort({ date: -1 }).lean();
      }
      let list = [...fallbackCache.emails];
      if (query.userId) {
        list = list.filter(e => e.userId === query.userId);
      }
      if (query.category) {
        list = list.filter(e => e.category === query.category);
      }
      if (query.priority) {
        list = list.filter(e => e.priority === query.priority);
      }
      if (query.starred !== undefined) {
        list = list.filter(e => e.starred === query.starred);
      }
      if (query.archived !== undefined) {
        list = list.filter(e => e.archived === query.archived);
      }
      if (query.isRead !== undefined) {
        list = list.filter(e => e.isRead === query.isRead);
      }
      // Natural Language or search query processing
      if (query.$or) {
        list = list.filter(e => {
          return query.$or.some((subQuery: any) => {
            return Object.entries(subQuery).some(([key, regexObj]: [string, any]) => {
              const textVal = (e as any)[key];
              if (typeof textVal === 'string') {
                return regexObj.$regex ? new RegExp(regexObj.$regex, 'i').test(textVal) : textVal.includes(regexObj);
              }
              if (key === 'from.email' || key === 'from.name') {
                const subKey = key.split('.')[1];
                return regexObj.$regex ? new RegExp(regexObj.$regex, 'i').test(e.from[subKey as 'name' | 'email']) : e.from[subKey as 'name' | 'email'].includes(regexObj);
              }
              return false;
            });
          });
        });
      }
      return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    async findById(id: string): Promise<IEmail | null> {
      if (!isFallbackMode) {
        return await EmailModel.findById(id).lean();
      }
      return fallbackCache.emails.find(e => e.id === id || e._id === id) || null;
    },

    async create(data: IEmail): Promise<IEmail> {
      if (!isFallbackMode) {
        const doc = new EmailModel(data);
        const res = await doc.save();
        return res.toObject();
      }
      const newEmail: IEmail = {
        ...data,
        id: generateId(),
        _id: generateId(),
        date: data.date ? new Date(data.date) : new Date()
      };
      fallbackCache.emails.push(newEmail);
      saveFallbackDb();
      return newEmail;
    },

    async findByIdAndUpdate(id: string, update: Partial<IEmail>): Promise<IEmail | null> {
      if (!isFallbackMode) {
        return await EmailModel.findByIdAndUpdate(id, update, { new: true }).lean();
      }
      const idx = fallbackCache.emails.findIndex(e => e.id === id || e._id === id);
      if (idx === -1) return null;
      fallbackCache.emails[idx] = {
        ...fallbackCache.emails[idx],
        ...update,
        phishingAnalysis: update.phishingAnalysis ? {
          ...fallbackCache.emails[idx].phishingAnalysis,
          ...update.phishingAnalysis
        } as any : fallbackCache.emails[idx].phishingAnalysis
      };
      saveFallbackDb();
      return fallbackCache.emails[idx];
    },

    async deleteMany(query: any): Promise<{ deletedCount: number }> {
      if (!isFallbackMode) {
        const res = await EmailModel.deleteMany(query);
        return { deletedCount: res.deletedCount || 0 };
      }
      const originalCount = fallbackCache.emails.length;
      if (query.userId) {
        fallbackCache.emails = fallbackCache.emails.filter(e => e.userId !== query.userId);
      }
      saveFallbackDb();
      return { deletedCount: originalCount - fallbackCache.emails.length };
    }
  },

  tasks: {
    async find(query: any): Promise<ITask[]> {
      if (!isFallbackMode) {
        return await TaskModel.find(query).sort({ createdAt: -1 }).lean();
      }
      return fallbackCache.tasks
        .filter(t => t.userId === query.userId)
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    },
    async create(data: ITask): Promise<ITask> {
      if (!isFallbackMode) {
        const doc = new TaskModel(data);
        const res = await doc.save();
        return res.toObject();
      }
      const newTask: ITask = {
        ...data,
        id: generateId(),
        _id: generateId(),
        createdAt: new Date()
      };
      fallbackCache.tasks.push(newTask);
      saveFallbackDb();
      return newTask;
    },
    async findByIdAndUpdate(id: string, update: Partial<ITask>): Promise<ITask | null> {
      if (!isFallbackMode) {
        return await TaskModel.findByIdAndUpdate(id, update, { new: true }).lean();
      }
      const idx = fallbackCache.tasks.findIndex(t => t.id === id || t._id === id);
      if (idx === -1) return null;
      fallbackCache.tasks[idx] = { ...fallbackCache.tasks[idx], ...update };
      saveFallbackDb();
      return fallbackCache.tasks[idx];
    },
    async deleteMany(query: any): Promise<{ deletedCount: number }> {
      if (!isFallbackMode) {
        const res = await TaskModel.deleteMany(query);
        return { deletedCount: res.deletedCount || 0 };
      }
      const originalCount = fallbackCache.tasks.length;
      if (query.userId) {
        fallbackCache.tasks = fallbackCache.tasks.filter(t => t.userId !== query.userId);
      }
      saveFallbackDb();
      return { deletedCount: originalCount - fallbackCache.tasks.length };
    }
  },

  events: {
    async find(query: any): Promise<ICalendarEvent[]> {
      if (!isFallbackMode) {
        return await CalendarEventModel.find(query).sort({ start: 1 }).lean();
      }
      return fallbackCache.events
        .filter(e => e.userId === query.userId)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    },
    async create(data: ICalendarEvent): Promise<ICalendarEvent> {
      if (!isFallbackMode) {
        const doc = new CalendarEventModel(data);
        const res = await doc.save();
        return res.toObject();
      }
      const newEvent: ICalendarEvent = {
        ...data,
        id: generateId(),
        _id: generateId(),
        createdAt: new Date()
      };
      fallbackCache.events.push(newEvent);
      saveFallbackDb();
      return newEvent;
    },
    async deleteMany(query: any): Promise<{ deletedCount: number }> {
      if (!isFallbackMode) {
        const res = await CalendarEventModel.deleteMany(query);
        return { deletedCount: res.deletedCount || 0 };
      }
      const originalCount = fallbackCache.events.length;
      if (query.userId) {
        fallbackCache.events = fallbackCache.events.filter(e => e.userId !== query.userId);
      }
      saveFallbackDb();
      return { deletedCount: originalCount - fallbackCache.events.length };
    }
  },

  notifications: {
    async find(query: any): Promise<INotification[]> {
      if (!isFallbackMode) {
        return await NotificationModel.find(query).sort({ createdAt: -1 }).lean();
      }
      return fallbackCache.notifications
        .filter(n => n.userId === query.userId)
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    },
    async create(data: INotification): Promise<INotification> {
      if (!isFallbackMode) {
        const doc = new NotificationModel(data);
        const res = await doc.save();
        return res.toObject();
      }
      const newNotif: INotification = {
        ...data,
        id: generateId(),
        _id: generateId(),
        createdAt: new Date()
      };
      fallbackCache.notifications.push(newNotif);
      saveFallbackDb();
      return newNotif;
    },
    async findByIdAndUpdate(id: string, update: Partial<INotification>): Promise<INotification | null> {
      if (!isFallbackMode) {
        return await NotificationModel.findByIdAndUpdate(id, update, { new: true }).lean();
      }
      const idx = fallbackCache.notifications.findIndex(n => n.id === id || n._id === id);
      if (idx === -1) return null;
      fallbackCache.notifications[idx] = { ...fallbackCache.notifications[idx], ...update };
      saveFallbackDb();
      return fallbackCache.notifications[idx];
    },
    async deleteMany(query: any): Promise<{ deletedCount: number }> {
      if (!isFallbackMode) {
        const res = await NotificationModel.deleteMany(query);
        return { deletedCount: res.deletedCount || 0 };
      }
      const originalCount = fallbackCache.notifications.length;
      if (query.userId) {
        fallbackCache.notifications = fallbackCache.notifications.filter(n => n.userId !== query.userId);
      }
      saveFallbackDb();
      return { deletedCount: originalCount - fallbackCache.notifications.length };
    }
  },

  analytics: {
    async findOne(query: { userId: string }): Promise<IAnalytics | null> {
      if (!isFallbackMode) {
        return await AnalyticsModel.findOne(query).lean();
      }
      return fallbackCache.analytics.find(a => a.userId === query.userId) || null;
    },
    async create(data: IAnalytics): Promise<IAnalytics> {
      if (!isFallbackMode) {
        const doc = new AnalyticsModel(data);
        const res = await doc.save();
        return res.toObject();
      }
      const newAnalytics: IAnalytics = {
        ...data,
        id: generateId(),
        _id: generateId(),
        updatedAt: new Date()
      };
      fallbackCache.analytics.push(newAnalytics);
      saveFallbackDb();
      return newAnalytics;
    },
    async findOneAndUpdate(query: { userId: string }, update: any, options: { upsert: boolean; new: boolean }): Promise<IAnalytics | null> {
      if (!isFallbackMode) {
        return await AnalyticsModel.findOneAndUpdate(query, update, options).lean();
      }
      const idx = fallbackCache.analytics.findIndex(a => a.userId === query.userId);
      if (idx === -1) {
        if (options.upsert) {
          const defaultAnalytics: IAnalytics = {
            userId: query.userId,
            totalEmails: 0,
            spamBlocked: 0,
            responseRate: 0,
            averageResponseTime: 0,
            productivityScore: 0,
            categoryCounts: {
              Important: 0, Work: 0, Personal: 0, Promotions: 0, Social: 0, Spam: 0, Finance: 0, Updates: 0, Newsletters: 0
            },
            weeklyActivity: [
              { day: 'Mon', emailsReceived: 0, emailsReplied: 0 },
              { day: 'Tue', emailsReceived: 0, emailsReplied: 0 },
              { day: 'Wed', emailsReceived: 0, emailsReplied: 0 },
              { day: 'Thu', emailsReceived: 0, emailsReplied: 0 },
              { day: 'Fri', emailsReceived: 0, emailsReplied: 0 },
              { day: 'Sat', emailsReceived: 0, emailsReplied: 0 },
              { day: 'Sun', emailsReceived: 0, emailsReplied: 0 }
            ]
          };
          const created = await this.create({
            ...defaultAnalytics,
            ...update.$set,
            categoryCounts: {
              ...defaultAnalytics.categoryCounts,
              ...(update.$set?.categoryCounts || {})
            }
          });
          return created;
        }
        return null;
      }
      // Apply set updates
      const current = fallbackCache.analytics[idx];
      fallbackCache.analytics[idx] = {
        ...current,
        ...(update.$set || {}),
        categoryCounts: {
          ...current.categoryCounts,
          ...(update.$set?.categoryCounts || {})
        },
        updatedAt: new Date()
      };
      saveFallbackDb();
      return fallbackCache.analytics[idx];
    },
    async deleteMany(query: any): Promise<{ deletedCount: number }> {
      if (!isFallbackMode) {
        const res = await AnalyticsModel.deleteMany(query);
        return { deletedCount: res.deletedCount || 0 };
      }
      const originalCount = fallbackCache.analytics.length;
      if (query.userId) {
        fallbackCache.analytics = fallbackCache.analytics.filter(a => a.userId !== query.userId);
      }
      saveFallbackDb();
      return { deletedCount: originalCount - fallbackCache.analytics.length };
    }
  }
};
