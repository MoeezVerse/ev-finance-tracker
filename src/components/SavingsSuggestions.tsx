
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/pages/Index";
import { Lightbulb, Target, TrendingUp } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface SavingsSuggestionsProps {
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
}

export const SavingsSuggestions = ({ transactions, totalIncome, totalExpenses }: SavingsSuggestionsProps) => {
  const { formatAmount } = useCurrency();
  const expenses = transactions.filter(t => t.type === 'expense');
  const categoryTotals = expenses.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {} as Record<string, number>);
  const sortedCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a).slice(0, 3);

  const suggestions: { type: string; title: string; description: string; icon: React.ReactNode }[] = [];

  if (sortedCategories.length > 0) {
    const [topCategory, topAmount] = sortedCategories[0];
    const percentage = totalExpenses > 0 ? (topAmount / totalExpenses * 100) : 0;
    if (percentage > 30) {
      suggestions.push({ type: "warning", title: `High ${topCategory} Spending`, description: `You're spending ${percentage.toFixed(1)}% of your budget on ${topCategory.toLowerCase()}. Consider ways to reduce this category.`, icon: <Target className="h-4 w-4" /> });
    }
  }

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
  if (savingsRate < 20) {
    suggestions.push({ type: "tip", title: "Increase Your Savings Rate", description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Try to aim for at least 20% by reducing discretionary spending.`, icon: <TrendingUp className="h-4 w-4" /> });
  } else {
    suggestions.push({ type: "success", title: "Great Savings Rate!", description: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep up the excellent work!`, icon: <TrendingUp className="h-4 w-4" /> });
  }

  if (totalExpenses > 0) {
    suggestions.push({ type: "info", title: "Emergency Fund Goal", description: `Build an emergency fund of ${formatAmount(totalExpenses * 6)} (6 months of expenses) for financial security.`, icon: <Lightbulb className="h-4 w-4" /> });
  }

  if (totalIncome > 0) {
    const housingPercentage = (categoryTotals['Rent'] || 0) / totalIncome * 100;
    if (housingPercentage > 30) {
      suggestions.push({ type: "warning", title: "Housing Costs Too High", description: `Your housing costs are ${housingPercentage.toFixed(1)}% of income. The recommended maximum is 30%.`, icon: <Target className="h-4 w-4" /> });
    }
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-warning" />
          </div>
          Savings Suggestions
        </CardTitle>
        <CardDescription>Personalized tips to improve your finances</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Add more transactions to get personalized savings suggestions!</p>
          ) : (
            suggestions.map((suggestion, index) => (
              <div key={index} className="flex gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  suggestion.type === 'warning' ? 'bg-destructive/10 text-destructive' :
                  suggestion.type === 'success' ? 'bg-success/10 text-success' :
                  suggestion.type === 'tip' ? 'bg-info/10 text-info' :
                  'bg-warning/10 text-warning'
                }`}>
                  {suggestion.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground text-sm">{suggestion.title}</h4>
                    <Badge variant={suggestion.type === 'warning' ? 'destructive' : suggestion.type === 'success' ? 'default' : 'secondary'} className="text-xs">
                      {suggestion.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {sortedCategories.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="font-medium text-foreground mb-3 text-sm">Top Spending Categories</h4>
            <div className="space-y-2">
              {sortedCategories.map(([category, amount]) => {
                const percentage = totalExpenses > 0 ? (amount / totalExpenses * 100) : 0;
                return (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">${amount.toLocaleString()}</span>
                      <Badge variant="outline" className="text-xs">{percentage.toFixed(1)}%</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
