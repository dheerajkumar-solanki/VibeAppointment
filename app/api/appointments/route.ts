import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { toZonedTime } from "date-fns-tz";
import { createAppointmentSchema, formatZodErrors } from "@/lib/validations";

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
  const parsed = createAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(formatZodErrors(parsed.error), { status: 400 });
  }

  const { doctorId, clinicId, startAt: startAtISO } = parsed.data;
  const startAt = new Date(startAtISO);

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

  // Verify the doctor belongs to the submitted clinic to prevent clinic mismatch
  const { data: doctorRecord } = await supabase
    .from("doctors")
    .select("clinic_id")
    .eq("id", doctorId)
    .maybeSingle();

  if (!doctorRecord || doctorRecord.clinic_id !== clinicId) {
    return NextResponse.json(
      { error: "Doctor does not belong to the specified clinic" },
      { status: 400 }
    );
  }

  // Resolve clinic timezone for accurate weekday computation
  const { data: clinic } = await supabase
    .from("clinics")
    .select("timezone")
    .eq("id", clinicId)
    .maybeSingle();

  const clinicTz = clinic?.timezone || "UTC";
  const localDate = toZonedTime(startAt, clinicTz);
  const weekday = localDate.getDay();

  // Fetch availability windows for this weekday (need start_time/end_time for time-window check)
  const { data: availability } = await supabase
    .from("doctor_availability")
    .select("id, start_time, end_time")
    .eq("doctor_id", doctorId)
    .eq("weekday", weekday);

  if (!availability || availability.length === 0) {
    return NextResponse.json(
      { error: "Doctor is not available on this day" },
      { status: 400 }
    );
  }

  // Verify the selected time falls within at least one configured availability window.
  // start_time/end_time are stored as "HH:MM:SS" in clinic local time.
  const localHour = localDate.getHours();
  const localMinute = localDate.getMinutes();
  const localMinutes = localHour * 60 + localMinute;

  const withinWindow = availability.some((w) => {
    const [wStartH, wStartM] = String(w.start_time).split(":").map(Number);
    const [wEndH, wEndM] = String(w.end_time).split(":").map(Number);
    const windowStart = wStartH * 60 + wStartM;
    // Slot must start at or after window start, and end (30 min later) at or before window end
    const windowEnd = wEndH * 60 + wEndM;
    return localMinutes >= windowStart && localMinutes + 30 <= windowEnd;
  });

  if (!withinWindow) {
    return NextResponse.json(
      { error: "Selected time is outside doctor's available hours" },
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
      const isOverlap =
        error.code === "23P01" || error.message?.includes("appointments_no_overlap");
      return NextResponse.json(
        { error: isOverlap ? "This time slot has already been booked" : "Unable to create appointment" },
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

