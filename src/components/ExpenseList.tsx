
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/pages/Index";
import { Trash2, TrendingUp, TrendingDown } from "lucide-react";

interface ExpenseListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const ExpenseList = ({ transactions, onDelete }: ExpenseListProps) => {
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-foreground text-base sm:text-lg">Recent Transactions</CardTitle>
        <CardDescription>Your latest financial activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm sm:text-base">No transactions yet. Add some income or expenses to get started!</p>
          ) : (
            sortedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-muted/50 transition-colors gap-3 sm:gap-0 group"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${transaction.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground text-sm sm:text-base truncate">{transaction.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()} · {transaction.category}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className={`text-sm sm:text-base font-semibold ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(transaction.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
