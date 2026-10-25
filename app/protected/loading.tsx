
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 ${className}`}
    />
  );
}

function StatSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-3.5 w-28 max-w-full" />
          <Skeleton className="mt-3 h-6 w-32 max-w-full" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
        <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
      </div>
    </div>
  );
}

function BalanceChartSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-2 h-3 w-44 max-w-full" />
        </div>
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>

      <div className="mt-4 flex gap-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>

      <div className="relative mt-4 h-40 overflow-hidden sm:h-44">
        <div className="absolute inset-0 flex flex-col justify-between pb-5">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="border-t border-dashed border-slate-200"
            />
          ))}
        </div>

        <svg
          viewBox="0 0 600 180"
          preserveAspectRatio="none"
          className="absolute inset-0 h-[calc(100%-20px)] w-full"
          aria-hidden="true"
        >
          <path
            d="M0 135 C50 120 70 150 120 105 S200 125 250 80 S330 105 380 60 S460 90 510 40 S570 55 600 25"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="3"
            strokeDasharray="6 7"
            strokeLinecap="round"
          />
          <path
            d="M0 155 C60 140 100 160 150 130 S230 145 290 115 S370 135 420 100 S520 125 600 80"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="3"
            strokeDasharray="6 7"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute bottom-0 flex w-full justify-between">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Skeleton key={item} className="h-2.5 w-7" />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickActionsSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-2 h-3 w-40 max-w-full" />

      <div className="mt-4 space-y-2">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5"
          >
            <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
            <Skeleton className="h-3.5 flex-1" />
            <Skeleton className="h-3 w-3 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-2 h-3 w-48 max-w-full" />

      <div className="mt-5 flex items-center gap-5">
        <Skeleton className="h-28 w-28 shrink-0 rounded-full border-[14px] border-slate-100 bg-slate-200" />

        <div className="min-w-0 flex-1 space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Skeleton className="h-2.5 w-2.5 shrink-0 rounded-full" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SavingsSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-2 h-3 w-44 max-w-full" />
        </div>
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>

      <div className="mt-4 space-y-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-lg border border-slate-100 p-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-3.5 w-28 max-w-full" />
                <Skeleton className="mt-2 h-3 w-20" />
              </div>
              <Skeleton className="h-3.5 w-10" />
            </div>
            <Skeleton className="mt-3 h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-2 h-3 w-44 max-w-full" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>

      <div className="mt-3 divide-y divide-slate-100">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 py-3"
          >
            <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />

            <div className="min-w-0 flex-1">
              <Skeleton className="h-3.5 w-36 max-w-full" />
              <Skeleton className="mt-2 h-3 w-24 max-w-full" />
            </div>

            <div className="shrink-0 space-y-2">
              <Skeleton className="ml-auto h-3.5 w-20" />
              <Skeleton className="ml-auto h-2.5 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main
      className="space-y-4 pb-4"
      role="status"
      aria-label="Memuat dashboard keuangan"
    >
      {/* Header */}
      <header>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-3.5 w-60 max-w-full" />
      </header>

      {/* Empat statistik */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <StatSkeleton key={item} />
        ))}
      </section>

      {/* Grafik utama dan aksi */}
      <section className="grid items-start gap-3 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <BalanceChartSkeleton />
        </div>
        <QuickActionsSkeleton />
      </section>

      {/* Kategori dan tabungan */}
      <section className="grid items-start gap-3 xl:grid-cols-2">
        <CategorySkeleton />
        <SavingsSkeleton />
      </section>

      {/* Transaksi terbaru */}
      <TransactionsSkeleton />

      <span className="sr-only">Dashboard sedang dimuat...</span>
    </main>
  );
}
