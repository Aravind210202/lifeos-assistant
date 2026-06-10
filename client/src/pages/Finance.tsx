import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16", "#06b6d4", "#64748b"];

export default function Finance() {
  const { user, loading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "Food" as const,
    type: "expense" as const,
    date: new Date().toISOString().split("T")[0],
  });

  const transactions = trpc.finance.transactions.useQuery({} as any, { enabled: !!user });
  const createTransaction = trpc.finance.addTransaction.useMutation({
    onSuccess: () => {
      transactions.refetch();
      setShowForm(false);
      setFormData({
        description: "",
        amount: "",
        category: "Food" as const,
        type: "expense" as const,
        date: new Date().toISOString().split("T")[0],
      });
      toast.success("Transaction added!");
    },
    onError: () => {
      toast.error("Failed to add transaction");
    },
  });
  const deleteTransaction = trpc.finance.deleteTransaction.useMutation({
    onSuccess: () => {
      transactions.refetch();
      toast.success("Transaction deleted!");
    },
  });

  // Calculate statistics
  const stats = useMemo(() => {
    if (!transactions.data) return { income: 0, expenses: 0, balance: 0, byCategory: [] };

    const income = transactions.data
      .filter((t: any) => t.type === "income")
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const expenses = transactions.data
      .filter((t: any) => t.type === "expense")
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    // Group by category
    const byCategory: Record<string, number> = {};
    transactions.data.forEach((t: any) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    const categoryData = Object.entries(byCategory).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    }));

    return {
      income,
      expenses,
      balance: income - expenses,
      byCategory: categoryData,
    };
  }, [transactions.data]);

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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Finance</h1>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Transaction
          </Button>
        </div>
        <p className="text-muted-foreground">Track your income and expenses</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 shadow-lg">
          <p className="text-sm text-muted-foreground mb-1">Income</p>
          <p className="text-2xl font-bold text-green-400">${stats.income.toFixed(2)}</p>
        </div>
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 shadow-lg">
          <p className="text-sm text-muted-foreground mb-1">Expenses</p>
          <p className="text-2xl font-bold text-red-400">${stats.expenses.toFixed(2)}</p>
        </div>
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 shadow-lg">
          <p className="text-sm text-muted-foreground mb-1">Balance</p>
          <p className={`text-2xl font-bold ${stats.balance >= 0 ? "text-green-400" : "text-red-400"}`}>
            ${stats.balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="backdrop-blur-xl bg-black/80 border border-white/20">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
              <input
                type="text"
                placeholder="Transaction description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Amount</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Rent">Rent</option>
                <option value="Groceries">Groceries</option>
                <option value="Transport">Transport</option>
                <option value="Food">Food</option>
                <option value="Subscriptions">Subscriptions</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Study">Study</option>
                <option value="Travel">Travel</option>
                <option value="Health">Health</option>
                <option value="Bills">Bills</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!formData.description.trim() || !formData.amount) {
                    toast.error("Please fill all fields");
                    return;
                  }
                  createTransaction.mutate({
                    description: formData.description,
                    amount: parseFloat(formData.amount) as any,
                    category: formData.category,
                    type: formData.type,
                    date: new Date(formData.date),
                  });
                }}
                disabled={createTransaction.isPending}
              >
                {createTransaction.isPending ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-foreground mb-4">Spending by Category</h3>
          {stats.byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.byCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }: any) => `${name}: $${value}` as any}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.byCategory.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">No data yet</p>
          )}
        </div>

        {/* Bar Chart */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Categories</h3>
          {stats.byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">No data yet</p>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h3>
        {transactions.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : transactions.data && transactions.data.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {transactions.data.map((transaction: any) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">{transaction.category}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className={`font-semibold ${transaction.type === "income" ? "text-green-400" : "text-red-400"}`}>
                    {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                  </p>
                  <button
                    onClick={() => deleteTransaction.mutate({ id: transaction.id })}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-12 text-muted-foreground">No transactions yet</p>
        )}
      </div>
    </div>
  );
}
