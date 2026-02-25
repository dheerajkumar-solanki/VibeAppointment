"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AlertTriangle, Building2, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Doctor {
  id?: number;
  user_id: string;
  first_name: string;
  last_name: string;
  clinic_id: number | null;
  degree: string | null;
  speciality_id: number | null;
  bio: string | null;
  photo_url: string | null;
  status?: string;
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
  country?: string;
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [firstName, setFirstName] = useState(doctor?.first_name || "");
  const [lastName, setLastName] = useState(doctor?.last_name || "");
  const [degree, setDegree] = useState(doctor?.degree || "");
  const [bio, setBio] = useState(doctor?.bio || "");
  const [photoUrl, setPhotoUrl] = useState(doctor?.photo_url || "");

  // Speciality: "existing" or "new"
  const [specialityMode, setSpecialityMode] = useState<"existing" | "new">("existing");
  const [specialityId, setSpecialityId] = useState(doctor?.speciality_id?.toString() || "");
  const [newSpecialityName, setNewSpecialityName] = useState("");

  // Clinic: "existing" or "new"
  const [clinicMode, setClinicMode] = useState<"existing" | "new">("existing");
  const [clinicId, setClinicId] = useState(doctor?.clinic_id?.toString() || "");
  const [newClinicName, setNewClinicName] = useState("");
  const [newClinicAddress, setNewClinicAddress] = useState("");
  const [newClinicCity, setNewClinicCity] = useState("");
  const [newClinicCountry, setNewClinicCountry] = useState("");
  const [newClinicTimezone, setNewClinicTimezone] = useState("UTC");

  const isUpdate = !!doctor?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (clinicMode === "existing" && !clinicId) errors.clinic = "Please select a clinic";
    if (clinicMode === "new" && !newClinicName.trim()) errors.clinicName = "Clinic name is required";
    if (clinicMode === "new" && !newClinicCity.trim()) errors.clinicCity = "City is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      let finalSpecialityId: number | null = specialityId ? parseInt(specialityId) : null;
      let finalClinicId: number | null = clinicId ? parseInt(clinicId) : null;

      // Create new speciality if requested
      if (specialityMode === "new" && newSpecialityName.trim()) {
        const { data: newSpec, error: specError } = await supabase
          .from("specialities")
          .insert({ name: newSpecialityName.trim() })
          .select()
          .single();

        if (specError) throw new Error(`Failed to create speciality: ${specError.message}`);
        finalSpecialityId = newSpec.id;
      }

      // Create new clinic if requested
      if (clinicMode === "new" && newClinicName.trim()) {
        if (!newClinicCity.trim()) {
          throw new Error("City is required when registering a new clinic");
        }

        const { data: newClinic, error: clinicError } = await supabase
          .from("clinics")
          .insert({
            name: newClinicName.trim(),
            address: newClinicAddress.trim() || null,
            city: newClinicCity.trim(),
            country: newClinicCountry.trim() || null,
            timezone: newClinicTimezone || "UTC",
          })
          .select()
          .single();

        if (clinicError) throw new Error(`Failed to create clinic: ${clinicError.message}`);
        finalClinicId = newClinic.id;
      }

      if (!finalClinicId) {
        throw new Error("Please select an existing clinic or register a new one");
      }

      const payload: Record<string, unknown> = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        degree: degree || null,
        speciality_id: finalSpecialityId,
        clinic_id: finalClinicId,
        bio: bio || null,
        photo_url: photoUrl || null,
      };

      if (isUpdate) {
        // Re-submit for admin approval
        payload.status = "pending";

        const { error: updateError } = await supabase
          .from("doctors")
          .update(payload)
          .eq("id", doctor.id);

        if (updateError) throw updateError;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        payload.user_id = user.id;
        payload.status = "pending";

        const { error: insertError } = await supabase
          .from("doctors")
          .insert(payload);

        if (insertError) throw insertError;
      }

      setSuccess(true);
      toast.success(isUpdate ? "Profile updated — pending admin approval" : "Profile saved successfully!");
      router.refresh();
    } catch (err: any) {
      const msg = err.message || "Failed to save profile";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Re-approval notice */}
      {isUpdate && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Profile changes require admin re-approval</p>
            <p className="mt-1 text-sm text-amber-700">
              After saving, your profile status will be set to <strong>pending</strong> until an admin reviews and approves the changes. You won't appear in public listings during this period.
            </p>
          </div>
        </div>
      )}

      {/* Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            label="First Name"
            value={firstName}
            onChange={(e) => { setFirstName(e.target.value); setFieldErrors((p) => ({ ...p, firstName: "" })); }}
            placeholder="e.g. Sarah"
            required
          />
          {fieldErrors.firstName && <p className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</p>}
        </div>
        <div>
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => { setLastName(e.target.value); setFieldErrors((p) => ({ ...p, lastName: "" })); }}
            placeholder="e.g. Jenkins"
            required
          />
          {fieldErrors.lastName && <p className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</p>}
        </div>
      </div>

      {/* Degree */}
      <Input
        label="Degree / Title"
        value={degree}
        onChange={(e) => setDegree(e.target.value)}
        placeholder="e.g., MD, MBBS, PhD"
      />

      {/* Speciality Section */}
      <fieldset className="space-y-4">
        <legend className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Sparkles className="h-4 w-4 text-brand-500" />
          Speciality
        </legend>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setSpecialityMode("existing")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              specialityMode === "existing"
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Select Existing
          </button>
          <button
            type="button"
            onClick={() => setSpecialityMode("new")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              specialityMode === "new"
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Add New
          </button>
        </div>

        {specialityMode === "existing" ? (
          <Select
            id="speciality"
            value={specialityId}
            onChange={(e) => setSpecialityId(e.target.value)}
            options={[
              { value: "", label: "Select a speciality" },
              ...specialities.map((s) => ({ value: s.id.toString(), label: s.name })),
            ]}
          />
        ) : (
          <Input
            value={newSpecialityName}
            onChange={(e) => setNewSpecialityName(e.target.value)}
            placeholder="e.g., Pediatric Cardiology"
          />
        )}
      </fieldset>

      {/* Clinic Section */}
      <fieldset className="space-y-4">
        <legend className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Building2 className="h-4 w-4 text-slate-500" />
          Clinic
        </legend>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setClinicMode("existing")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              clinicMode === "existing"
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Select Existing
          </button>
          <button
            type="button"
            onClick={() => setClinicMode("new")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              clinicMode === "new"
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Register New
          </button>
        </div>

        {clinicMode === "existing" ? (
          <div>
            <Select
              id="clinic"
              value={clinicId}
              onChange={(e) => { setClinicId(e.target.value); setFieldErrors((p) => ({ ...p, clinic: "" })); }}
              options={[
                { value: "", label: "Select a clinic" },
                ...clinics.map((c) => ({
                  value: c.id.toString(),
                  label: `${c.name} — ${c.city}${c.country ? `, ${c.country}` : ""}`,
                })),
              ]}
            />
            {fieldErrors.clinic && <p className="mt-1 text-xs text-red-600">{fieldErrors.clinic}</p>}
          </div>
        ) : (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5">
            <Input
              label="Clinic Name"
              value={newClinicName}
              onChange={(e) => setNewClinicName(e.target.value)}
              placeholder="e.g., City Health Clinic"
              required={clinicMode === "new"}
            />
            <div className="relative">
              <Input
                label="Street Address"
                value={newClinicAddress}
                onChange={(e) => setNewClinicAddress(e.target.value)}
                placeholder="123 Medical Center Blvd"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="City"
                value={newClinicCity}
                onChange={(e) => setNewClinicCity(e.target.value)}
                placeholder="e.g. New York"
                required={clinicMode === "new"}
              />
              <Input
                label="Country"
                value={newClinicCountry}
                onChange={(e) => setNewClinicCountry(e.target.value)}
                placeholder="e.g. United States"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="timezone" className="block text-sm font-medium text-slate-700">
                Timezone
              </label>
              <select
                id="timezone"
                value={newClinicTimezone}
                onChange={(e) => setNewClinicTimezone(e.target.value)}
                className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="UTC">UTC</option>
                <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                <option value="Asia/Dubai">GST (Asia/Dubai)</option>
                <option value="Asia/Singapore">SGT (Asia/Singapore)</option>
                <option value="Asia/Bangkok">ICT (Asia/Bangkok)</option>
                <option value="Europe/London">GMT (Europe/London)</option>
                <option value="Europe/Paris">CET (Europe/Paris)</option>
                <option value="America/New_York">EST (America/New_York)</option>
                <option value="America/Los_Angeles">PST (America/Los_Angeles)</option>
              </select>
            </div>
          </div>
        )}
      </fieldset>

      {/* Photo URL */}
      <Input
        label="Photo URL"
        value={photoUrl}
        onChange={(e) => setPhotoUrl(e.target.value)}
        placeholder="https://..."
      />

      {/* Bio */}
      <Textarea
        label="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Tell patients about your experience and approach..."
        rows={4}
      />

      {/* Error / Success */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <p className="font-semibold">Profile saved successfully!</p>
          {isUpdate && (
            <p className="mt-1">Your profile is now pending admin approval. You will be notified once it is reviewed.</p>
          )}
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : isUpdate ? "Save & Submit for Approval" : "Save Profile"}
      </Button>
    </form>
  );
}
