"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Tags,
  FileText,
  CheckCircle2,
  Loader2,
  CalendarDays,
  Repeat,
  Type,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from "lucide-react";

import { createAutoDebit } from "@/app/protected/auto-debits/actions";
import { formatRupiah } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StylishSelect } from "@/components/ui/stylish-select";

interface AutoDebitFormProps {
  accounts: { id: string; name: string }[];
  categories: { id: string; name: string; type: string }[];
}

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function getLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatLongDate(value: string) {
  return parseLocalDate(value).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(value: string) {
  return parseLocalDate(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Komponen Kalender (Diambil dari transaction-form)
function CalendarPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseLocalDate(value));
  const [pendingDate, setPendingDate] = useState(value);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent | TouchEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  function openCalendar() {
    setPendingDate(value);
    setViewDate(parseLocalDate(value));
    setOpen((current) => !current);
  }

  function changeMonth(amount: number) {
    setViewDate(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + amount, 1)
    );
  }

  function selectToday() {
    const today = new Date();
    setViewDate(today);
    setPendingDate(getLocalDate(today));
  }

  function confirmDate() {
    onChange(pendingDate);
    setOpen(false);
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayString = getLocalDate();

  const calendarDays: Array<{
    day: number;
    date: string;
    currentMonth: boolean;
  }> = [];

  const previousMonthDays = new Date(year, month, 0).getDate();

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = previousMonthDays - i;
    const date = getLocalDate(new Date(year, month - 1, day));
    calendarDays.push({ day, date, currentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      date: getLocalDate(new Date(year, month, day)),
      currentMonth: true,
    });
  }

  let nextDay = 1;
  while (calendarDays.length < 42) {
    calendarDays.push({
      day: nextDay,
      date: getLocalDate(new Date(year, month + 1, nextDay)),
      currentMonth: false,
    });
    nextDay++;
  }

  return (
    <div ref={calendarRef} className="relative">
      <button
        type="button"
        onClick={openCalendar}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`group flex min-h-[76px] w-full items-center gap-3 rounded-2xl border bg-white p-3 text-left transition duration-200 sm:p-4 ${
          open
            ? "border-emerald-500 ring-4 ring-emerald-500/10"
            : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50/70"
        }`}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
          <CalendarDays className="h-6 w-6" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-xs font-medium text-slate-500">
            Tanggal Jatuh Tempo Perdana
          </span>
          <span className="mt-1 block truncate text-base font-bold text-slate-900 sm:text-lg">
            {formatLongDate(value)}
          </span>
          <span className="mt-0.5 block text-xs text-slate-400">
            {value === todayString ? "Hari ini" : formatShortDate(value)}
          </span>
        </span>

        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
            open
              ? "bg-emerald-50 text-emerald-600"
              : "text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600"
          }`}
        >
          {open ? (
            <X className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          onTouchStart={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Pilih tanggal"
            className="max-h-[90dvh] w-full max-w-[360px] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
          >
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-emerald-100">
                    PILIH TANGGAL
                  </p>
                  <p className="mt-1 text-lg font-bold capitalize">
                    {formatLongDate(pendingDate)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Tutup kalender"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/15 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900">
                    {MONTH_NAMES[month]} {year}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Pilih hari yang diinginkan
                  </p>
                </div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label="Bulan sebelumnya"
                    onClick={() => changeMonth(-1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    aria-label="Bulan berikutnya"
                    onClick={() => changeMonth(1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-y-1">
                {DAY_NAMES.map((day) => (
                  <div
                    key={day}
                    className="flex h-8 items-center justify-center text-[11px] font-semibold text-slate-400"
                  >
                    {day}
                  </div>
                ))}

                {calendarDays.map((item, index) => {
                  const selected = item.date === pendingDate;
                  const isToday = item.date === todayString;

                  return (
                    <button
                      key={`${item.date}-${index}`}
                      type="button"
                      onClick={() => {
                        if (!item.currentMonth) {
                          setViewDate(parseLocalDate(item.date));
                        }
                        setPendingDate(item.date);
                      }}
                      aria-label={formatLongDate(item.date)}
                      aria-pressed={selected}
                      className={`relative mx-auto flex h-9 w-9 items-center justify-center rounded-xl text-sm transition ${
                        selected
                          ? "bg-emerald-600 font-bold text-white shadow-md shadow-emerald-600/20"
                          : item.currentMonth
                            ? "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                            : "text-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {item.day}
                      {isToday && !selected && (
                        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={selectToday}
                className="mt-3 w-full rounded-xl border border-emerald-100 bg-emerald-50 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                <CalendarDays className="mr-2 inline h-4 w-4" />
                Pilih hari ini
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 p-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200/70"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={confirmDate}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <Check className="h-4 w-4" />
                Pilih tanggal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AutoDebitForm({ accounts, categories }: AutoDebitFormProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [categoryId, setCategoryId] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [note, setNote] = useState("");
  const [startDate, setStartDate] = useState(getLocalDate()); // Menggunakan format tanggal yang sama

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const amountNumber = Number(amount);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nama jadwal tidak boleh kosong.");
      return;
    }

    if (!accountId) {
      setError("Silakan pilih akun terlebih dahulu.");
      return;
    }

    if (!amount || !Number.isSafeInteger(amountNumber) || amountNumber <= 0) {
      setError("Masukkan nominal yang valid.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("amount", amountNumber.toString());
    formData.append("account_id", accountId);
    if (categoryId) formData.append("category_id", categoryId);
    formData.append("frequency", frequency);
    formData.append("start_date", startDate);
    if (note) formData.append("note", note);

    startTransition(async () => {
      const result = await createAutoDebit(formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.push("/protected/auto-debits");
      router.refresh();
    });
  }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAmount(e.target.value.replace(/\D/g, ""));
  }

  const displayAmount = amount ? Number(amount).toLocaleString("id-ID") : "";

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="space-y-6 p-4 sm:p-6">
        {/* Nama Jadwal */}
        <section>
          <Label
            htmlFor="name"
            className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900"
          >
            <Type className="h-4 w-4 text-slate-500" />
            Nama Jadwal
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Langganan Netflix, Cicilan Motor..."
            maxLength={100}
            required
            className="h-11 w-full min-w-0 rounded-xl"
          />
        </section>

        {/* Nominal Tagihan */}
        <section>
          <Label
            htmlFor="amount"
            className="mb-2 block text-sm font-semibold text-slate-900"
          >
            Nominal Tagihan
          </Label>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15 sm:p-4">
            <div className="mb-1 text-xs text-slate-500">Nominal Rupiah</div>
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-base font-semibold text-slate-500">
                Rp
              </span>
              <input
                id="amount"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={displayAmount}
                onChange={handleAmountChange}
                placeholder="0"
                required
                className="w-full min-w-0 bg-transparent text-2xl font-bold tracking-tight text-slate-900 outline-none placeholder:text-slate-300 sm:text-3xl"
              />
            </div>
            {amountNumber > 0 && (
              <p className="mt-2 break-words text-xs text-slate-500">
                {formatRupiah(amountNumber)}
              </p>
            )}
          </div>
        </section>

        {/* Akun dan Kategori */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Wallet className="h-4 w-4 text-slate-500" />
              Sumber Dana (Akun)
            </Label>

            <StylishSelect
              value={accountId}
              onChange={setAccountId}
              placeholder="Pilih akun"
              searchPlaceholder="Cari nama akun..."
              emptyMessage="Akun tidak ditemukan"
              icon={<Wallet className="h-5 w-5" />}
              options={accounts.map((account) => ({
                value: account.id,
                label: account.name,
              }))}
              disabled={accounts.length === 0}
            />

            {accounts.length === 0 && (
              <p className="mt-2 text-xs text-amber-700">
                Belum ada akun aktif.
              </p>
            )}
          </div>

          <div>
            <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Tags className="h-4 w-4 text-slate-500" />
              Kategori
              <span className="font-normal text-slate-400">(Opsional)</span>
            </Label>

            <StylishSelect
              value={categoryId}
              onChange={setCategoryId}
              placeholder="Tanpa kategori"
              searchPlaceholder="Cari kategori..."
              emptyMessage="Kategori tidak ditemukan"
              icon={<Tags className="h-5 w-5" />}
              options={categories.map((category) => ({
                value: category.id,
                label: category.name,
                description: category.type === "expense" ? "Pengeluaran" : "Pemasukan",
              }))}
            />
          </div>
        </section>

        {/* Frekuensi dan Tanggal Mulai */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Repeat className="h-4 w-4 text-slate-500" />
              Frekuensi
            </Label>

            <StylishSelect
              value={frequency}
              onChange={setFrequency}
              placeholder="Pilih frekuensi"
              searchPlaceholder="Cari..."
              emptyMessage="Tidak ditemukan"
              icon={<Repeat className="h-5 w-5" />}
              options={[
                { value: "daily", label: "Harian" },
                { value: "weekly", label: "Mingguan" },
                { value: "monthly", label: "Bulanan" },
                { value: "yearly", label: "Tahunan" },
              ]}
            />
          </div>

          <div>
            <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              Tanggal Jatuh Tempo Perdana
            </Label>

            <CalendarPicker value={startDate} onChange={setStartDate} />

            <p className="mt-1.5 text-xs text-slate-500">
              Tanggal siklus pemotongan dimulai.
            </p>
          </div>
        </section>

        {/* Catatan */}
        <section>
          <Label
            htmlFor="note"
            className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900"
          >
            <FileText className="h-4 w-4 text-slate-500" />
            Catatan Tambahan
            <span className="font-normal text-slate-400">(Opsional)</span>
          </Label>

          <Input
            id="note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Tagihan wifi rumah"
            maxLength={200}
            className="h-11 w-full min-w-0 rounded-xl"
          />

          <p className="mt-1.5 text-right text-xs text-slate-400">
            {note.length}/200 karakter
          </p>
        </section>

        {/* Error Notification */}
        {error && (
          <div
            role="alert"
            className="break-words rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse gap-3 rounded-b-2xl border-t border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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
          disabled={isPending || accounts.length === 0}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {isPending ? "Menyimpan..." : "Simpan Jadwal"}
        </button>
      </div>
    </form>
  );
}