
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Transaction } from "@/pages/Index";
import { Trash2, TrendingUp, TrendingDown, Search, CalendarIcon, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpenseListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const ExpenseList = ({ transactions, onDelete }: ExpenseListProps) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return [...transactions]
      .filter(t => {
        if (search && !t.description.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase())) return false;
        if (typeFilter !== "all" && t.type !== typeFilter) return false;
        if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
        if (dateFrom && new Date(t.date) < dateFrom) return false;
        if (dateTo) {
          const end = new Date(dateTo);
          end.setHours(23, 59, 59, 999);
          if (new Date(t.date) > end) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search, typeFilter, categoryFilter, dateFrom, dateTo]);

  const hasActiveFilters = search || typeFilter !== "all" || categoryFilter !== "all" || dateFrom || dateTo;

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground text-base sm:text-lg">Recent Transactions</CardTitle>
            <CardDescription>
              {hasActiveFilters
                ? `${filteredTransactions.length} of ${transactions.length} transactions`
                : "Your latest financial activity"}
            </CardDescription>
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="h-5 w-5 rounded-full bg-primary-foreground text-primary text-xs flex items-center justify-center font-bold">
                {[search, typeFilter !== "all", categoryFilter !== "all", dateFrom, dateTo].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search bar - always visible */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by description or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Expandable filter bar */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-muted/30 animate-fade-in">
            <div className="flex-1 min-w-0">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-0">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-0">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full h-9 justify-start text-left font-normal text-sm", !dateFrom && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {dateFrom ? format(dateFrom, "MMM d, yyyy") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 min-w-0">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">To</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full h-9 justify-start text-left font-normal text-sm", !dateTo && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {dateTo ? format(dateTo, "MMM d, yyyy") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>

            {hasActiveFilters && (
              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground h-9 gap-1.5">
                  <X className="h-3.5 w-3.5" /> Clear
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Transaction list */}
        <div className="space-y-2">
          {filteredTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm sm:text-base">
              {hasActiveFilters ? "No transactions match your filters." : "No transactions yet. Add some income or expenses to get started!"}
            </p>
          ) : (
            filteredTransactions.map((transaction) => (
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
