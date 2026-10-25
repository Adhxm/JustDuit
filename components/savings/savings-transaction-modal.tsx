"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Plus, Minus, Loader2, CheckCircle2, Wallet, CalendarDays, FileText } from "lucide-react";

import { createSavingsTransaction } from "@/app/protected/savings/actions";
import { formatRupiah } from "@/lib/utils";
// import { getLocalDate } from "@/components/ui/calendar-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StylishSelect } from "@/components/ui/stylish-select";
import { CalendarPicker } from "@/components/ui/calendar-picker"; // Import CalendarPicker

export function SavingsTransactionModal({
  goalId,
  accounts,
  defaultType,
  currentBalance,
}: {
  goalId: string;
  accounts: { id: string; name: string; balance: number }[];
  defaultType: "deposit" | "withdraw";
  currentBalance: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"deposit" | "withdraw">(defaultType);
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [note, setNote] = useState("");
  // Gunakan getLocalDate dari calendar-picker atau fungsi manual
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); 

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const amountNumber = Number(amount);

  useEffect(() => {
    if (open) {
      setType(defaultType);
      setAmount("");
      setNote("");
      setError(null);
    }
  }, [open, defaultType]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!amountNumber || amountNumber <= 0) return setError("Nominal tidak valid.");
    if (type === "withdraw" && amountNumber > currentBalance) return setError("Saldo tabungan tidak mencukupi.");

    const formData = new FormData();
    formData.append("goal_id", goalId);
    formData.append("type", type);
    formData.append("amount", amountNumber.toString());
    if (accountId) formData.append("account_id", accountId);
    if (note) formData.append("note", note);
    formData.append("transaction_date", date);

    startTransition(async () => {
      const result = await createSavingsTransaction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  const isDeposit = type === "deposit";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition sm:w-auto ${
          isDeposit ? "bg-emerald-600 text-white hover:bg-emerald-700" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        {isDeposit ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
        {isDeposit ? "Tambah Dana" : "Tarik Dana"}
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className={`px-6 py-4 ${isDeposit ? "bg-emerald-50" : "bg-amber-50"}`}>
              <h3 className={`text-lg font-bold ${isDeposit ? "text-emerald-900" : "text-amber-900"}`}>
                {isDeposit ? "Tambah Dana Tabungan" : "Tarik Dana Tabungan"}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block text-sm font-semibold text-slate-900">Nominal</Label>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15">
                    <span className="text-sm font-semibold text-slate-500">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={amount ? Number(amount).toLocaleString("id-ID") : ""}
                      onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                      placeholder="0"
                      required
                      className="w-full bg-transparent text-xl font-bold text-slate-900 outline-none placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {accounts.length > 0 && (
                  <div>
                    <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Wallet className="h-4 w-4 text-slate-500" /> Pilih Akun (Opsional)
                    </Label>
                    <StylishSelect
                      value={accountId}
                      onChange={setAccountId}
                      placeholder="Tanpa akun (hanya catatan)"
                      searchPlaceholder="Cari akun..."
                      emptyMessage="Tidak ada akun"
                      icon={<Wallet className="h-5 w-5" />}
                      options={accounts.map((a) => ({ value: a.id, label: a.name, description: formatRupiah(Number(a.balance)) }))}
                    />
                  </div>
                )}

                <div>
                  <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <CalendarDays className="h-4 w-4 text-slate-500" /> Tanggal
                  </Label>
                  {/* Menggunakan CalendarPicker */}
                  <CalendarPicker 
                    value={date} 
                    onChange={setDate} 
                    label="Tanggal Transaksi" 
                  />
                </div>

                <div>
                  <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <FileText className="h-4 w-4 text-slate-500" /> Catatan (Opsional)
                  </Label>
                  <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: Nabung bulan ini" maxLength={100} className="h-11 rounded-xl" />
                </div>

                {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setOpen(false)} disabled={isPending} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50">Batal</button>
                <button type="submit" disabled={isPending} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50 ${isDeposit ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"}`}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {isPending ? "Memproses..." : isDeposit ? "Simpan Setoran" : "Konfirmasi Penarikan"}
                </button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}
    </>
  );
}