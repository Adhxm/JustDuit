"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// TARGET TABUNGAN (GOALS)
// ============================================================
export async function createSavingsGoal(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sesi berakhir." };

    const name = (formData.get("name") as string)?.trim();
    const targetAmount = Number(formData.get("target_amount"));
    const deadline = (formData.get("deadline") as string) || null;
    const icon = (formData.get("icon") as string) || "target";
    const color = (formData.get("color") as string) || "#10b981";
    const note = (formData.get("note") as string)?.trim() || null;

    if (!name || name.length > 50) return { error: "Nama target tidak valid." };
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) return { error: "Target nominal tidak valid." };

    const { error } = await supabase.from("savings_goals").insert({
      user_id: user.id,
      name,
      target_amount: targetAmount,
      deadline,
      icon,
      color,
      note,
      status: "active",
    });

    if (error) throw error;

    revalidatePath("/protected/savings");
    revalidatePath("/protected");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Gagal menyimpan target." };
  }
}

export async function deleteSavingsGoal(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sesi berakhir." };

    const id = formData.get("id") as string;
    if (!id) return { error: "ID tidak valid." };

    // Hapus transaksi tabungan terkait terlebih dahulu (jika tidak ada CASCADE)
    await supabase.from("savings_transactions").delete().eq("goal_id", id).eq("user_id", user.id);

    const { error } = await supabase.from("savings_goals").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;

    revalidatePath("/protected/savings");
    revalidatePath("/protected");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Gagal menghapus target." };
  }
}

// ============================================================
// TRANSAKSI TABUNGAN (DEPOSIT / WITHDRAW)
// ============================================================
export async function createSavingsTransaction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sesi berakhir." };

    const goalId = formData.get("goal_id") as string;
    const accountId = (formData.get("account_id") as string) || null;
    const type = formData.get("type") as "deposit" | "withdraw";
    const amount = Number(formData.get("amount"));
    const note = (formData.get("note") as string)?.trim() || null;
    const date = (formData.get("transaction_date") as string) || new Date().toISOString().split("T")[0];

    if (!goalId) return { error: "Target tidak valid." };
    if (!["deposit", "withdraw"].includes(type)) return { error: "Tipe transaksi tidak valid." };
    if (!Number.isFinite(amount) || amount <= 0) return { error: "Nominal tidak valid." };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Tanggal tidak valid." };

    // Validasi saldo akun jika deposit
    if (accountId && type === "deposit") {
      const { data: acc } = await supabase.from("accounts").select("balance").eq("id", accountId).eq("user_id", user.id).single();
      if (!acc || acc.balance < amount) return { error: "Saldo akun tidak mencukupi." };
    }

    // 1. Insert ke savings_transactions (Trigger akan update current_amount di savings_goals)
    const { error: insertError } = await supabase.from("savings_transactions").insert({
      goal_id: goalId,
      user_id: user.id,
      account_id: accountId,
      type,
      amount,
      note,
      transaction_date: date,
    });
    if (insertError) throw insertError;

    // 2. Jika terhubung ke akun, potong/tambah saldo akun via transaksi keuangan (opsional tapi disarankan)
    // Karena aplikasi ini mencatat uang keluar masuk, kita buat record di tabel `transactions` agar saldo akun sinkron.
    if (accountId) {
      const txType = type === "deposit" ? "expense" : "income"; // Deposit = uang keluar dari akun ke tabungan
      await supabase.from("transactions").insert({
        user_id: user.id,
        account_id: accountId,
        type: txType,
        amount,
        note: `[Tabungan] ${type === "deposit" ? "Setor ke" : "Tarik dari"} target`,
        transaction_date: date,
      });
    }

    revalidatePath(`/protected/savings/${goalId}`);
    revalidatePath("/protected/savings");
    revalidatePath("/protected/accounts");
    revalidatePath("/protected/transactions");
    revalidatePath("/protected");
    
    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Gagal menyimpan transaksi." };
  }
}