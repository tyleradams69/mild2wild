# Clean Install Checklist

Use this checklist when setting up Mild 2 Wild on a fresh machine, Supabase project, or Vercel deployment.

## 1. Local machine

```bash
git clone https://github.com/tyleradams69/mild2wild.git
cd mild2wild
npm install
cp .env.example .env.local
```

Fill `.env.local` with Supabase values when available.

For local-only UI work without live Supabase, the marketing pages still build, but booking/dashboard persistence requires Supabase env vars.

## 2. Supabase project

Create a Supabase project, then apply these SQL files in order:

```text
supabase/migrations/20260525210000_mild2wild_schema.sql
supabase/migrations/20260525211500_seed_mild2wild_foundation.sql
supabase/migrations/20260525213000_owned_calendar_system.sql
supabase/migrations/20260525214500_call_agent_owner_sms_summary.sql
```

Verify the following tables exist:

```text
service_categories
services
staff_members
staff_service_categories
staff_services
staff_social_links
appointments
call_agent_leads
products
clients
appointment_audit_events
booksy_import_batches
booksy_import_rows
```

## 3. Supabase Auth users

Create the owner/admin user first.

Owner mapping:
- the owner email must match the owner profile configured in `src/lib/auth-session.ts`
- owner gets all-calendar access

Create staff users as needed.

Staff user metadata must include:

```json
{
  "staff_slug": "team-member-13",
  "full_name": "Staff Name"
}
```

The `staff_slug` must match a non-mascot staff profile in `src/lib/studio-data.ts` and eventually `public.staff_members`.

## 4. Hosting env vars

Set these in Vercel or the production host:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
HERMES_DASHBOARD_SESSION_SECRET
```

Rules:
- only `NEXT_PUBLIC_*` is browser-visible
- service-role key is server-only
- session secret must be strong/random

## 5. Verification

Run locally before handoff:

```bash
npm run check
npm run security:audit
```

Then browser-test:
- `/` homepage loads
- `/book` booking form loads
- `/legal` legal/policy page loads
- `/staff` and staff profile pages load
- `/login` redirects/login behavior is sane
- owner dashboard sees all calendars/profiles
- staff dashboard is scoped to one staff calendar/profile

## 6. Booksy later

The Booksy export is not required for a clean install.

The current code is ready for Booksy import work because it already has:
- first-party appointment/client schema
- import batch tracking schema
- tested Booksy row normalization helper
- tested staff mapping/unresolved-row behavior

When the export exists, add the admin import UI/API and map Booksy employee names to website staff slugs.
