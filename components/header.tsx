import { createClient } from "@/lib/supabase/server";
import { UserNav } from "@/components/user-nav";
import { Sparkles } from "lucide-react";

export async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, email")
    .eq("id", user?.id ?? "")
    .single();

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || "User";
  const email = profile?.email || user?.email || "";

  const initials = displayName
    .split(/[\s@]/)
    .filter(Boolean)
    .map((part: string) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200/60 bg-white/80 px-4 pl-16 backdrop-blur-md sm:px-6 sm:pl-16 md:px-8">
      
      {/* Bagian Kiri: Sapaan */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600 sm:flex">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="flex items-center gap-1.5 truncate text-sm font-bold text-slate-900 sm:text-base">
            Halo, {displayName}!
          </h2>
          <p className="hidden truncate text-xs font-medium text-slate-500 sm:block">
            Siap mengatur keuanganmu hari ini?
          </p>
        </div>
      </div>

      {/* Bagian Kanan: Aksi & Profil */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <div className="hidden h-6 w-px bg-slate-200 sm:block"></div>
        <UserNav 
          displayName={displayName} 
          email={email} 
          avatarUrl={profile?.avatar_url || null} 
          initials={initials} 
        />
      </div>

    </header>
  );
}