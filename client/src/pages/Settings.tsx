import { useState, useEffect } from "react";
import { Bell, Download, Save, AlertCircle } from "lucide-react";
import { Link2, Check, X } from "lucide-react";
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
import { loadSheetsConfig, saveSheetsConfig, testWebhookConnection, isValidWebhookUrl } from "@/lib/sheetsSync";
import { downloadExcelFile } from "@/lib/excelExport";

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [budgetThreshold, setBudgetThreshold] = useState(75);
  const [dailyReminderTime, setDailyReminderTime] = useState("08:00");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [sheetsEnabled, setSheetsEnabled] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'connected' | 'error'>('idle');

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

    // Load sheets config
    const sheetsConfig = loadSheetsConfig();
    setWebhookUrl(sheetsConfig.webhookUrl);
    setSheetsEnabled(sheetsConfig.enabled);
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

  const handleExportExcel = async () => {
    try {
      await downloadExcelFile();
      toast.success("Data exported as Excel!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export Excel");
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast.error("Please enter a webhook URL");
      return;
    }

    if (!isValidWebhookUrl(webhookUrl)) {
      toast.error("Invalid webhook URL");
      return;
    }

    setTestingWebhook(true);
    setWebhookStatus('idle');

    try {
      const success = await testWebhookConnection(webhookUrl);
      if (success) {
        setWebhookStatus('connected');
        toast.success("Webhook connected successfully!");
      } else {
        setWebhookStatus('error');
        toast.error("Webhook connection failed");
      }
    } catch (error) {
      setWebhookStatus('error');
      toast.error("Failed to test webhook");
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleSaveSheetsConfig = () => {
    if (!webhookUrl && sheetsEnabled) {
      toast.error("Please enter a webhook URL");
      return;
    }

    if (webhookUrl && !isValidWebhookUrl(webhookUrl)) {
      toast.error("Invalid webhook URL");
      return;
    }

    saveSheetsConfig({ webhookUrl, enabled: sheetsEnabled });
    toast.success("Google Sheets sync settings saved!");
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
        <Card className=" bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-blue-900">Notifications</h2>
            </div>
            {notificationPermission === "granted" && (
              <span className="text-xs bg-green-500/30 text-green-600 px-3 py-1 rounded-full">
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
              <label className="text-sm font-medium text-blue-600 mb-2 block">
                Daily Reminder Time
              </label>
              <input
                type="time"
                value={dailyReminderTime}
                onChange={(e) => setDailyReminderTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <p className="text-xs text-blue-600/70 mt-1">
                You'll receive a notification at this time each day with today's reminders
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-blue-600 mb-2 block">
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
              <p className="text-xs text-blue-600/70 mt-1">
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
        <Card className=" bg-gradient-to-br from-purple-500/20 to-violet-500/10 border border-purple-500/30 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Download className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold text-purple-900">Data Export</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-purple-200 mb-2">Export Options</h3>
              <p className="text-sm text-purple-600/70 mb-4">
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

              <div className="space-y-3 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button onClick={handleExportCSV} className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export as CSV
                  </Button>
                  <Button onClick={handleExportExcel} className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export as Excel
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sheets-sync"
                      checked={sheetsEnabled}
                      onChange={(e) => setSheetsEnabled(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="sheets-sync" className="text-sm font-medium text-purple-600">
                      Enable Google Sheets Live Sync
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Paste your Google Apps Script webhook URL here"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    disabled={!sheetsEnabled}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
                  />
                  <p className="text-xs text-purple-600/70">
                    Get your webhook URL from your Google Apps Script project. Transactions will sync automatically when enabled.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleTestWebhook}
                      disabled={!sheetsEnabled || testingWebhook}
                      variant="outline"
                      className="flex-1"
                    >
                      <Link2 className="w-4 h-4 mr-2" />
                      {testingWebhook ? 'Testing...' : 'Test Connection'}
                    </Button>
                    <Button
                      onClick={handleSaveSheetsConfig}
                      disabled={!sheetsEnabled && !webhookUrl}
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </Button>
                  </div>
                  {webhookStatus === 'connected' && (
                    <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-600">Webhook connected and ready</span>
                    </div>
                  )}
                  {webhookStatus === 'error' && (
                    <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-red-600">Webhook connection failed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* About Section */}
        <Card className=" bg-white/5 border border-gray-100 p-6">
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
