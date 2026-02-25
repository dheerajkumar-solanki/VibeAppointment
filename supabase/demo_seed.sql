-- ============================================================================
-- VibeAppointment Demo Seed Data
-- Run AFTER schema.sql to set up test accounts and demo data.
-- ============================================================================
--
-- SETUP INSTRUCTIONS (5 minutes):
--
-- 1. Sign in to the app with THREE email addresses (OTP/Google) to create
--    their auth.users entries:
--      • admin+patient : admin@vibeappointment.demo  (will be patient + admin)
--      • doctor 1      : doctor1@vibeappointment.demo
--      • doctor 2      : doctor2@vibeappointment.demo
--
-- 2. Open the Supabase Dashboard → Authentication → Users and copy each UUID.
--
-- 3. Find & replace the placeholder values in this file before running:
--      PATIENT_ADMIN_UUID  → UUID of admin@vibeappointment.demo
--      DOCTOR1_UUID        → UUID of doctor1@vibeappointment.demo
--      DOCTOR2_UUID        → UUID of doctor2@vibeappointment.demo
--
--    Quick sed commands (run in terminal from the project root):
--      sed -i '' 's/PATIENT_ADMIN_UUID/<actual-uuid>/g' supabase/demo_seed.sql
--      sed -i '' 's/DOCTOR1_UUID/<actual-uuid>/g'       supabase/demo_seed.sql
--      sed -i '' 's/DOCTOR2_UUID/<actual-uuid>/g'       supabase/demo_seed.sql
--
-- 4. Paste the resulting SQL into Supabase Dashboard → SQL Editor and run.
--
-- TEST ACCOUNTS (after seeding):
--   Admin/Patient : admin@vibeappointment.demo  (use OTP to sign in)
--   Doctor 1      : doctor1@vibeappointment.demo
--   Doctor 2      : doctor2@vibeappointment.demo
-- ============================================================================

-- ============================================================================
-- STEP 1: Specialities
-- ============================================================================
INSERT INTO public.specialities (name) VALUES
  ('General Medicine'),
  ('Cardiology'),
  ('Dermatology'),
  ('Pediatrics'),
  ('Orthopedics')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- STEP 2: Clinic
-- ============================================================================
INSERT INTO public.clinics (name, address, city, country, timezone)
VALUES (
  'Downtown Health Center',
  '123 Main St, Suite 200',
  'New York',
  'United States',
  'America/New_York'
)
ON CONFLICT DO NOTHING;

-- Capture clinic id (assumes this is id=1, adjust if needed)
DO $$
DECLARE
  v_clinic_id    bigint;
  v_spec_gm_id   bigint;
  v_spec_card_id bigint;
  v_doctor1_id   bigint;
  v_doctor2_id   bigint;
  v_appt1_id     bigint;
  v_appt2_id     bigint;
  v_appt3_id     bigint;
  v_appt4_id     bigint;
BEGIN

  SELECT id INTO v_clinic_id   FROM public.clinics      WHERE name = 'Downtown Health Center' LIMIT 1;
  SELECT id INTO v_spec_gm_id  FROM public.specialities WHERE name = 'General Medicine'       LIMIT 1;
  SELECT id INTO v_spec_card_id FROM public.specialities WHERE name = 'Cardiology'            LIMIT 1;

  -- ==========================================================================
  -- STEP 3: User profiles
  -- ==========================================================================

  -- Patient who is also the admin
  INSERT INTO public.user_profiles (id, role, is_admin, full_name)
  VALUES ('PATIENT_ADMIN_UUID', 'patient', true, 'Alex Demo (Admin)')
  ON CONFLICT (id) DO UPDATE SET
    role     = 'patient',
    is_admin = true,
    full_name = 'Alex Demo (Admin)';

  -- Doctor 1
  INSERT INTO public.user_profiles (id, role, is_admin, full_name)
  VALUES ('DOCTOR1_UUID', 'doctor', false, 'Dr. Sarah Jenkins')
  ON CONFLICT (id) DO UPDATE SET
    role      = 'doctor',
    is_admin  = false,
    full_name = 'Dr. Sarah Jenkins';

  -- Doctor 2
  INSERT INTO public.user_profiles (id, role, is_admin, full_name)
  VALUES ('DOCTOR2_UUID', 'doctor', false, 'Dr. Michael Chen')
  ON CONFLICT (id) DO UPDATE SET
    role      = 'doctor',
    is_admin  = false,
    full_name = 'Dr. Michael Chen';

  -- ==========================================================================
  -- STEP 4: Approved doctor profiles
  -- ==========================================================================

  INSERT INTO public.doctors (
    user_id, clinic_id, first_name, last_name, degree,
    speciality_id, bio, status
  )
  VALUES (
    'DOCTOR1_UUID',
    v_clinic_id,
    'Sarah',
    'Jenkins',
    'MD, Internal Medicine',
    v_spec_gm_id,
    'Board-certified internist with 10+ years of experience in primary care. '
    'Specialising in preventive medicine, chronic disease management, and '
    'whole-patient wellness. Fluent in English and Spanish.',
    'approved'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    status        = 'approved',
    clinic_id     = v_clinic_id,
    speciality_id = v_spec_gm_id
  RETURNING id INTO v_doctor1_id;

  IF v_doctor1_id IS NULL THEN
    SELECT id INTO v_doctor1_id FROM public.doctors WHERE user_id = 'DOCTOR1_UUID';
  END IF;

  INSERT INTO public.doctors (
    user_id, clinic_id, first_name, last_name, degree,
    speciality_id, bio, status
  )
  VALUES (
    'DOCTOR2_UUID',
    v_clinic_id,
    'Michael',
    'Chen',
    'MD, FACC',
    v_spec_card_id,
    'Interventional cardiologist with expertise in heart failure, arrhythmias, '
    'and preventive cardiology. Completed fellowships at Johns Hopkins and '
    'NYU Langone. Passionate about patient education.',
    'approved'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    status        = 'approved',
    clinic_id     = v_clinic_id,
    speciality_id = v_spec_card_id
  RETURNING id INTO v_doctor2_id;

  IF v_doctor2_id IS NULL THEN
    SELECT id INTO v_doctor2_id FROM public.doctors WHERE user_id = 'DOCTOR2_UUID';
  END IF;

  -- ==========================================================================
  -- STEP 5: Weekly availability — Mon–Fri 9 AM–5 PM (clinic local time)
  -- weekday: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  -- ==========================================================================

  -- Clear old availability first so re-runs are idempotent
  DELETE FROM public.doctor_availability WHERE doctor_id IN (v_doctor1_id, v_doctor2_id);

  INSERT INTO public.doctor_availability (doctor_id, weekday, start_time, end_time)
  SELECT v_doctor1_id, d, '09:00', '17:00'
  FROM generate_series(1, 5) AS d; -- Mon–Fri

  INSERT INTO public.doctor_availability (doctor_id, weekday, start_time, end_time)
  SELECT v_doctor2_id, d, '09:00', '17:00'
  FROM generate_series(1, 5) AS d; -- Mon–Fri

  -- ==========================================================================
  -- STEP 6: Appointments in various statuses
  -- All times in UTC; clinic is America/New_York (UTC-5 in winter / UTC-4 in summer).
  -- 9 AM New York = 14:00 UTC (EST) or 13:00 UTC (EDT).
  -- We use 14:00 UTC which maps to 9 AM EST (safe for demo purposes).
  -- ==========================================================================

  -- Past completed appointment (patient → doctor 1, last week Monday)
  INSERT INTO public.appointments (
    doctor_id, patient_id, clinic_id, start_at, end_at, status
  )
  VALUES (
    v_doctor1_id,
    'PATIENT_ADMIN_UUID',
    v_clinic_id,
    (date_trunc('week', now() - interval '7 days') + interval '1 day' + interval '14 hours')::timestamptz,
    (date_trunc('week', now() - interval '7 days') + interval '1 day' + interval '14 hours 30 minutes')::timestamptz,
    'completed'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_appt1_id;

  -- Past completed appointment (patient → doctor 2, last week Tuesday)
  INSERT INTO public.appointments (
    doctor_id, patient_id, clinic_id, start_at, end_at, status
  )
  VALUES (
    v_doctor2_id,
    'PATIENT_ADMIN_UUID',
    v_clinic_id,
    (date_trunc('week', now() - interval '7 days') + interval '2 days' + interval '14 hours')::timestamptz,
    (date_trunc('week', now() - interval '7 days') + interval '2 days' + interval '14 hours 30 minutes')::timestamptz,
    'completed'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_appt2_id;

  -- Future confirmed appointment (patient → doctor 1, next Monday)
  INSERT INTO public.appointments (
    doctor_id, patient_id, clinic_id, start_at, end_at, status
  )
  VALUES (
    v_doctor1_id,
    'PATIENT_ADMIN_UUID',
    v_clinic_id,
    (date_trunc('week', now() + interval '7 days') + interval '1 day' + interval '14 hours')::timestamptz,
    (date_trunc('week', now() + interval '7 days') + interval '1 day' + interval '14 hours 30 minutes')::timestamptz,
    'confirmed'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_appt3_id;

  -- Future scheduled appointment (patient → doctor 2, next Tuesday)
  INSERT INTO public.appointments (
    doctor_id, patient_id, clinic_id, start_at, end_at, status
  )
  VALUES (
    v_doctor2_id,
    'PATIENT_ADMIN_UUID',
    v_clinic_id,
    (date_trunc('week', now() + interval '7 days') + interval '2 days' + interval '14 hours')::timestamptz,
    (date_trunc('week', now() + interval '7 days') + interval '2 days' + interval '14 hours 30 minutes')::timestamptz,
    'scheduled'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_appt4_id;

  -- ==========================================================================
  -- STEP 7: Reviews for the two completed appointments
  -- ==========================================================================

  IF v_appt1_id IS NOT NULL THEN
    INSERT INTO public.reviews (
      doctor_id, patient_id, appointment_id,
      rating_effectiveness, rating_overall, rating_behavior,
      comment
    )
    VALUES (
      v_doctor1_id,
      'PATIENT_ADMIN_UUID',
      v_appt1_id,
      5, 5, 5,
      'Dr. Jenkins was incredibly thorough and took time to explain everything. '
      'Highly recommend!'
    )
    ON CONFLICT (appointment_id) DO NOTHING;
  END IF;

  IF v_appt2_id IS NOT NULL THEN
    INSERT INTO public.reviews (
      doctor_id, patient_id, appointment_id,
      rating_effectiveness, rating_overall, rating_behavior,
      comment
    )
    VALUES (
      v_doctor2_id,
      'PATIENT_ADMIN_UUID',
      v_appt2_id,
      4, 5, 5,
      'Very knowledgeable cardiologist. Wait time was minimal and the appointment '
      'was professional from start to finish.'
    )
    ON CONFLICT (appointment_id) DO NOTHING;
  END IF;

END;
$$;

-- ============================================================================
-- Verification queries — run these to confirm seed succeeded
-- ============================================================================
-- SELECT * FROM public.specialities;
-- SELECT id, name, city, timezone FROM public.clinics;
-- SELECT id, full_name, role, is_admin FROM public.user_profiles;
-- SELECT id, first_name, last_name, status, avg_rating_overall, review_count FROM public.doctors;
-- SELECT doctor_id, weekday, start_time, end_time FROM public.doctor_availability ORDER BY doctor_id, weekday;
-- SELECT id, doctor_id, patient_id, status, start_at FROM public.appointments ORDER BY start_at;
-- SELECT id, doctor_id, rating_overall, comment FROM public.reviews;
