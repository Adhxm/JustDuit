import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// ============================================================
// JUSTDUIT UTILITIES
// ============================================================

/**
 * Format angka menjadi Rupiah
 * @example formatRupiah(1500000)          -> "Rp 1.500.000"
 * @example formatRupiah(1500000, true)    -> "Rp 1.5jt"
 */
export function formatRupiah(amount: number, compact = false) {
  if (compact) {
    const abs = Math.abs(amount);
    if (abs >= 1_000_000_000) {
      return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
    }
    if (abs >= 1_000_000) {
      return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
    }
    if (abs >= 1_000) {
      return `Rp ${(amount / 1_000).toFixed(0)}rb`;
    }
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format tanggal ke format Indonesia
 * @example formatDate("2025-01-15")          -> "15 Jan"
 * @example formatDate("2025-01-15", "long")  -> "15 Januari 2025"
 */
export function formatDate(
  date: string | Date,
  format: "short" | "long" = "short"
) {
  const d = typeof date === "string" ? new Date(date) : date;
  if (format === "short") {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
    }).format(d);
  }
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Format tanggal jadi "2 jam lalu", "3 hari lalu", dll
 */
export function timeAgo(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
  return formatDate(d, "short");
}