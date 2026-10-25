export default function BudgetsLoading() {
  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-11 w-36 animate-pulse rounded-xl bg-slate-200" />
      </div>

      <div className="flex w-full sm:w-64 items-center justify-between rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex justify-between">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
              <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
            </div>
            <div className="mt-5 h-7 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-3 w-36 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex justify-between">
              <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
            </div>
            <div className="mt-4 h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 flex justify-between">
              <div className="h-6 w-20 animate-pulse rounded bg-slate-200" />
              <div className="h-6 w-16 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="mt-4 h-2 w-full animate-pulse rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}