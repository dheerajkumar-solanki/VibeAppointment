export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Better health starts with{" "}
            <span className="text-brand-600">trusted appointments.</span>
          </h1>
          <p className="text-lg text-slate-600">
            VibeAppointment connects patients with verified doctors, clear
            clinic timings, and real feedback from people who actually visited
            them.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/doctors"
              className="rounded-md bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Find a doctor
            </a>
            <a
              href="/login"
              className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-600"
            >
              Sign in to book
            </a>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-brand-600">
            Why patients love VibeAppointment
          </h2>
          <ul className="space-y-3 text-sm text-slate-700">
            <li>• Book 30-minute slots that fit your day and the doctor&apos;s calendar.</li>
            <li>• Read genuine reviews from patients who actually had an appointment.</li>
            <li>• Secure Google login—no passwords to remember.</li>
            <li>• Doctors manage their own clinic timings and blocked hours.</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">
            Effective treatment
          </h3>
          <p className="text-sm text-slate-600">
            Patients rate how effective their treatment felt so you can choose
            the right specialist with confidence.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">
            Caring behaviour
          </h3>
          <p className="text-sm text-slate-600">
            Behaviour scores highlight doctors who listen, explain, and make
            you feel comfortable.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">
            Overall experience
          </h3>
          <p className="text-sm text-slate-600">
            See an overall star rating that combines effectiveness, behaviour,
            and clinic experience.
          </p>
        </div>
      </section>
    </div>
  );
}

