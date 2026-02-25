"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RatingStars } from "@/components/ui/rating";
import { Textarea } from "@/components/ui/input";
import { toast } from "sonner";

interface ReviewFormProps {
  doctorId: number;
  appointmentId: number;
}

export function ReviewForm({ doctorId, appointmentId }: ReviewFormProps) {
  const router = useRouter();
  const [ratingOverall, setRatingOverall] = useState(0);
  const [ratingEffectiveness, setRatingEffectiveness] = useState(0);
  const [ratingBehavior, setRatingBehavior] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ratingOverall || !ratingEffectiveness || !ratingBehavior) {
      const msg = "Please provide all three ratings before submitting";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          appointmentId,
          ratingOverall,
          ratingEffectiveness,
          ratingBehavior,
          comment: comment || null,
        }),
      });

      const data = await response.json();

      if (data.error) {
        const msg = data.error === "Validation failed" && data.details
          ? data.details.map((d: { message: string }) => d.message).join(", ")
          : data.error;
        setError(msg);
        toast.error(msg);
      } else {
        toast.success("Review submitted — thank you!");
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Failed to submit review");
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          How would you rate the overall experience?
        </label>
        <RatingStars
          rating={ratingOverall}
          interactive
          onChange={setRatingOverall}
          size="lg"
          showValue={false}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          How effective was the treatment?
        </label>
        <RatingStars
          rating={ratingEffectiveness}
          interactive
          onChange={setRatingEffectiveness}
          size="lg"
          showValue={false}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          How was the doctor&apos;s behavior and communication?
        </label>
        <RatingStars
          rating={ratingBehavior}
          interactive
          onChange={setRatingBehavior}
          size="lg"
          showValue={false}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Additional comments (optional)
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
        />
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Review"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
