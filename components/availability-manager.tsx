"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Availability {
  id: number;
  doctor_id: number;
  weekday: number;
  start_time: string;
  end_time: string;
}

interface AvailabilityManagerProps {
  doctorId: number;
  existingAvailability: Availability[];
}

const WEEKDAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function AvailabilityManager({ doctorId, existingAvailability }: AvailabilityManagerProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Group existing availability by weekday
  const availabilityByDay = WEEKDAYS.map(day => ({
    ...day,
    slots: existingAvailability.filter(a => a.weekday === day.value)
  }));

  const handleAddSlot = async (weekday: number, startTime: string, endTime: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from("doctor_availability")
        .insert({
          doctor_id: doctorId,
          weekday,
          start_time: startTime,
          end_time: endTime,
        });

      if (insertError) throw insertError;
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to add availability");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("doctor_availability")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete availability");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {availabilityByDay.map((day) => (
        <div key={day.value} className="border-b border-slate-100 pb-4 last:border-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-slate-900">{day.label}</h3>
            <AddSlotForm 
              weekday={day.value} 
              onAdd={handleAddSlot} 
              loading={loading}
            />
          </div>
          {day.slots.length === 0 ? (
            <p className="text-sm text-slate-500">Not available</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {day.slots.map((slot) => (
                <div
                  key={slot.id}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700"
                >
                  <span>
                    {slot.start_time} - {slot.end_time}
                  </span>
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="text-brand-500 hover:text-brand-700"
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {error && (
        <div className="p-3 rounded-md bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}

function AddSlotForm({ weekday, onAdd, loading }: { weekday: number; onAdd: (weekday: number, start: string, end: string) => void; loading: boolean }) {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(weekday, startTime, endTime);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button size="sm" variant="outline" onClick={() => setIsOpen(true)}>
        + Add Time
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="rounded border border-slate-300 px-2 py-1 text-sm"
        required
      />
      <span className="text-sm text-slate-500">to</span>
      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="rounded border border-slate-300 px-2 py-1 text-sm"
        required
      />
      <Button type="submit" size="sm" disabled={loading}>
        Add
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
    </form>
  );
}
