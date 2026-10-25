"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";
import {
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
  MoreVertical,
  Pencil,
  Power,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { formatRupiah, cn } from "@/lib/utils";
import {
  toggleAccountActive,
  deleteAccount,
} from "@/app/protected/accounts/actions";

type AccountType =
  | "cash"
  | "bank"
  | "ewallet"
  | "credit"
  | "investment"
  | "other";

const TYPE_LABEL: Record<AccountType, string> = {
  cash: "Tunai",
  bank: "Bank",
  ewallet: "E-Wallet",
  credit: "Kartu Kredit",
  investment: "Investasi",
  other: "Lainnya",
};

const ICON_MAP: Record<string, typeof Wallet> = {
  wallet: Wallet,
  "building-2": Building2,
  smartphone: Smartphone,
  "credit-card": CreditCard,
  "trending-up": TrendingUp,
  "piggy-bank": PiggyBank,
  landmark: Landmark,
  coins: Coins,
  briefcase: Briefcase,
  banknote: Banknote,
};

interface AccountItemProps {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string | null;
  icon: string | null;
  is_active: boolean;
  transaction_count: number;
}

export function AccountItem({
  id,
  name,
  type,
  balance,
  color,
  icon,
  is_active,
  transaction_count,
}: AccountItemProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const Icon = ICON_MAP[icon ?? "wallet"] ?? Wallet;
  const finalColor = color ?? "#3b82f6";

  // Buka menu dengan posisi fixed berdasarkan tombol
  function openMenu(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const right = Math.max(8, viewportWidth - rect.right);
    const top = rect.bottom + 4;
    const estimatedHeight = 140;
    const finalTop =
      top + estimatedHeight > window.innerHeight
        ? rect.top - estimatedHeight - 4
        : top;
    setMenuCoords({ top: finalTop, right });
    setMenuOpen(true);
  }

  function handleToggle() {
    setActionError(null);
    setMenuOpen(false);

    const fd = new FormData();
    fd.append("id", id);
    fd.append("is_active", String(is_active));

    startTransition(async () => {
      const result = await toggleAccountActive(fd);
      if (result?.error) {
        setActionError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    setActionError(null);

    const fd = new FormData();
    fd.append("id", id);

    startTransition(async () => {
      const result = await deleteAccount(fd);
      if (result?.error) {
        setActionError(result.error);
        setConfirmDelete(false);
        return;
      }
      setConfirmDelete(false);
      router.refresh();
    });
  }

  const canDelete = transaction_count === 0;

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between",
          !is_active && "opacity-70"
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${finalColor}20`, color: finalColor }}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-slate-900">
                {name}
              </p>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                  is_active
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-600"
                )}
              >
                {is_active ? "Aktif" : "Nonaktif"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {TYPE_LABEL[type]}
              {transaction_count > 0 && (
                <>
                  {" • "}
                  {transaction_count} transaksi
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p
            className={cn(
              "text-sm font-bold tabular-nums",
              balance < 0 ? "text-red-600" : "text-slate-900"
            )}
          >
            {formatRupiah(balance)}
          </p>

          <button
            type="button"
            onClick={openMenu}
            disabled={isPending}
            aria-label="Menu akun"
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {actionError && (
        <div className="mb-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          {actionError}
        </div>
      )}

      {/* Dropdown via portal */}
      {menuOpen &&
        menuCoords &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <button
              type="button"
              aria-label="Tutup menu"
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[90] cursor-default"
            />
            <div
              className="fixed z-[100] w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
              style={{ top: menuCoords.top, right: menuCoords.right }}
            >
              <Link
                href={`/protected/accounts/new?edit=${id}`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setMenuOpen(false)}
              >
                <Pencil className="h-4 w-4 text-slate-400" />
                Edit akun
              </Link>

              <button
                type="button"
                onClick={handleToggle}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <Power className="h-4 w-4 text-slate-400" />
                {is_active ? "Nonaktifkan" : "Aktifkan"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmDelete(true);
                }}
                disabled={!canDelete}
                title={
                  canDelete
                    ? "Hapus akun"
                    : "Tidak bisa dihapus: masih ada transaksi"
                }
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
              >
                <Trash2 className="h-4 w-4" />
                Hapus akun
              </button>
            </div>
          </>,
          document.body
        )}

      {/* Modal konfirmasi hapus via portal */}
      {confirmDelete &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setConfirmDelete(false);
            }}
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Hapus akun?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Akun <strong>{name}</strong> akan dihapus permanen. Tindakan ini
                tidak bisa dibatalkan.
                {transaction_count === 0
                  ? " Akun ini tidak memiliki transaksi riil, jadi aman dihapus."
                  : ""}
              </p>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={isPending}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {isPending ? "Menghapus..." : "Ya, hapus"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}