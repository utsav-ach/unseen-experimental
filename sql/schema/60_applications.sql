-- Applications module.

create table if not exists public.guide_applications (
  id uuid primary key default uuid_generate_v4(),
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  description text not null default '',
  previous_experience text,
  known_languages text[] not null default '{}',
  status guide_application_status not null default 'pending',
  admin_feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guide_service_areas_applications (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid not null references public.guide_applications(id) on delete cascade,
  location geography(point, 4326) not null,
  radius_meters double precision not null check (radius_meters > 0),
  location_name text not null
);

create table if not exists public.unsuspension_requests (
  id uuid primary key default uuid_generate_v4(),
  guide_id uuid not null references public.guides(id) on delete cascade,
  reason text not null,
  status unsuspension_request_status not null default 'pending',
  admin_feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
