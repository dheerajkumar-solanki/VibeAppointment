export default function AdminDashboardLoading() {
  return (
    <div className="flex flex-col gap-8 pb-12 max-w-7xl mx-auto animate-pulse">
      {/* Header */}
      <header className="rounded-[2rem] bg-slate-200 px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-300"></div>
            <div className="space-y-2">
              <div className="h-8 w-64 rounded-lg bg-slate-300"></div>
              <div className="h-5 w-80 rounded-lg bg-slate-300"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60 flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-slate-200 shrink-0"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 rounded bg-slate-200"></div>
              <div className="h-8 w-12 rounded bg-slate-200"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Pending Applications */}
        <section className="flex flex-col rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-6 sm:px-8 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-200"></div>
              <div className="h-7 w-48 rounded-lg bg-slate-200"></div>
            </div>
          </div>
          
          <div className="flex-1 p-6 sm:px-8 space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-48 rounded bg-slate-200"></div>
                    <div className="h-6 w-24 rounded bg-slate-200"></div>
                  </div>
                  <div className="h-4 w-32 rounded bg-slate-200 mt-2"></div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-3 w-16 rounded bg-slate-200"></div>
                      <div className="h-5 w-32 rounded bg-slate-200"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-20 rounded bg-slate-200"></div>
                      <div className="h-5 w-24 rounded bg-slate-200"></div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <div className="h-10 flex-1 rounded-md bg-slate-200"></div>
                    <div className="h-10 flex-1 rounded-md bg-slate-200"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* All Doctors */}
        <section className="flex flex-col rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden h-fit">
          <div className="flex items-center gap-3 border-b border-slate-100 p-6 sm:px-8 bg-slate-50/50">
            <div className="h-10 w-10 rounded-xl bg-slate-200"></div>
            <div className="h-7 w-40 rounded-lg bg-slate-200"></div>
          </div>
          
          <div className="p-0 overflow-x-auto">
            <div className="w-full">
              <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-4 flex gap-4">
                <div className="h-4 w-1/3 rounded bg-slate-200"></div>
                <div className="h-4 w-1/3 rounded bg-slate-200"></div>
                <div className="h-4 w-1/4 rounded bg-slate-200"></div>
              </div>
              <div className="divide-y divide-slate-100">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-3/4 rounded bg-slate-200"></div>
                      <div className="h-4 w-1/2 rounded bg-slate-200"></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-5 w-2/3 rounded bg-slate-200"></div>
                    </div>
                    <div className="w-1/4">
                      <div className="h-6 w-20 rounded bg-slate-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}