import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlotsForDoctorOnDate } from "@/lib/slots";

export async function GET(
  request: NextRequest,
  context: { params: { doctorId: string } }
) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const doctorId = Number.parseInt(context.params.doctorId, 10);

  if (!date || Number.isNaN(doctorId)) {
    return NextResponse.json(
      { error: "Missing or invalid doctorId/date" },
      { status: 400 }
    );
  }

  const slots = await getAvailableSlotsForDoctorOnDate(doctorId, date);
  return NextResponse.json({ slots });
}

