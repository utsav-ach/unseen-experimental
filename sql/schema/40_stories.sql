-- Stories & photos module.

create table if not exists public.stories (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null default '',
  feature_image text,
  tags text[] not null default '{}',
  categories text[] not null default '{}',
  location geography(point, 4326),
  location_name text,
  visibility story_visibility not null default 'public',
  like_count int not null default 0,
  comment_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.story_likes (
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (story_id, user_id)
);

create table if not exists public.story_comments (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references public.stories(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default uuid_generate_v4(),
  uploader_id uuid not null references public.profiles(id) on delete cascade,
  image_url text not null,
  description text,
  location geography(point, 4326),
  location_name text,
  created_at timestamptz not null default now()
);
