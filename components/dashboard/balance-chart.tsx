
"use client";

import { useId } from "react";
import { Card } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatRupiah } from "@/lib/utils";

interface BalanceChartProps {
  data: Array<{
    date: string;
    income: number;
    expense: number;
  }>;
}

export function BalanceChart({ data }: BalanceChartProps) {
  const gradientId = useId().replace(/:/g, "");
  const isEmpty = !data || data.length === 0;

  return (
    <Card className="rounded-xl border-slate-200/80 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Arus Kas
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Pemasukan dan pengeluaran · 30 hari
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Masuk
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Keluar
          </span>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex h-[210px] items-center justify-center text-sm text-slate-500">
          Belum ada data transaksi
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart
            data={data}
            margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id={`${gradientId}-income`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>

              <linearGradient
                id={`${gradientId}-expense`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="#e2e8f0"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="date"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              stroke="#94a3b8"
              minTickGap={24}
              tickMargin={8}
            />

            <YAxis
              fontSize={10}
              tickLine={false}
              axisLine={false}
              stroke="#94a3b8"
              tickFormatter={(value) => formatRupiah(value, true)}
              width={58}
              tickCount={4}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "12px",
                padding: "8px 12px",
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
              }}
              formatter={(value: any, name: any) => [
                formatRupiah(Number(value)),
                name === "income" ? "Pemasukan" : "Pengeluaran",
              ]}
              labelStyle={{
                color: "#64748b",
                marginBottom: "4px",
              }}
            />

            <Area
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={2}
              fill={`url(#${gradientId}-income)`}
              name="income"
              activeDot={{ r: 4, strokeWidth: 0 }}
            />

            <Area
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={2}
              fill={`url(#${gradientId}-expense)`}
              name="expense"
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
