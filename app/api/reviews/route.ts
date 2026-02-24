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
          cookiesToSet.forEach(({ name, value }) => cookieStore.set(name, value, { path: "/" }));
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

  const isValidRating = (r: number) => Number.isFinite(r) && r >= 1 && r <= 5;

  if (!doctorId || !appointmentId) {
    return NextResponse.json(
      { error: "Missing doctor or appointment ID" },
      { status: 400 }
    );
  }

  if (!isValidRating(ratingEffectiveness) || !isValidRating(ratingOverall) || !isValidRating(ratingBehavior)) {
    return NextResponse.json(
      { error: "Ratings must be integers between 1 and 5" },
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

  // One review per appointment
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("appointment_id", appointmentId)
    .maybeSingle();

  if (existingReview) {
    return NextResponse.json(
      { error: "This appointment has already been reviewed" },
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

  // Doctor avg ratings and review_count are updated automatically
  // by the trg_update_doctor_ratings Postgres trigger.

  return NextResponse.json({ ok: true });
}

