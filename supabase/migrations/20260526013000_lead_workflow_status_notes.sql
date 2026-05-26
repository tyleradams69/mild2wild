-- Add lightweight owner lead workflow fields for dashboard follow-up.

alter table public.appointments
  add column if not exists lead_status text not null default 'new',
  add column if not exists internal_notes text;

alter table public.call_agent_leads
  add column if not exists lead_status text not null default 'new',
  add column if not exists internal_notes text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_lead_status_check'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_lead_status_check
      check (lead_status in ('new', 'contacted', 'waiting_on_client', 'booked', 'not_a_fit', 'archived'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'call_agent_leads_lead_status_check'
      and conrelid = 'public.call_agent_leads'::regclass
  ) then
    alter table public.call_agent_leads
      add constraint call_agent_leads_lead_status_check
      check (lead_status in ('new', 'contacted', 'waiting_on_client', 'booked', 'not_a_fit', 'archived'));
  end if;
end $$;
