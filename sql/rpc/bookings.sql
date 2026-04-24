-- Bookings module RPCs (3-step negotiation flow).

create or replace function public.create_hiring_proposal(
  guide_id uuid,
  destinations uuid[],
  people_count int,
  duration_days int,
  tourist_remarks text default null
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  proposal_id uuid;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  insert into public.hiring_proposals (
    tourist_id, guide_id, destinations, people_count, duration_days, tourist_remarks, status
  )
  values (uid, guide_id, destinations, people_count, duration_days, tourist_remarks, 'sent_by_tourist')
  returning id into proposal_id;
  return proposal_id;
end $$;

create or replace function public.submit_guide_offer(
  proposal_id uuid,
  total_quoted_price numeric,
  prepay_required numeric,
  guide_remarks text default null
)
returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  update public.hiring_proposals
  set total_quoted_price = submit_guide_offer.total_quoted_price,
      prepay_required = submit_guide_offer.prepay_required,
      guide_remarks = submit_guide_offer.guide_remarks,
      status = 'offered_by_guide',
      updated_at = now()
  where id = proposal_id and guide_id = uid and status = 'sent_by_tourist';
  if not found then
    raise exception 'proposal not found or not in expected state';
  end if;
end $$;

create or replace function public.reject_hiring_proposal(
  proposal_id uuid,
  guide_remarks text default null
)
returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  update public.hiring_proposals
  set status = 'rejected_by_guide',
      guide_remarks = reject_hiring_proposal.guide_remarks,
      updated_at = now()
  where id = proposal_id and guide_id = uid and status = 'sent_by_tourist';
end $$;

create or replace function public.cancel_hiring_proposal(proposal_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  update public.hiring_proposals
  set status = 'cancelled_by_tourist', updated_at = now()
  where id = proposal_id and tourist_id = uid
    and status in ('sent_by_tourist', 'offered_by_guide');
end $$;

create or replace function public.accept_hiring_proposal_and_create_booking(
  proposal_id uuid,
  prepay_amount numeric
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  proposal record;
  booking_id uuid;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  select * into proposal from public.hiring_proposals
  where id = proposal_id and tourist_id = uid and status = 'offered_by_guide'
  for update;
  if not found then
    raise exception 'proposal not available for acceptance';
  end if;
  if prepay_amount < proposal.prepay_required then
    raise exception 'prepay amount below required minimum';
  end if;
  insert into public.guide_bookings (
    proposal_id, tourist_id, guide_id,
    final_amount, prepay_amount, paid_amount, status
  )
  values (
    proposal.id, proposal.tourist_id, proposal.guide_id,
    proposal.total_quoted_price, prepay_amount, 0, 'pending_payment'
  )
  returning id into booking_id;
  update public.hiring_proposals
  set status = 'accepted_by_tourist', updated_at = now()
  where id = proposal.id;
  return booking_id;
end $$;

create or replace function public.create_package_booking(
  package_id uuid,
  people_count int,
  trip_start_date timestamptz
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  pkg record;
  booking_id uuid;
  total numeric;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  select * into pkg from public.travel_packages where id = package_id;
  if not found then raise exception 'package not found'; end if;
  total := coalesce(pkg.discounted_price, pkg.actual_price) * people_count;
  insert into public.package_bookings (
    package_id, tourist_id, people_count, total_amount, paid_amount, trip_start_date, status
  )
  values (package_id, uid, people_count, total, 0, trip_start_date, 'pending_payment')
  returning id into booking_id;
  return booking_id;
end $$;
