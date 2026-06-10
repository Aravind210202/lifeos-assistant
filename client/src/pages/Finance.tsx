import { Plus, Trash2, Upload } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { parseCommBankCSV, categorizeTransaction, validateCSVFile } from "@/lib/csvParser";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16", "#06b6d4", "#64748b"];

const CATEGORIES = ["Rent", "Groceries", "Transport", "Food", "Subscriptions", "Shopping", "Entertainment", "Study", "Travel", "Health", "Bills", "Other"];

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
}

function getTransactions(): Transaction[] {
  const stored = localStorage.getItem("lifeos_transactions");
  return stored ? JSON.parse(stored) : [];
}

function saveTransactions(transactions: Transaction[]) {
  localStorage.setItem("lifeos_transactions", JSON.stringify(transactions));
}

export default function Finance() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "Food",
    type: "income" as "income" | "expense",
    date: new Date().toISOString().split("T")[0],
  });

  // Load transactions on mount
  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  const addTransaction = () => {
    if (!formData.description.trim() || !formData.amount) {
      toast.error("Please fill in all fields");
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      type: formData.type,
      date: formData.date,
    };

    const updated = [...transactions, newTransaction];
    setTransactions(updated);
    saveTransactions(updated);
    toast.success("Transaction added!");
    setShowForm(false);
    setFormData({
      description: "",
      amount: "",
      category: "Food",
      type: "expense",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
    toast.success("Transaction deleted!");
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateCSVFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    const text = await file.text();
    const parsed = parseCommBankCSV(text);

    if (parsed.length === 0) {
      toast.error("No valid transactions found in CSV");
      return;
    }

    setImportPreview(parsed);
    setShowImport(true);
  };

  const confirmImport = () => {
    const newTransactions = importPreview.map((p) => ({
      id: Date.now().toString() + Math.random(),
      description: p.description,
      amount: p.amount,
      category: p.category,
      type: p.type,
      date: p.date,
    }));

    const updated = [...transactions, ...newTransactions];
    setTransactions(updated);
    saveTransactions(updated);
    toast.success(`Imported ${newTransactions.length} transactions!`);
    setShowImport(false);
    setImportPreview([]);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const income = transactions.filter((t) => t.type === "income");

    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

    // Weekly breakdown
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weeklyData: Record<string, number> = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      weeklyData[dayNames[i]] = 0;
    }
    
    expenses.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate >= weekStart && tDate <= weekEnd) {
        const dayIndex = tDate.getDay();
        weeklyData[dayNames[dayIndex]] += t.amount;
      }
    });
    
    const weeklyChartData = dayNames.map(day => ({
      name: day,
      amount: weeklyData[day]
    }));

    const categoryBreakdown = CATEGORIES.map((cat) => {
      const amount = expenses
        .filter((t) => t.category === cat)
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: cat, value: amount };
    }).filter((c) => c.value > 0);

    return { totalExpense, totalIncome, categoryBreakdown, weeklyChartData };
  }, [transactions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 md:p-8 page">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Finance</h1>
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                className="hidden"
              />
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Import CSV</span>
              </div>
            </label>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          </div>
        </div>
        <p className="text-muted-foreground">Track income and expenses</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 card">
          <p className="text-sm text-muted-foreground mb-2">Total Income</p>
          <p className="text-3xl font-bold text-green-400">${stats.totalIncome.toFixed(2)}</p>
        </div>
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 card">
          <p className="text-sm text-muted-foreground mb-2">Total Expenses</p>
          <p className="text-3xl font-bold text-red-400">${stats.totalExpense.toFixed(2)}</p>
        </div>
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 card">
          <p className="text-sm text-muted-foreground mb-2">Balance</p>
          <p className={`text-3xl font-bold ${stats.totalIncome - stats.totalExpense >= 0 ? "text-green-400" : "text-red-400"}`}>
            ${(stats.totalIncome - stats.totalExpense).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Weekly Summary Chart */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 card mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Weekly Spending Summary</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.weeklyChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }} />
            <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category Breakdown */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 card">
          <h2 className="text-xl font-semibold text-foreground mb-4">Spending by Category</h2>
          {stats.categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.categoryBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-12">No spending data yet</p>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 card">
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Transactions</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {transactions.slice(-10).reverse().map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{t.category} • {t.date}</p>
                </div>
                <p className={`font-semibold ${t.type === "income" ? "text-green-400" : "text-red-400"}`}>
                  {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
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
                placeholder="e.g., Grocery shopping"
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
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "income" | "expense" })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>
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
              <label className="text-sm font-medium text-foreground mb-1 block">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-white/20 text-foreground hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addTransaction}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CSV Import Preview Dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="backdrop-blur-xl bg-black/80 border border-white/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Transactions Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {importPreview.length} transactions. Review and confirm to import:
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {importPreview.map((t, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-foreground">{t.description}</p>
                    <p className={`font-semibold ${t.type === "income" ? "text-green-400" : "text-red-400"}`}>
                      {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t.category}</span>
                    <span>{t.date}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <button
                onClick={() => setShowImport(false)}
                className="px-4 py-2 rounded-lg border border-white/20 text-foreground hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmImport}
                className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
              >
                Import {importPreview.length} Transactions
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transactions List */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 card">
        <h2 className="text-xl font-semibold text-foreground mb-4">All Transactions</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {transactions.length > 0 ? (
            transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{t.category} • {t.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className={`font-semibold ${t.type === "income" ? "text-green-400" : "text-red-400"}`}>
                    {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                  </p>
                  <button
                    onClick={() => deleteTransaction(t.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-8 text-muted-foreground">No transactions yet. Add one or import from CSV!</p>
          )}
        </div>
      </div>
    </div>
  );
}
