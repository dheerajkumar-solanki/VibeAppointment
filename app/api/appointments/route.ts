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
  const clinicId = Number.parseInt(body?.clinicId, 10);
  const startAtISO = body?.startAt as string | undefined;

  if (!doctorId || !clinicId || !startAtISO) {
    return NextResponse.json(
      { error: "doctorId, clinicId and startAt are required" },
      { status: 400 }
    );
  }

  const startAt = new Date(startAtISO);
  if (Number.isNaN(startAt.getTime())) {
    return NextResponse.json({ error: "Invalid startAt" }, { status: 400 });
  }

  const endAt = new Date(startAt.getTime() + 30 * 60 * 1000);

  // Check if doctor has time off overlapping with this specific slot
  const { data: timeOff } = await supabase
    .from("doctor_time_off")
    .select("id")
    .eq("doctor_id", doctorId)
    .lt("start_at", endAt.toISOString())
    .gt("end_at", startAt.toISOString())
    .limit(1);

  if (timeOff && timeOff.length > 0) {
    return NextResponse.json(
      { error: "Doctor is not available at this time" },
      { status: 400 }
    );
  }

  // Check if doctor works on this day of week
  const weekday = startAt.getUTCDay();
  const { data: availability } = await supabase
    .from("doctor_availability")
    .select("id")
    .eq("doctor_id", doctorId)
    .eq("weekday", weekday)
    .limit(1);

  if (!availability || availability.length === 0) {
    return NextResponse.json(
      { error: "Doctor is not available on this day" },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase.from("appointments").insert({
      doctor_id: doctorId,
      patient_id: user.id,
      clinic_id: clinicId,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      status: "scheduled",
    });

    if (error) {
      return NextResponse.json(
        { error: "Unable to create appointment" },
        { status: 409 }
      );
    }
  } catch (e) {
    return NextResponse.json(
      { error: "Unexpected error while creating appointment" },
      { status: 500 }
    );
  }

  // Auto-dismiss any unacknowledged declined appointments for same doctor+patient
  await supabase
    .from("appointments")
    .update({ patient_ack: true })
    .eq("patient_id", user.id)
    .eq("doctor_id", doctorId)
    .eq("status", "declined")
    .eq("patient_ack", false);

  return NextResponse.json({ ok: true });
}

