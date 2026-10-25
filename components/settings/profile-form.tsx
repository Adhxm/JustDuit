"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, User, Mail } from "lucide-react";

import { updateProfile, updateEmail } from "@/app/protected/settings/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({ 
  initialData 
}: { 
  initialData: { email: string; full_name: string | null } 
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialData.full_name ?? "");
  const [email, setEmail] = useState(initialData.email);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      // 1. Simpan Nama
      const fdName = new FormData();
      fdName.append("full_name", fullName);
      const resProfile = await updateProfile(fdName);
      
      if (resProfile.error) {
        setError(resProfile.error);
        return;
      }

      // 2. Simpan Email (Jika berubah)
      if (email !== initialData.email) {
        const fdEmail = new FormData();
        fdEmail.append("email", email);
        const resEmail = await updateEmail(fdEmail);
        
        if (resEmail.error) {
          setError(resEmail.error);
          return;
        }
        
        setSuccess(resEmail.message || "Profil diperbarui. Cek email untuk konfirmasi.");
      } else {
        setSuccess("Profil berhasil diperbarui.");
      }

      router.refresh();
      setTimeout(() => setSuccess(null), 5000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      
      {/* Nama Lengkap */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <User className="h-4 w-4 text-slate-500" /> Nama Lengkap
        </Label>
        <Input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Masukkan nama Anda"
          maxLength={100}
          className="h-11 rounded-xl"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Mail className="h-4 w-4 text-slate-500" /> Alamat Email
        </Label>
        <Input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@contoh.com"
          className="h-11 rounded-xl" 
        />
        <p className="text-xs text-slate-500">
          Jika Anda mengubah email, Supabase akan mengirim tautan konfirmasi ke alamat email baru.
        </p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}