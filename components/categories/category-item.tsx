"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";
import {
  MoreVertical, Pencil, Trash2, Loader2, AlertTriangle,
  Tag, Utensils, Car, ShoppingBag, FileText, HeartPulse, Gamepad2,
  Users, GraduationCap, HeartHandshake, HandCoins, Landmark, ShieldCheck,
  Briefcase, Gift, TrendingUp, Laptop, Store, Package, RotateCcw, MoreHorizontal,
  CornerDownRight
} from "lucide-react";

import { cn } from "@/lib/utils";
import { deleteCategory } from "@/app/protected/categories/actions";

const ICON_MAP: Record<string, any> = {
  tag: Tag, utensils: Utensils, car: Car, "shopping-bag": ShoppingBag,
  "file-text": FileText, "heart-pulse": HeartPulse, "gamepad-2": Gamepad2,
  users: Users, "graduation-cap": GraduationCap, "heart-handshake": HeartHandshake,
  "hand-coins": HandCoins, landmark: Landmark, "shield-check": ShieldCheck,
  briefcase: Briefcase, gift: Gift, "trending-up": TrendingUp, laptop: Laptop,
  store: Store, package: Package, "rotate-ccw": RotateCcw, "more-horizontal": MoreHorizontal,
};

interface CategoryItemProps {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string | null;
  icon: string | null;
  is_default: boolean;
  is_subcategory?: boolean;
  subcategories?: CategoryItemProps[];
}

export function CategoryItem(props: CategoryItemProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; right: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const Icon = ICON_MAP[props.icon ?? "tag"] ?? Tag;
  const finalColor = props.color ?? "#64748b";

  function openMenu(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const right = Math.max(8, viewportWidth - rect.right);
    const top = rect.bottom + 4;
    const estimatedHeight = 100;
    const finalTop = top + estimatedHeight > window.innerHeight ? rect.top - estimatedHeight - 4 : top;
    setMenuCoords({ top: finalTop, right });
    setMenuOpen(true);
  }

  function handleDelete() {
    setActionError(null);
    const fd = new FormData();
    fd.append("id", props.id);

    startTransition(async () => {
      const result = await deleteCategory(fd);
      if (result?.error) {
        setActionError(result.error);
        setConfirmDelete(false);
        return;
      }
      setConfirmDelete(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className={cn("flex flex-col gap-2 py-3", props.is_subcategory ? "pl-10" : "")}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {props.is_subcategory && (
              <CornerDownRight className="h-4 w-4 shrink-0 text-slate-300 -ml-6 mr-1" />
            )}
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${finalColor}20`, color: finalColor }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-slate-900">{props.name}</p>
                {props.is_default && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    Bawaan
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={openMenu}
              disabled={isPending}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        {actionError && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{actionError}</div>
        )}
      </div>

      {/* Dropdown Portal */}
      {menuOpen && menuCoords && typeof document !== "undefined" &&
        createPortal(
          <>
            <button type="button" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-[90]" />
            <div className="fixed z-[100] w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg" style={{ top: menuCoords.top, right: menuCoords.right }}>
              <Link
                href={`/protected/categories/new?edit=${props.id}`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setMenuOpen(false)}
              >
                <Pencil className="h-4 w-4 text-slate-400" /> Edit kategori
              </Link>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Hapus kategori
              </button>
            </div>
          </>, document.body
        )}

      {/* Modal Hapus */}
      {confirmDelete && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(false); }}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Hapus Kategori?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Kategori <strong>{props.name}</strong> akan dihapus permanen. Transaksi dan Auto Debit yang menggunakan kategori ini <strong>tidak akan terhapus</strong>, hanya kategorinya yang akan menjadi kosong.
              </p>
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setConfirmDelete(false)} disabled={isPending} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50">Batal</button>
                <button type="button" onClick={handleDelete} disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Ya, hapus
                </button>
              </div>
            </div>
          </div>, document.body
        )}

      {/* Render Sub-kategori */}
      {props.subcategories && props.subcategories.length > 0 && (
        <div className="border-l-2 border-slate-100 ml-5 pl-0 mt-1">
          {props.subcategories.map((sub) => (
            <CategoryItem key={sub.id} {...sub} is_subcategory={true} />
          ))}
        </div>
      )}
    </>
  );
}