-- ===========================================================================
-- SPARTANZ 3.0 — row level security
--
-- Run AFTER 001_schema.sql.
--
-- Model:
--   * Public content (events, categories, active team members) is readable
--     by anyone, signed in or not.
--   * A participant can only ever see and create their OWN registrations.
--   * Everything destructive, and every cross-user read, requires is_admin().
--   * Nothing is writable by anonymous visitors except a contact message.
-- ===========================================================================

alter table public.users                enable row level security;
alter table public.event_categories     enable row level security;
alter table public.events               enable row level security;
alter table public.registrations        enable row level security;
alter table public.registration_members enable row level security;
alter table public.team_members         enable row level security;
alter table public.contact_messages     enable row level security;
alter table public.admin_audit_logs     enable row level security;
alter table public.site_settings        enable row level security;


-- ------------------------------- users -------------------------------------
drop policy if exists users_select_self  on public.users;
drop policy if exists users_select_admin on public.users;
drop policy if exists users_update_self  on public.users;
drop policy if exists users_update_admin on public.users;

create policy users_select_self on public.users
  for select using (id = auth.uid());

create policy users_select_admin on public.users
  for select using (public.is_admin());

-- A user may edit their own profile but may NOT change their own role:
-- the role check pins it to whatever it already is.
create policy users_update_self on public.users
  for update using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select u.role from public.users u where u.id = auth.uid())
  );

create policy users_update_admin on public.users
  for update using (public.is_admin()) with check (public.is_admin());


-- --------------------------- event_categories ------------------------------
drop policy if exists categories_select_public on public.event_categories;
drop policy if exists categories_write_admin   on public.event_categories;

create policy categories_select_public on public.event_categories
  for select using (true);

create policy categories_write_admin on public.event_categories
  for all using (public.is_admin()) with check (public.is_admin());


-- -------------------------------- events -----------------------------------
drop policy if exists events_select_public on public.events;
drop policy if exists events_select_admin  on public.events;
drop policy if exists events_write_admin   on public.events;

-- Visitors only see active events; admins see drafts/disabled ones too.
create policy events_select_public on public.events
  for select using (status = 'active');

create policy events_select_admin on public.events
  for select using (public.is_admin());

create policy events_write_admin on public.events
  for all using (public.is_admin()) with check (public.is_admin());


-- ----------------------------- registrations -------------------------------
drop policy if exists registrations_select_own    on public.registrations;
drop policy if exists registrations_select_admin  on public.registrations;
drop policy if exists registrations_insert_own    on public.registrations;
drop policy if exists registrations_update_admin  on public.registrations;
drop policy if exists registrations_delete_admin  on public.registrations;

create policy registrations_select_own on public.registrations
  for select using (user_id = auth.uid());

create policy registrations_select_admin on public.registrations
  for select using (public.is_admin());

-- A participant can only insert a row for themselves, and only against an
-- event that is actually open.
create policy registrations_insert_own on public.registrations
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.events e
      where e.id = event_id and e.status = 'active'
    )
  );

-- Status transitions are an admin action only.
create policy registrations_update_admin on public.registrations
  for update using (public.is_admin()) with check (public.is_admin());

create policy registrations_delete_admin on public.registrations
  for delete using (public.is_admin());


-- -------------------------- registration_members ---------------------------
drop policy if exists reg_members_select_own   on public.registration_members;
drop policy if exists reg_members_select_admin on public.registration_members;
drop policy if exists reg_members_insert_own   on public.registration_members;
drop policy if exists reg_members_write_admin  on public.registration_members;

create policy reg_members_select_own on public.registration_members
  for select using (
    exists (
      select 1 from public.registrations r
      where r.id = registration_id and r.user_id = auth.uid()
    )
  );

create policy reg_members_select_admin on public.registration_members
  for select using (public.is_admin());

create policy reg_members_insert_own on public.registration_members
  for insert with check (
    exists (
      select 1 from public.registrations r
      where r.id = registration_id and r.user_id = auth.uid()
    )
  );

create policy reg_members_write_admin on public.registration_members
  for all using (public.is_admin()) with check (public.is_admin());


-- ------------------------------ team_members -------------------------------
drop policy if exists team_select_public on public.team_members;
drop policy if exists team_select_admin  on public.team_members;
drop policy if exists team_write_admin   on public.team_members;

-- Disabling a member hides them from the public site immediately.
create policy team_select_public on public.team_members
  for select using (active = true);

create policy team_select_admin on public.team_members
  for select using (public.is_admin());

create policy team_write_admin on public.team_members
  for all using (public.is_admin()) with check (public.is_admin());


-- ---------------------------- contact_messages -----------------------------
drop policy if exists messages_insert_anyone on public.contact_messages;
drop policy if exists messages_select_admin  on public.contact_messages;
drop policy if exists messages_write_admin   on public.contact_messages;

-- Anyone, including anonymous visitors, may send a message...
create policy messages_insert_anyone on public.contact_messages
  for insert with check (true);

-- ...but only admins can read them back.
create policy messages_select_admin on public.contact_messages
  for select using (public.is_admin());

create policy messages_write_admin on public.contact_messages
  for all using (public.is_admin()) with check (public.is_admin());


-- ---------------------------- admin_audit_logs -----------------------------
drop policy if exists audit_select_admin on public.admin_audit_logs;
drop policy if exists audit_insert_admin on public.admin_audit_logs;

create policy audit_select_admin on public.admin_audit_logs
  for select using (public.is_admin());

create policy audit_insert_admin on public.admin_audit_logs
  for insert with check (public.is_admin());


-- ----------------------------- site_settings -------------------------------
drop policy if exists settings_select_public on public.site_settings;
drop policy if exists settings_update_admin  on public.site_settings;

create policy settings_select_public on public.site_settings
  for select using (true);

create policy settings_update_admin on public.site_settings
  for update using (public.is_admin()) with check (public.is_admin());


-- ---------------------------------------------------------------------------
-- Guard: never allow the last admin to be demoted.
-- Enforced in a trigger so it holds even against the service role key.
-- ---------------------------------------------------------------------------
create or replace function public.prevent_last_admin_demotion()
returns trigger
language plpgsql
as $$
begin
  if old.role = 'admin' and new.role <> 'admin' then
    if (select count(*) from public.users where role = 'admin') <= 1 then
      raise exception 'Cannot demote the last remaining admin.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists users_prevent_last_admin on public.users;
create trigger users_prevent_last_admin
  before update of role on public.users
  for each row execute function public.prevent_last_admin_demotion();
