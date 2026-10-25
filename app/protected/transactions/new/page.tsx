import Link from "next/link";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TransactionForm } from "@/components/transactions/transaction-form";

export const instant = false;

type TxType = "income" | "expense" | "transfer";

interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function NewTransactionPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const validTypes: TxType[] = ["income", "expense", "transfer"];
  const initialType: TxType = validTypes.includes(params.type as TxType)
    ? (params.type as TxType)
    : "expense";

  // Menghasilkan string unik setiap kali halaman dirender di server
  const formKey = Date.now().toString();

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-6 pb-8">
      <Link
        href="/protected/transactions"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Transaksi
      </Link>

      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <ReceiptText className="h-6 w-6" />
        </div>

        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Tambah Transaksi
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Catat pemasukan, pengeluaran, atau transfer agar keuanganmu
            tetap terpantau.
          </p>
        </div>
      </div>

      {/* TAMBAHKAN KEY DI SINI */}
      <TransactionForm key={formKey} initialType={initialType} />
    </div>
  );
}