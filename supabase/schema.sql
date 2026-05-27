-- Mild 2 Wild Supabase starter schema
-- Run this in the Supabase SQL editor for the project connected to .env.local.

create type public.employee_role as enum ('owner', 'staff');
create type public.appointment_status as enum ('requested', 'confirmed', 'cancelled', 'completed');

create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  accent text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.service_categories(id) on delete cascade,
  slug text not null unique,
  name text not null,
  description text not null,
  duration_minutes integer not null,
  price_label text not null,
  created_at timestamptz not null default now()
);

create table public.staff_members (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  slug text not null unique,
  name text not null,
  title text not null,
  bio text not null,
  photo_url text,
  role public.employee_role not null default 'staff',
  calendar_color text not null default '#F06BD6',
  created_at timestamptz not null default now()
);

create table public.staff_service_categories (
  staff_id uuid not null references public.staff_members(id) on delete cascade,
  category_id uuid not null references public.service_categories(id) on delete cascade,
  primary key (staff_id, category_id)
);

create table public.staff_services (
  staff_id uuid not null references public.staff_members(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (staff_id, service_id)
);

create table public.staff_social_links (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff_members(id) on delete cascade,
  label text not null,
  href text not null
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff_members(id) on delete restrict,
  service_id uuid references public.services(id) on delete set null,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'requested',
  lead_status text not null default 'new' check (lead_status in ('new', 'contacted', 'waiting_on_client', 'booked', 'not_a_fit', 'archived')),
  internal_notes text,
  notes text,
  created_at timestamptz not null default now()
);


create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  price_label text not null,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.staff_members enable row level security;
alter table public.staff_service_categories enable row level security;
alter table public.staff_services enable row level security;
alter table public.staff_social_links enable row level security;
alter table public.appointments enable row level security;
alter table public.products enable row level security;

-- Public marketing reads.
create policy "public read categories" on public.service_categories for select using (true);
create policy "public read services" on public.services for select using (true);
create policy "public read staff" on public.staff_members for select using (true);
create policy "public read staff category links" on public.staff_service_categories for select using (true);
create policy "public read staff service links" on public.staff_services for select using (true);
create policy "public read staff socials" on public.staff_social_links for select using (true);
create policy "public read products" on public.products for select using (active = true);

-- Staff can read their own appointments; owner/admin operations should be handled server-side with service role.
create policy "staff read own appointments" on public.appointments
  for select using (staff_id in (select id from public.staff_members where auth_user_id = auth.uid()));
