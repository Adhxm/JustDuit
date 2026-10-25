"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Repeat,
  PiggyBank,
  Target,
  Wallet,
  Tags,
  BarChart3,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Kelompokkan menu untuk visual yang lebih terstruktur
const mainMenus = [
  { href: "/protected", label: "Dashboard", icon: LayoutDashboard },
  { href: "/protected/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/protected/auto-debits", label: "Auto Debit", icon: Repeat },
  { href: "/protected/savings", label: "Tabungan", icon: PiggyBank },
  { href: "/protected/budgets", label: "Budget", icon: Target },
  { href: "/protected/accounts", label: "Akun", icon: Wallet },
  { href: "/protected/categories", label: "Kategori", icon: Tags },
  { href: "/protected/reports", label: "Laporan", icon: BarChart3 },
];

const bottomMenus = [
  { href: "/protected/settings", label: "Pengaturan", icon: Settings },
];

function Brand() {
  return (
    <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
        <Image
          src="/logo_app.png"
          alt="Logo JustDuit"
          width={36}
          height={36}
          className="h-full w-full object-cover"
          priority
        />
      </div>
      <div>
        <h1 className="text-base font-bold leading-tight tracking-tight text-slate-900">
          JustDuit
        </h1>
        <p className="text-[10px] font-medium text-emerald-600">Keuangan Pribadi</p>
      </div>
    </div>
  );
}

function MenuItem({ 
  menu, 
  isActive, 
  onNavigate 
}: { 
  menu: typeof mainMenus[0]; 
  isActive: boolean; 
  onNavigate?: () => void 
}) {
  const Icon = menu.icon;

  return (
    <Link
      href={menu.href}
      onClick={onNavigate}
      className={cn(
        "group relative flex min-h-11 items-center gap-3 overflow-hidden rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100/50"
          : "text-slate-600 hover:translate-x-1 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {/* Indikator Aktif (Garis Kiri) */}
      {isActive && (
        <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500" />
      )}
      
      <Icon 
        className={cn(
          "h-5 w-5 shrink-0 transition-colors", 
          isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-500"
        )} 
      />
      <span className="truncate">{menu.label}</span>
    </Link>
  );
}

function MenuLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200">
      
      <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Menu Utama
      </div>
      <div className="space-y-1">
        {mainMenus.map((menu) => {
          const isActive =
            menu.href === "/protected"
              ? pathname === "/protected"
              : pathname.startsWith(menu.href);

          return (
            <MenuItem
              key={menu.href}
              menu={menu}
              isActive={isActive}
              onNavigate={onNavigate}
            />
          );
        })}
      </div>

      <div className="my-4 h-px w-full bg-slate-100" />

      <div className="space-y-1">
        {bottomMenus.map((menu) => {
          const isActive = pathname.startsWith(menu.href);
          return (
            <MenuItem
              key={menu.href}
              menu={menu}
              isActive={isActive}
              onNavigate={onNavigate}
            />
          );
        })}
      </div>
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="shrink-0 border-t border-slate-100 p-4">
      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
        <p className="text-[10px] font-medium text-slate-500">Versi Aplikasi</p>
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
          v0.1.0
        </span>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200/60 bg-white/95 text-slate-900 backdrop-blur-xl md:flex">
        <Brand />
        <MenuLinks pathname={pathname} />
        <SidebarFooter />
      </aside>

      {/* Tombol hamburger mobile (desain lebih clean) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka menu navigasi"
        aria-expanded={open}
        className="fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-slate-50 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200"
          />

          {/* Panel Drawer */}
          <aside className="absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col bg-white text-slate-900 shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pr-2">
              <Brand />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup navigasi"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <MenuLinks
              pathname={pathname}
              onNavigate={() => setOpen(false)}
            />
            <SidebarFooter />
          </aside>
        </div>
      )}
    </>
  );
}