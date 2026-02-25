# VibeAppointment — Routes Manifest

This file lists every page and API route in the application, along with the
HTTP method(s) accepted, the role required to access it, and a short
description of its purpose.

## Pages

| Route | Role | Description |
|-------|------|-------------|
| `/` | Public | Landing page — value prop, CTA, and "How it works" section |
| `/login` | Public | Sign in via Google OAuth or email OTP |
| `/register` | Public | Doctor registration form (submits to `POST /api/doctor/register`) |
| `/doctors` | Public | Browse and search all approved doctors |
| `/doctors/[doctorId]` | Public | Doctor profile with bio, ratings, and reviews |
| `/dashboard` | Patient | Patient dashboard — upcoming and past appointments |
| `/appointments/new/[doctorId]` | Patient | Date picker and slot selector for booking an appointment |
| `/reviews/[doctorId]/new` | Patient | Leave a review for a completed appointment with that doctor |
| `/doctor-dashboard` | Doctor | Doctor dashboard — incoming, confirmed, and past appointments |
| `/settings/profile` | Doctor | Edit doctor profile (name, bio, degree, speciality) |
| `/settings/availability` | Doctor | Manage weekly recurring availability windows |
| `/settings/time-off` | Doctor | Block out specific date ranges as time-off |
| `/admin/dashboard` | Admin | Approve or reject pending doctor applications |

## API Route Handlers

| Method | Path | Role | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/login` | Public | Initiate Google OAuth sign-in flow |
| `POST` | `/api/auth/otp` | Public | Send OTP email or verify a 6-digit OTP code |
| `GET` | `/auth/callback` | Public | Supabase OAuth callback — exchanges code for session cookie |
| `POST` | `/api/doctor/register` | Authenticated | Create a pending doctor profile; redirects to `/dashboard` |
| `GET` | `/api/doctors/slots/[doctorId]` | Public | Return available 30-minute slots for a doctor on a given date (`?date=YYYY-MM-DD`) |
| `POST` | `/api/appointments` | Patient | Book a new appointment (validates time window, clinic match, double-book protection) |
| `PATCH` | `/api/appointments/[id]` | Patient or Doctor | Update appointment status; patients can cancel, doctors can confirm/complete/decline/mark no-show |
| `POST` | `/api/reviews` | Patient | Submit a review for a completed appointment (one review per appointment) |
| `POST` | `/api/admin/doctor/[id]/approve` | Admin | Approve a pending doctor application |
| `POST` | `/api/admin/doctor/[id]/reject` | Admin | Reject a pending doctor application |

## Route Groups (Next.js App Router)

```
app/
├── (auth)/          — login page; no shared layout
├── (doctor)/        — layout enforces role = "doctor"
├── (patient)/       — layout enforces role = "patient"
├── (public)/        — doctors listing and profile; no auth required
└── admin/           — layout enforces is_admin = true
```

## Middleware — Role Enforcement

`middleware.ts` runs on every non-static request and applies two layers of
protection:

1. **Authentication**: any non-public route redirects unauthenticated visitors
   to `/login?redirectTo=<original-path>`.

2. **Role-based access**:
   - `/admin/*` → requires `is_admin = true`; others are redirected to their
     own dashboard.
   - `/doctor-dashboard`, `/settings/*` → requires `role = "doctor"`;
     non-doctors are redirected to `/dashboard`.
   - `/dashboard`, `/appointments/*`, `/reviews/*` → requires
     `role = "patient"`; non-patients are redirected to their own dashboard.

Role checks are enforced a second time inside each layout component
(`requireUserWithRole`, `requireAdmin`) as a defence-in-depth measure.

## Required Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_SITE_URL=https://<your-domain>   # used for OAuth redirects and POST redirects
```
