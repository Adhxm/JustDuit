"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Repeat, Clock, PauseCircle, Tags, MoreVertical,
  Play, Pause, Trash2, Loader2, AlertTriangle
} from "lucide-react";
import { formatRupiah, cn } from "@/lib/utils";
import { toggleAutoDebitStatus, deleteAutoDebit } from "@/app/protected/auto-debits/actions";

interface AutoDebitItemProps {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  next_due_date: string;
  status: "active" | "paused" | "completed";
  account_name: string | null;
  category_name: string | null;
}

function formatDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

const frequencyLabels: Record<string, string> = {
  daily: "Harian", weekly: "Mingguan", monthly: "Bulanan", yearly: "Tahunan",
};

export function AutoDebitItem({
  id, name, amount, frequency, next_due_date, status, account_name, category_name,
}: AutoDebitItemProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; right: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isPaused = status === "paused";
  const isCompleted = status === "completed";

  function openMenu(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const right = Math.max(8, window.innerWidth - rect.right);
    const top = rect.bottom + 4;
    const estimatedHeight = 120;
    const finalTop = top + estimatedHeight > window.innerHeight ? rect.top - estimatedHeight - 4 : top;
    setMenuCoords({ top: finalTop, right });
    setMenuOpen(true);
  }

  function handleToggle() {
    setMenuOpen(false);
    const fd = new FormData();
    fd.append("id", id);
    fd.append("new_status", isPaused ? "active" : "paused");

    startTransition(async () => {
      const res = await toggleAutoDebitStatus(fd);
      if (res.error) alert(res.error);
      else router.refresh();
    });
  }

  function handleDelete() {
    const fd = new FormData();
    fd.append("id", id);

    startTransition(async () => {
      const res = await deleteAutoDebit(fd);
      if (res.error) alert(res.error);
      else {
        setConfirmDelete(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            isPaused || isCompleted ? "bg-slate-100 text-slate-400" : "bg-emerald-100 text-emerald-600"
          )}>
            {isPaused || isCompleted ? <PauseCircle className="h-5 w-5" /> : <Repeat className="h-5 w-5" />}
          </div>
          
          <div className="min-w-0 flex-1">
            <p className={cn("truncate text-sm font-semibold", isPaused || isCompleted ? "text-slate-500" : "text-slate-900")}>
              {name}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <span className="font-medium">{frequencyLabels[frequency] || frequency}</span>
              <span>•</span>
              <span className="truncate">{account_name || "Tanpa Akun"}</span>
              {category_name && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1"><Tags className="h-3 w-3" />{category_name}</span>
                </>
              )}
              <span>•</span>
              <span className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                isCompleted ? "bg-slate-200 text-slate-600" : isPaused ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
              )}>
                {isCompleted ? "Selesai" : isPaused ? "Dijeda" : "Aktif"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="text-left sm:text-right">
            <p className={cn("text-sm font-bold", isPaused || isCompleted ? "text-slate-500" : "text-slate-900")}>
              {formatRupiah(amount)}
            </p>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 sm:justify-end">
              <Clock className="h-3 w-3" />
              <p>
                {isCompleted ? "Selesai pada" : isPaused ? "Dijeda pada" : "Jatuh tempo"}:{" "}
                <span className="font-medium text-slate-700">{formatDate(next_due_date)}</span>
              </p>
            </div>
          </div>

          {!isCompleted && (
            <button
              type="button"
              onClick={openMenu}
              disabled={isPending}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Menu via Portal */}
      {menuOpen && menuCoords && typeof document !== "undefined" &&
        createPortal(
          <>
            <button type="button" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-[90] cursor-default" />
            <div className="fixed z-[100] w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg" style={{ top: menuCoords.top, right: menuCoords.right }}>
              <button
                type="button"
                onClick={handleToggle}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                {isPaused ? <Play className="h-4 w-4 text-emerald-600" /> : <Pause className="h-4 w-4 text-amber-600" />}
                {isPaused ? "Lanjutkan Jadwal" : "Jeda Jadwal"}
              </button>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Hapus Jadwal
              </button>
            </div>
          </>,
          document.body
        )}

      {/* Modal Konfirmasi Hapus */}
      {confirmDelete && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(false); }}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Hapus Jadwal Auto Debit?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Jadwal <strong>{name}</strong> akan dihapus permanen. Tagihan ini tidak akan diproses lagi oleh sistem. <br/><br/>
                <span className="text-emerald-600 font-medium">Tenang, riwayat transaksi lama Anda tidak akan terhapus.</span>
              </p>
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setConfirmDelete(false)} disabled={isPending} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50">Batal</button>
                <button type="button" onClick={handleDelete} disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Ya, Hapus
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}