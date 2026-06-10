import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CATEGORIES = ["University", "Career", "Fitness", "Finance", "Personal"];

interface Goal {
  id: string;
  title: string;
  category: string;
  whyItMatters: string;
  progress: number;
  nextAction: string;
  deadline: string;
  status: "active" | "completed" | "paused";
}

function getGoals(): Goal[] {
  const stored = localStorage.getItem("lifeos_goals");
  return stored ? JSON.parse(stored) : [];
}

function saveGoals(goals: Goal[]) {
  localStorage.setItem("lifeos_goals", JSON.stringify(goals));
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "Personal",
    whyItMatters: "",
    progress: 0,
    nextAction: "",
    deadline: "",
    status: "active" as "active" | "completed" | "paused",
  });

  useEffect(() => {
    setGoals(getGoals());
  }, []);

  const addOrUpdateGoal = () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a goal title");
      return;
    }

    if (editingId) {
      const updated = goals.map((g) =>
        g.id === editingId
          ? { ...g, ...formData }
          : g
      );
      setGoals(updated);
      saveGoals(updated);
      toast.success("Goal updated!");
    } else {
      const newGoal: Goal = {
        id: Date.now().toString(),
        ...formData,
      };
      const updated = [...goals, newGoal];
      setGoals(updated);
      saveGoals(updated);
      toast.success("Goal added!");
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      category: "Personal",
      whyItMatters: "",
      progress: 0,
      nextAction: "",
      deadline: "",
      status: "active",
    });
  };

  const deleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    saveGoals(updated);
    toast.success("Goal deleted!");
  };

  const editGoal = (goal: Goal) => {
    setFormData({
      title: goal.title,
      category: goal.category,
      whyItMatters: goal.whyItMatters,
      progress: goal.progress,
      nextAction: goal.nextAction,
      deadline: goal.deadline,
      status: goal.status,
    });
    setEditingId(goal.id);
    setShowForm(true);
  };

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 md:p-8 page">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Goals</h1>
          <Button
            onClick={() => {
              setEditingId(null);
              setFormData({
                title: "",
                category: "Personal",
                whyItMatters: "",
                progress: 0,
                nextAction: "",
                deadline: "",
                status: "active",
              });
              setShowForm(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </Button>
        </div>
        <p className="text-muted-foreground">Track your goals across all areas of life</p>
      </div>

      {/* Add/Edit Goal Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="backdrop-blur-xl bg-black/80 border border-white/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Goal" : "Add Goal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
              <input
                type="text"
                placeholder="Goal title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                <label className="text-sm font-medium text-foreground mb-1 block">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Why It Matters</label>
              <textarea
                placeholder="Why is this goal important?"
                value={formData.whyItMatters}
                onChange={(e) => setFormData({ ...formData, whyItMatters: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Next Action</label>
              <input
                type="text"
                placeholder="What's the next step?"
                value={formData.nextAction}
                onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={addOrUpdateGoal}>{editingId ? "Update" : "Add"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Goals */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Active Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeGoals.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-8">No active goals yet</p>
          ) : (
            activeGoals.map((goal) => (
              <div key={goal.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 shadow-lg card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{goal.title}</h3>
                    <p className="text-xs text-muted-foreground">{goal.category}</p>
                  </div>
                  <button
                    onClick={() => editGoal(goal)}
                    className="p-1 hover:bg-blue-500/20 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-blue-400" />
                  </button>
                </div>

                {goal.whyItMatters && (
                  <p className="text-sm text-muted-foreground mb-3">{goal.whyItMatters}</p>
                )}

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {goal.nextAction && (
                  <p className="text-xs text-muted-foreground mb-3">
                    <span className="font-medium">Next:</span> {goal.nextAction}
                  </p>
                )}

                {goal.deadline && (
                  <p className="text-xs text-muted-foreground mb-3">
                    <span className="font-medium">Deadline:</span> {goal.deadline}
                  </p>
                )}

                <div className="flex gap-2 pt-3">
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="flex-1 px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Completed Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="backdrop-blur-xl bg-white/10 border border-green-500/30 rounded-lg p-6 shadow-lg card opacity-75">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-green-400 line-through">{goal.title}</h3>
                    <p className="text-xs text-muted-foreground">{goal.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="w-full px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
