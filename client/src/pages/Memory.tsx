import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MemoryItem {
  id: string;
  category: string;
  key: string;
  value: string;
  enabled: boolean;
  createdAt: string;
}

const CATEGORIES = [
  "Resume Details",
  "Education",
  "Work History",
  "Achievements",
  "Preferred Answers",
  "Salary Preferences",
  "Visa/Work Rights",
  "Skills",
  "Writing Tone",
  "Other",
];

function getMemoryItems(): MemoryItem[] {
  const stored = localStorage.getItem("lifeos_memory");
  return stored ? JSON.parse(stored) : [];
}

function saveMemoryItems(items: MemoryItem[]) {
  localStorage.setItem("lifeos_memory", JSON.stringify(items));
}

export default function Memory() {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: "Resume Details",
    key: "",
    value: "",
  });

  useEffect(() => {
    setItems(getMemoryItems());
  }, []);

  const addOrUpdateItem = () => {
    if (!formData.key.trim() || !formData.value.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (editingId) {
      const updated = items.map((item) =>
        item.id === editingId
          ? { ...item, category: formData.category, key: formData.key, value: formData.value }
          : item
      );
      setItems(updated);
      saveMemoryItems(updated);
      toast.success("Memory updated!");
    } else {
      const newItem: MemoryItem = {
        id: Date.now().toString(),
        category: formData.category,
        key: formData.key,
        value: formData.value,
        enabled: true,
        createdAt: new Date().toISOString(),
      };

      const updated = [...items, newItem];
      setItems(updated);
      saveMemoryItems(updated);
      toast.success("Memory saved!");
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({
      category: "Resume Details",
      key: "",
      value: "",
    });
  };

  const deleteItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    saveMemoryItems(updated);
    toast.success("Memory deleted!");
  };

  const toggleEnabled = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    setItems(updated);
    saveMemoryItems(updated);
  };

  const editItem = (item: MemoryItem) => {
    setFormData({
      category: item.category,
      key: item.key,
      value: item.value,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const groupedItems = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = items.filter((item) => item.category === cat);
      return acc;
    },
    {} as Record<string, MemoryItem[]>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 md:p-8 page">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Personal Memory</h1>
          <Button
            onClick={() => {
              setEditingId(null);
              setFormData({
                category: "Resume Details",
                key: "",
                value: "",
              });
              setShowForm(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Memory
          </Button>
        </div>
        <p className="text-muted-foreground">Store personal information for AI-powered recommendations</p>
      </div>

      {/* Add/Edit Memory Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="backdrop-blur-xl bg-black/80 border border-white/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Memory" : "Add Memory"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <label className="text-sm font-medium text-foreground mb-1 block">Key / Label</label>
              <input
                type="text"
                placeholder="e.g., 'Current Job Title' or 'GitHub URL'"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Value / Content</label>
              <textarea
                placeholder="Enter the information to remember..."
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
              />
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
              <Button onClick={addOrUpdateItem}>{editingId ? "Update" : "Save"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Memory Items by Category */}
      <div className="space-y-8">
        {CATEGORIES.map((category) => {
          const categoryItems = groupedItems[category] || [];
          if (categoryItems.length === 0) return null;

          return (
            <div key={category}>
              <h2 className="text-xl font-semibold text-foreground mb-4">{category}</h2>
              <div className="space-y-3">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className={`backdrop-blur-xl border rounded-lg p-4 shadow-lg card transition-opacity ${
                      item.enabled
                        ? "bg-white/10 border-white/20"
                        : "bg-white/5 border-white/10 opacity-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.key}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.value}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => editItem(item)}
                          className="p-1 hover:bg-blue-500/20 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleEnabled(item.id)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        item.enabled
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                      }`}
                    >
                      {item.enabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No memories saved yet. Add one to get started!
        </p>
      )}
    </div>
  );
}
