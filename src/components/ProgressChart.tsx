
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Transaction } from "@/pages/Index";
import { Calendar, TrendingUp, BarChart3 } from "lucide-react";

interface ProgressChartProps {
  transactions: Transaction[];
}

export const ProgressChart = ({ transactions }: ProgressChartProps) => {
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Generate data based on timeframe
  const generateChartData = () => {
    const now = new Date();
    const data: Array<{
      period: string;
      income: number;
      expenses: number;
      balance: number;
      date: string;
    }> = [];

    if (timeFrame === 'daily') {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTransactions = transactions.filter(t => t.date === dateStr);
        const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        data.push({
          period: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          income,
          expenses,
          balance: income - expenses,
          date: dateStr
        });
      }
    } else if (timeFrame === 'weekly') {
      // Last 12 weeks
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= weekStart && transactionDate <= weekEnd;
        });
        
        const income = weekTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = weekTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        data.push({
          period: `Week ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          income,
          expenses,
          balance: income - expenses,
          date: weekStart.toISOString().split('T')[0]
        });
      }
    } else {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const month = date.getMonth();
        const year = date.getFullYear();
        
        const monthTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
        });
        
        const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        data.push({
          period: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          income,
          expenses,
          balance: income - expenses,
          date: date.toISOString().split('T')[0]
        });
      }
    }

    return data;
  };

  const chartData = generateChartData();
  
  // Calculate trends
  const recentData = chartData.slice(-7);
  const olderData = chartData.slice(-14, -7);
  
  const recentAvgBalance = recentData.reduce((sum, d) => sum + d.balance, 0) / recentData.length;
  const olderAvgBalance = olderData.reduce((sum, d) => sum + d.balance, 0) / olderData.length;
  const trend = recentAvgBalance - olderAvgBalance;

  const chartConfig = {
    income: {
      label: "Income",
      color: "hsl(var(--emerald-600))",
    },
    expenses: {
      label: "Expenses", 
      color: "hsl(var(--red-600))",
    },
    balance: {
      label: "Balance",
      color: "hsl(var(--blue-600))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Calendar className="mr-2 h-4 w-4" />
            Financial Progress Tracking
          </CardTitle>
          <CardDescription>Track your financial progress over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={timeFrame === 'daily' ? 'default' : 'outline'}
                onClick={() => setTimeFrame('daily')}
                size="sm"
                className="text-xs sm:text-sm"
              >
                Daily
              </Button>
              <Button
                variant={timeFrame === 'weekly' ? 'default' : 'outline'}
                onClick={() => setTimeFrame('weekly')}
                size="sm"
                className="text-xs sm:text-sm"
              >
                Weekly
              </Button>
              <Button
                variant={timeFrame === 'monthly' ? 'default' : 'outline'}
                onClick={() => setTimeFrame('monthly')}
                size="sm"
                className="text-xs sm:text-sm"
              >
                Monthly
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                onClick={() => setChartType('line')}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <TrendingUp className="mr-1 h-3 w-3" />
                Line
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                onClick={() => setChartType('bar')}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <BarChart3 className="mr-1 h-3 w-3" />
                Bar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <div className={`text-lg sm:text-xl font-bold ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {trend >= 0 ? '+' : ''}${trend.toFixed(0)}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">Average Change</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-emerald-600">
                ${chartData.reduce((sum, d) => sum + d.income, 0).toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">Total Income</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-red-600">
                ${chartData.reduce((sum, d) => sum + d.expenses, 0).toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">Total Expenses</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="w-full overflow-hidden">
            <ChartContainer config={chartConfig} className="h-[300px] sm:h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 10 }} width={40} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 10 }} width={40} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="income" fill="#10b981" />
                    <Bar dataKey="expenses" fill="#ef4444" />
                    <Bar dataKey="balance" fill="#3b82f6" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
