export default function ReportsLoading() {
  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-12 w-48 animate-pulse rounded-2xl bg-slate-200" />
      </div>

      {/* Ringkasan Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
            </div>
            <div className="mt-5 h-7 w-32 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2].map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <div className="h-5 w-5 animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
            </div>
            
            {item === 1 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                  </div>
                  <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                  </div>
                  <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div className="h-40 w-40 shrink-0 animate-pulse rounded-full border-[15px] border-slate-100" />
                <div className="w-full flex-1 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 animate-pulse rounded-full bg-slate-200" />
                        <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                      </div>
                      <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}