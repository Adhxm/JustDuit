
import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconBg?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = "bg-emerald-100 text-emerald-600",
  trend,
}: StatCardProps) {
  return (
    <Card className="rounded-xl border-slate-200/80 p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
            {title}
          </p>

          <p
            className="mt-1.5 break-words text-xl font-bold leading-tight tracking-tight text-slate-900 sm:text-2xl"
            title={value}
          >
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 truncate text-xs text-slate-500" title={subtitle}>
              {subtitle}
            </p>
          )}

          {trend && (
            <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-semibold",
                  trend.isPositive ? "text-emerald-600" : "text-red-600"
                )}
              >
                <span aria-hidden="true">
                  {trend.isPositive ? "↑" : "↓"}
                </span>
                {trend.value}
              </span>

              <span className="text-xs text-slate-400">
                vs bulan lalu
              </span>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            iconBg
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}
