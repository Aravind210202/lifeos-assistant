// localStorage data store for LifeOS
// All data is stored locally in the browser with JSON serialization

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  category: "University" | "Career" | "Finance" | "Health" | "Personal" | "Life Admin";
  priority: "low" | "medium" | "high";
  isRecurring: boolean;
  recurringPattern?: "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
  recurringEndDate?: Date;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: "quick_notes" | "study_notes" | "ideas" | "life_admin";
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  type: "income" | "expense";
  createdAt: Date;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string; // YYYY-MM
}

export interface Goal {
  id: string;
  title: string;
  category: "University" | "Career" | "Fitness" | "Finance" | "Personal";
  progress: number;
  nextAction: string;
  deadline?: Date;
  milestones: string[];
  status: "active" | "completed" | "paused";
  whyItMatters: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  jobLink: string;
  dateApplied: Date;
  status: "Saved" | "Applying" | "Applied" | "Interview" | "Offer" | "Rejected";
  followUpDate?: Date;
  resumeVersion: string;
  coverLetterVersion: string;
  interviewNotes: string;
  outcome?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalMemory {
  id: string;
  type: "resume_detail" | "education" | "work_history" | "achievement" | "preferred_answer" | "salary_preference" | "work_rights" | "skill" | "writing_tone" | "recurring_info";
  key: string;
  value: string;
  metadata?: Record<string, any>;
  isEnabled: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Reminders Store
const REMINDERS_KEY = "lifeos_reminders";

export function getReminders(): Reminder[] {
  try {
    const data = localStorage.getItem(REMINDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addReminder(reminder: Omit<Reminder, "id" | "createdAt" | "updatedAt">): Reminder {
  const reminders = getReminders();
  const newReminder: Reminder = {
    ...reminder,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  reminders.push(newReminder);
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  return newReminder;
}

export function updateReminder(id: string, updates: Partial<Reminder>): Reminder | null {
  const reminders = getReminders();
  const index = reminders.findIndex(r => r.id === id);
  if (index === -1) return null;
  reminders[index] = { ...reminders[index], ...updates, updatedAt: new Date() };
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  return reminders[index];
}

export function deleteReminder(id: string): boolean {
  const reminders = getReminders();
  const filtered = reminders.filter(r => r.id !== id);
  if (filtered.length === reminders.length) return false;
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(filtered));
  return true;
}

// Notes Store
const NOTES_KEY = "lifeos_notes";

export function getNotes(): Note[] {
  try {
    const data = localStorage.getItem(NOTES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addNote(note: Omit<Note, "id" | "createdAt" | "updatedAt">): Note {
  const notes = getNotes();
  const newNote: Note = {
    ...note,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  notes.push(newNote);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  return newNote;
}

export function updateNote(id: string, updates: Partial<Note>): Note | null {
  const notes = getNotes();
  const index = notes.findIndex(n => n.id === id);
  if (index === -1) return null;
  notes[index] = { ...notes[index], ...updates, updatedAt: new Date() };
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  return notes[index];
}

export function deleteNote(id: string): boolean {
  const notes = getNotes();
  const filtered = notes.filter(n => n.id !== id);
  if (filtered.length === notes.length) return false;
  localStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
  return true;
}

// Transactions Store
const TRANSACTIONS_KEY = "lifeos_transactions";

export function getTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Transaction {
  const transactions = getTransactions();
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
  transactions.push(newTransaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  return newTransaction;
}

export function updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index === -1) return null;
  transactions[index] = { ...transactions[index], ...updates };
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  return transactions[index];
}

export function deleteTransaction(id: string): boolean {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  if (filtered.length === transactions.length) return false;
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filtered));
  return true;
}

// Goals Store
const GOALS_KEY = "lifeos_goals";

export function getGoals(): Goal[] {
  try {
    const data = localStorage.getItem(GOALS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addGoal(goal: Omit<Goal, "id" | "createdAt" | "updatedAt">): Goal {
  const goals = getGoals();
  const newGoal: Goal = {
    ...goal,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  goals.push(newGoal);
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  return newGoal;
}

export function updateGoal(id: string, updates: Partial<Goal>): Goal | null {
  const goals = getGoals();
  const index = goals.findIndex(g => g.id === id);
  if (index === -1) return null;
  goals[index] = { ...goals[index], ...updates, updatedAt: new Date() };
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  return goals[index];
}

export function deleteGoal(id: string): boolean {
  const goals = getGoals();
  const filtered = goals.filter(g => g.id !== id);
  if (filtered.length === goals.length) return false;
  localStorage.setItem(GOALS_KEY, JSON.stringify(filtered));
  return true;
}

// Job Applications Store
const JOBS_KEY = "lifeos_job_applications";

export function getJobApplications(): JobApplication[] {
  try {
    const data = localStorage.getItem(JOBS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addJobApplication(job: Omit<JobApplication, "id" | "createdAt" | "updatedAt">): JobApplication {
  const jobs = getJobApplications();
  const newJob: JobApplication = {
    ...job,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  jobs.push(newJob);
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  return newJob;
}

export function updateJobApplication(id: string, updates: Partial<JobApplication>): JobApplication | null {
  const jobs = getJobApplications();
  const index = jobs.findIndex(j => j.id === id);
  if (index === -1) return null;
  jobs[index] = { ...jobs[index], ...updates, updatedAt: new Date() };
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  return jobs[index];
}

export function deleteJobApplication(id: string): boolean {
  const jobs = getJobApplications();
  const filtered = jobs.filter(j => j.id !== id);
  if (filtered.length === jobs.length) return false;
  localStorage.setItem(JOBS_KEY, JSON.stringify(filtered));
  return true;
}

// Personal Memory Store
const MEMORY_KEY = "lifeos_memory";

export function getMemory(): PersonalMemory[] {
  try {
    const data = localStorage.getItem(MEMORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addMemory(memory: Omit<PersonalMemory, "id" | "createdAt" | "updatedAt">): PersonalMemory {
  const memories = getMemory();
  const newMemory: PersonalMemory = {
    ...memory,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memories.push(newMemory);
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memories));
  return newMemory;
}

export function updateMemory(id: string, updates: Partial<PersonalMemory>): PersonalMemory | null {
  const memories = getMemory();
  const index = memories.findIndex(m => m.id === id);
  if (index === -1) return null;
  memories[index] = { ...memories[index], ...updates, updatedAt: new Date() };
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memories));
  return memories[index];
}

export function deleteMemory(id: string): boolean {
  const memories = getMemory();
  const filtered = memories.filter(m => m.id !== id);
  if (filtered.length === memories.length) return false;
  localStorage.setItem(MEMORY_KEY, JSON.stringify(filtered));
  return true;
}
