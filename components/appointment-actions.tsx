"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";

interface AppointmentActionsProps {
  appointmentId: number;
  currentStatus: string;
}

export function AppointmentActions({
  appointmentId,
  currentStatus,
}: AppointmentActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const terminalStatuses = ["completed", "cancelled", "declined", "no_show"];
  if (terminalStatuses.includes(currentStatus)) {
    const variant =
      currentStatus === "completed"
        ? "success"
        : currentStatus === "declined" || currentStatus === "cancelled"
          ? "error"
          : "warning";

    return (
      <Badge variant={variant} className="w-fit capitalize">
        {currentStatus.replace("_", " ")}
      </Badge>
    );
  }

  async function updateStatus(newStatus: string) {
    const messages: Record<string, { confirm: string; success: string }> = {
      confirmed: {
        confirm: "Confirm this appointment?",
        success: "Appointment confirmed",
      },
      completed: {
        confirm: "Mark this appointment as completed?",
        success: "Appointment marked as completed",
      },
      declined: {
        confirm: "Decline this appointment request?",
        success: "Appointment declined",
      },
      cancelled: {
        confirm: "Cancel this appointment?",
        success: "Appointment cancelled",
      },
      no_show: {
        confirm: "Mark this patient as no-show?",
        success: "Patient marked as no-show",
      },
    };

    const msg = messages[newStatus];
    if (!msg) return;

    if (!window.confirm(msg.confirm)) return;

    setLoading(newStatus);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update appointment");
      }

      toast.success(msg.success);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  if (currentStatus === "scheduled") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="primary"
          className="rounded-full bg-brand-500 hover:bg-brand-600 focus:ring-brand-500 text-white gap-1.5"
          onClick={() => updateStatus("confirmed")}
          disabled={loading !== null}
        >
          {loading === "confirmed" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ThumbsUp className="h-3.5 w-3.5" />
          )}
          Confirm
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="rounded-full gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 focus:ring-red-500"
          onClick={() => updateStatus("declined")}
          disabled={loading !== null}
        >
          {loading === "declined" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          Decline
        </Button>
      </div>
    );
  }

  // currentStatus === "confirmed"
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        variant="primary"
        className="rounded-full bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white gap-1.5"
        onClick={() => updateStatus("completed")}
        disabled={loading !== null}
      >
        {loading === "completed" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5" />
        )}
        Complete
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="rounded-full gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-800 focus:ring-amber-500"
        onClick={() => updateStatus("no_show")}
        disabled={loading !== null}
      >
        {loading === "no_show" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <AlertTriangle className="h-3.5 w-3.5" />
        )}
        No Show
      </Button>

      <Button
        size="sm"
        variant="ghost"
        className="rounded-full gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 focus:ring-red-500"
        onClick={() => updateStatus("cancelled")}
        disabled={loading !== null}
      >
        {loading === "cancelled" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <XCircle className="h-3.5 w-3.5" />
        )}
        Cancel
      </Button>
    </div>
  );
}
