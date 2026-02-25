import { z } from "zod";

export const createAppointmentSchema = z.object({
  doctorId: z.coerce.number().int().positive("doctorId must be a positive integer"),
  clinicId: z.coerce.number().int().positive("clinicId must be a positive integer"),
  startAt: z.string().refine((v) => !Number.isNaN(new Date(v).getTime()), {
    message: "startAt must be a valid ISO date string",
  }),
});

const appointmentStatus = z.enum([
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "declined",
  "no_show",
]);

export const updateAppointmentSchema = z
  .object({
    status: appointmentStatus.optional(),
    patientAck: z.boolean().optional(),
  })
  .refine((data) => data.status !== undefined || data.patientAck !== undefined, {
    message: "Either status or patientAck must be provided",
  });

const ratingField = z.coerce
  .number()
  .int()
  .min(1, "Rating must be between 1 and 5")
  .max(5, "Rating must be between 1 and 5");

export const createReviewSchema = z.object({
  doctorId: z.coerce.number().int().positive("doctorId must be a positive integer"),
  appointmentId: z.coerce.number().int().positive("appointmentId must be a positive integer"),
  ratingEffectiveness: ratingField,
  ratingOverall: ratingField,
  ratingBehavior: ratingField,
  comment: z.string().max(2000).nullable().optional(),
});

export const otpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits").optional(),
});

export const doctorRegistrationSchema = z.object({
  clinic_id: z.coerce.number().int().positive().optional(),
  clinic_name: z.string().min(1, "Clinic name is required").optional(),
  clinic_address: z.string().optional(),
  clinic_city: z.string().optional(),
  clinic_country: z.string().optional(),
  clinic_timezone: z.string().default("UTC"),
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  degree: z.string().min(1, "Degree is required").max(200),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(2000),
  speciality_id: z.coerce.number().int().positive().optional(),
  new_speciality: z.string().max(100).optional(),
}).refine(
  (data) => data.clinic_id || data.clinic_name,
  { message: "Either select an existing clinic or provide a clinic name", path: ["clinic_id"] }
);

export function formatZodErrors(error: z.ZodError) {
  return {
    error: "Validation failed",
    details: error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })),
  };
}
