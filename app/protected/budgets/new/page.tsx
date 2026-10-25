import Link from "next/link";
import { ArrowLeft, Target } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BudgetForm } from "@/components/budgets/budget-form";

export const instant = false;

interface PageProps {
  searchParams: Promise<{ id?: string; month?: string; year?: string }>;
}

export default async function NewBudgetPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const editId = params.id;
  const now = new Date();
  const initialMonth = Number(params.month) || (now.getMonth() + 1);
  const initialYear = Number(params.year) || now.getFullYear();

  // Fetch data untuk edit (jika ada)
  let initial;
  if (editId) {
    const { data } = await supabase
      .from("budgets")
      .select("id, category_id, month, year, limit_amount")
      .eq("id", editId)
      .eq("user_id", user.id)
      .single();
    
    if (data) {
      initial = {
        id: data.id,
        categoryId: data.category_id,
        month: data.month,
        year: data.year,
        limitAmount: Number(data.limit_amount),
      };
    }
  }

  // Fetch kategori expense
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, type")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .order("name");

  // KEY UNIK: Memaksa React untuk merender ulang form jika ID/Bulan/Tahun berubah
  const formKey = editId ? `edit-${editId}` : `new-${initialMonth}-${initialYear}`;

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-6 pb-8">
      <Link href={`/protected/budgets?month=${initialMonth}&year=${initialYear}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-700">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Budget
      </Link>

      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Target className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {initial ? "Edit Budget" : "Atur Budget"}
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Tentukan batas pengeluaran untuk kategori tertentu di bulan yang dipilih.
          </p>
        </div>
      </div>

      {/* TAMBAHKAN KEY DI SINI */}
      <BudgetForm
        key={formKey}
        categories={categories ?? []}
        initial={initial}
        defaultMonth={initialMonth}
        defaultYear={initialYear}
      />
    </div>
  );
}