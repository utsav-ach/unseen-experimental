ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_packages ENABLE ROW LEVEL SECURITY;


CREATE POLICY "activities_public_select"
ON public.activities
FOR SELECT
USING (true);

CREATE POLICY "activities_admin_all"
ON public.activities
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "travel_packages_public_select"
ON public.travel_packages
FOR SELECT
USING (true);

CREATE POLICY "travel_packages_admin_all"
ON public.travel_packages
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());
