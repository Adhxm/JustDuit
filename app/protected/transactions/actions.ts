
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

interface TransactionInput {
  type: "income" | "expense" | "transfer";
  amount: number;
  account_id: string;
  to_account_id?: string | null;
  category_id?: string | null;
  note?: string | null;
  transaction_date: string;
}

export async function createTransaction(input: TransactionInput) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Sesi login tidak valid. Silakan login kembali." };
  }

  // Validasi input dasar
  if (!["income", "expense", "transfer"].includes(input.type)) {
    return { error: "Tipe transaksi tidak valid." };
  }

  if (
    !Number.isSafeInteger(input.amount) ||
    input.amount <= 0
  ) {
    return { error: "Jumlah harus berupa angka positif yang valid." };
  }

  if (!input.account_id) {
    return { error: "Pilih akun sumber." };
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(input.transaction_date) ||
    !Number.isFinite(Date.parse(`${input.transaction_date}T00:00:00Z`)) ||
    new Date(`${input.transaction_date}T00:00:00Z`)
      .toISOString()
      .slice(0, 10) !== input.transaction_date
  ) {
    return { error: "Tanggal transaksi tidak valid." };
  }

  // Pastikan akun sumber milik pengguna dan aktif
  const { data: sourceAccount, error: sourceError } = await supabase
    .from("accounts")
    .select("id")
    .eq("id", input.account_id)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (sourceError) {
    console.error("Source account validation:", sourceError);
    return { error: "Gagal memeriksa akun sumber." };
  }

  if (!sourceAccount) {
    return { error: "Akun sumber tidak ditemukan atau tidak aktif." };
  }

  // Validasi akun tujuan untuk transfer
  if (input.type === "transfer") {
    if (!input.to_account_id) {
      return { error: "Pilih akun tujuan." };
    }

    if (input.to_account_id === input.account_id) {
      return { error: "Akun tujuan harus berbeda dari akun sumber." };
    }

    const { data: destinationAccount, error: destinationError } =
      await supabase
        .from("accounts")
        .select("id")
        .eq("id", input.to_account_id)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

    if (destinationError) {
      console.error("Destination account validation:", destinationError);
      return { error: "Gagal memeriksa akun tujuan." };
    }

    if (!destinationAccount) {
      return { error: "Akun tujuan tidak ditemukan atau tidak aktif." };
    }
  }

  // Validasi kategori sesuai tipe transaksi
  let categoryId: string | null = null;

  if (input.type !== "transfer" && input.category_id) {
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id, type")
      .eq("id", input.category_id)
      .maybeSingle();

    if (categoryError) {
      console.error("Category validation:", categoryError);
      return { error: "Gagal memeriksa kategori." };
    }

    if (!category || category.type !== input.type) {
      return { error: "Kategori tidak valid untuk tipe transaksi ini." };
    }

    categoryId = category.id;
  }

  // Simpan transaksi.
  // Pembaruan saldo tetap ditangani oleh trigger/database yang sudah ada.
  const { error: insertError } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      type: input.type,
      amount: input.amount,
      account_id: input.account_id,
      to_account_id:
        input.type === "transfer" ? input.to_account_id : null,
      category_id: categoryId,
      note: input.note?.trim() || null,
      transaction_date: input.transaction_date,
    });

  if (insertError) {
    console.error("Insert transaction:", insertError);
    return { error: "Transaksi gagal disimpan. Silakan coba lagi." };
  }

  revalidatePath("/protected");
  revalidatePath("/protected/transactions");
  revalidatePath("/protected/accounts");
  revalidatePath("/protected/reports");

  return { success: true };
}
export async function createQuickCategory(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sesi berakhir." };

    const name = (formData.get("name") as string)?.trim();
    const type = formData.get("type") as "income" | "expense";

    if (!name) return { error: "Nama kategori tidak boleh kosong." };
    if (!["income", "expense"].includes(type)) return { error: "Tipe kategori tidak valid." };

    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        name,
        type,
        icon: "tag",
        color: type === "income" ? "#10b981" : "#ef4444",
        is_default: false,
      })
      .select("id, name, type, icon")
      .single();

    if (error) throw error;

    revalidatePath("/protected/transactions/new");
    return { success: true, category: data };
  } catch (err: any) {
    return { error: err?.message ?? "Gagal membuat kategori." };
  }
}
export async function deleteTransaction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sesi berakhir." };

    const id = formData.get("id") as string;
    if (!id) return { error: "ID transaksi tidak valid." };

    // 1. Hapus log auto debit terkait (jika ada) untuk mencegah error FK
    // Sebenarnya log FK-nya ON DELETE SET NULL, tapi lebih bersih jika dihapus
    await supabase
      .from("auto_debit_logs")
      .delete()
      .eq("transaction_id", id)
      .eq("user_id", user.id);

    // 2. Hapus transaksi (Trigger update_account_balance akan otomatis mengembalikan saldo akun)
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath("/protected/transactions");
    revalidatePath("/protected");
    revalidatePath("/protected/accounts"); // Karena saldo akun berubah
    
    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Gagal menghapus transaksi." };
  }
}