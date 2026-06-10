import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { reminders, notes, transactions, budgets, goals, jobApplications, personalMemory, llmInteractions, notifications } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ REMINDERS ============
  reminders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserReminders(ctx.user.id);
    }),

    today: protectedProcedure.query(async ({ ctx }) => {
      return db.getTodayReminders(ctx.user.id);
    }),

    overdue: protectedProcedure.query(async ({ ctx }) => {
      return db.getOverdueReminders(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.date().optional(),
        category: z.enum(["University", "Career", "Finance", "Health", "Personal", "Life Admin"]),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        isRecurring: z.boolean().default(false),
        recurringPattern: z.enum(["daily", "weekly", "biweekly", "monthly", "yearly"]).optional(),
        recurringEndDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const result = await database.insert(reminders).values({
          userId: ctx.user.id,
          ...input,
        });
        return result;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.date().optional(),
        category: z.enum(["University", "Career", "Finance", "Health", "Personal", "Life Admin"]).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        isCompleted: z.boolean().optional(),
        progress: z.number().min(0).max(100).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const { id, ...updates } = input;
        return database.update(reminders).set(updates).where(
          and(eq(reminders.id, id), eq(reminders.userId, ctx.user.id))
        );
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        return database.delete(reminders).where(
          and(eq(reminders.id, input.id), eq(reminders.userId, ctx.user.id))
        );
      }),
  }),

  // ============ NOTES ============
  notes: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserNotes(ctx.user.id);
    }),

    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.searchNotes(ctx.user.id, input.query);
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        category: z.enum(["quick", "study", "ideas", "life_admin"]).default("quick"),
        tags: z.array(z.string()).default([]),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        return database.insert(notes).values({
          userId: ctx.user.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        category: z.enum(["quick", "study", "ideas", "life_admin"]).optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const { id, ...updates } = input;
        return database.update(notes).set(updates).where(
          and(eq(notes.id, id), eq(notes.userId, ctx.user.id))
        );
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        return database.delete(notes).where(
          and(eq(notes.id, input.id), eq(notes.userId, ctx.user.id))
        );
      }),
  }),

  // ============ TRANSACTIONS & FINANCE ============
  finance: router({
    transactions: protectedProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return db.getUserTransactions(ctx.user.id, input.startDate, input.endDate);
      }),

    monthlyExpenses: protectedProcedure
      .input(z.object({ year: z.number(), month: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getMonthlyExpenses(ctx.user.id, input.year, input.month);
      }),

    monthlyIncome: protectedProcedure
      .input(z.object({ year: z.number(), month: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getMonthlyIncome(ctx.user.id, input.year, input.month);
      }),

    budgets: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserBudgets(ctx.user.id);
    }),

    addTransaction: protectedProcedure
      .input(z.object({
        type: z.enum(["income", "expense"]),
        amount: z.string(),
        category: z.string(),
        description: z.string().optional(),
        date: z.date(),
        isRecurring: z.boolean().default(false),
        recurringPattern: z.enum(["daily", "weekly", "biweekly", "monthly", "yearly"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        return database.insert(transactions).values({
          userId: ctx.user.id,
          type: input.type,
          amount: input.amount as any,
          category: input.category as any,
          description: input.description,
          date: input.date,
          isRecurring: input.isRecurring,
          recurringPattern: input.recurringPattern,
        });
      }),

    updateTransaction: protectedProcedure
      .input(z.object({
        id: z.number(),
        type: z.enum(["income", "expense"]).optional(),
        amount: z.string().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        date: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const { id, type, amount, category, description, date } = input;
        const updates: any = {};
        if (type !== undefined) updates.type = type;
        if (amount !== undefined) updates.amount = amount as any;
        if (category !== undefined) updates.category = category as any;
        if (description !== undefined) updates.description = description;
        if (date !== undefined) updates.date = date;
        
        return database.update(transactions).set(updates).where(
          and(eq(transactions.id, id), eq(transactions.userId, ctx.user.id))
        );
      }),

    deleteTransaction: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        return database.delete(transactions).where(
          and(eq(transactions.id, input.id), eq(transactions.userId, ctx.user.id))
        );
      }),

    setBudget: protectedProcedure
      .input(z.object({
        category: z.string(),
        monthYear: z.string(),
        budgetAmount: z.string(),
        alertThreshold: z.number().default(80),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        return database.insert(budgets).values({
          userId: ctx.user.id,
          category: input.category as any,
          monthYear: input.monthYear,
          budgetAmount: input.budgetAmount as any,
          alertThreshold: input.alertThreshold,
        });
      }),
  }),

  // ============ GOALS ============
  goals: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserGoals(ctx.user.id);
    }),

    active: protectedProcedure.query(async ({ ctx }) => {
      return db.getActiveGoals(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        category: z.enum(["University", "Career", "Fitness", "Finance", "Personal"]),
        whyItMatters: z.string().optional(),
        progress: z.number().min(0).max(100).default(0),
        nextAction: z.string().optional(),
        deadline: z.date().optional(),
        milestones: z.array(z.object({
          title: z.string(),
          completed: z.boolean().default(false),
          dueDate: z.string().optional(),
        })).default([]),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        return database.insert(goals).values({
          userId: ctx.user.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        progress: z.number().min(0).max(100).optional(),
        status: z.enum(["active", "paused", "completed", "abandoned"]).optional(),
        nextAction: z.string().optional(),
        deadline: z.date().optional(),
        milestones: z.array(z.object({
          title: z.string(),
          completed: z.boolean(),
          dueDate: z.string().optional(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const { id, ...updates } = input;
        return database.update(goals).set(updates).where(
          and(eq(goals.id, id), eq(goals.userId, ctx.user.id))
        );
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        return database.delete(goals).where(
          and(eq(goals.id, input.id), eq(goals.userId, ctx.user.id))
        );
      }),
  }),

  // ============ JOB APPLICATIONS ============
  jobApplications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserJobApplications(ctx.user.id);
    }),

    byStatus: protectedProcedure
      .input(z.object({ status: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getJobApplicationsByStatus(ctx.user.id, input.status);
      }),

    upcomingFollowUps: protectedProcedure.query(async ({ ctx }) => {
      return db.getUpcomingFollowUps(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        company: z.string().min(1),
        role: z.string().min(1),
        location: z.string().optional(),
        jobLink: z.string().optional(),
        dateApplied: z.date().optional(),
        status: z.enum(["Saved", "Applying", "Applied", "Interview", "Offer", "Rejected"]).default("Saved"),
        followUpDate: z.date().optional(),
        resumeVersion: z.string().optional(),
        coverLetterVersion: z.string().optional(),
        notes: z.string().optional(),
        salary: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        return database.insert(jobApplications).values({
          userId: ctx.user.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        company: z.string().optional(),
        role: z.string().optional(),
        location: z.string().optional(),
        status: z.enum(["Saved", "Applying", "Applied", "Interview", "Offer", "Rejected"]).optional(),
        followUpDate: z.date().optional(),
        notes: z.string().optional(),
        outcome: z.string().optional(),
        interviewStages: z.array(z.object({
          stage: z.string(),
          date: z.string().optional(),
          notes: z.string().optional(),
          completed: z.boolean(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const { id, ...updates } = input;
        return database.update(jobApplications).set(updates).where(
          and(eq(jobApplications.id, id), eq(jobApplications.userId, ctx.user.id))
        );
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        return database.delete(jobApplications).where(
          and(eq(jobApplications.id, input.id), eq(jobApplications.userId, ctx.user.id))
        );
      }),
  }),

  // ============ PERSONAL MEMORY ============
  memory: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserMemory(ctx.user.id);
    }),

    byType: protectedProcedure
      .input(z.object({ type: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getMemoryByType(ctx.user.id, input.type);
      }),

    enabled: protectedProcedure.query(async ({ ctx }) => {
      return db.getEnabledMemory(ctx.user.id);
    }),

    save: protectedProcedure
      .input(z.object({
        type: z.enum(["resume_detail", "education", "work_history", "achievement", "preferred_answer", "salary_preference", "work_rights", "skill", "writing_tone", "recurring_info"]),
        key: z.string(),
        value: z.string(),
        metadata: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const result = await database.insert(personalMemory).values({
          userId: ctx.user.id,
          type: input.type,
          key: input.key,
          value: input.value,
          metadata: input.metadata || {},
          isEnabled: true,
          usageCount: 0,
        });
        return result;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        value: z.string().optional(),
        isEnabled: z.boolean().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const { id, value, isEnabled, metadata } = input;
        const updates: any = {};
        if (value !== undefined) updates.value = value;
        if (isEnabled !== undefined) updates.isEnabled = isEnabled;
        if (metadata !== undefined) updates.metadata = metadata;
        
        const result = await database.update(personalMemory).set(updates).where(
          and(eq(personalMemory.id, id), eq(personalMemory.userId, ctx.user.id))
        );
        return result;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        return database.delete(personalMemory).where(
          and(eq(personalMemory.id, input.id), eq(personalMemory.userId, ctx.user.id))
        );
      }),
  }),

  // ============ NOTIFICATIONS ============
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserNotifications(ctx.user.id);
    }),

    unread: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnreadNotifications(ctx.user.id);
    }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        return database.update(notifications).set({
          isRead: true,
          readAt: new Date(),
        }).where(
          and(eq(notifications.id, input.id), eq(notifications.userId, ctx.user.id))
        );
      }),
  }),
});

export type AppRouter = typeof appRouter;
