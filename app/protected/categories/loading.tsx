export default function CategoriesLoading() {
  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-11 w-40 animate-pulse rounded-xl bg-slate-200" />
      </div>

      {/* Filter Card Skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-100" />
          </div>
          <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>

      {/* Content Skeleton (Grid 2 Kolom) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2].map((col) => (
          <section
            key={col}
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            {/* Header Kolom Skeleton */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="h-5 w-6 animate-pulse rounded-full bg-slate-100" />
            </div>

            {/* List Item Skeleton */}
            <div className="flex-1 px-4 md:px-5">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between gap-3 border-b border-slate-100 py-4 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-slate-100" />
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                  </div>
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}