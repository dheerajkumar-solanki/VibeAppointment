import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  return handleCallback(request);
}

export async function HEAD(request: NextRequest) {
  return handleCallback(request);
}

async function handleCallback(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Log any OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${error}`);
  }

  if (code) {
    try {
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
              cookiesToSet.forEach(({ name, value, ...options }) => 
                cookieStore.set(name, value, { ...options, path: "/" })
              );
            },
          },
        }
      );

      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (sessionError) {
        console.error("Session exchange error:", sessionError);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=session_error`);
      }

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
        const { error: profileError } = await supabase
          .from("user_profiles")
          .upsert({
            id: user.id,
            full_name: fullName,
            role: "patient",
          }, { onConflict: "id", ignoreDuplicates: true });
          
        if (profileError) {
          console.error("Profile upsert error:", profileError);
        }
      }
    } catch (err) {
      console.error("Callback error:", err);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=callback_error`);
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}

