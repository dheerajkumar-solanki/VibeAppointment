import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });

    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

      if (user) {
      const fullName =
        (user.user_metadata as any)?.full_name ??
        (user.user_metadata as any)?.name ??
        user.email ??
        "";

      // Ensure a profile row exists; default role to 'patient' for now.
      await supabase
        .from("user_profiles")
        .insert({
          id: user.id,
          full_name: fullName,
          role: "patient",
        })
        .onConflict("id")
        .ignore();
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}

