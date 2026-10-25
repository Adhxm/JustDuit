export default function SettingsLoading() {
  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="h-16 w-16 animate-pulse rounded-3xl bg-slate-100" />
              <div className="space-y-2">
                <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-56 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                  <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
                </div>
              ))}
              <div className="flex justify-end">
                <div className="h-11 w-40 animate-pulse rounded-xl bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 h-6 w-32 animate-pulse rounded bg-slate-200" />
              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}