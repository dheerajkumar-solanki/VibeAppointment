import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUserWithRole } from "@/lib/auth";
import { ReviewForm } from "@/components/review-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

interface NewReviewPageProps {
  params: Promise<{ doctorId: string }>;
  searchParams: Promise<{ appointmentId?: string }>;
}

export default async function NewReviewPage({ params, searchParams }: NewReviewPageProps) {
  const { user } = await requireUserWithRole("patient");
  const { doctorId } = await params;
  const { appointmentId } = await searchParams;

  const doctorIdNum = parseInt(doctorId, 10);
  const appointmentIdNum = appointmentId ? parseInt(appointmentId, 10) : null;

  if (isNaN(doctorIdNum) || !appointmentIdNum) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();

  // Verify the appointment belongs to this patient and doctor
  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, doctor_id, patient_id, status, start_at")
    .eq("id", appointmentIdNum)
    .eq("doctor_id", doctorIdNum)
    .eq("patient_id", user.id)
    .single();

  if (!appointment || appointment.status !== "completed") {
    notFound();
  }

  // Get doctor info
  const { data: doctor } = await supabase
    .from("doctors")
    .select(`
      *,
      user_profiles (full_name),
      specialities (name)
    `)
    .eq("id", doctorIdNum)
    .single();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link href="/dashboard" className="text-sm text-brand-600 hover:underline">
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">
          Leave a Review
        </h1>
        <p className="text-sm text-slate-600">
          Share your experience to help other patients and doctors improve.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Your Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewForm 
              doctorId={doctorIdNum} 
              appointmentId={appointmentIdNum} 
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-900">You visited</h3>
              <p className="mt-1 text-slate-600">
                Dr. {doctor?.user_profiles?.full_name || "Unknown"}
              </p>
              <p className="text-sm text-slate-500">
                {new Date(appointment.start_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-900">Why reviews matter</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>• Help other patients find the right doctor</li>
                <li>• Share honest feedback about your experience</li>
                <li>• Only patients with completed visits can review</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
