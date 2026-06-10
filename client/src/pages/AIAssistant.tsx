import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Send, CheckCircle, XCircle, Copy } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Streamdown } from "streamdown";

type AssistantMode = "resume" | "cover_letter" | "job_scoring" | "question_answering";

export default function AIAssistant() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<AssistantMode>("resume");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalData, setApprovalData] = useState<{
    type: string;
    content: string;
    metadata?: any;
  } | null>(null);

  // For now, we'll create a placeholder that shows the approval workflow
  // The actual LLM integration would go here
  const generateResume = trpc.system.notifyOwner.useMutation({
    onSuccess: (data: any) => {
      setOutput(data.content);
      setApprovalData({
        type: "resume",
        content: data.content,
        metadata: data.metadata,
      });
      setShowApprovalDialog(true);
      setIsGenerating(false);
    },
    onError: () => {
      toast.error("Failed to generate resume");
      setIsGenerating(false);
    },
  });

  const generateCoverLetter = trpc.system.notifyOwner.useMutation({
    onSuccess: (data: any) => {
      setOutput(data.content);
      setApprovalData({
        type: "cover_letter",
        content: data.content,
        metadata: data.metadata,
      });
      setShowApprovalDialog(true);
      setIsGenerating(false);
    },
    onError: () => {
      toast.error("Failed to generate cover letter");
      setIsGenerating(false);
    },
  });

  const scoreJob = trpc.system.notifyOwner.useMutation({
    onSuccess: (data: any) => {
      setOutput(data.analysis);
      setApprovalData({
        type: "job_scoring",
        content: data.analysis,
        metadata: { score: data.score },
      });
      setShowApprovalDialog(true);
      setIsGenerating(false);
    },
    onError: () => {
      toast.error("Failed to score job");
      setIsGenerating(false);
    },
  });

  const answerQuestion = trpc.system.notifyOwner.useMutation({
    onSuccess: (data: any) => {
      setOutput(data.suggestedAnswer);
      setApprovalData({
        type: "question_answering",
        content: data.suggestedAnswer,
        metadata: { question: input },
      });
      setShowApprovalDialog(true);
      setIsGenerating(false);
    },
    onError: () => {
      toast.error("Failed to generate answer");
      setIsGenerating(false);
    },
  });

  const saveToMemory = trpc.memory.save.useMutation({
    onSuccess: () => {
      toast.success("Saved to personal memory!");
      setShowApprovalDialog(false);
      setOutput("");
      setInput("");
    },
  });

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error("Please provide input");
      return;
    }

    setIsGenerating(true);

    switch (mode) {
      case "resume":
        generateResume.mutate({ title: "Resume", content: input });
        break;
      case "cover_letter":
        generateCoverLetter.mutate({ title: "Cover Letter", content: input });
        break;
      case "job_scoring":
        scoreJob.mutate({ title: "Job Scoring", content: input });
        break;
      case "question_answering":
        answerQuestion.mutate({ title: "Q&A", content: input });
        break;
    }
  };

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
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">AI Assistant</h1>
        <p className="text-muted-foreground">
          Generate tailored resumes, cover letters, and get job insights with AI. All outputs require your approval before use.
        </p>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { id: "resume", label: "Resume", icon: "📄" },
          { id: "cover_letter", label: "Cover Letter", icon: "✉️" },
          { id: "job_scoring", label: "Job Scoring", icon: "⭐" },
          { id: "question_answering", label: "Q&A", icon: "❓" },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as AssistantMode)}
            className={`p-4 rounded-lg text-sm font-medium transition-all backdrop-blur-xl border ${
              mode === m.id
                ? "bg-primary text-primary-foreground border-primary/50"
                : "bg-white/10 border-white/20 text-foreground hover:bg-white/20"
            }`}
          >
            <div className="text-lg mb-1">{m.icon}</div>
            {m.label}
          </button>
        ))}
      </div>

      {/* Input Section */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 shadow-lg mb-6">
        <label className="text-sm font-medium text-foreground mb-3 block">
          {mode === "resume" && "Paste the job description"}
          {mode === "cover_letter" && "Paste the job description"}
          {mode === "job_scoring" && "Paste the job description to analyze"}
          {mode === "question_answering" && "Ask a question"}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "resume"
              ? "Paste job description here..."
              : mode === "cover_letter"
                ? "Paste job description here..."
                : mode === "job_scoring"
                  ? "Paste job description here..."
                  : "Ask any job-related question..."
          }
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={6}
        />
        <div className="flex justify-end mt-4">
          <Button onClick={handleGenerate} disabled={isGenerating || !input.trim()} className="gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="backdrop-blur-xl bg-black/80 border border-white/20 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review AI-Generated Content</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">Generated Content:</p>
              <div className="text-sm text-foreground max-h-64 overflow-y-auto">
                <Streamdown>{output}</Streamdown>
              </div>
            </div>

            {approvalData?.metadata?.score && (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-sm font-semibold text-foreground">
                  Job Match Score: <span className="text-primary">{approvalData.metadata.score}%</span>
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  toast.success("Copied to clipboard!");
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowApprovalDialog(false)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (approvalData) {
                    saveToMemory.mutate({
                      type: "preferred_answer",
                      key: approvalData.type,
                      value: output,
                    });
                  }
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve & Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Output Display */}
      {output && !showApprovalDialog && (
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-foreground mb-4">Generated Content</h3>
          <div className="prose prose-invert max-w-none text-sm">
            <Streamdown>{output}</Streamdown>
          </div>
        </div>
      )}
    </div>
  );
}
