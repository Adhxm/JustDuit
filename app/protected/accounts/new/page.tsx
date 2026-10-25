import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AccountForm } from "@/components/accounts/account-form";

export const instant = false;

type AccountType =
  | "cash"
  | "bank"
  | "ewallet"
  | "credit"
  | "investment"
  | "other";

interface PageProps {
  searchParams: Promise<{ edit?: string }>;
}

export default async function NewAccountPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const editId = params.edit;

  let initial:
    | {
        id: string;
        name: string;
        type: AccountType;
        initial_balance: number;
        color: string | null;
        icon: string | null;
      }
    | undefined;

  if (editId) {
    const { data } = await supabase
      .from("accounts")
      .select("id, name, type, initial_balance, color, icon")
      .eq("id", editId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!data) {
      redirect("/protected/accounts");
    }

    initial = {
      id: data.id,
      name: data.name,
      type: data.type as AccountType,
      initial_balance: Number(data.initial_balance),
      color: data.color,
      icon: data.icon,
    };
  }

  const isEdit = Boolean(initial);

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-6 pb-8">
      <Link
        href="/protected/accounts"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Akun
      </Link>

      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Wallet className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {isEdit ? "Edit Akun" : "Tambah Akun"}
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {isEdit
              ? "Perbarui informasi akun. Saldo awal tidak bisa diubah karena memengaruhi histori transaksi."
              : "Tambahkan dompet, rekening, atau sumber dana baru."}
          </p>
        </div>
      </div>

      <AccountForm
        mode={isEdit ? "edit" : "create"}
        initial={initial}
      />
    </div>
  );
}