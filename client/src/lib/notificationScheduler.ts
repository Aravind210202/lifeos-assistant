// Notification Scheduler - runs on app startup
// Handles daily reminder notifications and budget alerts

import { sendDailyReminderNotification, sendBudgetAlert, getNotificationSettings } from './notificationService';

let schedulerRunning = false;
let schedulerInterval: NodeJS.Timeout | null = null;

export function startNotificationScheduler() {
  if (schedulerRunning) return;
  
  schedulerRunning = true;
  
  // Check every minute if we need to send notifications
  schedulerInterval = setInterval(() => {
    checkAndSendNotifications();
  }, 60000); // Check every minute
  
  // Also check immediately
  checkAndSendNotifications();
}

export function stopNotificationScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
  schedulerRunning = false;
}

function checkAndSendNotifications() {
  const settings = getNotificationSettings();
  
  if (!settings.enabled) return;
  
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  // Check if it's time for daily reminder
  if (currentTime === settings.dailyReminderTime) {
    sendDailyReminder();
  }
  
  // Check budget alerts (run every hour)
  if (now.getMinutes() === 0) {
    checkBudgetAlerts(settings.budgetThreshold);
  }
}

function sendDailyReminder() {
  const reminders = JSON.parse(localStorage.getItem('lifeos_reminders') || '[]');
  const today = new Date().toDateString();
  
  const todayReminders = reminders
    .filter((r: any) => {
      const reminderDate = new Date(r.dueDate).toDateString();
      return reminderDate === today && !r.completed;
    })
    .sort((a: any, b: any) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) - 
             (priorityOrder[b.priority as keyof typeof priorityOrder] || 2);
    });
  
  sendDailyReminderNotification({
    reminders: todayReminders,
    count: todayReminders.length,
  });
}

function checkBudgetAlerts(threshold: number) {
  const transactions = JSON.parse(localStorage.getItem('lifeos_transactions') || '[]');
  const budgets = JSON.parse(localStorage.getItem('lifeos_budgets') || '{}');
  
  if (Object.keys(budgets).length === 0) return;
  
  const CATEGORIES = ['Rent', 'Groceries', 'Transport', 'Food', 'Subscriptions', 'Shopping', 'Entertainment', 'Study', 'Travel', 'Health', 'Bills', 'Other'];
  
  // Get this month's transactions
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const monthlyTransactions = transactions.filter((t: any) => {
    const tDate = new Date(t.date);
    return t.type === 'expense' && tDate >= monthStart && tDate <= monthEnd;
  });
  
  // Check each category
  CATEGORIES.forEach((category) => {
    const budget = budgets[category];
    if (!budget) return;
    
    const spent = monthlyTransactions
      .filter((t: any) => t.category === category)
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const percentage = (spent / budget) * 100;
    
    if (percentage >= threshold * 100) {
      // Check if we already alerted for this category today
      const lastAlertKey = `budget_alert_${category}_${new Date().toDateString()}`;
      const lastAlert = localStorage.getItem(lastAlertKey);
      
      if (!lastAlert) {
        sendBudgetAlert({
          category,
          spent,
          budget,
          percentage: Math.round(percentage),
        });
        
        // Mark that we've alerted for this category today
        localStorage.setItem(lastAlertKey, 'true');
      }
    }
  });
}

// Export function to manually trigger daily reminder (for testing)
export function triggerDailyReminder() {
  sendDailyReminder();
}

// Export function to manually trigger budget check (for testing)
export function triggerBudgetCheck() {
  const settings = getNotificationSettings();
  checkBudgetAlerts(settings.budgetThreshold);
}
