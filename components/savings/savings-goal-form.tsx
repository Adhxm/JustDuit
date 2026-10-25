"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Type, Target, CalendarDays, Palette, FileText } from "lucide-react";

import { createSavingsGoal } from "@/app/protected/savings/actions";
import { formatRupiah } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarPicker } from "@/components/ui/calendar-picker"; // Import CalendarPicker

const PRESET_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#f59e0b", "#06b6d4", "#ec4899"];

export function SavingsGoalForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [note, setNote] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const amountNumber = Number(targetAmount);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Nama target wajib diisi.");
    if (!amountNumber || amountNumber <= 0) return setError("Target nominal tidak valid.");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("target_amount", amountNumber.toString());
    if (deadline) formData.append("deadline", deadline);
    formData.append("color", color);
    formData.append("icon", "target");
    if (note) formData.append("note", note);

    startTransition(async () => {
      const result = await createSavingsGoal(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/protected/savings");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="space-y-6 p-4 sm:p-6">
        <section>
          <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Type className="h-4 w-4 text-slate-500" /> Nama Target
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Beli Laptop Baru, Dana Darurat..."
            maxLength={50}
            required
            className="h-11 rounded-xl"
          />
        </section>

        <section>
          <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Target className="h-4 w-4 text-slate-500" /> Target Nominal
          </Label>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15">
            <div className="mb-1 text-xs text-slate-500">Nominal Rupiah</div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-slate-500">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={targetAmount ? Number(targetAmount).toLocaleString("id-ID") : ""}
                onChange={(e) => setTargetAmount(e.target.value.replace(/\D/g, ""))}
                placeholder="0"
                required
                className="w-full bg-transparent text-2xl font-bold text-slate-900 outline-none placeholder:text-slate-300 sm:text-3xl"
              />
            </div>
            {amountNumber > 0 && <p className="mt-2 text-xs text-slate-500">{formatRupiah(amountNumber)}</p>}
          </div>
        </section>

        <section>
          <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CalendarDays className="h-4 w-4 text-slate-500" /> Tenggat Waktu (Opsional)
          </Label>
          {/* Menggunakan CalendarPicker */}
          <CalendarPicker 
            value={deadline} 
            onChange={setDeadline} 
            label="Tenggat Waktu Target" 
          />
        </section>

        <section>
          <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Palette className="h-4 w-4 text-slate-500" /> Warna Target
          </Label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-9 w-9 rounded-xl border-2 transition ${color === c ? "border-slate-900 ring-2 ring-slate-900/20" : "border-transparent hover:scale-105"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </section>

        <section>
          <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FileText className="h-4 w-4 text-slate-500" /> Catatan (Opsional)
          </Label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Alasan menabung..."
            maxLength={200}
            className="h-11 rounded-xl"
          />
        </section>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      </div>

      <div className="flex flex-col-reverse gap-3 rounded-b-2xl border-t border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:justify-end sm:px-6">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {isPending ? "Menyimpan..." : "Simpan Target"}
        </button>
      </div>
    </form>
  );
}