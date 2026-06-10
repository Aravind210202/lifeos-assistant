import { Button } from "@/components/ui/button";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
    setShowForm(false);
    setFormData({
      title: "",
      description: "",
      category: "Personal",
      priority: "medium",
      dueDate: new Date().toISOString().split("T")[0],
    });
    toast.success("Reminder created!");
  };

  const toggleComplete = (id: string) => {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, completed: !r.completed } : r
    );
    setReminders(updated);
    saveReminders(updated);
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    saveReminders(updated);
    toast.success("Reminder deleted!");
  };

  const todayReminders = reminders.filter(
    (r) => r.dueDate === new Date().toISOString().split("T")[0] && !r.completed
  );
  const overdueReminders = reminders.filter(
    (r) => new Date(r.dueDate) < new Date() && !r.completed
  );
  const upcomingReminders = reminders.filter(
    (r) => new Date(r.dueDate) > new Date() && !r.completed
  );
  const completedReminders = reminders.filter((r) => r.completed);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400";
      case "low":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

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
            <div className="grid grid-cols-3 gap-4">
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
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
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
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={addReminder}>Add</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Today's Reminders */}
      {todayReminders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Today's Reminders</h2>
          <div className="space-y-2">
            {todayReminders.map((r) => (
              <div
                key={r.id}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-4 shadow-lg card flex items-start justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{r.title}</h3>
                  {r.description && (
                    <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(r.priority)}`}>
                      {r.priority}
                    </span>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                      {r.category}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => toggleComplete(r.id)}
                    className="p-2 hover:bg-green-500/20 rounded transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </button>
                  <button
                    onClick={() => deleteReminder(r.id)}
                    className="p-2 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overdue Reminders */}
      {overdueReminders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-red-400 mb-4">Overdue</h2>
          <div className="space-y-2">
            {overdueReminders.map((r) => (
              <div
                key={r.id}
                className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-lg p-4 shadow-lg card flex items-start justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{r.title}</h3>
                  {r.description && (
                    <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(r.priority)}`}>
                      {r.priority}
                    </span>
                    <span className="text-xs text-red-400">{r.dueDate}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => toggleComplete(r.id)}
                    className="p-2 hover:bg-green-500/20 rounded transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </button>
                  <button
                    onClick={() => deleteReminder(r.id)}
                    className="p-2 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Upcoming</h2>
          <div className="space-y-2">
            {upcomingReminders.map((r) => (
              <div
                key={r.id}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-4 shadow-lg card flex items-start justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{r.title}</h3>
                  {r.description && (
                    <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(r.priority)}`}>
                      {r.priority}
                    </span>
                    <span className="text-xs text-muted-foreground">{r.dueDate}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => toggleComplete(r.id)}
                    className="p-2 hover:bg-green-500/20 rounded transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </button>
                  <button
                    onClick={() => deleteReminder(r.id)}
                    className="p-2 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-green-400 mb-4">Completed</h2>
          <div className="space-y-2">
            {completedReminders.map((r) => (
              <div
                key={r.id}
                className="backdrop-blur-xl bg-green-500/10 border border-green-500/30 rounded-lg p-4 shadow-lg card flex items-start justify-between opacity-75"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-green-400 line-through">{r.title}</h3>
                </div>
                <button
                  onClick={() => deleteReminder(r.id)}
                  className="p-2 hover:bg-red-500/20 rounded transition-colors ml-4"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {reminders.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No reminders yet. Add one to get started!</p>
      )}
    </div>
  );
}
