import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { cn, formatRupiah, formatDate } from "@/lib/utils";

interface TransactionItemProps {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  note: string | null;
  transaction_date: string;
  category_name: string | null;
  account_name: string | null;
  to_account_name: string | null;
  is_auto_debit: boolean;
}

export function TransactionItem({
  id,
  type,
  amount,
  note,
  transaction_date,
  category_name,
  account_name,
  to_account_name,
  is_auto_debit,
}: TransactionItemProps) {
  const isIncome = type === "income";
  const isTransfer = type === "transfer";

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

  const amountColor = isTransfer
    ? "text-blue-600"
    : isIncome
    ? "text-emerald-600"
    : "text-red-600";

  const amountPrefix = isTransfer ? "" : isIncome ? "+" : "-";

  return (
    <Link
      href={`/protected/transactions/${id}`}
      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50"
    >
      {/* Icon tipe */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          iconBg
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Info transaksi */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">
          {note || category_name || "Transaksi"}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          {isTransfer && to_account_name ? (
            <span>
              {account_name} → {to_account_name}
            </span>
          ) : (
            <>
              {category_name && <span>{category_name}</span>}
              {category_name && account_name && <span>•</span>}
              {account_name && <span>{account_name}</span>}
            </>
          )}
          <span>•</span>
          <span>{formatDate(transaction_date)}</span>
          {is_auto_debit && (
            <>
              <span>•</span>
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                AUTO
              </span>
            </>
          )}
        </div>
      </div>

      {/* Jumlah */}
      <div className="text-right">
        <p className={cn("text-sm font-semibold", amountColor)}>
          {amountPrefix}
          {formatRupiah(amount, true)}
        </p>
      </div>
    </Link>
  );
}