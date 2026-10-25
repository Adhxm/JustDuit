import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Target, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Wallet } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";

export const instant = false;

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

type SearchParams = Promise<{
  month?: string;
  year?: string;
}>;

export default async function BudgetsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const now = new Date();
  const currentMonth = Number(params.month) || (now.getMonth() + 1);
  const currentYear = Number(params.year) || now.getFullYear();

  // 1. Fetch Budgets (dengan data kategori)
  const { data: budgetsData } = await supabase
    .from("budgets")
    .select(`
      id, limit_amount,
      category:categories (id, name, icon, color)
    `)
    .eq("user_id", user.id)
    .eq("month", currentMonth)
    .eq("year", currentYear);

  const budgets = budgetsData ?? [];
  const budgetCategoryIds = budgets.map((b: any) => b.category.id);

  // 2. Fetch Realisasi Pengeluaran (transactions) di bulan ini
  const startDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
  const nextMonth = new Date(currentYear, currentMonth, 1);
  const endDate = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-${String(nextMonth.getDate()).padStart(2, "0")}`;

  const { data: txData } = await supabase
    .from("transactions")
    .select("amount, category_id")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .gte("transaction_date", startDate)
    .lt("transaction_date", endDate);

  const transactions = txData ?? [];
  
  // Hitung total pengeluaran per kategori
  const spentByCategory = new Map<string, number>();
  transactions.forEach((tx) => {
    if (tx.category_id) {
      spentByCategory.set(tx.category_id, (spentByCategory.get(tx.category_id) || 0) + Number(tx.amount));
    }
  });

  // Kalkulasi Ringkasan
  const totalLimit = budgets.reduce((sum, b) => sum + Number(b.limit_amount), 0);
  const totalSpent = budgetCategoryIds.reduce((sum, id) => sum + (spentByCategory.get(id) || 0), 0);

  // Navigasi Bulan
  function getNavUrl(offset: number) {
    let m = currentMonth + offset;
    let y = currentYear;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    return `/protected/budgets?month=${m}&year=${y}`;
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm text-slate-500">Keuangan / Budget</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Budget Bulanan</h1>
          <p className="mt-1 text-sm text-slate-600">Atur dan pantau batas pengeluaran Anda per kategori.</p>
        </div>
        <Link
          href={`/protected/budgets/new?month=${currentMonth}&year=${currentYear}`}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Atur Budget
        </Link>
      </div>

      {/* Pemilih Bulan */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:w-fit sm:pr-4">
        <div className="flex items-center">
          <Link href={getNavUrl(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100"><ChevronLeft className="h-5 w-5 text-slate-600" /></Link>
          <span className="min-w-[120px] text-center text-sm font-semibold text-slate-900">{MONTH_NAMES[currentMonth - 1]} {currentYear}</span>
          <Link href={getNavUrl(1)} className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100"><ChevronRight className="h-5 w-5 text-slate-600" /></Link>
        </div>
      </div>

      {/* Ringkasan Total */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">Total Pengeluaran</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <p className={`mt-4 text-2xl font-bold ${totalSpent > totalLimit ? "text-red-600" : "text-slate-900"}`}>
              {formatRupiah(totalSpent)}
            </p>
            <p className="mt-1 text-xs text-slate-500">Dari total budget {formatRupiah(totalLimit)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">Sisa Budget</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Target className="h-5 w-5" />
              </div>
            </div>
            <p className={`mt-4 text-2xl font-bold ${totalLimit - totalSpent < 0 ? "text-red-600" : "text-emerald-600"}`}>
              {formatRupiah(totalLimit - totalSpent)}
            </p>
            <p className="mt-1 text-xs text-slate-500">{totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0}% terpakai</p>
          </div>
        </div>
      )}

      {/* Daftar Card Budget */}
      {budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-500">
            <Target className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Belum ada budget di bulan ini</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">Tentukan batas pengeluaran per kategori agar keuangan lebih terkontrol.</p>
          <Link href={`/protected/budgets/new?month=${currentMonth}&year=${currentYear}`} className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
            Atur Budget
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {budgets.map((b: any) => {
            const limit = Number(b.limit_amount);
            const spent = spentByCategory.get(b.category.id) || 0;
            const percent = Math.min(Math.round((spent / limit) * 100), 100);
            const isOver = spent > limit;
            const color = b.category.color || "#64748b";

            return (
              <Link
                key={b.id}
                href={`/protected/budgets/new?id=${b.id}&month=${currentMonth}&year=${currentYear}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}20`, color }}>
                      <Target className="h-5 w-5" />
                    </div>
                    {isOver ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700">
                        <AlertTriangle className="h-3 w-3" /> Over
                      </span>
                    ) : percent >= 80 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        Hampir
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Aman
                      </span>
                    )}
                  </div>
                  
                  <h3 className="mt-4 font-bold text-slate-900 line-clamp-1">{b.category.name}</h3>
                  
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Terpakai</p>
                      <p className={`text-lg font-bold ${isOver ? "text-red-600" : "text-slate-900"}`}>{formatRupiah(spent)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Limit</p>
                      <p className="text-sm font-semibold text-slate-700">{formatRupiah(limit)}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full transition-all duration-500 ${isOver ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}