import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUserWithRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stethoscope, MapPin, User, Sparkles, Building2 } from "lucide-react";

export default async function RegisterAsDoctorPage() {
  const { user } = await requireUserWithRole("patient");

  const supabase = await createSupabaseServerClient();

  // Check if user already has a doctor profile
  const { data: existingDoctor } = await supabase
    .from("doctors")
    .select("id, status")
    .eq("user_id", user.id)
    .single();

  if (existingDoctor) {
    if (existingDoctor.status === "pending") {
      redirect("/dashboard?message=doctor_pending");
    } else if (existingDoctor.status === "approved") {
      redirect("/doctor-dashboard");
    } else if (existingDoctor.status === "rejected") {
      redirect("/dashboard?message=doctor_rejected");
    }
  }

  // Fetch specialities and clinics for the form
  const { data: specialities } = await supabase.from("specialities").select("id, name");
  const { data: clinics } = await supabase.from("clinics").select("id, name, city, country");

  return (
    <div className="mx-auto max-w-3xl py-8 relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] opacity-20 pointer-events-none -z-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      </div>

      <div className="text-center mb-10 space-y-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl shadow-brand-500/10 border border-slate-100 mb-2">
          <Stethoscope className="h-8 w-8 text-brand-600" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Join as a Healthcare Professional
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          Partner with us to offer seamless booking experiences to your patients. Fill in your details below to get verified.
        </p>
      </div>

      <Card className="rounded-[2rem] border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden bg-white/80 backdrop-blur-xl">
        <div className="h-2 w-full bg-gradient-to-r from-brand-400 via-emerald-400 to-brand-600"></div>
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-500" />
            Doctor Application Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form action="/api/doctor/register" method="POST" className="space-y-8">
            
            {/* Doctor Details Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="h-5 w-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900">Personal & Professional Details</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="first_name" className="block text-sm font-semibold text-slate-700">First Name</label>
                  <Input
                    id="first_name"
                    name="first_name"
                    placeholder="e.g. Sarah"
                    required
                    className="bg-slate-50 border-slate-200 focus:bg-white focus:ring-brand-500/20 py-6 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="last_name" className="block text-sm font-semibold text-slate-700">Last Name</label>
                  <Input
                    id="last_name"
                    name="last_name"
                    placeholder="e.g. Jenkins"
                    required
                    className="bg-slate-50 border-slate-200 focus:bg-white focus:ring-brand-500/20 py-6 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="degree" className="block text-sm font-semibold text-slate-700">Medical Degree</label>
                  <Input
                    id="degree"
                    name="degree"
                    placeholder="e.g., MD, DO, MBBS"
                    required
                    className="bg-slate-50 border-slate-200 focus:bg-white focus:ring-brand-500/20 py-6 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="speciality_id" className="block text-sm font-semibold text-slate-700">Select Speciality</label>
                  <select 
                    id="speciality_id" 
                    name="speciality_id" 
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                  >
                    <option value="">Select an existing speciality</option>
                    {specialities?.map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="new_speciality" className="block text-sm font-semibold text-slate-700">Or Add New Speciality</label>
                <Input
                  id="new_speciality"
                  name="new_speciality"
                  placeholder="e.g., Pediatric Cardiology"
                  className="bg-slate-50 border-slate-200 focus:bg-white focus:ring-brand-500/20 py-6 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="bio" className="block text-sm font-semibold text-slate-700">Professional Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                  placeholder="Share a brief overview of your experience, philosophy of care, and expertise..."
                />
              </div>
            </div>

            {/* Clinic Section */}
            <div className="space-y-6 pt-6 mt-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Building2 className="h-5 w-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900">Clinic Information</h3>
              </div>
              
              <div className="space-y-2 bg-brand-50/50 p-6 rounded-2xl border border-brand-100/50">
                <label htmlFor="clinic_id" className="block text-sm font-semibold text-brand-900">Join Existing Clinic</label>
                <select 
                  id="clinic_id" 
                  name="clinic_id" 
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all shadow-sm"
                >
                  <option value="">Select a clinic (optional)</option>
                  {clinics?.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name} — {clinic.city}, {clinic.country}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm font-medium">
                  <span className="bg-white px-4 text-slate-400">OR REGISTER A NEW CLINIC</span>
                </div>
              </div>
              
              <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <div className="space-y-2">
                  <label htmlFor="clinic_name" className="block text-sm font-semibold text-slate-700">Clinic Name</label>
                  <Input
                    id="clinic_name"
                    name="clinic_name"
                    placeholder="e.g., City Health Clinic"
                    className="bg-white border-slate-200 focus:ring-brand-500/20 py-6 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="clinic_address" className="block text-sm font-semibold text-slate-700">Street Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="clinic_address"
                      name="clinic_address"
                      placeholder="123 Medical Center Blvd"
                      className="bg-white border-slate-200 focus:ring-brand-500/20 py-6 pl-12 rounded-xl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="clinic_city" className="block text-sm font-semibold text-slate-700">City</label>
                    <Input
                      id="clinic_city"
                      name="clinic_city"
                      placeholder="e.g. New York"
                      className="bg-white border-slate-200 focus:ring-brand-500/20 py-6 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="clinic_country" className="block text-sm font-semibold text-slate-700">Country</label>
                    <Input
                      id="clinic_country"
                      name="clinic_country"
                      placeholder="e.g. United States"
                      className="bg-white border-slate-200 focus:ring-brand-500/20 py-6 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="clinic_timezone" className="block text-sm font-semibold text-slate-700">Timezone</label>
                  <select 
                    id="clinic_timezone" 
                    name="clinic_timezone" 
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all shadow-sm"
                    defaultValue="UTC"
                  >
                    <option value="UTC">UTC</option>
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
            </div>

            <div className="pt-6">
              <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800 py-6 rounded-xl text-base font-bold shadow-xl shadow-slate-900/10 transition-all hover:-translate-y-0.5">
                Submit Application
              </Button>
              <p className="text-center text-xs text-slate-500 mt-4">
                By submitting this application, you agree to our Terms of Service and Privacy Policy. Our team will review your application within 24-48 hours.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
