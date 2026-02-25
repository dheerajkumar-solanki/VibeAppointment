import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  return handleOAuthLogin(request);
}

export async function GET(request: NextRequest) {
  return handleOAuthLogin(request);
}

async function handleOAuthLogin(request: NextRequest) {
  const rateLimited = rateLimit(request, "login", { maxRequests: 10, windowMs: 60_000 });
  if (rateLimited) return rateLimited;
  const requestUrl = new URL(request.url);
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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${requestUrl.origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=oauth_failed`
    );
  }

  return NextResponse.redirect(data.url);
}

