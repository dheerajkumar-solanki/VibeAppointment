export default function DoctorsLoading() {
  return (
    <div className="flex flex-col gap-10 pb-16">
      {/* Hero Section Skeleton */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-200 px-6 py-16 sm:px-12 md:py-20 animate-pulse">
        <div className="relative z-10 max-w-2xl">
          <div className="h-12 w-3/4 rounded-lg bg-slate-300 mb-4"></div>
          <div className="h-6 w-full rounded-lg bg-slate-300"></div>
          <div className="h-6 w-5/6 rounded-lg bg-slate-300 mt-2"></div>
        </div>
      </section>

      {/* Search and Filters Skeleton */}
      <div className="flex flex-col md:flex-row gap-4 animate-pulse">
        <div className="h-14 flex-1 rounded-2xl bg-slate-200"></div>
        <div className="h-14 w-full md:w-64 rounded-2xl bg-slate-200"></div>
        <div className="h-14 w-full md:w-48 rounded-2xl bg-slate-200"></div>
      </div>

      {/* Results Section Skeleton */}
      <section>
        <div className="mb-6 flex items-center justify-between animate-pulse">
          <div className="h-8 w-48 rounded-lg bg-slate-200"></div>
          <div className="h-8 w-24 rounded-full bg-slate-200"></div>
        </div>

        {/* Doctors Grid Skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[380px] rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm animate-pulse flex flex-col">
              <div className="flex gap-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-2xl bg-slate-200"></div>
                <div className="flex flex-1 flex-col justify-center gap-2">
                  <div className="h-5 w-3/4 rounded bg-slate-200"></div>
                  <div className="h-4 w-1/2 rounded bg-slate-200"></div>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <div className="h-6 w-1/3 rounded-lg bg-slate-200"></div>
                <div className="h-5 w-2/3 rounded bg-slate-200"></div>
              </div>
              <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="h-5 w-24 rounded bg-slate-200"></div>
                <div className="h-8 w-8 rounded-full bg-slate-200"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}