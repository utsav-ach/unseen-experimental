-- Admin destination/package management RPCs
-- Contract: admin-only surface, explicit admin_ prefix naming.

CREATE OR REPLACE FUNCTION public.admin_create_base_destination(
  p_name text,
  p_lat numeric,
  p_lng numeric,
  p_radius numeric DEFAULT 25,
  p_tags text[] DEFAULT '{}',
  p_description text DEFAULT NULL,
  p_feature_image text DEFAULT NULL,
  p_additional_images jsonb DEFAULT '[]'::jsonb,
  p_possible_activities uuid[] DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
  v_radius numeric;
  v_additional_images jsonb;
BEGIN
  PERFORM public.require_admin_access('Unauthorized: admin access required to create destination.');

  v_radius := COALESCE(p_radius, 25);
  IF v_radius <= 0 THEN
    RAISE EXCEPTION 'radius must be greater than zero.';
  END IF;

  v_additional_images := COALESCE(p_additional_images, '[]'::jsonb);
  IF jsonb_typeof(v_additional_images) <> 'array' THEN
    RAISE EXCEPTION 'additional_images must be a JSON array.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM unnest(COALESCE(p_possible_activities, '{}'::uuid[])) pa(id)
    LEFT JOIN public.activities a ON a.id = pa.id
    WHERE a.id IS NULL
  ) THEN
    RAISE EXCEPTION 'One or more activity ids in possible_activities are invalid.';
  END IF;

  INSERT INTO public.base_destination (
    name,
    coordinates,
    radius,
    tags,
    description,
    feature_image,
    additional_images,
    possible_activities,
    created_at,
    updated_at
  ) VALUES (
    public.clean_text(p_name, 'name'),
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
    v_radius,
    COALESCE(p_tags, '{}'::text[]),
    public.clean_optional_text(p_description),
    public.clean_optional_text(p_feature_image),
    v_additional_images,
    COALESCE(p_possible_activities, '{}'::uuid[]),
    now(),
    now()
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;


CREATE OR REPLACE FUNCTION public.admin_update_base_destination(
  p_destination_id uuid,
  p_name text DEFAULT NULL,
  p_lat numeric DEFAULT NULL,
  p_lng numeric DEFAULT NULL,
  p_radius numeric DEFAULT NULL,
  p_tags text[] DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_feature_image text DEFAULT NULL,
  p_additional_images jsonb DEFAULT NULL,
  p_possible_activities uuid[] DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing public.base_destination%ROWTYPE;
  v_additional_images jsonb;
BEGIN
  PERFORM public.require_admin_access('Unauthorized: admin access required to update destination.');

  SELECT * INTO v_existing
  FROM public.base_destination d
  WHERE d.id = p_destination_id;

  IF v_existing.id IS NULL THEN
    RAISE EXCEPTION 'Destination not found.';
  END IF;

  IF p_radius IS NOT NULL AND p_radius <= 0 THEN
    RAISE EXCEPTION 'radius must be greater than zero.';
  END IF;

  IF (p_lat IS NULL) <> (p_lng IS NULL) THEN
    RAISE EXCEPTION 'Both lat and lng are required when updating coordinates.';
  END IF;

  IF p_possible_activities IS NOT NULL AND EXISTS (
    SELECT 1
    FROM unnest(p_possible_activities) pa(id)
    LEFT JOIN public.activities a ON a.id = pa.id
    WHERE a.id IS NULL
  ) THEN
    RAISE EXCEPTION 'One or more activity ids in possible_activities are invalid.';
  END IF;

  IF p_additional_images IS NOT NULL THEN
    v_additional_images := p_additional_images;
    IF jsonb_typeof(v_additional_images) <> 'array' THEN
      RAISE EXCEPTION 'additional_images must be a JSON array.';
    END IF;
  ELSE
    v_additional_images := v_existing.additional_images;
  END IF;

  UPDATE public.base_destination d
  SET name = COALESCE(public.clean_optional_text(p_name), d.name),
      coordinates = CASE
        WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL THEN ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
        ELSE d.coordinates
      END,
      radius = COALESCE(p_radius, d.radius),
      tags = COALESCE(p_tags, d.tags),
      description = COALESCE(public.clean_optional_text(p_description), d.description),
      feature_image = COALESCE(public.clean_optional_text(p_feature_image), d.feature_image),
      additional_images = v_additional_images,
      possible_activities = COALESCE(p_possible_activities, d.possible_activities),
      updated_at = now()
  WHERE d.id = p_destination_id
  RETURNING to_jsonb(d.*) INTO v_additional_images;

  RETURN v_additional_images;
END;
$$;


CREATE OR REPLACE FUNCTION public.admin_delete_base_destination(
  p_destination_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_id uuid;
BEGIN
  PERFORM public.require_admin_access('Unauthorized: admin access required to delete destination.');

  DELETE FROM public.base_destination d
  WHERE d.id = p_destination_id
  RETURNING d.id INTO v_deleted_id;

  IF v_deleted_id IS NULL THEN
    RAISE EXCEPTION 'Destination not found.';
  END IF;

  RETURN jsonb_build_object('id', v_deleted_id, 'deleted', true);
END;
$$;


CREATE OR REPLACE FUNCTION public.admin_create_activity(
  p_name text,
  p_description text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  PERFORM public.require_admin_access('Unauthorized: admin access required to create activity.');

  INSERT INTO public.activities (
    name,
    description,
    created_at,
    updated_at
  ) VALUES (
    public.clean_text(p_name, 'name'),
    public.clean_text(p_description, 'description'),
    now(),
    now()
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;


CREATE OR REPLACE FUNCTION public.admin_update_activity(
  p_activity_id uuid,
  p_name text DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  PERFORM public.require_admin_access('Unauthorized: admin access required to update activity.');

  UPDATE public.activities a
  SET name = COALESCE(public.clean_optional_text(p_name), a.name),
      description = COALESCE(public.clean_optional_text(p_description), a.description),
      updated_at = now()
  WHERE a.id = p_activity_id
  RETURNING to_jsonb(a.*) INTO v_result;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Activity not found.';
  END IF;

  RETURN v_result;
END;
$$;


CREATE OR REPLACE FUNCTION public.admin_delete_activity(
  p_activity_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_id uuid;
BEGIN
  PERFORM public.require_admin_access('Unauthorized: admin access required to delete activity.');

  DELETE FROM public.activities a
  WHERE a.id = p_activity_id
  RETURNING a.id INTO v_deleted_id;

  IF v_deleted_id IS NULL THEN
    RAISE EXCEPTION 'Activity not found.';
  END IF;

  RETURN jsonb_build_object('id', v_deleted_id, 'deleted', true);
END;
$$;


CREATE OR REPLACE FUNCTION public.admin_create_travel_package(
  p_name text,
  p_type package_type,
  p_actual_price numeric,
  p_discounted_price numeric,
  p_discount_deadline timestamptz DEFAULT NULL,
  p_expiration_date timestamptz DEFAULT NULL,
  p_featured_image text DEFAULT NULL,
  p_additional_images jsonb DEFAULT '[]'::jsonb,
  p_total_days integer DEFAULT 1,
  p_travel_routes text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_destinations_covered uuid[] DEFAULT '{}',
  p_included_activities uuid[] DEFAULT '{}',
  p_main_activity uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
  v_additional_images jsonb;
BEGIN
  PERFORM public.require_admin_access('Unauthorized: admin access required to create travel package.');

  PERFORM public.validate_non_negative_numeric(p_actual_price, 'actual_price');
  PERFORM public.validate_non_negative_numeric(p_discounted_price, 'discounted_price');
  PERFORM public.validate_positive_int(p_total_days, 'total_days');

  IF p_discounted_price > p_actual_price THEN
    RAISE EXCEPTION 'discounted_price cannot be greater than actual_price.';
  END IF;

  IF p_type = 'activities_package' AND p_main_activity IS NULL THEN
    RAISE EXCEPTION 'main_activity is required for activities_package.';
  END IF;

  IF p_main_activity IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.activities a WHERE a.id = p_main_activity
  ) THEN
    RAISE EXCEPTION 'main_activity is invalid.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM unnest(COALESCE(p_destinations_covered, '{}'::uuid[])) d(id)
    LEFT JOIN public.base_destination bd ON bd.id = d.id
    WHERE bd.id IS NULL
  ) THEN
    RAISE EXCEPTION 'One or more destination ids in destinations_covered are invalid.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM unnest(COALESCE(p_included_activities, '{}'::uuid[])) ia(id)
    LEFT JOIN public.activities a ON a.id = ia.id
    WHERE a.id IS NULL
  ) THEN
    RAISE EXCEPTION 'One or more activity ids in included_activities are invalid.';
  END IF;

  v_additional_images := COALESCE(p_additional_images, '[]'::jsonb);
  IF jsonb_typeof(v_additional_images) <> 'array' THEN
    RAISE EXCEPTION 'additional_images must be a JSON array.';
  END IF;

  INSERT INTO public.travel_packages (
    name,
    type,
    actual_price,
    discounted_price,
    discount_deadline,
    expiration_date,
    featured_image,
    additional_images,
    total_days,
    travel_routes,
    description,
    destinations_covered,
    included_activities,
    main_activity,
    created_at,
    updated_at
  ) VALUES (
    public.clean_text(p_name, 'name'),
    p_type,
    p_actual_price,
    p_discounted_price,
    p_discount_deadline,
    p_expiration_date,
    public.clean_text(p_featured_image, 'featured_image'),
    v_additional_images,
    p_total_days,
    public.clean_text(p_travel_routes, 'travel_routes'),
    public.clean_optional_text(p_description),
    COALESCE(p_destinations_covered, '{}'::uuid[]),
    COALESCE(p_included_activities, '{}'::uuid[]),
    p_main_activity,
    now(),
    now()
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;


CREATE OR REPLACE FUNCTION public.admin_update_travel_package(
  p_package_id uuid,
  p_name text DEFAULT NULL,
  p_type package_type DEFAULT NULL,
  p_actual_price numeric DEFAULT NULL,
  p_discounted_price numeric DEFAULT NULL,
  p_discount_deadline timestamptz DEFAULT NULL,
  p_expiration_date timestamptz DEFAULT NULL,
  p_featured_image text DEFAULT NULL,
  p_additional_images jsonb DEFAULT NULL,
  p_total_days integer DEFAULT NULL,
  p_travel_routes text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_destinations_covered uuid[] DEFAULT NULL,
  p_included_activities uuid[] DEFAULT NULL,
  p_main_activity uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing public.travel_packages%ROWTYPE;
  v_final_type package_type;
  v_final_actual_price numeric;
  v_final_discounted_price numeric;
  v_final_main_activity uuid;
  v_final_additional_images jsonb;
  v_result jsonb;
BEGIN
  PERFORM public.require_admin_access('Unauthorized: admin access required to update travel package.');

  SELECT * INTO v_existing
  FROM public.travel_packages tp
  WHERE tp.id = p_package_id;

  IF v_existing.id IS NULL THEN
    RAISE EXCEPTION 'Travel package not found.';
  END IF;

  IF p_total_days IS NOT NULL THEN
    PERFORM public.validate_positive_int(p_total_days, 'total_days');
  END IF;

  IF p_actual_price IS NOT NULL THEN
    PERFORM public.validate_non_negative_numeric(p_actual_price, 'actual_price');
  END IF;

  IF p_discounted_price IS NOT NULL THEN
    PERFORM public.validate_non_negative_numeric(p_discounted_price, 'discounted_price');
  END IF;

  IF p_destinations_covered IS NOT NULL AND EXISTS (
    SELECT 1
    FROM unnest(p_destinations_covered) d(id)
    LEFT JOIN public.base_destination bd ON bd.id = d.id
    WHERE bd.id IS NULL
  ) THEN
    RAISE EXCEPTION 'One or more destination ids in destinations_covered are invalid.';
  END IF;

  IF p_included_activities IS NOT NULL AND EXISTS (
    SELECT 1
    FROM unnest(p_included_activities) ia(id)
    LEFT JOIN public.activities a ON a.id = ia.id
    WHERE a.id IS NULL
  ) THEN
    RAISE EXCEPTION 'One or more activity ids in included_activities are invalid.';
  END IF;

  v_final_type := COALESCE(p_type, v_existing.type);
  v_final_actual_price := COALESCE(p_actual_price, v_existing.actual_price);
  v_final_discounted_price := COALESCE(p_discounted_price, v_existing.discounted_price);
  v_final_main_activity := COALESCE(p_main_activity, v_existing.main_activity);

  IF v_final_discounted_price > v_final_actual_price THEN
    RAISE EXCEPTION 'discounted_price cannot be greater than actual_price.';
  END IF;

  IF v_final_type = 'activities_package' AND v_final_main_activity IS NULL THEN
    RAISE EXCEPTION 'main_activity is required for activities_package.';
  END IF;

  IF v_final_main_activity IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.activities a WHERE a.id = v_final_main_activity
  ) THEN
    RAISE EXCEPTION 'main_activity is invalid.';
  END IF;

  IF p_additional_images IS NOT NULL THEN
    v_final_additional_images := p_additional_images;
    IF jsonb_typeof(v_final_additional_images) <> 'array' THEN
      RAISE EXCEPTION 'additional_images must be a JSON array.';
    END IF;
  ELSE
    v_final_additional_images := v_existing.additional_images;
  END IF;

  UPDATE public.travel_packages tp
  SET name = COALESCE(public.clean_optional_text(p_name), tp.name),
      type = v_final_type,
      actual_price = v_final_actual_price,
      discounted_price = v_final_discounted_price,
      discount_deadline = COALESCE(p_discount_deadline, tp.discount_deadline),
      expiration_date = COALESCE(p_expiration_date, tp.expiration_date),
      featured_image = COALESCE(public.clean_optional_text(p_featured_image), tp.featured_image),
      additional_images = v_final_additional_images,
      total_days = COALESCE(p_total_days, tp.total_days),
      travel_routes = COALESCE(public.clean_optional_text(p_travel_routes), tp.travel_routes),
      description = COALESCE(public.clean_optional_text(p_description), tp.description),
      destinations_covered = COALESCE(p_destinations_covered, tp.destinations_covered),
      included_activities = COALESCE(p_included_activities, tp.included_activities),
      main_activity = v_final_main_activity,
      updated_at = now()
  WHERE tp.id = p_package_id
  RETURNING to_jsonb(tp.*) INTO v_result;

  RETURN v_result;
END;
$$;


CREATE OR REPLACE FUNCTION public.admin_delete_travel_package(
  p_package_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_id uuid;
BEGIN
  PERFORM public.require_admin_access('Unauthorized: admin access required to delete travel package.');

  DELETE FROM public.travel_packages tp
  WHERE tp.id = p_package_id
  RETURNING tp.id INTO v_deleted_id;

  IF v_deleted_id IS NULL THEN
    RAISE EXCEPTION 'Travel package not found.';
  END IF;

  RETURN jsonb_build_object('id', v_deleted_id, 'deleted', true);
END;
$$;
