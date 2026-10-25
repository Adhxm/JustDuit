"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { deleteSavingsGoal } from "@/app/protected/savings/actions";

export function DeleteGoalButton({ goalId, goalName }: { goalId: string; goalName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const fd = new FormData();
    fd.append("id", goalId);

    startTransition(async () => {
      const res = await deleteSavingsGoal(fd);
      if (res.error) {
        alert(res.error);
        return;
      }
      router.push("/protected/savings");
      router.refresh();
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50">
        <Trash2 className="h-4 w-4" /> Hapus
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Hapus Target?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Target <strong>{goalName}</strong> beserta seluruh riwayat transaksinya akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} disabled={isPending} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Batal</button>
              <button onClick={handleDelete} disabled={isPending} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}