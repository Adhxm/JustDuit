import { redirect } from "next/navigation";
import { UserCircle, Shield, Info, LogOut, KeyRound } from "lucide-react";

import { logout } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/settings/profile-form";
import { PasswordForm } from "@/components/settings/password-form";

export const instant = false;

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/auth/login");

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header */}
      <div>
        <p className="mb-1 text-sm text-slate-500">Pengaturan / Akun</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pengaturan Akun</h1>
        <p className="mt-1 text-sm text-slate-600">Kelola profil, keamanan, dan preferensi aplikasi Anda.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Kolom Kiri: Profil & Password */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card Profil */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600">
                <UserCircle className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Informasi Profil</h2>
                <p className="text-sm text-slate-500">Perbarui nama dan alamat email Anda.</p>
              </div>
            </div>

            <ProfileForm initialData={profile} />
          </div>

          {/* Card Password */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-100 text-blue-600">
                <KeyRound className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Keamanan Akun</h2>
                <p className="text-sm text-slate-500">Ganti password secara berkala.</p>
              </div>
            </div>

            <PasswordForm />
          </div>

        </div>

        {/* Kolom Kanan: Info & Logout */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card Informasi Aplikasi */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-slate-400" />
              <h3 className="font-semibold text-slate-900">Tentang Aplikasi</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex justify-between">
                <span>Versi</span>
                <span className="font-medium text-slate-900">0.1.0 (Beta)</span>
              </li>
              <li className="flex justify-between">
                <span>Nama Aplikasi</span>
                <span className="font-medium text-slate-900">JustDuit</span>
              </li>
              <li className="flex justify-between">
                <span>Mata Uang</span>
                <span className="font-medium text-slate-900">IDR (Rupiah)</span>
              </li>
              <li className="flex justify-between">
                <span>Status Layanan</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Normal
                </span>
              </li>
            </ul>
          </div>

          {/* Card Logout */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-slate-400" />
              <h3 className="font-semibold text-slate-900">Sesi Perangkat</h3>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              Pastikan Anda keluar dari akun jika menggunakan perangkat publik.
            </p>
            
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" /> Keluar dari Akun
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}