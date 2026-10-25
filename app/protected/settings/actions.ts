"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sesi berakhir." };

    const fullName = (formData.get("full_name") as string)?.trim() || null;
    if (fullName && fullName.length > 100) return { error: "Nama maksimal 100 karakter." };

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);

    if (error) throw error;

    revalidatePath("/protected/settings");
    revalidatePath("/protected");
    
    return { success: true };
  } catch (err: any) {
    return { error: err?.message ?? "Gagal menyimpan profil." };
  }
}

export async function updateEmail(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sesi berakhir." };

    const email = (formData.get("email") as string)?.trim();
    if (!email || !email.includes("@")) return { error: "Format email tidak valid." };

    // 1. Update Auth Email (Supabase akan kirim email konfirmasi ke alamat baru)
    const { error: authError } = await supabase.auth.updateUser({ email });
    if (authError) throw authError;

    // 2. Update Profile Email (agar sinkron di UI)
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ email })
      .eq("id", user.id);
    if (profileError) throw profileError;

    revalidatePath("/protected/settings");
    revalidatePath("/protected");
    
    return { success: true, message: "Cek kotak masuk email baru Anda untuk konfirmasi." };
  } catch (err: any) {
    return { error: err?.message ?? "Gagal memperbarui email." };
  }
}

export async function updatePassword(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sesi berakhir." };

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (password.length < 6) return { error: "Password minimal 6 karakter." };
    if (password !== confirmPassword) return { error: "Konfirmasi password tidak cocok." };

    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;

    return { success: true, message: "Password berhasil diperbarui." };
  } catch (err: any) {
    return { error: err?.message ?? "Gagal memperbarui password." };
  }
}