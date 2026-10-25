import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { TransactionFilters } from "@/components/transactions/transaction-filters";

interface PageProps {
  searchParams: Promise<{
    type?: string;
    q?: string;
    month?: string;
  }>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // ============================================================
  // Build query dengan filter
  // ============================================================
  let query = supabase
    .from("transactions")
    .select(
      `
      id,
      type,
      amount,
      note,
      transaction_date,
      auto_debit_id,
      category:categories (name),
      account:accounts!transactions_account_id_fkey (name),
      to_account:accounts!transactions_to_account_id_fkey (name)
    `
    )
    .eq("user_id", user.id);

  // Filter by type
  if (params.type && params.type !== "all") {
    query = query.eq("type", params.type);
  }

  // Filter by search (note)
  if (params.q) {
    query = query.ilike("note", `%${params.q}%`);
  }

  // Filter by month
  if (params.month) {
    const [year, month] = params.month.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];
    query = query.gte("transaction_date", startDate).lte("transaction_date", endDate);
  }

  // Order & limit
  const { data: transactions } = await query
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  const formatted =
    transactions?.map((t: any) => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      note: t.note,
      transaction_date: t.transaction_date,
      category_name: t.category?.name || null,
      account_name: t.account?.name || null,
      to_account_name: t.to_account?.name || null,
      is_auto_debit: !!t.auto_debit_id,
    })) ?? [];

  // Group by date
  const groupedByDate = formatted.reduce((acc, t) => {
    const date = t.transaction_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(t);
    return acc;
  }, {} as Record<string, typeof formatted>);

  const dates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // ============================================================
  // Hitung total income & expense dari hasil filter
  // ============================================================
  const totalIncome = formatted
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = formatted
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transaksi</h1>
          <p className="text-sm text-slate-500">
            Semua catatan keuangan kamu
          </p>
        </div>
        <Link
          href="/protected/transactions/new"
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4" />
          Tambah Transaksi
        </Link>
      </div>

      {/* Filter */}
      <TransactionFilters />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Total hasil</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {formatted.length} transaksi
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Pemasukan</p>
          <p className="mt-1 text-lg font-bold text-emerald-600">
            +Rp {totalIncome.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="col-span-2 rounded-lg border border-slate-200 bg-white p-4 sm:col-span-1">
          <p className="text-xs font-medium text-slate-500">Pengeluaran</p>
          <p className="mt-1 text-lg font-bold text-red-600">
            -Rp {totalExpense.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* List */}
      {formatted.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">
            {params.q || params.type || params.month
              ? "Tidak ada transaksi yang cocok dengan filter"
              : "Belum ada transaksi"}
          </p>
          {!params.q && !params.type && !params.month && (
            <Link
              href="/protected/transactions/new"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Tambah transaksi pertama
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {dates.map((date) => (
            <div key={date}>
              {/* Header tanggal */}
              <div className="mb-2 flex items-center gap-3">
                <h2 className="text-sm font-semibold text-slate-700">
                  {new Date(date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* List transaksi hari itu */}
              <div className="space-y-2">
                {groupedByDate[date].map((t) => (
                  <TransactionItem key={t.id} {...t} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}