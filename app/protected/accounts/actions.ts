"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type AccountType =
  | "cash"
  | "bank"
  | "ewallet"
  | "credit"
  | "investment"
  | "other";

const ALLOWED_TYPES: AccountType[] = [
  "cash",
  "bank",
  "ewallet",
  "credit",
  "investment",
  "other",
];

const DEFAULT_COLOR_BY_TYPE: Record<AccountType, string> = {
  cash: "#10b981",
  bank: "#3b82f6",
  ewallet: "#8b5cf6",
  credit: "#ef4444",
  investment: "#f59e0b",
  other: "#64748b",
};

const DEFAULT_ICON_BY_TYPE: Record<AccountType, string> = {
  cash: "wallet",
  bank: "building-2",
  ewallet: "smartphone",
  credit: "credit-card",
  investment: "trending-up",
  other: "wallet",
};

const ALLOWED_ICONS = [
  "wallet",
  "building-2",
  "smartphone",
  "credit-card",
  "trending-up",
  "piggy-bank",
  "landmark",
  "coins",
  "briefcase",
  "banknote",
];

const INITIAL_BALANCE_NOTE_PREFIX = "[Saldo Awal]";

// ============================================================
// CREATE
// ============================================================
export async function createAccount(formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi Anda sudah berakhir. Silakan login ulang." };

    const name = (formData.get("name") as string | null)?.trim() ?? "";
    const typeRaw = (formData.get("type") as string | null) ?? "";
    const initialBalanceRaw = formData.get("initial_balance");
    const colorRaw = (formData.get("color") as string | null) ?? "";
    const iconRaw = (formData.get("icon") as string | null) ?? "";

    if (!name) return { error: "Nama akun tidak boleh kosong." };
    if (name.length > 50)
      return { error: "Nama akun maksimal 50 karakter." };

    if (!ALLOWED_TYPES.includes(typeRaw as AccountType)) {
      return { error: "Tipe akun tidak valid." };
    }
    const type = typeRaw as AccountType;

    const initialBalance = Number(initialBalanceRaw);
    if (!Number.isFinite(initialBalance) || initialBalance < 0) {
      return { error: "Saldo awal tidak valid." };
    }
    if (!Number.isInteger(initialBalance)) {
      return { error: "Saldo awal harus berupa angka bulat." };
    }

    const color =
      colorRaw && /^#[0-9a-fA-F]{6}$/.test(colorRaw)
        ? colorRaw
        : DEFAULT_COLOR_BY_TYPE[type];

    const icon =
      iconRaw && ALLOWED_ICONS.includes(iconRaw)
        ? iconRaw
        : DEFAULT_ICON_BY_TYPE[type];

    // 1) Insert akun dengan balance = 0
    const { data: inserted, error: insertError } = await supabase
      .from("accounts")
      .insert({
        user_id: user.id,
        name,
        type,
        initial_balance: initialBalance,
        balance: 0,
        color,
        icon,
        is_active: true,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      console.error("Error inserting account:", insertError);
      return { error: "Gagal menyimpan akun." };
    }

    // 2) Insert transaksi saldo awal jika > 0
    if (initialBalance > 0) {
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user.id,
        account_id: inserted.id,
        type: "income",
        amount: initialBalance,
        note: `${INITIAL_BALANCE_NOTE_PREFIX} ${name}`,
        transaction_date: new Date().toISOString().slice(0, 10),
      });

      if (txError) {
        // Rollback akun jika transaksi gagal
        await supabase.from("accounts").delete().eq("id", inserted.id);
        console.error("Error inserting initial balance tx:", txError);
        return { error: "Gagal mencatat saldo awal." };
      }
    }

    revalidatePath("/protected/accounts");
    revalidatePath("/protected");
    revalidatePath("/protected/transactions");

    return { success: true };
  } catch (err: any) {
    console.error("createAccount error:", err);
    return { error: err?.message ?? "Gagal menyimpan akun." };
  }
}

// ============================================================
// UPDATE
// ============================================================
export async function updateAccount(formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi Anda sudah berakhir. Silakan login ulang." };

    const id = (formData.get("id") as string | null) ?? "";
    const name = (formData.get("name") as string | null)?.trim() ?? "";
    const typeRaw = (formData.get("type") as string | null) ?? "";
    const colorRaw = (formData.get("color") as string | null) ?? "";
    const iconRaw = (formData.get("icon") as string | null) ?? "";

    if (!id) return { error: "ID akun tidak ditemukan." };
    if (!name) return { error: "Nama akun tidak boleh kosong." };
    if (name.length > 50)
      return { error: "Nama akun maksimal 50 karakter." };

    if (!ALLOWED_TYPES.includes(typeRaw as AccountType)) {
      return { error: "Tipe akun tidak valid." };
    }
    const type = typeRaw as AccountType;

    const color =
      colorRaw && /^#[0-9a-fA-F]{6}$/.test(colorRaw)
        ? colorRaw
        : DEFAULT_COLOR_BY_TYPE[type];

    const icon =
      iconRaw && ALLOWED_ICONS.includes(iconRaw)
        ? iconRaw
        : DEFAULT_ICON_BY_TYPE[type];

    const { data: existing } = await supabase
      .from("accounts")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existing) return { error: "Akun tidak ditemukan." };

    const { error } = await supabase
      .from("accounts")
      .update({ name, type, color, icon })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating account:", error);
      return { error: "Gagal menyimpan perubahan akun." };
    }

    revalidatePath("/protected/accounts");
    revalidatePath("/protected");

    return { success: true };
  } catch (err: any) {
    console.error("updateAccount error:", err);
    return { error: err?.message ?? "Gagal menyimpan perubahan akun." };
  }
}

// ============================================================
// TOGGLE ACTIVE
// ============================================================
export async function toggleAccountActive(formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi Anda sudah berakhir." };

    const id = (formData.get("id") as string | null) ?? "";
    const currentActive = formData.get("is_active") === "true";

    if (!id) return { error: "ID akun tidak ditemukan." };

    const { error } = await supabase
      .from("accounts")
      .update({ is_active: !currentActive })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error toggling account:", error);
      return { error: "Gagal mengubah status akun." };
    }

    revalidatePath("/protected/accounts");
    revalidatePath("/protected");

    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Gagal mengubah status akun." };
  }
}

// ============================================================
// DELETE
// ============================================================
export async function deleteAccount(formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi Anda sudah berakhir." };

    const id = (formData.get("id") as string | null) ?? "";
    if (!id) return { error: "ID akun tidak ditemukan." };

    const { data: account } = await supabase
      .from("accounts")
      .select("id, name")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!account) return { error: "Akun tidak ditemukan." };

    // Hitung transaksi yang BUKAN transaksi saldo awal
    const { count, error: countError } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("account_id", id)
      .eq("user_id", user.id)
      .not("note", "ilike", `${INITIAL_BALANCE_NOTE_PREFIX}%`);

    if (countError) {
      console.error("Error counting transactions:", countError);
      return { error: "Gagal memverifikasi akun." };
    }

    if ((count ?? 0) > 0) {
      return {
        error:
          "Akun tidak bisa dihapus karena masih memiliki transaksi. Nonaktifkan akun saja.",
      };
    }

    // Hapus transaksi saldo awal (jika ada) supaya bersih
    const { error: txDeleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("account_id", id)
      .eq("user_id", user.id)
      .ilike("note", `${INITIAL_BALANCE_NOTE_PREFIX}%`);

    if (txDeleteError) {
      console.error("Error deleting initial balance tx:", txDeleteError);
      return { error: "Gagal membersihkan transaksi saldo awal." };
    }

    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting account:", error);
      return { error: "Gagal menghapus akun." };
    }

    revalidatePath("/protected/accounts");
    revalidatePath("/protected");
    revalidatePath("/protected/transactions");

    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Gagal menghapus akun." };
  }
}