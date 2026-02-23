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

  // Check if doctor has time off on this date
  const startOfDay = new Date(startAt);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startAt);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: timeOff } = await supabase
    .from("doctor_time_off")
    .select("id")
    .eq("doctor_id", doctorId)
    .lte("start_at", endOfDay.toISOString())
    .gte("end_at", startOfDay.toISOString())
    .limit(1);

  if (timeOff && timeOff.length > 0) {
    return NextResponse.json(
      { error: "Doctor is not available on this date" },
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

  const endAt = new Date(startAt.getTime() + 30 * 60 * 1000);

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

  return NextResponse.json({ ok: true });
}

