"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface Doctor {
  id?: number;
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

interface DoctorProfileFormProps {
  doctor: Doctor | null;
  specialities: Speciality[];
  clinics: Clinic[];
}

export function DoctorProfileForm({ doctor, specialities, clinics }: DoctorProfileFormProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [degree, setDegree] = useState(doctor?.degree || "");
  const [specialityId, setSpecialityId] = useState(doctor?.speciality_id?.toString() || "");
  const [clinicId, setClinicId] = useState(doctor?.clinic_id?.toString() || "");
  const [bio, setBio] = useState(doctor?.bio || "");
  const [photoUrl, setPhotoUrl] = useState(doctor?.photo_url || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (doctor?.id) {
        // Update existing
        const { error: updateError } = await supabase
          .from("doctors")
          .update({
            degree: degree || null,
            speciality_id: specialityId ? parseInt(specialityId) : null,
            clinic_id: clinicId ? parseInt(clinicId) : null,
            bio: bio || null,
            photo_url: photoUrl || null,
          })
          .eq("id", doctor.id);

        if (updateError) throw updateError;
      } else {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Create new doctor profile
        const { error: insertError } = await supabase
          .from("doctors")
          .insert({
            user_id: user.id,
            degree: degree || null,
            speciality_id: specialityId ? parseInt(specialityId) : null,
            clinic_id: clinicId ? parseInt(clinicId) : null,
            bio: bio || null,
            photo_url: photoUrl || null,
          });

        if (insertError) throw insertError;
      }
      
      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Degree / Title"
        value={degree}
        onChange={(e) => setDegree(e.target.value)}
        placeholder="e.g., MD, MBBS, PhD"
      />

      <Select
        label="Speciality"
        id="speciality"
        value={specialityId}
        onChange={(e) => setSpecialityId(e.target.value)}
        options={[
          { value: "", label: "Select a speciality" },
          ...specialities.map(s => ({ value: s.id.toString(), label: s.name }))
        ]}
      />

      <Select
        label="Clinic"
        id="clinic"
        value={clinicId}
        onChange={(e) => setClinicId(e.target.value)}
        options={[
          { value: "", label: "Select a clinic" },
          ...clinics.map(c => ({ value: c.id.toString(), label: `${c.name} - ${c.city}` }))
        ]}
      />

      <Input
        label="Photo URL"
        value={photoUrl}
        onChange={(e) => setPhotoUrl(e.target.value)}
        placeholder="https://..."
      />

      <Textarea
        label="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Tell patients about your experience and approach..."
        rows={4}
      />

      {error && (
        <div className="p-3 rounded-md bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-md bg-green-50 text-sm text-green-600">
          Profile saved successfully!
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
