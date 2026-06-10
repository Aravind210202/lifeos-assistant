import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, reminders, notes, transactions, budgets, goals, jobApplications, personalMemory, llmInteractions, notifications, notificationPreferences } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ REMINDERS ============

export async function getUserReminders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reminders).where(eq(reminders.userId, userId)).orderBy(desc(reminders.dueDate));
}

export async function getOverdueReminders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reminders).where(
    and(eq(reminders.userId, userId), eq(reminders.isOverdue, true), eq(reminders.isCompleted, false))
  ).orderBy(asc(reminders.dueDate));
}

export async function getTodayReminders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return db.select().from(reminders).where(
    and(eq(reminders.userId, userId), gte(reminders.dueDate, today), lte(reminders.dueDate, tomorrow))
  ).orderBy(asc(reminders.dueDate));
}

// ============ NOTES ============

export async function getUserNotes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.createdAt));
}

export async function searchNotes(userId: number, query: string) {
  const db = await getDb();
  if (!db) return [];
  // Simple search - can be enhanced with full-text search
  return db.select().from(notes).where(
    and(eq(notes.userId, userId))
  ).orderBy(desc(notes.createdAt));
}

// ============ TRANSACTIONS & FINANCE ============

export async function getUserTransactions(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(transactions).where(eq(transactions.userId, userId));
  
  if (startDate && endDate) {
    query = db.select().from(transactions).where(
      and(eq(transactions.userId, userId), gte(transactions.date, startDate), lte(transactions.date, endDate))
    );
  }
  
  return query.orderBy(desc(transactions.date));
}

export async function getMonthlyExpenses(userId: number, year: number, month: number) {
  const db = await getDb();
  if (!db) return [];
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  return db.select().from(transactions).where(
    and(
      eq(transactions.userId, userId),
      eq(transactions.type, 'expense'),
      gte(transactions.date, startDate),
      lte(transactions.date, endDate)
    )
  ).orderBy(desc(transactions.date));
}

export async function getMonthlyIncome(userId: number, year: number, month: number) {
  const db = await getDb();
  if (!db) return [];
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  return db.select().from(transactions).where(
    and(
      eq(transactions.userId, userId),
      eq(transactions.type, 'income'),
      gte(transactions.date, startDate),
      lte(transactions.date, endDate)
    )
  ).orderBy(desc(transactions.date));
}

export async function getUserBudgets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(budgets).where(eq(budgets.userId, userId));
}

// ============ GOALS ============

export async function getUserGoals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.deadline));
}

export async function getActiveGoals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(goals).where(
    and(eq(goals.userId, userId), eq(goals.status, 'active'))
  ).orderBy(desc(goals.deadline));
}

// ============ JOB APPLICATIONS ============

export async function getUserJobApplications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobApplications).where(eq(jobApplications.userId, userId)).orderBy(desc(jobApplications.createdAt));
}

export async function getJobApplicationsByStatus(userId: number, status: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobApplications).where(
    and(eq(jobApplications.userId, userId), eq(jobApplications.status, status as any))
  ).orderBy(desc(jobApplications.createdAt));
}

export async function getUpcomingFollowUps(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const today = new Date();
  return db.select().from(jobApplications).where(
    and(eq(jobApplications.userId, userId), gte(jobApplications.followUpDate, today))
  ).orderBy(asc(jobApplications.followUpDate));
}

// ============ PERSONAL MEMORY ============

export async function getUserMemory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(personalMemory).where(eq(personalMemory.userId, userId));
}

export async function getMemoryByType(userId: number, type: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(personalMemory).where(
    and(eq(personalMemory.userId, userId), eq(personalMemory.type, type as any))
  );
}

export async function getEnabledMemory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(personalMemory).where(
    and(eq(personalMemory.userId, userId), eq(personalMemory.isEnabled, true))
  );
}

// ============ LLM INTERACTIONS ============

export async function getUserLLMInteractions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(llmInteractions).where(eq(llmInteractions.userId, userId)).orderBy(desc(llmInteractions.createdAt));
}

export async function getApprovedLLMInteractions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(llmInteractions).where(
    and(eq(llmInteractions.userId, userId), eq(llmInteractions.isApproved, true))
  ).orderBy(desc(llmInteractions.createdAt));
}

// ============ NOTIFICATIONS ============

export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}

export async function getUnreadNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(
    and(eq(notifications.userId, userId), eq(notifications.isRead, false))
  ).orderBy(desc(notifications.createdAt));
}

export async function getUserNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ============ INITIALIZATION ============

export async function initializeUserNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await getUserNotificationPreferences(userId);
  if (existing) return existing;
  
  return db.insert(notificationPreferences).values({
    userId,
    reminderOverdue: true,
    deadlineUpcoming: true,
    jobFollowup: true,
    budgetWarning: true,
    goalMilestone: true,
    pushNotifications: true,
    emailNotifications: false,
  });
}
