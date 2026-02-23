"use client";

import { useState, useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TimeSlot {
  start: string;
  end: string;
}

interface SlotPickerProps {
  doctorId: number;
  clinicId: number;
  onSlotSelected?: (slot: TimeSlot) => void;
}

export function SlotPicker({ doctorId, clinicId, onSlotSelected }: SlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const supabase = createSupabaseBrowserClient();

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split("T")[0];
  });

  const fetchSlots = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);
    setSlots([]);
    setSelectedSlot(null);

    try {
      const response = await fetch(
        `/api/doctors/slots/${doctorId}?date=${date}`
      );
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSlots(data.slots || []);
      }
    } catch (err) {
      setError("Failed to load slots");
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate, fetchSlots]);

  const handleBook = async () => {
    if (!selectedSlot) return;

    setBooking(true);
    setError(null);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          clinicId,
          startAt: selectedSlot.start,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setBookingSuccess(true);
        onSlotSelected?.(selectedSlot);
      }
    } catch (err) {
      setError("Failed to book appointment");
    } finally {
      setBooking(false);
    }
  };

  if (bookingSuccess) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Appointment Booked!</h3>
          <p className="mt-1 text-sm text-slate-600">
            Your appointment has been scheduled for{" "}
            {selectedSlot && new Date(selectedSlot.start).toLocaleString()}.
          </p>
          <Button
            className="mt-4"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date Selection */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Select Date</label>
        <div className="flex flex-wrap gap-2">
          {dates.map((date) => (
            <button
              key={date}
              type="button"
              onClick={() => setSelectedDate(date)}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                selectedDate === date
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="text-xs text-slate-500">
                {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="font-medium">
                {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Available Times</label>
          {loading ? (
            <p className="text-sm text-slate-500">Loading slots...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-slate-500">No available slots for this date.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {slots.map((slot, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    selectedSlot?.start === slot.start
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {new Date(slot.start).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Book Button */}
      {selectedSlot && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Selected Slot</p>
              <p className="text-sm text-slate-600">
                {new Date(selectedSlot.start).toLocaleString()}
              </p>
            </div>
            <Button onClick={handleBook} disabled={booking}>
              {booking ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
