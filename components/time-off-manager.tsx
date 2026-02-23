"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface TimeOff {
  id: number;
  doctor_id: number;
  start_at: string;
  end_at: string;
  reason: string | null;
}

interface TimeOffManagerProps {
  doctorId: number;
  existingTimeOff: TimeOff[];
}

export function TimeOffManager({ doctorId, existingTimeOff }: TimeOffManagerProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from("doctor_time_off")
        .insert({
          doctor_id: doctorId,
          start_at: new Date(startDate).toISOString(),
          end_at: new Date(endDate).toISOString(),
          reason: reason || null,
        });

      if (insertError) throw insertError;
      
      setShowForm(false);
      setStartDate("");
      setEndDate("");
      setReason("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to add time off");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("doctor_time_off")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete time off");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!showForm ? (
        <Button onClick={() => setShowForm(true)}>+ Add Time Off</Button>
      ) : (
        <form onSubmit={handleAdd} className="space-y-4 rounded-lg border border-slate-200 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason (optional)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Holiday, Conference, Personal"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Time Off"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {error && (
        <div className="p-3 rounded-md bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}

      {existingTimeOff.length === 0 && !showForm ? (
        <p className="text-sm text-slate-500">No upcoming time off scheduled.</p>
      ) : (
        <div className="space-y-2">
          {existingTimeOff.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {new Date(item.start_at).toLocaleDateString()} - {new Date(item.end_at).toLocaleDateString()}
                </p>
                {item.reason && (
                  <p className="text-sm text-slate-500">{item.reason}</p>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(item.id)}
                disabled={loading}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
