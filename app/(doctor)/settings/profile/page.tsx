import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUserWithRole } from "@/lib/auth";
import { DoctorProfileForm } from "@/components/doctor-profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DoctorProfilePage() {
  const { user } = await requireUserWithRole("doctor");

  const supabase = await createSupabaseServerClient();

  // Get existing doctor profile
  const { data: doctor } = await supabase
    .from("doctors")
    .select(`
      *,
      specialities (id, name),
      clinics (id, name, address, city, country, timezone)
    `)
    .eq("user_id", user.id)
    .single();

  // Get available specialities and clinics
  const { data: specialities } = await supabase
    .from("specialities")
    .select("*")
    .order("name");

  const { data: clinics } = await supabase
    .from("clinics")
    .select("*")
    .order("name");

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link href="/doctor-dashboard" className="text-sm text-brand-600 hover:underline">
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">
          Doctor Profile
        </h1>
        <p className="text-sm text-slate-600">
          Manage your professional information and clinic details.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <DoctorProfileForm 
              doctor={doctor} 
              specialities={specialities || []} 
              clinics={clinics || []}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-900">Profile Status</h3>
              <p className="mt-1 text-sm text-slate-600">
                {doctor ? "Your profile is active and visible to patients." : "Please complete your profile to start receiving patients."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
