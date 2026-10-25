import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, PiggyBank, Target, CalendarDays, ArrowRight, TrendingUp } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatDate } from "@/lib/utils";

export const instant = false;

type GoalRow = {
  id: string;
  name: string;
  target_amount: number | string;
  current_amount: number | string;
  deadline: string | null;
  color: string | null;
  icon: string | null;
  status: string;
};

export default async function SavingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data, error } = await supabase
    .from("savings_goals")
    .select("id, name, target_amount, current_amount, deadline, color, icon, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const goals = (data ?? []) as GoalRow[];

  // Hitung Metrik
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
  const activeGoals = goals.filter((g) => g.status === "active");
  
  const totalTargetAmount = activeGoals.reduce((sum, g) => sum + Number(g.target_amount), 0);
  // Persentase keseluruhan dari target yang aktif
  const overallPercent = totalTargetAmount > 0 ? Math.min(Math.round((totalSaved / totalTargetAmount) * 100), 100) : 0;
  
  // SVG circle calculation (r=36, circumference = 2 * PI * 36 ≈ 226.2)
  const strokeDasharray = 226.2;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * overallPercent) / 100;

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm text-slate-500">Keuangan / Tabungan</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tabungan & Target</h1>
          <p className="mt-1 text-sm text-slate-600">Pantau progres tabungan Anda untuk mencapai target finansial.</p>
        </div>
        <Link
          href="/protected/savings/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Buat Target Baru
        </Link>
      </div>

      {/* Ringkasan - 3 Kolom */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Total Dana */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-emerald-800">Total Dana Terkumpul</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-200 text-emerald-700">
              <PiggyBank className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-emerald-900">{formatRupiah(totalSaved)}</p>
          <p className="mt-2 text-xs text-emerald-700">Dari semua target Anda</p>
        </div>

        {/* Card 2: Target Aktif */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-600">Target Aktif</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">{activeGoals.length}</p>
          <p className="mt-2 text-xs text-slate-500">Target yang sedang berjalan</p>
        </div>

        {/* Card 3: Progress Keseluruhan (Donut Chart) */}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-slate-600">Progres Target</p>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{overallPercent}%</p>
            <p className="mt-1 text-xs text-slate-500 line-clamp-2">
              Dari total {formatRupiah(totalTargetAmount)} target aktif
            </p>
          </div>
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 80 80">
              {/* Background circle */}
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-100"
              />
              {/* Progress circle */}
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="text-emerald-500 transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Target */}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
          Gagal memuat data tabungan.
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-500 mb-4">
            <PiggyBank className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Belum ada target tabungan</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">Mulai rencanakan masa depan Anda dengan membuat target tabungan pertama.</p>
          <Link href="/protected/savings/new" className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
            Buat Target
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const target = Number(goal.target_amount);
            const current = Number(goal.current_amount);
            const percent = Math.min(Math.round((current / target) * 100), 100);
            const color = goal.color || "#10b981";
            const isAchieved = current >= target || goal.status === "achieved";

            return (
              <Link
                key={goal.id}
                href={`/protected/savings/${goal.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}20`, color }}>
                      <Target className="h-6 w-6" />
                    </div>
                    <div className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                      {isAchieved ? "Tercapai" : goal.status}
                    </div>
                  </div>
                  
                  <h3 className="mt-4 font-bold text-slate-900 line-clamp-1">{goal.name}</h3>
                  
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Terkumpul</p>
                      <p className="text-lg font-bold text-slate-900">{formatRupiah(current)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Target</p>
                      <p className="text-sm font-semibold text-slate-700">{formatRupiah(target)}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                      <span style={{ color }}>{percent}% tercapai</span>
                      {goal.deadline && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(goal.deadline)}
                        </span>
                      )}
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: color }} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-emerald-600 group-hover:text-emerald-700">
                  Lihat Detail
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}