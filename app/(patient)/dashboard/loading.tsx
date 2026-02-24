export default function PatientDashboardLoading() {
  return (
    <div className="flex flex-col gap-8 pb-12 animate-pulse">
      {/* Welcome Header Skeleton */}
      <header className="rounded-[2rem] bg-slate-200 px-8 py-12 sm:px-12 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 w-full max-w-xl">
            <div className="h-10 w-3/4 rounded-lg bg-slate-300"></div>
            <div className="h-6 w-full rounded-lg bg-slate-300"></div>
          </div>
          <div className="h-12 w-48 rounded-xl bg-slate-300"></div>
        </div>
      </header>

      <section className="grid gap-8 md:grid-cols-2">
        {/* Upcoming Appointments Skeleton */}
        <div className="flex flex-col rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-100 p-6 sm:px-8">
            <div className="h-10 w-10 rounded-xl bg-slate-200"></div>
            <div className="h-7 w-48 rounded-lg bg-slate-200"></div>
          </div>
          
          <div className="flex-1 p-6 sm:px-8 bg-slate-50/30 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex gap-4 items-start sm:items-center w-full">
                  <div className="h-12 w-12 rounded-full bg-slate-200 shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-40 rounded bg-slate-200"></div>
                    <div className="h-4 w-32 rounded bg-slate-200"></div>
                  </div>
                </div>
                <div className="h-6 w-20 rounded-full bg-slate-200 shrink-0"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Visits & Reviews Skeleton */}
        <div className="flex flex-col rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-100 p-6 sm:px-8">
            <div className="h-10 w-10 rounded-xl bg-slate-200"></div>
            <div className="h-7 w-56 rounded-lg bg-slate-200"></div>
          </div>
          
          <div className="flex-1 p-6 sm:px-8 bg-slate-50/30 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex gap-4 items-center w-full">
                  <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-32 rounded bg-slate-200"></div>
                    <div className="h-4 w-24 rounded bg-slate-200"></div>
                  </div>
                </div>
                <div className="h-8 w-28 rounded-full bg-slate-200 shrink-0"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}