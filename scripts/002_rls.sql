-- ============================================================
-- SPARTANZ 3.0 — 002 ROW LEVEL SECURITY
-- Run AFTER 001_schema.sql. Safe to re-run.
--
-- Model:
--   * Public/anon can READ published content (events, categories, team).
--   * A signed-in user can read and write ONLY their own profile and
--     their own registrations.
--   * Admins (profiles.role = 'admin') can do everything.
--   * Nobody can escalate their own role — enforced by a dedicated
--     policy check on public.profiles.
-- ============================================================

alter table public.profiles            enable row level security;
alter table public.event_categories    enable row level security;
alter table public.events              enable row level security;
alter table public.registrations       enable row level security;
alter table public.registration_members enable row level security;
alter table public.team_members        enable row level security;
alter table public.contact_messages    enable row level security;
alter table public.site_settings       enable row level security;
alter table public.admin_audit_logs    enable row level security;
alter table public.admin_emails        enable row level security;

-- ------------------------------------------------------------
-- PROFILES
-- ------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- A user may update their own profile but may NOT change their role.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- EVENT CATEGORIES — public read, admin write
-- ------------------------------------------------------------
drop policy if exists "categories_public_read" on public.event_categories;
create policy "categories_public_read" on public.event_categories
  for select using (active or public.is_admin());

drop policy if exists "categories_admin_write" on public.event_categories;
create policy "categories_admin_write" on public.event_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- EVENTS — public read of active events, admin write
-- ------------------------------------------------------------
drop policy if exists "events_public_read" on public.events;
create policy "events_public_read" on public.events
  for select using (status = 'active' or public.is_admin());

drop policy if exists "events_admin_write" on public.events;
create policy "events_admin_write" on public.events
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- REGISTRATIONS — strictly owner-scoped
-- ------------------------------------------------------------
drop policy if exists "registrations_select_own" on public.registrations;
create policy "registrations_select_own" on public.registrations
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "registrations_insert_own" on public.registrations;
create policy "registrations_insert_own" on public.registrations
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from public.events e where e.id = event_id and e.status = 'active')
  );

-- Owners may cancel; only admins may set CONFIRMED / ATTENDED.
drop policy if exists "registrations_update_own" on public.registrations;
create policy "registrations_update_own" on public.registrations
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and status in ('REGISTERED', 'CANCELLED'));

drop policy if exists "registrations_delete_own" on public.registrations;
create policy "registrations_delete_own" on public.registrations
  for delete using (auth.uid() = user_id or public.is_admin());

drop policy if exists "registrations_admin_all" on public.registrations;
create policy "registrations_admin_all" on public.registrations
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- REGISTRATION MEMBERS — follow the parent registration
-- ------------------------------------------------------------
drop policy if exists "reg_members_select" on public.registration_members;
create policy "reg_members_select" on public.registration_members
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.registrations r
      where r.id = registration_id and r.user_id = auth.uid()
    )
  );

drop policy if exists "reg_members_write" on public.registration_members;
create policy "reg_members_write" on public.registration_members
  for all
  using (
    public.is_admin()
    or exists (
      select 1 from public.registrations r
      where r.id = registration_id and r.user_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.registrations r
      where r.id = registration_id and r.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- TEAM MEMBERS — public read, admin write
-- ------------------------------------------------------------
drop policy if exists "team_public_read" on public.team_members;
create policy "team_public_read" on public.team_members
  for select using (active or public.is_admin());

drop policy if exists "team_admin_write" on public.team_members;
create policy "team_admin_write" on public.team_members
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- CONTACT MESSAGES — anyone may submit, only admins may read
-- ------------------------------------------------------------
drop policy if exists "contact_insert_anyone" on public.contact_messages;
create policy "contact_insert_anyone" on public.contact_messages
  for insert to anon, authenticated with check (true);

drop policy if exists "contact_admin_read" on public.contact_messages;
create policy "contact_admin_read" on public.contact_messages
  for select using (public.is_admin());

drop policy if exists "contact_admin_write" on public.contact_messages;
create policy "contact_admin_write" on public.contact_messages
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- SITE SETTINGS — public read, admin write
-- ------------------------------------------------------------
drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings
  for select using (true);

drop policy if exists "settings_admin_write" on public.site_settings;
create policy "settings_admin_write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- AUDIT LOGS & ADMIN EMAILS — admin only
-- ------------------------------------------------------------
drop policy if exists "audit_admin_only" on public.admin_audit_logs;
create policy "audit_admin_only" on public.admin_audit_logs
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_emails_admin_only" on public.admin_emails;
create policy "admin_emails_admin_only" on public.admin_emails
  for all using (public.is_admin()) with check (public.is_admin());
