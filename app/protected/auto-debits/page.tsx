import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Plus,
  Search,
  Repeat,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";

import { AutoDebitFilters } from "@/components/auto-debits/auto-debit-filters";
import { AutoDebitItem } from "@/components/auto-debits/auto-debit-item";

export const instant = false;

type SearchParams = Promise<{
  status?: string;
  q?: string;
}>;

type AutoDebitRow = {
  id: string;
  name: string;
  amount: number | string;
  frequency: string;
  next_due_date: string;
  status: "active" | "paused" | "completed";
  category: { name: string } | { name: string }[] | null;
  account: { name: string } | { name: string }[] | null;
};

function getRelationName(
  relation: { name: string } | { name: string }[] | null | undefined,
): string | null {
  if (!relation) return null;
  if (Array.isArray(relation)) return relation[0]?.name ?? null;
  return relation.name;
}

export default async function AutoDebitsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const selectedStatus = params.status ?? "all";
  const searchQuery = params.q?.trim() ?? "";

  // --- QUERY 1: SUMMARY (Selalu ambil semua data tanpa filter) ---
  const { data: allData } = await supabase
    .from("auto_debits")
    .select("status, amount")
    .eq("user_id", user.id);

  const allAutoDebits = (allData ?? []) as { status: string; amount: number | string }[];
  const totalActiveAmount = allAutoDebits
    .filter((a) => a.status === "active")
    .reduce((sum, a) => sum + Number(a.amount), 0);
  const totalActiveCount = allAutoDebits.filter((a) => a.status === "active").length;
  const totalPausedCount = allAutoDebits.filter((a) => a.status === "paused").length;

  // --- QUERY 2: DAFTAR (Dengan filter & limit) ---
  let query = supabase
    .from("auto_debits")
    .select(`
      id,
      name,
      amount,
      frequency,
      next_due_date,
      status,
      category:categories (name),
      account:accounts (name)
    `)
    .eq("user_id", user.id);

  if (selectedStatus !== "all") {
    query = query.eq("status", selectedStatus);
  }

  if (searchQuery) {
    query = query.ilike("name", `%${searchQuery}%`);
  }

  const { data, error } = await query
    .order("next_due_date", { ascending: true })
    .limit(100);

  if (error) {
    console.error("Gagal mengambil auto debits:", error.message);
  }

  const autoDebits = (data ?? []) as unknown as AutoDebitRow[];
  const hasFilters = selectedStatus !== "all" || Boolean(searchQuery);

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header halaman */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm text-slate-500">
            Keuangan / Auto Debit
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Auto Debit
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Kelola jadwal pembayaran dan pencatatan otomatis Anda.
          </p>
        </div>

        <Link
          href="/protected/auto-debits/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Jadwal
        </Link>
      </div>

      {/* Ringkasan (Selalu Total Keseluruhan) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Total Nominal Aktif"
          amount={totalActiveAmount}
          description="Estimasi total per siklus"
          icon={<Repeat className="h-5 w-5" />}
          iconClass="bg-blue-100 text-blue-700"
          amountClass="text-slate-900"
        />
        <SummaryCard
          title="Jadwal Aktif"
          amount={totalActiveCount}
          description="Jadwal yang sedang berjalan"
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconClass="bg-emerald-100 text-emerald-700"
          amountClass="text-emerald-700"
          isCount
        />
        <SummaryCard
          title="Jadwal Dijeda"
          amount={totalPausedCount}
          description="Jadwal yang dihentikan sementara"
          icon={<Clock className="h-5 w-5" />}
          iconClass="bg-amber-100 text-amber-700"
          amountClass="text-amber-700"
          isCount
        />
      </div>

      {/* Filter dan daftar */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 md:p-5">
          <AutoDebitFilters />
        </div>

        <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">
              Daftar Auto Debit
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            {autoDebits.length} jadwal ditampilkan
          </p>
        </div>

        {error ? (
          <div className="p-8 text-center">
            <p className="font-medium text-red-700">Gagal memuat jadwal.</p>
            <p className="mt-1 text-sm text-slate-500">
              Silakan muat ulang halaman atau periksa koneksi database.
            </p>
          </div>
        ) : autoDebits.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Search className="h-6 w-6 text-slate-500" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              {hasFilters ? "Jadwal tidak ditemukan" : "Belum ada jadwal auto debit"}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {hasFilters
                ? "Coba ubah kata kunci atau status yang Anda cari."
                : "Mulai buat jadwal agar transaksi rutin tercatat otomatis."}
            </p>
            {hasFilters ? (
              <Link
                href="/protected/auto-debits"
                className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Hapus filter
              </Link>
            ) : (
              <Link
                href="/protected/auto-debits/new"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Tambah Jadwal
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 px-4 md:px-5">
            {autoDebits.map((item) => (
              <AutoDebitItem
                key={item.id}
                id={item.id}
                name={item.name}
                amount={Number(item.amount)}
                frequency={item.frequency}
                next_due_date={item.next_due_date}
                status={item.status}
                account_name={getRelationName(item.account)}
                category_name={getRelationName(item.category)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  title,
  amount,
  description,
  icon,
  iconClass,
  amountClass,
  isCount = false,
}: {
  title: string;
  amount: number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
  amountClass: string;
  isCount?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      <p
        className={`mt-4 break-words text-xl font-bold tracking-tight sm:text-2xl ${amountClass}`}
      >
        {isCount ? amount : formatRupiah(amount)}
      </p>

      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}