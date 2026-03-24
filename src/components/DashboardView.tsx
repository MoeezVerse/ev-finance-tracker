
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Calendar } from "lucide-react";
import { Transaction } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { BudgetGoals } from "@/components/BudgetGoals";

interface DashboardViewProps {
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
}

export const DashboardView = ({ transactions, totalIncome, totalExpenses, balance, savingsRate }: DashboardViewProps) => {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const [budgetGoals, setBudgetGoals] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user) {
      supabase.from('budget_goals').select('category, amount').eq('user_id', user.id)
        .then(({ data }) => {
          if (data) {
            const goals: Record<string, number> = {};
            data.forEach(g => { goals[g.category] = Number(g.amount); });
            setBudgetGoals(goals);
          }
        });
    }
  }, [user]);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthlyTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const expensesByCategory = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(expensesByCategory).sort(([,a], [,b]) => b - a).slice(0, 5);

  

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground flex items-center text-sm sm:text-base">
              <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center mr-3">
                <Calendar className="h-4 w-4 text-info" />
              </div>
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-muted-foreground">Income</span>
              <span className="text-sm sm:text-base font-semibold text-success">{formatAmount(monthlyIncome)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-muted-foreground">Expenses</span>
              <span className="text-sm sm:text-base font-semibold text-destructive">{formatAmount(monthlyExpenses)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-border pt-2">
              <span className="text-xs sm:text-sm font-medium text-foreground">Net</span>
              <span className={`text-sm sm:text-base font-bold ${monthlyIncome - monthlyExpenses >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatAmount(monthlyIncome - monthlyExpenses)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground flex items-center text-sm sm:text-base">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                <Target className="h-4 w-4 text-primary" />
              </div>
              Savings Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">{savingsRate.toFixed(1)}%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Current Rate</div>
            </div>
            <Progress value={Math.min(savingsRate, 100)} className="h-2" />
            <div className="text-xs sm:text-sm text-center text-muted-foreground">Goal: 20% savings rate</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground flex items-center text-sm sm:text-base">
              <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center mr-3">
                <TrendingUp className="h-4 w-4 text-warning" />
              </div>
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Total Transactions</span>
              <span className="font-semibold text-foreground">{transactions.length}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Avg Transaction</span>
              <span className="font-semibold text-foreground">
                {transactions.length > 0 ? formatAmount(Number((totalExpenses / (transactions.filter(t => t.type === 'expense').length || 1)).toFixed(0))) : formatAmount(0)}
              </span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Categories</span>
              <span className="font-semibold text-foreground">{Object.keys(expensesByCategory).length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Spending Categories */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground text-base sm:text-lg">Top Spending Categories</CardTitle>
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
                    <span className="text-sm font-medium text-foreground">{category}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-foreground">{formatAmount(amount)}</span>
                      <div className="text-xs text-muted-foreground">of {formatAmount(budget)}</div>
                    </div>
                  </div>
                  <Progress value={Math.min(percentage, 100)} className={`h-2 ${percentage > 100 ? '[&>div]:bg-destructive' : ''}`} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentage.toFixed(1)}% of budget</span>
                    {percentage > 100 && <span className="text-destructive font-medium">Over budget!</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center text-base sm:text-lg">
              <div className="h-7 w-7 rounded-lg bg-success/10 flex items-center justify-center mr-2">
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              </div>
              Recent Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.filter(t => t.type === 'income').slice(0, 3).map(transaction => (
                <div key={transaction.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-foreground">{transaction.description}</div>
                    <div className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</div>
                  </div>
                  <span className="text-sm font-semibold text-success">+{formatAmount(transaction.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center text-base sm:text-lg">
              <div className="h-7 w-7 rounded-lg bg-destructive/10 flex items-center justify-center mr-2">
                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              </div>
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.filter(t => t.type === 'expense').slice(0, 3).map(transaction => (
                <div key={transaction.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-foreground">{transaction.description}</div>
                    <div className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</div>
                  </div>
                  <span className="text-sm font-semibold text-destructive">-{formatAmount(transaction.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
