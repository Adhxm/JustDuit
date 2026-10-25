"use client";

import { useState, useEffect, useRef } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X, Check } from "lucide-react";

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function getLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(value: string) {
  if (!value) return new Date();
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatLongDate(value: string) {
  if (!value) return "";
  return parseLocalDate(value).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export function formatShortDate(value: string) {
  if (!value) return "";
  return parseLocalDate(value).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

interface CalendarPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function CalendarPicker({ value, onChange, label = "Tanggal" }: CalendarPickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseLocalDate(value));
  const [pendingDate, setPendingDate] = useState(value || getLocalDate());
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent | TouchEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
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
    setPendingDate(value || getLocalDate());
    setViewDate(parseLocalDate(value || getLocalDate()));
    setOpen((current) => !current);
  }

  function changeMonth(amount: number) {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
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

  const calendarDays: Array<{ day: number; date: string; currentMonth: boolean }> = [];
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
          <span className="block text-xs font-medium text-slate-500">{label}</span>
          <span className="mt-1 block truncate text-base font-bold text-slate-900 sm:text-lg">
            {value ? formatLongDate(value) : "Pilih tanggal"}
          </span>
          <span className="mt-0.5 block text-xs text-slate-400">
            {value === todayString ? "Hari ini" : value ? formatShortDate(value) : "Belum dipilih"}
          </span>
        </span>

        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
            open ? "bg-emerald-50 text-emerald-600" : "text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600"
          }`}
        >
          {open ? <X className="h-4 w-4" /> : <ChevronRight className="h-5 w-5" />}
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          onTouchStart={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
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
                  <p className="text-xs font-medium text-emerald-100">PILIH TANGGAL</p>
                  <p className="mt-1 text-lg font-bold capitalize">{formatLongDate(pendingDate)}</p>
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
                  <p className="font-bold text-slate-900">{MONTH_NAMES[month]} {year}</p>
                  <p className="mt-0.5 text-xs text-slate-400">Pilih hari yang diinginkan</p>
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
                  <div key={day} className="flex h-8 items-center justify-center text-[11px] font-semibold text-slate-400">
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
                        if (!item.currentMonth) setViewDate(parseLocalDate(item.date));
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