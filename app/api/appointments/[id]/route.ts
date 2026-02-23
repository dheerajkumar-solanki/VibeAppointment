import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number.parseInt(context.params.id, 10);
  if (!id) {
    return NextResponse.json({ error: "Invalid appointment id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const status = body?.status as string | undefined;

  if (!status || !["scheduled", "completed", "cancelled", "no_show"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
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

