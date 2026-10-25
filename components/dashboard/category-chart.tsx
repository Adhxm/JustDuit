
"use client";

import { Card } from "@/components/ui/card";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatRupiah } from "@/lib/utils";

interface CategoryChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export function CategoryChart({ data }: CategoryChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="rounded-xl border-slate-200/80 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Pengeluaran per Kategori
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Rincian pengeluaran bulan ini
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[11px] text-slate-500">Total</p>
          <p className="text-sm font-bold text-slate-900">
            {formatRupiah(total, true)}
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[220px] items-center justify-center text-sm text-slate-500">
          Belum ada pengeluaran bulan ini
        </div>
      ) : (
        <>
          {/* Donut Chart */}
          <div className="relative mx-auto mt-3 h-[220px] w-full max-w-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={96}
                  paddingAngle={data.length > 1 ? 2 : 0}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((item, index) => (
                    <Cell
                      key={`${item.name}-${index}`}
                      fill={item.color}
                    />
                  ))}
                </Pie>

                <Tooltip
                  wrapperStyle={{
                    zIndex: 20,
                    pointerEvents: "none",
                  }}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    fontSize: "12px",
                    padding: "8px 12px",
                    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
                  }}
                  formatter={(
                    value: any,
                    _name: any,
                    item: any
                  ) => [
                    formatRupiah(Number(value)),
                    item?.payload?.name ?? "Kategori",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Teks tengah donut */}
            <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center">
              <span className="text-xs text-slate-500">
                Total kategori
              </span>
              <span className="mt-1 text-2xl font-bold text-slate-900">
                {data.length}
              </span>
              <span className="text-xs text-slate-500">
                pengeluaran
              </span>
            </div>
          </div>

          {/* Progress Bar: 2 kolom */}
          <div className="mt-3 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
            {data.slice(0, 10).map((item, index) => {
              const percentage =
                total > 0 ? (item.value / total) * 100 : 0;

              return (
                <div
                  key={`${item.name}-${index}`}
                  className="min-w-0"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span
                        className="truncate text-xs font-medium text-slate-700"
                        title={item.name}
                      >
                        {item.name}
                      </span>
                    </div>

                    <span className="shrink-0 text-xs font-semibold text-slate-900">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>

                  <p className="mt-1 text-[11px] text-slate-500">
                    {formatRupiah(item.value, true)}
                  </p>
                </div>
              );
            })}
          </div>

          {data.length > 10 && (
            <p className="mt-3 text-center text-xs text-slate-400">
              Menampilkan 10 dari {data.length} kategori
            </p>
          )}
        </>
      )}
    </Card>
  );
}
