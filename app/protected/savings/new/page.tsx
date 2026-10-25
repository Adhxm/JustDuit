import Link from "next/link";
import { ArrowLeft, PiggyBank } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SavingsGoalForm } from "@/components/savings/savings-goal-form";

export const instant = false;

export default async function NewSavingsGoalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-6 pb-8">
      <Link href="/protected/savings" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-700">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Tabungan
      </Link>

      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <PiggyBank className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Buat Target Tabungan</h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">Tentukan target dan tenggat waktu untuk mewujudkan impian Anda.</p>
        </div>
      </div>

      <SavingsGoalForm />
    </div>
  );
}