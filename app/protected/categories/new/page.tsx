import Link from "next/link";
import { ArrowLeft, Tags } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "@/components/categories/category-form";

interface PageProps {
  searchParams: Promise<{ edit?: string }>;
}
export const instant = false;
export default async function NewCategoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const editId = params.edit;

  // 1. Fetch data untuk diedit (jika mode edit)
  let initial;
  if (editId) {
    const { data } = await supabase
      .from("categories")
      .select("id, name, type, color, icon, parent_id")
      .eq("id", editId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!data) redirect("/protected/categories");

    initial = {
      id: data.id,
      name: data.name,
      type: data.type as "income" | "expense",
      color: data.color,
      icon: data.icon,
      parent_id: data.parent_id,
    };
  }

  // 2. Fetch opsi parent (semua kategori user untuk dropdown)
  const { data: parentData } = await supabase
    .from("categories")
    .select("id, name, type")
    .eq("user_id", user.id)
    .order("name");

  const parentOptions = (parentData ?? []) as { id: string; name: string; type: string }[];
  const isEdit = Boolean(initial);

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-6 pb-8">
      <Link
        href="/protected/categories"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Kategori
      </Link>

      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Tags className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {isEdit ? "Edit Kategori" : "Tambah Kategori"}
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {isEdit
              ? "Perbarui nama, warna, atau induk kategori."
              : "Buat kategori baru agar laporan keuangan lebih rapi."}
          </p>
        </div>
      </div>

      <CategoryForm
        mode={isEdit ? "edit" : "create"}
        initial={initial}
        parentOptions={parentOptions}
      />
    </div>
  );
}