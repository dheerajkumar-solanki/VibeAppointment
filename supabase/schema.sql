-- Supabase schema for VibeAppointment
-- NOTE: Apply this in the Supabase SQL editor or migrations.

-- Helper function for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Core profiles linked to Supabase auth.users
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('patient','doctor')),
  is_admin boolean not null default false,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Clinics
create table if not exists public.clinics (
  id bigserial primary key,
  name text not null,
  address text,
  city text,
  country text,
  timezone text not null, -- e.g. 'Asia/Kolkata'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add trigger for clinics
CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Specialities (cardiology, dermatology, etc.)
create table if not exists public.specialities (
  id bigserial primary key,
  name text not null unique
);

-- Doctors
create table if not exists public.doctors (
  id bigserial primary key,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  clinic_id bigint not null references public.clinics(id) on delete restrict,
  first_name text not null,
  last_name text not null,
  degree text,
  speciality_id bigint references public.specialities(id),
  bio text,
  photo_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  avg_rating_overall numeric(2,1) default 0,
  avg_rating_effectiveness numeric(2,1) default 0,
  avg_rating_behavior numeric(2,1) default 0,
  review_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- Add trigger for doctors
CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Weekly recurring availability per doctor
create table if not exists public.doctor_availability (
  id bigserial primary key,
  doctor_id bigint not null references public.doctors(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6), -- 0=Sunday
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_time < end_time)
);

-- Add trigger for doctor_availability
CREATE TRIGGER update_doctor_availability_updated_at
  BEFORE UPDATE ON public.doctor_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Explicit time-off / blocked periods
create table if not exists public.doctor_time_off (
  id bigserial primary key,
  doctor_id bigint not null references public.doctors(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_at < end_at)
);

-- Add trigger for doctor_time_off
CREATE TRIGGER update_doctor_time_off_updated_at
  BEFORE UPDATE ON public.doctor_time_off
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

create table if not exists public.appointments (
  id bigserial primary key,
  doctor_id bigint not null references public.doctors(id) on delete restrict,
  patient_id uuid not null references public.user_profiles(id) on delete restrict,
  clinic_id bigint not null references public.clinics(id) on delete restrict,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null check (status in ('scheduled','completed','cancelled','no_show')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- enforce 30-minute duration
  check (end_at = start_at + interval '30 minutes'),
  -- avoid overlapping identical start times for a doctor
  unique (doctor_id, start_at)
);

-- Add trigger for appointments
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Reviews (one per patient/doctor per month; only for completed appointments)
create table if not exists public.reviews (
  id bigserial primary key,
  doctor_id bigint not null references public.doctors(id) on delete cascade,
  patient_id uuid not null references public.user_profiles(id) on delete cascade,
  appointment_id bigint not null references public.appointments(id) on delete cascade,
  rating_effectiveness smallint not null check (rating_effectiveness between 1 and 5),
  rating_overall smallint not null check (rating_overall between 1 and 5),
  rating_behavior smallint not null check (rating_behavior between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add trigger for reviews
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: one review per patient/doctor per calendar month
-- Note: Enforced via application logic instead of index due to date_trunc immutability issue
-- create unique index reviews_unique_patient_doctor_month
--   on public.reviews (patient_id, doctor_id, date_trunc('month', created_at));

-- Helpful indexes
create index if not exists idx_appointments_doctor_start
  on public.appointments (doctor_id, start_at);

create index if not exists idx_appointments_patient_start
  on public.appointments (patient_id, start_at);

create index if not exists idx_availability_doctor_weekday
  on public.doctor_availability (doctor_id, weekday);

create index if not exists idx_timeoff_doctor_start
  on public.doctor_time_off (doctor_id, start_at);

create index if not exists idx_reviews_doctor_created
  on public.reviews (doctor_id, created_at desc);

-- Enable Row Level Security
alter table public.user_profiles enable row level security;
alter table public.clinics enable row level security;
alter table public.specialities enable row level security;
alter table public.doctors enable row level security;
alter table public.doctor_availability enable row level security;
alter table public.doctor_time_off enable row level security;
alter table public.appointments enable row level security;
alter table public.reviews enable row level security;

-- Basic RLS policies (adjust as needed)

-- user_profiles: users can always read their own profile
drop policy if exists user_profiles_select_self on public.user_profiles;
create policy user_profiles_select_self
  on public.user_profiles
  for select
  using (auth.uid() = id);

-- user_profiles: doctors can read profiles of patients who have appointments with them
drop policy if exists user_profiles_select_doctor_patients on public.user_profiles;
create policy user_profiles_select_doctor_patients
  on public.user_profiles
  for select
  using (
    exists (
      select 1
      from public.appointments a
      join public.doctors d on d.id = a.doctor_id
      where a.patient_id = user_profiles.id
        and d.user_id = auth.uid()
    )
  );

drop policy if exists user_profiles_update_self on public.user_profiles;
create policy user_profiles_update_self
  on public.user_profiles
  for update
  using (auth.uid() = id);

drop policy if exists user_profiles_insert_self on public.user_profiles;
create policy user_profiles_insert_self
  on public.user_profiles
  for insert
  with check (auth.uid() = id);

-- clinics & specialities: readable by all authenticated users
drop policy if exists clinics_select_all on public.clinics;
create policy clinics_select_all
  on public.clinics
  for select
  to authenticated
  using (true);

-- Allow authenticated users to insert specialities
drop policy if exists specialities_insert on public.specialities;
create policy specialities_insert
  on public.specialities
  for insert
  to authenticated
  with check (true);

-- Allow authenticated users to insert clinics
drop policy if exists clinics_insert on public.clinics;
create policy clinics_insert
  on public.clinics
  for insert
  to authenticated
  with check (true);
  for select
  using (auth.role() = 'authenticated');

drop policy if exists specialities_select_all on public.specialities;
create policy specialities_select_all
  on public.specialities
  for select
  using (auth.role() = 'authenticated');

-- doctors: public read, doctors manage their own record via backend logic
drop policy if exists doctors_select_all on public.doctors;
create policy doctors_select_all
  on public.doctors
  for select
  using (true);

-- Allow authenticated users to insert their own doctor profile
drop policy if exists doctors_insert_own on public.doctors;
create policy doctors_insert_own
  on public.doctors
  for insert
  with check (auth.uid() = user_id);

-- doctor_availability: readable by all, doctors manage their own
drop policy if exists doctor_availability_select_all on public.doctor_availability;
create policy doctor_availability_select_all
  on public.doctor_availability
  for select
  using (true);

drop policy if exists doctor_availability_manage on public.doctor_availability;
create policy doctor_availability_manage
  on public.doctor_availability
  for all
  using (auth.uid() in (select user_id from doctors where id = doctor_id));

-- doctor_time_off: similar visibility
drop policy if exists doctor_time_off_select_all on public.doctor_time_off;
create policy doctor_time_off_select_all
  on public.doctor_time_off
  for select
  using (true);

drop policy if exists doctor_time_off_manage on public.doctor_time_off;
create policy doctor_time_off_manage
  on public.doctor_time_off
  for all
  using (auth.uid() in (select user_id from doctors where id = doctor_id));

-- appointments: patients see their own; doctors see their schedule
drop policy if exists appointments_select_patient on public.appointments;
create policy appointments_select_patient
  on public.appointments
  for select
  using (auth.uid() = patient_id);

drop policy if exists appointments_select_doctor on public.appointments;
create policy appointments_select_doctor
  on public.appointments
  for select
  using (exists (
    select 1
    from public.doctors d
    where d.id = appointments.doctor_id
      and d.user_id = auth.uid()
  ));

drop policy if exists appointments_insert_patient on public.appointments;
create policy appointments_insert_patient
  on public.appointments
  for insert
  with check (auth.uid() = patient_id);

drop policy if exists appointments_update_patient_or_doctor on public.appointments;
create policy appointments_update_patient_or_doctor
  on public.appointments
  for update
  using (
    auth.uid() = patient_id
    or exists (
      select 1
      from public.doctors d
      where d.id = appointments.doctor_id
        and d.user_id = auth.uid()
    )
  );

-- reviews: public read, patient manages own reviews
drop policy if exists reviews_select_all on public.reviews;
create policy reviews_select_all
  on public.reviews
  for select
  using (true);

drop policy if exists reviews_insert_self on public.reviews;
create policy reviews_insert_self
  on public.reviews
  for insert
  with check (auth.uid() = patient_id);

drop policy if exists reviews_update_self on public.reviews;
create policy reviews_update_self
  on public.reviews
  for update
  using (auth.uid() = patient_id);
