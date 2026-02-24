import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Users, Activity, CheckCircle2, XCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/dashboard?message=unauthorized");
  }

  // Fetch pending doctor applications
  const { data: pendingDoctors } = await supabase
    .from("doctors")
    .select(`
      id,
      first_name,
      last_name,
      status,
      degree,
      bio,
      user_profiles (full_name),
      specialities (name),
      clinics (name, address)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // Fetch all doctors with their status
  const { data: allDoctors } = await supabase
    .from("doctors")
    .select(`
      id,
      first_name,
      last_name,
      status,
      degree,
      user_profiles (full_name),
      specialities (name),
      clinics (name)
    `)
    .order("created_at", { ascending: false })
    .limit(20);

  const pendingCount = pendingDoctors?.length || 0;
  const approvedCount = allDoctors?.filter(d => d.status === 'approved').length || 0;

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <header className="relative overflow-hidden rounded-[2rem] bg-slate-900 px-8 py-10 text-white shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-900"></div>
        <div className="absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-brand-500/20 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20">
              <ShieldCheck className="h-8 w-8 text-brand-400" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Admin Control Panel</h1>
              <p className="mt-1 text-slate-300">Manage platform users, doctors, and system settings.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60 flex items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Clock className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Approvals</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{pendingCount}</p>
          </div>
        </div>
        <div className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60 flex items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Doctors</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{approvedCount}</p>
          </div>
        </div>
        <div className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/60 flex items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Records</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{allDoctors?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Pending Applications */}
        <section className="flex flex-col rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-6 sm:px-8 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Pending Applications</h2>
            </div>
            {pendingCount > 0 && (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                {pendingCount}
              </span>
            )}
          </div>
          
          <div className="flex-1 p-6 sm:px-8">
            {!pendingDoctors || pendingDoctors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <p className="font-bold text-slate-900">All caught up!</p>
                <p className="mt-1 text-sm text-slate-500 max-w-xs">There are no pending doctor applications to review right now.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingDoctors.map((doctor) => (
                  <div key={doctor.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all hover:shadow-md hover:border-amber-200">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">
                          Dr. {doctor.first_name} {doctor.last_name}
                        </h3>
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                          Pending Review
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{(doctor.user_profiles as any)?.full_name || ""}</p>
                    </div>
                    
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Degree</p>
                          <p className="font-medium text-slate-900">{doctor.degree}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Speciality</p>
                          <p className="font-medium text-slate-900">{(doctor.specialities as any)?.name || "Not specified"}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Clinic</p>
                          <p className="font-medium text-slate-900">{(doctor.clinics as any)?.name || "-"}</p>
                        </div>
                        {doctor.bio && (
                          <div className="col-span-2">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Bio</p>
                            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 line-clamp-3">{doctor.bio}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <form action={`/api/admin/doctor/${doctor.id}/approve`} method="POST" className="flex-1">
                          <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm font-bold">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </form>
                        <form action={`/api/admin/doctor/${doctor.id}/reject`} method="POST" className="flex-1">
                          <Button type="submit" variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 font-bold">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* All Doctors */}
        <section className="flex flex-col rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden h-fit">
          <div className="flex items-center gap-3 border-b border-slate-100 p-6 sm:px-8 bg-slate-50/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Doctor Directory</h2>
          </div>
          
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Speciality</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allDoctors?.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">Dr. {doctor.first_name} {doctor.last_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{(doctor.clinics as any)?.name || "-"}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {(doctor.specialities as any)?.name || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${
                        doctor.status === "approved" ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" :
                        doctor.status === "pending" ? "bg-amber-50 text-amber-700 ring-amber-600/20" :
                        "bg-red-50 text-red-700 ring-red-600/20"
                      }`}>
                        {doctor.status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
                        {doctor.status === 'pending' && <Clock className="h-3 w-3" />}
                        {doctor.status === 'rejected' && <XCircle className="h-3 w-3" />}
                        <span className="capitalize">{doctor.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
                {(!allDoctors || allDoctors.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">
                      No doctors found in the system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
