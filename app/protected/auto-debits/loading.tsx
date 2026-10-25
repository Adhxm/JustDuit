export default function AutoDebitsLoading() {
  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-11 w-36 animate-pulse rounded-xl bg-slate-200" />
      </div>

      {/* Ringkasan Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
              <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
            </div>
            <div className="mt-5 h-7 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-3 w-36 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Filter & Daftar Skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-9 w-full sm:max-w-sm animate-pulse rounded-xl bg-slate-100" />
        </div>

        <div className="mt-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
        </div>

        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 border-b border-slate-100 py-5 last:border-b-0"
          >
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-slate-100" />

            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-40 max-w-full animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-52 max-w-full animate-pulse rounded bg-slate-100" />
            </div>

            <div className="shrink-0 space-y-2">
              <div className="ml-auto h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="ml-auto h-3 w-28 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}