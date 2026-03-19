import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency, CURRENCIES } from '@/contexts/CurrencyContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Plus, Trash2, Target, Globe } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  "Rent", "Groceries", "Transportation", "Utilities", "Entertainment",
  "Healthcare", "Shopping", "Dining", "Education", "Insurance"
];

interface BudgetGoal {
  id?: string;
  category: string;
  amount: number;
}

const CurrencyCard = () => {
  const { currency, setCurrency } = useCurrency();
  const { toast } = useToast();

  const handleChange = async (code: string) => {
    await setCurrency(code);
    const curr = CURRENCIES.find(c => c.code === code);
    toast({ title: 'Currency updated', description: `Currency set to ${curr?.name} (${curr?.symbol})` });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center">
            <Globe className="h-4 w-4 text-info" />
          </div>
          Currency
        </CardTitle>
        <CardDescription>Choose the currency for displaying amounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          <Label className="text-xs">Display Currency</Label>
          <select
            value={currency}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.symbol} — {c.name} ({c.code})</option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
};

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { symbol } = useCurrency();

  const [goals, setGoals] = useState<BudgetGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');

  useEffect(() => { if (user) fetchGoals(); }, [user]);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('budget_goals')
        .select('id, category, amount')
        .eq('user_id', user!.id)
        .order('category');
      if (error) throw error;
      setGoals(data || []);
    } catch (error: any) {
      console.error('Error fetching goals:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newCategory || !newAmount || parseFloat(newAmount) <= 0) {
      toast({ title: 'Invalid input', description: 'Please enter a category and a valid amount.', variant: 'destructive' });
      return;
    }

    if (goals.some(g => g.category === newCategory)) {
      toast({ title: 'Duplicate', description: 'A budget goal for this category already exists.', variant: 'destructive' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('budget_goals')
        .insert({ user_id: user!.id, category: newCategory, amount: parseFloat(newAmount) })
        .select('id, category, amount')
        .single();
      if (error) throw error;
      setGoals(prev => [...prev, data].sort((a, b) => a.category.localeCompare(b.category)));
      setNewCategory('');
      setNewAmount('');
      toast({ title: 'Goal added', description: `Budget goal for ${newCategory} has been set.` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const updateGoalAmount = (index: number, amount: string) => {
    setGoals(prev => prev.map((g, i) => i === index ? { ...g, amount: parseFloat(amount) || 0 } : g));
  };

  const deleteGoal = async (index: number) => {
    const goal = goals[index];
    if (!goal.id) return;

    try {
      const { error } = await supabase.from('budget_goals').delete().eq('id', goal.id);
      if (error) throw error;
      setGoals(prev => prev.filter((_, i) => i !== index));
      toast({ title: 'Goal removed', description: `Budget goal for ${goal.category} has been deleted.` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const saveAllGoals = async () => {
    setSaving(true);
    try {
      const updates = goals.filter(g => g.id).map(g =>
        supabase.from('budget_goals').update({ amount: g.amount }).eq('id', g.id!)
      );
      const results = await Promise.all(updates);
      const failed = results.find(r => r.error);
      if (failed?.error) throw failed.error;
      toast({ title: 'Goals saved', description: 'All budget goals have been updated.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const unusedCategories = DEFAULT_CATEGORIES.filter(c => !goals.some(g => g.category === c));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 max-w-2xl space-y-6 animate-fade-in">
        <div className="flex items-center gap-4 py-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/')} className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Settings</h1>
            <p className="text-muted-foreground text-sm">Manage your preferences and budget goals</p>
          </div>
        </div>

        {/* Currency Selection */}
        <CurrencyCard />

        {/* Add new goal */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              Add Budget Goal
            </CardTitle>
            <CardDescription>Set a monthly spending limit for a category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">Category</Label>
                {unusedCategories.length > 0 ? (
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select category...</option>
                    {unusedCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                ) : (
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Custom category"
                    className="h-11"
                  />
                )}
              </div>
              <div className="w-full sm:w-32 space-y-1.5">
                <Label className="text-xs">Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-11"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addGoal} className="h-11 w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing goals */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Target className="h-4 w-4 text-warning" />
                  </div>
                  Budget Goals
                </CardTitle>
                <CardDescription>{goals.length} categories configured</CardDescription>
              </div>
              {goals.length > 0 && (
                <Button onClick={saveAllGoals} disabled={saving} className="shadow-lg shadow-primary/20">
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save All'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 text-sm">
                No budget goals set yet. Add categories above to start tracking your spending limits.
              </p>
            ) : (
              <div className="space-y-3">
                {goals.map((goal, index) => (
                  <div key={goal.id || index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground">{goal.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{symbol}</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={goal.amount}
                        onChange={(e) => updateGoalAmount(index, e.target.value)}
                        className="w-24 h-9 text-right"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteGoal(index)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
