# Testing Guide

This guide walks through the complete VibeAppointment user flow: patient booking, doctor management, review submission, and admin approval.

**Live URL:** https://vibe-appointment.vercel.app

---

## Demo Accounts

After running [`supabase/demo_seed.sql`](../supabase/demo_seed.sql), the following test accounts are available. All use **Email OTP** sign-in (no password required — just enter the email and submit the 6-digit code sent to the inbox, or retrieve it from Supabase Dashboard → Authentication → Users → "Send magic link").

| Email | Role | Notes |
|-------|------|-------|
| `admin@vibeappointment.demo` | Patient + Admin | Can approve doctors and book appointments |
| `doctor1@vibeappointment.demo` | Doctor | Dr. Sarah Jenkins — General Medicine, approved |
| `doctor2@vibeappointment.demo` | Doctor | Dr. Michael Chen — Cardiology, approved |

### Pre-seeded state after running the seed script

| What | Details |
|------|---------|
| 2 approved doctors | Dr. Sarah Jenkins & Dr. Michael Chen, Mon–Fri 9 AM–5 PM (America/New_York) |
| 2 completed appointments | Patient (`admin@`) had past appointments with both doctors (last week) |
| 2 reviews | Patient has already reviewed both doctors with 5-star ratings |
| 1 confirmed appointment | Patient has a confirmed upcoming appointment with Dr. Jenkins (next Monday, 9 AM) |
| 1 scheduled appointment | Patient has a scheduled upcoming appointment with Dr. Chen (next Tuesday, 9 AM) |

> **To test the review flow immediately:** The two completed appointments already have reviews seeded. To test submitting a *new* review, book an additional appointment, have the doctor mark it completed (or use the SQL shortcut below), then sign in as the patient and leave a review.
>
> **Admin shortcut to mark an appointment completed** (for testing without waiting):
> ```sql
> UPDATE public.appointments SET status = 'completed' WHERE id = <appointment-id>;
> ```

---

## Getting Started

### Authentication

You can sign in using either method:

- **Google OAuth** — Click "Sign In" → "Continue with Google". Works with any Google account.
- **Email OTP** — Enter an email address, receive a 6-digit code, and verify. No password required.

> First-time sign-ins automatically create a `patient` user profile.

---

## Test Flow 1: Patient Books an Appointment

### Step 1 — Sign in as a patient

1. Go to https://vibe-appointment.vercel.app/login
2. Sign in with Google or Email OTP.
3. You'll land on the **Patient Dashboard** (`/dashboard`).

### Step 2 — Browse doctors

1. Click **"Find a Doctor"** on the landing page or navigate to `/doctors`.
2. Browse the verified doctor directory. Only admin-approved doctors appear here.
3. Click a doctor card to view their profile, ratings, and reviews.

### Step 3 — Book a 30-minute appointment

1. On the doctor's profile, click **"Book Appointment"**.
2. Select a date from the next 14 days.
3. Available 30-minute slots load dynamically based on the doctor's availability, time-off, and existing bookings.
4. Click a time slot → **"Confirm Booking"**.
5. A success confirmation appears. Navigate to your dashboard to see it.

### Step 4 — View on patient dashboard

1. Go to `/dashboard`.
2. Your new appointment appears under **"Upcoming Appointments"** with status `scheduled`.

---

## Test Flow 2: Doctor Confirms & Completes

### Step 1 — Sign in as the doctor

1. Sign out of the patient account.
2. Sign in with the doctor's account (the one used during doctor registration).
3. Navigate to the **Doctor Dashboard** (`/doctor-dashboard`).

### Step 2 — Confirm the appointment

1. Find the new appointment in the schedule.
2. Click **"Confirm"** → status changes to `confirmed`.

### Step 3 — Mark as completed

1. After the appointment time, click **"Complete"** → status changes to `completed`.

---

## Test Flow 3: Patient Leaves a Review

### Step 1 — Sign in as the patient

1. Sign out of the doctor account and sign back in as the patient.
2. Go to `/dashboard`.

### Step 2 — Leave a review

1. Under **"Past Visits"**, find the completed appointment.
2. Click **"Leave a Review"**.
3. Rate the doctor on three dimensions (1-5 stars each):
   - Overall experience
   - Treatment effectiveness
   - Behavior & communication
4. Optionally add a text comment.
5. Click **"Submit Review"**.

### Step 3 — Verify

1. Navigate to the doctor's public profile at `/doctors/[doctorId]`.
2. Your review and updated average ratings appear on the profile.

---

## Test Flow 4: Admin Approves a Doctor

### Step 1 — Register as a doctor

1. Sign in with a **new account** (not the existing patient or doctor).
2. Go to `/register`.
3. Fill in the doctor registration form (name, degree, clinic, specialty).
4. Submit — the doctor is created with `status: pending`.

### Step 2 — Approve as admin

1. Sign in with an admin account (`is_admin = true` in `user_profiles`).
2. Go to `/admin/dashboard`.
3. See the pending doctor application.
4. Click **"Approve"** — the doctor is now visible in the public directory.

> To make a user an admin, set `is_admin = true` in the `user_profiles` table via the Supabase SQL editor:
> ```sql
> UPDATE public.user_profiles SET is_admin = true WHERE id = 'YOUR-USER-UUID';
> ```

---

## API Verification (cURL)

If the UI is unavailable, you can verify the core APIs directly. Replace `YOUR_AUTH_TOKEN` with a valid Supabase access token (from the browser's cookies or Supabase auth response).

### Get available slots

```bash
curl -s "https://vibe-appointment.vercel.app/api/doctors/slots/1?date=2026-02-26" | jq
```

### Book an appointment

```bash
curl -X POST "https://vibe-appointment.vercel.app/api/appointments" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_AUTH_TOKEN" \
  -d '{
    "doctorId": 1,
    "clinicId": 1,
    "startAt": "2026-02-26T14:00:00.000Z"
  }'
```

### Update appointment status (confirm)

```bash
curl -X PATCH "https://vibe-appointment.vercel.app/api/appointments/1" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_AUTH_TOKEN" \
  -d '{"status": "confirmed"}'
```

### Submit a review

```bash
curl -X POST "https://vibe-appointment.vercel.app/api/reviews" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_AUTH_TOKEN" \
  -d '{
    "doctorId": 1,
    "appointmentId": 1,
    "ratingOverall": 5,
    "ratingEffectiveness": 4,
    "ratingBehavior": 5,
    "comment": "Excellent experience!"
  }'
```

---

## Seeded Data

Apply the seed script from [`supabase/demo_seed.sql`](../supabase/demo_seed.sql) in the Supabase SQL editor. Follow the instructions at the top of that file to replace the three placeholder UUIDs with your actual Supabase auth user IDs before running.

The script inserts:

- 5 medical specialities (General Medicine, Cardiology, Dermatology, Pediatrics, Orthopedics)
- 1 clinic in New York (`America/New_York` timezone)
- 3 user profiles (1 patient+admin, 2 doctors)
- 2 approved doctor profiles with Mon–Fri 9 AM–5 PM availability
- 4 appointments (2 completed last week, 1 confirmed next Monday, 1 scheduled next Tuesday)
- 2 reviews for the completed appointments (ratings auto-computed on doctor profiles via trigger)

---

## Error & Loading States

- **Loading states** — Every major page (patient dashboard, doctor dashboard, doctor directory, admin dashboard, booking page) has a `loading.tsx` skeleton that renders while data loads.
- **Error boundaries** — Each dashboard and the doctor directory has a dedicated `error.tsx` boundary with a "Try again" button and "Home" link.
- **Root error boundary** — The root `app/error.tsx` catches any unhandled errors with a styled fallback.
- **Toast notifications** — All client-side forms show success/error toasts via Sonner. Network errors, validation failures, and conflict errors (e.g., double-booking) all surface user-friendly messages.
- **Inline validation** — The doctor registration form validates required fields client-side and shows field-level red error messages before submission.

---

## Mobile Responsiveness

All pages are built with Tailwind CSS responsive utilities and render well on mobile viewports:

- Landing page: stacks hero content vertically on small screens.
- Doctor directory: single-column card layout on mobile, multi-column on desktop.
- Slot picker: wraps date and time buttons into a responsive grid.
- Dashboards: appointment cards stack vertically on narrow screens.
