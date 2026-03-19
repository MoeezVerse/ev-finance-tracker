
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, DollarSign, PiggyBank, BarChart3, LogOut, Wallet, Moon, Sun, Download, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExpenseForm } from "@/components/ExpenseForm";
import { IncomeForm } from "@/components/IncomeForm";
import { ExpenseList } from "@/components/ExpenseList";
import { FinancialChart } from "@/components/FinancialChart";
import { SavingsSuggestions } from "@/components/SavingsSuggestions";
import { DashboardView } from "@/components/DashboardView";
import { ProgressChart } from "@/components/ProgressChart";
import { useToast } from "@/hooks/use-toast";
import { exportTransactionsCSV } from "@/lib/exportCsv";

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

const navItems = [
  { key: 'overview', label: 'Overview', icon: DollarSign },
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'progress', label: 'Progress', icon: TrendingUp },
] as const;

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "1", type: "income", amount: 5000, category: "Salary", description: "Monthly salary", date: "2024-01-01" },
    { id: "2", type: "expense", amount: 1200, category: "Rent", description: "Monthly rent", date: "2024-01-02" },
    { id: "3", type: "expense", amount: 300, category: "Groceries", description: "Weekly groceries", date: "2024-01-03" },
  ]);
  
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [{ ...transaction, id: Date.now().toString() }, ...prev]);
    toast({
      title: "Transaction Added",
      description: `${transaction.type === 'income' ? 'Income' : 'Expense'} of $${transaction.amount} recorded.`,
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({ title: "Transaction Deleted", description: "Transaction removed." });
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;

  const statCards = [
    { label: 'Total Income', value: totalIncome, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Total Expenses', value: totalExpenses, icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10' },
    { label: 'Balance', value: balance, icon: DollarSign, color: balance >= 0 ? 'text-success' : 'text-destructive', bg: balance >= 0 ? 'bg-success/10' : 'bg-destructive/10' },
    { label: 'Savings Rate', value: null, icon: PiggyBank, color: 'text-info', bg: 'bg-info/10', display: `${savingsRate.toFixed(1)}%` },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold text-foreground tracking-tight hidden sm:block">FinanceTracker</h1>
            </div>

            <nav className="flex items-center gap-1">
              {navItems.map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  onClick={() => setActiveView(key)}
                  variant="ghost"
                  size="sm"
                  className={`text-xs sm:text-sm transition-all ${activeView === key ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Icon className="mr-1.5 h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <Button onClick={toggleTheme} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Button onClick={() => navigate('/profile')} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture} alt="Profile" />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {user?.user_metadata?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
              </Button>
              <Button onClick={signOut} variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {activeView === 'overview' && (
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {statCards.map((stat) => (
                <Card key={stat.label} className="glass-card overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.label}</span>
                      <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </div>
                    <div className={`text-xl sm:text-2xl font-bold tracking-tight ${stat.color}`}>
                      {stat.display ?? `$${stat.value!.toLocaleString()}`}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => setShowIncomeForm(true)} className="bg-success hover:bg-success/90 text-success-foreground shadow-lg shadow-success/20 transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Add Income
              </Button>
              <Button onClick={() => setShowExpenseForm(true)} variant="destructive" className="shadow-lg shadow-destructive/20 transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
              <Button onClick={() => exportTransactionsCSV(transactions)} variant="outline" className="transition-all">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>

            {/* Charts and Suggestions */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <FinancialChart transactions={transactions} />
              <SavingsSuggestions transactions={transactions} totalIncome={totalIncome} totalExpenses={totalExpenses} />
            </div>

            <ExpenseList transactions={transactions} onDelete={deleteTransaction} />
          </div>
        )}

        {activeView === 'dashboard' && (
          <div className="animate-fade-in">
            <DashboardView transactions={transactions} totalIncome={totalIncome} totalExpenses={totalExpenses} balance={balance} savingsRate={savingsRate} />
          </div>
        )}

        {activeView === 'progress' && (
          <div className="animate-fade-in">
            <ProgressChart transactions={transactions} />
          </div>
        )}

        {showIncomeForm && <IncomeForm onSubmit={addTransaction} onClose={() => setShowIncomeForm(false)} />}
        {showExpenseForm && <ExpenseForm onSubmit={addTransaction} onClose={() => setShowExpenseForm(false)} />}
      </main>
    </div>
  );
};

export default Index;
