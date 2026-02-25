# Testing Guide

This guide walks through the complete VibeAppointment user flow: patient booking, doctor management, review submission, and admin approval.

**Live URL:** https://vibe-appointment.vercel.app

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

If the live deployment has no data, apply the seed script from [`supabase/demo_seed.sql`](../supabase/demo_seed.sql) in the Supabase SQL editor. It creates:

- 3 medical specialities (General Medicine, Cardiology, Dermatology)
- 1 clinic in New York (`America/New_York` timezone)
- Instructions to create an approved doctor with Mon-Fri 9 AM - 5 PM availability

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
