import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DoctorCard } from "@/components/doctor-card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import DoctorsSearch from "./doctors-search";

export const dynamic = "force-dynamic";

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
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

interface SearchParams {
  search?: string;
  specialty?: string;
  city?: string;
}

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("doctors")
    .select(`
      first_name,
      last_name,
      id,
      user_id,
      clinic_id,
      degree,
      speciality_id,
      bio,
      photo_url,
      avg_rating_overall,
      avg_rating_effectiveness,
      avg_rating_behavior,
      review_count,
      created_at,
      user_profiles (full_name),
      specialities (name),
      clinics (name, city)
    `)
    .eq("status", "approved");

  // Apply search filter
  if (params.search) {
    const searchTerm = params.search.toLowerCase();
    query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,specialities.name.ilike.%${searchTerm}%,clinics.name.ilike.%${searchTerm}%`);
  }

  // Apply specialty filter - filter in memory since relational filters are complex
  let allDoctors;
  if (params.specialty) {
    const { data: doctorsWithSpecialty } = await supabase
      .from("doctors")
      .select(`
        first_name,
        last_name,
        id,
        user_id,
        clinic_id,
        degree,
        speciality_id,
        bio,
        photo_url,
        avg_rating_overall,
        avg_rating_effectiveness,
        avg_rating_behavior,
        review_count,
        created_at,
        user_profiles (full_name),
        specialities (name),
        clinics (name, city)
      `)
      .eq("status", "approved")
      .eq("specialities.name", params.specialty);
    
    allDoctors = doctorsWithSpecialty || [];
  }

  let { data: doctors, error } = await query.order("avg_rating_overall", { ascending: false });

  // If specialty filter was applied, use the filtered results
  if (params.specialty && allDoctors) {
    doctors = allDoctors;
  }

  if (error) {
    console.error("Error fetching doctors:", error);
  }

  const doctorsList = (doctors || []).map((doc: any) => ({
    ...doc,
    full_name: `${doc.first_name} ${doc.last_name}`.trim() || "Unknown Doctor",
    speciality_name: doc.specialities?.[0]?.name,
    clinic_name: doc.clinics?.[0]?.name,
    clinic_city: doc.clinics?.[0]?.city,
  }));

  return (
    <div className="flex flex-col gap-10 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-6 py-16 text-white sm:px-12 md:py-20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-slate-900 to-slate-800"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-[30rem] w-[30rem] rounded-full bg-brand-500/10 blur-[80px]"></div>
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Find Your <span className="text-brand-400">Specialist</span>
          </h1>
          <p className="mt-4 text-lg text-slate-300 sm:text-xl">
            Browse verified doctors, read real patient reviews, and book an appointment that fits your schedule seamlessly.
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <DoctorsSearch />

      {/* Results Section */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Available Doctors
          </h2>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            <span className="text-slate-900 font-bold">{doctorsList.length}</span> results
          </div>
        </div>

        {/* Doctors Grid */}
        {doctorsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 py-20 px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200/50">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No doctors found</h3>
            <p className="mt-2 text-slate-500 max-w-sm">
              We couldn't find any doctors matching your criteria. Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {doctorsList.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
