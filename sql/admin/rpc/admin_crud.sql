-- Admin CRUD RPCs. All require is_admin = true on caller's profile.

create or replace function public._assert_admin()
returns void
language plpgsql security definer set search_path = public as $$
declare is_admin boolean;
begin
  select p.is_admin into is_admin from public.profiles p where p.id = auth.uid();
  if not coalesce(is_admin, false) then
    raise exception 'admin required';
  end if;
end $$;

create or replace function public.admin_create_base_destination(
  name text,
  coordinates jsonb,
  radius double precision,
  description text default '',
  tags text[] default '{}',
  feature_image text default null,
  additional_images text[] default '{}',
  possible_activities uuid[] default '{}'
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  perform public._assert_admin();
  insert into public.base_destination (
    name, coordinates, radius, description, tags,
    feature_image, additional_images, possible_activities
  )
  values (
    name,
    st_setsrid(
      st_makepoint(
        (coordinates->>'longitude')::double precision,
        (coordinates->>'latitude')::double precision
      ),
      4326
    )::geography,
    radius, description, tags, feature_image, additional_images, possible_activities
  )
  returning id into new_id;
  return new_id;
end $$;

create or replace function public.admin_update_base_destination(
  target_id uuid,
  name text default null,
  coordinates jsonb default null,
  radius double precision default null,
  description text default null,
  tags text[] default null,
  feature_image text default null,
  additional_images text[] default null,
  possible_activities uuid[] default null
)
returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._assert_admin();
  update public.base_destination
  set
    name = coalesce(admin_update_base_destination.name, name),
    coordinates = case
      when admin_update_base_destination.coordinates is null then coordinates
      else st_setsrid(
        st_makepoint(
          (admin_update_base_destination.coordinates->>'longitude')::double precision,
          (admin_update_base_destination.coordinates->>'latitude')::double precision
        ),
        4326
      )::geography
    end,
    radius = coalesce(admin_update_base_destination.radius, radius),
    description = coalesce(admin_update_base_destination.description, description),
    tags = coalesce(admin_update_base_destination.tags, tags),
    feature_image = coalesce(admin_update_base_destination.feature_image, feature_image),
    additional_images = coalesce(admin_update_base_destination.additional_images, additional_images),
    possible_activities = coalesce(admin_update_base_destination.possible_activities, possible_activities),
    updated_at = now()
  where id = target_id;
end $$;

create or replace function public.admin_delete_base_destination(target_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._assert_admin();
  delete from public.base_destination where id = target_id;
end $$;

create or replace function public.admin_create_activity(
  name text,
  icon text default null,
  description text default null,
  feature_image text default null
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  perform public._assert_admin();
  insert into public.activities (name, icon, description, feature_image)
  values (name, icon, description, feature_image)
  returning id into new_id;
  return new_id;
end $$;

create or replace function public.admin_update_activity(
  target_id uuid,
  name text default null,
  icon text default null,
  description text default null,
  feature_image text default null
)
returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._assert_admin();
  update public.activities
  set
    name = coalesce(admin_update_activity.name, name),
    icon = coalesce(admin_update_activity.icon, icon),
    description = coalesce(admin_update_activity.description, description),
    feature_image = coalesce(admin_update_activity.feature_image, feature_image)
  where id = target_id;
end $$;

create or replace function public.admin_delete_activity(target_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._assert_admin();
  delete from public.activities where id = target_id;
end $$;

create or replace function public.admin_create_travel_package(
  name text,
  type travel_package_type,
  actual_price numeric,
  total_days int,
  description text default '',
  discounted_price numeric default null,
  discount_deadline timestamptz default null,
  expiration_date timestamptz default null,
  featured_image text default null,
  additional_images text[] default '{}',
  travel_routes text[] default '{}',
  destinations_covered uuid[] default '{}',
  included_activities uuid[] default '{}',
  main_activity uuid default null
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  perform public._assert_admin();
  insert into public.travel_packages (
    name, type, actual_price, discounted_price, discount_deadline, expiration_date,
    featured_image, additional_images, total_days, travel_routes,
    description, destinations_covered, included_activities, main_activity
  )
  values (
    name, type, actual_price, discounted_price, discount_deadline, expiration_date,
    featured_image, additional_images, total_days, travel_routes,
    description, destinations_covered, included_activities, main_activity
  )
  returning id into new_id;
  return new_id;
end $$;

create or replace function public.admin_update_travel_package(
  target_id uuid,
  name text default null,
  type travel_package_type default null,
  actual_price numeric default null,
  discounted_price numeric default null,
  discount_deadline timestamptz default null,
  expiration_date timestamptz default null,
  featured_image text default null,
  additional_images text[] default null,
  total_days int default null,
  travel_routes text[] default null,
  description text default null,
  destinations_covered uuid[] default null,
  included_activities uuid[] default null,
  main_activity uuid default null
)
returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._assert_admin();
  update public.travel_packages
  set
    name = coalesce(admin_update_travel_package.name, name),
    type = coalesce(admin_update_travel_package.type, type),
    actual_price = coalesce(admin_update_travel_package.actual_price, actual_price),
    discounted_price = coalesce(admin_update_travel_package.discounted_price, discounted_price),
    discount_deadline = coalesce(admin_update_travel_package.discount_deadline, discount_deadline),
    expiration_date = coalesce(admin_update_travel_package.expiration_date, expiration_date),
    featured_image = coalesce(admin_update_travel_package.featured_image, featured_image),
    additional_images = coalesce(admin_update_travel_package.additional_images, additional_images),
    total_days = coalesce(admin_update_travel_package.total_days, total_days),
    travel_routes = coalesce(admin_update_travel_package.travel_routes, travel_routes),
    description = coalesce(admin_update_travel_package.description, description),
    destinations_covered = coalesce(admin_update_travel_package.destinations_covered, destinations_covered),
    included_activities = coalesce(admin_update_travel_package.included_activities, included_activities),
    main_activity = coalesce(admin_update_travel_package.main_activity, main_activity),
    updated_at = now()
  where id = target_id;
end $$;

create or replace function public.admin_delete_travel_package(target_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._assert_admin();
  delete from public.travel_packages where id = target_id;
end $$;

create or replace function public.change_guide_application_status(
  application_id uuid,
  new_status guide_application_status,
  feedback text default null
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  app record;
begin
  perform public._assert_admin();
  update public.guide_applications
  set status = new_status,
      admin_feedback = feedback,
      updated_at = now()
  where id = application_id
  returning * into app;

  if new_status = 'approved' then
    insert into public.guides (id, description, previous_experience, known_languages)
    values (app.applicant_id, app.description, app.previous_experience, app.known_languages)
    on conflict (id) do update
      set description = excluded.description,
          previous_experience = excluded.previous_experience,
          known_languages = excluded.known_languages,
          is_suspended = false,
          updated_at = now();
    update public.profiles
    set is_guide = true, is_guide_applicantion_pending = false, updated_at = now()
    where id = app.applicant_id;
  elsif new_status in ('rejected', 'revision_requested') then
    update public.profiles
    set is_guide_applicantion_pending = (new_status = 'revision_requested'),
        updated_at = now()
    where id = app.applicant_id;
  end if;

  return to_jsonb(app);
end $$;

create or replace function public.change_guide_suspend_status(
  guide_id uuid,
  suspend boolean,
  reason text default null
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare suspension_id uuid;
begin
  perform public._assert_admin();
  update public.guides set is_suspended = suspend, updated_at = now() where id = guide_id;
  if suspend then
    insert into public.suspended_guides (guide_id, reason, suspended_by)
    values (guide_id, coalesce(reason, ''), auth.uid())
    returning id into suspension_id;
  else
    update public.suspended_guides
    set lifted_at = now()
    where guide_id = change_guide_suspend_status.guide_id and lifted_at is null;
  end if;
  return jsonb_build_object('guide_id', guide_id, 'suspended', suspend);
end $$;
