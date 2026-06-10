import { Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Finance() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Finance Dashboard</h1>
      <p className="text-muted-foreground mb-8">Track your income, expenses, and budgets</p>
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-8">
        <p className="text-center text-muted-foreground">Finance module coming soon...</p>
      </div>
    </div>
  );
}
