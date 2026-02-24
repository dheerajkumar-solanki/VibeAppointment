import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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
  const status = body?.status as string | undefined;

  if (!status || !["scheduled", "completed", "cancelled", "no_show"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Verify the user is either the patient or the doctor for this appointment
  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, patient_id, doctor_id")
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

  // Patients can only cancel; doctors can cancel, complete, or mark no-show
  if (isPatient && status !== "cancelled") {
    return NextResponse.json(
      { error: "Patients can only cancel appointments" },
      { status: 403 }
    );
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

