# Mild 2 Wild Website + Staff Dashboard

Bright, service-specific website and owner/staff dashboard for a nail salon, tattoo shop, hair studio, spa, and retail product boutique.

The app is built around the client vision:
- fun, bright, unique visual direction
- service pages that only show relevant staff
- personal meet-me profile pages for every employee
- owner/admin dashboard visibility across all staff
- employee logins scoped to their own profile/calendar lane
- first-party calendar foundation so the shop does not need every employee's Google Calendar or Calendly API
- Booksy import-ready architecture for later client/appointment migration

## Tech stack

- Next.js App Router
- React
- TypeScript
- Supabase Auth + Postgres
- Vitest
- ESLint

## Clean local install

```bash
npm install
cp .env.example .env.local
npm run check
npm run dev
```

Open:

```text
http://localhost:3000
```

For the current local QA port used in this project, you can also run:

```bash
npm run dev -- -p 3002
```

## Required environment variables

Copy `.env.example` to `.env.local` and fill in real Supabase values when connecting to production data.

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
HERMES_DASHBOARD_SESSION_SECRET=
```

Notes:
- `NEXT_PUBLIC_*` values are browser-visible and must only contain public Supabase anon config.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it in client code.
- `HERMES_DASHBOARD_SESSION_SECRET` should be a strong random value in production.

## Supabase setup

Apply migrations in order from `supabase/migrations/`:

1. `20260525210000_mild2wild_schema.sql`
2. `20260525211500_seed_mild2wild_foundation.sql`
3. `20260525213000_owned_calendar_system.sql`

These create:
- service categories
- services
- staff members
- staff/service mappings
- staff social links
- products
- appointments
- call-agent leads
- first-party calendar tables for clients, appointment audit events, and Booksy import tracking

After applying schema changes in Supabase, run:

```sql
select pg_notify('pgrst', 'reload schema');
```

The migrations already include this notification, but running it manually is safe if PostgREST cache looks stale.

## Dashboard/auth model

The intended production model is Supabase Auth:
- Caitlin/owner account maps to owner/admin access.
- Staff accounts carry `user_metadata.staff_slug` matching the website staff slug.
- Owner/admin can see/manage all calendars and profiles.
- Staff can only manage their own profile/calendar.

The app signs its own minimal HttpOnly dashboard session after Supabase Auth succeeds. Supabase access/refresh tokens are not returned to the browser by the dashboard login route.

## First-party calendar model

This project is being set up to avoid per-employee Google Calendar/Calendly dependencies.

Calendar design:
- one appointment system owned by Mild 2 Wild
- appointments belong to a staff calendar lane
- owner/admin can manage all lanes
- staff can only manage their own lane
- public booking requests and call-agent leads route into the same model
- Booksy will be treated as an import source, not the ongoing source of truth

Current Booksy status:
- Booksy import parser/domain foundation exists and is tested.
- The actual Booksy CSV/export is not required yet.
- When the client provides the export later, the importer should map Booksy employee names to website staff slugs and flag unresolved rows for review.

## Verification commands

Run before every handoff/deploy:

```bash
npm run check
npm run security:audit
```

`npm run check` runs:
- tests
- lint
- production build

## Important paths

```text
src/lib/studio-data.ts                         static service/staff foundation
src/lib/booking-foundation.ts                  public booking validation + insert mapping
src/lib/calendar-access.ts                     owner/staff calendar permissions
src/lib/owned-calendar-system.ts               first-party calendar + Booksy import helpers
src/lib/supabase-auth.ts                       Supabase dashboard login mapping
src/app/dashboard/page.tsx                     owner/staff dashboard
src/app/api/booking-requests/route.ts          public booking request API
src/app/api/call-agent-leads/route.ts          call-agent lead API
supabase/migrations/                           production database setup
supabase/schema.sql                            starter schema reference
```

## Deployment checklist

Before production launch:
- create/connect Supabase project
- apply all migrations
- seed starter service/staff data
- create owner Supabase Auth user
- create staff Supabase Auth users with correct `staff_slug` metadata
- set all Vercel/hosting env vars from `.env.example`
- run `npm run check`
- run `npm run security:audit`
- test owner login
- test staff login
- test public booking request
- test call-agent lead endpoint
- test staff profile editing
- test role-scoped calendar visibility

## Booksy import handoff

No Booksy file is needed for the current clean install.

When the Booksy export is ready, use the implementation plan at:

```text
docs/plans/2026-05-25-owned-calendar-system.md
```

The next build step will add the admin-only upload/import UI and API.
