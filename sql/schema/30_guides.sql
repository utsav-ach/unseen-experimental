-- Guides module.

create table if not exists public.guides (
  id uuid primary key references public.profiles(id) on delete cascade,
  description text not null default '',
  previous_experience text,
  known_languages text[] not null default '{}',
  admin_feedback text,
  is_available boolean not null default true,
  is_suspended boolean not null default false,
  avg_rating numeric(3, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guide_service_areas (
  id uuid primary key default uuid_generate_v4(),
  guide_id uuid not null references public.guides(id) on delete cascade,
  location geography(point, 4326) not null,
  radius_meters double precision not null check (radius_meters > 0),
  location_name text not null
);
create index if not exists guide_service_areas_loc_idx
  on public.guide_service_areas using gist (location);

create table if not exists public.guide_reviews (
  id uuid primary key default uuid_generate_v4(),
  guide_id uuid not null references public.guides(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  rating numeric(3, 2) not null check (rating between 0 and 5),
  review_text text,
  created_at timestamptz not null default now()
);

create table if not exists public.suspended_guides (
  id uuid primary key default uuid_generate_v4(),
  guide_id uuid not null references public.guides(id) on delete cascade,
  reason text not null,
  suspended_at timestamptz not null default now(),
  suspended_by uuid not null references public.profiles(id),
  lifted_at timestamptz
);
