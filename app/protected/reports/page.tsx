import { redirect } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  PieChart,
  BarChart3,
  ReceiptText
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatDate } from "@/lib/utils";
import { ReportFilters } from "@/components/reports/report-filters";

export const instant = false;

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

type SearchParams = Promise<{
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
}>;

const CHART_COLORS = [
  "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#64748b"
];

type ReportTransaction = {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number | string;
  note: string | null;
  transaction_date: string;
  category: { id: string; name: string; color: string | null } | { id: string; name: string; color: string | null }[] | null;
};

export default async function ReportsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const now = new Date();
  const startMonth = Number(params.startMonth) || (now.getMonth() + 1);
  const startYear = Number(params.startYear) || now.getFullYear();
  const endMonth = Number(params.endMonth) || (now.getMonth() + 1);
  const endYear = Number(params.endYear) || now.getFullYear();

  // Hitung batas tanggal
  const startDate = `${startYear}-${String(startMonth).padStart(2, "0")}-01`;
  const nextMonth = new Date(endYear, endMonth, 1);
  const endDate = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-${String(nextMonth.getDate()).padStart(2, "0")}`;

  // Fetch data transaksi
  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      id, type, amount, note, transaction_date,
      category:categories (id, name, color)
    `)
    .eq("user_id", user.id)
    .gte("transaction_date", startDate)
    .lt("transaction_date", endDate)
    .order("transaction_date", { ascending: false });

  const txs = (transactions ?? []) as unknown as ReportTransaction[];

  // === 1. Agregasi Data ===
  let totalIncome = 0;
  let totalExpense = 0;
  const expenseByCategory = new Map<string, { name: string; color: string | null; amount: number }>();

  txs.forEach((tx) => {
    const amt = Number(tx.amount);
    if (tx.type === "income") {
      totalIncome += amt;
    } else if (tx.type === "expense") {
      totalExpense += amt;
      const cat = Array.isArray(tx.category) ? tx.category[0] : tx.category;
      
      const catId = cat?.id || "uncategorized";
      const catName = cat?.name || "Tanpa Kategori";
      const catColor = cat?.color || null;
      
      const existing = expenseByCategory.get(catId) || { name: catName, color: catColor, amount: 0 };
      existing.amount += amt;
      expenseByCategory.set(catId, existing);
    }
  });

  const netIncome = totalIncome - totalExpense;
  const maxAmount = Math.max(totalIncome, totalExpense, 1); 

  const topCategories = Array.from(expenseByCategory.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const totalTopExpense = topCategories.reduce((sum, c) => sum + c.amount, 0);
  let cumulativePercent = 0;

  // Format Label Periode
  const periodLabel = startMonth === endMonth && startYear === endYear
    ? `${MONTH_NAMES[startMonth - 1]} ${startYear}`
    : `${MONTH_NAMES[startMonth - 1]} ${startYear} - ${MONTH_NAMES[endMonth - 1]} ${endYear}`;

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <p className="mb-1 text-sm text-slate-500">Keuangan / Laporan</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Laporan Keuangan</h1>
          <p className="mt-1 text-sm text-slate-600">Periode: <span className="font-semibold text-emerald-600">{periodLabel}</span></p>
        </div>
      </div>

      {/* Filter & Export Buttons */}
      <ReportFilters 
        rawTransactions={txs} 
        summaryData={{ totalIncome, totalExpense, netIncome }} 
      />

      {/* Area yang akan di-print (Print Area) */}
      <div className="print-area space-y-6">
        
        {/* Header Khusus Print */}
        <div className="hidden print:block mb-8">
          <h1 className="text-3xl font-bold text-black">Laporan Keuangan JustDuit</h1>
          <p className="text-gray-600 mt-1">Periode: {periodLabel}</p>
          <hr className="my-4 border-gray-300" />
        </div>

        {/* Ringkasan Utama */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:border-gray-300 print:shadow-none">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">Pemasukan</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 print:hidden">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">{formatRupiah(totalIncome)}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:border-gray-300 print:shadow-none">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">Pengeluaran</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700 print:hidden">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">{formatRupiah(totalExpense)}</p>
          </div>

          <div className={`rounded-2xl border p-5 shadow-sm print:border-gray-300 print:shadow-none ${netIncome >= 0 ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${netIncome >= 0 ? "text-emerald-800" : "text-red-800"}`}>Arus Kas Bersih</p>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl print:hidden ${netIncome >= 0 ? "bg-emerald-200 text-emerald-700" : "bg-red-200 text-red-700"}`}>
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <p className={`mt-4 text-2xl font-bold tracking-tight ${netIncome >= 0 ? "text-emerald-900" : "text-red-900"}`}>{formatRupiah(netIncome)}</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 print:block print:space-y-8">
          {/* Bar Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:border-gray-300 print:shadow-none print:break-inside-avoid">
            <div className="mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-500 print:hidden" />
              <h2 className="font-semibold text-slate-900">Perbandingan Arus Kas</h2>
            </div>
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">Pemasukan</span>
                  <span className="font-bold text-emerald-600">{formatRupiah(totalIncome)}</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100 print:border print:border-gray-200">
                  <div className="h-full rounded-full bg-emerald-500 print:bg-emerald-500" style={{ width: `${(totalIncome / maxAmount) * 100}%`, WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }} />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">Pengeluaran</span>
                  <span className="font-bold text-red-600">{formatRupiah(totalExpense)}</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100 print:border print:border-gray-200">
                  <div className="h-full rounded-full bg-red-500 print:bg-red-500" style={{ width: `${(totalExpense / maxAmount) * 100}%`, WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:border-gray-300 print:shadow-none print:break-inside-avoid">
            <div className="mb-6 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-slate-500 print:hidden" />
              <h2 className="font-semibold text-slate-900">Top Pengeluaran per Kategori</h2>
            </div>
            {topCategories.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-slate-500">Belum ada data pengeluaran.</div>
            ) : (
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <div className="relative flex h-40 w-40 shrink-0 items-center justify-center">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 transform">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="15" />
                    {topCategories.map((cat, index) => {
                      const percent = (cat.amount / totalTopExpense) * 100;
                      const strokeDasharray = `${percent} ${100 - percent}`;
                      const strokeDashoffset = 100 - cumulativePercent;
                      cumulativePercent += percent;
                      const color = cat.color || CHART_COLORS[index % CHART_COLORS.length];
                      return (
                        <circle
                          key={cat.id} cx="50" cy="50" r="40" fill="transparent" stroke={color} strokeWidth="15"
                          strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} pathLength="100"
                          style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
                        />
                      );
                    })}
                  </svg>
                </div>
                <div className="flex-1 space-y-3">
                  {topCategories.map((cat, index) => {
                    const color = cat.color || CHART_COLORS[index % CHART_COLORS.length];
                    const percent = Math.round((cat.amount / totalTopExpense) * 100);
                    return (
                      <div key={cat.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 truncate">
                          <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color, WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }} />
                          <span className="truncate text-slate-600">{cat.name}</span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 font-medium">
                          <span className="text-slate-900">{formatRupiah(cat.amount)}</span>
                          <span className="w-8 text-right text-xs text-slate-400">{percent}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabel Data Mentah */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm print:border-none print:shadow-none">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6 print:hidden">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <ReceiptText className="h-4 w-4 text-slate-500" />
              Rincian Transaksi
            </h2>
          </div>
          
          {txs.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">Tidak ada transaksi pada periode ini.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 print:bg-transparent print:border-b print:border-gray-300">
                  <tr>
                    <th className="px-5 py-3 sm:px-6">Tanggal</th>
                    <th className="px-5 py-3 sm:px-6">Kategori</th>
                    <th className="px-5 py-3 sm:px-6">Catatan</th>
                    <th className="px-5 py-3 text-right sm:px-6">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-gray-200">
                  {txs.map((tx) => {
                    const cat = Array.isArray(tx.category) ? tx.category[0] : tx.category;
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50 print:hover:bg-transparent">
                        <td className="whitespace-nowrap px-5 py-3 sm:px-6">{formatDate(tx.transaction_date, "long")}</td>
                        <td className="px-5 py-3 sm:px-6">
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium print:bg-transparent print:p-0"
                            style={{ backgroundColor: `${cat?.color || '#64748b'}20`, color: cat?.color || '#64748b' }}>
                            {cat?.name || "Tanpa Kategori"}
                          </span>
                        </td>
                        <td className="px-5 py-3 sm:px-6">{tx.note || "-"}</td>
                        <td className={`whitespace-nowrap px-5 py-3 text-right font-semibold sm:px-6 ${tx.type === "income" ? "text-emerald-600" : tx.type === "expense" ? "text-red-600" : "text-slate-900"}`}>
                          {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
                          {formatRupiah(Number(tx.amount))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}