export default function NewAppointmentLoading() {
  return (
    <div className="flex flex-col gap-8 pb-16 max-w-6xl mx-auto animate-pulse">
      {/* Header */}
      <div>
        <div className="h-4 w-32 rounded bg-slate-200 mb-6"></div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3 w-full max-w-lg">
            <div className="h-10 w-3/4 rounded-lg bg-slate-300"></div>
            <div className="h-6 w-full rounded-lg bg-slate-300"></div>
          </div>
          <div className="h-8 w-32 rounded-lg bg-slate-200"></div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        {/* Slot Picker Skeleton */}
        <div className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-slate-200"></div>
            <div className="h-7 w-48 rounded-lg bg-slate-200"></div>
          </div>
          
          <div className="mt-6 space-y-6">
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 flex-1 rounded-2xl bg-slate-200"></div>
              ))}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-slate-200"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          {/* Doctor Info Card */}
          <div className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
            <div className="h-4 w-32 rounded bg-slate-200 mb-4"></div>
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-200 shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="h-6 w-40 rounded bg-slate-200"></div>
                <div className="h-5 w-24 rounded bg-slate-200"></div>
              </div>
            </div>
          </div>

          {/* Clinic Card */}
          <div className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
            <div className="h-4 w-24 rounded bg-slate-200 mb-4"></div>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-200 shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="h-5 w-3/4 rounded bg-slate-200"></div>
                <div className="h-4 w-full rounded bg-slate-200"></div>
                <div className="h-4 w-1/2 rounded bg-slate-200"></div>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="rounded-[1.5rem] bg-slate-50 p-6 ring-1 ring-slate-200/60">
            <div className="h-4 w-40 rounded bg-slate-200 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded bg-slate-200"></div>
                  <div className="h-4 w-32 rounded bg-slate-200"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}