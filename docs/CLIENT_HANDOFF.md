# Mild 2 Wild client handoff checklist

Use this for the website-only handoff. Worker agents, Telegram bots, and phone/call-agent automation are no longer part of the active project scope.

## Client login

- Login URL: https://mild2wild.vercel.app/login
- Authorized owner/staff users sign in with their dashboard email and password.
- Owner/admin access can view and manage all staff calendars.
- Staff access is scoped to that staff member's calendar/profile controls.
- If a login fails, verify the user exists in Supabase Auth and has the correct `staff_slug` metadata when they are a staff user.

## Website pages to review with the client

- Homepage: brand feel, booking CTA, service lanes, featured staff, dog game link.
- Book page: service choices, preferred staff choices, required fields, confirmation language.
- Staff page/profile pages: real names, titles, bios, photos, specialties, social links.
- Service pages: service names, descriptions, pricing labels, consultation/deposit expectations.
- Products page: retail categories, availability wording, gift card status.
- Tour page: shop story, community details, tour video once available.
- Policies page: booking, deposit, cancellation, tattoo ID/consent, aftercare, product/refund language.

## Dashboard workflow

- Website booking requests should create appointment/request rows.
- Owner/admin should see all routed staff lanes.
- Staff should only edit their own profile/calendar lane.
- The calendar board should remain compact with scrollable appointment lists.
- Focused staff calendars should look like time-based calendar views.
- Profile edit pages update public staff profile copy/social links.

## Required production configuration

Set these in Vercel/hosting without sharing secret values in chat or docs:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `HERMES_DASHBOARD_SESSION_SECRET`
- `HERMES_DASHBOARD_OWNER_PASSWORD` only if temporary owner fallback access is still needed

## Content still needed from the client

- Official address, phone, public email, hours, and social links.
- Final staff roster: real display names, roles, bios, photos, services, and social links.
- Final service menu: names, pricing/ranges, durations, deposit/consultation rules.
- Final tattoo/minor/ID/waiver/cancellation/aftercare policies.
- Product availability and gift card wording.
- Tour video or approved shop photos/community copy.

## Before public launch

1. Run `npm test && npm run lint && npm run build`.
2. Deploy to production.
3. Verify https://mild2wild.vercel.app points to the newest deployment.
4. Browser-check `/`, `/book`, `/staff`, one staff profile, one service page, `/products`, `/tour`, `/legal`, `/login`, and `/dashboard`.
5. Submit one clearly labeled QA booking request and verify it appears in the dashboard.
6. Remove or clean up the QA booking row if it was written to production.
7. Search for public-facing internal words: `prototype`, `draft`, `temporary`, `final system`, `client-supplied`, `Supabase`, `call-agent`, `Telegram`, `worker`.
8. Confirm the client understands website-only scope and any future automation would be a separate add-on.
