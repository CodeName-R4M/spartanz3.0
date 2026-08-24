-- ============================================================
-- SPARTANZ 3.0 — 001 SCHEMA
-- Run this FIRST in the Supabase SQL Editor.
-- Safe to re-run (everything is IF NOT EXISTS / OR REPLACE).
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
do $$ begin
  create type user_role as enum ('user', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type registration_status as enum ('REGISTERED', 'CONFIRMED', 'CANCELLED', 'ATTENDED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_status as enum ('active', 'draft', 'closed');
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- ADMIN ALLOW LIST
-- Emails listed here are promoted to admin on first sign-in.
-- ORGANISERS: insert your own email in scripts/003_seed.sql.
-- ------------------------------------------------------------
create table if not exists public.admin_emails (
  email text primary key,
  note text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PROFILES (1:1 with auth.users)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  phone text,
  college text,
  department text,
  year text,
  role user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- EVENT CATEGORIES
-- ------------------------------------------------------------
create table if not exists public.event_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- EVENTS
-- ------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references public.event_categories (id) on delete set null,
  short_description text not null default '',
  description text not null default '',
  rules jsonb not null default '[]'::jsonb,
  image_url text,
  gif_url text,
  event_date date not null default current_date,
  start_time text not null default '09:30',
  end_time text not null default '12:30',
  venue text not null default '',
  min_team_size integer not null default 1 check (min_team_size >= 1),
  max_team_size integer not null default 1 check (max_team_size >= min_team_size),
  registration_fee integer not null default 0 check (registration_fee >= 0),
  prizes text not null default '',
  coordinator_name text not null default '',
  coordinator_phone text not null default '',
  status event_status not null default 'active',
  featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_category_idx on public.events (category_id);
create index if not exists events_status_idx on public.events (status);

-- ------------------------------------------------------------
-- REGISTRATIONS
-- One registration per (user, event) — enforced by a unique index.
-- ------------------------------------------------------------
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  college text not null,
  department text not null,
  year text not null,
  team_name text,
  status registration_status not null default 'REGISTERED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists registrations_user_event_uniq
  on public.registrations (user_id, event_id);
create index if not exists registrations_event_idx on public.registrations (event_id);
create index if not exists registrations_user_idx on public.registrations (user_id);

-- Team members attached to a registration (for team events).
create table if not exists public.registration_members (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create index if not exists registration_members_reg_idx
  on public.registration_members (registration_id);

-- ------------------------------------------------------------
-- TEAM MEMBERS (the people running the symposium)
-- ------------------------------------------------------------
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  category text not null default 'Organizing Committee',
  photo_url text,
  short_bio text,
  department text,
  year text,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- CONTACT MESSAGES
-- ------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null default '',
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- SITE SETTINGS (single row)
-- ------------------------------------------------------------
create table if not exists public.site_settings (
  id text primary key default 'default',
  symposium_name text not null default 'SPARTANZ 3.0',
  subtitle text not null default 'Department Symposium',
  college_name text not null default '',
  department_name text not null default '',
  club_name text not null default '',
  event_date date not null default current_date,
  venue text not null default '',
  contact_email text not null default '',
  contact_phone text not null default '',
  instagram_url text,
  linkedin_url text,
  github_url text,
  youtube_url text,
  hero_headline text not null default '',
  hero_subline text not null default '',
  countdown_target timestamptz not null default now(),
  registration_open boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- AUDIT LOG (admin actions)
-- ------------------------------------------------------------
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_email text not null,
  action text not null,
  target text,
  details text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Keep updated_at fresh.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists events_touch on public.events;
create trigger events_touch before update on public.events
  for each row execute function public.touch_updated_at();

drop trigger if exists registrations_touch on public.registrations;
create trigger registrations_touch before update on public.registrations
  for each row execute function public.touch_updated_at();

-- Human-friendly registration reference: SPZ-XXXXXX
create or replace function public.generate_reference_code()
returns text
language plpgsql
as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  i integer;
begin
  loop
    code := 'SPZ-';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.registrations where reference_code = code);
  end loop;
  return code;
end;
$$;

create or replace function public.set_reference_code()
returns trigger
language plpgsql
as $$
begin
  if new.reference_code is null or new.reference_code = '' then
    new.reference_code := public.generate_reference_code();
  end if;
  return new;
end;
$$;

drop trigger if exists registrations_set_code on public.registrations;
create trigger registrations_set_code before insert on public.registrations
  for each row execute function public.set_reference_code();

-- Create a profile automatically for every new auth user, promoting any
-- email present in admin_emails to the admin role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role user_role := 'user';
begin
  if exists (select 1 from public.admin_emails where lower(email) = lower(new.email)) then
    assigned_role := 'admin';
  end if;

  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    assigned_role
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper used by RLS policies: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
