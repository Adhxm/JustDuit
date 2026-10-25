"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Validasi
  if (!input.amount || input.amount <= 0) {
    return { error: "Jumlah harus lebih dari 0" };
  }

  if (!input.account_id) {
    return { error: "Pilih akun" };
  }

  if (input.type === "transfer") {
    if (!input.to_account_id) {
      return { error: "Pilih akun tujuan" };
    }
    if (input.to_account_id === input.account_id) {
      return { error: "Akun tujuan tidak boleh sama dengan akun sumber" };
    }
  }

  // Insert
  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    type: input.type,
    amount: input.amount,
    account_id: input.account_id,
    to_account_id: input.type === "transfer" ? input.to_account_id : null,
    category_id: input.type === "transfer" ? null : input.category_id,
    note: input.note || null,
    transaction_date: input.transaction_date,
  });

  if (error) {
    console.error("Insert error:", error);
    return { error: error.message };
  }

  // Revalidate halaman yang terpengaruh
  revalidatePath("/protected");
  revalidatePath("/protected/transactions");

  return { success: true };
}