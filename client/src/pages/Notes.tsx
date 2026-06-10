import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Search, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Notes() {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "quick" as const,
    tags: "" as string,
  });

  const notes = trpc.notes.list.useQuery(undefined, { enabled: !!user });
  const createNote = trpc.notes.create.useMutation({
    onSuccess: () => {
      notes.refetch();
      setShowForm(false);
      setFormData({
        title: "",
        content: "",
        category: "quick" as const,
        tags: "",
      });
      toast.success("Note created!");
    },
    onError: () => {
      toast.error("Failed to create note");
    },
  });
  const deleteNote = trpc.notes.delete.useMutation({
    onSuccess: () => {
      notes.refetch();
      toast.success("Note deleted!");
    },
  });

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    if (!notes.data) return [];
    if (!searchQuery.trim()) return notes.data;

    const query = searchQuery.toLowerCase();
    return notes.data.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [notes.data, searchQuery]);

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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Notes</h1>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Note
          </Button>
        </div>
        <p className="text-muted-foreground">Capture your thoughts and ideas</p>
      </div>

      {/* Create Note Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="backdrop-blur-xl bg-black/80 border border-white/20">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
              <input
                type="text"
                placeholder="Note title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Content</label>
              <textarea
                placeholder="Write your note..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={5}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="quick">Quick Note</option>
                <option value="study">Study Notes</option>
                <option value="ideas">Ideas</option>
                <option value="life_admin">Life Admin</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Tags (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. important, work, review"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!formData.title.trim() || !formData.content.trim()) {
                    toast.error("Please enter title and content");
                    return;
                  }
                  createNote.mutate({
                    title: formData.title,
                    content: formData.content,
                    category: formData.category,
                    tags: formData.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter((t) => t.length > 0),
                  });
                }}
                disabled={createNote.isPending}
              >
                {createNote.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.isLoading ? (
          <div className="flex justify-center py-12 col-span-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredNotes && filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-foreground flex-1">{note.title}</h3>
                <button
                  onClick={() => deleteNote.mutate({ id: note.id })}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{note.content}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                  {note.category}
                </span>
                {note.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-white/10 text-muted-foreground px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center py-12 text-muted-foreground col-span-full">
            {searchQuery ? "No notes match your search" : "No notes yet. Start writing!"}
          </p>
        )}
      </div>
    </div>
  );
}
