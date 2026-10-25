"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type CategoryType = "income" | "expense";

const ALLOWED_TYPES: CategoryType[] = ["income", "expense"];

// Validasi warna hex
const isValidHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value);

// ============================================================
// CREATE
// ============================================================
export async function createCategory(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sesi Anda sudah berakhir." };

    const name = (formData.get("name") as string | null)?.trim() ?? "";
    const typeRaw = (formData.get("type") as string | null) ?? "";
    const colorRaw = (formData.get("color") as string | null) ?? "";
    const iconRaw = (formData.get("icon") as string | null) ?? "";
    const parentId = (formData.get("parent_id") as string | null) || null;

    if (!name) return { error: "Nama kategori tidak boleh kosong." };
    if (name.length > 50) return { error: "Nama kategori maksimal 50 karakter." };
    if (!ALLOWED_TYPES.includes(typeRaw as CategoryType)) return { error: "Tipe tidak valid." };

    const color = isValidHex(colorRaw) ? colorRaw : "#64748b";
    const icon = iconRaw || "tag";

    // Validasi parent (harus milik user dan tipe sama)
    if (parentId) {
      const { data: parent } = await supabase
        .from("categories")
        .select("id, type")
        .eq("id", parentId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!parent) return { error: "Kategori induk tidak ditemukan." };
      if (parent.type !== typeRaw) return { error: "Tipe sub-kategori harus sama dengan induknya." };
    }

    const { error } = await supabase.from("categories").insert({
      user_id: user.id,
      name,
      type: typeRaw,
      color,
      icon,
      parent_id: parentId,
      is_default: false,
    });

    if (error) {
      console.error("Insert category error:", error);
      return { error: "Gagal menyimpan kategori." };
    }

    revalidatePath("/protected/categories");
    revalidatePath("/protected/transactions");
    revalidatePath("/protected/auto-debits");
    
    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Terjadi kesalahan." };
  }
}

// ============================================================
// UPDATE
// ============================================================
export async function updateCategory(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sesi Anda sudah berakhir." };

    const id = (formData.get("id") as string | null) ?? "";
    const name = (formData.get("name") as string | null)?.trim() ?? "";
    const typeRaw = (formData.get("type") as string | null) ?? "";
    const colorRaw = (formData.get("color") as string | null) ?? "";
    const iconRaw = (formData.get("icon") as string | null) ?? "";
    const parentId = (formData.get("parent_id") as string | null) || null;

    if (!id) return { error: "ID kategori tidak ditemukan." };
    if (!name) return { error: "Nama kategori tidak boleh kosong." };
    if (!ALLOWED_TYPES.includes(typeRaw as CategoryType)) return { error: "Tipe tidak valid." };

    // Jangan biarkan user set parent ke dirinya sendiri
    if (parentId === id) return { error: "Kategori tidak bisa menjadi sub-kategori dirinya sendiri." };

    const color = isValidHex(colorRaw) ? colorRaw : "#64748b";
    const icon = iconRaw || "tag";

    // Validasi parent
    if (parentId) {
      const { data: parent } = await supabase
        .from("categories")
        .select("id, type")
        .eq("id", parentId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!parent) return { error: "Kategori induk tidak ditemukan." };
      if (parent.type !== typeRaw) return { error: "Tipe sub-kategori harus sama dengan induknya." };
    }

    const { error } = await supabase
      .from("categories")
      .update({ name, type: typeRaw, color, icon, parent_id: parentId })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Update category error:", error);
      return { error: "Gagal menyimpan perubahan." };
    }

    revalidatePath("/protected/categories");
    revalidatePath("/protected/transactions");
    revalidatePath("/protected/auto-debits");
    
    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Terjadi kesalahan." };
  }
}

// ============================================================
// DELETE
// ============================================================
export async function deleteCategory(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sesi Anda sudah berakhir." };

    const id = (formData.get("id") as string | null) ?? "";
    if (!id) return { error: "ID kategori tidak ditemukan." };

    // Cek apakah ada sub-kategori
    const { count: childCount } = await supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("parent_id", id)
      .eq("user_id", user.id);

    if ((childCount ?? 0) > 0) {
      return { error: "Kategori tidak bisa dihapus karena memiliki sub-kategori. Hapus atau pindahkan sub-kategori terlebih dahulu." };
    }

    // Hapus kategori (constraint transaksi akan ON DELETE SET NULL)
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Delete category error:", error);
      return { error: "Gagal menghapus kategori." };
    }

    revalidatePath("/protected/categories");
    revalidatePath("/protected/transactions");
    revalidatePath("/protected/auto-debits");
    
    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Terjadi kesalahan." };
  }
}