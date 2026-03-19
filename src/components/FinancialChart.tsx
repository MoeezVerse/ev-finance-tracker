
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Transaction } from "@/pages/Index";

interface FinancialChartProps {
  transactions: Transaction[];
}

const COLORS = ['hsl(160, 84%, 30%)', 'hsl(217, 91%, 60%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)', 'hsl(280, 65%, 60%)', 'hsl(190, 80%, 42%)'];

export const FinancialChart = ({ transactions }: FinancialChartProps) => {
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
        <CardHeader>
          <CardTitle className="text-foreground">Expenses by Category</CardTitle>
          <CardDescription>See where your money goes</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {categoryData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius="70%" dataKey="value" label={({ name, value, cx, cy, midAngle, innerRadius, outerRadius }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = (innerRadius as number) + ((outerRadius as number) - (innerRadius as number)) * 0.5;
                    const x = (cx as number) + radius * Math.cos(-midAngle * RADIAN);
                    const y = (cy as number) + radius * Math.sin(-midAngle * RADIAN);
                    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>{`$${value.toLocaleString()}`}</text>;
                  }} labelLine={false}>
                    {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-muted-foreground">No expense data to display</div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground">Income vs Expenses</CardTitle>
          <CardDescription>Monthly comparison of your finances</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10 }} width={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="income" fill="hsl(160, 84%, 30%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-muted-foreground">No data to display</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
