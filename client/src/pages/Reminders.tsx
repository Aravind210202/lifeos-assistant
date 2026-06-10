import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["University", "Career", "Finance", "Health", "Personal", "Life Admin"];
const PRIORITIES = ["low", "medium", "high"];

interface Reminder {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
  completed: boolean;
}

function getReminders(): Reminder[] {
  const stored = localStorage.getItem("lifeos_reminders");
  return stored ? JSON.parse(stored) : [];
}

function saveReminders(reminders: Reminder[]) {
  localStorage.setItem("lifeos_reminders", JSON.stringify(reminders));
}

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Personal",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    setReminders(getReminders());
  }, []);

  const addReminder = () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a reminder title");
      return;
    }

    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      dueDate: formData.dueDate,
      completed: false,
    };

    const updated = [...reminders, newReminder];
    setReminders(updated);
    saveReminders(updated);
    toast.success("Reminder added!");
    setFormData({
      title: "",
      description: "",
      category: "Personal",
      priority: "medium",
      dueDate: new Date().toISOString().split("T")[0],
    });
    setShowForm(false);
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    saveReminders(updated);
    toast.success("Reminder deleted");
  };

  const toggleComplete = (id: string) => {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, completed: !r.completed } : r
    );
    setReminders(updated);
    saveReminders(updated);
    toast.success(reminders.find((r) => r.id === id)?.completed ? "Marked incomplete" : "Marked complete!");
  };

  const todayReminders = reminders.filter(
    (r) =>
      !r.completed &&
      new Date(r.dueDate).toDateString() === new Date().toDateString()
  );

  const overdueReminders = reminders.filter(
    (r) =>
      !r.completed &&
      new Date(r.dueDate) < new Date() &&
      new Date(r.dueDate).toDateString() !== new Date().toDateString()
  );

  const upcomingReminders = reminders.filter(
    (r) =>
      !r.completed &&
      new Date(r.dueDate) > new Date() &&
      new Date(r.dueDate).toDateString() !== new Date().toDateString()
  );

  const completedReminders = reminders.filter((r) => r.completed);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/40 text-red-200 border border-red-500/60 font-bold uppercase";
      case "medium":
        return "bg-yellow-500/40 text-yellow-200 border border-yellow-500/60 font-bold uppercase";
      case "low":
        return "bg-blue-500/40 text-blue-200 border border-blue-500/60 font-bold uppercase";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-gradient-to-r from-red-500/25 to-pink-500/15 border-l-4 border-red-500 hover:from-red-500/35 hover:to-pink-500/25";
      case "medium":
        return "bg-gradient-to-r from-yellow-500/25 to-orange-500/15 border-l-4 border-yellow-500 hover:from-yellow-500/35 hover:to-orange-500/25";
      case "low":
        return "bg-gradient-to-r from-blue-500/25 to-cyan-500/15 border-l-4 border-blue-500 hover:from-blue-500/35 hover:to-cyan-500/25";
      default:
        return "bg-white/10 border border-white/20";
    }
  };

  const ReminderCard = ({ reminder }: { reminder: Reminder }) => (
    <div
      className={`backdrop-blur-xl rounded-lg p-4 shadow-lg card flex items-start justify-between transition-all hover:shadow-xl ${getPriorityBgColor(
        reminder.priority
      )}`}
    >
      <div className="flex-1">
        <h3
          className={`font-bold text-lg ${
            reminder.priority === "high"
              ? "text-red-200"
              : reminder.priority === "medium"
              ? "text-yellow-200"
              : "text-blue-200"
          }`}
        >
          {reminder.title}
        </h3>
        {reminder.description && (
          <p className="text-sm text-white/60 mt-1">{reminder.description}</p>
        )}
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className={`text-xs px-3 py-1 rounded-full ${getPriorityColor(reminder.priority)}`}>
            {reminder.priority}
          </span>
          <span className="text-xs bg-purple-500/30 text-purple-200 px-3 py-1 rounded-full border border-purple-500/50">
            {reminder.category}
          </span>
          <span className="text-xs bg-white/10 text-white/70 px-3 py-1 rounded-full">
            {new Date(reminder.dueDate).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="flex gap-2 ml-4">
        <button
          onClick={() => toggleComplete(reminder.id)}
          className="p-2 hover:bg-green-500/30 rounded-lg transition-all hover:scale-110"
        >
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        </button>
        <button
          onClick={() => deleteReminder(reminder.id)}
          className="p-2 hover:bg-red-500/30 rounded-lg transition-all hover:scale-110"
        >
          <Trash2 className="w-5 h-5 text-red-400" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 md:p-8 page">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Reminders</h1>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Reminder
          </Button>
        </div>
        <p className="text-muted-foreground">Stay on top of your tasks and deadlines</p>
      </div>

      {/* Add Reminder Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="backdrop-blur-xl bg-black/80 border border-white/20">
          <DialogHeader>
            <DialogTitle>Add Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
              <input
                type="text"
                placeholder="Reminder title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
              <textarea
                placeholder="Add details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as "low" | "medium" | "high",
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={addReminder} className="flex-1">
                Add Reminder
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Today's Reminders */}
      {todayReminders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-300 mb-4">Today's Reminders</h2>
          <div className="space-y-3">
            {todayReminders.map((r) => (
              <ReminderCard key={r.id} reminder={r} />
            ))}
          </div>
        </div>
      )}

      {/* Overdue Reminders */}
      {overdueReminders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Overdue</h2>
          <div className="space-y-3">
            {overdueReminders.map((r) => (
              <ReminderCard key={r.id} reminder={r} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-green-300 mb-4">Upcoming</h2>
          <div className="space-y-3">
            {upcomingReminders.map((r) => (
              <ReminderCard key={r.id} reminder={r} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white/50 mb-4">Completed</h2>
          <div className="space-y-3">
            {completedReminders.map((r) => (
              <div
                key={r.id}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-4 shadow-lg card flex items-start justify-between opacity-60"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-white/50 line-through">{r.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-green-500/30 text-green-300 px-3 py-1 rounded-full">
                      Completed
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleComplete(r.id)}
                  className="p-2 hover:bg-blue-500/30 rounded-lg transition-all"
                >
                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {reminders.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No reminders yet. Create one to get started!</p>
        </div>
      )}
    </div>
  );
}
