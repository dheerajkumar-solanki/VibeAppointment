import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DoctorCard } from "@/components/doctor-card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

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
  clinics: { name: string; city: string } | null;
}

export default async function DoctorsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: doctors, error } = await supabase
    .from("doctors")
    .select(`
      *,
      user_profiles (full_name),
      specialities (name),
      clinics (name, city)
    `)
    .order("avg_rating_overall", { ascending: false });

  if (error) {
    console.error("Error fetching doctors:", error);
  }

  const doctorsList = (doctors || []).map((doc: Doctor) => ({
    ...doc,
    full_name: doc.user_profiles?.full_name || "Unknown Doctor",
    speciality_name: doc.specialities?.name,
    clinic_name: doc.clinics?.name,
    clinic_city: doc.clinics?.city,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Find a doctor</h1>
          <p className="mt-1 text-sm text-slate-600">
            Browse specialists and book a 30-minute appointment that fits your schedule.
          </p>
        </div>
      </div>

      {doctorsList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-500">No doctors available yet.</p>
          <p className="mt-1 text-sm text-slate-400">Check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {doctorsList.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
}
