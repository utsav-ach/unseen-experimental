CREATE TYPE nid_type AS ENUM ('citizenship', 'nid', 'license', 'pan', 'passport', 'voter_id');
CREATE TYPE guide_application_status AS ENUM ('pending', 'approved', 'rejected');

-- Guide Applications: Verification flow
CREATE TABLE public.guide_applications (
  application_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nid_document_type nid_type NOT NULL,
  nid_number text NOT NULL,
  nid_photo_url text NOT NULL,
  description GFM,
  previous_experience text,
  known_languages jsonb DEFAULT '[]',
  status guide_application_status DEFAULT 'pending' NOT NULL,
  admin_feedback GFM,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.guide_service_areas_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.guide_applications(application_id) ON DELETE CASCADE NOT NULL,
  location geography(POINT, 4326) NOT NULL,
  radius_meters numeric NOT NULL CHECK (radius_meters > 0),
  location_name text,
  created_at timestamptz DEFAULT now()
);

-- Guides: Main approved guide table
-- Only the necessary fields are copied her from application
CREATE TABLE public.guides (
  id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  description GFM,
  previous_experience text,
  known_languages jsonb DEFAULT '[]',
  admin_feedback GFM,
  
  is_available boolean DEFAULT false NOT NULL,
  is_suspended boolean DEFAULT false NOT NULL,
  avg_rating numeric(2, 1) DEFAULT 0
);

CREATE TABLE public.guide_service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid REFERENCES public.guides(id) ON DELETE CASCADE NOT NULL,
  location geography(POINT, 4326) NOT NULL,
  radius_meters numeric NOT NULL CHECK (radius_meters > 0),
  location_name text,
  created_at timestamptz DEFAULT now()
);


/*
RLS that only admin can CRUD must be enforced
during read only if the gudide_id matches the auth.uid then return
*/
CREATE TABLE public.suspended_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid REFERENCES public.guides(id) ON DELETE CASCADE NOT NULL,
  reason GFM,
  admin_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.unsuspension_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid REFERENCES public.guides(id) ON DELETE CASCADE NOT NULL,
  clarification GFM,
  status guide_application_status DEFAULT 'pending' NOT NULL,
  admin_feedback GFM,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.guide_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid REFERENCES public.guides(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  rating numeric(2, 1) CHECK (rating >= 0 AND rating <= 5),
  review_text GFM,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_guide_service_areas_location ON public.guide_service_areas USING GIST (location);
CREATE INDEX idx_guide_application_user_id ON public.guide_applications(user_id);
CREATE INDEX idx_guide_service_areas_applications_location ON public.guide_service_areas_applications USING GIST (location);
CREATE INDEX idx_guide_service_areas_applications_application_id ON public.guide_service_areas_applications(application_id);
CREATE INDEX idx_unsuspension_requests_guide_id ON public.unsuspension_requests(guide_id);
CREATE INDEX idx_guide_reviews_guide_id ON public.guide_reviews(guide_id);



/*
Suspended guides are critical and is not exposed in view
Rather a RPC with check will be used  for suspended guides
the rpc checks if admin is quering or not and return the data accordingly, this is to avoid any accidental exposure of suspended guides in public views
*/
CREATE OR REPLACE FUNCTION public.get_suspended_guides()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin boolean;
BEGIN

SELECT COALESCE(
  (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()),
  false
) INTO v_is_admin;

IF NOT v_is_admin THEN
  RAISE EXCEPTION 'Unauthorized: admin access required.' USING ERRCODE = '42501';
END IF;

RETURN (
  SELECT COALESCE(jsonb_agg(
  jsonb_build_object(
    'id', sg.guide_id,
    'reason', sg.reason,
    'admin_id', sg.admin_id,
    'created_at', sg.created_at
  ) ORDER BY sg.created_at DESC
), '[]'::jsonb)
  FROM public.suspended_guides sg
);
END;
$$;