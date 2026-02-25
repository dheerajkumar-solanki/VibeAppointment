"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-100">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>

      <h2 className="mb-3 text-2xl font-bold text-slate-900">
        Could not load admin dashboard
      </h2>

      <p className="mx-auto mb-8 max-w-sm text-slate-600">
        Something went wrong while loading the admin panel. Please try again.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
      </div>
    </div>
  );
}
