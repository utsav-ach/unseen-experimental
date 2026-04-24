-- Admin-only RLS policies.

alter table public.admin_analytics enable row level security;

drop policy if exists admin_analytics_admin_all on public.admin_analytics;
create policy admin_analytics_admin_all on public.admin_analytics
  for all using (public.is_admin()) with check (public.is_admin());
