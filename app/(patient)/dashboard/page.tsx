import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUserWithRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface Appointment {
  id: number;
  doctor_id: number;
  patient_id: string;
  clinic_id: number;
  start_at: string;
  end_at: string;
  status: string;
  created_at: string;
  doctors: {
    user_profiles: { full_name: string } | null;
    specialities: { name: string } | null;
    clinics: { name: string } | null;
  } | null;
}

export default async function PatientDashboardPage() {
  const { user, profile } = await requireUserWithRole("patient");

  const supabase = await createSupabaseServerClient();

  // Fetch upcoming appointments
  const now = new Date().toISOString();
  const { data: upcomingAppointments } = await supabase
    .from("appointments")
    .select(`
      *,
      doctors (
        user_profiles (full_name),
        specialities (name),
        clinics (name)
      )
    `)
    .eq("patient_id", user.id)
    .eq("status", "scheduled")
    .gte("start_at", now)
    .order("start_at", { ascending: true })
    .limit(5);

  // Fetch past appointments (completed within last month - eligible for review)
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  const { data: pastAppointments } = await supabase
    .from("appointments")
    .select(`
      *,
      doctors (
        id,
        user_profiles (full_name),
        specialities (name),
        clinics (name)
      )
    `)
    .eq("patient_id", user.id)
    .eq("status", "completed")
    .gte("start_at", oneMonthAgo.toISOString())
    .order("start_at", { ascending: false })
    .limit(5);

  // Check which doctors have been reviewed this month
  const { data: existingReviews } = await supabase
    .from("reviews")
    .select("doctor_id, created_at")
    .eq("patient_id", user.id);

  const reviewedDoctorIds = new Set(
    existingReviews?.map(r => r.doctor_id) || []
  );

  const appointmentsWithReview = (pastAppointments || []).map((apt: Appointment) => {
    const doctor = apt.doctors as { id: number; user_profiles: { full_name: string } } | null;
    return {
      ...apt,
      doctor_name: doctor?.user_profiles?.full_name || "Unknown",
      doctor_id: doctor?.id || apt.doctor_id,
      can_review: !reviewedDoctorIds.has(apt.doctor_id),
    };
  });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back, {profile?.full_name || "Patient"}!
        </h1>
        <p className="text-sm text-slate-600">
          View upcoming appointments, past visits, and leave feedback for doctors you&apos;ve seen.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {!upcomingAppointments || upcomingAppointments.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-slate-500">No upcoming appointments.</p>
                <Link href="/doctors">
                  <Button variant="outline" size="sm" className="mt-3">
                    Find a doctor
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {(upcomingAppointments as Appointment[]).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        Dr. {apt.doctors?.user_profiles?.full_name || "Unknown"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {apt.doctors?.clinics?.name || "Clinic"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(apt.start_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="info">Scheduled</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visits & Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Visits & Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentsWithReview.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                No recent visits in the last month.
              </p>
            ) : (
              <div className="space-y-3">
                {appointmentsWithReview.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        Dr. {apt.doctor_name}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(apt.start_at).toLocaleDateString()}
                      </p>
                    </div>
                    {apt.can_review ? (
                      <Link href={`/reviews/${apt.doctor_id}/new?appointmentId=${apt.id}`}>
                        <Button size="sm" variant="outline">
                          Leave Review
                        </Button>
                      </Link>
                    ) : (
                      <Badge variant="success">Reviewed</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
