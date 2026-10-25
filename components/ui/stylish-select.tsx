"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

export interface StylishSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface StylishSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: StylishSelectOption[];
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  actionButton?: React.ReactNode; // <-- TAMBAHAN BARU
}

export function StylishSelect({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder = "Cari pilihan...",
  emptyMessage = "Pilihan tidak ditemukan",
  icon,
  disabled = false,
  required = false,
  name,
  actionButton, // <-- TAMBAHAN BARU
}: StylishSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value);

  const filteredOptions = options.filter((option) =>
    `${option.label} ${option.description ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent | TouchEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function chooseOption(option: StylishSelectOption) {
    onChange(option.value);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      {name && (
        <input type="hidden" name={name} value={value} required={required} />
      )}

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => !current);
          setSearch("");
        }}
        className={`group flex min-h-[58px] w-full items-center gap-3 rounded-2xl border bg-white p-3 text-left transition duration-200 ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
            : open
              ? "border-emerald-500 ring-4 ring-emerald-500/10"
              : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50/70"
        }`}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
            selected
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600"
          }`}
        >
          {icon ?? <Search className="h-5 w-5" />}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={`block truncate text-sm font-semibold ${
              selected ? "text-slate-900" : "text-slate-400"
            }`}
          >
            {selected?.label ?? placeholder}
          </span>

          <span className="mt-0.5 block truncate text-xs text-slate-400">
            {selected?.description ?? "Ketuk untuk memilih"}
          </span>
        </span>

        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180 text-emerald-600" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-[60] mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div className="border-b border-slate-100 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Hapus pencarian"
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div role="listbox" className="max-h-60 overflow-y-auto p-2">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <Search className="mx-auto mb-2 h-6 w-6 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">
                  {emptyMessage}
                </p>
              </div>
            ) : (
              filteredOptions.map((option) => {
                const active = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => chooseOption(option)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                      active
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {active ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-bold">
                          {option.label.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="mt-0.5 block truncate text-xs text-slate-400">
                          {option.description}
                        </span>
                      )}
                    </span>

                    {active && (
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* TAMBAHAN BARU: Action Button */}
          {actionButton && (
            <div className="border-t border-slate-100 bg-slate-50/70 p-2">
              {actionButton}
            </div>
          )}

          {!actionButton && (
            <div className="border-t border-slate-100 bg-slate-50/70 px-3 py-2">
              <p className="text-xs text-slate-400">
                {filteredOptions.length} pilihan tersedia
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}