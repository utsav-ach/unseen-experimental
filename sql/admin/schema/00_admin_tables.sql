-- Admin-only tables (isolated from main schema for clarity).

create table if not exists public.admin_analytics (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  payload jsonb not null,
  captured_at timestamptz not null default now()
);

create index if not exists admin_analytics_type_idx
  on public.admin_analytics (type, captured_at desc);
