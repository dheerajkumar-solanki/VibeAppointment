import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => cookieStore.set(name, value));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const doctorId = Number.parseInt(body?.doctorId, 10);
  const appointmentId = Number.parseInt(body?.appointmentId, 10);
  const ratingEffectiveness = Number.parseInt(body?.ratingEffectiveness, 10);
  const ratingOverall = Number.parseInt(body?.ratingOverall, 10);
  const ratingBehavior = Number.parseInt(body?.ratingBehavior, 10);
  const comment = (body?.comment as string | undefined) ?? null;

  if (
    !doctorId ||
    !appointmentId ||
    !Number.isFinite(ratingEffectiveness) ||
    !Number.isFinite(ratingOverall) ||
    !Number.isFinite(ratingBehavior)
  ) {
    return NextResponse.json(
      { error: "Missing or invalid review fields" },
      { status: 400 }
    );
  }

  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, doctor_id, patient_id, status, start_at")
    .eq("id", appointmentId)
    .eq("doctor_id", doctorId)
    .eq("patient_id", user.id)
    .maybeSingle();

  if (!appointment || appointment.status !== "completed") {
    return NextResponse.json(
      { error: "Review allowed only for completed appointments" },
      { status: 403 }
    );
  }

  const appointmentDate = new Date(appointment.start_at);
  const now = new Date();
  const diffMs = now.getTime() - appointmentDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays > 31) {
    return NextResponse.json(
      { error: "Reviews are only allowed within one month of the visit" },
      { status: 403 }
    );
  }

  // Check if already reviewed this doctor this month
  const currentMonth = new Date().toISOString().slice(0, 7); // "2026-02"
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id, created_at")
    .eq("doctor_id", doctorId)
    .eq("patient_id", user.id)
    .like("created_at", `${currentMonth}%`)
    .maybeSingle();

  if (existingReview) {
    return NextResponse.json(
      { error: "You can only review this doctor once per month" },
      { status: 403 }
    );
  }

  const { error } = await supabase.from("reviews").insert({
    doctor_id: doctorId,
    patient_id: user.id,
    appointment_id: appointmentId,
    rating_effectiveness: ratingEffectiveness,
    rating_overall: ratingOverall,
    rating_behavior: ratingBehavior,
    comment,
  });

  if (error) {
    return NextResponse.json(
      { error: "Unable to create review" },
      { status: 400 }
    );
  }

  // Update doctor's average ratings
  const { data: stats } = await supabase
    .from("reviews")
    .select("rating_overall, rating_effectiveness, rating_behavior")
    .eq("doctor_id", doctorId);

  if (stats && stats.length > 0) {
    const count = stats.length;
    const avgOverall = stats.reduce((sum, r) => sum + r.rating_overall, 0) / count;
    const avgEffectiveness = stats.reduce((sum, r) => sum + r.rating_effectiveness, 0) / count;
    const avgBehavior = stats.reduce((sum, r) => sum + r.rating_behavior, 0) / count;

    await supabase
      .from("doctors")
      .update({
        avg_rating_overall: avgOverall,
        avg_rating_effectiveness: avgEffectiveness,
        avg_rating_behavior: avgBehavior,
        review_count: count,
      })
      .eq("id", doctorId);
  }

  return NextResponse.json({ ok: true });
}

