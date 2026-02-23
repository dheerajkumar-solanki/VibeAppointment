"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Coffee, Plus, Trash2, CheckCircle2, X } from "lucide-react";

interface TimeOff {
  id: number;
  start_at: string;
  end_at: string;
  reason: string;
}

export default function TimeOffPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // New time off form
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: doctor } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (doctor) {
        setDoctorId(doctor.id);
        
        const { data: existing } = await supabase
          .from("doctor_time_off")
          .select("*")
          .eq("doctor_id", doctor.id)
          .gte("end_at", new Date().toISOString())
          .order("start_at", { ascending: true });

        setTimeOffs(existing || []);
      }
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  async function handleAdd() {
    if (!doctorId || !startDate || !endDate) return;
    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("doctor_time_off")
      .insert({
        doctor_id: doctorId,
        start_at: new Date(startDate).toISOString(),
        end_at: new Date(endDate).toISOString(),
        reason: reason || null,
      })
      .select()
      .single();

    if (error) {
      setMessage("Error: " + error.message);
    } else if (data) {
      setTimeOffs([...timeOffs, data]);
      setStartDate("");
      setEndDate("");
      setReason("");
      setMessage("Time off added successfully!");
      setTimeout(() => setMessage(""), 3000);
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    await supabase.from("doctor_time_off").delete().eq("id", id);
    setTimeOffs(timeOffs.filter((t) => t.id !== id));
    setMessage("Time off removed.");
    setTimeout(() => setMessage(""), 3000);
  }

  if (loading) return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Time Off</h1>
        <p className="mt-2 text-lg text-slate-600">Block out dates when you won't be available for appointments.</p>
      </div>

      <div className="rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden mb-8">
        <div className="border-b border-slate-100 bg-slate-50/50 p-6 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Coffee className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Add Time Off</h2>
          </div>
        </div>
        
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Start Date</label>
              <div className="relative">
                <CalendarDays className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-11 bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">End Date</label>
              <div className="relative">
                <CalendarDays className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-11 bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mb-6">
            <label className="text-sm font-bold text-slate-700 ml-1">Reason (optional)</label>
            <Input
              id="reason"
              placeholder="e.g., Vacation, Personal day, Conference"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-slate-50 border-slate-200 rounded-xl"
            />
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
             {message && (
                <div className={`flex items-center gap-2 font-medium ${message.includes('Error') ? 'text-red-600' : 'text-emerald-600'}`}>
                  {message.includes('Error') ? <X className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  {message}
                </div>
              )}
              {!message && <div></div>}
              
            <Button 
              onClick={handleAdd} 
              disabled={saving || !startDate || !endDate}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold"
            >
              {saving ? "Adding..." : "Add Time Off"}
              {!saving && <Plus className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Existing time offs */}
      <div className="rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 p-6 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <CalendarDays className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Scheduled Time Off</h2>
          </div>
        </div>
        
        <div className="p-6 sm:p-8">
          {timeOffs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 font-medium">No upcoming time off scheduled.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeOffs.map((off) => (
                <div
                  key={off.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-orange-200 hover:bg-orange-50/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                      <CalendarDays className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">
                        {new Date(off.start_at).toLocaleDateString()} - {new Date(off.end_at).toLocaleDateString()}
                      </p>
                      {off.reason && <p className="text-sm font-medium text-slate-500 mt-1">{off.reason}</p>}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(off.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 rounded-xl font-bold"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
