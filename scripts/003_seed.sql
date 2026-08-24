-- ===========================================================================
-- SPARTANZ 3.0 — baseline seed
--
-- Run AFTER 002_rls.sql.
--
-- This only inserts the two default event categories, because `events.category`
-- is a foreign key to `event_categories.slug` and nothing can be created
-- without them.
--
-- For the demo events and organizing team, sign in as the initial admin and
-- use the "Import starter content" button on /admin/settings — it pushes the
-- data in lib/seed.ts into Supabase so the two modes stay in sync.
-- ===========================================================================

insert into public.event_categories (name, slug, active, display_order)
values
  ('Technical',     'technical',     true, 1),
  ('Non-Technical', 'non-technical', true, 2)
on conflict (slug) do nothing;

-- Fill in the real symposium details here, or edit them later from
-- /admin/settings once you are signed in as the initial admin.
update public.site_settings
set
  date           = 'March 2026',
  venue          = 'New Prince Shri Bhavani College of Engineering, Chennai',
  contact_email  = 'spartanz@npsbcoe.edu.in',
  phone          = '+91 98765 43210',
  hero_tagline   = 'The multiverse of code collapses into one arena.',
  countdown_date = '2026-03-14T09:00:00+05:30'
where id = 1;
