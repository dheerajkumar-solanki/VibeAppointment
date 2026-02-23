import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingStars } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface DoctorDetailPageProps {
  params: { doctorId: string };
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
  const { doctorId } = params;
  const doctorIdNum = parseInt(doctorId, 10);

  if (isNaN(doctorIdNum)) {
    notFound();
  }

  const supabase = createSupabaseServerClient();

  // Fetch doctor details
  const { data: doctor, error: doctorError } = await supabase
    .from("doctors")
    .select(`
      *,
      user_profiles (full_name),
      specialities (name),
      clinics (id, name, address, city, country, timezone)
    `)
    .eq("id", doctorIdNum)
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

  const reviewsList: Review[] = (reviews || []).map((r: Review) => ({
    ...r,
    full_name: r.user_profiles?.full_name || "Anonymous",
  }));

  const doctorFull = {
    ...doctor,
    full_name: doctor.user_profiles?.full_name || "Unknown Doctor",
    speciality_name: doctor.specialities?.name,
    clinic: doctor.clinics,
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-slate-500">Doctor profile</p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Dr. {doctorFull.full_name}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          {doctorFull.speciality_name && (
            <Badge variant="info">{doctorFull.speciality_name}</Badge>
          )}
          {doctorFull.degree && <span className="text-sm text-slate-600">{doctorFull.degree}</span>}
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-[2fr,1.5fr]">
        <div className="space-y-4">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About this doctor</CardTitle>
            </CardHeader>
            <CardContent>
              {doctorFull.bio ? (
                <p className="text-sm text-slate-600">{doctorFull.bio}</p>
              ) : (
                <p className="text-sm text-slate-500">No bio available.</p>
              )}
            </CardContent>
          </Card>

          {/* Clinic Info */}
          {doctorFull.clinic && (
            <Card>
              <CardHeader>
                <CardTitle>Clinic</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-slate-900">{doctorFull.clinic.name}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {doctorFull.clinic.address}
                </p>
                <p className="text-sm text-slate-600">
                  {doctorFull.clinic.city}, {doctorFull.clinic.country}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Ratings Summary */}
          {doctorFull.review_count > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Overall</span>
                    <RatingStars rating={doctorFull.avg_rating_overall || 0} size="md" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Effectiveness</span>
                    <RatingStars rating={doctorFull.avg_rating_effectiveness || 0} size="md" showValue={false} />
                    <span className="ml-2 text-sm text-slate-600">{doctorFull.avg_rating_effectiveness?.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Behavior</span>
                    <RatingStars rating={doctorFull.avg_rating_behavior || 0} size="md" showValue={false} />
                    <span className="ml-2 text-sm text-slate-600">{doctorFull.avg_rating_behavior?.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-slate-500 pt-2 border-t">
                    Based on {doctorFull.review_count} review{doctorFull.review_count !== 1 ? "s" : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {reviewsList.length === 0 ? (
                <p className="text-sm text-slate-500">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviewsList.map((review) => (
                    <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">
                          {review.full_name.charAt(0)}*** {review.full_name.charAt(review.full_name.length - 1)}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-1">
                        <RatingStars rating={review.rating_overall} size="sm" showValue={false} />
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Sidebar */}
        <aside className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Book an appointment</h2>
              <p className="mb-4 text-xs text-slate-600">
                Choose a 30-minute slot within the doctor&apos;s clinic timings.
              </p>
              <Link href={`/appointments/new/${doctorId}`}>
                <Button className="w-full">View available slots</Button>
              </Link>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}
