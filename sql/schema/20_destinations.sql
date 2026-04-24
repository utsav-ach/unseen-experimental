-- Destinations module.

create table if not exists public.base_destination (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  coordinates geography(point, 4326) not null,
  radius double precision not null check (radius > 0),
  avg_rating numeric(3, 2) not null default 0,
  tags text[] not null default '{}',
  description text not null default '',
  feature_image text,
  additional_images text[] not null default '{}',
  possible_activities uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists base_destination_coords_idx
  on public.base_destination using gist (coordinates);

create table if not exists public.base_destination_reviews (
  id uuid primary key default uuid_generate_v4(),
  destination_id uuid not null references public.base_destination(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  rating numeric(3, 2) not null check (rating between 0 and 5),
  review_text text,
  created_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  icon text,
  description text,
  feature_image text,
  created_at timestamptz not null default now()
);

create table if not exists public.travel_packages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type travel_package_type not null,
  actual_price numeric(12, 2) not null check (actual_price >= 0),
  discounted_price numeric(12, 2),
  discount_deadline timestamptz,
  expiration_date timestamptz,
  featured_image text,
  additional_images text[] not null default '{}',
  total_days int not null check (total_days > 0),
  travel_routes text[] not null default '{}',
  description text not null default '',
  destinations_covered uuid[] not null default '{}',
  included_activities uuid[] not null default '{}',
  main_activity uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
