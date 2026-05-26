-- Route AI call-agent handoffs to Caitlin and queue owner text summaries.

alter table public.call_agent_leads
  add column if not exists text_summary_recipient text not null default '+14406547085',
  add column if not exists text_summary_body text,
  add column if not exists text_summary_status text not null default 'pending';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'call_agent_leads_text_summary_status_check'
      and conrelid = 'public.call_agent_leads'::regclass
  ) then
    alter table public.call_agent_leads
      add constraint call_agent_leads_text_summary_status_check
      check (text_summary_status in ('pending', 'sent', 'failed', 'skipped'));
  end if;
end $$;

update public.call_agent_leads
set
  transferred_to = coalesce(nullif(transferred_to, ''), 'Caitlin (business owner) at 440-654-7085'),
  text_summary_recipient = coalesce(nullif(text_summary_recipient, ''), '+14406547085'),
  text_summary_status = coalesce(nullif(text_summary_status, ''), 'pending')
where transferred_to is null
   or transferred_to = ''
   or text_summary_recipient is null
   or text_summary_recipient = ''
   or text_summary_status is null
   or text_summary_status = '';
