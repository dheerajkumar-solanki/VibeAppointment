import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUserWithRole } from "@/lib/auth";
import { SlotPicker } from "@/components/slot-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, ShieldCheck, MapPin, User, Stethoscope } from "lucide-react";

export const dynamic = "force-dynamic";

interface NewAppointmentPageProps {
  params: Promise<{ doctorId: string }>;
}

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  clinic_id: number;
  degree: string | null;
  bio: string | null;
  photo_url: string | null;
  avg_rating_overall: number;
  review_count: number;
  user_profiles: { full_name: string } | null;
  specialities: { name: string } | null;
  clinics: { id: number; name: string; address: string; city: string } | null;
}

export default async function NewAppointmentPage({ params }: NewAppointmentPageProps) {
  const { user } = await requireUserWithRole("patient");
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
      *,
      user_profiles (full_name),
      specialities (name),
      clinics (id, name, address, city)
    `)
    .eq("id", doctorIdNum)
    .single();

  if (doctorError || !doctor) {
    notFound();
  }

  const doctorFull: Doctor = doctor as Doctor;
  const fullName = `${doctorFull.first_name} ${doctorFull.last_name}`;

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <Link 
          href={`/doctors/${doctorId}`} 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to doctor profile
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Book Appointment
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Select an available time slot to schedule your visit.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium ring-1 ring-emerald-600/20 w-fit">
            <ShieldCheck className="h-4 w-4" />
            Secure booking
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        {/* Slot Picker */}
        <div className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Calendar className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Select Date & Time</h2>
          </div>
          
          <div className="mt-2">
            <SlotPicker 
              doctorId={doctorIdNum} 
              clinicId={doctorFull.clinic_id}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Doctor Info Card */}
          <div className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">You are booking with</h3>
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-brand-50 ring-1 ring-slate-100">
                {doctorFull.photo_url ? (
                  <img
                    src={doctorFull.photo_url}
                    alt={fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50 text-xl font-bold text-brand-600">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">Dr. {fullName}</p>
                {doctorFull.specialities && (
                  <div className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
                    <Stethoscope className="h-3 w-3" />
                    {doctorFull.specialities.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Clinic Card */}
          <div className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Location</h3>
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">{doctorFull.clinics?.name}</p>
                <p className="mt-1 text-sm text-slate-600">{doctorFull.clinics?.address}</p>
                <p className="text-sm text-slate-600">{doctorFull.clinics?.city}</p>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="rounded-[1.5rem] bg-slate-50 p-6 ring-1 ring-slate-200/60">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Appointment Details</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <Clock className="h-4 w-4 text-brand-500" />
                30-minute consultation
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Free cancellation
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <User className="h-4 w-4 text-purple-500" />
                Instant confirmation
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
