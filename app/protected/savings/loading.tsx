export default function SavingsLoading() {
  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-11 w-40 animate-pulse rounded-xl bg-slate-200" />
      </div>

      {/* Ringkasan Skeleton (3 Kolom) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
              <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
            </div>
            <div className="mt-5 h-8 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-3 w-32 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Grid Target Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div>
              {/* Icon & Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
              </div>

              {/* Title */}
              <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-slate-200" />

              {/* Nominal */}
              <div className="mt-4 flex items-end justify-between">
                <div className="space-y-1.5">
                  <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
                  <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="space-y-1.5 text-right">
                  <div className="ml-auto h-3 w-12 animate-pulse rounded bg-slate-100" />
                  <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-200" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
                </div>
                <div className="h-2 w-full animate-pulse rounded-full bg-slate-100" />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-4 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}