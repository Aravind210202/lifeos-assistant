import { useState, useEffect } from "react";
import { Bell, Download, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  requestNotificationPermission,
  getNotificationSettings,
  saveNotificationSettings,
} from "@/lib/notificationService";
import { triggerDailyReminder, triggerBudgetCheck } from "@/lib/notificationScheduler";
import { collectAllData, downloadCSV } from "@/lib/sheetsExport";

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [budgetThreshold, setBudgetThreshold] = useState(75);
  const [dailyReminderTime, setDailyReminderTime] = useState("08:00");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    // Check notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    // Load settings
    const settings = getNotificationSettings();
    setNotificationsEnabled(settings.enabled);
    setBudgetThreshold(settings.budgetThreshold * 100);
    setDailyReminderTime(settings.dailyReminderTime);
  }, []);

  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    if (permission) {
      setNotificationsEnabled(true);
      setNotificationPermission("granted");
      toast.success("Notifications enabled!");
    } else {
      toast.error("Notification permission denied");
    }
  };

  const handleSaveSettings = () => {
    saveNotificationSettings({
      budgetThreshold: budgetThreshold / 100,
      dailyReminderTime,
      enabled: notificationsEnabled,
    });
    toast.success("Settings saved!");
  };

  const handleExportCSV = () => {
    try {
      const data = collectAllData();
      downloadCSV(data, `lifeos-export-${new Date().toISOString().split("T")[0]}.csv`);
      toast.success("Data exported to CSV!");
    } catch (error) {
      toast.error("Failed to export data");
      console.error(error);
    }
  };

  const handleTestBudgetAlert = () => {
    if (notificationPermission !== "granted") {
      toast.error("Please enable notifications first");
      return;
    }

    const budgets = JSON.parse(localStorage.getItem("lifeos_budgets") || "{}");
    if (Object.keys(budgets).length === 0) {
      toast.error("No budgets set. Please set category budgets in Finance module.");
      return;
    }

    triggerBudgetCheck();
    toast.success("Budget check triggered! Check notifications.");
  };

  const handleTestDailyReminder = () => {
    if (notificationPermission !== "granted") {
      toast.error("Please enable notifications first");
      return;
    }

    triggerDailyReminder();
    toast.success("Test notification sent!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 md:p-8 page">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage notifications, budgets, and data export</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Notifications Section */}
        <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-blue-100">Notifications</h2>
            </div>
            {notificationPermission === "granted" && (
              <span className="text-xs bg-green-500/30 text-green-300 px-3 py-1 rounded-full">
                Enabled
              </span>
            )}
          </div>

          <div className="space-y-4">
            {notificationPermission !== "granted" ? (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-200 font-semibold">Notifications Disabled</p>
                  <p className="text-yellow-300/80 text-sm mt-1">
                    Enable notifications to receive budget alerts and daily reminders.
                  </p>
                </div>
              </div>
            ) : null}

            <div>
              <label className="text-sm font-medium text-blue-300 mb-2 block">
                Daily Reminder Time
              </label>
              <input
                type="time"
                value={dailyReminderTime}
                onChange={(e) => setDailyReminderTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <p className="text-xs text-blue-300/70 mt-1">
                You'll receive a notification at this time each day with today's reminders
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-blue-300 mb-2 block">
                Budget Alert Threshold: {budgetThreshold}%
              </label>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={budgetThreshold}
                onChange={(e) => setBudgetThreshold(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-blue-300/70 mt-1">
                Alert when spending reaches this % of your budget
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              {notificationPermission !== "granted" ? (
                <Button onClick={handleEnableNotifications} className="flex-1">
                  <Bell className="w-4 h-4 mr-2" />
                  Enable Notifications
                </Button>
              ) : (
                <>
                  <Button onClick={handleTestDailyReminder} variant="outline" className="flex-1">
                    Test Daily Reminder
                  </Button>
                  <Button onClick={handleTestBudgetAlert} variant="outline" className="flex-1">
                    Test Budget Alert
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Data Export Section */}
        <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 border border-purple-500/30 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Download className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-purple-100">Data Export</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-purple-200 mb-2">Export Options</h3>
              <p className="text-sm text-purple-300/70 mb-4">
                Download all your LifeOS data as CSV or export to Google Sheets for backup and analysis.
              </p>
            </div>

            <div className="space-y-2">
              <Button onClick={handleExportCSV} className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
                <Download className="w-4 h-4" />
                Download as CSV
              </Button>

              <Button
                onClick={handleSaveSettings}
                className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <Save className="w-4 h-4" />
                Save Settings
              </Button>

              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 mt-4">
                <p className="text-xs text-purple-300">
                  <strong>Google Sheets Export:</strong> Set up with your email{" "}
                  <span className="text-purple-200">varavindsrivatsan@gmail.com</span>
                </p>
                <p className="text-xs text-purple-300/70 mt-2">
                  Coming soon - will automatically sync your data to a shared Google Sheet
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* About Section */}
        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 p-6">
          <h2 className="text-lg font-bold text-foreground mb-3">About LifeOS</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Version: 1.0.0</p>
            <p>All data is stored locally in your browser</p>
            <p>No data is sent to external servers (except exports)</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
