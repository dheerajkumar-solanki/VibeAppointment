import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingStars } from "@/components/ui/rating";
import { ArrowLeft, MapPin, Stethoscope, GraduationCap, Calendar, Star, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface DoctorDetailPageProps {
  params: Promise<{ doctorId: string }>;
}

interface Doctor {
  id: number;
  user_id: string;
  clinic_id: number;
  degree: string | null;
  speciality_id: number | null;
  bio: string | null;
  photo_url: string | null;
  avg_rating_overall: number;
  avg_rating_effectiveness: number;
  avg_rating_behavior: number;
  review_count: number;
  created_at: string;
  first_name: string;
  last_name: string;
  user_profiles: { full_name: string } | null;
  specialities: { name: string } | null;
  clinics: { id: number; name: string; address: string; city: string; country: string; timezone: string } | null;
}

interface Review {
  id: number;
  rating_overall: number;
  rating_effectiveness: number;
  rating_behavior: number;
  comment: string | null;
  created_at: string;
  patient_id: string;
  user_profiles: { full_name: string } | null;
}

export default async function DoctorDetailPage({ params }: DoctorDetailPageProps) {
  const { doctorId } = await params;
  const doctorIdNum = parseInt(doctorId, 10);

  if (isNaN(doctorIdNum)) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();

  // Fetch doctor details
  const { data: doctor, error: doctorError } = await supabase
    .from("doctors")
    .select(`
      first_name,
      last_name,
      degree,
      bio,
      photo_url,
      avg_rating_overall,
      avg_rating_effectiveness,
      avg_rating_behavior,
      review_count,
      user_profiles (full_name),
      specialities (name),
      clinics (id, name, address, city, country, timezone)
    `)
    .eq("id", doctorIdNum)
    .eq("status", "approved")
    .single();

  if (doctorError || !doctor) {
    notFound();
  }

  // Fetch reviews for this doctor
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      user_profiles (full_name)
    `)
    .eq("doctor_id", doctorIdNum)
    .order("created_at", { ascending: false })
    .limit(10);

  const reviewsList = ((reviews || []) as (Review & { full_name: string })[]).map((r) => ({
    ...r,
    full_name: r.user_profiles?.full_name || "Anonymous",
  }));

  const doctorFull = {
    ...doctor,
    full_name: `${doctor.first_name} ${doctor.last_name}`.trim() || "Unknown Doctor",
    speciality_name: doctor.specialities?.[0]?.name,
    clinic: doctor.clinics?.[0],
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Back Button */}
      <div>
        <Link 
          href="/doctors" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Doctors
        </Link>
      </div>

      {/* Hero Profile Section */}
      <section className="relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60 sm:p-10">
        <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-brand-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/2 rounded-full bg-blue-50 blur-3xl"></div>
        
        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-[1.5rem] bg-brand-50 ring-4 ring-white shadow-lg sm:h-40 sm:w-40">
            {doctorFull.photo_url ? (
              <img
                src={doctorFull.photo_url}
                alt={doctorFull.full_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50 text-4xl font-bold text-brand-600">
                {(doctorFull.full_name?.charAt(0) || "D").toUpperCase()}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  Dr. {doctorFull.full_name}
                </h1>
                <CheckCircle2 className="h-6 w-6 text-brand-500" />
              </div>
              
              <div className="mt-4 flex flex-wrap gap-3">
                {doctorFull.speciality_name && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 ring-1 ring-inset ring-brand-600/10">
                    <Stethoscope className="h-4 w-4" />
                    {doctorFull.speciality_name}
                  </div>
                )}
                {doctorFull.degree && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                    <GraduationCap className="h-4 w-4 text-slate-500" />
                    {doctorFull.degree}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-50 text-yellow-500">
                  <Star className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">{doctorFull.avg_rating_overall.toFixed(1)}</div>
                  <div className="text-xs text-slate-500">{doctorFull.review_count} Reviews</div>
                </div>
              </div>
              
              <div className="h-10 w-px bg-slate-200"></div>
              
              {doctorFull.clinic && (
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 truncate max-w-[150px] sm:max-w-xs">{doctorFull.clinic.name}</div>
                    <div className="text-xs text-slate-500">{doctorFull.clinic.city}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-8">
          {/* About */}
          <div className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">About</h2>
            {doctorFull.bio ? (
              <p className="text-base leading-relaxed text-slate-600">{doctorFull.bio}</p>
            ) : (
              <p className="text-base text-slate-500 italic">No bio available yet.</p>
            )}
          </div>

          {/* Clinic Information */}
          {doctorFull.clinic && (
            <div className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Clinic Details</h2>
              <div className="flex gap-4">
                <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{doctorFull.clinic.name}</h3>
                  <p className="mt-1 text-slate-600">{doctorFull.clinic.address}</p>
                  <p className="text-slate-600">{doctorFull.clinic.city}, {doctorFull.clinic.country}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Patient Reviews</h2>
              {doctorFull.review_count > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-bold text-slate-900">{doctorFull.avg_rating_overall.toFixed(1)}</span>
                  <span className="text-sm text-slate-500">({doctorFull.review_count})</span>
                </div>
              )}
            </div>
            
            {reviewsList.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">No reviews yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviewsList.map((review) => (
                  <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600">
                          {review.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {review.full_name.charAt(0)}*** {review.full_name.charAt(review.full_name.length - 1)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <RatingStars rating={review.rating_overall} size="sm" showValue={false} />
                    </div>
                    {review.comment && (
                      <p className="mt-4 text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">"{review.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-24 rounded-[1.5rem] bg-white p-6 shadow-xl shadow-slate-200/40 ring-1 ring-slate-200/60 border-t-4 border-brand-500">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Book Appointment</h2>
              <p className="mt-2 text-sm text-slate-500">Select a time that works best for you. Instant confirmation.</p>
            </div>
            
            <Link href={`/appointments/new/${doctorId}`} className="block">
              <button className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-500 px-4 py-4 text-base font-bold text-white transition-all hover:bg-brand-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
                <Calendar className="h-5 w-5" />
                <span>View Availability</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
              </button>
            </Link>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Free booking & cancellation</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
