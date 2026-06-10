/**
 * Module accent colors and category color map for LifeOS
 * Used consistently across pages, charts, and UI elements
 */

export const MODULE_COLORS = {
  dashboard: '#818cf8',    // indigo
  reminders: '#fbbf24',    // amber
  notes: '#38bdf8',        // sky
  finance: '#34d399',      // emerald
  goals: '#a78bfa',        // violet
  jobs: '#fb7185',         // rose
  memory: '#22d3ee',       // cyan
  ai: '#e879f9',           // fuchsia
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  // Income
  'Salary': '#10b981',      // green
  'Investment': '#8b5cf6',  // purple
  
  // Expenses
  'Rent': '#ef4444',        // red
  'Groceries': '#84cc16',   // lime
  'Transport': '#f97316',   // orange
  'Food': '#ec4899',        // pink
  'Subscriptions': '#06b6d4', // cyan
  'Shopping': '#a855f7',    // purple
  'Entertainment': '#f43f5e', // rose
  'Study': '#3b82f6',       // blue
  'Travel': '#14b8a6',      // teal
  'Health': '#f59e0b',      // amber
  'Bills': '#6366f1',       // indigo
  'Other': '#64748b',       // slate
} as const;

/**
 * Get the color for a given category
 */
export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
}

/**
 * Get the module color for a given module name
 */
export function getModuleColor(module: 'dashboard' | 'reminders' | 'notes' | 'finance' | 'goals' | 'jobs' | 'memory' | 'ai'): string {
  return MODULE_COLORS[module];
}

/**
 * All category colors as an array for recharts
 */
export const CATEGORY_COLORS_ARRAY = Object.values(CATEGORY_COLORS);

/**
 * Category names in order
 */
export const CATEGORY_NAMES = Object.keys(CATEGORY_COLORS);

/**
 * Reminder priority colors
 */
export const REMINDER_PRIORITY_COLORS = {
  high: '#ef4444',      // Red
  medium: '#fbbf24',    // Amber
  low: '#3b82f6',       // Blue
} as const;

/**
 * Reminder category colors
 */
export const REMINDER_CATEGORY_COLORS: Record<string, string> = {
  'University': '#3b82f6',    // Blue
  'Career': '#8b5cf6',        // Purple
  'Finance': '#34d399',       // Green
  'Health': '#ef4444',        // Red
  'Personal': '#f97316',      // Orange
  'Life Admin': '#06b6d4',    // Cyan
};

/**
 * Goal category colors
 */
export const GOAL_CATEGORY_COLORS: Record<string, string> = {
  'University': '#3b82f6',    // Blue
  'Career': '#8b5cf6',        // Purple
  'Fitness': '#ef4444',       // Red
  'Finance': '#34d399',       // Green
  'Personal': '#f97316',      // Orange
};

/**
 * Job application status colors
 */
export const JOB_STATUS_COLORS: Record<string, string> = {
  'Saved': '#94a3b8',         // Slate
  'Applying': '#3b82f6',      // Blue
  'Applied': '#8b5cf6',       // Purple
  'Interview': '#f97316',     // Orange
  'Offer': '#34d399',         // Green
  'Rejected': '#ef4444',      // Red
};
