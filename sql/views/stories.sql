-- Stories & photos module read views.

create or replace view public.stories_info as
  select
    s.id,
    s.author_id,
    s.title,
    s.content,
    s.feature_image,
    s.tags,
    s.categories,
    case
      when s.location is null then null
      else jsonb_build_object(
        'latitude', st_y(s.location::geometry),
        'longitude', st_x(s.location::geometry)
      )
    end as location,
    s.location_name,
    s.visibility,
    s.like_count,
    s.comment_count,
    s.created_at,
    s.updated_at,
    jsonb_build_object(
      'id', p.id,
      'username', p.username,
      'first_name', p.first_name,
      'last_name', p.last_name,
      'avatar_url', p.avatar_url
    ) as author
  from public.stories s
  left join public.profiles p on p.id = s.author_id;

create or replace view public.photos_info as
  select
    ph.id,
    ph.uploader_id,
    ph.image_url,
    ph.description,
    case
      when ph.location is null then null
      else jsonb_build_object(
        'latitude', st_y(ph.location::geometry),
        'longitude', st_x(ph.location::geometry)
      )
    end as location,
    ph.location_name,
    ph.created_at,
    jsonb_build_object(
      'id', p.id,
      'username', p.username,
      'first_name', p.first_name,
      'last_name', p.last_name,
      'avatar_url', p.avatar_url
    ) as uploader
  from public.photos ph
  left join public.profiles p on p.id = ph.uploader_id;
