import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUserWithRole } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Activity, MapPin, Clock, ArrowRight, User, Stethoscope, XCircle } from "lucide-react";
import { DismissDeclineButton } from "@/components/dismiss-decline-button";
import { CancelAppointmentButton } from "@/components/cancel-appointment-button";

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
    first_name: string;
    last_name: string;
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
        first_name,
        last_name,
        user_profiles (full_name),
        specialities (name),
        clinics (name)
      )
    `)
    .eq("patient_id", user.id)
    .in("status", ["scheduled", "confirmed"])
    .gte("start_at", now)
    .order("start_at", { ascending: true })
    .limit(5);

  // Fetch recently declined appointments that the patient hasn't dismissed
  const { data: declinedAppointments } = await supabase
    .from("appointments")
    .select(`
      *,
      doctors (
        first_name,
        last_name,
        user_profiles (full_name),
        specialities (name),
        clinics (name)
      )
    `)
    .eq("patient_id", user.id)
    .eq("status", "declined")
    .eq("patient_ack", false)
    .order("updated_at", { ascending: false })
    .limit(5);

  // Fetch all completed appointments
  const { data: pastAppointments } = await supabase
    .from("appointments")
    .select(`
      *,
      doctors (
        id,
        first_name,
        last_name,
        user_profiles (full_name),
        specialities (name),
        clinics (name)
      )
    `)
    .eq("patient_id", user.id)
    .eq("status", "completed")
    .order("start_at", { ascending: false })
    .limit(10);

  // Check which appointments have already been reviewed
  const appointmentIds = (pastAppointments || []).map((a: Appointment) => a.id);
  const { data: existingReviews } = appointmentIds.length > 0
    ? await supabase
        .from("reviews")
        .select("appointment_id")
        .eq("patient_id", user.id)
        .in("appointment_id", appointmentIds)
    : { data: [] };

  const reviewedAppointmentIds = new Set(
    existingReviews?.map(r => r.appointment_id) || []
  );

  const appointmentsWithReview = (pastAppointments || []).map((apt: Appointment) => {
    const doctor = apt.doctors as { id: number; first_name: string; last_name: string } | null;
    return {
      ...apt,
      doctor_name: doctor ? `${doctor.first_name} ${doctor.last_name}` : "Unknown",
      doctor_id: doctor?.id || apt.doctor_id,
      can_review: !reviewedAppointmentIds.has(apt.id),
    };
  });

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Welcome Header */}
      <header className="relative overflow-hidden rounded-[2rem] bg-slate-900 px-8 py-12 text-white shadow-xl sm:px-12 sm:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome back, {profile?.full_name?.split(' ')[0] || "Patient"}! 👋
            </h1>
            <p className="text-lg text-brand-100 max-w-xl">
              Manage your upcoming appointments, view your health history, and leave feedback for your doctors.
            </p>
          </div>
          
          <Link
            href="/register"
            className="group inline-flex w-fit items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md ring-1 ring-white/20 transition-all hover:bg-white/20 hover:scale-105"
          >
            <Stethoscope className="h-4 w-4" />
            <span>Are you a doctor? Register</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </header>

      {/* Declined Appointments */}
      {declinedAppointments && declinedAppointments.length > 0 && (
        <section className="rounded-[1.5rem] bg-red-50/50 ring-1 ring-red-200/60 p-6 sm:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Declined Appointments</h2>
              <p className="text-xs text-slate-500">These appointments were declined by the doctor. You can book a different time slot.</p>
            </div>
          </div>
          <div className="space-y-3">
            {(declinedAppointments as Appointment[]).map((apt) => (
              <div
                key={apt.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-red-200 bg-white p-4"
              >
                <div className="flex gap-3 items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      Dr. {apt.doctors?.first_name} {apt.doctors?.last_name}
                    </p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {new Date(apt.start_at).toLocaleString(undefined, {
                        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="error" className="w-fit">Declined</Badge>
                  <Link href={`/appointments/new/${apt.doctor_id}`}>
                    <Button size="sm" variant="outline" className="rounded-full text-xs">
                      Rebook
                    </Button>
                  </Link>
                  <DismissDeclineButton appointmentId={apt.id} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-8 md:grid-cols-2">
        {/* Upcoming Appointments */}
        <div className="flex flex-col rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-100 p-6 sm:px-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Calendar className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Upcoming Appointments</h2>
          </div>
          
          <div className="flex-1 p-6 sm:px-8 bg-slate-50/30">
            {!upcomingAppointments || upcomingAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <Calendar className="h-8 w-8 text-slate-400" />
                </div>
                <p className="font-medium text-slate-900">No upcoming appointments</p>
                <p className="mt-1 text-sm text-slate-500 max-w-xs mb-6">
                  You don't have any appointments scheduled right now.
                </p>
                <Link href="/doctors">
                  <Button className="rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20 px-6">
                    Find a Doctor
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {(upcomingAppointments as Appointment[]).map((apt) => (
                  <div
                    key={apt.id}
                    className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-brand-300 hover:shadow-md hover:shadow-brand-500/5"
                  >
                    <div className="flex gap-4 items-start sm:items-center">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                          Dr. {apt.doctors?.first_name} {apt.doctors?.last_name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(apt.start_at).toLocaleString(undefined, {
                              weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            <span className="truncate max-w-[120px]">{apt.doctors?.clinics?.name || "Clinic"}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={apt.status === "confirmed" ? "success" : "info"}
                        className="w-fit capitalize"
                      >
                        {apt.status === "scheduled" ? "Awaiting Confirmation" : "Confirmed"}
                      </Badge>
                      <CancelAppointmentButton appointmentId={apt.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visits & Reviews */}
        <div className="flex flex-col rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-100 p-6 sm:px-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Activity className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Recent Visits & Reviews</h2>
          </div>
          
          <div className="flex-1 p-6 sm:px-8 bg-slate-50/30">
            {appointmentsWithReview.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="font-medium text-slate-900">No recent visits</p>
                <p className="mt-1 text-sm text-slate-500 max-w-xs">
                  Your completed appointments will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointmentsWithReview.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:shadow-sm"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          Dr. {apt.doctor_name}
                        </p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                          Visited on {new Date(apt.start_at).toLocaleDateString(undefined, {
                            month: 'long', day: 'numeric', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    {apt.can_review ? (
                      <Link href={`/reviews/${apt.doctor_id}/new?appointmentId=${apt.id}`}>
                        <Button size="sm" className="w-full sm:w-auto rounded-full bg-slate-900 text-white hover:bg-slate-800">
                          Leave Review
                        </Button>
                      </Link>
                    ) : (
                      <Badge variant="success" className="w-fit">Reviewed</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
