-- Profiles: Extends Supabase Auth.users
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,

  first_name text,
  middle_name text,
  last_name text,

  username text UNIQUE,

  phone_number text,
  emergency_contact text,

  avatar_url text,

  -- Onboarding completion and auth verification are derived at runtime
  -- via RPCs using profile-row existence and auth.users confirmation timestamps.
  is_admin boolean DEFAULT false NOT NULL,


  home_location geography(POINT, 4326),
  home_location_name text,


  is_guide boolean DEFAULT false NOT NULL,

  -- true when latest guide application is pending
  is_guide_applicantion_pending boolean DEFAULT false NOT NULL,


  -- We set this field here but never ever use this
  -- this is just to know if the profile created was auto by trigger or not
  is_onboarding_complete boolean DEFAULT false NOT NULL,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);


/*
Note: we wont be using the profile table directly,  
Always and always use this function
*/CREATE OR REPLACE FUNCTION public.fetch_profile(target_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user auth.users%ROWTYPE;
    profile_data public.profiles%ROWTYPE;
BEGIN
    -- Get auth user
    SELECT *
    INTO auth_user
    FROM auth.users
    WHERE id = target_id;

    IF auth_user IS NULL THEN
        RETURN jsonb_build_object(
            'profile', NULL,
            'is_onboarding_done', false,
            'is_auth_verified', false
        );
    END IF;

    -- Get profile (may or may not exist)
    SELECT *
    INTO profile_data
    FROM public.profiles
    WHERE id = target_id;

    RETURN jsonb_build_object(

        -- Profile (light)
        'profile',
        CASE 
            WHEN profile_data.id IS NULL THEN NULL
            ELSE to_jsonb(profile_data) - 'is_onboarding_complete'
        END,

        'email', auth_user.email,

        -- Onboarding
        'is_onboarding_done',
        COALESCE(profile_data.is_onboarding_complete, false),

        -- Auth verification (robust)
        'is_auth_verified',
        (
            auth_user.email_confirmed_at IS NOT NULL
            OR auth_user.phone_confirmed_at IS NOT NULL
            OR auth_user.raw_app_meta_data->>'provider' IS NOT NULL
        )
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_username_available(p_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  normalized text;
BEGIN
  normalized := NULLIF(TRIM(LOWER(p_username)), '');

  IF normalized IS NULL THEN
    RETURN false;
  END IF;

  RETURN NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE LOWER(p.username) = normalized
      AND p.id <> auth.uid()
  );
END;
$$;



-- Verification status is now derived from auth.users inside fetch_profile.




/*
Contract notes:
- guide pending/approval flags are maintained by guide application triggers
- minimal public profile payload across modules must use `public.minimal_user`
- onboarding completion must be done through `complete_onbording`
- auth verification must be derived from `auth.users` confirmation fields
*/