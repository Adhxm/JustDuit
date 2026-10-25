
"use client";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  X,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_FILTERS = [
  { value: "all", label: "Semua" },
  { value: "income", label: "Pemasukan" },
  { value: "expense", label: "Pengeluaran" },
  { value: "transfer", label: "Transfer" },
] as const;

const MONTHS = [
  "Januari", "Februari", "Maret", "April",
  "Mei", "Juni", "Juli", "Agustus",
  "September", "Oktober", "November", "Desember",
];

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(value: string) {
  if (!value) return "";
  return parseDate(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function shiftMonth(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function CalendarMonth({
  month,
  start,
  end,
  onSelect,
}: {
  month: Date;
  start: string;
  end: string;
  onSelect: (value: string) => void;
}) {
  const firstDay = monthStart(month);
  const offset = firstDay.getDay();
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).getDate();

  const cells = Array.from(
    { length: Math.ceil((offset + daysInMonth) / 7) * 7 },
    (_, index) => {
      const day = index - offset + 1;
      return day > 0 && day <= daysInMonth ? day : null;
    }
  );

  const today = dateKey(new Date());

  return (
    <div className="min-w-0">
      <div className="mb-3 text-center text-sm font-semibold text-slate-800">
        {MONTHS[month.getMonth()]} {month.getFullYear()}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-[11px] font-medium text-slate-400"
          >
            {day}
          </div>
        ))}

        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />;
          }

          const value = dateKey(
            new Date(month.getFullYear(), month.getMonth(), day)
          );

          const isStart = value === start;
          const isEnd = value === end;
          const isSelected = isStart || isEnd;
          const inRange = Boolean(
            start && end && value > start && value < end
          );

          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              aria-label={`${day} ${MONTHS[month.getMonth()]} ${month.getFullYear()}`}
              aria-pressed={isSelected}
              className={cn(
                "relative mx-auto flex h-9 w-full max-w-10 items-center justify-center rounded-lg text-sm transition-colors",
                inRange && "rounded-none bg-emerald-50 text-emerald-800",
                isSelected &&
                  "z-10 rounded-lg bg-emerald-600 font-semibold text-white shadow-sm",
                !isSelected &&
                  !inRange &&
                  "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700",
                value === today &&
                  !isSelected &&
                  "font-bold ring-1 ring-inset ring-emerald-400"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TransactionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") || "all";
  const currentSearch = searchParams.get("q") || "";
  const currentMonth = searchParams.get("month") || "";
  const currentStart = searchParams.get("startDate") || "";
  const currentEnd = searchParams.get("endDate") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [showCalendar, setShowCalendar] = useState(false);
  const [draftStart, setDraftStart] = useState(currentStart);
  const [draftEnd, setDraftEnd] = useState(currentEnd);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(() =>
    monthStart(
      currentStart ? parseDate(currentStart) :
      currentEnd ? parseDate(currentEnd) : new Date()
    )
  );

  useEffect(() => setSearchInput(currentSearch), [currentSearch]);

  useEffect(() => {
    setDraftStart(currentStart);
    setDraftEnd(currentEnd);
  }, [currentStart, currentEnd]);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });

      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [router, pathname, searchParams]
  );

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    updateParams({ q: searchInput.trim() });
  }

  function selectDate(value: string) {
    // Mulai rentang baru jika belum ada tanggal awal
    // atau rentang sebelumnya sudah lengkap.
    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(value);
      setDraftEnd("");
      setSelectingEnd(true);
      return;
    }

    // Tanggal kedua boleh sebelum atau sesudah tanggal pertama.
    if (value < draftStart) {
      setDraftEnd(draftStart);
      setDraftStart(value);
    } else {
      setDraftEnd(value);
    }

    setSelectingEnd(false);
  }

  function applyRange(from: string, to: string) {
    if (from && to && from > to) {
      [from, to] = [to, from];
    }

    setDraftStart(from);
    setDraftEnd(to);
    updateParams({
      month: "",
      startDate: from,
      endDate: to,
    });
    setShowCalendar(false);
  }

  function selectPreset(preset: string) {
    const today = new Date();
    let from = "";
    let to = dateKey(today);

    if (preset === "this-month") {
      from = dateKey(new Date(today.getFullYear(), today.getMonth(), 1));
    } else if (preset === "last-month") {
      from = dateKey(new Date(today.getFullYear(), today.getMonth() - 1, 1));
      to = dateKey(new Date(today.getFullYear(), today.getMonth(), 0));
    } else if (preset === "7-days") {
      const date = new Date(today);
      date.setDate(date.getDate() - 6);
      from = dateKey(date);
    } else if (preset === "30-days") {
      const date = new Date(today);
      date.setDate(date.getDate() - 29);
      from = dateKey(date);
    }

    applyRange(from, to);
  }

  function clearFilters() {
    setSearchInput("");
    setDraftStart("");
    setDraftEnd("");
    setSelectingEnd(false);
    setShowCalendar(false);
    router.push(pathname);
  }

  const hasDateFilter = Boolean(currentStart || currentEnd || currentMonth);
  const hasFilters = Boolean(
    currentType !== "all" || currentSearch || hasDateFilter
  );

  const dateLabel = currentStart && currentEnd
    ? `${formatDate(currentStart)} – ${formatDate(currentEnd)}`
    : currentStart
      ? `Mulai ${formatDate(currentStart)}`
      : currentEnd
        ? `Sampai ${formatDate(currentEnd)}`
        : currentMonth
          ? new Date(`${currentMonth}-01T00:00:00`).toLocaleDateString(
              "id-ID",
              { month: "long", year: "numeric" }
            )
          : "Semua tanggal";

  return (
    <div className="space-y-4">
      {/* Label filter dipertahankan */}
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => updateParams({ type: filter.value })}
            aria-pressed={currentType === filter.value}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              currentType === filter.value
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Search dan periode */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            type="search"
            placeholder="Cari transaksi, catatan..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-11 rounded-xl border-slate-200 bg-white pl-10 pr-10 shadow-sm placeholder:text-slate-400 focus-visible:ring-emerald-500"
            aria-label="Cari transaksi"
          />

          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateParams({ q: "" });
              }}
              aria-label="Hapus pencarian"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        <button
          type="button"
          onClick={() => setShowCalendar((open) => !open)}
          aria-expanded={showCalendar}
          className={cn(
            "flex h-11 w-full items-center gap-3 rounded-xl border bg-white px-3.5 text-left shadow-sm sm:w-auto sm:min-w-[245px]",
            showCalendar
              ? "border-emerald-500 ring-2 ring-emerald-500/10"
              : "border-slate-200 hover:border-slate-300"
          )}
        >
          <CalendarDays className="h-5 w-5 shrink-0 text-emerald-600" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-slate-500">
              Periode transaksi
            </span>
            <span className="block truncate text-sm font-medium text-slate-800">
              {dateLabel}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-slate-400 transition-transform",
              showCalendar && "rotate-180"
            )}
          />
        </button>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        )}
      </div>

      {/* Kalender rentang tanggal */}
      {showCalendar && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Pilih rentang tanggal
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {selectingEnd
                  ? "Sekarang klik tanggal akhir."
                  : "Klik tanggal awal, lalu klik tanggal akhir."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCalendar(false)}
              aria-label="Tutup kalender"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Bulan ini", value: "this-month" },
              { label: "Bulan lalu", value: "last-month" },
              { label: "7 hari terakhir", value: "7-days" },
              { label: "30 hari terakhir", value: "30-days" },
            ].map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => selectPreset(preset.value)}
                className="rounded-lg border border-slate-200 px-2 py-2.5 text-xs font-medium text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 sm:text-sm"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="mb-4 flex items-center justify-between rounded-lg bg-slate-50 p-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500">Tanggal awal</p>
              <p className="truncate text-sm font-semibold text-slate-800">
                {draftStart ? formatDate(draftStart) : "Belum dipilih"}
              </p>
            </div>
            <div className="px-3 text-slate-300">→</div>
            <div className="min-w-0 flex-1 text-right">
              <p className="text-xs text-slate-500">Tanggal akhir</p>
              <p className="truncate text-sm font-semibold text-slate-800">
                {draftEnd ? formatDate(draftEnd) : "Belum dipilih"}
              </p>
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setDisplayMonth((m) => shiftMonth(m, -1))}
              aria-label="Bulan sebelumnya"
              className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-slate-500">
              Geser bulan untuk memilih tanggal
            </span>
            <button
              type="button"
              onClick={() => setDisplayMonth((m) => shiftMonth(m, 1))}
              aria-label="Bulan berikutnya"
              className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mx-auto grid max-w-md grid-cols-1 gap-5 sm:grid-cols-2 sm:max-w-none sm:gap-8">
            <CalendarMonth
              month={displayMonth}
              start={draftStart}
              end={draftEnd}
              onSelect={selectDate}
            />
            <div className="hidden sm:block">
              <CalendarMonth
                month={shiftMonth(displayMonth, 1)}
                start={draftStart}
                end={draftEnd}
                onSelect={selectDate}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setDraftStart("");
                setDraftEnd("");
                setSelectingEnd(false);
              }}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Hapus pilihan
            </button>
            <button
              type="button"
              onClick={() => applyRange(draftStart, draftEnd)}
              disabled={!draftStart || !draftEnd}
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Terapkan periode
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
