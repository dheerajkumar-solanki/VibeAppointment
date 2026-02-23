import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUserWithRole } from "@/lib/auth";
import { SlotPicker } from "@/components/slot-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface NewAppointmentPageProps {
  params: { doctorId: string };
}

interface Doctor {
  id: number;
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
      clinics (id, name, address, city)
    `)
    .eq("id", doctorIdNum)
    .single();

  if (doctorError || !doctor) {
    notFound();
  }

  const doctorFull: Doctor = doctor as Doctor;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link href={`/doctors/${doctorId}`} className="text-sm text-brand-600 hover:underline">
          ← Back to doctor profile
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">
          Book a 30-minute appointment
        </h1>
        <p className="text-sm text-slate-600">
          Select a date and choose an available 30-minute slot.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        {/* Slot Picker */}
        <Card>
          <CardHeader>
            <CardTitle>Select Your Slot</CardTitle>
          </CardHeader>
          <CardContent>
            <SlotPicker 
              doctorId={doctorIdNum} 
              clinicId={doctorFull.clinic_id}
            />
          </CardContent>
        </Card>

        {/* Doctor Info Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-900">Doctor</h3>
              <p className="mt-1 text-slate-600">Dr. {doctorFull.user_profiles?.full_name}</p>
              {doctorFull.specialities && (
                <Badge variant="info" className="mt-2">
                  {doctorFull.specialities.name}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-900">Clinic</h3>
              <p className="mt-1 text-slate-600">{doctorFull.clinics?.name}</p>
              <p className="text-sm text-slate-500">
                {doctorFull.clinics?.address}
              </p>
              <p className="text-sm text-slate-500">
                {doctorFull.clinics?.city}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-900">Appointment Details</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>• Duration: 30 minutes</li>
                <li>• Free cancellation</li>
                <li>• Confirmation via email</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
