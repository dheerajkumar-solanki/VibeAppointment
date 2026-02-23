"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Save, CheckCircle2 } from "lucide-react";

const weekdays = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function AvailabilityPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [availability, setAvailability] = useState<Record<number, { start: string; end: string; enabled: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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
          .from("doctor_availability")
          .select("*")
          .eq("doctor_id", doctor.id);

        const avail: Record<number, { start: string; end: string; enabled: boolean }> = {};
        weekdays.forEach((day) => {
          avail[day.value] = { start: "09:00", end: "17:00", enabled: false };
        });

        existing?.forEach((a) => {
          avail[a.weekday] = {
            start: a.start_time,
            end: a.end_time,
            enabled: true,
          };
        });

        setAvailability(avail);
      }
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  async function handleSave() {
    if (!doctorId) return;
    setSaving(true);
    setMessage("");

    // Delete existing availability
    await supabase.from("doctor_availability").delete().eq("doctor_id", doctorId);

    // Insert new availability
    const toInsert = weekdays
      .filter((day) => availability[day.value]?.enabled)
      .map((day) => ({
        doctor_id: doctorId,
        weekday: day.value,
        start_time: availability[day.value].start,
        end_time: availability[day.value].end,
      }));

    if (toInsert.length > 0) {
      await supabase.from("doctor_availability").insert(toInsert);
    }

    setMessage("Availability updated successfully!");
    setSaving(false);
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
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Manage Availability</h1>
        <p className="mt-2 text-lg text-slate-600">Set your weekly working schedule for patient appointments.</p>
      </div>

      <div className="rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 p-6 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Calendar className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Weekly Schedule</h2>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {weekdays.map((day) => (
            <div key={day.value} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-slate-100/50">
              <div className="flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={availability[day.value]?.enabled || false}
                      onChange={(e) =>
                        setAvailability((prev) => ({
                          ...prev,
                          [day.value]: { ...prev[day.value], enabled: e.target.checked },
                        }))
                      }
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white transition-all checked:border-brand-500 checked:bg-brand-500 hover:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                    <svg className="pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 text-white" viewBox="0 0 14 14" fill="none">
                      <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className={`font-bold transition-colors ${availability[day.value]?.enabled ? 'text-slate-900' : 'text-slate-500'}`}>{day.label}</span>
                </label>
              </div>
              
              <div className={`flex items-center gap-3 transition-opacity duration-200 ${availability[day.value]?.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="time"
                    value={availability[day.value]?.start || "09:00"}
                    onChange={(e) =>
                      setAvailability((prev) => ({
                        ...prev,
                        [day.value]: { ...prev[day.value], start: e.target.value },
                      }))
                    }
                    disabled={!availability[day.value]?.enabled}
                    className="w-36 pl-10 bg-white"
                  />
                </div>
                <span className="text-slate-400 font-medium">to</span>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="time"
                    value={availability[day.value]?.end || "17:00"}
                    onChange={(e) =>
                      setAvailability((prev) => ({
                        ...prev,
                        [day.value]: { ...prev[day.value], end: e.target.value },
                      }))
                    }
                    disabled={!availability[day.value]?.enabled}
                    className="w-36 pl-10 bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 p-6 sm:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              {message && (
                <div className="flex items-center gap-2 text-emerald-600 font-medium animate-fade-in">
                  <CheckCircle2 className="h-5 w-5" />
                  {message}
                </div>
              )}
            </div>
            <Button 
              onClick={handleSave} 
              disabled={saving} 
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10 rounded-xl px-8 font-bold"
            >
              {saving ? "Saving..." : "Save Schedule"}
              {!saving && <Save className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
