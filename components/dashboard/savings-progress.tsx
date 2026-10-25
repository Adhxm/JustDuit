import Link from "next/link";
import { Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatRupiah } from "@/lib/utils";

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  color: string;
}

interface SavingsProgressProps {
  goals: Goal[];
}

export function SavingsProgress({ goals }: SavingsProgressProps) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Target Tabungan
          </h3>
          <p className="text-sm text-slate-500">Progress kamu</p>
        </div>
        <Link
          href="/protected/savings"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          Kelola →
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Target className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">
            Belum ada target tabungan
          </p>
          <Link
            href="/protected/savings"
            className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Buat target pertama
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.slice(0, 3).map((goal) => {
            const pct = Math.min(
              100,
              (goal.current_amount / goal.target_amount) * 100
            );
            return (
              <div key={goal.id}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: goal.color }}
                    />
                    <span className="text-sm font-medium text-slate-900">
                      {goal.name}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {pct.toFixed(0)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: goal.color,
                    }}
                  />
                </div>

                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{formatRupiah(goal.current_amount, true)}</span>
                  <span>{formatRupiah(goal.target_amount, true)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}