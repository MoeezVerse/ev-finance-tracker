
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, DollarSign, PiggyBank, BarChart3, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ExpenseForm } from "@/components/ExpenseForm";
import { IncomeForm } from "@/components/IncomeForm";
import { ExpenseList } from "@/components/ExpenseList";
import { FinancialChart } from "@/components/FinancialChart";
import { SavingsSuggestions } from "@/components/SavingsSuggestions";
import { DashboardView } from "@/components/DashboardView";
import { ProgressChart } from "@/components/ProgressChart";
import { useToast } from "@/hooks/use-toast";

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "income",
      amount: 5000,
      category: "Salary",
      description: "Monthly salary",
      date: "2024-01-01"
    },
    {
      id: "2",
      type: "expense",
      amount: 1200,
      category: "Rent",
      description: "Monthly rent",
      date: "2024-01-02"
    },
    {
      id: "3",
      type: "expense",
      amount: 300,
      category: "Groceries",
      description: "Weekly groceries",
      date: "2024-01-03"
    }
  ]);
  
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    toast({
      title: "Transaction Added",
      description: `${transaction.type === 'income' ? 'Income' : 'Expense'} of $${transaction.amount} has been recorded.`,
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Transaction Deleted",
      description: "The transaction has been removed from your records.",
    });
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="container mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center py-4 sm:py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-emerald-800 mb-2">FinanceTracker</h1>
          <p className="text-emerald-600 text-base sm:text-lg">Take control of your financial future</p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
          <Button 
            onClick={() => setActiveView('overview')}
            variant={activeView === 'overview' ? 'default' : 'outline'}
            className="text-xs sm:text-sm"
          >
            <DollarSign className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Overview
          </Button>
          <Button 
            onClick={() => setActiveView('dashboard')}
            variant={activeView === 'dashboard' ? 'default' : 'outline'}
            className="text-xs sm:text-sm"
          >
            <BarChart3 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Dashboard
          </Button>
          <Button 
            onClick={() => setActiveView('progress')}
            variant={activeView === 'progress' ? 'default' : 'outline'}
            className="text-xs sm:text-sm"
          >
            <TrendingUp className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Progress
          </Button>
          <Button 
            onClick={signOut}
            variant="outline"
            className="text-xs sm:text-sm"
          >
            <LogOut className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Logout
          </Button>
        </div>

        {activeView === 'overview' && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <Card className="border-emerald-200 bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-emerald-700">Total Income</CardTitle>
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-emerald-800">${totalIncome.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-red-700">Total Expenses</CardTitle>
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-red-800">${totalExpenses.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className={`border-${balance >= 0 ? 'emerald' : 'red'}-200 bg-white/80 backdrop-blur-sm`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-xs sm:text-sm font-medium text-${balance >= 0 ? 'emerald' : 'red'}-700`}>Balance</CardTitle>
                  <DollarSign className={`h-3 w-3 sm:h-4 sm:w-4 text-${balance >= 0 ? 'emerald' : 'red'}-600`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-lg sm:text-2xl font-bold text-${balance >= 0 ? 'emerald' : 'red'}-800`}>
                    ${balance.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-blue-700">Savings Rate</CardTitle>
                  <PiggyBank className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-blue-800">{savingsRate.toFixed(1)}%</div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                onClick={() => setShowIncomeForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Income
              </Button>
              <Button 
                onClick={() => setShowExpenseForm(true)}
                className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </div>

            {/* Charts and Suggestions */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <FinancialChart transactions={transactions} />
              <SavingsSuggestions 
                transactions={transactions} 
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
              />
            </div>

            {/* Transaction List */}
            <ExpenseList transactions={transactions} onDelete={deleteTransaction} />
          </>
        )}

        {activeView === 'dashboard' && (
          <DashboardView 
            transactions={transactions}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            balance={balance}
            savingsRate={savingsRate}
          />
        )}

        {activeView === 'progress' && (
          <ProgressChart transactions={transactions} />
        )}

        {/* Forms */}
        {showIncomeForm && (
          <IncomeForm 
            onSubmit={addTransaction} 
            onClose={() => setShowIncomeForm(false)} 
          />
        )}
        
        {showExpenseForm && (
          <ExpenseForm 
            onSubmit={addTransaction} 
            onClose={() => setShowExpenseForm(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default Index;
