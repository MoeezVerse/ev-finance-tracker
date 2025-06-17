
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/pages/Index";
import { Lightbulb, Target, TrendingUp } from "lucide-react";

interface SavingsSuggestionsProps {
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
}

export const SavingsSuggestions = ({ transactions, totalIncome, totalExpenses }: SavingsSuggestionsProps) => {
  const expenses = transactions.filter(t => t.type === 'expense');
  
  // Calculate expense categories
  const categoryTotals = expenses.reduce((acc, transaction) => {
    acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Generate suggestions based on spending patterns
  const suggestions = [];

  // High expense categories
  if (sortedCategories.length > 0) {
    const [topCategory, topAmount] = sortedCategories[0];
    const percentage = totalExpenses > 0 ? (topAmount / totalExpenses * 100) : 0;
    
    if (percentage > 30) {
      suggestions.push({
        type: "warning",
        title: `High ${topCategory} Spending`,
        description: `You're spending ${percentage.toFixed(1)}% of your budget on ${topCategory.toLowerCase()}. Consider ways to reduce this category.`,
        icon: <Target className="h-4 w-4" />
      });
    }
  }

  // Savings rate suggestions
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
  
  if (savingsRate < 20) {
    suggestions.push({
      type: "tip",
      title: "Increase Your Savings Rate",
      description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Try to aim for at least 20% by reducing discretionary spending.`,
      icon: <TrendingUp className="h-4 w-4" />
    });
  } else if (savingsRate >= 20) {
    suggestions.push({
      type: "success",
      title: "Great Savings Rate!",
      description: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep up the excellent work!`,
      icon: <TrendingUp className="h-4 w-4" />
    });
  }

  // Emergency fund suggestion
  const monthlyExpenses = totalExpenses;
  const emergencyFund = (totalIncome - totalExpenses) * 6;
  
  if (monthlyExpenses > 0) {
    suggestions.push({
      type: "info",
      title: "Emergency Fund Goal",
      description: `Build an emergency fund of $${(monthlyExpenses * 6).toLocaleString()} (6 months of expenses) for financial security.`,
      icon: <Lightbulb className="h-4 w-4" />
    });
  }

  // Budget allocation suggestions
  if (totalIncome > 0) {
    const housingPercentage = (categoryTotals['Rent'] || 0) / totalIncome * 100;
    if (housingPercentage > 30) {
      suggestions.push({
        type: "warning",
        title: "Housing Costs Too High",
        description: `Your housing costs are ${housingPercentage.toFixed(1)}% of income. The recommended maximum is 30%.`,
        icon: <Target className="h-4 w-4" />
      });
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-gray-800 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          Savings Suggestions
        </CardTitle>
        <CardDescription>Personalized tips to improve your finances</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Add more transactions to get personalized savings suggestions!
            </p>
          ) : (
            suggestions.map((suggestion, index) => (
              <div key={index} className="flex gap-3 p-4 border border-gray-200 rounded-lg">
                <div className={`p-2 rounded-full ${
                  suggestion.type === 'warning' ? 'bg-red-100 text-red-600' :
                  suggestion.type === 'success' ? 'bg-green-100 text-green-600' :
                  suggestion.type === 'tip' ? 'bg-blue-100 text-blue-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  {suggestion.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                    <Badge variant={
                      suggestion.type === 'warning' ? 'destructive' :
                      suggestion.type === 'success' ? 'default' :
                      'secondary'
                    }>
                      {suggestion.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{suggestion.description}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Top Spending Categories */}
        {sortedCategories.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Top Spending Categories</h4>
            <div className="space-y-2">
              {sortedCategories.map(([category, amount], index) => {
                const percentage = totalExpenses > 0 ? (amount / totalExpenses * 100) : 0;
                return (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">${amount.toLocaleString()}</span>
                      <Badge variant="outline" className="text-xs">
                        {percentage.toFixed(1)}%
                      </Badge>
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
