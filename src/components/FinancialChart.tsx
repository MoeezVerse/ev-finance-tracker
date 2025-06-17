
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Transaction } from "@/pages/Index";

interface FinancialChartProps {
  transactions: Transaction[];
}

const COLORS = {
  income: '#10b981',
  expense: '#ef4444',
  categories: ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#6366f1']
};

export const FinancialChart = ({ transactions }: FinancialChartProps) => {
  // Expense by category data
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(expensesByCategory).map(([category, amount], index) => ({
    name: category,
    value: amount,
    fill: COLORS.categories[index % COLORS.categories.length]
  }));

  // Monthly comparison data
  const monthlyData = transactions.reduce((acc, transaction) => {
    const month = new Date(transaction.date).toLocaleDateString('en-US', { month: 'short' });
    if (!acc[month]) {
      acc[month] = { month, income: 0, expenses: 0 };
    }
    
    if (transaction.type === 'income') {
      acc[month].income += transaction.amount;
    } else {
      acc[month].expenses += transaction.amount;
    }
    
    return acc;
  }, {} as Record<string, { month: string; income: number; expenses: number }>);

  const chartData = Object.values(monthlyData);

  const chartConfig = {
    income: {
      label: "Income",
      color: COLORS.income,
    },
    expenses: {
      label: "Expenses", 
      color: COLORS.expense,
    },
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Expenses by Category</CardTitle>
          <CardDescription>See where your money goes</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {categoryData.length > 0 ? (
            <div className="w-full overflow-hidden">
              <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      dataKey="value"
                      label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          ) : (
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-gray-500">
              No expense data to display
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Income vs Expenses</CardTitle>
          <CardDescription>Monthly comparison of your finances</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {chartData.length > 0 ? (
            <div className="w-full overflow-hidden">
              <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 10 }} 
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 10 }} width={40} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="income" fill={COLORS.income} />
                    <Bar dataKey="expenses" fill={COLORS.expense} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          ) : (
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-gray-500">
              No data to display
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
