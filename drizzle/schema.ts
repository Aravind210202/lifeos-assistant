import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Reminders module - tracks tasks, todos, and reminders with recurring support
 */
export const reminders = mysqlTable("reminders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate"),
  category: mysqlEnum("category", ["University", "Career", "Finance", "Health", "Personal", "Life Admin"]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  isOverdue: boolean("isOverdue").default(false).notNull(),
  progress: int("progress").default(0).notNull(), // 0-100
  
  // Recurring support
  isRecurring: boolean("isRecurring").default(false).notNull(),
  recurringPattern: mysqlEnum("recurringPattern", ["daily", "weekly", "biweekly", "monthly", "yearly"]),
  recurringEndDate: timestamp("recurringEndDate"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;

/**
 * Notes module - stores quick notes, study notes, ideas, and life admin notes
 */
export const notes = mysqlTable("notes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: mysqlEnum("category", ["quick", "study", "ideas", "life_admin"]).default("quick").notNull(),
  tags: json("tags").$type<string[]>().default([]).notNull(), // JSON array of tags
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;

/**
 * Finance module - tracks income, expenses, and budget
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["income", "expense"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: mysqlEnum("category", ["Rent", "Groceries", "Transport", "Food", "Subscriptions", "Shopping", "Entertainment", "Study", "Travel", "Health", "Bills", "Other", "Salary", "Investment"]).notNull(),
  description: varchar("description", { length: 255 }),
  date: timestamp("date").notNull(),
  isRecurring: boolean("isRecurring").default(false).notNull(),
  recurringPattern: mysqlEnum("recurringPattern", ["daily", "weekly", "biweekly", "monthly", "yearly"]),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Budget tracking - monthly budgets by category
 */
export const budgets = mysqlTable("budgets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  category: mysqlEnum("category", ["Rent", "Groceries", "Transport", "Food", "Subscriptions", "Shopping", "Entertainment", "Study", "Travel", "Health", "Bills", "Other"]).notNull(),
  monthYear: varchar("monthYear", { length: 7 }).notNull(), // YYYY-MM format
  budgetAmount: decimal("budgetAmount", { precision: 10, scale: 2 }).notNull(),
  alertThreshold: int("alertThreshold").default(80).notNull(), // Alert at 80% by default
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;

/**
 * Goals module - tracks personal, career, fitness, finance, and university goals
 */
export const goals = mysqlTable("goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["University", "Career", "Fitness", "Finance", "Personal"]).notNull(),
  whyItMatters: text("whyItMatters"),
  progress: int("progress").default(0).notNull(), // 0-100
  nextAction: text("nextAction"),
  deadline: timestamp("deadline"),
  status: mysqlEnum("status", ["active", "paused", "completed", "abandoned"]).default("active").notNull(),
  milestones: json("milestones").$type<Array<{ title: string; completed: boolean; dueDate?: string }>>().default([]).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;

/**
 * Job Applications - tracks job applications with full pipeline
 */
export const jobApplications = mysqlTable("jobApplications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  jobLink: text("jobLink"),
  dateApplied: timestamp("dateApplied"),
  status: mysqlEnum("status", ["Saved", "Applying", "Applied", "Interview", "Offer", "Rejected"]).default("Saved").notNull(),
  followUpDate: timestamp("followUpDate"),
  resumeVersion: varchar("resumeVersion", { length: 100 }),
  coverLetterVersion: varchar("coverLetterVersion", { length: 100 }),
  interviewStages: json("interviewStages").$type<Array<{ stage: string; date?: string; notes?: string; completed: boolean }>>().default([]).notNull(),
  notes: text("notes"),
  outcome: text("outcome"),
  salary: varchar("salary", { length: 100 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = typeof jobApplications.$inferInsert;

/**
 * Personal Memory System - stores user preferences, answers, and recurring information
 */
export const personalMemory = mysqlTable("personalMemory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["resume_detail", "education", "work_history", "achievement", "preferred_answer", "salary_preference", "work_rights", "skill", "writing_tone", "recurring_info"]).notNull(),
  key: varchar("key", { length: 255 }).notNull(), // e.g., "education_degree", "preferred_answer_visa"
  value: text("value").notNull(),
  metadata: json("metadata").$type<Record<string, any>>().default({}).notNull(),
  isEnabled: boolean("isEnabled").default(true).notNull(),
  usageCount: int("usageCount").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PersonalMemory = typeof personalMemory.$inferSelect;
export type InsertPersonalMemory = typeof personalMemory.$inferInsert;

/**
 * LLM Interactions - tracks AI-generated content and approvals
 */
export const llmInteractions = mysqlTable("llmInteractions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["cover_letter", "resume", "job_scoring", "question_answer", "job_search"]).notNull(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  isApproved: boolean("isApproved").default(false).notNull(),
  approvedAt: timestamp("approvedAt"),
  relatedJobApplicationId: int("relatedJobApplicationId"),
  metadata: json("metadata").$type<Record<string, any>>().default({}).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LLMInteraction = typeof llmInteractions.$inferSelect;
export type InsertLLMInteraction = typeof llmInteractions.$inferInsert;

/**
 * Notifications - tracks notification preferences and history
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["reminder_overdue", "deadline_upcoming", "job_followup", "budget_warning", "goal_milestone"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  relatedId: int("relatedId"), // ID of related reminder, job app, etc.
  relatedType: varchar("relatedType", { length: 50 }), // "reminder", "job_application", "budget", etc.
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Notification Preferences - user settings for notifications
 */
export const notificationPreferences = mysqlTable("notificationPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  reminderOverdue: boolean("reminderOverdue").default(true).notNull(),
  deadlineUpcoming: boolean("deadlineUpcoming").default(true).notNull(),
  jobFollowup: boolean("jobFollowup").default(true).notNull(),
  budgetWarning: boolean("budgetWarning").default(true).notNull(),
  goalMilestone: boolean("goalMilestone").default(true).notNull(),
  pushNotifications: boolean("pushNotifications").default(true).notNull(),
  emailNotifications: boolean("emailNotifications").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = typeof notificationPreferences.$inferInsert;
