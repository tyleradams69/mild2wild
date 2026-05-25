-- Seed starter content that powers the live booking/API foundation.

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'staff_social_links_staff_label_href_key'
      and conrelid = 'public.staff_social_links'::regclass
  ) then
    alter table public.staff_social_links
      add constraint staff_social_links_staff_label_href_key unique (staff_id, label, href);
  end if;
end $$;

insert into public.service_categories (slug, name, accent, description)
values
  ('nails', 'Nails', '#F06BD6', 'Bright acrylics, gel, fills, sculpted art, and detail-heavy sets from nail artists who live for color.'),
  ('hair', 'Hair', '#FFE45C', 'From polished salon services to bold color work, hair bookings route to stylists only.'),
  ('tattoo', 'Tattoo', '#4DDCE5', 'Tattoo inquiries show tattoo staff only, with portfolios and consultation-first booking flows.'),
  ('aesthetics', 'Aesthetics & Spa', '#A95CFF', 'Aesthetics and spa services connect visitors with the right licensed beauty professionals.')
on conflict (slug) do update set
  name = excluded.name,
  accent = excluded.accent,
  description = excluded.description;

insert into public.services (category_id, slug, name, description, duration_minutes, price_label)
values
  ((select id from public.service_categories where slug = 'nails'), 'custom-nail-art', 'Custom Nail Art', 'Hand-painted, chrome, gems, character art, and themed sets.', 90, 'Starting at $65'),
  ((select id from public.service_categories where slug = 'nails'), 'gel-manicure', 'Gel Manicure', 'Long-wear gel polish with cuticle care and glossy finish.', 60, 'Starting at $45'),
  ((select id from public.service_categories where slug = 'hair'), 'vivids-color', 'Vivids & Color', 'Bright color, creative placement, and transformation services.', 180, 'Consult required'),
  ((select id from public.service_categories where slug = 'hair'), 'cut-style', 'Cut & Style', 'Shape, polish, movement, and style for everyday or events.', 75, 'Starting at $55'),
  ((select id from public.service_categories where slug = 'tattoo'), 'tattoo-consult', 'Tattoo Consultation', 'Discuss concept, placement, sizing, artist fit, and scheduling.', 30, 'Free / deposit after consult'),
  ((select id from public.service_categories where slug = 'tattoo'), 'flash-tattoo', 'Flash Tattoo', 'Pre-drawn flash pieces from the shop artists.', 120, 'Artist priced'),
  ((select id from public.service_categories where slug = 'aesthetics'), 'facial-glow', 'Glow Facial', 'Relaxing skincare treatment focused on glow and refresh.', 60, 'Starting at $80'),
  ((select id from public.service_categories where slug = 'aesthetics'), 'brow-lash', 'Brow & Lash Detail', 'Brow shaping, tinting, and lash-friendly detail work.', 45, 'Starting at $35')
on conflict (slug) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  price_label = excluded.price_label;

insert into public.staff_members (slug, name, title, bio, photo_url, role, calendar_color)
values
  ('luna-lacquer', 'Luna Lacquer', 'Lead Nail Artist', 'Luna specializes in hand-painted details, chrome, gems, and statement sets that match the Mild 2 Wild energy.', '/staff/luna-lacquer.svg', 'staff', '#F06BD6'),
  ('nova-nails', 'Nova Nails', 'Gel & Sculpted Set Specialist', 'Nova keeps nail appointments crisp, colorful, and wearable with sculpted structure and clean finishes.', '/staff/nova-nails.svg', 'staff', '#79D94D'),
  ('raven-ink', 'Raven Ink', 'Tattoo Artist', 'Raven creates bold illustrative tattoos, crisp linework, and custom pieces built around client stories.', '/staff/raven-ink.svg', 'staff', '#4DDCE5'),
  ('ace-needle', 'Ace Needle', 'Flash & Custom Tattoo Artist', 'Ace focuses on punchy flash, clean blackwork, and approachable consultation-first tattoo experiences.', '/staff/ace-needle.svg', 'staff', '#FF3434'),
  ('sol-strands', 'Sol Strands', 'Colorist & Stylist', 'Sol brings color theory, smooth styling, and transformation appointments for guests who want a new look.', '/staff/sol-strands.svg', 'staff', '#FFE45C'),
  ('iris-aura', 'Iris Aura', 'Aesthetics & Spa Specialist', 'Iris handles relaxing skincare, brows, and spa services with a calm touch inside the high-energy shop.', '/staff/iris-aura.svg', 'staff', '#A95CFF')
on conflict (slug) do update set
  name = excluded.name,
  title = excluded.title,
  bio = excluded.bio,
  photo_url = excluded.photo_url,
  role = excluded.role,
  calendar_color = excluded.calendar_color;

insert into public.staff_service_categories (staff_id, category_id)
select staff.id, category.id
from (values
  ('luna-lacquer', 'nails'),
  ('nova-nails', 'nails'),
  ('raven-ink', 'tattoo'),
  ('ace-needle', 'tattoo'),
  ('sol-strands', 'hair'),
  ('iris-aura', 'aesthetics')
) as map(staff_slug, category_slug)
join public.staff_members staff on staff.slug = map.staff_slug
join public.service_categories category on category.slug = map.category_slug
on conflict do nothing;

insert into public.staff_services (staff_id, service_id)
select staff.id, service.id
from (values
  ('luna-lacquer', 'custom-nail-art'),
  ('luna-lacquer', 'gel-manicure'),
  ('nova-nails', 'gel-manicure'),
  ('nova-nails', 'custom-nail-art'),
  ('raven-ink', 'tattoo-consult'),
  ('raven-ink', 'flash-tattoo'),
  ('ace-needle', 'tattoo-consult'),
  ('ace-needle', 'flash-tattoo'),
  ('sol-strands', 'vivids-color'),
  ('sol-strands', 'cut-style'),
  ('iris-aura', 'facial-glow'),
  ('iris-aura', 'brow-lash')
) as map(staff_slug, service_slug)
join public.staff_members staff on staff.slug = map.staff_slug
join public.services service on service.slug = map.service_slug
on conflict do nothing;

insert into public.staff_social_links (staff_id, label, href)
select staff.id, link.label, link.href
from (values
  ('luna-lacquer', 'Instagram', 'https://instagram.com/'),
  ('nova-nails', 'TikTok', 'https://tiktok.com/'),
  ('raven-ink', 'Instagram', 'https://instagram.com/'),
  ('ace-needle', 'Portfolio', 'https://example.com/'),
  ('sol-strands', 'Instagram', 'https://instagram.com/'),
  ('iris-aura', 'Instagram', 'https://instagram.com/')
) as link(staff_slug, label, href)
join public.staff_members staff on staff.slug = link.staff_slug
on conflict (staff_id, label, href) do nothing;

insert into public.products (slug, name, description, price_label, image_url, active)
values
  ('aftercare-kits', 'Aftercare Kits', 'Tattoo and beauty aftercare essentials clients can grab before leaving.', 'TBD', null, true),
  ('cuticle-oils', 'Cuticle Oils', 'Retail nail care oils to keep sets fresh between appointments.', 'TBD', null, true),
  ('salon-shampoos', 'Salon Shampoos', 'Color-safe salon hair products selected by the stylist team.', 'TBD', null, true),
  ('spa-skincare', 'Spa Skincare', 'Aesthetician-approved skincare for post-treatment glow.', 'TBD', null, true),
  ('gift-cards', 'Gift Cards', 'Flexible gift cards for salon, tattoo, spa, and product purchases.', 'TBD', null, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price_label = excluded.price_label,
  image_url = excluded.image_url,
  active = excluded.active;

select pg_notify('pgrst', 'reload schema');
