-- Guides module RPCs.

create or replace function public.fetch_guide_profile(target_id uuid default null)
returns jsonb
language sql stable security definer set search_path = public as $$
  select to_jsonb(gi) from public.guide_info gi
  where gi.id = coalesce(target_id, auth.uid())
$$;

create or replace function public.review_guide(
  guide_id uuid,
  rating numeric,
  review_text text default null
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  review_id uuid;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  insert into public.guide_reviews (guide_id, reviewer_id, rating, review_text)
  values (review_guide.guide_id, uid, review_guide.rating, review_guide.review_text)
  returning id into review_id;
  update public.guides g
  set avg_rating = (
    select coalesce(avg(r.rating), 0)
    from public.guide_reviews r
    where r.guide_id = g.id
  )
  where g.id = review_guide.guide_id;
  return review_id;
end $$;

create or replace function public.get_guides_for_destination(
  lat double precision,
  lon double precision,
  result_limit int default 20
)
returns setof public.guide_info
language sql stable security definer set search_path = public as $$
  select gi.*
  from public.guide_info gi
  join public.guide_service_areas sa on sa.guide_id = gi.id
  where st_dwithin(
    sa.location,
    st_setsrid(st_makepoint(lon, lat), 4326)::geography,
    sa.radius_meters
  )
  and (gi->>'is_available')::boolean = true
  and (gi->>'is_suspended')::boolean = false
  order by gi.avg_rating desc
  limit result_limit
$$;

create or replace function public.get_suspended_guides()
returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(to_jsonb(sg) order by sg.suspended_at desc), '[]'::jsonb)
  from public.suspended_guides sg
  where sg.lifted_at is null
$$;
