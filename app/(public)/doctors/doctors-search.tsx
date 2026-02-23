"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function DoctorsSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/doctors?${createQueryString("search", searchValue || null)}`);
  };

  const handleFilterChange = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Keep search param when changing filters
    if (searchValue && !newParams.has("search")) {
      newParams.set("search", searchValue);
    }
    router.push(`/doctors?${newParams.toString()}`);
  };

  const clearFilters = () => {
    setSearchValue("");
    router.push("/doctors");
  };

  const hasFilters = searchParams.has("search") || searchParams.has("specialty") || searchParams.has("city");

  return (
    <section className="flex flex-col gap-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search doctors by name, specialty, or clinic..."
            className="w-full rounded-xl border-none bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-500/20 shadow-inner"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition-colors ${
              showFilters || hasFilters
                ? "bg-brand-50 text-brand-700"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasFilters && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs text-white">
                {(searchParams.get("search") ? 1 : 0) + 
                 (searchParams.get("specialty") ? 1 : 0) + 
                 (searchParams.get("city") ? 1 : 0)}
              </span>
            )}
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-50 px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Filter Doctors</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Specialty Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Specialty</label>
              <select
                value={searchParams.get("specialty") || ""}
                onChange={(e) => handleFilterChange("specialty", e.target.value || null)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">All Specialties</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="General Medicine">General Medicine</option>
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">City</label>
              <select
                value={searchParams.get("city") || ""}
                onChange={(e) => handleFilterChange("city", e.target.value || null)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">All Cities</option>
                <option value="New York">New York</option>
                <option value="Los Angeles">Los Angeles</option>
                <option value="Chicago">Chicago</option>
                <option value="Houston">Houston</option>
                <option value="Phoenix">Phoenix</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
