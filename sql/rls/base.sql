-- Base RLS policies. Admins bypass via a policy matching is_admin = true.

alter table public.profiles enable row level security;
alter table public.base_destination enable row level security;
alter table public.base_destination_reviews enable row level security;
alter table public.activities enable row level security;
alter table public.travel_packages enable row level security;
alter table public.guides enable row level security;
alter table public.guide_service_areas enable row level security;
alter table public.guide_reviews enable row level security;
alter table public.suspended_guides enable row level security;
alter table public.stories enable row level security;
alter table public.story_likes enable row level security;
alter table public.story_comments enable row level security;
alter table public.photos enable row level security;
alter table public.hiring_proposals enable row level security;
alter table public.guide_bookings enable row level security;
alter table public.package_bookings enable row level security;
alter table public.payment_logs enable row level security;
alter table public.guide_applications enable row level security;
alter table public.guide_service_areas_applications enable row level security;
alter table public.unsuspension_requests enable row level security;

-- Helper: is caller an admin?
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (true);

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update using (
  id = auth.uid() or public.is_admin()
);

-- base_destination (read public; write admin via RPC)
drop policy if exists dest_select on public.base_destination;
create policy dest_select on public.base_destination for select using (true);

-- activities
drop policy if exists activities_select on public.activities;
create policy activities_select on public.activities for select using (true);

-- travel_packages
drop policy if exists packages_select on public.travel_packages;
create policy packages_select on public.travel_packages for select using (true);

-- guides / service areas (public read when not suspended)
drop policy if exists guides_select on public.guides;
create policy guides_select on public.guides for select using (true);

drop policy if exists guide_sa_select on public.guide_service_areas;
create policy guide_sa_select on public.guide_service_areas for select using (true);

-- reviews (public read, authenticated insert)
drop policy if exists dest_reviews_select on public.base_destination_reviews;
create policy dest_reviews_select on public.base_destination_reviews for select using (true);

drop policy if exists dest_reviews_insert on public.base_destination_reviews;
create policy dest_reviews_insert on public.base_destination_reviews for insert with check (
  auth.uid() is not null and reviewer_id = auth.uid()
);

drop policy if exists guide_reviews_select on public.guide_reviews;
create policy guide_reviews_select on public.guide_reviews for select using (true);

-- stories (public read non-archived, owner + admin write)
drop policy if exists stories_select on public.stories;
create policy stories_select on public.stories for select using (
  visibility <> 'archived' or author_id = auth.uid() or public.is_admin()
);

drop policy if exists stories_owner_write on public.stories;
create policy stories_owner_write on public.stories for all using (
  author_id = auth.uid() or public.is_admin()
) with check (
  author_id = auth.uid() or public.is_admin()
);

-- photos
drop policy if exists photos_select on public.photos;
create policy photos_select on public.photos for select using (true);

drop policy if exists photos_owner_write on public.photos;
create policy photos_owner_write on public.photos for all using (
  uploader_id = auth.uid() or public.is_admin()
) with check (
  uploader_id = auth.uid() or public.is_admin()
);

-- hiring_proposals / bookings: participants + admin read
drop policy if exists proposal_participant_select on public.hiring_proposals;
create policy proposal_participant_select on public.hiring_proposals for select using (
  tourist_id = auth.uid() or guide_id = auth.uid() or public.is_admin()
);

drop policy if exists booking_participant_select on public.guide_bookings;
create policy booking_participant_select on public.guide_bookings for select using (
  tourist_id = auth.uid() or guide_id = auth.uid() or public.is_admin()
);

drop policy if exists package_booking_participant_select on public.package_bookings;
create policy package_booking_participant_select on public.package_bookings for select using (
  tourist_id = auth.uid() or public.is_admin()
);

drop policy if exists payment_logs_select on public.payment_logs;
create policy payment_logs_select on public.payment_logs for select using (
  tourist_id = auth.uid() or public.is_admin()
);

-- applications: applicant + admin
drop policy if exists applications_select on public.guide_applications;
create policy applications_select on public.guide_applications for select using (
  applicant_id = auth.uid() or public.is_admin()
);

drop policy if exists application_areas_select on public.guide_service_areas_applications;
create policy application_areas_select on public.guide_service_areas_applications for select using (
  exists (
    select 1 from public.guide_applications ga
    where ga.id = application_id
      and (ga.applicant_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists unsuspension_select on public.unsuspension_requests;
create policy unsuspension_select on public.unsuspension_requests for select using (
  guide_id = auth.uid() or public.is_admin()
);
