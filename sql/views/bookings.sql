-- Bookings module read views.

create or replace view public.guide_booking_requests as
  select
    hp.*
  from public.hiring_proposals hp;

create or replace view public.guide_bookings_info as
  select
    gb.*,
    coalesce(
      (
        select jsonb_agg(to_jsonb(pl) order by pl.created_at)
        from public.payment_logs pl
        where pl.guide_booking_id = gb.id
      ),
      '[]'::jsonb
    ) as payments
  from public.guide_bookings gb;

create or replace view public.package_bookings_info as
  select
    pb.*,
    coalesce(
      (
        select jsonb_agg(to_jsonb(pl) order by pl.created_at)
        from public.payment_logs pl
        where pl.package_booking_id = pb.id
      ),
      '[]'::jsonb
    ) as payments
  from public.package_bookings pb;
