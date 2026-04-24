-- Admin helper views
-- These views are intended only for admin operations dashboards and moderation queues.
-- All names are explicitly prefixed with admin_ by contract.

CREATE OR REPLACE VIEW public.admin_pending_guide_applications AS
SELECT
  ga.application_id,
  ga.user_id,
  COALESCE(
    NULLIF(trim(concat_ws(' ', p.first_name, p.last_name)), ''),
    NULLIF(p.username, ''),
    'UNNAMED'
  ) AS applicant_name,
  p.username AS applicant_username,
  p.avatar_url AS applicant_avatar_url,
  ga.nid_document_type,
  ga.nid_number,
  ga.nid_photo_url,
  ga.description,
  ga.previous_experience,
  COALESCE(ga.known_languages, '[]'::jsonb) AS known_languages,
  ga.status,
  ga.created_at,
  ga.updated_at,
  (now() - ga.created_at) AS pending_for,
  (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', gsaa.id,
          'location', FORMAT('SRID=4326;%s', ST_AsText(gsaa.location::geometry)),
          'radius_meters', gsaa.radius_meters,
          'location_name', gsaa.location_name,
          'created_at', gsaa.created_at
        )
        ORDER BY gsaa.created_at DESC
      ),
      '[]'::jsonb
    )
    FROM public.guide_service_areas_applications gsaa
    WHERE gsaa.application_id = ga.application_id
  ) AS requested_service_areas
FROM public.guide_applications ga
JOIN public.profiles p ON p.id = ga.user_id
WHERE ga.status = 'pending'
  AND public.current_user_is_admin();


CREATE OR REPLACE VIEW public.admin_pending_unsuspension_requests AS
SELECT
  ur.id AS request_id,
  ur.guide_id,
  COALESCE(
    NULLIF(trim(concat_ws(' ', p.first_name, p.last_name)), ''),
    NULLIF(p.username, ''),
    'UNNAMED'
  ) AS guide_name,
  p.username AS guide_username,
  p.avatar_url AS guide_avatar_url,
  ur.clarification,
  ur.status,
  ur.created_at,
  ur.updated_at,
  (now() - ur.created_at) AS pending_for,
  sg.id AS suspension_id,
  sg.reason AS latest_suspension_reason,
  sg.admin_id AS suspended_by_admin_id,
  sg.created_at AS suspended_at
FROM public.unsuspension_requests ur
JOIN public.guides g ON g.id = ur.guide_id
JOIN public.profiles p ON p.id = ur.guide_id
LEFT JOIN LATERAL (
  SELECT s.*
  FROM public.suspended_guides s
  WHERE s.guide_id = ur.guide_id
  ORDER BY s.created_at DESC
  LIMIT 1
) sg ON true
WHERE ur.status = 'pending'
  AND g.is_suspended = true
  AND public.current_user_is_admin();


CREATE OR REPLACE VIEW public.admin_booking_negotiation_queue AS
SELECT
  hp.id AS proposal_id,
  hp.status,
  hp.created_at,
  hp.updated_at,
  (now() - hp.created_at) AS age,
  hp.destinations,
  hp.people_count,
  hp.duration_days,
  hp.additional_details,
  hp.total_quoted_price,
  hp.prepay_required,
  hp.guide_terms,
  hp.guide_cancellation_remarks,
  hp.tourist_approval_remarks,
  hp.tourist_cancellation_remarks,

  hp.tourist_id,
  COALESCE(
    NULLIF(trim(concat_ws(' ', tp.first_name, tp.last_name)), ''),
    NULLIF(tp.username, ''),
    'UNNAMED'
  ) AS tourist_name,
  tp.username AS tourist_username,

  hp.guide_id,
  COALESCE(
    NULLIF(trim(concat_ws(' ', gp.first_name, gp.last_name)), ''),
    NULLIF(gp.username, ''),
    'UNNAMED'
  ) AS guide_name,
  gp.username AS guide_username
FROM public.hiring_proposals hp
JOIN public.profiles tp ON tp.id = hp.tourist_id
JOIN public.profiles gp ON gp.id = hp.guide_id
WHERE hp.status IN ('sent_by_tourist', 'offered_by_guide')
  AND public.current_user_is_admin();


CREATE OR REPLACE VIEW public.admin_payment_review_queue AS
SELECT
  pl.id AS payment_log_id,
  pl.status,
  pl.provider,
  pl.provider_txn_id,
  pl.amount,
  pl.currency,
  pl.created_at,
  CASE
    WHEN pl.guide_booking_id IS NOT NULL THEN 'guide_booking'
    WHEN pl.package_booking_id IS NOT NULL THEN 'package_booking'
    ELSE 'unknown'
  END AS booking_type,
  pl.guide_booking_id,
  pl.package_booking_id,
  pl.tourist_id,
  COALESCE(
    NULLIF(trim(concat_ws(' ', p.first_name, p.last_name)), ''),
    NULLIF(p.username, ''),
    'UNNAMED'
  ) AS tourist_name,
  p.username AS tourist_username,
  pl.raw_response
FROM public.payment_logs pl
JOIN public.profiles p ON p.id = pl.tourist_id
WHERE pl.status IN ('pending', 'failed', 'refunded')
  AND public.current_user_is_admin();


CREATE OR REPLACE VIEW public.admin_package_health_queue AS
SELECT
  tp.id AS package_id,
  tp.name,
  tp.type,
  tp.actual_price,
  tp.discounted_price,
  tp.discount_deadline,
  tp.expiration_date,
  tp.created_at,
  tp.updated_at,
  CASE
    WHEN tp.expiration_date IS NULL THEN 'no_expiry'
    WHEN tp.expiration_date < now() THEN 'expired'
    WHEN tp.expiration_date <= now() + interval '14 days' THEN 'expiring_soon'
    ELSE 'healthy'
  END AS health_status,
  (
    SELECT COUNT(*)
    FROM public.package_bookings pb
    WHERE pb.package_id = tp.id
  ) AS booking_count,
  (
    SELECT COALESCE(SUM(pb.paid_amount), 0)
    FROM public.package_bookings pb
    WHERE pb.package_id = tp.id
  ) AS collected_amount
FROM public.travel_packages tp
WHERE public.current_user_is_admin();


CREATE OR REPLACE VIEW public.admin_package_booking_requests AS
SELECT
  pb.id AS package_booking_id,
  pb.package_id,
  tp.name AS package_name,
  tp.type AS package_type,
  pb.tourist_id,
  COALESCE(
    NULLIF(trim(concat_ws(' ', p.first_name, p.last_name)), ''),
    NULLIF(p.username, ''),
    'UNNAMED'
  ) AS tourist_name,
  p.username AS tourist_username,
  pb.status,
  pb.participant_count,
  pb.final_amount,
  pb.paid_amount,
  (pb.final_amount - pb.paid_amount) AS due_amount,
  pb.created_at,
  pb.updated_at,
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', pl.id,
        'status', pl.status,
        'provider', pl.provider,
        'amount', pl.amount,
        'currency', pl.currency,
        'created_at', pl.created_at
      )
      ORDER BY pl.created_at DESC
    )
    FROM public.payment_logs pl
    WHERE pl.package_booking_id = pb.id
  ) AS payment_logs
FROM public.package_bookings pb
JOIN public.travel_packages tp ON tp.id = pb.package_id
JOIN public.profiles p ON p.id = pb.tourist_id
WHERE public.current_user_is_admin();


CREATE OR REPLACE VIEW public.admin_system_overview AS
SELECT
  now() AS generated_at,
  (SELECT COUNT(*) FROM public.guide_applications ga WHERE ga.status = 'pending') AS pending_guide_applications,
  (SELECT COUNT(*) FROM public.unsuspension_requests ur WHERE ur.status = 'pending') AS pending_unsuspension_requests,
  (SELECT COUNT(*) FROM public.hiring_proposals hp WHERE hp.status IN ('sent_by_tourist', 'offered_by_guide')) AS active_negotiations,
  (SELECT COUNT(*) FROM public.payment_logs pl WHERE pl.status IN ('pending', 'failed', 'refunded')) AS payment_review_items,
  (SELECT COUNT(*) FROM public.travel_packages tp WHERE tp.expiration_date IS NOT NULL AND tp.expiration_date <= now() + interval '14 days') AS packages_needing_attention,
  (SELECT COUNT(*) FROM public.stories s WHERE s.is_archived = true) AS archived_stories,
  (SELECT COUNT(*) FROM public.guides g WHERE g.is_suspended = true) AS currently_suspended_guides
WHERE public.current_user_is_admin();
