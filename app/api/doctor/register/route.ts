import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { doctorRegistrationSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const rawData = Object.fromEntries(formData.entries());
    const parsed = doctorRegistrationSchema.safeParse(rawData);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid form data";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const {
      clinic_id: clinicIdInput,
      clinic_name: clinicName,
      clinic_address: clinicAddress,
      clinic_city: clinicCity,
      clinic_country: clinicCountry,
      clinic_timezone: clinicTimezone,
      first_name: firstName,
      last_name: lastName,
      degree,
      bio,
      speciality_id: existingSpecialityId,
      new_speciality: newSpeciality,
    } = parsed.data;

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
            cookiesToSet.forEach(({ name, value }) =>
              cookieStore.set(name, value, { path: "/" })
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a doctor profile
    const { data: existingDoctor } = await supabase
      .from("doctors")
      .select("id, status")
      .eq("user_id", user.id)
      .single();

    if (existingDoctor) {
      return NextResponse.json({ error: "You already have a doctor profile" }, { status: 400 });
    }

    let clinicId: number | null = clinicIdInput ?? null;
    let specialityId: number | null = existingSpecialityId ?? null;

    // Create new clinic if no existing clinic selected and name is provided
    if (!clinicId && clinicName) {
      const { data: newClinic, error: clinicError } = await supabase
        .from("clinics")
        .insert({
          name: clinicName,
          address: clinicAddress,
          city: clinicCity,
          country: clinicCountry,
          timezone: clinicTimezone,
        })
        .select()
        .single();

      if (clinicError || !newClinic) {
        return NextResponse.json(
          { error: clinicError?.message ?? "Failed to create clinic" },
          { status: 400 }
        );
      }
      clinicId = newClinic.id;
    }

    // Create new speciality if provided
    if (!specialityId && newSpeciality) {
      const { data: newSpec, error: specError } = await supabase
        .from("specialities")
        .insert({ name: newSpeciality })
        .select()
        .single();

      if (specError || !newSpec) {
        return NextResponse.json(
          { error: specError?.message ?? "Failed to create speciality" },
          { status: 400 }
        );
      }
      specialityId = newSpec.id;
    }

    if (!clinicId) {
      return NextResponse.json({ error: "Clinic is required" }, { status: 400 });
    }

    // Create doctor profile with pending status
    const { error: doctorError } = await supabase
      .from("doctors")
      .insert({
        user_id: user.id,
        clinic_id: clinicId,
        first_name: firstName,
        last_name: lastName,
        speciality_id: specialityId,
        degree,
        bio,
        status: "pending",
      });

    if (doctorError) {
      return NextResponse.json({ error: doctorError.message }, { status: 400 });
    }

    // Update user profile role to doctor
    await supabase
      .from("user_profiles")
      .update({ role: "doctor" })
      .eq("id", user.id);

    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/dashboard?message=doctor_pending`;
    return NextResponse.redirect(redirectUrl, 303);
  } catch (error) {
    console.error("Doctor registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
