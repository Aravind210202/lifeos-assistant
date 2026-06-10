import { Button } from "@/components/ui/button";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PIPELINE_STAGES = ["Saved", "Applying", "Applied", "Interview", "Offer", "Rejected"] as const;

interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  jobLink: string;
  status: typeof PIPELINE_STAGES[number];
  dateApplied: string;
}

function getApplications(): JobApplication[] {
  const stored = localStorage.getItem("lifeos_job_applications");
  return stored ? JSON.parse(stored) : [];
}

function saveApplications(apps: JobApplication[]) {
  localStorage.setItem("lifeos_job_applications", JSON.stringify(apps));
}

export default function JobApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    location: "",
    jobLink: "",
    status: "Saved" as typeof PIPELINE_STAGES[number],
  });

  useEffect(() => {
    setApplications(getApplications());
  }, []);

  const addApplication = () => {
    if (!formData.company.trim() || !formData.role.trim()) {
      toast.error("Please fill company and role");
      return;
    }

    const newApp: JobApplication = {
      id: Date.now().toString(),
      company: formData.company,
      role: formData.role,
      location: formData.location,
      jobLink: formData.jobLink,
      status: formData.status,
      dateApplied: new Date().toISOString().split("T")[0],
    };

    const updated = [...applications, newApp];
    setApplications(updated);
    saveApplications(updated);
    setShowForm(false);
    setFormData({
      company: "",
      role: "",
      location: "",
      jobLink: "",
      status: "Saved",
    });
    toast.success("Job application added!");
  };

  const updateApplicationStatus = (id: string, newStatus: typeof PIPELINE_STAGES[number]) => {
    const updated = applications.map((app) =>
      app.id === id ? { ...app, status: newStatus } : app
    );
    setApplications(updated);
    saveApplications(updated);
    toast.success("Application updated!");
  };

  const deleteApplication = (id: string) => {
    const updated = applications.filter((app) => app.id !== id);
    setApplications(updated);
    saveApplications(updated);
    toast.success("Application deleted!");
  };

  // Group applications by status
  const applicationsByStatus = useMemo(() => {
    const grouped: Record<string, JobApplication[]> = {};
    PIPELINE_STAGES.forEach((stage) => {
      grouped[stage] = [];
    });

    applications.forEach((app) => {
      if (grouped[app.status]) {
        grouped[app.status].push(app);
      }
    });

    return grouped;
  }, [applications]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 md:p-8 page">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Job Applications</h1>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Application
          </Button>
        </div>
        <p className="text-muted-foreground">Track your job applications with Kanban pipeline</p>
      </div>

      {/* Add Application Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="backdrop-blur-xl bg-black/80 border border-white/20">
          <DialogHeader>
            <DialogTitle>Add Job Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Company</label>
                <input
                  type="text"
                  placeholder="Company name"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Role</label>
                <input
                  type="text"
                  placeholder="Job title"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Location</label>
              <input
                type="text"
                placeholder="City, Country"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Job Link</label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.jobLink}
                onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {PIPELINE_STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={addApplication}>Add</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {PIPELINE_STAGES.map((stage) => (
          <div key={stage} className="flex flex-col">
            <div className="mb-4">
              <h3 className="font-semibold text-foreground text-sm">{stage}</h3>
              <p className="text-xs text-muted-foreground">
                {(applicationsByStatus[stage] || []).length} applications
              </p>
            </div>

            <div className="space-y-3 flex-1">
              {(applicationsByStatus[stage] || []).map((app) => (
                <div
                  key={app.id}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-3 shadow-lg hover:shadow-xl transition-all group card"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{app.company}</p>
                      <p className="text-xs text-muted-foreground truncate">{app.role}</p>
                    </div>
                    <button
                      onClick={() => deleteApplication(app.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>

                  {app.location && (
                    <p className="text-xs text-muted-foreground mb-2">{app.location}</p>
                  )}

                  <div className="flex gap-2">
                    {stage !== "Rejected" && stage !== "Offer" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs flex-1"
                        onClick={() => {
                          const currentIndex = PIPELINE_STAGES.indexOf(stage);
                          if (currentIndex < PIPELINE_STAGES.length - 1) {
                            updateApplicationStatus(app.id, PIPELINE_STAGES[currentIndex + 1]);
                          }
                        }}
                      >
                        Move →
                      </Button>
                    )}
                    {app.jobLink && (
                      <a
                        href={app.jobLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                      >
                        <ExternalLink className="w-4 h-4 text-primary hover:text-primary/80" />
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {(!applicationsByStatus[stage] || applicationsByStatus[stage].length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-8">No applications</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
