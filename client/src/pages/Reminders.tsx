import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Reminders() {
  const { user, loading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Personal" as const,
    priority: "medium" as const,
    dueDate: new Date().toISOString().split("T")[0],
  });

  const reminders = trpc.reminders.list.useQuery(undefined, { enabled: !!user });
  const createReminder = trpc.reminders.create.useMutation({
    onSuccess: () => {
      reminders.refetch();
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        category: "Personal" as const,
        priority: "medium" as const,
        dueDate: new Date().toISOString().split("T")[0],
      });
      toast.success("Reminder created!");
    },
    onError: () => {
      toast.error("Failed to create reminder");
    },
  });
  const updateReminder = trpc.reminders.update.useMutation({
    onSuccess: () => {
      reminders.refetch();
      toast.success("Reminder updated!");
    },
  });
  const deleteReminder = trpc.reminders.delete.useMutation({
    onSuccess: () => {
      reminders.refetch();
      toast.success("Reminder deleted!");
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 md:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Reminders</h1>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Reminder
          </Button>
        </div>
        <p className="text-muted-foreground">Manage your tasks and reminders</p>
      </div>

      {/* Create Reminder Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="backdrop-blur-xl bg-black/80 border border-white/20">
          <DialogHeader>
            <DialogTitle>Create New Reminder</DialogTitle>
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
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="University">University</option>
                  <option value="Career">Career</option>
                  <option value="Finance">Finance</option>
                  <option value="Health">Health</option>
                  <option value="Personal">Personal</option>
                  <option value="Life Admin">Life Admin</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
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
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!formData.title.trim()) {
                    toast.error("Please enter a title");
                    return;
                  }
                  createReminder.mutate({
                    title: formData.title,
                    description: formData.description || undefined,
                    category: formData.category,
                    priority: formData.priority,
                    dueDate: new Date(formData.dueDate),
                  });
                }}
                disabled={createReminder.isPending}
              >
                {createReminder.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reminders List */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 shadow-2xl">
        {reminders.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reminders.data && reminders.data.length > 0 ? (
          <div className="space-y-3">
            {reminders.data.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
              >
                <button
                  onClick={() =>
                    updateReminder.mutate({
                      id: reminder.id,
                      isCompleted: !reminder.isCompleted,
                    })
                  }
                  className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  {reminder.isCompleted && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-foreground ${
                      reminder.isCompleted ? "line-through opacity-60" : ""
                    }`}
                  >
                    {reminder.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      {reminder.category}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        reminder.priority === "high"
                          ? "bg-red-500/20 text-red-400"
                          : reminder.priority === "medium"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {reminder.priority}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteReminder.mutate({ id: reminder.id })}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-12 text-muted-foreground">
            No reminders yet. Create one to get started!
          </p>
        )}
      </div>
    </div>
  );
}
