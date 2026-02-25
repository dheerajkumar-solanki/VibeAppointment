-- VibeAppointment Seed Data
-- Run this AFTER schema.sql to set up demo data for testing.
--
-- Prerequisites:
--   1. At least one user must exist in auth.users (sign in via the app first).
--   2. Replace the UUIDs below with real user IDs from your Supabase auth.users table.
--
-- HOW TO FIND YOUR USER ID:
--   In Supabase Dashboard → Authentication → Users → copy the UUID of the user you want to use.

-- =========================================================================
-- STEP 1: Insert a speciality
-- =========================================================================
INSERT INTO public.specialities (name)
VALUES ('General Medicine')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.specialities (name)
VALUES ('Cardiology')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.specialities (name)
VALUES ('Dermatology')
ON CONFLICT (name) DO NOTHING;

-- =========================================================================
-- STEP 2: Insert a clinic with a real IANA timezone
-- =========================================================================
INSERT INTO public.clinics (name, address, city, country, timezone)
VALUES (
  'Downtown Health Center',
  '123 Main St, Suite 200',
  'New York',
  'United States',
  'America/New_York'
);

-- =========================================================================
-- STEP 3: Create user profiles and a doctor
--
-- >>> IMPORTANT: Replace these UUIDs with actual user IDs from your
-- >>> Supabase auth.users table. Sign in with two different accounts first:
-- >>>   - One for the DOCTOR
-- >>>   - One for the PATIENT / ADMIN
-- =========================================================================

-- Doctor user profile (replace UUID)
-- INSERT INTO public.user_profiles (id, role, is_admin, full_name)
-- VALUES ('REPLACE-WITH-DOCTOR-USER-UUID', 'doctor', false, 'Dr. Sarah Jenkins')
-- ON CONFLICT (id) DO UPDATE SET role = 'doctor', full_name = 'Dr. Sarah Jenkins';

-- Patient + Admin user profile (replace UUID)
-- INSERT INTO public.user_profiles (id, role, is_admin, full_name)
-- VALUES ('REPLACE-WITH-PATIENT-USER-UUID', 'patient', true, 'Test Admin')
-- ON CONFLICT (id) DO UPDATE SET is_admin = true, full_name = 'Test Admin';

-- =========================================================================
-- STEP 4: Create an APPROVED doctor
--
-- >>> Replace the user_id UUID and ensure clinic_id/speciality_id match
-- >>> the records inserted above.
-- =========================================================================

-- INSERT INTO public.doctors (
--   user_id, clinic_id, first_name, last_name, degree,
--   speciality_id, bio, status
-- )
-- VALUES (
--   'REPLACE-WITH-DOCTOR-USER-UUID',
--   1,  -- clinic_id from Step 2
--   'Sarah',
--   'Jenkins',
--   'MD, Internal Medicine',
--   1,  -- speciality_id from Step 1 (General Medicine)
--   'Board-certified internist with 10+ years of experience in primary care.',
--   'approved'
-- );

-- =========================================================================
-- STEP 5: Set up weekly availability for the doctor
-- (Monday through Friday, 9:00 AM - 5:00 PM local clinic time)
-- =========================================================================

-- >>> Uncomment and replace doctor_id (likely 1 if this is the first doctor)

-- Monday (weekday = 1)
-- INSERT INTO public.doctor_availability (doctor_id, weekday, start_time, end_time)
-- VALUES (1, 1, '09:00', '17:00');

-- Tuesday (weekday = 2)
-- INSERT INTO public.doctor_availability (doctor_id, weekday, start_time, end_time)
-- VALUES (1, 2, '09:00', '17:00');

-- Wednesday (weekday = 3)
-- INSERT INTO public.doctor_availability (doctor_id, weekday, start_time, end_time)
-- VALUES (1, 3, '09:00', '17:00');

-- Thursday (weekday = 4)
-- INSERT INTO public.doctor_availability (doctor_id, weekday, start_time, end_time)
-- VALUES (1, 4, '09:00', '17:00');

-- Friday (weekday = 5)
-- INSERT INTO public.doctor_availability (doctor_id, weekday, start_time, end_time)
-- VALUES (1, 5, '09:00', '17:00');

-- =========================================================================
-- Quick verification queries
-- =========================================================================
-- SELECT * FROM public.specialities;
-- SELECT * FROM public.clinics;
-- SELECT * FROM public.user_profiles;
-- SELECT * FROM public.doctors;
-- SELECT * FROM public.doctor_availability;
