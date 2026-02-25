import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { otpSchema, formatZodErrors } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const rateLimited = rateLimit(request, "otp", { maxRequests: 5, windowMs: 60_000 });
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const parsed = otpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(formatZodErrors(parsed.error), { status: 400 });
    }
    const { email, otp } = parsed.data;
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

    if (otp) {
      // Verify OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, user: data.user });
    } else {
      // Send OTP
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (otpError) {
        return NextResponse.json({ error: otpError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: "OTP sent to email" });
    }
  } catch (error) {
    console.error("OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
