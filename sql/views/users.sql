-- Users module read views.

create or replace view public.user_info as
  select
    p.id,
    p.username,
    p.first_name,
    p.middle_name,
    p.last_name,
    p.avatar_url,
    p.is_admin,
    p.is_guide,
    p.is_onboarding_complete,
    p.home_location_name,
    p.created_at
  from public.profiles p;

create or replace view public.minimal_user as
  select
    p.id,
    p.username,
    p.first_name,
    p.last_name,
    p.avatar_url
  from public.profiles p;
