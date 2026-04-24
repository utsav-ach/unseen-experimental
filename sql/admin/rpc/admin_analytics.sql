-- Admin analytics RPCs.

create or replace function public.build_admin_analytics_payload(days int default 30)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare result jsonb;
begin
  perform public._assert_admin();
  select jsonb_build_object(
    'id', uuid_generate_v4(),
    'type', 'system_overview',
    'payload', jsonb_build_object(
      'window_days', days,
      'total_users', (select count(*) from public.profiles),
      'new_users', (
        select count(*) from public.profiles
        where created_at > now() - (days || ' days')::interval
      ),
      'new_bookings', (
        select count(*) from public.guide_bookings
        where hired_at > now() - (days || ' days')::interval
      ),
      'payment_volume', (
        select coalesce(sum(amount), 0) from public.payment_logs
        where status = 'succeeded'
          and created_at > now() - (days || ' days')::interval
      )
    ),
    'captured_at', now()
  ) into result;
  return result;
end $$;

create or replace function public.capture_admin_analytics_snapshot(
  type text,
  days int default 30
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  new_id uuid;
  payload jsonb;
begin
  perform public._assert_admin();
  payload := public.build_admin_analytics_payload(days);
  insert into public.admin_analytics (type, payload)
  values (type, payload)
  returning id into new_id;
  return new_id;
end $$;

create or replace function public.capture_all_admin_analytics_snapshots()
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  types text[] := array['system_overview'];
  t text;
  ids uuid[] := '{}';
begin
  perform public._assert_admin();
  foreach t in array types loop
    ids := ids || public.capture_admin_analytics_snapshot(t);
  end loop;
  return jsonb_build_object('captured_ids', to_jsonb(ids));
end $$;

create or replace function public.run_admin_analytics_midnight_job()
returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.capture_all_admin_analytics_snapshots();
end $$;

create or replace function public.schedule_admin_analytics_midnight_job()
returns text
language plpgsql security definer set search_path = public as $$
begin
  perform cron.schedule(
    'admin_analytics_midnight',
    '0 0 * * *',
    $job$ select public.run_admin_analytics_midnight_job(); $job$
  );
  return 'admin_analytics_midnight';
end $$;
