"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { SlidersHorizontal, X, Check } from "lucide-react";

interface DoctorsFilterProps {
  specialties: string[];
  clinics: string[];
}

export default function DoctorsFilter({ specialties, clinics }: DoctorsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeSpecialty = searchParams.get("specialty") || "";
  const activeClinic = searchParams.get("clinic") || "";
  const hasActiveFilters = !!activeSpecialty || !!activeClinic;

  const [showFilters, setShowFilters] = useState(hasActiveFilters);
  const [selectedSpecialty, setSelectedSpecialty] = useState(activeSpecialty);
  const [selectedClinic, setSelectedClinic] = useState(activeClinic);

  useEffect(() => {
    setSelectedSpecialty(activeSpecialty);
    setSelectedClinic(activeClinic);
  }, [activeSpecialty, activeClinic]);

  const isDirty = selectedSpecialty !== activeSpecialty || selectedClinic !== activeClinic;

  const handleApply = () => {
    const params = new URLSearchParams();
    if (selectedSpecialty) params.set("specialty", selectedSpecialty);
    if (selectedClinic) params.set("clinic", selectedClinic);
    const qs = params.toString();
    router.push(`/doctors${qs ? `?${qs}` : ""}`);
  };

  const handleClear = () => {
    setSelectedSpecialty("");
    setSelectedClinic("");
    router.push("/doctors");
  };

  const filterCount = (activeSpecialty ? 1 : 0) + (activeClinic ? 1 : 0);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition-colors ${
            showFilters || hasActiveFilters
              ? "bg-brand-50 text-brand-700"
              : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {filterCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs text-white">
              {filterCount}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-50 px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
          >
            <X className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {showFilters && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-slate-900">Filter Doctors</h3>
            {hasActiveFilters && !isDirty && (
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                Filters applied
              </span>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Specialty
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">All Specialties</option>
                {specialties.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Clinic
              </label>
              <select
                value={selectedClinic}
                onChange={(e) => setSelectedClinic(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">All Clinics</option>
                {clinics.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={handleApply}
              disabled={!isDirty && !hasActiveFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4" />
              Apply Filters
            </button>
            {(hasActiveFilters || isDirty) && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
