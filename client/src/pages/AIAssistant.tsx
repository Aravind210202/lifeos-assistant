import { Button } from "@/components/ui/button";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AITask {
  id: string;
  type: "resume" | "cover-letter" | "question" | "scoring";
  title: string;
  content: string;
  approved: boolean;
  createdAt: string;
}

function getAITasks(): AITask[] {
  const stored = localStorage.getItem("lifeos_ai_tasks");
  return stored ? JSON.parse(stored) : [];
}

function saveAITasks(tasks: AITask[]) {
  localStorage.setItem("lifeos_ai_tasks", JSON.stringify(tasks));
}

export default function AIAssistant() {
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "question" as "resume" | "cover-letter" | "question" | "scoring",
    title: "",
    content: "",
  });

  useEffect(() => {
    setTasks(getAITasks());
  }, []);

  const addTask = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const newTask: AITask = {
      id: Date.now().toString(),
      type: formData.type,
      title: formData.title,
      content: formData.content,
      approved: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [...tasks, newTask];
    setTasks(updated);
    saveAITasks(updated);
    setShowForm(false);
    setFormData({
      type: "question",
      title: "",
      content: "",
    });
    toast.success("Task created! Review and approve before using.");
  };

  const approveTask = (id: string) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, approved: true } : t
    );
    setTasks(updated);
    saveAITasks(updated);
    toast.success("Task approved!");
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    saveAITasks(updated);
    toast.success("Task deleted!");
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "resume":
        return "bg-purple-500/20 text-purple-500";
      case "cover-letter":
        return "bg-blue-500/20 text-blue-500";
      case "question":
        return "bg-yellow-500/20 text-yellow-400";
      case "scoring":
        return "bg-green-500/20 text-green-500";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const pendingTasks = tasks.filter((t) => !t.approved);
  const approvedTasks = tasks.filter((t) => t.approved);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 md:p-8 page">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">AI Assistant</h1>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>
        <p className="text-muted-foreground">AI-powered writing and analysis tools with approval workflow</p>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className=" bg-white border border-gray-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create AI Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Task Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="question">Answer Question</option>
                <option value="resume">Generate Resume</option>
                <option value="cover-letter">Generate Cover Letter</option>
                <option value="scoring">Score Opportunity</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
              <input
                type="text"
                placeholder="Task title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Content / Prompt</label>
              <textarea
                placeholder="Describe what you need..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={5}
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={addTask}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pending Approval */}
      {pendingTasks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">Pending Approval</h2>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div key={task.id} className=" bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 shadow-lg card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{task.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded inline-block mt-1 ${getTypeColor(task.type)}`}>
                      {task.type.replace("-", " ")}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{task.content}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveTask(task.id)}
                    className="flex-1 px-3 py-2 text-sm bg-green-500/20 text-green-500 rounded hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="flex-1 px-3 py-2 text-sm bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Tasks */}
      {approvedTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-green-500 mb-4">Approved & Ready</h2>
          <div className="space-y-3">
            {approvedTasks.map((task) => (
              <div key={task.id} className=" bg-green-500/10 border border-green-500/30 rounded-lg p-4 shadow-lg card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{task.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded inline-block mt-1 ${getTypeColor(task.type)}`}>
                      {task.type.replace("-", " ")}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">{task.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No AI tasks yet. Create one to get started!
        </p>
      )}
    </div>
  );
}
