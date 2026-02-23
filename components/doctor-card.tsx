import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { RatingStars } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";

interface Doctor {
  id: number;
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
  return (
    <Link href={`/doctors/${doctor.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 text-2xl font-semibold text-slate-400">
              {doctor.photo_url ? (
                <img
                  src={doctor.photo_url}
                  alt={doctor.full_name || "Doctor"}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                (doctor.full_name?.charAt(0) || "D").toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-slate-900">
                Dr. {doctor.full_name || "Unknown"}
              </h3>
              {doctor.speciality_name && (
                <Badge variant="info" className="mt-1">
                  {doctor.speciality_name}
                </Badge>
              )}
              {doctor.degree && (
                <p className="mt-1 text-sm text-slate-600">{doctor.degree}</p>
              )}
              {doctor.clinic_name && (
                <p className="mt-1 text-sm text-slate-500">
                  {doctor.clinic_name}
                  {doctor.clinic_city && `, ${doctor.clinic_city}`}
                </p>
              )}
            </div>
          </div>
          {doctor.review_count > 0 && (
            <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Overall:</span>
                <RatingStars
                  rating={doctor.avg_rating_overall || 0}
                  size="sm"
                  showValue={true}
                />
              </div>
              <span className="text-sm text-slate-500">
                ({doctor.review_count} review{doctor.review_count !== 1 ? "s" : ""})
              </span>
            </div>
          )}
          {doctor.review_count === 0 && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-500">No reviews yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
