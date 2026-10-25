import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Plus,
  Wallet,
  Search,
  CheckCircle2,
  Power,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";
import { AccountFilters } from "@/components/accounts/account-filters";
import { AccountItem } from "@/components/accounts/account-item";

type SearchParams = Promise<{
  status?: string;
  q?: string;
}>;

type AccountType =
  | "cash"
  | "bank"
  | "ewallet"
  | "credit"
  | "investment"
  | "other";

type AccountRow = {
  id: string;
  name: string;
  type: AccountType;
  balance: number | string;
  color: string | null;
  icon: string | null;
  is_active: boolean;
};

const INITIAL_BALANCE_NOTE_PREFIX = "[Saldo Awal]";

export default async function AccountsPage({
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

  const selectedStatus = ["all", "active", "inactive"].includes(
    params.status ?? ""
  )
    ? params.status!
    : "all";
  const searchQuery = params.q?.trim() ?? "";

  let query = supabase
    .from("accounts")
    .select("id, name, type, balance, color, icon, is_active")
    .eq("user_id", user.id);

  if (selectedStatus === "active") {
    query = query.eq("is_active", true);
  } else if (selectedStatus === "inactive") {
    query = query.eq("is_active", false);
  }

  if (searchQuery) {
    query = query.ilike("name", `%${searchQuery}%`);
  }

  const { data, error } = await query
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    console.error("Gagal mengambil akun:", error.message);
  }

  const accounts = (data ?? []) as unknown as AccountRow[];

  // Hitung transaksi per akun, KECUALIKAN transaksi [Saldo Awal]
  // supaya akun yang baru dibuat dengan saldo awal tetap bisa dihapus.
  const { data: txRows } = await supabase
    .from("transactions")
    .select("account_id, note")
    .eq("user_id", user.id);

  const countByAccount = new Map<string, number>();
  for (const row of txRows ?? []) {
    const r = row as { account_id: string; note: string | null };
    if (r.note?.startsWith(INITIAL_BALANCE_NOTE_PREFIX)) continue;
    countByAccount.set(
      r.account_id,
      (countByAccount.get(r.account_id) ?? 0) + 1
    );
  }

  // Summary dari semua akun (bukan hanya hasil filter)
  const { data: allRows } = await supabase
    .from("accounts")
    .select("balance, is_active")
    .eq("user_id", user.id);

  const allAccounts = (allRows ?? []) as {
    balance: number | string;
    is_active: boolean;
  }[];
  const totalActiveBalance = allAccounts
    .filter((a) => a.is_active)
    .reduce((sum, a) => sum + Number(a.balance), 0);
  const activeCount = allAccounts.filter((a) => a.is_active).length;
  const inactiveCount = allAccounts.filter((a) => !a.is_active).length;

  const hasFilters = selectedStatus !== "all" || Boolean(searchQuery);

  const activeAccounts = accounts.filter((a) => a.is_active);
  const inactiveAccounts = accounts.filter((a) => !a.is_active);

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm text-slate-500">Keuangan / Akun</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Akun
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Kelola dompet, rekening bank, dan sumber dana Anda.
          </p>
        </div>

        <Link
          href="/protected/accounts/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Akun
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Saldo Aktif"
          value={formatRupiah(totalActiveBalance)}
          description="Dari semua akun aktif"
          icon={<Wallet className="h-5 w-5" />}
          iconClass="bg-emerald-100 text-emerald-700"
          valueClass="text-slate-900"
        />
        <SummaryCard
          title="Akun Aktif"
          value={String(activeCount)}
          description="Akun yang sedang digunakan"
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconClass="bg-emerald-100 text-emerald-700"
          valueClass="text-emerald-700"
          isCount
        />
        <SummaryCard
          title="Akun Nonaktif"
          value={String(inactiveCount)}
          description="Disembunyikan dari form transaksi"
          icon={<Power className="h-5 w-5" />}
          iconClass="bg-slate-200 text-slate-600"
          valueClass="text-slate-700"
          isCount
        />
      </div>

      {/* List */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 md:p-5">
          <AccountFilters />
        </div>

        <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">
              Daftar Akun
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            {accounts.length} akun ditampilkan
          </p>
        </div>

        {error ? (
          <div className="p-8 text-center">
            <p className="font-medium text-red-700">Gagal memuat akun.</p>
            <p className="mt-1 text-sm text-slate-500">
              Silakan muat ulang halaman atau periksa koneksi database.
            </p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Search className="h-6 w-6 text-slate-500" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              {hasFilters ? "Akun tidak ditemukan" : "Belum ada akun"}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {hasFilters
                ? "Coba ubah kata kunci atau status yang Anda cari."
                : "Tambahkan akun pertama Anda agar bisa mencatat transaksi."}
            </p>
            {hasFilters ? (
              <Link
                href="/protected/accounts"
                className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Hapus filter
              </Link>
            ) : (
              <Link
                href="/protected/accounts/new"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Tambah Akun
              </Link>
            )}
          </div>
        ) : (
          <div>
            {activeAccounts.length > 0 && (
              <div>
                <div className="bg-slate-50 px-4 py-2 md:px-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Akun Aktif
                  </p>
                </div>
                <div className="divide-y divide-slate-100 px-4 md:px-5">
                  {activeAccounts.map((a) => (
                    <AccountItem
                      key={a.id}
                      id={a.id}
                      name={a.name}
                      type={a.type}
                      balance={Number(a.balance)}
                      color={a.color}
                      icon={a.icon}
                      is_active={a.is_active}
                      transaction_count={countByAccount.get(a.id) ?? 0}
                    />
                  ))}
                </div>
              </div>
            )}

            {inactiveAccounts.length > 0 && (
              <div>
                <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 md:px-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Akun Nonaktif
                  </p>
                </div>
                <div className="divide-y divide-slate-100 px-4 md:px-5">
                  {inactiveAccounts.map((a) => (
                    <AccountItem
                      key={a.id}
                      id={a.id}
                      name={a.name}
                      type={a.type}
                      balance={Number(a.balance)}
                      color={a.color}
                      icon={a.icon}
                      is_active={a.is_active}
                      transaction_count={countByAccount.get(a.id) ?? 0}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  iconClass,
  valueClass,
  isCount = false,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
  valueClass: string;
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
        className={`mt-4 break-words text-xl font-bold tracking-tight sm:text-2xl ${valueClass}`}
      >
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}