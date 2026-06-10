import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, TrendingUp, AlertCircle, Target, Briefcase, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch data
  const todayReminders = trpc.reminders.today.useQuery(undefined, { enabled: !!user });
  const overdueReminders = trpc.reminders.overdue.useQuery(undefined, { enabled: !!user });
  const activeGoals = trpc.goals.active.useQuery(undefined, { enabled: !!user });
  const upcomingFollowUps = trpc.jobApplications.upcomingFollowUps.useQuery(undefined, { enabled: !!user });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 animate-slide-in-down">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Welcome back, {user?.name || "User"}
        </h1>
        <p className="text-muted-foreground">Your personal productivity hub</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Today's Reminders */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Today's Tasks</p>
              <p className="text-3xl font-bold text-foreground">
                {todayReminders.data?.length || 0}
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-primary/60" />
          </div>
        </div>

        {/* Overdue Items */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 animate-scale-in border-red-500/20 bg-red-500/5" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Overdue</p>
              <p className="text-3xl font-bold text-red-500">
                {overdueReminders.data?.length || 0}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500/60" />
          </div>
        </div>

        {/* Active Goals */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 animate-scale-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Goals</p>
              <p className="text-3xl font-bold text-foreground">
                {activeGoals.data?.length || 0}
              </p>
            </div>
            <Target className="w-8 h-8 text-primary/60" />
          </div>
        </div>

        {/* Job Follow-ups */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 animate-scale-in" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Job Follow-ups</p>
              <p className="text-3xl font-bold text-foreground">
                {upcomingFollowUps.data?.length || 0}
              </p>
            </div>
            <Briefcase className="w-8 h-8 text-primary/60" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Reminders & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Reminders */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 animate-slide-in-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Today's Tasks</h2>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>

            {todayReminders.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : todayReminders.data && todayReminders.data.length > 0 ? (
              <div className="space-y-2">
                {todayReminders.data.map((reminder, idx) => (
                  <div
                    key={reminder.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors animate-slide-in-up"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{reminder.title}</p>
                      <p className="text-xs text-muted-foreground">{reminder.category}</p>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      reminder.priority === "high" ? "bg-red-500/20 text-red-400" :
                      reminder.priority === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-green-500/20 text-green-400"
                    }`}>
                      {reminder.priority}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No tasks today - great job!</p>
            )}
          </div>

          {/* Overdue Reminders */}
          {overdueReminders.data && overdueReminders.data.length > 0 && (
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 border-red-500/20 bg-red-500/5 animate-slide-in-up">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h2 className="text-xl font-bold text-red-500">Overdue Items</h2>
              </div>
              <div className="space-y-2">
                {overdueReminders.data.map((reminder) => (
                  <div key={reminder.id} className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10">
                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{reminder.title}</p>
                      <p className="text-xs text-muted-foreground">{reminder.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Goals & Jobs */}
        <div className="space-y-6">
          {/* Active Goals */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 animate-slide-in-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Goals</h2>
              <Target className="w-5 h-5 text-primary/60" />
            </div>

            {activeGoals.isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : activeGoals.data && activeGoals.data.length > 0 ? (
              <div className="space-y-3">
                {activeGoals.data.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground truncate">{goal.title}</p>
                      <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-muted-foreground text-sm">No active goals</p>
            )}
          </div>

          {/* Job Follow-ups */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 animate-slide-in-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Follow-ups</h2>
              <Briefcase className="w-5 h-5 text-primary/60" />
            </div>

            {upcomingFollowUps.isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : upcomingFollowUps.data && upcomingFollowUps.data.length > 0 ? (
              <div className="space-y-2">
                {upcomingFollowUps.data.slice(0, 3).map((job) => (
                  <div key={job.id} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <p className="text-sm font-medium text-foreground truncate">{job.company}</p>
                    <p className="text-xs text-muted-foreground">{job.role}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-muted-foreground text-sm">No follow-ups</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
