export default function DoctorDashboardLoading() {
  return (
    <div className="flex flex-col gap-8 pb-12 animate-pulse">
      {/* Header Skeleton */}
      <header className="rounded-[2rem] bg-slate-200 px-8 py-12 sm:px-12 sm:py-16">
        <div className="max-w-3xl space-y-4">
          <div className="h-10 w-3/4 rounded-lg bg-slate-300"></div>
          <div className="h-6 w-1/2 rounded-lg bg-slate-300"></div>
        </div>
      </header>

      {/* Quick Actions Skeleton */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-[1rem] bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
            <div className="h-12 w-12 rounded-xl bg-slate-200 shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 w-24 rounded bg-slate-200"></div>
              <div className="h-4 w-32 rounded bg-slate-200"></div>
            </div>
          </div>
        ))}
      </section>

      {/* Stats Skeleton */}
      <section className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60 flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-slate-200 shrink-0"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 w-20 rounded bg-slate-200"></div>
              <div className="h-8 w-12 rounded bg-slate-200"></div>
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-8 lg:grid-cols-[2fr,1.5fr]">
        <div className="space-y-8">
          {/* Today's Schedule Skeleton */}
          <div className="flex flex-col rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-200"></div>
                <div className="h-7 w-40 rounded-lg bg-slate-200"></div>
              </div>
              <div className="h-6 w-16 rounded-full bg-slate-200"></div>
            </div>
            
            <div className="p-6 sm:px-8 bg-slate-50/30 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-4 w-full">
                    <div className="h-12 w-12 rounded-full bg-slate-200 shrink-0"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-5 w-32 rounded bg-slate-200"></div>
                      <div className="h-4 w-40 rounded bg-slate-200"></div>
                    </div>
                  </div>
                  <div className="h-6 w-20 rounded-full bg-slate-200 shrink-0"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Sidebar Skeleton */}
        <div className="space-y-8">
          <div className="rounded-[1.5rem] bg-white p-6 sm:p-8 shadow-sm ring-1 ring-slate-200/60">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-slate-200"></div>
              <div className="h-7 w-40 rounded-lg bg-slate-200"></div>
            </div>
            
            <div className="space-y-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 w-20 rounded bg-slate-200"></div>
                    <div className="h-5 w-24 rounded-md bg-slate-200"></div>
                  </div>
                  <div className="h-4 w-32 rounded bg-slate-200 mb-3"></div>
                  <div className="h-16 w-full rounded-lg bg-slate-200"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}