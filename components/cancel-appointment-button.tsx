"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Ban, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CancelAppointmentButtonProps {
  appointmentId: number;
}

export function CancelAppointmentButton({ appointmentId }: CancelAppointmentButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCancel() {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-red-600">Cancel this appointment?</span>
        <Button
          size="sm"
          onClick={handleCancel}
          disabled={loading}
          className="rounded-full bg-red-600 text-white hover:bg-red-700 text-xs px-3"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Yes, cancel"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="rounded-full text-xs text-slate-500 hover:text-slate-700"
        >
          No
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => setConfirming(true)}
      className="rounded-full text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
    >
      <Ban className="h-3.5 w-3.5 mr-1" />
      Cancel
    </Button>
  );
}
