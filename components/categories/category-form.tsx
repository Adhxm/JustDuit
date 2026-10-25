"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  Type,
  Palette,
  ArrowDownLeft,
  ArrowUpRight,
  Tags,
  ListTree,
  Utensils,
  Car,
  ShoppingBag,
  FileText,
  HeartPulse,
  Gamepad2,
  Users,
  GraduationCap,
  HeartHandshake,
  HandCoins,
  Landmark,
  ShieldCheck,
  MoreHorizontal,
  Briefcase,
  Gift,
  TrendingUp,
  Laptop,
  Store,
  Package,
  RotateCcw,
  Tag,
} from "lucide-react";

import { createCategory, updateCategory } from "@/app/protected/categories/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StylishSelect } from "@/components/ui/stylish-select";

type CategoryType = "income" | "expense";

const TYPE_TABS = [
  {
    value: "expense",
    label: "Pengeluaran",
    activeClass: "border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500",
    icon: ArrowUpRight,
  },
  {
    value: "income",
    label: "Pemasukan",
    activeClass: "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500",
    icon: ArrowDownLeft,
  },
];

const ICON_OPTIONS = [
  { value: "tag", label: "Tag Default", Icon: Tag },
  { value: "utensils", label: "Makan", Icon: Utensils },
  { value: "car", label: "Transport", Icon: Car },
  { value: "shopping-bag", label: "Belanja", Icon: ShoppingBag },
  { value: "file-text", label: "Tagihan", Icon: FileText },
  { value: "heart-pulse", label: "Kesehatan", Icon: HeartPulse },
  { value: "gamepad-2", label: "Hiburan", Icon: Gamepad2 },
  { value: "users", label: "Keluarga", Icon: Users },
  { value: "graduation-cap", label: "Pendidikan", Icon: GraduationCap },
  { value: "heart-handshake", label: "Donasi", Icon: HeartHandshake },
  { value: "hand-coins", label: "Utang", Icon: HandCoins },
  { value: "landmark", label: "Pajak/Bank", Icon: Landmark },
  { value: "shield-check", label: "Asuransi", Icon: ShieldCheck },
  { value: "briefcase", label: "Gaji", Icon: Briefcase },
  { value: "gift", label: "Hadiah", Icon: Gift },
  { value: "trending-up", label: "Investasi", Icon: TrendingUp },
  { value: "laptop", label: "Freelance", Icon: Laptop },
  { value: "store", label: "Bisnis", Icon: Store },
  { value: "package", label: "Barang", Icon: Package },
  { value: "rotate-ccw", label: "Refund", Icon: RotateCcw },
  { value: "more-horizontal", label: "Lainnya", Icon: MoreHorizontal },
];

const PRESET_COLORS = [
  "#ef4444", "#f59e0b", "#ec4899", "#8b5cf6", "#10b981", 
  "#06b6d4", "#f97316", "#3b82f6", "#dc2626", "#b91c1c", 
  "#78350f", "#0ea5e9", "#64748b", "#22c55e", "#14b8a6"
];

interface CategoryFormProps {
  mode: "create" | "edit";
  initial?: {
    id: string;
    name: string;
    type: CategoryType;
    color: string | null;
    icon: string | null;
    parent_id: string | null;
  };
  parentOptions: { id: string; name: string; type: string }[];
}

export function CategoryForm({ mode, initial, parentOptions }: CategoryFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<CategoryType>(initial?.type ?? "expense");
  const [parentId, setParentId] = useState(initial?.parent_id ?? "");
  const [color, setColor] = useState(initial?.color ?? "#64748b");
  const [icon, setIcon] = useState(initial?.icon ?? "tag");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Jika tipe berubah, reset parent_id jika parent tersebut beda tipe
  useEffect(() => {
    if (parentId) {
      const p = parentOptions.find((o) => o.id === parentId);
      if (p && p.type !== type) {
        setParentId("");
      }
    }
  }, [type, parentId, parentOptions]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nama kategori tidak boleh kosong.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("color", color);
    formData.append("icon", icon);
    if (parentId) formData.append("parent_id", parentId);

    if (mode === "edit") {
      if (!initial?.id) return setError("ID hilang.");
      formData.append("id", initial.id);
    }

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCategory(formData)
          : await updateCategory(formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.push("/protected/categories");
      router.refresh();
    });
  }

  // Filter opsi parent: harus tipe yang sama & bukan dirinya sendiri
  const filteredParents = parentOptions.filter(
    (o) => o.type === type && o.id !== initial?.id
  );

  const CurrentIcon = ICON_OPTIONS.find((opt) => opt.value === icon)?.Icon ?? Tag;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="space-y-6 p-4 sm:p-6">
        
        {/* Tipe Kategori */}
        <section>
          <Label className="mb-3 block text-sm font-semibold text-slate-900">
            Tipe Kategori
          </Label>
          <div className="grid w-full grid-cols-2 gap-2">
            {TYPE_TABS.map((item) => {
              const Icon = item.icon;
              const active = type === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setType(item.value as CategoryType)}
                  className={`flex min-h-[64px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center transition ${
                    active
                      ? item.activeClass
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="w-full text-xs font-semibold sm:text-sm">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Nama */}
        <section>
          <Label htmlFor="name" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Type className="h-4 w-4 text-slate-500" />
            Nama Kategori
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Belanja Bulanan, Gaji, Kucing..."
            maxLength={50}
            required
            className="h-11 w-full min-w-0 rounded-xl"
          />
        </section>

        {/* Parent */}
        <section>
          <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ListTree className="h-4 w-4 text-slate-500" />
            Kategori Induk
            <span className="font-normal text-slate-400">(Opsional)</span>
          </Label>
          <StylishSelect
            value={parentId}
            onChange={setParentId}
            placeholder="Jadikan kategori utama"
            searchPlaceholder="Cari kategori induk..."
            emptyMessage="Kategori induk tidak ditemukan"
            icon={<Tags className="h-5 w-5" />}
            options={[
              { value: "", label: "Tanpa induk (Kategori Utama)", description: "" },
              ...filteredParents.map((cat) => ({
                value: cat.id,
                label: cat.name,
              })),
            ]}
          />
          <p className="mt-2 text-xs text-slate-500">
            Kategori induk hanya menampilkan kategori dengan tipe {type === "income" ? "pemasukan" : "pengeluaran"}.
          </p>
        </section>

        {/* Warna */}
        <section>
          <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Palette className="h-4 w-4 text-slate-500" />
            Warna
          </Label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setColor(preset)}
                aria-label={`Pilih warna ${preset}`}
                aria-pressed={color === preset}
                className={`h-9 w-9 rounded-xl border-2 transition ${
                  color === preset ? "border-slate-900 ring-2 ring-slate-900/20" : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: preset }}
              />
            ))}
            <label className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-500">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
              <span className="h-4 w-4 rounded" style={{ backgroundColor: color }} />
            </label>
          </div>
        </section>

        {/* Ikon */}
        <section>
          <Label className="mb-2 block text-sm font-semibold text-slate-900">Ikon</Label>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((opt) => {
              const Icon = opt.Icon;
              const active = icon === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setIcon(opt.value)}
                  title={opt.label}
                  aria-pressed={active}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                    active
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Preview */}
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 text-xs font-medium text-slate-500">Pratinjau</p>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}20`, color }}>
              <CurrentIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{name || "Nama Kategori"}</p>
              <p className="text-xs text-slate-500">
                {type === "income" ? "Pemasukan" : "Pengeluaran"}
                {parentId && ` • Sub dari ${parentOptions.find(p => p.id === parentId)?.name}`}
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Action */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 sm:w-auto"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {isPending ? "Menyimpan..." : mode === "create" ? "Simpan Kategori" : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}