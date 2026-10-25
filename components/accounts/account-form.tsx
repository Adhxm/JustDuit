"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  Wallet,
  Building2,
  Smartphone,
  CreditCard,
  TrendingUp,
  PiggyBank,
  Landmark,
  Coins,
  Briefcase,
  Banknote,
  Type,
  Palette,
} from "lucide-react";

import { createAccount, updateAccount } from "@/app/protected/accounts/actions";
import { formatRupiah } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StylishSelect } from "@/components/ui/stylish-select";

type AccountType =
  | "cash"
  | "bank"
  | "ewallet"
  | "credit"
  | "investment"
  | "other";

const DEFAULT_COLOR_BY_TYPE: Record<AccountType, string> = {
  cash: "#10b981",
  bank: "#3b82f6",
  ewallet: "#8b5cf6",
  credit: "#ef4444",
  investment: "#f59e0b",
  other: "#64748b",
};

const DEFAULT_ICON_BY_TYPE: Record<AccountType, string> = {
  cash: "wallet",
  bank: "building-2",
  ewallet: "smartphone",
  credit: "credit-card",
  investment: "trending-up",
  other: "wallet",
};

const TYPE_OPTIONS: { value: AccountType; label: string; description: string }[] = [
  { value: "cash", label: "Tunai", description: "Dompet, celengan" },
  { value: "bank", label: "Bank", description: "BCA, Mandiri, BRI" },
  { value: "ewallet", label: "E-Wallet", description: "GoPay, OVO, DANA" },
  { value: "credit", label: "Kartu Kredit", description: "BNI, BCA, Mandiri" },
  { value: "investment", label: "Investasi", description: "Reksadana, saham" },
  { value: "other", label: "Lainnya", description: "Tipe lainnya" },
];

const ICON_OPTIONS = [
  { value: "wallet", label: "Dompet", Icon: Wallet },
  { value: "building-2", label: "Gedung Bank", Icon: Building2 },
  { value: "smartphone", label: "Smartphone", Icon: Smartphone },
  { value: "credit-card", label: "Kartu Kredit", Icon: CreditCard },
  { value: "trending-up", label: "Grafik Naik", Icon: TrendingUp },
  { value: "piggy-bank", label: "Celengan", Icon: PiggyBank },
  { value: "landmark", label: "Bank", Icon: Landmark },
  { value: "coins", label: "Koin", Icon: Coins },
  { value: "briefcase", label: "Tas Kerja", Icon: Briefcase },
  { value: "banknote", label: "Uang Kertas", Icon: Banknote },
];

const PRESET_COLORS = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#f59e0b",
  "#64748b",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#84cc16",
];

interface AccountFormProps {
  mode: "create" | "edit";
  initial?: {
    id: string;
    name: string;
    type: AccountType;
    initial_balance: number;
    color: string | null;
    icon: string | null;
  };
}

export function AccountForm({ mode, initial }: AccountFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<AccountType>(initial?.type ?? "cash");
  const [initialBalance, setInitialBalance] = useState(
    initial?.initial_balance ? String(initial.initial_balance) : ""
  );
  const [color, setColor] = useState(
    initial?.color ?? DEFAULT_COLOR_BY_TYPE[initial?.type ?? "cash"]
  );
  const [icon, setIcon] = useState(
    initial?.icon ?? DEFAULT_ICON_BY_TYPE[initial?.type ?? "cash"]
  );

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const initialBalanceNumber = Number(initialBalance);

  // Saat tipe berubah, update warna dan ikon default
  function handleTypeChange(newType: string) {
    const t = newType as AccountType;
    setType(t);
    setColor(DEFAULT_COLOR_BY_TYPE[t]);
    setIcon(DEFAULT_ICON_BY_TYPE[t]);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nama akun tidak boleh kosong.");
      return;
    }

    if (mode === "create") {
      if (
        !initialBalance ||
        !Number.isSafeInteger(initialBalanceNumber) ||
        initialBalanceNumber < 0
      ) {
        setError("Masukkan saldo awal yang valid (bilangan bulat ≥ 0).");
        return;
      }
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("color", color);
    formData.append("icon", icon);

    if (mode === "create") {
      formData.append("initial_balance", initialBalanceNumber.toString());
    } else {
      if (!initial?.id) {
        setError("ID akun hilang.");
        return;
      }
      formData.append("id", initial.id);
    }

    // Menggunakan startTransition agar state isPending otomatis reset
    // ketika proses async dan router.push selesai.
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createAccount(formData)
          : await updateAccount(formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.push("/protected/accounts");
      router.refresh();
    });
  }

  function handleBalanceChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInitialBalance(e.target.value.replace(/\D/g, ""));
  }

  const displayBalance = initialBalance
    ? Number(initialBalance).toLocaleString("id-ID")
    : "";

  // Icon preview dinamis
  const CurrentIcon =
    ICON_OPTIONS.find((opt) => opt.value === icon)?.Icon ?? Wallet;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="space-y-6 p-4 sm:p-6">
        {/* Nama akun */}
        <section>
          <Label
            htmlFor="name"
            className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900"
          >
            <Type className="h-4 w-4 text-slate-500" />
            Nama Akun
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Dompet Utama, BCA, GoPay..."
            maxLength={50}
            required
            className="h-11 w-full min-w-0 rounded-xl"
          />
        </section>

        {/* Tipe akun */}
        <section>
          <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Wallet className="h-4 w-4 text-slate-500" />
            Tipe Akun
          </Label>
          <StylishSelect
            value={type}
            onChange={handleTypeChange}
            placeholder="Pilih tipe akun"
            searchPlaceholder="Cari tipe..."
            emptyMessage="Tipe tidak ditemukan"
            icon={<Wallet className="h-5 w-5" />}
            options={TYPE_OPTIONS}
          />
        </section>

        {/* Saldo awal */}
        <section>
          <Label
            htmlFor="initial_balance"
            className="mb-2 block text-sm font-semibold text-slate-900"
          >
            Saldo Awal
          </Label>

          <div
            className={`rounded-xl border p-3 transition sm:p-4 ${
              mode === "edit"
                ? "border-slate-200 bg-slate-100"
                : "border-slate-200 bg-slate-50 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15"
            }`}
          >
            <div className="mb-1 text-xs text-slate-500">
              {mode === "edit"
                ? "Tidak bisa diubah (memengaruhi histori)"
                : "Nominal Rupiah"}
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-base font-semibold text-slate-500">
                Rp
              </span>
              <input
                id="initial_balance"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={displayBalance}
                onChange={handleBalanceChange}
                placeholder="0"
                required={mode === "create"}
                disabled={mode === "edit"}
                className="w-full min-w-0 bg-transparent text-2xl font-bold tracking-tight text-slate-900 outline-none placeholder:text-slate-300 disabled:cursor-not-allowed disabled:text-slate-500 sm:text-3xl"
              />
            </div>
            {mode === "create" && initialBalanceNumber > 0 && (
              <p className="mt-2 break-words text-xs text-slate-500">
                {formatRupiah(initialBalanceNumber)}
                <span className="ml-1 text-slate-400">
                  (dicatat sebagai transaksi [Saldo Awal])
                </span>
              </p>
            )}
          </div>
        </section>

        {/* Warna */}
        <section>
          <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Palette className="h-4 w-4 text-slate-500" />
            Warna
          </Label>

          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setColor(preset)}
                aria-label={`Pilih warna ${preset}`}
                aria-pressed={color === preset}
                className={`h-9 w-9 rounded-xl border-2 transition ${
                  color === preset
                    ? "border-slate-900 ring-2 ring-slate-900/20"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: preset }}
              />
            ))}

            <label
              className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-slate-500 transition hover:border-slate-500 hover:text-slate-700"
              title="Warna kustom"
            >
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <span
                className="h-4 w-4 rounded"
                style={{ backgroundColor: color }}
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Warna dipakai sebagai latar ikon di daftar akun.
          </p>
        </section>

        {/* Ikon */}
        <section>
          <Label className="mb-2 block text-sm font-semibold text-slate-900">
            Ikon
          </Label>

          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((opt) => {
              const Icon = opt.Icon;
              const active = icon === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setIcon(opt.value)}
                  aria-label={opt.label}
                  aria-pressed={active}
                  title={opt.label}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                    active
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Preview */}
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 text-xs font-medium text-slate-500">
            Pratinjau akun
          </p>
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${color}20`, color }}
            >
              <CurrentIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {name || "Nama Akun"}
              </p>
              <p className="text-xs text-slate-500">
                {TYPE_OPTIONS.find((t) => t.value === type)?.label ?? type}
              </p>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="break-words rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}
      </div>

      {/* Action */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 sm:w-auto"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {isPending
            ? "Menyimpan..."
            : mode === "create"
              ? "Simpan Akun"
              : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}