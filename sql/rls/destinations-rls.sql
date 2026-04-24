ALTER TABLE public.base_destination ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.base_destination_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "base_destination_public_select" ON public.base_destination;
DROP POLICY IF EXISTS "base_destination_admin_all" ON public.base_destination;

DROP POLICY IF EXISTS "base_destination_reviews_public_select" ON public.base_destination_reviews;
DROP POLICY IF EXISTS "base_destination_reviews_self_manage" ON public.base_destination_reviews;
DROP POLICY IF EXISTS "base_destination_reviews_admin_all" ON public.base_destination_reviews;

CREATE POLICY "base_destination_public_select"
ON public.base_destination
FOR SELECT
USING (true);

CREATE POLICY "base_destination_admin_all"
ON public.base_destination
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "base_destination_reviews_public_select"
ON public.base_destination_reviews
FOR SELECT
USING (true);

CREATE POLICY "base_destination_reviews_self_manage"
ON public.base_destination_reviews
FOR ALL
USING (tourist_id = auth.uid())
WITH CHECK (tourist_id = auth.uid());

CREATE POLICY "base_destination_reviews_admin_all"
ON public.base_destination_reviews
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());
