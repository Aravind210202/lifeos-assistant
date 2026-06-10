import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckCircle2, AlertCircle, TrendingUp, Target, Briefcase, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { getReminders, addReminder, getTransactions, getGoals, getJobApplications, Reminder, Transaction, Goal, JobApplication } from "@/lib/localStorage";

export default function Dashboard() {
  const [todayReminders, setTodayReminders] = useState<Reminder[]>([]);
  const [overdueReminders, setOverdueReminders] = useState<Reminder[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [jobFollowUps, setJobFollowUps] = useState<JobApplication[]>([]);
  const [weeklySpent, setWeeklySpent] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState<Record<string, number>>({});
  const [subscriptions, setSubscriptions] = useState<Transaction[]>([]);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    title: "",
    description: "",
    category: "Personal" as const,
    priority: "medium" as const,
  });

  useEffect(() => {
    loadDashboardData();
    // Reload data every time the page is focused
    const handleFocus = () => loadDashboardData();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const loadDashboardData = () => {
    // Load today's reminders
    const allReminders = getReminders();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const today_reminders = allReminders.filter(r => {
      if (!r.dueDate || r.isCompleted) return false;
      const dueDate = new Date(r.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });
    
    const overdue = allReminders.filter(r => {
      if (!r.dueDate || r.isCompleted) return false;
      const dueDate = new Date(r.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() < today.getTime();
    });

    setTodayReminders(today_reminders);
    setOverdueReminders(overdue);

    // Load spending
    const transactions = getTransactions();
    const thisMonth = new Date();
    const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    const monthEnd = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0);
    
    const monthlySpent = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === "expense" && tDate >= monthStart && tDate <= monthEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    setTotalSpent(monthlySpent);

    // Load weekly spending
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weeklySpentAmount = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === "expense" && tDate >= weekStart && tDate <= weekEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    setWeeklySpent(weeklySpentAmount);

    // Load category breakdown
    const breakdown: Record<string, number> = {};
    transactions
      .filter(t => t.type === "expense" && new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd)
      .forEach(t => {
        breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
      });
    setCategoryBreakdown(breakdown);

    // Load subscriptions
    const subs = transactions.filter(t => t.category === "Subscriptions" && t.type === "expense");
    setSubscriptions(subs);

    // Load active goals
    const goals = getGoals();
    setActiveGoals(goals.filter(g => g.status === "active").slice(0, 3));

    // Load job follow-ups
    const jobs = getJobApplications();
    const upcoming = jobs.filter(j => j.followUpDate && new Date(j.followUpDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setJobFollowUps(upcoming.slice(0, 3));
  };

  const handleAddReminder = () => {
    if (!reminderForm.title.trim()) {
      toast.error("Please enter a reminder title");
      return;
    }

    addReminder({
      title: reminderForm.title,
      description: reminderForm.description,
      category: reminderForm.category as any,
      priority: reminderForm.priority as any,
      isRecurring: false,
      isCompleted: false,
    });

    toast.success("Reminder added!");
    setReminderForm({ title: "", description: "", category: "Personal", priority: "medium" });
    setShowAddReminder(false);
    loadDashboardData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to your LifeOS assistant</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        {/* Today's Reminders */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Today's Reminders</p>
              <p className="text-3xl font-bold text-foreground">{todayReminders.length}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-primary/50" />
          </div>
        </Card>

        {/* Overdue */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Overdue Items</p>
              <p className="text-3xl font-bold text-red-400">{overdueReminders.length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400/50" />
          </div>
        </Card>

        {/* Monthly Spending */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">This Month Spent</p>
              <p className="text-3xl font-bold text-foreground">${totalSpent.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary/50" />
          </div>
        </Card>

        {/* Active Goals */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Goals</p>
              <p className="text-3xl font-bold text-foreground">{activeGoals.length}</p>
            </div>
            <Target className="w-8 h-8 text-primary/50" />
          </div>
        </Card>

        {/* Weekly Spending */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">This Week Spent</p>
              <p className="text-3xl font-bold text-foreground">${weeklySpent.toFixed(2)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-primary/50" />
          </div>
        </Card>

        {/* Subscriptions */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Subscriptions</p>
              <p className="text-3xl font-bold text-foreground">{subscriptions.length}</p>
            </div>
            <Briefcase className="w-8 h-8 text-primary/50" />
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Reminders Section */}
        <div className="lg:col-span-2">
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Today's Reminders</h2>
              <Button
                size="sm"
                onClick={() => setShowAddReminder(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>

            {todayReminders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No reminders for today</p>
            ) : (
              <div className="space-y-2">
                {todayReminders.map(reminder => (
                  <div
                    key={reminder.id}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <p className="font-medium text-foreground">{reminder.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                        {reminder.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        reminder.priority === "high" ? "bg-red-500/20 text-red-400" :
                        reminder.priority === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-blue-500/20 text-blue-400"
                      }`}>
                        {reminder.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Overdue Section */}
        <div>
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Overdue Items</h2>
            {overdueReminders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">All caught up!</p>
            ) : (
              <div className="space-y-2">
                {overdueReminders.map(reminder => (
                  <div
                    key={reminder.id}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <p className="font-medium text-red-400 text-sm">{reminder.title}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 p-6 mt-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Active Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeGoals.map(goal => (
              <div key={goal.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="font-medium text-foreground mb-2">{goal.title}</p>
                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-primary to-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{goal.progress}% Complete</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Reminder Dialog */}
      <Dialog open={showAddReminder} onOpenChange={setShowAddReminder}>
        <DialogContent className="backdrop-blur-xl bg-black/80 border-white/20">
          <DialogHeader>
            <DialogTitle>Add Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
              <Input
                value={reminderForm.title}
                onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                placeholder="Enter reminder title"
                className="bg-white/10 border-white/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
              <Textarea
                value={reminderForm.description}
                onChange={(e) => setReminderForm({ ...reminderForm, description: e.target.value })}
                placeholder="Optional description"
                className="bg-white/10 border-white/20"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                <Select value={reminderForm.category} onValueChange={(value) => setReminderForm({ ...reminderForm, category: value as any })}>
                  <SelectTrigger className="bg-white/10 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="University">University</SelectItem>
                    <SelectItem value="Career">Career</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Life Admin">Life Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Priority</label>
                <Select value={reminderForm.priority} onValueChange={(value) => setReminderForm({ ...reminderForm, priority: value as any })}>
                  <SelectTrigger className="bg-white/10 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleAddReminder} className="w-full">
              Add Reminder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
