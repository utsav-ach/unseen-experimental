-- Users module RPCs.

create or replace function public.fetch_profile(target_id uuid default null)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  resolved_id uuid := coalesce(target_id, auth.uid());
  result jsonb;
begin
  if resolved_id is null then
    raise exception 'not authenticated';
  end if;
  select to_jsonb(p) into result from public.profiles p where p.id = resolved_id;
  if result is null then
    raise exception 'profile not found';
  end if;
  -- Redact home_location into lat/lon jsonb for the client.
  if result ? 'home_location' then
    result := jsonb_set(
      result,
      '{home_location}',
      case
        when (select home_location is null from public.profiles where id = resolved_id) then 'null'::jsonb
        else (
          select jsonb_build_object(
            'latitude', st_y(home_location::geometry),
            'longitude', st_x(home_location::geometry)
          )
          from public.profiles where id = resolved_id
        )
      end
    );
  end if;
  return result;
end $$;

create or replace function public.is_username_available(username text)
returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.profiles p where p.username = is_username_available.username);
$$;

create or replace function public.complete_onbording(
  first_name text,
  last_name text,
  username text,
  middle_name text default null,
  phone_number text default null,
  emergency_contact text default null,
  avatar_url text default null,
  home_location jsonb default null,
  home_location_name text default null
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  home geography;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if home_location is not null then
    home := st_setsrid(
      st_makepoint(
        (home_location->>'longitude')::double precision,
        (home_location->>'latitude')::double precision
      ),
      4326
    )::geography;
  end if;
  insert into public.profiles (
    id, first_name, middle_name, last_name, username,
    phone_number, emergency_contact, avatar_url,
    home_location, home_location_name, is_onboarding_complete
  )
  values (
    uid, first_name, middle_name, last_name, username,
    phone_number, emergency_contact, avatar_url,
    home, home_location_name, true
  )
  on conflict (id) do update set
    first_name = excluded.first_name,
    middle_name = excluded.middle_name,
    last_name = excluded.last_name,
    username = excluded.username,
    phone_number = excluded.phone_number,
    emergency_contact = excluded.emergency_contact,
    avatar_url = excluded.avatar_url,
    home_location = excluded.home_location,
    home_location_name = excluded.home_location_name,
    is_onboarding_complete = true,
    updated_at = now();
  return public.fetch_profile(uid);
end $$;
