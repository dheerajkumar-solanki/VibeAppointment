import { createSupabaseServerClient } from "./supabase/server";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export interface TimeSlot {
  start: string; // ISO string (UTC)
  end: string; // ISO string (UTC)
}

/**
 * Returns available 30-minute slots for a given doctor on a given date.
 * All availability windows and day-of-week checks are computed in the
 * clinic's local timezone, while slots are stored and returned in UTC.
 */
export async function getAvailableSlotsForDoctorOnDate(
  doctorId: number,
  dateISO: string
): Promise<TimeSlot[]> {
  const supabase = await createSupabaseServerClient();

  const date = new Date(dateISO);
  if (Number.isNaN(date.getTime())) {
    return [];
  }

  // Fetch doctor's clinic timezone
  const { data: doctor } = await supabase
    .from("doctors")
    .select("clinic_id, clinics(timezone)")
    .eq("id", doctorId)
    .maybeSingle();

  const clinicTz: string =
    (doctor?.clinics as { timezone?: string } | null)?.timezone || "UTC";

  // Convert the requested date to the clinic's local timezone
  const localDate = toZonedTime(date, clinicTz);
  const weekday = localDate.getDay(); // 0-6, computed in clinic local time

  const { data: availability } = await supabase
    .from("doctor_availability")
    .select("id, weekday, start_time, end_time")
    .eq("doctor_id", doctorId)
    .eq("weekday", weekday);

  if (!availability || availability.length === 0) {
    return [];
  }

  // Build start/end of day in clinic local time, then convert to UTC
  const localYear = localDate.getFullYear();
  const localMonth = localDate.getMonth();
  const localDay = localDate.getDate();

  const startOfDayUTC = fromZonedTime(
    new Date(localYear, localMonth, localDay, 0, 0, 0),
    clinicTz
  );
  const endOfDayUTC = fromZonedTime(
    new Date(localYear, localMonth, localDay, 23, 59, 59),
    clinicTz
  );

  const { data: timeOff } = await supabase
    .from("doctor_time_off")
    .select("start_at, end_at")
    .eq("doctor_id", doctorId)
    .lt("start_at", endOfDayUTC.toISOString())
    .gt("end_at", startOfDayUTC.toISOString());

  const { data: existingAppointments } = await supabase
    .from("appointments")
    .select("start_at, end_at, status")
    .eq("doctor_id", doctorId)
    .in("status", ["scheduled", "confirmed", "completed"])
    .gte("start_at", startOfDayUTC.toISOString())
    .lte("end_at", endOfDayUTC.toISOString());

  const blockedRanges = (timeOff ?? []).map((b) => ({
    start: new Date(b.start_at),
    end: new Date(b.end_at),
  }));

  const busyRanges = (existingAppointments ?? []).map((a) => ({
    start: new Date(a.start_at),
    end: new Date(a.end_at),
  }));

  const slots: TimeSlot[] = [];

  for (const window of availability) {
    const [startHour, startMinute] = String(window.start_time)
      .split(":")
      .map((v) => parseInt(v, 10));
    const [endHour, endMinute] = String(window.end_time)
      .split(":")
      .map((v) => parseInt(v, 10));

    // Availability times are in clinic local time — convert to UTC
    let cursor = fromZonedTime(
      new Date(localYear, localMonth, localDay, startHour, startMinute, 0),
      clinicTz
    );

    const windowEnd = fromZonedTime(
      new Date(localYear, localMonth, localDay, endHour, endMinute, 0),
      clinicTz
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
