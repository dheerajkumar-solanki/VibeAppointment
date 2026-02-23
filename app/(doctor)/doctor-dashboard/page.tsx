import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUserWithRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/ui/rating";

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

  const { data: todayAppointments } = await supabase
    .from("appointments")
    .select(`
      *,
      user_profiles (full_name)
    `)
    .eq("doctor_id", doctor?.id)
    .gte("start_at", startOfDay)
    .lte("start_at", endOfDay)
    .order("start_at", { ascending: true });

  // Get upcoming appointments (next 7 days)
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const { data: upcomingAppointments } = await supabase
    .from("appointments")
    .select(`
      *,
      user_profiles (full_name)
    `)
    .eq("doctor_id", doctor?.id)
    .eq("status", "scheduled")
    .gte("start_at", today.toISOString())
    .lt("start_at", nextWeek.toISOString())
    .order("start_at", { ascending: true })
    .limit(10);

  // Get recent reviews
  const { data: recentReviews } = await supabase
    .from("reviews")
    .select(`
      *,
      user_profiles (full_name)
    `)
    .eq("doctor_id", doctor?.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (!doctor) {
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Welcome!</h1>
        </header>
        <Card>
          <CardContent className="p-6">
            <p className="text-slate-600">Please complete your doctor profile to get started.</p>
            <Link href="/settings/profile">
              <Button className="mt-4">Set Up Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const todayCount = todayAppointments?.length || 0;
  const upcomingCount = upcomingAppointments?.length || 0;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back, Dr. {profile?.full_name || ""}!
        </h1>
        <p className="text-sm text-slate-600">
          See your upcoming appointments, manage your calendar, and understand how patients feel about their visits.
        </p>
      </header>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-600">Today&apos;s Appointments</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{todayCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-600">Upcoming (next 7 days)</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{upcomingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-600">Overall Rating</p>
            <div className="mt-1">
              <RatingStars rating={doctor.avg_rating_overall || 0} size="md" />
            </div>
            <p className="text-xs text-slate-500 mt-1">{doctor.review_count} reviews</p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {!todayAppointments || todayAppointments.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No appointments today.</p>
            ) : (
              <div className="space-y-3">
                {(todayAppointments as Appointment[]).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {apt.user_profiles?.full_name || "Patient"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(apt.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(apt.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Badge variant={apt.status === "completed" ? "success" : "info"}>
                      {apt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {!upcomingAppointments || upcomingAppointments.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No upcoming appointments.</p>
            ) : (
              <div className="space-y-3">
                {(upcomingAppointments as Appointment[]).slice(0, 5).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {apt.user_profiles?.full_name || "Patient"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(apt.start_at).toLocaleDateString()} at{" "}
                        {new Date(apt.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Badge variant="info">Scheduled</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Patient Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {!recentReviews || recentReviews.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {recentReviews.map((review: any) => (
                <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">
                      {review.user_profiles?.full_name?.charAt(0) || "P"}*** 
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

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href="/settings/availability">
          <Button variant="outline">Manage Availability</Button>
        </Link>
        <Link href="/settings/time-off">
          <Button variant="outline">Set Time Off</Button>
        </Link>
        <Link href="/settings/profile">
          <Button variant="outline">Edit Profile</Button>
        </Link>
      </div>
    </div>
  );
}
