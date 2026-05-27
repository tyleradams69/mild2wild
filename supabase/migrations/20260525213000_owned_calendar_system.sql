-- First-party Mild 2 Wild calendar system.
-- Apply after the starter schema + seed migrations. This upgrades the original
-- appointments table instead of replacing it, so clean installs and existing
-- Supabase projects follow the same path.

create extension if not exists pgcrypto;

alter type public.appointment_status add value if not exists 'checked_in';
alter type public.appointment_status add value if not exists 'no_show';
alter type public.appointment_status add value if not exists 'blocked';

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

alter table public.appointments add column if not exists client_id uuid references public.clients(id) on delete set null;
alter table public.appointments add column if not exists service_name text;
alter table public.appointments add column if not exists source text not null default 'website';
alter table public.appointments add column if not exists external_source text;
alter table public.appointments add column if not exists external_id text;
alter table public.appointments add column if not exists updated_at timestamptz not null default now();

update public.appointments appointment
set service_name = coalesce(service.name, 'Unspecified service')
from public.services service
where appointment.service_id = service.id
  and appointment.service_name is null;

update public.appointments
set service_name = 'Unspecified service'
where service_name is null;

alter table public.appointments alter column service_name set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'appointments_ends_after_starts_check'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_ends_after_starts_check check (ends_at > starts_at);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'appointments_external_source_external_id_key'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_external_source_external_id_key unique (external_source, external_id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'appointments_source_check'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_source_check check (source in ('manual', 'website', 'booksy'));
  end if;
end $$;

create index if not exists appointments_staff_time_idx on public.appointments (staff_id, starts_at, ends_at);
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

alter table public.clients enable row level security;
alter table public.appointment_audit_events enable row level security;
alter table public.booksy_import_batches enable row level security;
alter table public.booksy_import_rows enable row level security;

select pg_notify('pgrst', 'reload schema');
