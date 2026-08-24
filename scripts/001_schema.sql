-- ===========================================================================
-- SPARTANZ 3.0 — schema
--
-- Run this once in: Supabase Dashboard > SQL Editor > New query > Run
-- Safe to re-run: every statement is idempotent.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- users
--
-- Mirrors auth.users. `role` drives every admin check in the app.
-- Kept in a public table (rather than JWT claims) so admins can promote
-- other users at runtime without forcing a re-login.
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text        not null default '',
  email       text        not null unique,
  avatar_url  text,
  college     text,
  role        text        not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- event_categories
-- ---------------------------------------------------------------------------
create table if not exists public.event_categories (
  id            uuid primary key default gen_random_uuid(),
  name          text        not null,
  slug          text        not null unique,
  active        boolean     not null default true,
  display_order integer     not null default 99,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id                uuid primary key default gen_random_uuid(),
  name              text        not null,
  slug              text        not null unique,
  category          text        not null references public.event_categories (slug)
                      on update cascade,
  short_description text        not null default '',
  description       text        not null default '',
  rules             text[]      not null default '{}',
  image             text        not null default '',
  gif               text,
  date              date,
  start_time        text        not null default '',
  end_time          text        not null default '',
  venue             text        not null default '',
  team_size_min     integer     not null default 1 check (team_size_min >= 1),
  team_size_max     integer     not null default 1 check (team_size_max >= team_size_min),
  registration_fee  integer     not null default 0 check (registration_fee >= 0),
  prizes            text        not null default '',
  coordinator_name  text        not null default '',
  coordinator_phone text        not null default '',
  status            text        not null default 'active' check (status in ('active', 'disabled')),
  display_order     integer     not null default 99,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists events_category_idx on public.events (category);
create index if not exists events_status_idx   on public.events (status);

-- ---------------------------------------------------------------------------
-- registrations
--
-- One row per (user, event) — the unique constraint is what makes duplicate
-- registration impossible at the database level, not just in the UI.
-- ---------------------------------------------------------------------------
create table if not exists public.registrations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid        not null references public.users (id) on delete cascade,
  event_id   uuid        not null references public.events (id) on delete cascade,
  full_name  text        not null,
  email      text        not null,
  phone      text        not null,
  college    text        not null,
  department text        not null,
  year       text        not null,
  team_name  text,
  status     text        not null default 'registered'
               check (status in ('registered', 'confirmed', 'cancelled', 'attended')),
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

create index if not exists registrations_event_idx on public.registrations (event_id);
create index if not exists registrations_user_idx  on public.registrations (user_id);

-- ---------------------------------------------------------------------------
-- registration_members  (team mates on a registration)
-- ---------------------------------------------------------------------------
create table if not exists public.registration_members (
  id              uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations (id) on delete cascade,
  name            text not null,
  email           text
);

create index if not exists registration_members_reg_idx
  on public.registration_members (registration_id);

-- ---------------------------------------------------------------------------
-- team_members  (the organizing team shown on /teams)
-- ---------------------------------------------------------------------------
create table if not exists public.team_members (
  id            uuid primary key default gen_random_uuid(),
  name          text        not null,
  role          text        not null default '',
  category      text        not null,
  photo         text        not null default '',
  short_bio     text,
  department    text,
  year          text,
  display_order integer     not null default 99,
  active        boolean     not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists team_members_category_idx on public.team_members (category);

-- ---------------------------------------------------------------------------
-- contact_messages
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text        not null,
  email      text        not null,
  subject    text        not null,
  message    text        not null,
  read       boolean     not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- admin_audit_logs
-- ---------------------------------------------------------------------------
create table if not exists public.admin_audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_email text        not null,
  action      text        not null,
  target      text        not null default '',
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- site_settings  (single row, id = 1)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id                integer primary key default 1 check (id = 1),
  symposium_name    text    not null default 'SPARTANZ 3.0',
  subtitle          text    not null default 'Department Symposium',
  college           text    not null default 'New Prince Shri Bhavani College of Engineering',
  department        text    not null default 'CSE — Cyber Security',
  club              text    not null default 'RootSec Club',
  theme             text    not null default 'Avengers: Doomsday Inspired',
  date              text    not null default '',
  venue             text    not null default '',
  contact_email     text    not null default '',
  phone             text    not null default '',
  socials           jsonb   not null default '[]'::jsonb,
  hero_tagline      text    not null default '',
  countdown_date    text    not null default '',
  registration_open boolean not null default true,
  updated_at        timestamptz not null default now()
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- is_admin() — used by every admin policy below.
--
-- SECURITY DEFINER so the function can read public.users without being
-- blocked by that table's own RLS, which would otherwise recurse.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- handle_new_user() — creates the public.users row on signup and promotes
-- the configured initial admin.
--
-- Set the admin email once with:
--   alter database postgres set app.initial_admin_email = 'you@gmail.com';
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_email text := current_setting('app.initial_admin_email', true);
begin
  insert into public.users (id, name, email, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url',
    case
      when admin_email is not null and lower(new.email) = lower(admin_email) then 'admin'
      else 'user'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
