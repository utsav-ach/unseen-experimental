-- Guides module read views.

create or replace view public.guide_info as
  select
    g.id,
    g.description,
    g.previous_experience,
    g.known_languages,
    g.admin_feedback,
    g.is_available,
    g.is_suspended,
    g.avg_rating,
    g.created_at,
    g.updated_at,
    jsonb_build_object(
      'id', p.id,
      'username', p.username,
      'first_name', p.first_name,
      'last_name', p.last_name,
      'avatar_url', p.avatar_url
    ) as user,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', sa.id,
            'guide_id', sa.guide_id,
            'location', jsonb_build_object(
              'latitude', st_y(sa.location::geometry),
              'longitude', st_x(sa.location::geometry)
            ),
            'radius_meters', sa.radius_meters,
            'location_name', sa.location_name
          )
        )
        from public.guide_service_areas sa
        where sa.guide_id = g.id
      ),
      '[]'::jsonb
    ) as service_areas
  from public.guides g
  join public.profiles p on p.id = g.id;

create or replace view public.available_guides as
  select * from public.guide_info
  where is_available = true and is_suspended = false;
