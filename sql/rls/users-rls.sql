ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_public_select"
ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "profiles_admin_all"
ON public.profiles
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());
