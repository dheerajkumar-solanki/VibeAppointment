import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUserWithRole } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/ui/rating";
import { Calendar, CalendarDays, Star, Users, Clock, ArrowRight, Settings, Coffee, ChevronRight, AlertTriangle } from "lucide-react";

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
  user_profiles: { full_name: string } | null;
}

export default async function DoctorDashboardPage() {
  const { user, profile } = await requireUserWithRole("doctor");

  const supabase = await createSupabaseServerClient();

  // Get doctor profile
  const { data: doctor } = await supabase
    .from("doctors")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Get today's appointments
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

  const { data: todayAppointmentsRaw } = await supabase
    .from("appointments")
    .select("*")
    .eq("doctor_id", doctor?.id)
    .gte("start_at", startOfDay)
    .lte("start_at", endOfDay)
    .order("start_at", { ascending: true });

  // Get patient names for today's appointments
  const patientIds = todayAppointmentsRaw?.map(apt => apt.patient_id).filter(Boolean) || [];
  const { data: patientProfiles } = await supabase
    .from("user_profiles")
    .select("id, full_name")
    .in("id", patientIds);
  
  const profileMap = new Map(patientProfiles?.map(p => [p.id, p]) || []);
  const todayAppointments = todayAppointmentsRaw?.map(apt => ({
    ...apt,
    user_profiles: profileMap.get(apt.patient_id) || null
  })) || [];

  // Get upcoming appointments (next 7 days)
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const { data: upcomingAppointmentsRaw } = await supabase
    .from("appointments")
    .select("*")
    .eq("doctor_id", doctor?.id)
    .eq("status", "scheduled")
    .gte("start_at", today.toISOString())
    .lt("start_at", nextWeek.toISOString())
    .order("start_at", { ascending: true })
    .limit(10);

  // Get patient names for upcoming appointments
  const upcomingPatientIds = upcomingAppointmentsRaw?.map(apt => apt.patient_id).filter(Boolean) || [];
  const { data: upcomingPatientProfiles } = await supabase
    .from("user_profiles")
    .select("id, full_name")
    .in("id", upcomingPatientIds);
  
  const upcomingProfileMap = new Map(upcomingPatientProfiles?.map(p => [p.id, p]) || []);
  const upcomingAppointments = upcomingAppointmentsRaw?.map(apt => ({
    ...apt,
    user_profiles: upcomingProfileMap.get(apt.patient_id) || null
  })) || [];

  // Get recent reviews
  const { data: reviewsRaw } = await supabase
    .from("reviews")
    .select("*")
    .eq("doctor_id", doctor?.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Get patient names for reviews
  const reviewerIds = reviewsRaw?.map(r => r.patient_id).filter(Boolean) || [];
  const { data: reviewerProfiles } = await supabase
    .from("user_profiles")
    .select("id, full_name")
    .in("id", reviewerIds);
  
  const reviewerProfileMap = new Map(reviewerProfiles?.map(p => [p.id, p]) || []);
  const recentReviews = reviewsRaw?.map(r => ({
    ...r,
    user_profiles: reviewerProfileMap.get(r.patient_id) || null
  })) || [];

  if (!doctor) {
    return (
      <div className="flex flex-col gap-8">
        <header className="relative overflow-hidden rounded-[2rem] bg-slate-900 px-8 py-12 text-white shadow-xl">
          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome to VibeAppointment!</h1>
            <p className="text-slate-300">Let's get your clinic set up.</p>
          </div>
        </header>
        <div className="rounded-[1.5rem] bg-white p-8 shadow-sm ring-1 ring-slate-200/60 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <Settings className="h-8 w-8 text-brand-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Complete Your Profile</h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">Please complete your doctor profile, including your clinic details and bio, to start receiving appointments.</p>
          <Link href="/settings/profile">
            <Button className="rounded-full bg-brand-500 hover:bg-brand-600 text-white px-8 shadow-lg shadow-brand-500/20">
              Set Up Profile Now
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const todayCount = todayAppointments?.length || 0;
  const upcomingCount = upcomingAppointments?.length || 0;
  const isPending = doctor?.status === "pending";

  return (
    <div className="flex flex-col gap-8 pb-12">
      {isPending && (
        <div className="flex items-start gap-3 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-6 py-5 shadow-sm">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
          <div>
            <p className="font-bold text-amber-900">Profile Pending Approval</p>
            <p className="mt-1 text-sm text-amber-700">
              Your profile changes are being reviewed by an admin. You won't appear in public doctor listings until approved.
            </p>
          </div>
        </div>
      )}

      <header className="relative overflow-hidden rounded-[2rem] bg-slate-900 px-8 py-12 text-white shadow-xl sm:px-12 sm:py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] opacity-40"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-brand-600 via-slate-900 to-slate-900 opacity-90"></div>
        
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Welcome back, Dr. {doctor?.first_name || ""} {doctor?.last_name || ""}
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            Here is your practice overview. You have <span className="font-bold text-white">{todayCount} appointments</span> scheduled for today.
          </p>
        </div>
      </header>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/settings/availability" className="group flex items-center gap-4 rounded-[1rem] bg-white p-4 shadow-sm ring-1 ring-slate-200/60 transition-all hover:ring-brand-500 hover:shadow-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-900">Availability</p>
            <p className="text-xs font-medium text-slate-500">Manage your schedule</p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-brand-500" />
        </Link>
        
        <Link href="/settings/time-off" className="group flex items-center gap-4 rounded-[1rem] bg-white p-4 shadow-sm ring-1 ring-slate-200/60 transition-all hover:ring-orange-500 hover:shadow-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors">
            <Coffee className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-900">Time Off</p>
            <p className="text-xs font-medium text-slate-500">Set vacation days</p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-orange-500" />
        </Link>

        <Link href="/settings/profile" className="group flex items-center gap-4 rounded-[1rem] bg-white p-4 shadow-sm ring-1 ring-slate-200/60 transition-all hover:ring-purple-500 hover:shadow-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
            <Settings className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-900">Edit Profile</p>
            <p className="text-xs font-medium text-slate-500">Update details</p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-purple-500" />
        </Link>
      </section>

      {/* Stats */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60 flex items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Today</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{todayCount}</p>
          </div>
        </div>
        
        <div className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60 flex items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CalendarDays className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Upcoming (7d)</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{upcomingCount}</p>
          </div>
        </div>
        
        <div className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Overall Rating</p>
            <div className="flex items-center gap-1 rounded-md bg-yellow-50 px-2 py-1 text-xs font-bold text-yellow-700">
              <Star className="h-3.5 w-3.5 fill-current" />
              {doctor.avg_rating_overall?.toFixed(1) || "0.0"}
            </div>
          </div>
          <RatingStars rating={doctor.avg_rating_overall || 0} size="md" />
          <p className="text-xs font-medium text-slate-400 mt-2">Based on {doctor.review_count} reviews</p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[2fr,1.5fr]">
        <div className="space-y-8">
          {/* Today's Schedule */}
          <div className="flex flex-col rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Clock className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Today's Schedule</h2>
              </div>
              <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200">{todayCount} Total</Badge>
            </div>
            
            <div className="p-6 sm:px-8 bg-slate-50/30">
              {!todayAppointments || todayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="font-medium text-slate-900">No appointments today</p>
                  <p className="text-sm text-slate-500 mt-1">Enjoy your free time or manage your settings.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(todayAppointments as Appointment[]).map((apt) => (
                    <div
                      key={apt.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
                          {apt.user_profiles?.full_name?.charAt(0) || "P"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {apt.user_profiles?.full_name || "Patient"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <p className="text-xs font-medium text-slate-500">
                              {new Date(apt.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                              {new Date(apt.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Badge variant={apt.status === "completed" ? "success" : "info"} className="w-fit">
                        {apt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming */}
          <div className="flex flex-col rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 p-6 sm:px-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CalendarDays className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Upcoming (Next 7 Days)</h2>
            </div>
            
            <div className="p-6 sm:px-8 bg-slate-50/30">
              {!upcomingAppointments || upcomingAppointments.length === 0 ? (
                <div className="text-center py-6">
                  <p className="font-medium text-slate-900">No upcoming appointments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(upcomingAppointments as Appointment[]).slice(0, 5).map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:shadow-sm"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          {apt.user_profiles?.full_name || "Patient"}
                        </p>
                        <p className="text-xs font-medium text-slate-500 mt-1">
                          {new Date(apt.start_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at{" "}
                          {new Date(apt.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <Badge variant="info" className="bg-brand-50 text-brand-700 hover:bg-brand-100 border-none">Scheduled</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Reviews Sidebar */}
        <div className="space-y-8">
          <div className="rounded-[1.5rem] bg-white p-6 sm:p-8 shadow-sm ring-1 ring-slate-200/60">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                <Star className="h-5 w-5 fill-current" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Patient Feedback</h2>
            </div>
            
            {!recentReviews || recentReviews.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                <p className="text-slate-500 font-medium">No reviews yet</p>
                <p className="text-xs text-slate-400 mt-1">Patients can leave reviews after appointments.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {recentReviews.map((review: any) => (
                  <div key={review.id} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {review.user_profiles?.full_name?.charAt(0) || "P"}*** 
                      </span>
                      <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                        {new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <RatingStars rating={review.rating_overall} size="sm" showValue={false} />
                    {review.comment && (
                      <p className="mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">"{review.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
