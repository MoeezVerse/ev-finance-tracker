
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Transaction } from "@/pages/Index";
import { Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ProgressChartProps {
  transactions: Transaction[];
}

export const ProgressChart = ({ transactions }: ProgressChartProps) => {
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const { formatAmount } = useCurrency();

  const generateChartData = () => {
    const now = new Date();
    const data: Array<{ period: string; income: number; expenses: number; balance: number; date: string }> = [];

    if (timeFrame === 'daily') {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now); date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayTx = transactions.filter(t => t.date === dateStr);
        const income = dayTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expenses = dayTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        data.push({ period: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), income, expenses, balance: income - expenses, date: dateStr });
      }
    } else if (timeFrame === 'weekly') {
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);
        const weekTx = transactions.filter(t => { const d = new Date(t.date); return d >= weekStart && d <= weekEnd; });
        const income = weekTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expenses = weekTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        data.push({ period: `Week ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, income, expenses, balance: income - expenses, date: weekStart.toISOString().split('T')[0] });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now); date.setMonth(date.getMonth() - i);
        const month = date.getMonth(); const year = date.getFullYear();
        const monthTx = transactions.filter(t => { const d = new Date(t.date); return d.getMonth() === month && d.getFullYear() === year; });
        const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        data.push({ period: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), income, expenses, balance: income - expenses, date: date.toISOString().split('T')[0] });
      }
    }
    return data;
  };

  const chartData = generateChartData();
  const recentData = chartData.slice(-7);
  const olderData = chartData.slice(-14, -7);
  const recentAvg = recentData.reduce((s, d) => s + d.balance, 0) / recentData.length;
  const olderAvg = olderData.reduce((s, d) => s + d.balance, 0) / olderData.length;
  const trend = recentAvg - olderAvg;

  const chartConfig = {
    income: { label: "Income", color: "hsl(160, 84%, 30%)" },
    expenses: { label: "Expenses", color: "hsl(0, 72%, 51%)" },
    balance: { label: "Balance", color: "hsl(217, 91%, 60%)" },
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center text-base sm:text-lg text-foreground">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            Financial Progress Tracking
          </CardTitle>
          <CardDescription>Track your financial progress over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-wrap gap-1.5">
              {(['daily', 'weekly', 'monthly'] as const).map(tf => (
                <Button key={tf} variant={timeFrame === tf ? 'default' : 'outline'} onClick={() => setTimeFrame(tf)} size="sm" className="text-xs sm:text-sm">
                  {tf.charAt(0).toUpperCase() + tf.slice(1)}
                </Button>
              ))}
            </div>
            <div className="flex gap-1.5">
              <Button variant={chartType === 'line' ? 'default' : 'outline'} onClick={() => setChartType('line')} size="sm" className="text-xs sm:text-sm">
                <TrendingUp className="mr-1 h-3 w-3" /> Line
              </Button>
              <Button variant={chartType === 'bar' ? 'default' : 'outline'} onClick={() => setChartType('bar')} size="sm" className="text-xs sm:text-sm">
                <BarChart3 className="mr-1 h-3 w-3" /> Bar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Average Change', value: `${trend >= 0 ? '+' : ''}$${trend.toFixed(0)}`, color: trend >= 0 ? 'text-success' : 'text-destructive' },
          { label: 'Total Income', value: `$${chartData.reduce((s, d) => s + d.income, 0).toLocaleString()}`, color: 'text-success' },
          { label: 'Total Expenses', value: `$${chartData.reduce((s, d) => s + d.expenses, 0).toLocaleString()}`, color: 'text-destructive' },
        ].map(stat => (
          <Card key={stat.label} className="glass-card">
            <CardContent className="p-4 text-center">
              <div className={`text-lg sm:text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg text-foreground">
            {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <ChartContainer config={chartConfig} className="h-[300px] sm:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(155, 15%, 88%)" />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10 }} width={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="income" stroke="hsl(160, 84%, 30%)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="expenses" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="balance" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(155, 15%, 88%)" />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10 }} width={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="income" fill="hsl(160, 84%, 30%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="balance" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
