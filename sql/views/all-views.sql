-- -----------------------------------------------------------------------------
-- The tables are just the internal structure
-- The views are the public interface that we will use to query data
-- -----------------------------------------------------------------------------

-- Just enough details for the cards,  guide profile card, stories card
-- We dont need location info at all for the cards, and we can save some bandwidth by not sending it
CREATE OR REPLACE VIEW public.user_info AS
SELECT
    id,
    COALESCE(
      NULLIF(trim(concat_ws(' ', first_name, last_name)), ''),
      NULLIF(username, ''),
      'UNNAMED'
    ) AS full_name,
    username,
    avatar_url,
    is_guide
FROM public.profiles
WHERE id IS NOT NULL;


/*
Backward compitibility note:
Most of the places uses minimal_user view,  
so we make it backward compitable for now
it wont stay same in future

Better use user_info directly instead of minimal_user,  
and we will remove minimal_user in future
*/
CREATE OR REPLACE VIEW public.minimal_user AS
SELECT * FROM public.user_info;



/*
We cannot change all place for the name so we make view for compaitibility
THis is the main view for destination that forntend shall consumee

Everything except created_at and updated_at should be in this view,  because these are not needed in the frontend 
*/
CREATE OR REPLACE VIEW public.destinations AS
SELECT
  bd.id,
  bd.name,
  bd.coordinates,
  bd.radius,
  bd.avg_rating,
  bd.tags,
  bd.description,
  bd.feature_image,
  bd.additional_images,

  -- activities as objects
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'id', a.id,
          'name', a.name
        )
      )
      FROM public.activities a
      WHERE a.id = ANY(bd.possible_activities)
    ),
    '[]'::json
  ) AS possible_activities

FROM public.base_destination bd;


CREATE OR REPLACE VIEW public.destination_reviews AS
SELECT 
  r.id,
  r.destination_id,
  r.rating,
  r.review_text,
  r.created_at,

  -- reviewer object flattened (frontend-friendly)
  json_build_object(
    'id', u.id,
    'name', u.full_name,
    'username', u.username,
    'avatar', u.avatar_url,
    'is_guide', u.is_guide
  ) AS reviewer

FROM public.base_destination_reviews r
JOIN public.user_info u ON u.id = r.tourist_id;



/*
Public view where date is not needed 
*/
CREATE OR REPLACE VIEW public.available_activities AS
SELECT id, name, description
FROM public.activities;


-- Easy views for differenting the travel and destination packages, 

-- the packages must not be expired at all
-- we dont include type and created and updated at field
-- We include expiration date to show countdown or  a special message  
CREATE OR REPLACE VIEW public.destination_packages AS
SELECT
  tp.id,
  tp.name,
  tp.actual_price,
  tp.discounted_price,
  tp.featured_image,
  tp.additional_images,
  tp.total_days,
  tp.travel_routes,
  tp.description,
  tp.expiration_date,

  -- destinations_covered → [{id, name}]
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'id', d.id,
          'name', d.name
        )
      )
      FROM public.base_destination d
      WHERE d.id = ANY(tp.destinations_covered)
    ),
    '[]'::json
  ) AS destinations_covered,

  -- included_activities → [{id, name}]
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'id', a.id,
          'name', a.name
        )
      )
      FROM public.activities a
      WHERE a.id = ANY(tp.included_activities)
    ),
    '[]'::json
  ) AS included_activities,

  -- main_activity → {id, name}
  (
    SELECT json_build_object(
      'id', a.id,
      'name', a.name
    )
    FROM public.activities a
    WHERE a.id = tp.main_activity
  ) AS main_activity

FROM public.travel_packages tp
WHERE tp.type = 'destinations_package'
  AND (tp.expiration_date IS NULL OR tp.expiration_date > now());



-- for activities packages but here we should rename the included_activities to additional_activities_included,  
CREATE OR REPLACE VIEW public.activities_packages AS
SELECT
  tp.id,
  tp.name,
  tp.actual_price,
  tp.discounted_price,
  tp.featured_image,
  tp.additional_images,
  tp.total_days,
  tp.travel_routes,
  tp.description,
  tp.expiration_date,

  -- destinations_covered
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'id', d.id,
          'name', d.name
        )
      )
      FROM public.base_destination d
      WHERE d.id = ANY(tp.destinations_covered)
    ),
    '[]'::json
  ) AS destinations_covered,

  -- rename included → additional_activities_included
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'id', a.id,
          'name', a.name
        )
      )
      FROM public.activities a
      WHERE a.id = ANY(tp.included_activities)
    ),
    '[]'::json
  ) AS additional_activities_included,

  -- main activity
  (
    SELECT json_build_object(
      'id', a.id,
      'name', a.name
    )
    FROM public.activities a
    WHERE a.id = tp.main_activity
  ) AS main_activity

FROM public.travel_packages tp
WHERE tp.type = 'activities_package'
  AND (tp.expiration_date IS NULL OR tp.expiration_date > now());



/*
Guide minimal info is changed in favour to guide info
*/
CREATE OR REPLACE VIEW public.guide_info AS
SELECT
  p.id,
  COALESCE(
    NULLIF(trim(concat_ws(' ', p.first_name, p.last_name)), ''),
    NULLIF(p.username, ''),
    'UNNAMED'
  ) AS full_name,
  p.username,
  p.avatar_url,
  g.avg_rating,
  g.description,
  g.previous_experience,
  COALESCE(g.known_languages, '[]'::jsonb) AS known_languages,
  g.is_available,
  (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', gsa.id,
          'location', FORMAT('SRID=4326;%s', ST_AsText(gsa.location::geometry)),
          'radius_meters', gsa.radius_meters,
          'location_name', gsa.location_name,
          'created_at', gsa.created_at
        )
        ORDER BY gsa.created_at DESC
      ),
      '[]'::jsonb
    )
    FROM public.guide_service_areas gsa
    WHERE gsa.guide_id = g.id
  ) AS service_areas
FROM public.guides g
JOIN public.profiles p ON g.id = p.id
WHERE g.is_suspended = false;


CREATE OR REPLACE VIEW public.available_guides AS
SELECT * FROM public.guide_info
WHERE is_available = true;



CREATE OR REPLACE VIEW public.guide_booking_requests AS
SELECT
  hp.id,
  hp.tourist_id,
  hp.guide_id,
  hp.destinations,
  hp.people_count,
  hp.duration_days,
  hp.additional_details,
  CASE hp.status
    WHEN 'sent_by_tourist' THEN 'pending'::public.booking_request_status
    WHEN 'offered_by_guide' THEN 'approved'::public.booking_request_status
    WHEN 'rejected_by_guide' THEN 'rejected'::public.booking_request_status
    WHEN 'accepted_by_tourist' THEN 'confirmed'::public.booking_request_status
    WHEN 'cancelled_by_tourist' THEN 'cancelled'::public.booking_request_status
  END AS status,
  hp.total_quoted_price AS total_cost,
  hp.prepay_required AS prepay_amount,
  COALESCE(hp.guide_terms, hp.guide_cancellation_remarks) AS guide_remarks,
  COALESCE(hp.tourist_approval_remarks, hp.tourist_cancellation_remarks) AS tourist_remarks,
  hp.created_at,
  hp.updated_at
FROM public.hiring_proposals hp;


/*
Since a booking can have multiple payment logs, we should NOT do a raw join (it will duplicate rows).
Instead we use LATERAL or aggregation.

Frontend gets::
{
  "id": "booking-1",
  "status": "confirmed",
  "payment_logs": [
    {
      "status": "succeeded",
      "provider": "esewa",
      "currency": "NPR",
      "created_at": "2026-04-18T10:00:00Z"
    }
  ]
}
*/
CREATE OR REPLACE VIEW public.guide_bookings_info AS
SELECT
  gb.id,
  gb.tourist_id,
  gb.guide_id,
  gb.trip_start_date,
  gb.final_amount AS total_amount,
  COALESCE(hp.tourist_approval_remarks, hp.tourist_cancellation_remarks) AS message,
  gb.status::text AS status,
  gb.hired_at,
  hp.destinations AS destination_name,
  (gb.paid_amount >= gb.prepay_amount) AS is_payment_received,

  -- SAFE payment exposure
  -- Just needed fields are exposed
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'status', pl.status,
        'provider', pl.provider,
        'currency', pl.currency,
        'created_at', pl.created_at
      )
      ORDER BY pl.created_at DESC
    )
    FROM public.payment_logs pl
    WHERE pl.guide_booking_id = gb.id
  ) AS payment_logs

FROM public.guide_bookings gb
JOIN public.hiring_proposals hp ON hp.id = gb.proposal_id;



CREATE OR REPLACE VIEW public.package_bookings_info AS
SELECT
  pb.id,
  pb.tourist_id,
  pb.package_id,
  pb.participant_count,
  pb.final_amount AS total_amount,
  pb.status::text AS booking_status,
  pb.created_at,
  pb.updated_at,

  -- latest payment only (IMPORTANT: avoid multiple rows)
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'status', pl.status,
        'provider', pl.provider,
        'currency', pl.currency,
        'created_at', pl.created_at
      )
      ORDER BY pl.created_at DESC
    )
    FROM public.payment_logs pl
    WHERE pl.package_booking_id = pb.id
    LIMIT 5
  ) AS payment_logs

FROM public.package_bookings pb;


/*
Public view with auto join this will save us to join more 5 tables 
*/
CREATE OR REPLACE VIEW public.stories_info AS
SELECT
  s.id,
  s.uploader_id,
  s.title,
  s.feature_image,
  s.description,
  s.categories,
  s.tags,
  s.likes_count,
  s.comments_count,
  s.is_archived,
  s.related_location,
  s.created_at,
  s.updated_at,
  mu.full_name AS uploader_full_name,
  mu.username AS uploader_username,
  mu.avatar_url AS uploader_avatar_url,
  mu.is_guide AS uploader_is_guide
FROM public.stories s
JOIN public.minimal_user mu ON mu.id = s.uploader_id
WHERE s.id IS NOT NULL; -- safeguard against bad data, we should never have stories without uploaders, but just in case

/*
For photos info
*/
CREATE OR REPLACE VIEW public.photos_info AS
SELECT
  p.id,
  p.uploader_id,
  p.media_urls,
  p.description,
  p.location_name,
  p.created_at,
  p.updated_at,
  mu.full_name AS uploader_full_name,
  mu.username AS uploader_username,
  mu.avatar_url AS uploader_avatar_url,
  mu.is_guide AS uploader_is_guide
FROM public.photos p
JOIN public.minimal_user mu ON mu.id = p.uploader_id
WHERE p.id IS NOT NULL AND mu.id IS NOT NULL; -- safeguard against bad data, we should never have photos without uploaders, but just in case


