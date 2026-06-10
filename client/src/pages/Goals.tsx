import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, Edit2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Goals() {
  const { user, loading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Personal" as const,
    progress: 0,
    deadline: new Date().toISOString().split("T")[0],
  });

  const goals = trpc.goals.list.useQuery(undefined, { enabled: !!user });
  const createGoal = trpc.goals.create.useMutation({
    onSuccess: () => {
      goals.refetch();
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        category: "Personal" as const,
        progress: 0,
        deadline: new Date().toISOString().split("T")[0],
      });
      toast.success("Goal created!");
    },
    onError: () => {
      toast.error("Failed to create goal");
    },
  });
  const updateGoal = trpc.goals.update.useMutation({
    onSuccess: () => {
      goals.refetch();
      toast.success("Goal updated!");
    },
  });
  const deleteGoal = trpc.goals.delete.useMutation({
    onSuccess: () => {
      goals.refetch();
      toast.success("Goal deleted!");
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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Goals</h1>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Goal
          </Button>
        </div>
        <p className="text-muted-foreground">Track your personal, career, and fitness goals</p>
      </div>

      {/* Create Goal Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="backdrop-blur-xl bg-black/80 border border-white/20">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
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
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
              <textarea
                placeholder="Why does this goal matter to you?"
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
                  <option value="Fitness">Fitness</option>
                  <option value="Finance">Finance</option>
                  <option value="Personal">Personal</option>
                </select>
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
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!formData.title.trim()) {
                    toast.error("Please enter a title");
                    return;
                  }
                  createGoal.mutate({
                    title: formData.title,
                    whyItMatters: formData.description || undefined,
                    category: formData.category,
                    progress: 0,
                    deadline: new Date(formData.deadline),
                  });
                }}
                disabled={createGoal.isPending}
              >
                {createGoal.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.isLoading ? (
          <div className="flex justify-center py-12 col-span-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : goals.data && goals.data.length > 0 ? (
          goals.data.map((goal: any) => (
            <div
              key={goal.id}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-foreground flex-1">{goal.title}</h3>
                <button
                  onClick={() => deleteGoal.mutate({ id: goal.id })}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>

              {goal.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{goal.description}</p>
              )}

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-semibold text-primary">{goal.progress}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                  {goal.category}
                </span>
                <span className="text-xs bg-white/10 text-muted-foreground px-2 py-1 rounded">
                  {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : "No deadline"}
                </span>
              </div>

              <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const newProgress = Math.min(goal.progress + 10, 100);
                    updateGoal.mutate({ id: goal.id, progress: newProgress });
                  }}
                >
                  +10%
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const newProgress = Math.max(goal.progress - 10, 0);
                    updateGoal.mutate({ id: goal.id, progress: newProgress });
                  }}
                >
                  -10%
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center py-12 text-muted-foreground col-span-full">
            No goals yet. Create one to get started!
          </p>
        )}
      </div>
    </div>
  );
}
