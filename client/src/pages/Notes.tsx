import { Button } from "@/components/ui/button";
import { Plus, Search, Trash2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CATEGORIES = ["quick", "study", "ideas", "life-admin"];

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
}

function getNotes(): Note[] {
  const stored = localStorage.getItem("lifeos_notes");
  return stored ? JSON.parse(stored) : [];
}

function saveNotes(notes: Note[]) {
  localStorage.setItem("lifeos_notes", JSON.stringify(notes));
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "quick",
    tags: "",
  });

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  const addNote = () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a note title");
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      createdAt: new Date().toISOString(),
    };

    const updated = [...notes, newNote];
    setNotes(updated);
    saveNotes(updated);
    setShowForm(false);
    setFormData({
      title: "",
      content: "",
      category: "quick",
      tags: "",
    });
    toast.success("Note created!");
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
    toast.success("Note deleted!");
  };

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;

    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [notes, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 md:p-8 page">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Notes</h1>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Note
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Add Note Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="backdrop-blur-xl bg-black/80 border border-white/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
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
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={5}
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
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="tag1, tag2, tag3"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={addNote}>Add</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 col-span-full">
            {notes.length === 0 ? "No notes yet. Add one to get started!" : "No notes match your search."}
          </p>
        ) : (
          filteredNotes.map((note) => (
            <div key={note.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-4 shadow-lg card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{note.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{note.category}</p>
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1 hover:bg-red-500/20 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>

              {note.content && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{note.content}</p>
              )}

              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-3">
                {new Date(note.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
