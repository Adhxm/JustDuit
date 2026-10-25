import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Target, CalendarDays, Plus, ArrowDownLeft, ArrowUpRight, Trash2 } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatDate } from "@/lib/utils";
import { SavingsTransactionModal } from "@/components/savings/savings-transaction-modal";
import { DeleteGoalButton } from "@/components/savings/delete-goal-button";

export const instant = false;

export default async function SavingsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch Goal
  const { data: goal } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!goal) notFound();

  // Fetch Transactions
  const { data: transactions } = await supabase
    .from("savings_transactions")
    .select("id, type, amount, note, transaction_date, created_at")
    .eq("goal_id", id)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  // Fetch Accounts (untuk opsi di Modal Transaksi)
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, balance")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("name");

  const target = Number(goal.target_amount);
  const current = Number(goal.current_amount);
  const percent = Math.min(Math.round((current / target) * 100), 100);
  const color = goal.color || "#10b981";
  const isAchieved = current >= target || goal.status === "achieved";

  return (
    <div className="mx-auto w-full min-w-0 max-w-4xl space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <Link href="/protected/savings" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-700">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Tabungan
        </Link>
        <DeleteGoalButton goalId={id} goalName={goal.name} />
      </div>

      {/* Hero Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6 sm:p-8" style={{ background: `linear-gradient(to bottom right, ${color}15, white)` }}>
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}20`, color }}>
              <Target className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{goal.name}</h1>
              {goal.deadline && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <CalendarDays className="h-4 w-4" /> Target tercapai sebelum {formatDate(goal.deadline, "long")}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-slate-500">Terkumpul</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{formatRupiah(current)}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-sm font-medium text-slate-500">Target</p>
              <p className="mt-1 text-2xl font-bold text-slate-700">{formatRupiah(target)}</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm font-semibold mb-2">
              <span style={{ color }}>{percent}% Tercapai</span>
              <span className="text-slate-500">Sisa {formatRupiah(Math.max(target - current, 0))}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/60">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: color }} />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <SavingsTransactionModal goalId={id} accounts={accounts ?? []} defaultType="deposit" currentBalance={current} />
            <SavingsTransactionModal goalId={id} accounts={accounts ?? []} defaultType="withdraw" currentBalance={current} />
          </div>
        </div>
      </div>

      {/* Riwayat Transaksi */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="font-semibold text-slate-900">Riwayat Transaksi</h2>
        </div>
        {(!transactions || transactions.length === 0) ? (
          <div className="p-10 text-center text-sm text-slate-500">Belum ada transaksi untuk target ini.</div>
        ) : (
          <div className="divide-y divide-slate-100 px-5 sm:px-6">
            {transactions.map((tx) => {
              const isDeposit = tx.type === "deposit";
              return (
                <div key={tx.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isDeposit ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                      {isDeposit ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{tx.note || (isDeposit ? "Setor Dana" : "Tarik Dana")}</p>
                      <p className="text-xs text-slate-500">{formatDate(tx.transaction_date, "long")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isDeposit ? "text-emerald-600" : "text-amber-600"}`}>
                      {isDeposit ? "+" : "-"}{formatRupiah(Number(tx.amount))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}