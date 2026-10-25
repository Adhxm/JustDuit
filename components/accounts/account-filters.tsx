"use client";

import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
] as const;

export function AccountFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "all";
  const currentSearch = searchParams.get("q") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => setSearchInput(currentSearch), [currentSearch]);

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

  function clearFilters() {
    setSearchInput("");
    router.push(pathname);
  }

  const hasFilters = currentStatus !== "all" || Boolean(currentSearch);

  return (
    <div className="space-y-4">
      {/* Tab status */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => updateParams({ status: filter.value })}
            aria-pressed={currentStatus === filter.value}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              currentStatus === filter.value
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Search + reset */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            type="search"
            placeholder="Cari nama akun..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-11 rounded-xl border-slate-200 bg-white pl-10 pr-10 shadow-sm placeholder:text-slate-400 focus-visible:ring-emerald-500"
            aria-label="Cari akun"
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
    </div>
  );
}