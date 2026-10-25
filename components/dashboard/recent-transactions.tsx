import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatRupiah, formatDate, cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  note: string | null;
  transaction_date: string;
  category_name: string | null;
  account_name: string | null;
  is_auto_debit: boolean;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Transaksi Terbaru
          </h3>
          <p className="text-sm text-slate-500">5 transaksi terakhir</p>
        </div>
        <Link
          href="/protected/transactions"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          Lihat semua →
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">
          Belum ada transaksi
        </div>
      ) : (
        <div className="space-y-1">
          {transactions.map((t) => {
            const isIncome = t.type === "income";
            const isTransfer = t.type === "transfer";
            const Icon = isTransfer
              ? ArrowLeftRight
              : isIncome
              ? ArrowDownLeft
              : ArrowUpRight;
            const iconBg = isTransfer
              ? "bg-blue-100 text-blue-600"
              : isIncome
              ? "bg-emerald-100 text-emerald-600"
              : "bg-red-100 text-red-600";

            return (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-50"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    iconBg
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {t.note || t.category_name || "Transaksi"}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{t.category_name || t.account_name}</span>
                    <span>•</span>
                    <span>{formatDate(t.transaction_date)}</span>
                    {t.is_auto_debit && (
                      <>
                        <span>•</span>
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                          AUTO
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isIncome
                        ? "text-emerald-600"
                        : isTransfer
                        ? "text-blue-600"
                        : "text-red-600"
                    )}
                  >
                    {isIncome ? "+" : isTransfer ? "" : "-"}
                    {formatRupiah(t.amount, true)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}