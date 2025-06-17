
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
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-gray-800 text-base sm:text-lg">Recent Transactions</CardTitle>
        <CardDescription>Your latest financial activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-sm sm:text-base">No transactions yet. Add some income or expenses to get started!</p>
          ) : (
            sortedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors gap-3 sm:gap-0"
              >
                <div className="flex items-center gap-3">
                  {transaction.type === 'income' ? (
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{transaction.description}</div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <Badge 
                    variant={transaction.type === 'income' ? 'default' : 'destructive'}
                    className={`${transaction.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} text-xs sm:text-sm`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(transaction.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 sm:p-2"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
