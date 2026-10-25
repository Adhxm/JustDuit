"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_FREQ = ["daily", "weekly", "monthly", "yearly"] as const;
type Freq = (typeof ALLOWED_FREQ)[number];

export async function createAutoDebit(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi Anda sudah berakhir. Silakan login ulang." };

    const name = (formData.get("name") as string | null)?.trim() ?? "";
    const amount = Number(formData.get("amount"));
    const account_id = (formData.get("account_id") as string | null) ?? "";
    const category_id = (formData.get("category_id") as string | null) || null;
    const frequencyRaw = (formData.get("frequency") as string | null) ?? "";
    const start_date = (formData.get("start_date") as string | null) ?? "";
    const note = (formData.get("note") as string | null)?.trim() || null;

    // Validasi
    if (!name || name.length > 100) return { error: "Nama jadwal tidak valid (maks 100 karakter)." };
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
      return { error: "Nominal harus berupa angka bulat lebih dari 0." };
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start_date)) return { error: "Format tanggal mulai tidak valid." };
    if (!ALLOWED_FREQ.includes(frequencyRaw as Freq)) return { error: "Frekuensi tidak valid." };
    const frequency = frequencyRaw as Freq;

    // Cek kepemilikan akun
    const { data: acc } = await supabase
      .from("accounts")
      .select("id")
      .eq("id", account_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!acc) return { error: "Akun tidak ditemukan." };

    // Cek kepemilikan kategori (jika diisi)
    if (category_id) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("id", category_id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cat) return { error: "Kategori tidak ditemukan." };
    }

    // Insert
    const { error } = await supabase.from("auto_debits").insert({
      user_id: user.id,
      name,
      amount,
      account_id,
      category_id,
      frequency,
      start_date,
      next_due_date: start_date,
      status: "active",
      note,
    });

    if (error) {
      console.error("Error inserting auto debit:", error);
      return { error: "Gagal menyimpan jadwal auto debit." };
    }

    revalidatePath("/protected/auto-debits");
    revalidatePath("/protected");
    revalidatePath("/protected/transactions");

    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Terjadi kesalahan." };
  }
}
export async function toggleAutoDebitStatus(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sesi berakhir." };

    const id = formData.get("id") as string;
    const newStatus = formData.get("new_status") as "active" | "paused";

    if (!id || !["active", "paused"].includes(newStatus)) {
      return { error: "Data tidak valid." };
    }

    const { error } = await supabase
      .from("auto_debits")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath("/protected/auto-debits");
    revalidatePath("/protected");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Gagal mengubah status." };
  }
}

export async function deleteAutoDebit(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sesi berakhir." };

    const id = formData.get("id") as string;
    if (!id) return { error: "ID tidak valid." };

    const { error } = await supabase
      .from("auto_debits")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath("/protected/auto-debits");
    revalidatePath("/protected");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Gagal menghapus jadwal." };
  }
}