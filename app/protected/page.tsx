
import { redirect } from "next/navigation";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";

import { StatCard } from "@/components/dashboard/stat-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { BalanceChart } from "@/components/dashboard/balance-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SavingsProgress } from "@/components/dashboard/savings-progress";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // 1. Total saldo akun aktif
  const { data: accounts } = await supabase
    .from("accounts")
    .select("balance")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const totalBalance =
    accounts?.reduce((sum, a) => sum + Number(a.balance), 0) ?? 0;

  // Gunakan tanggal lokal agar sesuai kalender pengguna.
  const now = new Date();
  const toLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const startOfMonth = toLocalDate(
    new Date(now.getFullYear(), now.getMonth(), 1)
  );

  // 2. Pemasukan dan pengeluaran bulan ini
  const { data: monthTransactions } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", user.id)
    .gte("transaction_date", startOfMonth)
    .lte("transaction_date", toLocalDate(now))
    .in("type", ["income", "expense"]);

  const monthIncome =
    monthTransactions
      ?.filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

  const monthExpense =
    monthTransactions
      ?.filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

  // 3. Target tabungan aktif
  const { data: goals } = await supabase
    .from("savings_goals")
    .select("id, name, target_amount, current_amount, color, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const totalSavings =
    goals?.reduce((sum, g) => sum + Number(g.current_amount), 0) ?? 0;

  // 4. Grafik saldo 30 hari terakhir
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const chartStart = toLocalDate(thirtyDaysAgo);
  const today = toLocalDate(now);

  const { data: recentTx } = await supabase
    .from("transactions")
    .select("type, amount, transaction_date")
    .eq("user_id", user.id)
    .gte("transaction_date", chartStart)
    .lte("transaction_date", today)
    .in("type", ["income", "expense"]);

  const chartMap = new Map<
    string,
    { income: number; expense: number }
  >();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    chartMap.set(toLocalDate(date), { income: 0, expense: 0 });
  }

  recentTx?.forEach((t) => {
    const existing = chartMap.get(t.transaction_date);
    if (!existing) return;

    if (t.type === "income") {
      existing.income += Number(t.amount);
    } else if (t.type === "expense") {
      existing.expense += Number(t.amount);
    }
  });

  const chartData = Array.from(chartMap.entries()).map(([date, value]) => ({
    date: new Date(`${date}T12:00:00`).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    }),
    income: value.income,
    expense: value.expense,
  }));

  // 5. Pengeluaran per kategori bulan ini
  const { data: categoryExpenses } = await supabase
    .from("transactions")
    .select("amount, category:categories (name, color)")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .gte("transaction_date", startOfMonth)
    .lte("transaction_date", today);

  const categoryMap = new Map<
    string,
    { value: number; color: string }
  >();

  categoryExpenses?.forEach((t: any) => {
    const name = t.category?.name || "Lainnya";
    const color = t.category?.color || "#64748b";
    const existing = categoryMap.get(name);

    if (existing) {
      existing.value += Number(t.amount);
    } else {
      categoryMap.set(name, {
        value: Number(t.amount),
        color,
      });
    }
  });

  const categoryData = Array.from(categoryMap.entries())
    .map(([name, value]) => ({
      name,
      value: value.value,
      color: value.color,
    }))
    .sort((a, b) => b.value - a.value);

  // 6. Lima transaksi terbaru
  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select(`
      id,
      type,
      amount,
      note,
      transaction_date,
      auto_debit_id,
      category:categories (name),
      account:accounts!transactions_account_id_fkey (name)
    `)
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  const recentFormatted =
    recentTransactions?.map((t: any) => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      note: t.note,
      transaction_date: t.transaction_date,
      category_name: t.category?.name || null,
      account_name: t.account?.name || null,
      is_auto_debit: !!t.auto_debit_id,
    })) ?? [];

  return (
    <main className="space-y-4 pb-4">
      {/* Header ringkas */}
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Dashboard
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Ringkasan keuangan · {now.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </header>

      {/* Statistik utama */}
      <section
        aria-label="Ringkasan keuangan"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          title="Total Saldo"
          value={formatRupiah(totalBalance, true)}
          subtitle={`${accounts?.length ?? 0} akun aktif`}
          icon={Wallet}
          iconBg="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          title="Pemasukan Bulan Ini"
          value={formatRupiah(monthIncome, true)}
          subtitle="Bulan berjalan"
          icon={TrendingUp}
          iconBg="bg-green-100 text-green-600"
        />
        <StatCard
          title="Pengeluaran Bulan Ini"
          value={formatRupiah(monthExpense, true)}
          subtitle="Bulan berjalan"
          icon={TrendingDown}
          iconBg="bg-red-100 text-red-600"
        />
        <StatCard
          title="Total Tabungan"
          value={formatRupiah(totalSavings, true)}
          subtitle={`${goals?.length ?? 0} target aktif`}
          icon={PiggyBank}
          iconBg="bg-amber-100 text-amber-600"
        />
      </section>

      {/* Grafik utama dan aksi cepat */}
      <section className="grid items-start gap-3 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <BalanceChart data={chartData} />
        </div>

        <div className="min-w-0">
          <QuickActions />
        </div>
      </section>

      {/* Kategori dan tabungan */}
      <section className="grid items-start gap-3 xl:grid-cols-2">
        <div className="min-w-0">
          <CategoryChart data={categoryData} />
        </div>

        <div className="min-w-0">
          <SavingsProgress goals={goals ?? []} />
        </div>
      </section>

      {/* Transaksi terbaru */}
      <section>
        <RecentTransactions transactions={recentFormatted} />
      </section>
    </main>
  );
}
