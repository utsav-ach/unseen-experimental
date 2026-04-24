-- Users module.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  middle_name text,
  last_name text,
  username text not null unique,
  phone_number text,
  emergency_contact text,
  avatar_url text,
  is_admin boolean not null default false,
  is_guide boolean not null default false,
  is_guide_applicantion_pending boolean not null default false,
  is_onboarding_complete boolean not null default false,
  home_location geography(point, 4326),
  home_location_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists profiles_home_location_idx
  on public.profiles using gist (home_location);
