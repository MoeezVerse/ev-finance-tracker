
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Transaction } from "@/pages/Index";
import { Target, Plus, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BudgetGoalsProps {
  transactions: Transaction[];
}

interface BudgetGoal {
  id: string;
  category: string;
  amount: number;
}

const expenseCategories = ["Rent", "Groceries", "Transportation", "Utilities", "Entertainment", "Healthcare", "Shopping", "Dining", "Education", "Insurance", "Other"];

export const BudgetGoals = ({ transactions }: BudgetGoalsProps) => {
  const { user } = useAuth();
  const { formatAmount, symbol } = useCurrency();
  const { toast } = useToast();
  const [goals, setGoals] = useState<BudgetGoal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchGoals = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("budget_goals")
      .select("id, category, amount")
      .eq("user_id", user.id);
    if (data) setGoals(data.map(g => ({ ...g, amount: Number(g.amount) })));
  };

  useEffect(() => { fetchGoals(); }, [user]);

  const expensesByCategory = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {} as Record<string, number>);

  const availableCategories = expenseCategories.filter(
    cat => !goals.some(g => g.category === cat)
  );

  const handleAdd = async () => {
    if (!user || !newCategory || !newAmount) return;
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) return;
    setLoading(true);
    const { error } = await supabase.from("budget_goals").insert({
      user_id: user.id,
      category: newCategory,
      amount,
    });
    if (!error) {
      toast({ title: "Budget Goal Set", description: `${newCategory}: ${formatAmount(amount)}` });
      setNewCategory("");
      setNewAmount("");
      setShowForm(false);
      fetchGoals();
    } else {
      toast({ title: "Error", description: "Failed to save budget goal.", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, category: string) => {
    const { error } = await supabase.from("budget_goals").delete().eq("id", id);
    if (!error) {
      toast({ title: "Goal Removed", description: `Budget goal for ${category} removed.` });
      setGoals(prev => prev.filter(g => g.id !== id));
    }
  };

  const handleUpdate = async (id: string, newAmount: number) => {
    if (isNaN(newAmount) || newAmount <= 0) return;
    const { error } = await supabase.from("budget_goals").update({ amount: newAmount }).eq("id", id);
    if (!error) {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, amount: newAmount } : g));
      toast({ title: "Goal Updated" });
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground text-base sm:text-lg">Budget Goals</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Set spending limits per category</CardDescription>
            </div>
          </div>
          {!showForm && availableCategories.length > 0 && (
            <Button onClick={() => setShowForm(true)} size="sm" variant="outline" className="text-xs">
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {availableCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Monthly Limit ({symbol})</Label>
              <Input
                type="number"
                step="0.01"
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
                placeholder="0.00"
                className="h-9 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} size="sm" disabled={loading || !newCategory || !newAmount} className="flex-1 text-xs">
                Save Goal
              </Button>
              <Button onClick={() => { setShowForm(false); setNewCategory(""); setNewAmount(""); }} size="sm" variant="outline" className="text-xs">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {goals.length === 0 && !showForm ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No budget goals set yet. Add one to start tracking!
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map(goal => {
              const spent = expensesByCategory[goal.category] || 0;
              const percentage = goal.amount > 0 ? (spent / goal.amount) * 100 : 0;
              const isOver = percentage > 100;
              const isNear = percentage > 80 && !isOver;

              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isOver ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      ) : isNear ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      )}
                      <span className="text-sm font-medium text-foreground">{goal.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className={`text-sm font-semibold ${isOver ? 'text-destructive' : 'text-foreground'}`}>
                          {formatAmount(spent)}
                        </span>
                        <span className="text-xs text-muted-foreground"> / {formatAmount(goal.amount)}</span>
                      </div>
                      <Button
                        onClick={() => handleDelete(goal.id, goal.category)}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(percentage, 100)}
                    className={`h-2 ${isOver ? '[&>div]:bg-destructive' : isNear ? '[&>div]:bg-warning' : ''}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentage.toFixed(0)}% used</span>
                    {isOver && (
                      <span className="text-destructive font-medium">
                        Over by {formatAmount(spent - goal.amount)}
                      </span>
                    )}
                    {!isOver && (
                      <span className="text-success">
                        {formatAmount(goal.amount - spent)} remaining
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
