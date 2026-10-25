
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Plus,
  Search,
  CalendarDays,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight as TransferIcon,
  ReceiptText,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionItem } from "@/components/transactions/transaction-item";

type SearchParams = Promise<{
  type?: string;
  q?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
}>;

type TransactionRow = {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number | string;
  note: string | null;
  transaction_date: string;
  created_at: string;
  category: { name: string } | { name: string }[] | null;
  account: { name: string } | { name: string }[] | null;
  to_account: { name: string } | { name: string }[] | null;
};

function getRelationName(
  relation:
    | { name: string }
    | { name: string }[]
    | null
    | undefined,
): string | null {
  if (!relation) return null;
  if (Array.isArray(relation)) return relation[0]?.name ?? null;
  return relation.name;
}

function formatDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatGroupDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day)
    .toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();
}

export default async function TransactionsPage({
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

const selectedType = params.type ?? "all";
const searchQuery = params.q?.trim() ?? "";
const selectedMonth = params.month ?? "";

let selectedStartDate = params.startDate ?? "";
let selectedEndDate = params.endDate ?? "";

// Pastikan format tanggal valid: YYYY-MM-DD
const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value;
};

if (!isValidDate(selectedStartDate)) selectedStartDate = "";
if (!isValidDate(selectedEndDate)) selectedEndDate = "";

// Jika tanggal terbalik, tukar secara otomatis.
if (
  selectedStartDate &&
  selectedEndDate &&
  selectedStartDate > selectedEndDate
) {
  [selectedStartDate, selectedEndDate] = [
    selectedEndDate,
    selectedStartDate,
  ];
}

  let query = supabase
    .from("transactions")
    .select(`
      id,
      type,
      amount,
      note,
      transaction_date,
      created_at,
      category:categories (name),
      account:accounts!transactions_account_id_fkey (name),
      to_account:accounts!transactions_to_account_id_fkey (name)
    `)
    .eq("user_id", user.id);

  if (
    selectedType === "income" ||
    selectedType === "expense" ||
    selectedType === "transfer"
  ) {
    query = query.eq("type", selectedType);
  }

  if (searchQuery) {
    query = query.ilike("note", `%${searchQuery}%`);
  }

// Filter rentang tanggal memiliki prioritas atas filter bulan.
if (selectedStartDate || selectedEndDate) {
  if (selectedStartDate) {
    query = query.gte("transaction_date", selectedStartDate);
  }

  if (selectedEndDate) {
    query = query.lte("transaction_date", selectedEndDate);
  }
} else if (/^\d{4}-\d{2}$/.test(selectedMonth)) {
  const [year, month] = selectedMonth.split("-").map(Number);

  if (month >= 1 && month <= 12) {
    const startDate =
      `${year}-${String(month).padStart(2, "0")}-01`;

    const nextMonth = new Date(year, month, 1);
    const endDate = [
      nextMonth.getFullYear(),
      String(nextMonth.getMonth() + 1).padStart(2, "0"),
      String(nextMonth.getDate()).padStart(2, "0"),
    ].join("-");

    query = query
      .gte("transaction_date", startDate)
      .lt("transaction_date", endDate);
  }
}

  const { data, error } = await query
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Gagal mengambil transaksi:", error.message);
  }

  const transactions = (data ?? []) as unknown as TransactionRow[];

  const totalIncome = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalExpense = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalTransfer = transactions
    .filter((item) => item.type === "transfer")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const groupedTransactions = transactions.reduce<
    Record<string, TransactionRow[]>
  >((groups, transaction) => {
    const date = transaction.transaction_date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(transaction);
    return groups;
  }, {});

const hasFilters =
  selectedType !== "all" ||
  Boolean(searchQuery) ||
  Boolean(selectedMonth) ||
  Boolean(selectedStartDate) ||
  Boolean(selectedEndDate);

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header halaman */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm text-slate-500">
            Keuangan / Transaksi
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Transaksi
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Pantau dan kelola seluruh aktivitas keuangan Anda.
          </p>
        </div>

        <Link
          href="/protected/transactions/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Transaksi
        </Link>
      </div>

      {/* Ringkasan transaksi */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Total Pemasukan"
          amount={totalIncome}
          description="Berdasarkan hasil filter"
          icon={<ArrowDownLeft className="h-5 w-5" />}
          iconClass="bg-emerald-100 text-emerald-700"
          amountClass="text-emerald-700"
        />

        <SummaryCard
          title="Total Pengeluaran"
          amount={totalExpense}
          description="Berdasarkan hasil filter"
          icon={<ArrowUpRight className="h-5 w-5" />}
          iconClass="bg-red-100 text-red-700"
          amountClass="text-red-700"
        />

        <SummaryCard
          title="Total Transfer"
          amount={totalTransfer}
          description="Berdasarkan hasil filter"
          icon={<ArrowLeftRight className="h-5 w-5" />}
          iconClass="bg-blue-100 text-blue-700"
          amountClass="text-slate-900"
        />
      </div>

      {/* Filter dan riwayat */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 md:p-5">
          <TransactionFilters />
        </div>

        <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">
              Riwayat Transaksi
            </h2>
          </div>

          <p className="text-xs text-slate-500">
            {transactions.length} transaksi ditampilkan
            {transactions.length === 200 ? " (maks. 200)" : ""}
          </p>
        </div>

        {error ? (
          <div className="p-8 text-center">
            <p className="font-medium text-red-700">
              Gagal memuat transaksi.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Silakan muat ulang halaman atau periksa koneksi database.
            </p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Search className="h-6 w-6 text-slate-500" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              {hasFilters
                ? "Transaksi tidak ditemukan"
                : "Belum ada transaksi"}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {hasFilters
                ? "Coba ubah kata kunci atau filter yang Anda gunakan."
                : "Mulai catat pemasukan, pengeluaran, atau transfer Anda."}
            </p>

            {hasFilters ? (
              <Link
                href="/protected/transactions"
                className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Hapus semua filter
              </Link>
            ) : (
              <Link
                href="/protected/transactions/new"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Tambah Transaksi
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {Object.entries(groupedTransactions).map(([date, items]) => (
              <div key={date}>
                <div className="sticky top-16 z-10 flex items-center gap-2 bg-slate-50 px-4 py-3 md:px-5">
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  <h3 className="text-xs font-semibold tracking-wide text-slate-600">
                    {formatGroupDate(date)}
                  </h3>
                </div>
                <div className="divide-y divide-slate-100 px-4 md:px-5">
                {items.map((transaction) => (
                    <TransactionItem
                    key={transaction.id}
                    id={transaction.id}
                    type={transaction.type}
                    amount={Number(transaction.amount)}
                    note={transaction.note}
                    transaction_date={transaction.transaction_date}
                    category_name={getRelationName(transaction.category)}
                    account_name={getRelationName(transaction.account)}
                    to_account_name={getRelationName(transaction.to_account)}
                    is_auto_debit={false}
                    />
                ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {transactions.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 md:px-5">
            <p className="text-xs text-slate-500">
              Menampilkan maksimal 200 transaksi terbaru.
            </p>
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
}: {
  title: string;
  amount: number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
  amountClass: string;
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
        {formatRupiah(amount)}
      </p>

      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}
