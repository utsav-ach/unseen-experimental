-- Admin-only read views. Always filter behind RLS to admins.

create or replace view public.admin_pending_guide_applications as
  select
    ga.*,
    jsonb_build_object(
      'id', p.id,
      'username', p.username,
      'first_name', p.first_name,
      'last_name', p.last_name
    ) as applicant
  from public.guide_applications ga
  left join public.profiles p on p.id = ga.applicant_id
  where ga.status = 'pending'
  order by ga.created_at asc;

create or replace view public.admin_pending_unsuspension_requests as
  select
    ur.*,
    jsonb_build_object(
      'id', p.id,
      'username', p.username,
      'first_name', p.first_name,
      'last_name', p.last_name
    ) as guide
  from public.unsuspension_requests ur
  left join public.profiles p on p.id = ur.guide_id
  where ur.status = 'pending'
  order by ur.created_at asc;

create or replace view public.admin_booking_negotiation_queue as
  select * from public.hiring_proposals
  where status in ('sent_by_tourist', 'offered_by_guide')
  order by updated_at desc;

create or replace view public.admin_payment_review_queue as
  select * from public.payment_logs
  where status = 'pending'
  order by created_at asc;

create or replace view public.admin_package_health_queue as
  select * from public.travel_packages
  where expiration_date is not null
    and expiration_date > now()
    and expiration_date < now() + interval '7 days'
  order by expiration_date asc;

create or replace view public.admin_package_booking_requests as
  select pb.*,
         tp.name as package_name
  from public.package_bookings pb
  join public.travel_packages tp on tp.id = pb.package_id
  where pb.status = 'pending_payment'
  order by pb.created_at desc;

create or replace view public.admin_system_overview as
  select
    (select count(*) from public.profiles) as total_users,
    (select count(*) from public.guides where is_suspended = false) as total_guides,
    (select count(*) from public.guide_applications where status = 'pending') as pending_guide_applications,
    (select count(*) from public.guide_bookings
      where status in ('pending_payment', 'confirmed', 'in_progress')) as active_bookings,
    (select count(*) from public.payment_logs where status = 'pending') as pending_payment_reviews,
    (select count(*) from public.guides where is_suspended = true) as suspended_guides;
