import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, Edit2, ToggleRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MEMORY_TYPES = [
  "resume_detail",
  "education",
  "work_history",
  "achievement",
  "preferred_answer",
  "salary_preference",
  "work_rights",
  "skill",
  "writing_tone",
  "recurring_info",
] as const;

export default function Memory() {
  const { user, loading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<(typeof MEMORY_TYPES)[number]>("resume_detail");
  const [formData, setFormData] = useState({
    type: "resume_detail" as const,
    key: "",
    value: "",
  });

  const memories = trpc.memory.list.useQuery(undefined, { enabled: !!user });
  const createMemory = trpc.memory.save.useMutation({
    onSuccess: () => {
      memories.refetch();
      setShowForm(false);
      setFormData({
        type: "resume_detail" as const,
        key: "",
        value: "",
      });
      toast.success("Memory saved!");
    },
    onError: () => {
      toast.error("Failed to save memory");
    },
  });
  const updateMemory = trpc.memory.update.useMutation({
    onSuccess: () => {
      memories.refetch();
      toast.success("Memory updated!");
    },
  });
  const deleteMemory = trpc.memory.delete.useMutation({
    onSuccess: () => {
      memories.refetch();
      toast.success("Memory deleted!");
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredMemories = memories.data?.filter((m: any) => m.type === selectedType) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 md:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Personal Memory</h1>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Memory
          </Button>
        </div>
        <p className="text-muted-foreground">Store and manage your personal information for AI assistance</p>
      </div>

      {/* Add Memory Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="backdrop-blur-xl bg-black/80 border border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Personal Memory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Memory Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {MEMORY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Key/Label</label>
              <input
                type="text"
                placeholder="e.g., 'Python', 'Leadership', 'Current Company'"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Value/Details</label>
              <textarea
                placeholder="Enter the details or content for this memory..."
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!formData.key.trim() || !formData.value.trim()) {
                    toast.error("Please fill all fields");
                    return;
                  }
                  createMemory.mutate({
                    type: formData.type,
                    key: formData.key,
                    value: formData.value,
                  });
                }}
                disabled={createMemory.isPending}
              >
                {createMemory.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Memory Type Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {MEMORY_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedType === type
                ? "backdrop-blur-xl bg-primary text-primary-foreground border border-primary/50"
                : "backdrop-blur-xl bg-white/10 border border-white/20 text-foreground hover:bg-white/20"
            }`}
          >
            {type.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Memories List */}
      <div className="space-y-3">
        {memories.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredMemories.length > 0 ? (
          filteredMemories.map((memory: any) => (
            <div
              key={memory.id}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{memory.key}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{memory.value}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() =>
                      updateMemory.mutate({
                        id: memory.id,
                        isEnabled: !memory.isEnabled,
                      })
                    }
                    className={`p-2 rounded transition-colors ${
                      memory.isEnabled
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    <ToggleRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMemory.mutate({ id: memory.id })}
                    className="p-2 rounded hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              {!memory.isEnabled && (
                <p className="text-xs text-yellow-400 mt-2">This memory is currently disabled</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-center py-12 text-muted-foreground backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg">
            No memories of this type yet. Add one to get started!
          </p>
        )}
      </div>
    </div>
  );
}
