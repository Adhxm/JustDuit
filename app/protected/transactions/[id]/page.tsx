import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Wallet,
  Tags,
  FileText,
  CalendarDays,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatDate } from "@/lib/utils";
import { DeleteTransactionButton } from "@/components/transactions/delete-transaction-button";

export const instant = false;

export default async function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: tx, error } = await supabase
    .from("transactions")
    .select(`
      id, type, amount, note, transaction_date, created_at, auto_debit_id,
      category:categories (name, color),
      account:accounts!transactions_account_id_fkey (name, type),
      to_account:accounts!transactions_to_account_id_fkey (name)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Detail Transaction Error:", error.message);
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-red-600">Gagal memuat detail</h1>
        <p className="mt-2 text-sm text-slate-500">{error.message}</p>
        <Link href="/protected/transactions" className="mt-6 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          Kembali ke Daftar
        </Link>
      </div>
    );
  }

  if (!tx) notFound();

  const category = Array.isArray(tx.category) ? tx.category[0] : tx.category;
  const account = Array.isArray(tx.account) ? tx.account[0] : tx.account;
  const toAccount = Array.isArray(tx.to_account) ? tx.to_account[0] : tx.to_account;

  const isIncome = tx.type === "income";
  const isTransfer = tx.type === "transfer";
  
  const Icon = isTransfer ? ArrowLeftRight : isIncome ? ArrowDownLeft : ArrowUpRight;
  const iconBg = isTransfer ? "bg-blue-100 text-blue-600" : isIncome ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600";
  const amountColor = isTransfer ? "text-slate-900" : isIncome ? "text-emerald-600" : "text-red-600";
  const amountPrefix = isTransfer ? "" : isIncome ? "+" : "-";

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl space-y-4 pb-8 sm:space-y-6">
      
      {/* Header Navigation & Action */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/protected/transactions"
          className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Transaksi
        </Link>
        
        <div className="w-full sm:w-auto">
          <DeleteTransactionButton transactionId={id} />
        </div>
      </div>

      {/* Kartu Utama */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
        
        {/* Bagian Hero (Nominal) */}
        <div className="flex flex-col items-center justify-center px-4 py-8 text-center sm:px-6 sm:py-12">
          <div className={`flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16 ${iconBg}`}>
            <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500 sm:text-sm">
            {isTransfer ? "Transfer" : isIncome ? "Pemasukan" : "Pengeluaran"}
          </p>
          
          {/* Nominal Responsif */}
          <h1 className={`mt-1 break-words text-2xl font-bold tracking-tight sm:text-4xl ${amountColor}`}>
            {amountPrefix}{formatRupiah(Number(tx.amount))}
          </h1>
          
          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 sm:text-sm">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(tx.transaction_date, "long")}
          </p>
        </div>

        {/* Bagian Rincian */}
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900 sm:mb-5">Rincian Transaksi</h2>
          
          <div className="space-y-4 sm:space-y-5">
            
            {/* Akun Asal */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
                <Wallet className="h-4 w-4 shrink-0" /> 
                <span>{isTransfer ? "Dari Akun" : "Akun"}</span>
              </div>
              <div className="min-w-0 text-right">
                <p className="truncate text-sm font-semibold text-slate-900">{account?.name ?? "Tidak ada"}</p>
                <p className="truncate text-xs capitalize text-slate-500">{account?.type}</p>
              </div>
            </div>

            {/* Akun Tujuan (Jika Transfer) */}
            {isTransfer && toAccount && (
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
                  <ArrowLeftRight className="h-4 w-4 shrink-0" /> 
                  <span>Ke Akun</span>
                </div>
                <div className="min-w-0 text-right">
                  <p className="truncate text-sm font-semibold text-slate-900">{toAccount?.name}</p>
                </div>
              </div>
            )}

            {/* Kategori */}
            {category && (
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
                  <Tags className="h-4 w-4 shrink-0" /> 
                  <span>Kategori</span>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className="h-2.5 w-2.5 shrink-0 rounded-full" 
                    style={{ backgroundColor: category.color || "#64748b" }} 
                  />
                  <p className="truncate text-sm font-semibold text-slate-900">{category.name}</p>
                </div>
              </div>
            )}

            {/* Catatan */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
                <FileText className="h-4 w-4 shrink-0" /> 
                <span>Catatan</span>
              </div>
              <p className="max-w-[60%] break-words text-right text-sm font-medium text-slate-900 sm:max-w-[70%]">
                {tx.note || "-"}
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}