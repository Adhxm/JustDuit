"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function AutoDebitFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? "all";
  const currentQuery = searchParams.get("q") ?? "";

  const [searchTerm, setSearchTerm] = useState(currentQuery);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  // Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== currentQuery) {
        router.push(pathname + "?" + createQueryString("q", searchTerm));
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentQuery, pathname, router, createQueryString]);

  return (
    <div className="space-y-4">
      {/* Tab Filter Status (Gaya Button) */}
      <div className="flex flex-wrap gap-2">
        {["all", "active", "paused"].map((status) => (
          <button
            key={status}
            onClick={() =>
              router.push(pathname + "?" + createQueryString("status", status))
            }
            aria-pressed={currentStatus === status}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              currentStatus === status
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            {status === "all"
              ? "Semua"
              : status === "active"
              ? "Aktif"
              : "Dijeda"}
          </button>
        ))}
      </div>

      {/* Input Pencarian */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari jadwal auto debit..."
            className="block w-full h-11 rounded-xl border border-slate-200 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white shadow-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                router.push(pathname + "?" + createQueryString("q", ""));
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}