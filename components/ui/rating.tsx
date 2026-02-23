"use client";

import { useState } from "react";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
  showValue = true,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating ?? rating;
  const starClass = sizeClasses[size];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"} ${interactive ? "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2" : ""} rounded-full p-0.5`}
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(null)}
          onFocus={() => interactive && setHoverRating(star)}
        >
          <svg
            className={`${starClass} ${star <= displayRating ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200"}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
      {showValue && (
        <span className="ml-1 text-sm text-slate-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
