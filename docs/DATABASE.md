# Database Guide

VibeAppointment uses **Supabase** (managed PostgreSQL) as its data layer. All schema definitions, indexes, triggers, and Row Level Security (RLS) policies live in [`supabase/schema.sql`](../supabase/schema.sql).

---

## Entity-Relationship Overview

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  auth.users  │       │  specialities│       │    clinics   │
│  (Supabase)  │       │              │       │              │
└──────┬───────┘       └──────┬───────┘       └──────┬───────┘
       │ 1:1                  │ 1:N                  │ 1:N
       ▼                      ▼                      ▼
┌──────────────┐       ┌──────────────────────────────────────┐
│ user_profiles│       │              doctors                 │
│              │◄──────│  user_id, speciality_id, clinic_id   │
└──────┬───────┘       └──────┬──────────────────┬────────────┘
       │                      │                  │
       │                      │ 1:N              │ 1:N
       │                      ▼                  ▼
       │               ┌──────────────┐   ┌──────────────────┐
       │               │doctor_       │   │doctor_time_off   │
       │               │availability  │   │                  │
       │               └──────────────┘   └──────────────────┘
       │
       │              ┌──────────────────┐
       │    N:1       │   appointments   │     1:1     ┌─────────┐
       └─────────────►│ doctor_id,       │────────────►│ reviews │
                      │ patient_id       │             │         │
                      └──────────────────┘             └─────────┘
```

---

## Tables

### `user_profiles`

Linked 1:1 with Supabase `auth.users`. Created automatically on first sign-in.

| Column       | Type         | Notes                                |
| ------------ | ------------ | ------------------------------------ |
| `id`         | `uuid` (PK)  | References `auth.users(id)`, cascade delete |
| `role`       | `text`       | `'patient'` or `'doctor'`            |
| `is_admin`   | `boolean`    | Default `false`                      |
| `full_name`  | `text`       | Optional display name                |
| `created_at` | `timestamptz`| Auto-set                             |
| `updated_at` | `timestamptz`| Auto-updated via trigger             |

### `clinics`

Healthcare facilities where doctors practice.

| Column       | Type          | Notes                          |
| ------------ | ------------- | ------------------------------ |
| `id`         | `bigserial` (PK) |                             |
| `name`       | `text`        | Required                       |
| `address`    | `text`        |                                |
| `city`       | `text`        |                                |
| `country`    | `text`        |                                |
| `timezone`   | `text`        | IANA timezone, e.g. `'Asia/Kolkata'` |
| `created_at` | `timestamptz` |                                |
| `updated_at` | `timestamptz` | Auto-updated via trigger       |

### `specialities`

Medical specialties (cardiology, dermatology, etc.).

| Column | Type              | Notes          |
| ------ | ----------------- | -------------- |
| `id`   | `bigserial` (PK)  |                |
| `name` | `text`            | Unique         |

### `doctors`

Doctor profiles, linked to a user, clinic, and specialty.

| Column                   | Type            | Notes                                       |
| ------------------------ | --------------- | ------------------------------------------- |
| `id`                     | `bigserial` (PK)|                                             |
| `user_id`                | `uuid` (unique) | FK to `user_profiles`. One doctor per user. |
| `clinic_id`              | `bigint`        | FK to `clinics`                             |
| `first_name`             | `text`          | Required                                    |
| `last_name`              | `text`          | Required                                    |
| `degree`                 | `text`          | e.g. `'MBBS, MD'`                           |
| `speciality_id`          | `bigint`        | FK to `specialities`                        |
| `bio`                    | `text`          |                                             |
| `photo_url`              | `text`          |                                             |
| `status`                 | `text`          | `'pending'`, `'approved'`, or `'rejected'`  |
| `avg_rating_overall`     | `numeric(2,1)`  | Denormalized aggregate                      |
| `avg_rating_effectiveness` | `numeric(2,1)`|                                             |
| `avg_rating_behavior`    | `numeric(2,1)`  |                                             |
| `review_count`           | `integer`       | Default `0`                                 |
| `created_at`             | `timestamptz`   |                                             |
| `updated_at`             | `timestamptz`   | Auto-updated via trigger                    |

### `doctor_availability`

Recurring weekly schedule. Each row represents a single time window on a given weekday.

| Column       | Type            | Notes                                |
| ------------ | --------------- | ------------------------------------ |
| `id`         | `bigserial` (PK)|                                      |
| `doctor_id`  | `bigint`        | FK to `doctors`, cascade delete      |
| `weekday`    | `smallint`      | 0 = Sunday, 6 = Saturday             |
| `start_time` | `time`          | Must be before `end_time`            |
| `end_time`   | `time`          |                                      |
| `created_at` | `timestamptz`   |                                      |
| `updated_at` | `timestamptz`   | Auto-updated via trigger             |

### `doctor_time_off`

Explicit blocked periods (vacations, leave days, etc.).

| Column       | Type            | Notes                          |
| ------------ | --------------- | ------------------------------ |
| `id`         | `bigserial` (PK)|                                |
| `doctor_id`  | `bigint`        | FK to `doctors`, cascade delete|
| `start_at`   | `timestamptz`   | Must be before `end_at`        |
| `end_at`     | `timestamptz`   |                                |
| `reason`     | `text`          | Optional                       |
| `created_at` | `timestamptz`   |                                |
| `updated_at` | `timestamptz`   | Auto-updated via trigger       |

### `appointments`

Individual 30-minute appointment slots.

| Column        | Type            | Notes                                                                              |
| ------------- | --------------- | ---------------------------------------------------------------------------------- |
| `id`          | `bigserial` (PK)|                                                                                   |
| `doctor_id`   | `bigint`        | FK to `doctors` (`on delete restrict`)                                             |
| `patient_id`  | `uuid`          | FK to `user_profiles` (`on delete restrict`)                                       |
| `clinic_id`   | `bigint`        | FK to `clinics` (`on delete restrict`)                                             |
| `start_at`    | `timestamptz`   |                                                                                    |
| `end_at`      | `timestamptz`   | Must equal `start_at + 30 minutes` (enforced by check)                             |
| `status`      | `text`          | `'scheduled'`, `'confirmed'`, `'completed'`, `'cancelled'`, `'declined'`, `'no_show'` |
| `patient_ack` | `boolean`       | Default `false`. Set to `true` when patient dismisses a declined-appointment notification. |
| `created_at`  | `timestamptz`   |                                                                                    |
| `updated_at`  | `timestamptz`   | Auto-updated via trigger                                                           |

**Constraints:**

- **30-minute duration check:** `end_at = start_at + interval '30 minutes'`.
- **Partial unique index** (`appointments_active_slot`): unique on `(doctor_id, start_at)` **where** `status in ('scheduled', 'confirmed', 'completed')`. This prevents double-booking for active appointments while allowing cancelled, declined, and no-show slots to be rebooked.
- **GiST exclusion constraint** (`appointments_no_overlap`): Uses `EXCLUDE USING gist` with `tstzrange` to prevent overlapping time ranges for the same doctor at the database level, providing an airtight double-booking guard even under concurrent requests. Requires the `btree_gist` extension.
- **Approved-doctor trigger** (`trg_check_doctor_approved`): A `BEFORE INSERT` trigger that ensures appointments can only be created for doctors with `status = 'approved'`, preventing bookings to unapproved or rejected doctor profiles.

### `reviews`

Patient reviews for completed appointments.

| Column                 | Type            | Notes                                |
| ---------------------- | --------------- | ------------------------------------ |
| `id`                   | `bigserial` (PK)|                                     |
| `doctor_id`            | `bigint`        | FK to `doctors`                      |
| `patient_id`           | `uuid`          | FK to `user_profiles`                |
| `appointment_id`       | `bigint`        | FK to `appointments`, unique (1 review per appointment) |
| `rating_effectiveness` | `smallint`      | 1–5                                 |
| `rating_overall`       | `smallint`      | 1–5                                 |
| `rating_behavior`      | `smallint`      | 1–5                                 |
| `comment`              | `text`          | Optional                             |
| `created_at`           | `timestamptz`   |                                      |
| `updated_at`           | `timestamptz`   | Auto-updated via trigger             |

---

## Indexes

| Index                               | Table                | Columns / Condition                                            | Purpose                                                  |
| ----------------------------------- | -------------------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| `appointments_active_slot`          | `appointments`       | `(doctor_id, start_at)` unique, where status in (`scheduled`, `confirmed`, `completed`) | Prevent double-booking; allow rebooking cancelled/declined slots |
| `idx_appointments_doctor_start`     | `appointments`       | `doctor_id`, `start_at`                                        | Fast lookup of a doctor's schedule                        |
| `idx_appointments_patient_start`    | `appointments`       | `patient_id`, `start_at`                                       | Fast lookup of a patient's bookings                       |
| `idx_availability_doctor_weekday`   | `doctor_availability`| `doctor_id`, `weekday`                                         | Weekly schedule queries                                   |
| `idx_timeoff_doctor_start`          | `doctor_time_off`    | `doctor_id`, `start_at`                                        | Time-off overlap checks                                   |
| `reviews_unique_appointment`        | `reviews`            | `appointment_id` (unique)                                      | One review per appointment                                |

---

## Triggers

Every table with an `updated_at` column has a `BEFORE UPDATE` trigger that calls `update_updated_at_column()`, which sets `updated_at = NOW()` automatically.

---

## Row Level Security (RLS)

RLS is enabled on **all** tables. Below is a summary of the key policies:

### `user_profiles`

| Policy                              | Operation | Rule                                                       |
| ----------------------------------- | --------- | ---------------------------------------------------------- |
| `user_profiles_select_self`         | SELECT    | Users can read their own profile.                          |
| `user_profiles_select_doctor_patients` | SELECT | Doctors can read profiles of their patients.               |
| `user_profiles_insert_self`         | INSERT    | Users can only insert their own profile.                   |
| `user_profiles_update_self`         | UPDATE    | Users can only update their own profile.                   |

### `clinics` & `specialities`

- **SELECT**: All authenticated users.
- **INSERT**: All authenticated users (needed during doctor registration).

### `doctors`

| Policy                  | Operation | Rule                                           |
| ----------------------- | --------- | ---------------------------------------------- |
| `doctors_select_all`    | SELECT    | Public — anyone can view approved doctors.     |
| `doctors_insert_own`    | INSERT    | Users can only create their own doctor record. |
| `doctors_update_own`    | UPDATE    | Doctors can update their own record.           |
| `doctors_update_admin`  | UPDATE    | Admins can update any doctor (approve/reject). |

### `doctor_availability` & `doctor_time_off`

- **SELECT**: Public.
- **ALL (insert, update, delete)**: Only the owning doctor.

### `appointments`

| Policy                                  | Operation | Rule                                                   |
| --------------------------------------- | --------- | ------------------------------------------------------ |
| `appointments_select_patient`           | SELECT    | Patients see their own appointments.                   |
| `appointments_select_doctor`            | SELECT    | Doctors see appointments on their schedule.             |
| `appointments_insert_patient`           | INSERT    | Patients can create appointments for themselves.        |
| `appointments_update_patient_or_doctor` | UPDATE    | Either party can update status (cancel, complete, etc.).|

### `reviews`

| Policy                | Operation | Rule                                     |
| --------------------- | --------- | ---------------------------------------- |
| `reviews_select_all`  | SELECT    | Public — anyone can read reviews.        |
| `reviews_insert_self` | INSERT    | Patients can only submit their own reviews. |
| `reviews_update_self` | UPDATE    | Patients can only update their own reviews. |

---

## Security Guardrails Summary

The database schema implements defense-in-depth through multiple layers:

1. **Row Level Security (RLS)** on all tables — users can only read/write rows they are authorized for.
2. **Partial unique index** on `(doctor_id, start_at)` — prevents identical slot bookings.
3. **GiST exclusion constraint** — prevents overlapping time ranges via `tstzrange`, guarding against race conditions.
4. **Approved-doctor trigger** — ensures only admin-approved doctors can receive appointments.
5. **30-minute duration check** — enforces consistent slot sizes at the database level.
6. **One-review-per-appointment unique index** — prevents duplicate reviews.
7. **Rating range checks** — enforces 1-5 ratings via CHECK constraints.
8. **API-level rate limiting** — OTP endpoint (5 req/min) and OAuth login (10 req/min) are rate-limited per IP.
9. **Zod validation** — All API route handlers validate request bodies with Zod schemas and return structured field-level errors.

---

*For setup instructions, see the [Setup Guide](./SETUP.md).*
*For product features, see the [Product Guide](./PRODUCT.md).*
