// Notification Service for LifeOS
// Handles budget alerts, daily reminders, and other notifications

interface BudgetAlert {
  category: string;
  spent: number;
  budget: number;
  percentage: number;
}

interface ReminderNotification {
  reminders: Array<{
    title: string;
    priority: string;
    dueDate: string;
  }>;
  count: number;
}

// Request notification permission from user
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Send budget alert notification
export function sendBudgetAlert(alert: BudgetAlert): void {
  if (Notification.permission === 'granted') {
    const title = `⚠️ Budget Alert: ${alert.category}`;
    const options = {
      body: `You've spent $${alert.spent.toFixed(2)} of $${alert.budget.toFixed(2)} (${alert.percentage}%)`,
      icon: '📊',
      tag: `budget-${alert.category}`,
      requireInteraction: false,
    };

    new Notification(title, options);
  }
}

// Send daily reminder notification at 8am
export function sendDailyReminderNotification(data: ReminderNotification): void {
  if (Notification.permission === 'granted') {
    const title = `📋 Good Morning! ${data.count} reminder${data.count !== 1 ? 's' : ''} for today`;
    
    const reminderList = data.reminders
      .slice(0, 3)
      .map((r) => `• ${r.title} (${r.priority})`)
      .join('\n');

    const body = data.reminders.length > 0
      ? `${reminderList}${data.reminders.length > 3 ? `\n... and ${data.reminders.length - 3} more` : ''}`
      : 'No reminders for today - have a great day!';

    const options = {
      body,
      icon: '✅',
      tag: 'daily-reminders',
      requireInteraction: false,
    };

    new Notification(title, options);
  }
}

// Schedule 8am daily reminder notification
export function scheduleDailyReminderNotification(
  getTodayReminders: () => Array<{ title: string; priority: string; dueDate: string }>
): void {
  const checkAndNotify = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Check if it's 8:00 AM
    if (hours === 8 && minutes === 0) {
      const reminders = getTodayReminders();
      sendDailyReminderNotification({
        reminders,
        count: reminders.length,
      });
    }
  };

  // Check every minute
  setInterval(checkAndNotify, 60000);

  // Also check immediately on page load
  checkAndNotify();
}

// Check budget and send alerts
export function checkBudgetAlerts(
  transactions: Array<{ category: string; amount: number }>,
  budgets: Record<string, number>,
  threshold: number = 0.75
): BudgetAlert[] {
  const alerts: BudgetAlert[] = [];

  Object.entries(budgets).forEach(([category, budget]) => {
    const spent = transactions
      .filter((t) => t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = (spent / budget) * 100;

    if (percentage >= threshold * 100) {
      const alert: BudgetAlert = {
        category,
        spent,
        budget,
        percentage: Math.round(percentage),
      };

      alerts.push(alert);
      sendBudgetAlert(alert);
    }
  });

  return alerts;
}

// Store notification settings in localStorage
export function saveNotificationSettings(settings: {
  budgetThreshold: number;
  dailyReminderTime: string;
  enabled: boolean;
}): void {
  localStorage.setItem('lifeos_notification_settings', JSON.stringify(settings));
}

export function getNotificationSettings() {
  const stored = localStorage.getItem('lifeos_notification_settings');
  return stored
    ? JSON.parse(stored)
    : {
        budgetThreshold: 0.75,
        dailyReminderTime: '08:00',
        enabled: true,
      };
}
