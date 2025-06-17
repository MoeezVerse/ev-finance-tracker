
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Calendar } from "lucide-react";
import { Transaction } from "@/pages/Index";

interface DashboardViewProps {
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
}

export const DashboardView = ({ 
  transactions, 
  totalIncome, 
  totalExpenses, 
  balance, 
  savingsRate 
}: DashboardViewProps) => {
  // Calculate monthly data
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate spending by category
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(expensesByCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Budget goals (sample data - would come from user settings)
  const budgetGoals = {
    'Groceries': 500,
    'Rent': 1500,
    'Entertainment': 200,
    'Transportation': 300,
    'Utilities': 150
  };

  return (
    <div className="space-y-6">
      {/* Monthly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-emerald-700 flex items-center text-sm sm:text-base">
              <Calendar className="mr-2 h-4 w-4" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Income</span>
              <span className="text-sm sm:text-base font-semibold text-emerald-600">${monthlyIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Expenses</span>
              <span className="text-sm sm:text-base font-semibold text-red-600">${monthlyExpenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-xs sm:text-sm font-medium">Net</span>
              <span className={`text-sm sm:text-base font-bold ${monthlyIncome - monthlyExpenses >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                ${(monthlyIncome - monthlyExpenses).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-700 flex items-center text-sm sm:text-base">
              <Target className="mr-2 h-4 w-4" />
              Savings Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{savingsRate.toFixed(1)}%</div>
              <div className="text-xs sm:text-sm text-gray-500">Current Rate</div>
            </div>
            <Progress value={Math.min(savingsRate, 100)} className="h-2" />
            <div className="text-xs sm:text-sm text-center text-gray-600">
              Goal: 20% savings rate
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-700 flex items-center text-sm sm:text-base">
              <TrendingUp className="mr-2 h-4 w-4" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span>Total Transactions</span>
              <span className="font-semibold">{transactions.length}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span>Avg Transaction</span>
              <span className="font-semibold">
                ${transactions.length > 0 ? (totalExpenses / transactions.filter(t => t.type === 'expense').length || 0).toFixed(0) : '0'}
              </span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span>Categories</span>
              <span className="font-semibold">{Object.keys(expensesByCategory).length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Spending Categories */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-800 text-base sm:text-lg">Top Spending Categories</CardTitle>
          <CardDescription>Your highest expense categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCategories.map(([category, amount]) => {
              const budget = budgetGoals[category] || amount * 1.2;
              const percentage = (amount / budget) * 100;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold">${amount.toLocaleString()}</span>
                      <div className="text-xs text-gray-500">of ${budget.toLocaleString()}</div>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className={`h-2 ${percentage > 100 ? 'bg-red-100' : 'bg-gray-200'}`}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{percentage.toFixed(1)}% of budget</span>
                    {percentage > 100 && <span className="text-red-500">Over budget!</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-emerald-700 flex items-center text-base sm:text-lg">
              <TrendingUp className="mr-2 h-4 w-4" />
              Recent Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions
                .filter(t => t.type === 'income')
                .slice(0, 3)
                .map(transaction => (
                  <div key={transaction.id} className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium">{transaction.description}</div>
                      <div className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</div>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">
                      +${transaction.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center text-base sm:text-lg">
              <TrendingDown className="mr-2 h-4 w-4" />
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions
                .filter(t => t.type === 'expense')
                .slice(0, 3)
                .map(transaction => (
                  <div key={transaction.id} className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium">{transaction.description}</div>
                      <div className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</div>
                    </div>
                    <span className="text-sm font-semibold text-red-600">
                      -${transaction.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
