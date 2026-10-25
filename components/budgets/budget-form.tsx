"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Loader2, CheckCircle2, Target, CalendarDays, Tags, Trash2, Plus, Check } from "lucide-react";

import { saveBudget, deleteBudget, createQuickCategory } from "@/app/protected/budgets/actions";
import { formatRupiah } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StylishSelect } from "@/components/ui/stylish-select";
import { cn } from "@/lib/utils"; // Pastikan cn diimpor

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Ags", "Sep", "Okt", "Nov", "Des"
];

interface BudgetFormProps {
  categories: { id: string; name: string }[];
  initial?: {
    id: string;
    categoryId: string;
    month: number;
    year: number;
    limitAmount: number;
  };
  defaultMonth: number;
  defaultYear: number;
}

export function BudgetForm({ categories: initialCategories, initial, defaultMonth, defaultYear }: BudgetFormProps) {
  const router = useRouter();
  
  const [categories, setCategories] = useState(initialCategories);
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  
  // State untuk tahun
  const [year, setYear] = useState(initial?.year ?? defaultYear);
  
  // State untuk multi-bulan (default: 1 bulan jika mode create)
  const [selectedMonths, setSelectedMonths] = useState<number[]>(
    initial ? [initial.month] : [defaultMonth]
  );
  
  const [limitAmount, setLimitAmount] = useState(initial?.limitAmount ? String(initial.limitAmount) : "");

  useEffect(() => {
    if (initial) {
      setCategoryId(initial.categoryId);
      setYear(initial.year);
      setSelectedMonths([initial.month]);
      setLimitAmount(String(initial.limitAmount));
    } else {
      setCategoryId("");
      setYear(defaultYear);
      setSelectedMonths([defaultMonth]);
      setLimitAmount("");
    }
  }, [initial, defaultMonth, defaultYear]);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  // State Quick Add
  const [showQuickCategory, setShowQuickCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [isCatPending, startCatTransition] = useTransition();

  const amountNumber = Number(limitAmount);

  // Toggle Pilih Bulan
  function toggleMonth(m: number) {
    if (initial) return; // Jangan izinkan ubah bulan saat mode edit
    setSelectedMonths((prev) => 
      prev.includes(m) 
        ? prev.filter((item) => item !== m) 
        : [...prev, m]
    );
  }

  // Pilih / Batal Pilih Semua
  function toggleAllMonths() {
    if (initial) return;
    if (selectedMonths.length === 12) setSelectedMonths([]);
    else setSelectedMonths([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!categoryId) return setError("Pilih kategori terlebih dahulu.");
    if (!amountNumber || amountNumber <= 0) return setError("Limit budget tidak valid.");
    if (selectedMonths.length === 0) return setError("Pilih minimal satu bulan.");

    const formData = new FormData();
    if (initial?.id) formData.append("id", initial.id);
    formData.append("category_id", categoryId);
    formData.append("year", year.toString());
    formData.append("limit_amount", amountNumber.toString());
    
    // Kirim array bulan sebagai string JSON
    formData.append("months", JSON.stringify(selectedMonths));

    startTransition(async () => {
      const result = await saveBudget(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      // Redirect ke bulan terkecil yang dipilih agar user melihat hasilnya
      const firstMonth = Math.min(...selectedMonths);
      router.push(`/protected/budgets?month=${firstMonth}&year=${year}`);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!initial?.id) return;
    if (!confirm("Hapus budget untuk kategori ini?")) return;

    const fd = new FormData();
    fd.append("id", initial.id);

    startDeleteTransition(async () => {
      const res = await deleteBudget(fd);
      if (res.error) {
        alert(res.error);
        return;
      }
      router.push(`/protected/budgets?month=${initial.month}&year=${initial.year}`);
      router.refresh();
    });
  }

  function handleQuickCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const formData = new FormData();
    formData.append("name", newCatName);

    startCatTransition(async () => {
      const res = await createQuickCategory(formData);
      if (res.error) {
        alert(res.error);
        return;
      }
      if (res.success && res.category) {
        setCategories((prev) => [...prev, res.category as { id: string; name: string }]);
        setCategoryId(res.category.id);
        setShowQuickCategory(false);
        setNewCatName("");
      }
    });
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-6 p-4 sm:p-6">
          
          {/* Kategori */}
          {!initial && (
            <section>
              <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Tags className="h-4 w-4 text-slate-500" /> Kategori Pengeluaran
              </Label>
              <StylishSelect
                value={categoryId}
                onChange={setCategoryId}
                placeholder="Pilih kategori"
                searchPlaceholder="Cari kategori..."
                emptyMessage="Kategori tidak ditemukan"
                icon={<Tags className="h-5 w-5" />}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                actionButton={
                  <button
                    type="button"
                    onClick={() => setShowQuickCategory(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <Plus className="h-4 w-4" /> Buat Kategori Baru
                  </button>
                }
              />
            </section>
          )}

          {initial && (
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Kategori</p>
              <p className="text-sm font-semibold text-slate-900">
                {categories.find((c) => c.id === categoryId)?.name ?? "Kategori tidak ditemukan"}
              </p>
            </section>
          )}

          {/* Tahun */}
          <section>
            <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <CalendarDays className="h-4 w-4 text-slate-500" /> Tahun Anggaran
            </Label>
            <Input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={2000}
              max={2100}
              required
              disabled={Boolean(initial)}
              className="h-11 rounded-xl"
            />
          </section>

          {/* Pilih Bulan (Multi-Select) */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CalendarDays className="h-4 w-4 text-slate-500" /> Terapkan Untuk Bulan
              </Label>
              {!initial && (
                <button
                  type="button"
                  onClick={toggleAllMonths}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  {selectedMonths.length === 12 ? "Batal Pilih Semua" : "Pilih Semua Tahun"}
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {MONTH_NAMES.map((name, index) => {
                const m = index + 1;
                const isSelected = selectedMonths.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMonth(m)}
                    disabled={Boolean(initial)}
                    className={cn(
                      "flex h-10 items-center justify-center rounded-xl border text-sm font-medium transition-all",
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-500/20"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                      initial && "cursor-not-allowed opacity-60"
                    )}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
            {!initial && (
              <p className="mt-2 text-xs text-slate-500">
                Budget akan dibuat untuk {selectedMonths.length} bulan terpilih.
              </p>
            )}
          </section>

          {/* Limit */}
          <section>
            <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Target className="h-4 w-4 text-slate-500" /> Limit Budget Per Bulan
            </Label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15">
              <div className="mb-1 text-xs text-slate-500">Nominal Rupiah</div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-slate-500">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={limitAmount ? Number(limitAmount).toLocaleString("id-ID") : ""}
                  onChange={(e) => setLimitAmount(e.target.value.replace(/\D/g, ""))}
                  placeholder="0"
                  required
                  className="w-full bg-transparent text-2xl font-bold text-slate-900 outline-none placeholder:text-slate-300 sm:text-3xl"
                />
              </div>
              {amountNumber > 0 && <p className="mt-2 text-xs text-slate-500">{formatRupiah(amountNumber)}</p>}
            </div>
          </section>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        </div>

        <div className="flex flex-col-reverse gap-3 rounded-b-2xl border-t border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            {initial && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isPending}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 sm:w-auto"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Hapus Budget
              </button>
            )}
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isPending || isDeleting}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending || isDeleting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {isPending ? "Menyimpan..." : initial ? "Simpan Perubahan" : `Simpan ${selectedMonths.length} Budget`}
            </button>
          </div>
        </div>
      </form>

      {/* MODAL QUICK CATEGORY */}
      {showQuickCategory && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowQuickCategory(false); }}>
            <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl animate-in zoom-in-95 duration-200">
              <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
                <h3 className="text-lg font-bold text-slate-900">Buat Kategori Pengeluaran</h3>
              </div>
              <form onSubmit={handleQuickCategory} className="p-5">
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block text-sm font-semibold text-slate-900">Nama Kategori</Label>
                    <Input
                      autoFocus
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Contoh: Kopi, Langganan, dll..."
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowQuickCategory(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Batal</button>
                  <button type="submit" disabled={isCatPending} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                    {isCatPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}