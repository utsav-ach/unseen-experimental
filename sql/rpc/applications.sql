-- Applications module RPCs.

create or replace function public.apply_guide_application(
  description text,
  known_languages text[],
  service_areas jsonb,
  previous_experience text default null
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  application_id uuid;
  area jsonb;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  insert into public.guide_applications (
    applicant_id, description, previous_experience, known_languages, status
  )
  values (uid, description, previous_experience, known_languages, 'pending')
  returning id into application_id;

  for area in select * from jsonb_array_elements(service_areas) loop
    insert into public.guide_service_areas_applications (
      application_id, location, radius_meters, location_name
    )
    values (
      application_id,
      st_setsrid(
        st_makepoint(
          (area->'location'->>'longitude')::double precision,
          (area->'location'->>'latitude')::double precision
        ),
        4326
      )::geography,
      (area->>'radius_meters')::double precision,
      area->>'location_name'
    );
  end loop;

  update public.profiles
  set is_guide_applicantion_pending = true, updated_at = now()
  where id = uid;

  return application_id;
end $$;
