"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { DoctorProfileForm } from "@/components/doctor-profile-form";
import { User, Settings, Loader2 } from "lucide-react";

interface Doctor {
  id: number;
  user_id: string;
  clinic_id: number | null;
  degree: string | null;
  speciality_id: number | null;
  bio: string | null;
  photo_url: string | null;
  specialities?: { id: number; name: string } | null;
  clinics?: { id: number; name: string } | null;
}

interface Speciality {
  id: number;
  name: string;
}

interface Clinic {
  id: number;
  name: string;
  address: string;
  city: string;
}

export default function ProfileSettingsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch doctor profile
      const { data: doctorData } = await supabase
        .from("doctors")
        .select(`
          *,
          specialities (id, name),
          clinics (id, name, address, city)
        `)
        .eq("user_id", user.id)
        .single();

      if (doctorData) {
        // Flatten the nested objects for the form
        setDoctor({
          ...doctorData,
          specialities: doctorData.specialities,
          clinics: doctorData.clinics
        });
      }

      // Fetch specialities
      const { data: specData } = await supabase
        .from("specialities")
        .select("id, name");
      
      if (specData) setSpecialities(specData);

      // Fetch clinics
      const { data: clinicData } = await supabase
        .from("clinics")
        .select("id, name, address, city");
      
      if (clinicData) setClinics(clinicData);

      setLoading(false);
    }
    loadData();
  }, [supabase]);

  if (loading) return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Doctor Profile</h1>
        <p className="mt-2 text-lg text-slate-600">Manage your professional information and public profile.</p>
      </div>

      <div className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60 sm:p-8">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
            <p className="text-sm text-slate-500">This information will be visible to patients.</p>
          </div>
        </div>

        <DoctorProfileForm 
          doctor={doctor} 
          specialities={specialities} 
          clinics={clinics} 
        />
      </div>
    </div>
  );
}
