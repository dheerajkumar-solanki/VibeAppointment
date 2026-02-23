import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUserWithRole } from "@/lib/auth";
import { AvailabilityManager } from "@/components/availability-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
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
          <h1 className="text-2xl font-semibold text-slate-900">Availability</h1>
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

  // Get existing availability
  const { data: availability } = await supabase
    .from("doctor_availability")
    .select("*")
    .eq("doctor_id", doctor.id)
    .order("weekday", { ascending: true });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link href="/doctor-dashboard" className="text-sm text-brand-600 hover:underline">
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">
          Weekly Availability
        </h1>
        <p className="text-sm text-slate-600">
          Set your regular weekly schedule. Patients can only book during these times.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Manage Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <AvailabilityManager doctorId={doctor.id} existingAvailability={availability || []} />
        </CardContent>
      </Card>
    </div>
  );
}
