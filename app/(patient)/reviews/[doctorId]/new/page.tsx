import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUserWithRole } from "@/lib/auth";
import { ReviewForm } from "@/components/review-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Star, MessageSquare, ThumbsUp, ShieldCheck } from "lucide-react";

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

  // Prevent duplicate review for the same appointment
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("appointment_id", appointmentIdNum)
    .maybeSingle();

  if (existingReview) {
    redirect("/dashboard");
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

  if (!doctor) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Leave a Review
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Share your experience to help other patients and doctors improve.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60 sm:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
              <Star className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Your Feedback</h2>
          </div>
          
          <ReviewForm 
            doctorId={doctorIdNum} 
            appointmentId={appointmentIdNum} 
          />
        </div>

        <div className="space-y-6">
          {/* Doctor Info */}
          <div className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">You visited</h3>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 font-bold text-xl">
                {(doctor?.first_name || "").charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">Dr. {doctor?.first_name} {doctor?.last_name}</p>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  {new Date(appointment.start_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Why Review */}
          <div className="rounded-[1.5rem] bg-slate-900 p-6 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="h-5 w-5 text-brand-400" />
              <h3 className="font-bold">Why reviews matter</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <ThumbsUp className="h-4 w-4 mt-1 text-emerald-400 shrink-0" />
                Help other patients find the right doctor
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 mt-1 text-brand-400 shrink-0" />
                Share honest feedback about your experience
              </li>
              <li className="flex items-start gap-2">
                <Star className="h-4 w-4 mt-1 text-yellow-400 shrink-0" />
                Only patients with completed visits can review
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
