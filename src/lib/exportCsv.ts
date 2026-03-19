import { Transaction } from "@/pages/Index";

export function exportTransactionsCSV(transactions: Transaction[]) {
  if (transactions.length === 0) return;

  const headers = ["Date", "Type", "Category", "Description", "Amount"];
  const rows = [...transactions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((t) => [
      t.date,
      t.type,
      t.category,
      `"${t.description.replace(/"/g, '""')}"`,
      t.type === "income" ? t.amount.toFixed(2) : `-${t.amount.toFixed(2)}`,
    ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
