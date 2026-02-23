import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";

type UserRole = "patient" | "doctor";

export async function getUserAndProfile() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile };
}

export async function requireUserWithRole(role?: UserRole) {
  const { user, profile } = await getUserAndProfile();

  if (!user) {
    redirect("/login");
  }

  if (!profile || !profile.role) {
    // In the future this can redirect to a role-selection/onboarding screen.
    redirect("/login");
  }

  if (role && profile.role !== role) {
    // Redirect users to their appropriate dashboard based on stored role
    if (profile.role === "patient") {
      redirect("/dashboard");
    } else if (profile.role === "doctor") {
      redirect("/doctor-dashboard");
    }
  }

  return { user, profile };
}

