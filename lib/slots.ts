import { createSupabaseServerClient } from "./supabase/server";

export interface TimeSlot {
  start: string; // ISO string
  end: string; // ISO string
}

export async function getAvailableSlotsForDoctorOnDate(
  doctorId: number,
  dateISO: string
): Promise<TimeSlot[]> {
  const supabase = await createSupabaseServerClient();

  const date = new Date(dateISO);
  if (Number.isNaN(date.getTime())) {
    return [];
  }

  const weekday = date.getUTCDay(); // 0-6, simplified for now

  const { data: availability } = await supabase
    .from("doctor_availability")
    .select("id, weekday, start_time, end_time")
    .eq("doctor_id", doctorId)
    .eq("weekday", weekday);

  if (!availability || availability.length === 0) {
    return [];
  }

  const startOfDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0)
  );
  const endOfDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59)
  );

  const { data: timeOff } = await supabase
    .from("doctor_time_off")
    .select("start_at, end_at")
    .eq("doctor_id", doctorId)
    .lt("start_at", endOfDay.toISOString())
    .gt("end_at", startOfDay.toISOString());

  const { data: existingAppointments } = await supabase
    .from("appointments")
    .select("start_at, end_at, status")
    .eq("doctor_id", doctorId)
    .in("status", ["scheduled", "completed"])
    .gte("start_at", startOfDay.toISOString())
    .lte("end_at", endOfDay.toISOString());

  const blockedRanges =
    (timeOff ?? []).map((b) => ({
      start: new Date(b.start_at),
      end: new Date(b.end_at),
    })) ?? [];

  const busyRanges =
    (existingAppointments ?? []).map((a) => ({
      start: new Date(a.start_at),
      end: new Date(a.end_at),
    })) ?? [];

  const slots: TimeSlot[] = [];

  for (const window of availability ?? []) {
    const [startHour, startMinute] = String(window.start_time)
      .split(":")
      .map((v) => parseInt(v, 10));
    const [endHour, endMinute] = String(window.end_time)
      .split(":")
      .map((v) => parseInt(v, 10));

    let cursor = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        startHour,
        startMinute,
        0
      )
    );

    const windowEnd = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        endHour,
        endMinute,
        0
      )
    );

    while (cursor < windowEnd) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor.getTime() + 30 * 60 * 1000);

      if (slotEnd > windowEnd) break;

      const overlapsBlocked = blockedRanges.some(
        (r) => slotStart < r.end && slotEnd > r.start
      );

      const overlapsAppointment = busyRanges.some(
        (r) => slotStart < r.end && slotEnd > r.start
      );

      if (!overlapsBlocked && !overlapsAppointment) {
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
        });
      }

      cursor = slotEnd;
    }
  }

  return slots;
}

