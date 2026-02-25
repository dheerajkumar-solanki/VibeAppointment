import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateAppointmentSchema, formatZodErrors } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

  const { id: idStr } = await context.params;
  const id = Number.parseInt(idStr, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid appointment id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(formatZodErrors(parsed.error), { status: 400 });
  }

  const { status, patientAck } = parsed.data;

  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, patient_id, doctor_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  const { data: doctor } = await supabase
    .from("doctors")
    .select("user_id")
    .eq("id", appointment.doctor_id)
    .maybeSingle();

  const isPatient = appointment.patient_id === user.id;
  const isDoctor = doctor?.user_id === user.id;

  if (!isPatient && !isDoctor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Patient acknowledging a declined appointment (dismiss the banner)
  if (patientAck === true && isPatient) {
    if (appointment.status !== "declined") {
      return NextResponse.json(
        { error: "Only declined appointments can be acknowledged" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("appointments")
      .update({ patient_ack: true })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Unable to acknowledge appointment" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  }

  if (!status) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 });
  }

  const currentStatus = appointment.status;

  if (isPatient) {
    if (status !== "cancelled") {
      return NextResponse.json(
        { error: "Patients can only cancel appointments" },
        { status: 403 }
      );
    }
    if (!["scheduled", "confirmed"].includes(currentStatus)) {
      return NextResponse.json(
        { error: "This appointment can no longer be cancelled" },
        { status: 400 }
      );
    }
  }

  if (isDoctor) {
    const validTransitions: Record<string, string[]> = {
      scheduled: ["confirmed", "declined"],
      confirmed: ["completed", "cancelled", "no_show"],
    };
    const allowed = validTransitions[currentStatus];
    if (!allowed || !allowed.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from '${currentStatus}' to '${status}'` },
        { status: 400 }
      );
    }
  }

  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Unable to update appointment" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}

