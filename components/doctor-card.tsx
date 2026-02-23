import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { RatingStars } from "@/components/ui/rating";
import { MapPin, Stethoscope, ChevronRight, Award } from "lucide-react";

interface Doctor {
  id: number;
  first_name?: string;
  last_name?: string;
  user_id: string;
  clinic_id: number;
  degree: string | null;
  speciality_id: number | null;
  bio: string | null;
  photo_url: string | null;
  avg_rating_overall: number;
  avg_rating_effectiveness: number;
  avg_rating_behavior: number;
  review_count: number;
  created_at: string;
  full_name?: string;
  speciality_name?: string;
  clinic_name?: string;
  clinic_city?: string;
}

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const fullName = doctor.full_name || `${doctor.first_name || ""} ${doctor.last_name || ""}`.trim() || "Unknown Doctor";

  return (
    <Link href={`/doctors/${doctor.id}`} className="block h-full">
      <Card className="group relative h-full overflow-hidden border-slate-200/60 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-200">
        <CardContent className="flex h-full flex-col p-6">
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-brand-50 ring-1 ring-slate-100 sm:h-20 sm:w-20">
              {doctor.photo_url ? (
                <img
                  src={doctor.photo_url}
                  alt={fullName}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50 text-xl font-bold text-brand-600">
                  {(fullName?.charAt(0) || "D").toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col justify-center min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="truncate text-lg font-bold text-slate-900 transition-colors group-hover:text-brand-600">
                    Dr. {fullName}
                  </h3>
                  {doctor.degree && (
                    <p className="truncate text-sm font-medium text-slate-500">{doctor.degree}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tags & Location */}
          <div className="mt-6 flex flex-col gap-3">
            {doctor.speciality_name && (
              <div className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-600/10">
                <Stethoscope className="h-3.5 w-3.5" />
                {doctor.speciality_name}
              </div>
            )}

            {doctor.clinic_name && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate">
                  {doctor.clinic_name}
                  {doctor.clinic_city && <span className="text-slate-400">, {doctor.clinic_city}</span>}
                </span>
              </div>
            )}
          </div>

          {/* Footer: Reviews & Action */}
          <div className="mt-auto pt-6">
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              {doctor.review_count > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-md bg-yellow-50 px-2 py-1 text-xs font-bold text-yellow-700">
                    <Award className="h-3.5 w-3.5" />
                    {doctor.avg_rating_overall.toFixed(1)}
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    ({doctor.review_count} review{doctor.review_count !== 1 ? "s" : ""})
                  </span>
                </div>
              ) : (
                <span className="text-xs font-medium text-slate-400">No reviews yet</span>
              )}

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors group-hover:bg-brand-50 group-hover:text-brand-600">
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
