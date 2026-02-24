# VibeAppointment

A modern healthcare appointment booking platform built with Next.js and Supabase. Patients find verified doctors, book 30-minute slots in real time, and leave reviews after their visit.

---

## Highlights

- **Instant booking** — browse real-time availability and confirm in seconds.
- **Flexible cancellation** — patients can cancel appointments anytime before the visit; the slot is instantly freed for others.
- **Doctor workflow** — doctors confirm, decline, or complete appointments from their dashboard.
- **Three-tier roles** — patients, doctors, and admins each have a dedicated experience.
- **Verified doctors** — every practitioner goes through an admin approval workflow.
- **Honest reviews** — only patients who completed an appointment can leave ratings.
- **Passwordless auth** — sign in with email OTP or Google OAuth.

---

## Tech Stack

| Layer         | Technology                        |
| ------------- | --------------------------------- |
| Framework     | [Next.js 15](https://nextjs.org/) (App Router, React Server Components) |
| Language      | TypeScript                        |
| Database      | [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security)     |
| Auth          | Supabase Auth (Email OTP, Google OAuth)                                 |
| Styling       | [Tailwind CSS](https://tailwindcss.com/)                                |
| Icons         | [Lucide React](https://lucide.dev/)                                     |
| Notifications | [Sonner](https://sonner.emilkowal.dev/)                                 |

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/dheerajkumar-solanki/VibeAppointment.git
cd VibeAppointment

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Set up the database
# Run supabase/schema.sql in your Supabase SQL editor

# 5. Start developing
npm run dev
```

Open **http://localhost:3000** and you're ready to go.

For the full walkthrough — including auth provider setup, seed data, and deployment — see the **[Setup Guide](docs/SETUP.md)**.

---

## Documentation

| Document                              | Description                                              |
| ------------------------------------- | -------------------------------------------------------- |
| **[Setup Guide](docs/SETUP.md)**      | Prerequisites, environment config, database setup, deployment, and troubleshooting. |
| **[Product Guide](docs/PRODUCT.md)**  | User roles, feature descriptions, page routes, and API reference.                   |
| **[Database Guide](docs/DATABASE.md)**| Full schema reference, ER diagram, indexes, triggers, and RLS policies.             |

---

## Project Structure

```
VibeAppointment/
├── app/                     # Next.js App Router
│   ├── (auth)/              #   Login page
│   ├── (doctor)/            #   Doctor dashboard (confirm, decline, complete appointments)
│   ├── (patient)/           #   Patient dashboard (cancel appointments, view declined notices)
│   │   ├── dashboard/       #     Dashboard with upcoming/past appointments
│   │   ├── appointments/    #     New appointment booking flow
│   │   └── reviews/         #     Leave reviews for completed visits
│   ├── (public)/            #   Public doctor directory & profiles
│   ├── admin/               #   Admin panel (approve/reject doctors)
│   ├── api/                 #   REST API routes
│   ├── register/            #   Doctor registration
│   └── settings/            #   Doctor settings (profile, availability, time-off)
├── components/              # Reusable React components & UI primitives
├── lib/                     # Supabase clients, auth helpers, slot logic
├── supabase/                # Database schema (schema.sql)
├── docs/                    # Extended documentation
└── middleware.ts            # Route protection
```

---

## Scripts

| Command         | Description                            |
| --------------- | -------------------------------------- |
| `npm run dev`   | Start the development server           |
| `npm run build` | Create an optimized production build    |
| `npm run start` | Serve the production build              |
| `npm run lint`  | Run ESLint                              |

---

## Contributing

1. Fork the repository and create a feature branch.
2. Make your changes, ensuring `npm run lint` passes.
3. Open a pull request with a clear description of what you changed and why.

---

## License

This project is provided as-is for educational and personal use only. 
