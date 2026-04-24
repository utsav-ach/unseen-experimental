-- ============================================================================
-- Unseen Nepal RPC Layer (Redesigned)
-- Single-file RPC architecture with shared validation and permission utilities.
-- Rule: use RPC primarily for writes/business logic; keep read RPCs lightweight.
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1) Shared permission helpers
-- --------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE((SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()), false);
$$;

CREATE OR REPLACE FUNCTION public.require_authenticated_user(
  p_message text DEFAULT 'Unauthorized: authentication required.'
)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
BEGIN
  v_uid := auth.uid();

  IF v_uid IS NULL THEN
    RAISE EXCEPTION '%', COALESCE(NULLIF(TRIM(p_message), ''), 'Unauthorized: authentication required.')
      USING ERRCODE = '42501';
  END IF;

  RETURN v_uid;
END;
$$;

CREATE OR REPLACE FUNCTION public.require_admin_access(
  p_message text DEFAULT 'Unauthorized: admin access required.'
)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
BEGIN
  v_uid := public.require_authenticated_user(p_message);

  IF NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION '%', COALESCE(NULLIF(TRIM(p_message), ''), 'Unauthorized: admin access required.')
      USING ERRCODE = '42501';
  END IF;

  RETURN v_uid;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_self(p_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    CASE
      WHEN auth.uid() IS NULL THEN false
      WHEN p_id IS NULL THEN false
      WHEN auth.uid() = p_id THEN true
      ELSE public.current_user_is_admin()
    END;
$$;

CREATE OR REPLACE FUNCTION public.require_self_or_admin_access(
  p_id uuid,
  p_message text DEFAULT 'Unauthorized: you can only access your own data.'
)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
BEGIN
  v_uid := public.require_authenticated_user(p_message);

  IF p_id IS NULL THEN
    RAISE EXCEPTION 'Target user id is required.' USING ERRCODE = '22004';
  END IF;

  IF NOT public.is_admin_or_self(p_id) THEN
    RAISE EXCEPTION '%', COALESCE(NULLIF(TRIM(p_message), ''), 'Unauthorized: you can only access your own data.')
      USING ERRCODE = '42501';
  END IF;

  RETURN v_uid;
END;
$$;

-- --------------------------------------------------------------------------
-- 2) Shared validation helpers
-- --------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.clean_text(
  p_value text,
  p_field_name text
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_text text;
BEGIN
  v_text := NULLIF(TRIM(p_value), '');
  IF v_text IS NULL THEN
    RAISE EXCEPTION '% is required and cannot be empty.', COALESCE(NULLIF(TRIM(p_field_name), ''), 'Field');
  END IF;
  RETURN v_text;
END;
$$;

CREATE OR REPLACE FUNCTION public.clean_optional_text(p_value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(TRIM(p_value), '');
$$;

CREATE OR REPLACE FUNCTION public.clean_username(p_username text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_username text;
BEGIN
  v_username := LOWER(public.clean_text(p_username, 'username'));

  IF v_username !~ '^[a-z0-9_\.]{3,30}$' THEN
    RAISE EXCEPTION 'Username must be 3-30 chars and can contain lowercase letters, numbers, underscore, and dot.';
  END IF;

  RETURN v_username;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_phone_with_country_code(
  p_phone text,
  p_field_name text DEFAULT 'phone number'
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_phone text;
BEGIN
  v_phone := public.clean_text(p_phone, p_field_name);

  IF v_phone !~ '^\+[1-9][0-9]{7,14}$' THEN
    RAISE EXCEPTION '% must include country code and be in E.164 format (example: +97798XXXXXXXX).', p_field_name;
  END IF;

  RETURN v_phone;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_rating(
  p_rating numeric,
  p_field_name text DEFAULT 'rating'
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_rating IS NULL OR p_rating < 0 OR p_rating > 5 THEN
    RAISE EXCEPTION '% must be between 0 and 5.', p_field_name;
  END IF;

  RETURN ROUND(p_rating::numeric, 1);
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_positive_int(
  p_value integer,
  p_field_name text
)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_value IS NULL OR p_value <= 0 THEN
    RAISE EXCEPTION '% must be greater than zero.', COALESCE(NULLIF(TRIM(p_field_name), ''), 'value');
  END IF;

  RETURN p_value;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_non_negative_numeric(
  p_value numeric,
  p_field_name text
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_value IS NULL OR p_value < 0 THEN
    RAISE EXCEPTION '% must be a non-negative value.', COALESCE(NULLIF(TRIM(p_field_name), ''), 'value');
  END IF;

  RETURN p_value;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_jsonb_array(
  p_value jsonb,
  p_field_name text
)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_value IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  IF jsonb_typeof(p_value) <> 'array' THEN
    RAISE EXCEPTION '% must be a JSON array.', COALESCE(NULLIF(TRIM(p_field_name), ''), 'value');
  END IF;

  RETURN p_value;
END;
$$;

CREATE OR REPLACE FUNCTION public.parse_point_geography(p_home_location text)
RETURNS geography
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_location geography;
  v_value text;
BEGIN
  v_value := NULLIF(TRIM(p_home_location), '');
  IF v_value IS NULL THEN
    RETURN NULL;
  END IF;

  v_location := ST_GeogFromText(
    CASE
      WHEN LOWER(v_value) LIKE 'srid=%;point(%' THEN v_value
      ELSE 'SRID=4326;' || v_value
    END
  );

  RETURN v_location;
END;
$$;

CREATE OR REPLACE FUNCTION public.profile_display_name(
  p_first_name text,
  p_last_name text,
  p_username text,
  p_fallback_name text DEFAULT 'User'
)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    NULLIF(TRIM(CONCAT_WS(' ', p_first_name, p_last_name)), ''),
    NULLIF(TRIM(p_username), ''),
    COALESCE(NULLIF(TRIM(p_fallback_name), ''), 'User')
  );
$$;

-- --------------------------------------------------------------------------
-- 3) Auth/Profile business RPCs
-- --------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.complete_onbording(
  p_first_name text,
  p_middle_name text DEFAULT NULL, -- middle name is not mandatory
  p_last_name text DEFAULT NULL, -- last name is not mandatory
  p_username text DEFAULT NULL,
  p_phone_number text DEFAULT NULL, 
  p_emergency_contact text DEFAULT NULL, -- emergency contact is not mandatory
  p_avatar_url text DEFAULT NULL, -- avatar_url is not mandatory
  p_home_location text DEFAULT NULL, -- home_location is mandatory
  p_home_location_name text DEFAULT NULL -- home_location_name is mandatory
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
  v_existing public.profiles%ROWTYPE;
  v_is_create boolean;
  v_profile public.profiles%ROWTYPE;
  v_home_location geography;
  v_username text;
BEGIN
  v_uid := public.require_authenticated_user('Authentication required to upsert profile onboarding data.');
  v_home_location := public.parse_point_geography(p_home_location);

  SELECT * INTO v_existing
  FROM public.profiles p
  WHERE p.id = v_uid;

  v_is_create := (v_existing.id IS NULL OR v_existing.is_onboarding_complete = false);

  IF v_is_create THEN
    p_first_name := public.clean_text(p_first_name, 'first_name');
    p_last_name := COALESCE(NULLIF(TRIM(p_last_name), ''), NULL);
    v_username := public.clean_username(p_username);
    p_phone_number := public.validate_phone_with_country_code(p_phone_number, 'phone_number');
  ELSE
    IF NULLIF(TRIM(COALESCE(p_first_name, '')), '') IS NOT NULL THEN
      p_first_name := public.clean_text(p_first_name, 'first_name');
    END IF;
    IF NULLIF(TRIM(COALESCE(p_last_name, '')), '') IS NOT NULL THEN
      p_last_name := public.clean_text(p_last_name, 'last_name');
    END IF;
    IF NULLIF(TRIM(COALESCE(p_username, '')), '') IS NOT NULL THEN
      v_username := public.clean_username(p_username);
    ELSE
      v_username := NULL;
    END IF;
    IF NULLIF(TRIM(COALESCE(p_phone_number, '')), '') IS NOT NULL THEN
      p_phone_number := public.validate_phone_with_country_code(p_phone_number, 'phone_number');
    END IF;
  END IF;

  IF v_username IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles p WHERE LOWER(p.username) = v_username AND p.id <> v_uid
  ) THEN
    RAISE EXCEPTION 'Username already taken.';
  END IF;

  INSERT INTO public.profiles (
    id,
    first_name,
    middle_name,
    last_name,
    username,
    phone_number,
    emergency_contact,
    avatar_url,
    home_location,
    home_location_name,
    is_onboarding_complete,
    updated_at
  ) VALUES (
    v_uid,
    NULLIF(TRIM(p_first_name), ''),
    public.clean_optional_text(p_middle_name),
    NULLIF(TRIM(p_last_name), ''),
    COALESCE(v_username, public.clean_optional_text(p_username)),
    public.clean_optional_text(p_phone_number),
    public.clean_optional_text(p_emergency_contact),
    public.clean_optional_text(p_avatar_url),
    v_home_location,
    public.clean_optional_text(p_home_location_name),
    true,
    now()
  )
  ON CONFLICT (id)
  DO UPDATE SET
    first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
    middle_name = COALESCE(EXCLUDED.middle_name, public.profiles.middle_name),
    last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
    username = COALESCE(EXCLUDED.username, public.profiles.username),
    phone_number = COALESCE(EXCLUDED.phone_number, public.profiles.phone_number),
    emergency_contact = COALESCE(EXCLUDED.emergency_contact, public.profiles.emergency_contact),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    home_location = COALESCE(EXCLUDED.home_location, public.profiles.home_location),
    home_location_name = COALESCE(EXCLUDED.home_location_name, public.profiles.home_location_name),
    is_onboarding_complete = true,
    updated_at = now()
  RETURNING * INTO v_profile;

  -- Return the latest canonical auth/profile payload.
  RETURN public.fetch_profile(v_profile.id);
END;
$$;



/*
-=======================================
-- Removed RPC: get_feature_destination_data ---
Violates rule of no aggregate read RPCs; 
can be easily done in client side by small rpcs call in promise.all
=========================================
*/



-- --------------------------------------------------------------------------
-- 4) Guide application and moderation RPCs
-- --------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.apply_guide_application(
  p_nid_document_type nid_type,
  p_nid_number text,
  p_nid_photo_url text,
  p_description text,
  p_previous_experience text,
  p_known_languages jsonb DEFAULT '[]'::jsonb,
  p_service_areas jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
  v_application_id uuid;
  v_known_languages jsonb;
  v_service_areas jsonb;
BEGIN
  v_uid := public.require_authenticated_user('Authentication required to apply as guide.');
  v_known_languages := public.validate_jsonb_array(p_known_languages, 'known_languages');
  v_service_areas := public.validate_jsonb_array(p_service_areas, 'service_areas');

  IF EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = v_uid AND p.is_guide = true) THEN
    RAISE EXCEPTION 'You are already registered as a guide.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.guide_applications ga WHERE ga.user_id = v_uid AND ga.status = 'pending'
  ) THEN
    RAISE EXCEPTION 'You already have a pending guide application.';
  END IF;

  INSERT INTO public.guide_applications (
    user_id,
    nid_document_type,
    nid_number,
    nid_photo_url,
    description,
    previous_experience,
    known_languages,
    status,
    created_at,
    updated_at
  ) VALUES (
    v_uid,
    p_nid_document_type,
    public.clean_text(p_nid_number, 'nid_number'),
    public.clean_text(p_nid_photo_url, 'nid_photo_url'),
    public.clean_optional_text(p_description),
    public.clean_optional_text(p_previous_experience),
    v_known_languages,
    'pending',
    now(),
    now()
  )
  RETURNING application_id INTO v_application_id;

  INSERT INTO public.guide_service_areas_applications (
    application_id,
    location,
    radius_meters,
    location_name,
    created_at
  )
  SELECT
    v_application_id,
    ST_SetSRID(ST_MakePoint((x->>'lng')::numeric, (x->>'lat')::numeric), 4326)::geography,
    GREATEST(COALESCE((x->>'radius_meters')::numeric, 0), 100),
    public.clean_optional_text(x->>'location_name'),
    now()
  FROM jsonb_array_elements(v_service_areas) x
  WHERE (x ? 'lat') AND (x ? 'lng');

  UPDATE public.profiles
  SET is_guide_applicantion_pending = true,
      updated_at = now()
  WHERE id = v_uid;

  RETURN v_application_id;
END;
$$;


/*
====================REMOVED===================
-- 1. get_my_guide_applications
This can be fetched easily by making rls and direct query

-- 2. get_admin_guide_applications (admin)
this has no complex logic as admin can directly query the table with rls

*/
CREATE OR REPLACE FUNCTION public.change_guide_application_status(
  p_application_id uuid,
  p_status guide_application_status,
  p_admin_feedback text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id uuid;
  v_feedback text;
  v_application public.guide_applications%ROWTYPE;
BEGIN
  v_admin_id := public.require_admin_access();
  v_feedback := public.clean_text(p_admin_feedback, 'admin_feedback');

  IF p_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status. Allowed values are approved or rejected.';
  END IF;

  UPDATE public.guide_applications ga
  SET status = p_status,
      admin_feedback = v_feedback,
      updated_at = now()
  WHERE ga.application_id = p_application_id
  RETURNING * INTO v_application;

  IF v_application.application_id IS NULL THEN
    RAISE EXCEPTION 'Guide application not found.';
  END IF;

  UPDATE public.profiles
  SET is_guide_applicantion_pending = false,
      is_guide = CASE WHEN p_status = 'approved' THEN true ELSE is_guide END,
      updated_at = now()
  WHERE id = v_application.user_id;

  IF p_status = 'approved' THEN
    INSERT INTO public.guides (
      id,
      description,
      previous_experience,
      known_languages,
      admin_feedback,
      is_available,
      is_suspended,
      avg_rating
    ) VALUES (
      v_application.user_id,
      v_application.description,
      v_application.previous_experience,
      COALESCE(v_application.known_languages, '[]'::jsonb),
      v_feedback,
      true,
      false,
      0
    )
    ON CONFLICT (id)
    DO UPDATE SET
      description = EXCLUDED.description,
      previous_experience = EXCLUDED.previous_experience,
      known_languages = EXCLUDED.known_languages,
      admin_feedback = EXCLUDED.admin_feedback,
      is_suspended = false;

    DELETE FROM public.guide_service_areas WHERE guide_id = v_application.user_id;

    INSERT INTO public.guide_service_areas (guide_id, location, radius_meters, location_name)
    SELECT
      v_application.user_id,
      gsaa.location,
      gsaa.radius_meters,
      gsaa.location_name
    FROM public.guide_service_areas_applications gsaa
    WHERE gsaa.application_id = v_application.application_id;
  END IF;

  RETURN to_jsonb(v_application);
END;
$$;


/*
-- Changes the name of suspend_guide into change_guide_suspend_status
this now can be used for both suspension and unsuspension by admin, 
*/
CREATE OR REPLACE FUNCTION public.change_guide_suspend_status(
  p_guide_id uuid,
  p_status boolean,
  p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id uuid;
  v_reason text;
  v_status boolean;
BEGIN
  v_admin_id := public.require_admin_access();
  v_reason := public.clean_text(p_reason, 'suspension reason');
  v_status := COALESCE(p_status, false);

  IF NOT EXISTS (SELECT 1 FROM public.guides g WHERE g.id = p_guide_id) THEN
    RAISE EXCEPTION 'Guide not found.';
  END IF;

  UPDATE public.guides
  SET is_suspended = v_status,
      is_available = CASE WHEN v_status THEN false ELSE true END,
      admin_feedback = v_reason
  WHERE id = p_guide_id;

  IF v_status THEN
    INSERT INTO public.suspended_guides (guide_id, reason, admin_id, created_at)
    VALUES (p_guide_id, v_reason, v_admin_id, now());
  END IF;

  RETURN jsonb_build_object(
    'guide_id', p_guide_id,
    'suspended', v_status,
    'reason', v_reason
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.require_admin_or_system_job_access(
  p_message text DEFAULT 'Unauthorized: admin access required.'
)
RETURNS void
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    PERFORM public.require_admin_access(p_message);
    RETURN;
  END IF;

  IF session_user NOT IN ('postgres', 'supabase_admin', 'service_role') THEN
    RAISE EXCEPTION '%', COALESCE(NULLIF(TRIM(p_message), ''), 'Unauthorized: admin access required.')
      USING ERRCODE = '42501';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.analytics_metric_from_ids(p_ids uuid[])
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT jsonb_build_object(
    'total', COALESCE(array_length(p_ids, 1), 0),
    'data', COALESCE(to_jsonb(p_ids), '[]'::jsonb)
  );
$$;

CREATE OR REPLACE FUNCTION public.build_admin_analytics_payload(
  p_days integer DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_days integer;
  v_window_start timestamptz;
  v_window_end timestamptz;
BEGIN
  PERFORM public.require_admin_or_system_job_access('Unauthorized: admin access required to build analytics payload.');

  v_days := GREATEST(COALESCE(p_days, 1), 1);
  v_window_end := now();
  v_window_start := v_window_end - make_interval(days => v_days);

  RETURN jsonb_build_object(
    'window', jsonb_build_object(
      'days', v_days,
      'start_at', v_window_start,
      'end_at', v_window_end
    ),
    'users', jsonb_build_object(
      'total', public.analytics_metric_from_ids(ARRAY(
        SELECT p.id FROM public.profiles p ORDER BY p.created_at DESC
      )),
      'new', public.analytics_metric_from_ids(ARRAY(
        SELECT p.id FROM public.profiles p
        WHERE p.created_at >= v_window_start AND p.created_at < v_window_end
        ORDER BY p.created_at DESC
      )),
      'admins', public.analytics_metric_from_ids(ARRAY(
        SELECT p.id FROM public.profiles p WHERE p.is_admin = true ORDER BY p.created_at DESC
      )),
      'guides_flagged', public.analytics_metric_from_ids(ARRAY(
        SELECT p.id FROM public.profiles p WHERE p.is_guide = true ORDER BY p.created_at DESC
      )),
      'guide_application_pending', public.analytics_metric_from_ids(ARRAY(
        SELECT p.id FROM public.profiles p WHERE p.is_guide_applicantion_pending = true ORDER BY p.updated_at DESC
      )),
      'verified_auth_accounts', public.analytics_metric_from_ids(ARRAY(
        SELECT au.id FROM auth.users au
        WHERE au.email_confirmed_at IS NOT NULL OR au.phone_confirmed_at IS NOT NULL
        ORDER BY au.created_at DESC
      )),
      'new_verified_auth_accounts', public.analytics_metric_from_ids(ARRAY(
        SELECT au.id FROM auth.users au
        WHERE (au.email_confirmed_at IS NOT NULL OR au.phone_confirmed_at IS NOT NULL)
          AND au.created_at >= v_window_start AND au.created_at < v_window_end
        ORDER BY au.created_at DESC
      ))
    ),
    'guides', jsonb_build_object(
      'total', public.analytics_metric_from_ids(ARRAY(
        SELECT g.id FROM public.guides g ORDER BY g.id
      )),
      'new', public.analytics_metric_from_ids(ARRAY(
        SELECT g.id
        FROM public.guides g
        JOIN public.profiles p ON p.id = g.id
        WHERE p.created_at >= v_window_start AND p.created_at < v_window_end
        ORDER BY p.created_at DESC
      )),
      'available', public.analytics_metric_from_ids(ARRAY(
        SELECT g.id FROM public.guides g WHERE g.is_available = true ORDER BY g.id
      )),
      'suspended', public.analytics_metric_from_ids(ARRAY(
        SELECT g.id FROM public.guides g WHERE g.is_suspended = true ORDER BY g.id
      )),
      'with_service_areas', public.analytics_metric_from_ids(ARRAY(
        SELECT DISTINCT gsa.guide_id FROM public.guide_service_areas gsa ORDER BY gsa.guide_id
      )),
      'with_reviews', public.analytics_metric_from_ids(ARRAY(
        SELECT DISTINCT gr.guide_id FROM public.guide_reviews gr ORDER BY gr.guide_id
      ))
    ),
    'guide_applications', jsonb_build_object(
      'total', public.analytics_metric_from_ids(ARRAY(
        SELECT ga.application_id FROM public.guide_applications ga ORDER BY ga.created_at DESC
      )),
      'new', public.analytics_metric_from_ids(ARRAY(
        SELECT ga.application_id FROM public.guide_applications ga
        WHERE ga.created_at >= v_window_start AND ga.created_at < v_window_end
        ORDER BY ga.created_at DESC
      )),
      'pending', public.analytics_metric_from_ids(ARRAY(
        SELECT ga.application_id FROM public.guide_applications ga WHERE ga.status = 'pending' ORDER BY ga.updated_at DESC
      )),
      'approved', public.analytics_metric_from_ids(ARRAY(
        SELECT ga.application_id FROM public.guide_applications ga WHERE ga.status = 'approved' ORDER BY ga.updated_at DESC
      )),
      'rejected', public.analytics_metric_from_ids(ARRAY(
        SELECT ga.application_id FROM public.guide_applications ga WHERE ga.status = 'rejected' ORDER BY ga.updated_at DESC
      ))
    ),
    'unsuspension_requests', jsonb_build_object(
      'total', public.analytics_metric_from_ids(ARRAY(
        SELECT ur.id FROM public.unsuspension_requests ur ORDER BY ur.created_at DESC
      )),
      'new', public.analytics_metric_from_ids(ARRAY(
        SELECT ur.id FROM public.unsuspension_requests ur
        WHERE ur.created_at >= v_window_start AND ur.created_at < v_window_end
        ORDER BY ur.created_at DESC
      )),
      'pending', public.analytics_metric_from_ids(ARRAY(
        SELECT ur.id FROM public.unsuspension_requests ur WHERE ur.status = 'pending' ORDER BY ur.updated_at DESC
      )),
      'approved', public.analytics_metric_from_ids(ARRAY(
        SELECT ur.id FROM public.unsuspension_requests ur WHERE ur.status = 'approved' ORDER BY ur.updated_at DESC
      )),
      'rejected', public.analytics_metric_from_ids(ARRAY(
        SELECT ur.id FROM public.unsuspension_requests ur WHERE ur.status = 'rejected' ORDER BY ur.updated_at DESC
      ))
    ),
    'destinations', jsonb_build_object(
      'total', public.analytics_metric_from_ids(ARRAY(
        SELECT d.id FROM public.base_destination d ORDER BY d.created_at DESC
      )),
      'new', public.analytics_metric_from_ids(ARRAY(
        SELECT d.id FROM public.base_destination d
        WHERE d.created_at >= v_window_start AND d.created_at < v_window_end
        ORDER BY d.created_at DESC
      )),
      'with_reviews', public.analytics_metric_from_ids(ARRAY(
        SELECT DISTINCT dr.destination_id FROM public.base_destination_reviews dr ORDER BY dr.destination_id
      )),
      'with_possible_activities', public.analytics_metric_from_ids(ARRAY(
        SELECT d.id FROM public.base_destination d
        WHERE cardinality(d.possible_activities) > 0
        ORDER BY d.created_at DESC
      ))
    ),
    'destination_reviews', jsonb_build_object(
      'total', public.analytics_metric_from_ids(ARRAY(
        SELECT dr.id FROM public.base_destination_reviews dr ORDER BY dr.created_at DESC
      )),
      'new', public.analytics_metric_from_ids(ARRAY(
        SELECT dr.id FROM public.base_destination_reviews dr
        WHERE dr.created_at >= v_window_start AND dr.created_at < v_window_end
        ORDER BY dr.created_at DESC
      ))
    ),
    'activities', jsonb_build_object(
      'total', public.analytics_metric_from_ids(ARRAY(
        SELECT a.id FROM public.activities a ORDER BY a.created_at DESC
      )),
      'new', public.analytics_metric_from_ids(ARRAY(
        SELECT a.id FROM public.activities a
        WHERE a.created_at >= v_window_start AND a.created_at < v_window_end
        ORDER BY a.created_at DESC
      ))
    ),
    'travel_packages', jsonb_build_object(
      'total', public.analytics_metric_from_ids(ARRAY(
        SELECT tp.id FROM public.travel_packages tp ORDER BY tp.created_at DESC
      )),
      'new', public.analytics_metric_from_ids(ARRAY(
        SELECT tp.id FROM public.travel_packages tp
        WHERE tp.created_at >= v_window_start AND tp.created_at < v_window_end
        ORDER BY tp.created_at DESC
      )),
      'destination_packages', public.analytics_metric_from_ids(ARRAY(
        SELECT tp.id FROM public.travel_packages tp WHERE tp.type = 'destinations_package' ORDER BY tp.created_at DESC
      )),
      'activities_packages', public.analytics_metric_from_ids(ARRAY(
        SELECT tp.id FROM public.travel_packages tp WHERE tp.type = 'activities_package' ORDER BY tp.created_at DESC
      )),
      'discount_active', public.analytics_metric_from_ids(ARRAY(
        SELECT tp.id FROM public.travel_packages tp
        WHERE tp.discount_deadline IS NOT NULL AND tp.discount_deadline >= v_window_end
        ORDER BY tp.discount_deadline ASC
      )),
      'expired', public.analytics_metric_from_ids(ARRAY(
        SELECT tp.id FROM public.travel_packages tp
        WHERE tp.expiration_date IS NOT NULL AND tp.expiration_date < v_window_end
        ORDER BY tp.expiration_date DESC
      ))
    ),
    'stories', jsonb_build_object(
      'total', public.analytics_metric_from_ids(ARRAY(
        SELECT s.id FROM public.stories s ORDER BY s.created_at DESC
      )),
      'new', public.analytics_metric_from_ids(ARRAY(
        SELECT s.id FROM public.stories s
        WHERE s.created_at >= v_window_start AND s.created_at < v_window_end
        ORDER BY s.created_at DESC
      )),
      'active', public.analytics_metric_from_ids(ARRAY(
        SELECT s.id FROM public.stories s WHERE s.is_archived = false ORDER BY s.updated_at DESC
      )),
      'archived', public.analytics_metric_from_ids(ARRAY(
        SELECT s.id FROM public.stories s WHERE s.is_archived = true ORDER BY s.updated_at DESC
      )),
      'with_likes', public.analytics_metric_from_ids(ARRAY(
        SELECT s.id FROM public.stories s WHERE s.likes_count > 0 ORDER BY s.likes_count DESC, s.updated_at DESC
      )),
      'with_comments', public.analytics_metric_from_ids(ARRAY(
        SELECT s.id FROM public.stories s WHERE s.comments_count > 0 ORDER BY s.comments_count DESC, s.updated_at DESC
      ))
    ),
    'story_likes', jsonb_build_object(
      'total', public.analytics_metric_from_ids(ARRAY(
        SELECT sl.id FROM public.story_likes sl ORDER BY sl.created_at DESC
      )),
      'new', public.analytics_metric_from_ids(ARRAY(
        SELECT sl.id FROM public.story_likes sl
        WHERE sl.created_at >= v_window_start AND sl.created_at < v_window_end
        ORDER BY sl.created_at DESC
      ))
    ),
    'story_comments', jsonb_build_object(
      'total', public.analytics_metric_from_ids(ARRAY(
        SELECT sc.id FROM public.story_comments sc ORDER BY sc.created_at DESC
      )),
      'new', public.analytics_metric_from_ids(ARRAY(
        SELECT sc.id FROM public.story_comments sc
        WHERE sc.created_at >= v_window_start AND sc.created_at < v_window_end
        ORDER BY sc.created_at DESC
      ))
    ),
    'photos', jsonb_build_object(
      'total', public.analytics_metric_from_ids(ARRAY(
        SELECT p.id FROM public.photos p ORDER BY p.created_at DESC
      )),
      'new', public.analytics_metric_from_ids(ARRAY(
        SELECT p.id FROM public.photos p
        WHERE p.created_at >= v_window_start AND p.created_at < v_window_end
        ORDER BY p.created_at DESC
      )),
      'with_location', public.analytics_metric_from_ids(ARRAY(
        SELECT p.id FROM public.photos p WHERE p.location IS NOT NULL ORDER BY p.created_at DESC
      ))
    ),
    'hiring_proposals', jsonb_build_object(
      'total', public.analytics_metric_from_ids(ARRAY(
        SELECT hp.id FROM public.hiring_proposals hp ORDER BY hp.created_at DESC
      )),
      'new', public.analytics_metric_from_ids(ARRAY(
        SELECT hp.id FROM public.hiring_proposals hp
        WHERE hp.created_at >= v_window_start AND hp.created_at < v_window_end
        ORDER BY hp.created_at DESC
      )),
      'sent_by_tourist', public.analytics_metric_from_ids(ARRAY(
        SELECT hp.id FROM public.hiring_proposals hp WHERE hp.status = 'sent_by_tourist' ORDER BY hp.updated_at DESC
      )),
      'offered_by_guide', public.analytics_metric_from_ids(ARRAY(
        SELECT hp.id FROM public.hiring_proposals hp WHERE hp.status = 'offered_by_guide' ORDER BY hp.updated_at DESC
      )),
      'rejected_by_guide', public.analytics_metric_from_ids(ARRAY(
        SELECT hp.id FROM public.hiring_proposals hp WHERE hp.status = 'rejected_by_guide' ORDER BY hp.updated_at DESC
      )),
      'cancelled_by_tourist', public.analytics_metric_from_ids(ARRAY(
        SELECT hp.id FROM public.hiring_proposals hp WHERE hp.status = 'cancelled_by_tourist' ORDER BY hp.updated_at DESC
      )),
      'accepted_by_tourist', public.analytics_metric_from_ids(ARRAY(
        SELECT hp.id FROM public.hiring_proposals hp WHERE hp.status = 'accepted_by_tourist' ORDER BY hp.updated_at DESC
      ))
    ),
    'guide_bookings', jsonb_build_object(
      'total', public.analytics_metric_from_ids(ARRAY(
        SELECT gb.id FROM public.guide_bookings gb ORDER BY gb.created_at DESC
      )),
      'new', public.analytics_metric_from_ids(ARRAY(
        SELECT gb.id FROM public.guide_bookings gb
        WHERE gb.created_at >= v_window_start AND gb.created_at < v_window_end
        ORDER BY gb.created_at DESC
      )),
      'confirmed', public.analytics_metric_from_ids(ARRAY(
        SELECT gb.id FROM public.guide_bookings gb WHERE gb.status = 'confirmed' ORDER BY gb.updated_at DESC
      )),
      'completed', public.analytics_metric_from_ids(ARRAY(
        SELECT gb.id FROM public.guide_bookings gb WHERE gb.status = 'completed' ORDER BY gb.updated_at DESC
      )),
      'cancelled', public.analytics_metric_from_ids(ARRAY(
        SELECT gb.id FROM public.guide_bookings gb WHERE gb.status = 'cancelled' ORDER BY gb.updated_at DESC
      )),
      'fully_paid', public.analytics_metric_from_ids(ARRAY(
        SELECT gb.id FROM public.guide_bookings gb WHERE gb.paid_amount >= gb.final_amount ORDER BY gb.updated_at DESC
      ))
    ),
    'package_bookings', jsonb_build_object(
      'total', public.analytics_metric_from_ids(ARRAY(
        SELECT pb.id FROM public.package_bookings pb ORDER BY pb.created_at DESC
      )),
      'new', public.analytics_metric_from_ids(ARRAY(
        SELECT pb.id FROM public.package_bookings pb
        WHERE pb.created_at >= v_window_start AND pb.created_at < v_window_end
        ORDER BY pb.created_at DESC
      )),
      'confirmed', public.analytics_metric_from_ids(ARRAY(
        SELECT pb.id FROM public.package_bookings pb WHERE pb.status = 'confirmed' ORDER BY pb.updated_at DESC
      )),
      'completed', public.analytics_metric_from_ids(ARRAY(
        SELECT pb.id FROM public.package_bookings pb WHERE pb.status = 'completed' ORDER BY pb.updated_at DESC
      )),
      'cancelled', public.analytics_metric_from_ids(ARRAY(
        SELECT pb.id FROM public.package_bookings pb WHERE pb.status = 'cancelled' ORDER BY pb.updated_at DESC
      )),
      'fully_paid', public.analytics_metric_from_ids(ARRAY(
        SELECT pb.id FROM public.package_bookings pb WHERE pb.paid_amount >= pb.final_amount ORDER BY pb.updated_at DESC
      ))
    ),
    'money_flow', jsonb_build_object(
      'guide_bookings', jsonb_build_object(
        'total_final_amount', COALESCE((
          SELECT SUM(gb.final_amount) FROM public.guide_bookings gb
        ), 0),
        'total_paid_amount', COALESCE((
          SELECT SUM(gb.paid_amount) FROM public.guide_bookings gb
        ), 0),
        'window_final_amount', COALESCE((
          SELECT SUM(gb.final_amount)
          FROM public.guide_bookings gb
          WHERE gb.created_at >= v_window_start AND gb.created_at < v_window_end
        ), 0),
        'window_paid_amount', COALESCE((
          SELECT SUM(gb.paid_amount)
          FROM public.guide_bookings gb
          WHERE gb.created_at >= v_window_start AND gb.created_at < v_window_end
        ), 0)
      ),
      'package_bookings', jsonb_build_object(
        'total_final_amount', COALESCE((
          SELECT SUM(pb.final_amount) FROM public.package_bookings pb
        ), 0),
        'total_paid_amount', COALESCE((
          SELECT SUM(pb.paid_amount) FROM public.package_bookings pb
        ), 0),
        'window_final_amount', COALESCE((
          SELECT SUM(pb.final_amount)
          FROM public.package_bookings pb
          WHERE pb.created_at >= v_window_start AND pb.created_at < v_window_end
        ), 0),
        'window_paid_amount', COALESCE((
          SELECT SUM(pb.paid_amount)
          FROM public.package_bookings pb
          WHERE pb.created_at >= v_window_start AND pb.created_at < v_window_end
        ), 0)
      ),
      'payment_logs', jsonb_build_object(
        'total_succeeded_amount', COALESCE((
          SELECT SUM(pl.amount) FROM public.payment_logs pl WHERE pl.status = 'succeeded'
        ), 0),
        'total_refunded_amount', COALESCE((
          SELECT SUM(pl.amount) FROM public.payment_logs pl WHERE pl.status = 'refunded'
        ), 0),
        'net_collected_amount', COALESCE((
          SELECT SUM(CASE
            WHEN pl.status = 'succeeded' THEN pl.amount
            WHEN pl.status = 'refunded' THEN -pl.amount
            ELSE 0
          END)
          FROM public.payment_logs pl
        ), 0),
        'window_succeeded_amount', COALESCE((
          SELECT SUM(pl.amount)
          FROM public.payment_logs pl
          WHERE pl.status = 'succeeded'
            AND pl.created_at >= v_window_start AND pl.created_at < v_window_end
        ), 0),
        'window_refunded_amount', COALESCE((
          SELECT SUM(pl.amount)
          FROM public.payment_logs pl
          WHERE pl.status = 'refunded'
            AND pl.created_at >= v_window_start AND pl.created_at < v_window_end
        ), 0),
        'window_net_collected_amount', COALESCE((
          SELECT SUM(CASE
            WHEN pl.status = 'succeeded' THEN pl.amount
            WHEN pl.status = 'refunded' THEN -pl.amount
            ELSE 0
          END)
          FROM public.payment_logs pl
          WHERE pl.created_at >= v_window_start AND pl.created_at < v_window_end
        ), 0)
      )
    ),
    'payment_logs', jsonb_build_object(
      'total', public.analytics_metric_from_ids(ARRAY(
        SELECT pl.id FROM public.payment_logs pl ORDER BY pl.created_at DESC
      )),
      'new', public.analytics_metric_from_ids(ARRAY(
        SELECT pl.id FROM public.payment_logs pl
        WHERE pl.created_at >= v_window_start AND pl.created_at < v_window_end
        ORDER BY pl.created_at DESC
      )),
      'pending', public.analytics_metric_from_ids(ARRAY(
        SELECT pl.id FROM public.payment_logs pl WHERE pl.status = 'pending' ORDER BY pl.created_at DESC
      )),
      'succeeded', public.analytics_metric_from_ids(ARRAY(
        SELECT pl.id FROM public.payment_logs pl WHERE pl.status = 'succeeded' ORDER BY pl.created_at DESC
      )),
      'failed', public.analytics_metric_from_ids(ARRAY(
        SELECT pl.id FROM public.payment_logs pl WHERE pl.status = 'failed' ORDER BY pl.created_at DESC
      )),
      'refunded', public.analytics_metric_from_ids(ARRAY(
        SELECT pl.id FROM public.payment_logs pl WHERE pl.status = 'refunded' ORDER BY pl.created_at DESC
      )),
      'provider_esewa', public.analytics_metric_from_ids(ARRAY(
        SELECT pl.id FROM public.payment_logs pl WHERE pl.provider = 'esewa' ORDER BY pl.created_at DESC
      )),
      'provider_khalti', public.analytics_metric_from_ids(ARRAY(
        SELECT pl.id FROM public.payment_logs pl WHERE pl.provider = 'khalti' ORDER BY pl.created_at DESC
      )),
      'provider_stripe', public.analytics_metric_from_ids(ARRAY(
        SELECT pl.id FROM public.payment_logs pl WHERE pl.provider = 'stripe' ORDER BY pl.created_at DESC
      )),
      'provider_paypal', public.analytics_metric_from_ids(ARRAY(
        SELECT pl.id FROM public.payment_logs pl WHERE pl.provider = 'paypal' ORDER BY pl.created_at DESC
      )),
      'provider_card', public.analytics_metric_from_ids(ARRAY(
        SELECT pl.id FROM public.payment_logs pl WHERE pl.provider = 'card' ORDER BY pl.created_at DESC
      )),
      'provider_cash', public.analytics_metric_from_ids(ARRAY(
        SELECT pl.id FROM public.payment_logs pl WHERE pl.provider = 'cash' ORDER BY pl.created_at DESC
      ))
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.capture_admin_analytics_snapshot(
  p_type admin_analytics_type,
  p_days integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_days integer;
  v_id uuid;
  v_payload jsonb;
BEGIN
  PERFORM public.require_admin_or_system_job_access('Unauthorized: admin access required to capture analytics snapshot.');

  v_days := COALESCE(
    p_days,
    CASE p_type
      WHEN 'daily' THEN 1
      WHEN 'triday' THEN 3
      WHEN 'weekly' THEN 7
    END
  );

  v_payload := public.build_admin_analytics_payload(v_days);

  INSERT INTO public.admin_analytics (
    data,
    type,
    created_at,
    updated_at
  ) VALUES (
    v_payload,
    p_type,
    now(),
    now()
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.capture_all_admin_analytics_snapshots()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_daily uuid;
  v_triday uuid;
  v_weekly uuid;
BEGIN
  PERFORM public.require_admin_or_system_job_access('Unauthorized: admin access required to capture analytics snapshots.');

  v_daily := public.capture_admin_analytics_snapshot('daily', 1);
  v_triday := public.capture_admin_analytics_snapshot('triday', 3);
  v_weekly := public.capture_admin_analytics_snapshot('weekly', 7);

  RETURN jsonb_build_object(
    'daily', v_daily,
    'triday', v_triday,
    'weekly', v_weekly,
    'captured_at', now()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.run_admin_analytics_midnight_job()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.capture_all_admin_analytics_snapshots();
END;
$$;

CREATE OR REPLACE FUNCTION public.schedule_admin_analytics_midnight_job()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_id bigint;
BEGIN
  PERFORM public.require_admin_access('Unauthorized: admin access required to schedule analytics cron job.');

  FOR v_job_id IN
    SELECT jobid
    FROM cron.job
    WHERE jobname = 'unseen_nepal_admin_analytics_midnight'
  LOOP
    PERFORM cron.unschedule(v_job_id);
  END LOOP;

  PERFORM cron.schedule(
    'unseen_nepal_admin_analytics_midnight',
    '0 0 * * *',
    'SELECT public.run_admin_analytics_midnight_job();'
  );

  RETURN 'Scheduled: unseen_nepal_admin_analytics_midnight at 00:00 daily';
END;
$$;

CREATE OR REPLACE FUNCTION public.fetch_guide_profile(
  target_id uuid DEFAULT auth.uid()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
  v_target_id uuid;
  v_guide public.guides%ROWTYPE;
  v_profile public.guide_info%ROWTYPE;
  v_service_areas jsonb;
  v_suspension_reason text;
  v_result jsonb;
BEGIN
  v_uid := public.require_authenticated_user('Authentication required to fetch guide profile.');
  v_target_id := COALESCE(target_id, v_uid);

  PERFORM public.require_self_or_admin_access(
    v_target_id,
    'Unauthorized: only admin or the guide owner can access this guide profile.'
  );

  SELECT * INTO v_guide
  FROM public.guides g
  WHERE g.id = v_target_id;

  IF v_guide.id IS NULL THEN
    RAISE EXCEPTION 'Guide profile not found.';
  END IF;

  SELECT * INTO v_profile
  FROM public.guide_info gi
  WHERE gi.id = v_target_id;

  IF v_profile.id IS NULL THEN
    SELECT
      p.id,
      COALESCE(
        NULLIF(TRIM(CONCAT_WS(' ', p.first_name, p.last_name)), ''),
        NULLIF(p.username, ''),
        'UNNAMED'
      ) AS full_name,
      p.username,
      p.avatar_url,
      v_guide.avg_rating,
      v_guide.description,
      v_guide.previous_experience,
      COALESCE(v_guide.known_languages, '[]'::jsonb),
      v_guide.is_available,
      '[]'::jsonb
    INTO v_profile
    FROM public.profiles p
    WHERE p.id = v_target_id;
  END IF;

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
  INTO v_service_areas
  FROM public.guide_service_areas gsa
  WHERE gsa.guide_id = v_target_id;

  v_profile.service_areas := v_service_areas;

  IF v_guide.is_suspended THEN
    SELECT sg.reason INTO v_suspension_reason
    FROM public.suspended_guides sg
    WHERE sg.guide_id = v_target_id
    ORDER BY sg.created_at DESC
    LIMIT 1;
  END IF;

  v_result := jsonb_build_object(
    'profile', to_jsonb(v_profile),
    'admin_feedback', v_guide.admin_feedback,
    'is_suspended', v_guide.is_suspended
  );

  IF v_guide.is_suspended THEN
    v_result := v_result || jsonb_build_object('suspension_reason', public.clean_optional_text(v_suspension_reason));
  END IF;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.review_guide(
  p_guide_id uuid,
  p_rating numeric,
  p_review_text text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
  v_review_id uuid;
BEGIN
  v_uid := public.require_authenticated_user('Authentication required to review guide.');
  p_rating := public.validate_rating(p_rating, 'rating');

  IF NOT EXISTS (
    SELECT 1
    FROM public.guide_bookings gb
    WHERE gb.guide_id = p_guide_id
      AND gb.tourist_id = v_uid
      AND gb.status = 'completed'
  ) THEN
    RAISE EXCEPTION 'Only users with completed bookings can review this guide.';
  END IF;

  SELECT gr.id INTO v_review_id
  FROM public.guide_reviews gr
  WHERE gr.guide_id = p_guide_id
    AND gr.reviewer_id = v_uid
  LIMIT 1;

  IF v_review_id IS NULL THEN
    INSERT INTO public.guide_reviews (guide_id, reviewer_id, rating, review_text, created_at, updated_at)
    VALUES (p_guide_id, v_uid, p_rating, public.clean_optional_text(p_review_text), now(), now())
    RETURNING id INTO v_review_id;
  ELSE
    UPDATE public.guide_reviews
    SET rating = p_rating,
        review_text = public.clean_optional_text(p_review_text),
        updated_at = now()
    WHERE id = v_review_id;
  END IF;

  UPDATE public.guides g
  SET avg_rating = COALESCE((
    SELECT ROUND(AVG(gr.rating)::numeric, 1)
    FROM public.guide_reviews gr
    WHERE gr.guide_id = p_guide_id
  ), 0)
  WHERE g.id = p_guide_id;

  RETURN v_review_id;
END;
$$;

-- --------------------------------------------------------------------------
-- 5) Negotiation / booking business RPCs
-- --------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.map_proposal_status_to_legacy(v_status public.proposal_status)
RETURNS public.booking_request_status
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE v_status
    WHEN 'sent_by_tourist' THEN 'pending'::public.booking_request_status
    WHEN 'offered_by_guide' THEN 'approved'::public.booking_request_status
    WHEN 'rejected_by_guide' THEN 'rejected'::public.booking_request_status
    WHEN 'accepted_by_tourist' THEN 'confirmed'::public.booking_request_status
    WHEN 'cancelled_by_tourist' THEN 'cancelled'::public.booking_request_status
  END;
$$;

CREATE OR REPLACE FUNCTION public.create_hiring_proposal(
  p_guide_id uuid,
  p_destinations text,
  p_people_count integer,
  p_duration_days integer,
  p_additional_details text DEFAULT NULL,
  p_tourist_remarks text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
  v_id uuid;
BEGIN
  v_uid := public.require_authenticated_user();
  p_destinations := public.clean_text(p_destinations, 'destinations');
  p_people_count := public.validate_positive_int(p_people_count, 'people_count');
  p_duration_days := public.validate_positive_int(p_duration_days, 'duration_days');

  IF p_guide_id IS NULL THEN
    RAISE EXCEPTION 'Guide id is required.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.guides g
    WHERE g.id = p_guide_id
      AND g.is_suspended = false
      AND g.is_available = true
  ) THEN
    RAISE EXCEPTION 'Selected guide is not available right now.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.hiring_proposals hp
    WHERE hp.tourist_id = v_uid
      AND hp.guide_id = p_guide_id
      AND hp.status IN ('sent_by_tourist', 'offered_by_guide')
  ) THEN
    RAISE EXCEPTION 'A pending negotiation with this guide already exists.';
  END IF;

  INSERT INTO public.hiring_proposals (
    tourist_id,
    guide_id,
    destinations,
    people_count,
    duration_days,
    additional_details,
    tourist_cancellation_remarks,
    status,
    created_at,
    updated_at
  ) VALUES (
    v_uid,
    p_guide_id,
    p_destinations,
    p_people_count,
    p_duration_days,
    public.clean_optional_text(p_additional_details),
    public.clean_optional_text(p_tourist_remarks),
    'sent_by_tourist',
    now(),
    now()
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_guide_offer(
  p_proposal_id uuid,
  p_total_quoted_price numeric,
  p_prepay_required numeric,
  p_guide_remarks text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
  v_hp public.hiring_proposals%ROWTYPE;
BEGIN
  v_uid := public.require_authenticated_user();
  p_total_quoted_price := public.validate_non_negative_numeric(p_total_quoted_price, 'total_quoted_price');
  p_prepay_required := public.validate_non_negative_numeric(p_prepay_required, 'prepay_required');

  IF p_prepay_required > p_total_quoted_price THEN
    RAISE EXCEPTION 'Prepay amount cannot exceed total quoted price.';
  END IF;

  SELECT * INTO v_hp
  FROM public.hiring_proposals hp
  WHERE hp.id = p_proposal_id
  FOR UPDATE;

  IF v_hp.id IS NULL THEN
    RAISE EXCEPTION 'Proposal not found.';
  END IF;

  IF v_hp.guide_id <> v_uid AND NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'Only the assigned guide can offer terms.' USING ERRCODE = '42501';
  END IF;

  IF v_hp.status <> 'sent_by_tourist' THEN
    RAISE EXCEPTION 'Proposal is not open for terms offering.';
  END IF;

  UPDATE public.hiring_proposals
  SET total_quoted_price = p_total_quoted_price,
      prepay_required = p_prepay_required,
      guide_terms = public.clean_text(p_guide_remarks, 'guide_terms'),
      guide_cancellation_remarks = NULL,
      status = 'offered_by_guide',
      updated_at = now()
  WHERE id = p_proposal_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_hiring_proposal(
  p_proposal_id uuid,
  p_guide_remarks text DEFAULT NULL,
  p_tourist_remarks text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
  v_hp public.hiring_proposals%ROWTYPE;
BEGIN
  v_uid := public.require_authenticated_user();

  SELECT * INTO v_hp
  FROM public.hiring_proposals hp
  WHERE hp.id = p_proposal_id
  FOR UPDATE;

  IF v_hp.id IS NULL THEN
    RAISE EXCEPTION 'Proposal not found.';
  END IF;

  IF v_hp.status NOT IN ('sent_by_tourist', 'offered_by_guide') THEN
    RAISE EXCEPTION 'This proposal is already closed.';
  END IF;

  IF v_uid = v_hp.guide_id OR public.current_user_is_admin() THEN
    UPDATE public.hiring_proposals
    SET guide_cancellation_remarks = public.clean_text(COALESCE(p_guide_remarks, p_tourist_remarks), 'guide_cancellation_remarks'),
        status = 'rejected_by_guide',
        updated_at = now()
    WHERE id = p_proposal_id;
    RETURN;
  END IF;

  IF v_uid = v_hp.tourist_id THEN
    UPDATE public.hiring_proposals
    SET tourist_cancellation_remarks = public.clean_text(COALESCE(p_tourist_remarks, p_guide_remarks), 'tourist_cancellation_remarks'),
        status = 'cancelled_by_tourist',
        updated_at = now()
    WHERE id = p_proposal_id;
    RETURN;
  END IF;

  RAISE EXCEPTION 'Unauthorized actor for this proposal.' USING ERRCODE = '42501';
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_hiring_proposal(
  p_proposal_id uuid,
  p_tourist_remarks text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.reject_hiring_proposal(
    p_proposal_id,
    NULL,
    COALESCE(p_tourist_remarks, 'Cancelled by tourist')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_hiring_proposal_and_create_booking(
  p_proposal_id uuid,
  p_tourist_remarks text DEFAULT NULL,
  p_payment_provider public.payment_provider DEFAULT 'cash',
  p_paid_amount numeric DEFAULT NULL,
  p_provider_txn_id text DEFAULT NULL,
  p_raw_response jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
  v_hp public.hiring_proposals%ROWTYPE;
  v_paid numeric;
  v_booking_id uuid;
  v_payment_status public.payment_log_status;
BEGIN
  v_uid := public.require_authenticated_user();

  SELECT * INTO v_hp
  FROM public.hiring_proposals hp
  WHERE hp.id = p_proposal_id
  FOR UPDATE;

  IF v_hp.id IS NULL THEN
    RAISE EXCEPTION 'Proposal not found.';
  END IF;

  IF v_hp.tourist_id <> v_uid AND NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'Only the proposal owner can accept guide terms.' USING ERRCODE = '42501';
  END IF;

  IF v_hp.status <> 'offered_by_guide' THEN
    RAISE EXCEPTION 'Only offered proposals can be accepted.';
  END IF;

  IF v_hp.total_quoted_price IS NULL OR v_hp.prepay_required IS NULL THEN
    RAISE EXCEPTION 'Proposal terms are incomplete.';
  END IF;

  v_paid := COALESCE(p_paid_amount, v_hp.prepay_required);
  IF v_paid < v_hp.prepay_required OR v_paid > v_hp.total_quoted_price THEN
    RAISE EXCEPTION 'Paid amount must be between prepay and total quoted price.';
  END IF;

  UPDATE public.hiring_proposals
  SET tourist_approval_remarks = public.clean_optional_text(p_tourist_remarks),
      status = 'accepted_by_tourist',
      updated_at = now()
  WHERE id = p_proposal_id;

  INSERT INTO public.guide_bookings (
    proposal_id,
    tourist_id,
    guide_id,
    final_amount,
    prepay_amount,
    paid_amount,
    status,
    hired_at,
    created_at,
    updated_at
  ) VALUES (
    v_hp.id,
    v_hp.tourist_id,
    v_hp.guide_id,
    v_hp.total_quoted_price,
    v_hp.prepay_required,
    v_paid,
    'confirmed',
    now(),
    now(),
    now()
  )
  RETURNING id INTO v_booking_id;

  v_payment_status := CASE
    WHEN v_paid > 0 THEN 'succeeded'::public.payment_log_status
    ELSE 'pending'::public.payment_log_status
  END;

  INSERT INTO public.payment_logs (
    guide_booking_id,
    tourist_id,
    provider,
    provider_txn_id,
    amount,
    status,
    raw_response,
    created_at
  ) VALUES (
    v_booking_id,
    v_hp.tourist_id,
    p_payment_provider,
    public.clean_optional_text(p_provider_txn_id),
    v_paid,
    v_payment_status,
    COALESCE(p_raw_response, '{}'::jsonb),
    now()
  );

  RETURN jsonb_build_object(
    'booking_id', v_booking_id,
    'proposal_id', v_hp.id,
    'paid_amount', v_paid,
    'final_amount', v_hp.total_quoted_price,
    'status', 'confirmed'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.create_package_booking(
  p_package_id uuid,
  p_payment_provider public.payment_provider DEFAULT 'cash',
  p_paid_amount numeric DEFAULT NULL,
  p_participant_count integer DEFAULT 1,
  p_provider_txn_id text DEFAULT NULL,
  p_raw_response jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
  v_package public.travel_packages%ROWTYPE;
  v_booking_id uuid;
  v_paid numeric;
  v_payment_status public.payment_log_status;
BEGIN
  v_uid := public.require_authenticated_user();
  p_participant_count := public.validate_positive_int(p_participant_count, 'participant_count');

  SELECT * INTO v_package
  FROM public.travel_packages tp
  WHERE tp.id = p_package_id;

  IF v_package.id IS NULL THEN
    RAISE EXCEPTION 'Package not found.';
  END IF;

  IF v_package.expiration_date IS NOT NULL AND v_package.expiration_date <= now() THEN
    RAISE EXCEPTION 'This package has expired and cannot be booked.';
  END IF;

  v_paid := COALESCE(p_paid_amount, v_package.discounted_price);
  IF v_paid < 0 OR v_paid > v_package.discounted_price THEN
    RAISE EXCEPTION 'Invalid paid amount.';
  END IF;

  INSERT INTO public.package_bookings (
    package_id,
    tourist_id,
    final_amount,
    paid_amount,
    participant_count,
    status,
    created_at,
    updated_at
  ) VALUES (
    v_package.id,
    v_uid,
    v_package.discounted_price,
    v_paid,
    p_participant_count,
    'confirmed',
    now(),
    now()
  )
  RETURNING id INTO v_booking_id;

  v_payment_status := CASE
    WHEN v_paid > 0 THEN 'succeeded'::public.payment_log_status
    ELSE 'pending'::public.payment_log_status
  END;

  INSERT INTO public.payment_logs (
    package_booking_id,
    tourist_id,
    provider,
    provider_txn_id,
    amount,
    status,
    raw_response,
    created_at
  ) VALUES (
    v_booking_id,
    v_uid,
    p_payment_provider,
    public.clean_optional_text(p_provider_txn_id),
    v_paid,
    v_payment_status,
    COALESCE(p_raw_response, '{}'::jsonb),
    now()
  );

  RETURN jsonb_build_object(
    'package_booking_id', v_booking_id,
    'package_id', v_package.id,
    'final_amount', v_package.discounted_price,
    'paid_amount', v_paid,
    'status', 'confirmed'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_guides_for_destination(
  p_lat double precision,
  p_lon double precision,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  full_name text,
  username text,
  avatar_url text,
  avg_rating numeric,
  description text,
  previous_experience text,
  known_languages jsonb,
  is_available boolean,
  service_areas jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_point geography;
BEGIN
  IF p_lat IS NULL OR p_lon IS NULL OR p_lat < -90 OR p_lat > 90 OR p_lon < -180 OR p_lon > 180 THEN
    RAISE EXCEPTION 'Invalid coordinates. Latitude must be between -90 and 90 and longitude between -180 and 180.';
  END IF;

  v_point := ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography;

  RETURN QUERY
  WITH matched AS (
    SELECT
      ag.id,
      ag.full_name,
      ag.username,
      ag.avatar_url,
      ag.avg_rating,
      ag.description,
      ag.previous_experience,
      ag.known_languages,
      ag.is_available,
      ag.service_areas,
      MIN(ST_Distance(v_point, gsa.location)) AS min_distance_m
    FROM public.available_guides ag
    JOIN public.guide_service_areas gsa ON gsa.guide_id = ag.id
    WHERE ST_DWithin(v_point, gsa.location, gsa.radius_meters)
    GROUP BY
      ag.id,
      ag.full_name,
      ag.username,
      ag.avatar_url,
      ag.avg_rating,
      ag.description,
      ag.previous_experience,
      ag.known_languages,
      ag.is_available,
      ag.service_areas
  )
  SELECT
    m.id,
    m.full_name,
    m.username,
    m.avatar_url,
    m.avg_rating,
    m.description,
    m.previous_experience,
    m.known_languages,
    m.is_available,
    m.service_areas
  FROM matched m
  ORDER BY m.avg_rating DESC NULLS LAST, m.min_distance_m ASC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 20), 1), 100);
END;
$$;


