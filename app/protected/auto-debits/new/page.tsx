// app/protected/auto-debits/new/page.tsx
import Link from "next/link";
import { ArrowLeft, Repeat } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AutoDebitForm } from "@/components/auto-debits/auto-debit-form";

// Menghindari error prerender di Next.js 16
export const instant = false;

export default async function NewAutoDebitPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Ambil data akun dan kategori untuk form
  const [accountsRes, categoriesRes] = await Promise.all([
    supabase
      .from("accounts")
      .select("id, name")
      .eq("user_id", user.id)
      .eq("is_active", true),
    supabase
      .from("categories")
      .select("id, name, type")
      .eq("user_id", user.id),
  ]);

  const accounts = accountsRes.data ?? [];
  const categories = categoriesRes.data ?? [];

  // KEY UNIK: Memaksa React merender ulang form dari nol saat halaman dibuka
  const formKey = Date.now().toString();

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-6 pb-8">
      <Link
        href="/protected/auto-debits"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Auto Debit
      </Link>

      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Repeat className="h-6 w-6" />
        </div>

        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Tambah Jadwal
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Buat jadwal tagihan atau transaksi berulang agar tercatat otomatis oleh sistem.
          </p>
        </div>
      </div>

      {/* TAMBAHKAN KEY UNIK DI SINI */}
      <AutoDebitForm key={formKey} accounts={accounts} categories={categories} />
    </div>
  );
}