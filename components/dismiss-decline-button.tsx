"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface DismissDeclineButtonProps {
  appointmentId: number;
}

export function DismissDeclineButton({ appointmentId }: DismissDeclineButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDismiss() {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientAck: true }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleDismiss}
      disabled={loading}
      className="rounded-full text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-2"
      title="Dismiss"
    >
      <X className="h-4 w-4" />
    </Button>
  );
}
