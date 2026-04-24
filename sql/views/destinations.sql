-- Destinations module read views.

create or replace view public.destinations as
  select
    d.id,
    d.name,
    jsonb_build_object(
      'latitude', st_y(d.coordinates::geometry),
      'longitude', st_x(d.coordinates::geometry)
    ) as coordinates,
    d.radius,
    d.avg_rating,
    d.tags,
    d.description,
    d.feature_image,
    d.additional_images,
    d.possible_activities,
    d.created_at,
    d.updated_at,
    coalesce(
      (
        select jsonb_agg(jsonb_build_object('id', a.id, 'name', a.name, 'icon', a.icon))
        from public.activities a
        where a.id = any(d.possible_activities)
      ),
      '[]'::jsonb
    ) as activities
  from public.base_destination d;

create or replace view public.destination_reviews as
  select
    r.id,
    r.destination_id,
    r.reviewer_id,
    r.rating,
    r.review_text,
    r.created_at,
    p.username as reviewer_username,
    p.avatar_url as reviewer_avatar_url
  from public.base_destination_reviews r
  left join public.profiles p on p.id = r.reviewer_id;

create or replace view public.available_activities as
  select * from public.activities order by name asc;

create or replace view public.destination_packages as
  select * from public.travel_packages
  where type = 'destination'
    and (expiration_date is null or expiration_date > now());

create or replace view public.activities_packages as
  select * from public.travel_packages
  where type = 'activity'
    and (expiration_date is null or expiration_date > now());
