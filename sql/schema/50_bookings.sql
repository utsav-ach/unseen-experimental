-- Bookings module.

create table if not exists public.hiring_proposals (
  id uuid primary key default uuid_generate_v4(),
  tourist_id uuid not null references public.profiles(id) on delete cascade,
  guide_id uuid not null references public.guides(id) on delete cascade,
  destinations uuid[] not null default '{}',
  people_count int not null check (people_count > 0),
  duration_days int not null check (duration_days > 0),
  total_quoted_price numeric(12, 2),
  prepay_required numeric(12, 2),
  status hiring_proposal_status not null default 'sent_by_tourist',
  tourist_remarks text,
  guide_remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guide_bookings (
  id uuid primary key default uuid_generate_v4(),
  proposal_id uuid not null references public.hiring_proposals(id) on delete cascade,
  tourist_id uuid not null references public.profiles(id) on delete cascade,
  guide_id uuid not null references public.guides(id) on delete cascade,
  final_amount numeric(12, 2) not null,
  prepay_amount numeric(12, 2) not null,
  paid_amount numeric(12, 2) not null default 0,
  status booking_status not null default 'pending_payment',
  trip_start_date timestamptz,
  hired_at timestamptz not null default now()
);

create table if not exists public.package_bookings (
  id uuid primary key default uuid_generate_v4(),
  package_id uuid not null references public.travel_packages(id) on delete cascade,
  tourist_id uuid not null references public.profiles(id) on delete cascade,
  people_count int not null check (people_count > 0),
  total_amount numeric(12, 2) not null,
  paid_amount numeric(12, 2) not null default 0,
  status booking_status not null default 'pending_payment',
  trip_start_date timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_logs (
  id uuid primary key default uuid_generate_v4(),
  guide_booking_id uuid references public.guide_bookings(id) on delete set null,
  package_booking_id uuid references public.package_bookings(id) on delete set null,
  tourist_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,
  provider_txn_id text not null,
  amount numeric(12, 2) not null,
  currency text not null default 'NPR',
  status payment_status not null default 'pending',
  raw_response jsonb,
  created_at timestamptz not null default now(),
  check (guide_booking_id is not null or package_booking_id is not null)
);
