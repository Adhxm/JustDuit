"use client";

import Link from "next/link";
import { Plus, Minus, ArrowLeftRight, Target } from "lucide-react";
import { Card } from "@/components/ui/card";

const actions = [
  {
    href: "/protected/transactions/new?type=income",
    label: "Pemasukan",
    icon: Plus,
    bg: "bg-emerald-500 hover:bg-emerald-600",
  },
  {
    href: "/protected/transactions/new?type=expense",
    label: "Pengeluaran",
    icon: Minus,
    bg: "bg-red-500 hover:bg-red-600",
  },
  {
    href: "/protected/transactions/new?type=transfer",
    label: "Transfer",
    icon: ArrowLeftRight,
    bg: "bg-blue-500 hover:bg-blue-600",
  },
  {
    href: "/protected/savings/new",
    label: "Tabungan",
    icon: Target,
    bg: "bg-amber-500 hover:bg-amber-600",
  },
];

export function QuickActions() {
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">
        Aksi Cepat
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`flex flex-col items-center gap-2 rounded-lg p-4 text-white transition-colors ${action.bg}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}