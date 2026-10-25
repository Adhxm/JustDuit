"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveBudget(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sesi berakhir." };

    const id = (formData.get("id") as string) || null;
    const categoryId = formData.get("category_id") as string;
    const year = Number(formData.get("year"));
    const limitAmount = Number(formData.get("limit_amount"));
    
    // Ambil array bulan (dikirim dari form sebagai string JSON)
    const monthsString = formData.get("months") as string;
    let months: number[] = [];
    
    try {
      months = JSON.parse(monthsString || "[]");
    } catch {
      return { error: "Format bulan tidak valid." };
    }

    if (!categoryId) return { error: "Kategori wajib dipilih." };
    if (year < 2000) return { error: "Tahun tidak valid." };
    if (!Number.isFinite(limitAmount) || limitAmount <= 0) return { error: "Limit budget tidak valid." };
    if (months.length === 0) return { error: "Pilih minimal satu bulan." };

    // Cek kepemilikan kategori & tipe harus expense
    const { data: cat } = await supabase
      .from("categories")
      .select("id, type")
      .eq("id", categoryId)
      .eq("user_id", user.id)
      .single();

    if (!cat) return { error: "Kategori tidak ditemukan." };
    if (cat.type !== "expense") return { error: "Hanya kategori pengeluaran yang bisa di-budget." };

    if (id) {
      // Mode Edit: Hanya mengupdate 1 bulan (bulan dari data lama)
      const { error } = await supabase
        .from("budgets")
        .update({ limit_amount: limitAmount })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
    } else {
      // Mode Create: Lakukan perulangan untuk setiap bulan yang dipilih
      const payload = months.map((m) => ({
        user_id: user.id,
        category_id: categoryId,
        month: m,
        year,
        limit_amount: limitAmount,
      }));

      // Upsert: Jika kategori di bulan tersebut sudah ada budgetnya, timpa dengan nominal baru
      const { error } = await supabase
        .from("budgets")
        .upsert(payload, { onConflict: "user_id, category_id, month, year" });
        
      if (error) throw error;
    }

    revalidatePath("/protected/budgets");
    revalidatePath("/protected");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Gagal menyimpan budget." };
  }
}

export async function deleteBudget(formData: FormData) {
  // ... (Sama seperti sebelumnya, tidak ada perubahan)
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sesi berakhir." };

    const id = formData.get("id") as string;
    if (!id) return { error: "ID tidak valid." };

    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath("/protected/budgets");
    revalidatePath("/protected");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Gagal menghapus budget." };
  }
}

export async function createQuickCategory(formData: FormData) {
  // ... (Sama seperti sebelumnya, tidak ada perubahan)
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sesi berakhir." };

    const name = (formData.get("name") as string)?.trim();
    if (!name) return { error: "Nama kategori tidak boleh kosong." };

    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        name,
        type: "expense",
        icon: "tag",
        color: "#ef4444",
        is_default: false,
      })
      .select("id, name, type")
      .single();

    if (error) throw error;
    revalidatePath("/protected/budgets");
    revalidatePath("/protected/budgets/new");
    return { success: true, category: data };
  } catch (err: any) {
    return { error: err?.message ?? "Gagal membuat kategori." };
  }
}