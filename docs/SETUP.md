# Project Setup Guide

This document walks you through setting up VibeAppointment for local development from scratch.

## Prerequisites

| Tool       | Minimum Version | Check Command      |
| ---------- | --------------- | -------------------|
| Node.js    | 18.x            | `node -v`          |
| npm        | 9.x             | `npm -v`           |
| Git        | 2.x             | `git --version`    |

You will also need a **Supabase** project (free tier works). Create one at [supabase.com](https://supabase.com) if you don't have one yet.

---

## 1. Clone the Repository

```bash
git clone https://github.com/<your-org>/VibeAppointment.git
cd VibeAppointment
```

## 2. Install Dependencies

```bash
npm install
```

<details>
<summary>Key dependencies installed</summary>

| Package              | Purpose                          |
| -------------------- | -------------------------------- |
| `next` ^15           | React framework (App Router)     |
| `react` ^18          | UI library                       |
| `@supabase/ssr`      | Server-side Supabase client      |
| `@supabase/supabase-js` | Supabase JavaScript SDK      |
| `tailwindcss` ^3     | Utility-first CSS                |
| `lucide-react`       | Icon library                     |
| `sonner`             | Toast notifications              |

</details>

## 3. Configure Environment Variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase project URL — found in Project Settings > API
NEXT_PUBLIC_SUPABASE_URL="https://<your-project-ref>.supabase.co"

# Supabase public anon key — found in Project Settings > API
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-anon-key>"

# Base URL for your app (used for OAuth redirect URLs)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

> **Never commit `.env.local`.** It is already listed in `.gitignore`.

## 4. Set Up the Database

Open the **SQL Editor** in your Supabase dashboard and run the contents of [`supabase/schema.sql`](../supabase/schema.sql). This creates all tables, indexes, triggers, and Row Level Security policies.

Alternatively, if you have the Supabase CLI installed:

```bash
supabase db push
```

Refer to the [Database Guide](./DATABASE.md) for a full schema reference.

## 5. Configure Authentication Providers

### Email OTP (enabled by default)

No extra setup is needed. Supabase sends one-time passwords to the email address provided at login.

### Google OAuth (optional)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create OAuth 2.0 credentials.
2. Set the **Authorized redirect URI** to:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
3. In your Supabase dashboard, navigate to **Authentication > Providers > Google** and enter the Client ID and Client Secret.

## 6. Start the Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**.

## 7. Seed Data (optional)

To explore the app fully, you may want to create some initial records:

1. **Register as a patient** — sign in via the `/login` page.
2. **Register as a doctor** — visit `/register` and fill out the form. The application will be in "pending" status.
3. **Approve the doctor** — set `is_admin = true` on your `user_profiles` row in Supabase, then visit `/admin/dashboard` to approve the doctor.
4. **Add availability** — as the approved doctor, go to `/settings/availability` and add weekly time slots.
5. **Book an appointment** — as a patient, browse `/doctors`, pick a doctor, and book a slot.
6. **Test cancellation** — from the patient dashboard at `/dashboard`, cancel an upcoming appointment and verify the slot becomes available again.

---

## Available Scripts

| Command         | Description                                  |
| --------------- | -------------------------------------------- |
| `npm run dev`   | Start the Next.js development server         |
| `npm run build` | Create an optimized production build          |
| `npm run start` | Serve the production build locally            |
| `npm run lint`  | Run ESLint across the codebase                |

## Project Structure

```
VibeAppointment/
├── app/                    # Next.js App Router (pages, layouts, API routes)
│   ├── (auth)/             # Authentication pages (login)
│   ├── (doctor)/           # Doctor dashboard (confirm, decline, complete appointments)
│   ├── (patient)/          # Patient dashboard, booking, reviews
│   │   ├── dashboard/      #   Dashboard with cancel & declined-notice features
│   │   ├── appointments/   #   New appointment booking flow
│   │   └── reviews/        #   Leave reviews for completed visits
│   ├── (public)/           # Public doctor listing & profiles
│   ├── admin/              # Admin panel (approve/reject doctors)
│   ├── api/                # API route handlers
│   │   ├── appointments/   #   Create & update appointments
│   │   ├── auth/           #   Login & OTP
│   │   ├── doctor/         #   Doctor registration
│   │   ├── doctors/        #   Slot availability
│   │   ├── reviews/        #   Submit reviews
│   │   └── admin/          #   Approve/reject doctors
│   ├── register/           # Doctor registration page
│   ├── settings/           # Doctor settings (profile, availability, time-off)
│   └── layout.tsx          # Root layout
├── components/             # Reusable React components
│   ├── ui/                 # Primitive UI components (Button, Card, Badge, etc.)
│   ├── cancel-appointment-button.tsx   # Patient cancel with confirmation
│   ├── appointment-actions.tsx         # Doctor confirm/decline/complete controls
│   ├── dismiss-decline-button.tsx      # Patient dismiss declined notification
│   ├── slot-picker.tsx                 # Date & slot selection for booking
│   └── ...                 # Other feature components
├── lib/                    # Shared utilities
│   ├── supabase/           # Supabase client helpers (server & browser)
│   ├── auth.ts             # Auth guard helpers (requireUserWithRole)
│   └── slots.ts            # Appointment slot calculation
├── supabase/
│   └── schema.sql          # Database schema, indexes, triggers & RLS policies
├── docs/                   # Project documentation
├── middleware.ts            # Auth middleware for route protection
├── tailwind.config.ts       # Tailwind CSS configuration
├── next.config.mjs          # Next.js configuration
└── tsconfig.json            # TypeScript configuration
```

## Deployment

VibeAppointment is a standard Next.js application and can be deployed to any platform that supports it:

- **Vercel** (recommended) — connect your Git repository for automatic deployments.
- **Netlify**, **Railway**, **Fly.io** — follow the platform's Next.js deployment guide.
- **Docker** — build with `next build` and serve with `next start` behind a reverse proxy.

Set the same environment variables from `.env.local` in your deployment platform's settings. Update `NEXT_PUBLIC_SITE_URL` to your production domain.

---

## Troubleshooting

| Problem                                  | Solution                                                                    |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL is undefined`  | Ensure `.env.local` exists and the variable names match exactly.            |
| Google OAuth redirect fails              | Verify the redirect URI in Google Cloud Console matches your Supabase URL.  |
| RLS blocks all queries                   | Confirm you ran the full `schema.sql`, including the policy definitions.    |
| Port 3000 is in use                      | Run with a different port: `npm run dev -- -p 3001`                         |

---

*For product features and user workflows, see the [Product Guide](./PRODUCT.md).*
*For the database schema reference, see the [Database Guide](./DATABASE.md).*
