import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";

type UserRole = "patient" | "doctor";

export async function getUserAndProfile() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id, role, full_name, is_admin")
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
    if (profile.role === "patient") {
      redirect("/dashboard");
    } else if (profile.role === "doctor") {
      redirect("/doctor-dashboard");
    }
  }

  return { user, profile };
}

export async function requireAdmin() {
  const { user, profile } = await getUserAndProfile();

  if (!user || !profile) {
    redirect("/login");
  }

  if (!profile.is_admin) {
    redirect("/dashboard");
  }

  return { user, profile };
}

