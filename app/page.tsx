import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ArrowRight, Star, Shield, Calendar, Users, CheckCircle2, Activity } from "lucide-react";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-6 py-20 text-white sm:px-12 sm:py-28 lg:px-20 lg:py-32 shadow-2xl">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-slate-900 to-slate-800"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-[40rem] w-[40rem] rounded-full bg-brand-500/10 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-[40rem] w-[40rem] rounded-full bg-purple-500/10 blur-[100px]"></div>
        
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="max-w-2xl space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-brand-400"></span>
                <span className="text-slate-200">Over 10,000+ appointments booked</span>
              </div>
              
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl xl:text-7xl leading-[1.1]">
                Modern healthcare, <br />
                <span className="bg-gradient-to-r from-brand-400 to-cyan-300 bg-clip-text text-transparent">
                  simplified.
                </span>
              </h1>
              
              <p className="text-lg leading-relaxed text-slate-300 sm:text-xl">
                Skip the waiting room. Connect with top-rated, verified doctors and book your next appointment instantly. Real care, right when you need it.
              </p>
              
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center pt-4">
                <Link
                  href="/doctors"
                  className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-brand-500 px-8 font-semibold text-white transition-all hover:bg-brand-400 hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  Find a Doctor
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                {!user && (
                  <Link
                    href="/login"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-8 font-semibold text-white backdrop-blur-md transition-all hover:bg-slate-700 hover:text-white"
                  >
                    Sign In
                  </Link>
                )}
              </div>

              <div className="pt-8 flex items-center gap-6 text-sm text-slate-400 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-brand-400" />
                  <span>Verified Doctors</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-brand-400" />
                  <span>Instant Booking</span>
                </div>
              </div>
            </div>

            {/* Hero Visual/Cards */}
            <div className="hidden lg:block relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[120%] w-[120%] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]"></div>
              
              <div className="relative space-y-6">
                {/* Floating Card 1 */}
                <div className="ml-auto w-80 translate-x-12 transform rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl shadow-2xl transition-transform hover:-translate-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Available Today</p>
                      <p className="text-sm text-slate-300">Dr. Sarah Jenkins • 2:30 PM</p>
                    </div>
                  </div>
                </div>

                {/* Floating Card 2 */}
                <div className="w-80 -translate-x-4 transform rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl shadow-2xl transition-transform hover:-translate-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Top Rated</p>
                      <p className="text-sm text-slate-300">4.9/5 from 500+ reviews</p>
                    </div>
                  </div>
                </div>

                {/* Floating Card 3 */}
                <div className="mx-auto w-80 translate-x-8 transform rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl shadow-2xl transition-transform hover:-translate-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Verified Secure</p>
                      <p className="text-sm text-slate-300">HIPAA Compliant Platform</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Why patients choose us
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            We've completely reimagined the healthcare booking experience to be seamless, transparent, and built around you.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="absolute right-0 top-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-brand-50 opacity-50 transition-transform group-hover:scale-150"></div>
            <div className="relative">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 ring-4 ring-white">
                <Activity className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                Instant Scheduling
              </h3>
              <p className="text-slate-600 leading-relaxed">
                No more waiting on hold. Browse real-time availability and book your 30-minute slot instantly, 24/7.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="absolute right-0 top-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-50 opacity-50 transition-transform group-hover:scale-150"></div>
            <div className="relative">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 ring-4 ring-white">
                <Star className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                Genuine Reviews
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Make confident decisions. Read verified reviews from real patients who actually completed their appointments.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="absolute right-0 top-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-purple-50 opacity-50 transition-transform group-hover:scale-150"></div>
            <div className="relative">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 ring-4 ring-white">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                Verified Experts
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Every doctor on our platform is thoroughly vetted. You get access to only the highest quality healthcare professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="rounded-[2.5rem] bg-slate-100 py-20 px-6 sm:px-12 lg:px-20 mx-4 sm:mx-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Three steps to better health
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              We've made it incredibly easy to get the care you need.
            </p>
          </div>
          
          <div className="grid gap-12 md:grid-cols-3 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-slate-200 via-brand-200 to-slate-200"></div>
            
            <div className="relative text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl shadow-brand-500/10 ring-1 ring-slate-200">
                <Users className="h-10 w-10 text-brand-500" />
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">1</div>
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Find a Doctor</h3>
              <p className="text-slate-600 leading-relaxed px-4">
                Search by specialty or name and view detailed profiles with real patient reviews.
              </p>
            </div>
            
            <div className="relative text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl shadow-brand-500/10 ring-1 ring-slate-200">
                <Calendar className="h-10 w-10 text-brand-500" />
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">2</div>
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Book Time</h3>
              <p className="text-slate-600 leading-relaxed px-4">
                Pick a 30-minute slot that fits your schedule. Get instant confirmation.
              </p>
            </div>
            
            <div className="relative text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl shadow-brand-500/10 ring-1 ring-slate-200">
                <Activity className="h-10 w-10 text-brand-500" />
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">3</div>
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Get Care</h3>
              <p className="text-slate-600 leading-relaxed px-4">
                Show up for your appointment, get treated, and leave a review to help others.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-4xl text-center px-4 mb-8">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-brand-600 to-brand-800 p-10 sm:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl mb-6">
              Ready to take control of your health?
            </h2>
            <p className="text-lg text-brand-100 mb-10 max-w-2xl mx-auto">
              Join thousands of patients who trust VibeAppointment for their healthcare needs. Finding a great doctor has never been easier.
            </p>
            <Link
              href="/doctors"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-8 font-bold text-brand-600 transition-all hover:bg-slate-50 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-700"
            >
              Browse Doctors Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
