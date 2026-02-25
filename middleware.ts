import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/doctors", "/auth/callback"];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith("/doctors/")) return true;
  if (pathname.startsWith("/api/auth/")) return true;
  if (pathname.startsWith("/_next/") || pathname.startsWith("/favicon")) return true;
  return false;
}

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

function isDoctorRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/doctor-dashboard") ||
    pathname.startsWith("/settings")
  );
}

function isPatientRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/appointments") ||
    pathname.startsWith("/reviews")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — this keeps the auth cookie alive
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isPublicRoute(pathname)) {
    return response;
  }

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control for protected areas.
  // Fetch profile only when the route requires a role check.
  if (isAdminRoute(pathname) || isDoctorRoute(pathname) || isPatientRoute(pathname)) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, is_admin")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role ?? "patient";
    const isAdmin = profile?.is_admin ?? false;

    if (isAdminRoute(pathname) && !isAdmin) {
      // Non-admins are sent to their role's dashboard
      const dest = request.nextUrl.clone();
      dest.pathname = role === "doctor" ? "/doctor-dashboard" : "/dashboard";
      dest.search = "";
      return NextResponse.redirect(dest);
    }

    if (isDoctorRoute(pathname) && role !== "doctor") {
      const dest = request.nextUrl.clone();
      dest.pathname = "/dashboard";
      dest.search = "";
      return NextResponse.redirect(dest);
    }

    if (isPatientRoute(pathname) && role !== "patient") {
      const dest = request.nextUrl.clone();
      dest.pathname = role === "doctor" ? "/doctor-dashboard" : "/admin/dashboard";
      dest.search = "";
      return NextResponse.redirect(dest);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
