# Owned Calendar System + Booksy Import Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Replace dependence on Google Calendar/Calendly per-employee APIs with a first-party Mild 2 Wild calendar system where every staff member has their own login/calendar, owner/admin can manage all calendars, and existing client/appointment data can be imported from Booksy exports.

**Architecture:** Keep authorization centered on the existing signed dashboard session and staff slug. Add a first-party appointment/calendar domain model, Supabase-backed tables for production, and a local/testable import seam for Booksy CSV exports. The public booking flow, dashboard lead inbox, and staff calendars should all read/write the same appointment data.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Supabase/Postgres, server actions/route handlers, local JSON fallback only for development.

---

### Task 1: Add tested owned-calendar domain helpers

**Objective:** Define the core appointment shape, permission checks, conflict detection, and Booksy import mapping before wiring UI.

**Files:**
- Create: `src/lib/owned-calendar-system.ts`
- Create: `test/owned-calendar-system.test.ts`

**Steps:**
1. Write failing tests for:
   - owner sees all appointments
   - staff sees only appointments assigned to their `staffSlug`
   - staff cannot move appointments onto another staff calendar
   - overlapping appointments are detected for a single staff member
   - Booksy CSV rows normalize into first-party appointment imports
2. Run: `npm test -- test/owned-calendar-system.test.ts`
3. Implement the minimal helper module.
4. Re-run targeted test.
5. Commit: `feat: add owned calendar domain helpers`

### Task 2: Add Supabase schema for first-party calendar tables

**Objective:** Make the calendar system production-durable without Google/Calendly credentials.

**Files:**
- Create: `supabase/migrations/0002_owned_calendar_system.sql`

**Tables:**
- `staff_members` if not already present / align with existing slug model
- `clients`
- `client_contacts`
- `appointments`
- `appointment_audit_events`
- `booksy_import_batches`
- `booksy_import_rows`

**Rules:**
- `appointments.staff_slug` maps to the employee calendar owner.
- `appointments.status` supports `requested`, `confirmed`, `checked_in`, `completed`, `cancelled`, `no_show`, `blocked`.
- Add indexes on `staff_slug`, `starts_at`, `client_id`, `status`.
- Add an exclusion/overlap strategy if available; otherwise enforce conflict checks in the server route first.

### Task 3: Build Booksy import route and parser

**Objective:** Let admin upload/export Booksy CSV data into clients and appointments.

**Files:**
- Create: `src/app/api/booksy-import/route.ts`
- Modify: `src/lib/owned-calendar-system.ts`
- Create: `test/booksy-import-route.test.ts`

**Behavior:**
- Owner/admin only.
- Accept CSV text or multipart upload.
- Map Booksy employee names to `staffSlug` by explicit matching table or manual unresolved queue.
- Upsert clients by phone/email.
- Upsert appointments by Booksy external id where available; otherwise deterministic import key.
- Return `imported`, `skipped`, `needsReview` counts.

### Task 4: Replace dashboard demo appointments with live calendar loader

**Objective:** The dashboard should show real first-party appointment data.

**Files:**
- Create: `src/lib/calendar-loader.ts`
- Modify: `src/app/dashboard/page.tsx`
- Update tests under `test/`

**Behavior:**
- Owner/admin loads all staff calendars and appointments.
- Staff login loads only their own appointments.
- If Supabase is unavailable, show safe demo/fallback data with a visible source label.

### Task 5: Add calendar management UI

**Objective:** Let staff/admin create, edit, move, cancel, and block time.

**Files:**
- Create: `src/app/dashboard/calendar/page.tsx`
- Create: `src/app/dashboard/calendar/[appointmentId]/edit/page.tsx`
- Add route handlers/server actions as needed.

**Behavior:**
- Staff can edit only their own appointments/time blocks.
- Owner/admin can move appointments between staff calendars.
- Moves must check service compatibility and time conflicts.
- Every change writes an audit event.

### Task 6: Wire public booking intake to owned calendar

**Objective:** New website bookings become appointments/leads in the same system.

**Files:**
- Modify: `src/app/api/booking-requests/route.ts`
- Modify: `src/components/booking-request-form.tsx`

**Behavior:**
- Public booking creates `requested` appointment.
- Website follow-up keeps request context attached to the appointment.
- Staff filtering remains service-specific.

### Task 7: Browser QA and launch handoff

**Objective:** Verify this is better than Google/Calendly dependency for the salon workflow.

**Checks:**
- Owner login sees all calendars.
- Staff login sees only own calendar.
- Staff cannot move another staff member’s appointment.
- Owner can move/reschedule with conflict prevention.
- Booksy import creates clients + appointments and flags unresolved rows.
- Public booking appears in the correct staff calendar.
- Website follow-up context remains visible in the dashboard.
- Tests/lint/build pass.
