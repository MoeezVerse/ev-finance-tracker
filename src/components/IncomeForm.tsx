
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Transaction } from "@/pages/Index";
import { X } from "lucide-react";

interface IncomeFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

const incomeCategories = ["Salary", "Freelance", "Investment", "Business", "Rental", "Dividend", "Bonus", "Gift", "Side Hustle", "Other"];

export const IncomeForm = ({ onSubmit, onClose }: IncomeFormProps) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Salary");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !description) return;
    onSubmit({ type: 'income', amount: parseFloat(amount), category, description, date });
    setAmount(""); setDescription(""); onClose();
  };

  return (
    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-md glass-card shadow-2xl animate-scale-in">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-success">Add Income</CardTitle>
            <CardDescription>Record a new income transaction</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground -mt-1 -mr-2">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {incomeCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What was this income from?" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="h-11" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1 h-11 bg-success hover:bg-success/90 text-success-foreground font-semibold">Add Income</Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
