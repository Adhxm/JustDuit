import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Search, ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { CategoryFilters } from "@/components/categories/category-filters";
import { CategoryItem } from "@/components/categories/category-item";

type SearchParams = Promise<{
  type?: string;
  q?: string;
}>;

type CategoryRow = {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string | null;
  icon: string | null;
  is_default: boolean;
  parent_id: string | null;
};

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const selectedType = ["all", "income", "expense"].includes(params.type ?? "")
    ? params.type!
    : "all";
  const searchQuery = params.q?.trim() ?? "";

  let query = supabase
    .from("categories")
    .select("id, name, type, color, icon, is_default, parent_id")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (selectedType === "income" || selectedType === "expense") {
    query = query.eq("type", selectedType);
  }

  if (searchQuery) {
    query = query.ilike("name", `%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Gagal mengambil kategori:", error.message);
  }

  let allCategories = (data ?? []) as CategoryRow[];

  // === FIX PENCARIAN SUB-KATEGORI ===
  // Jika sedang mencari, pastikan induk dari sub-kategori yang ditemukan ikut diambil
  if (searchQuery && allCategories.length > 0) {
    const parentIds = new Set(
      allCategories.filter((c) => c.parent_id).map((c) => c.parent_id)
    );
    
    // Cek apakah ID induk sudah ada di dalam hasil pencarian
    const missingParentIds = Array.from(parentIds).filter(
      (pid) => pid && !allCategories.some((c) => c.id === pid)
    );

    if (missingParentIds.length > 0) {
      // Ambil data induk yang hilang
      const { data: parents } = await supabase
        .from("categories")
        .select("id, name, type, color, icon, is_default, parent_id")
        .in("id", missingParentIds as string[])
        .eq("user_id", user.id);

      if (parents) {
        // Gabungkan induk ke dalam hasil
        allCategories = [...allCategories, ...(parents as CategoryRow[])];
      }
    }
  }
  // =================================

  // Pisahkan induk dan sub-kategori
  const rootCategories = allCategories.filter((c) => !c.parent_id);
  const subCategories = allCategories.filter((c) => c.parent_id);

  const hasFilters = selectedType !== "all" || Boolean(searchQuery);

  // Render fungsi untuk menyusun children
  const renderCategory = (parent: CategoryRow) => {
    const children = subCategories.filter((c) => c.parent_id === parent.id);
    return (
      <CategoryItem
        key={parent.id}
        id={parent.id}
        name={parent.name}
        type={parent.type}
        color={parent.color}
        icon={parent.icon}
        is_default={parent.is_default}
        subcategories={children.map((c) => ({
          id: c.id, name: c.name, type: c.type, color: c.color, icon: c.icon, is_default: c.is_default
        }))}
      />
    );
  };

  const incomeCategories = rootCategories.filter((c) => c.type === "income");
  const expenseCategories = rootCategories.filter((c) => c.type === "expense");

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm text-slate-500">Keuangan / Kategori</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kategori</h1>
          <p className="mt-1 text-sm text-slate-600">
            Kelola kategori untuk merapikan pemasukan dan pengeluaran.
          </p>
        </div>
        <Link
          href="/protected/categories/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Tambah Kategori
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <CategoryFilters />
      </div>

      {/* Content */}
      {error ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="font-medium text-red-700">Gagal memuat kategori.</p>
          <p className="mt-1 text-sm text-slate-500">
            Silakan muat ulang halaman atau periksa koneksi database.
          </p>
        </div>
      ) : rootCategories.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Search className="h-6 w-6 text-slate-500" />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900">
            {hasFilters ? "Kategori tidak ditemukan" : "Belum ada kategori"}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {hasFilters
              ? "Coba ubah filter atau kata kunci pencarian."
              : "Tambahkan kategori pertama Anda agar transaksi lebih rapi."}
          </p>
          {hasFilters ? (
            <Link
              href="/protected/categories"
              className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Hapus semua filter
            </Link>
          ) : (
            <Link
              href="/protected/categories/new"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" /> Tambah Kategori
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* Kolom Pengeluaran */}
          {(selectedType === "all" || selectedType === "expense") && (
            <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 bg-red-50/50 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-semibold text-red-700">Pengeluaran</h2>
                </div>
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                  {expenseCategories.length}
                </span>
              </div>
              <div className="flex-1 divide-y divide-slate-100 px-4 md:px-5">
                {expenseCategories.length > 0 ? (
                  expenseCategories.map(renderCategory)
                ) : (
                  <div className="py-8 text-center text-sm text-slate-500">
                    Belum ada kategori pengeluaran.
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Kolom Pemasukan */}
          {(selectedType === "all" || selectedType === "income") && (
            <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-50/50 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <ArrowDownLeft className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-semibold text-emerald-700">Pemasukan</h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  {incomeCategories.length}
                </span>
              </div>
              <div className="flex-1 divide-y divide-slate-100 px-4 md:px-5">
                {incomeCategories.length > 0 ? (
                  incomeCategories.map(renderCategory)
                ) : (
                  <div className="py-8 text-center text-sm text-slate-500">
                    Belum ada kategori pemasukan.
                  </div>
                )}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}