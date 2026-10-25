"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { LogOut, Settings, User, Loader2 } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { logout } from "@/app/auth/actions"; // Import Server Action

interface UserNavProps {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
}

export function UserNav({ displayName, email, avatarUrl, initials }: UserNavProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function handleLogout() {
    startTransition(async () => {
      await logout();
    });
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        <Avatar className="h-9 w-9 border border-slate-200 shadow-sm">
          <AvatarImage src={avatarUrl || ""} alt={displayName} />
          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-700 text-xs font-bold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
            <p className="truncate text-xs text-slate-500">{email}</p>
          </div>
          
          <div className="p-1.5">
            <Link
              href="/protected/settings"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <User className="h-4 w-4 text-slate-400" />
              Profil Saya
            </Link>
            <Link
              href="/protected/settings"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Pengaturan
            </Link>
          </div>

          <div className="border-t border-slate-100 p-1.5">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              {isPending ? "Keluar..." : "Keluar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}