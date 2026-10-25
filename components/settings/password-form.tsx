"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, Lock } from "lucide-react";
import { updatePassword } from "@/app/protected/settings/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const fd = new FormData();
    fd.append("password", password);
    fd.append("confirm_password", confirmPassword);

    startTransition(async () => {
      const res = await updatePassword(fd);
      if (res.error) {
        setError(res.error);
        return;
      }
      setSuccess(res.message || "Password berhasil diperbarui.");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(null), 5000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Lock className="h-4 w-4 text-slate-500" /> Password Baru
        </Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimal 6 karakter"
          required
          className="h-11 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Lock className="h-4 w-4 text-slate-500" /> Konfirmasi Password
        </Label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Ketik ulang password baru"
          required
          className="h-11 rounded-xl"
        />
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
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {isPending ? "Memproses..." : "Perbarui Password"}
        </button>
      </div>
    </form>
  );
}