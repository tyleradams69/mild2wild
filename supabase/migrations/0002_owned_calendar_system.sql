-- First-party Mild 2 Wild calendar system.
-- This avoids per-employee Google Calendar/Calendly integrations while preserving
-- owner/admin all-calendar access and staff-scoped calendar ownership.

create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  source text not null default 'manual',
  external_source text,
  external_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (external_source, external_id)
);

create index if not exists clients_phone_idx on public.clients (phone) where phone is not null;
create index if not exists clients_email_idx on public.clients (email) where email is not null;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  staff_slug text not null,
  service_slug text,
  service_name text not null,
  client_id uuid references public.clients(id) on delete set null,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'requested' check (status in ('requested', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show', 'blocked')),
  source text not null default 'website' check (source in ('manual', 'website', 'call_agent', 'booksy')),
  external_source text,
  external_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  unique (external_source, external_id)
);

create index if not exists appointments_staff_time_idx on public.appointments (staff_slug, starts_at, ends_at);
create index if not exists appointments_client_idx on public.appointments (client_id) where client_id is not null;
create index if not exists appointments_status_idx on public.appointments (status);

create table if not exists public.appointment_audit_events (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  actor_role text not null,
  actor_staff_slug text,
  event_type text not null,
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists appointment_audit_events_appointment_idx on public.appointment_audit_events (appointment_id, created_at desc);

create table if not exists public.booksy_import_batches (
  id uuid primary key default gen_random_uuid(),
  uploaded_by_staff_slug text,
  file_name text,
  imported_count integer not null default 0,
  skipped_count integer not null default 0,
  needs_review_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.booksy_import_rows (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.booksy_import_batches(id) on delete cascade,
  external_id text,
  status text not null check (status in ('imported', 'skipped', 'needs_review')),
  reason text,
  raw_row jsonb not null,
  appointment_id uuid references public.appointments(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists booksy_import_rows_batch_idx on public.booksy_import_rows (batch_id, status);
