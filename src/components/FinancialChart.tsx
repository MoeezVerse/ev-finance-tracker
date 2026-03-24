
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Transaction } from "@/pages/Index";
import { useCurrency } from "@/contexts/CurrencyContext";

interface FinancialChartProps {
  transactions: Transaction[];
}

const COLORS = ['hsl(160, 84%, 30%)', 'hsl(217, 91%, 60%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)', 'hsl(280, 65%, 60%)', 'hsl(190, 80%, 42%)'];

export const FinancialChart = ({ transactions }: FinancialChartProps) => {
  const { formatAmount } = useCurrency();
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {} as Record<string, number>);

  const categoryData = Object.entries(expensesByCategory).map(([category, amount], index) => ({
    name: category, value: amount, fill: COLORS[index % COLORS.length]
  }));

  const monthlyData = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
    if (!acc[month]) acc[month] = { month, income: 0, expenses: 0 };
    if (t.type === 'income') acc[month].income += t.amount; else acc[month].expenses += t.amount;
    return acc;
  }, {} as Record<string, { month: string; income: number; expenses: number }>);

  const chartData = Object.values(monthlyData);

  const chartConfig = {
    income: { label: "Income", color: "hsl(160, 84%, 30%)" },
    expenses: { label: "Expenses", color: "hsl(0, 72%, 51%)" },
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-foreground text-sm sm:text-base">Expenses by Category</CardTitle>
          <CardDescription className="text-xs sm:text-sm">See where your money goes</CardDescription>
        </CardHeader>
        <CardContent className="px-1 sm:px-6">
          {categoryData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ChartContainer config={chartConfig} className="h-[200px] sm:h-[300px] w-full sm:flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius="70%" dataKey="value" labelLine={false}>
                      {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="flex flex-wrap justify-center sm:flex-col gap-2 px-2 sm:px-0">
                {categoryData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.fill }} />
                    <span className="text-muted-foreground truncate">{entry.name}:</span>
                    <span className="font-medium text-foreground">{formatAmount(entry.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] sm:h-[300px] flex items-center justify-center text-muted-foreground text-sm">No expense data to display</div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-foreground text-sm sm:text-base">Income vs Expenses</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Monthly comparison of your finances</CardDescription>
        </CardHeader>
        <CardContent className="px-1 sm:px-6">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[220px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 5, left: -10, bottom: 30 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} interval={0} angle={-45} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 9 }} width={35} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="income" fill="hsl(160, 84%, 30%)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="expenses" fill="hsl(0, 72%, 51%)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[220px] sm:h-[300px] flex items-center justify-center text-muted-foreground text-sm">No data to display</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
