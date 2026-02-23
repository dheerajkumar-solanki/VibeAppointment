import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUserWithRole } from "@/lib/auth";
import { TimeOffManager } from "@/components/time-off-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function TimeOffPage() {
  const { user } = await requireUserWithRole("doctor");

  const supabase = createSupabaseServerClient();

  // Get doctor profile
  const { data: doctor } = await supabase
    .from("doctors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!doctor) {
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Time Off</h1>
        </header>
        <Card>
          <CardContent className="p-6">
            <p className="text-slate-600">Please complete your doctor profile first.</p>
            <Link href="/settings/profile" className="text-brand-600 hover:underline">
              Complete Profile →
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get existing time off
  const { data: timeOff } = await supabase
    .from("doctor_time_off")
    .select("*")
    .eq("doctor_id", doctor.id)
    .gte("end_at", new Date().toISOString())
    .order("start_at", { ascending: true });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link href="/doctor-dashboard" className="text-sm text-brand-600 hover:underline">
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">
          Time Off
        </h1>
        <p className="text-sm text-slate-600">
          Block specific dates when you won&apos;t be available for appointments (holidays, vacations, etc.).
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Manage Time Off</CardTitle>
        </CardHeader>
        <CardContent>
          <TimeOffManager doctorId={doctor.id} existingTimeOff={timeOff || []} />
        </CardContent>
      </Card>
    </div>
  );
}
