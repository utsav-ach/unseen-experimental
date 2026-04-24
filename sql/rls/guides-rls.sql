ALTER TABLE public.guide_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_service_areas_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspended_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unsuspension_requests ENABLE ROW LEVEL SECURITY;


CREATE POLICY "guide_applications_self_select"
ON public.guide_applications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "guide_applications_admin_all"
ON public.guide_applications
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "guide_area_applications_self_manage"
ON public.guide_service_areas_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.guide_applications ga
    WHERE ga.application_id = guide_service_areas_applications.application_id
      AND ga.user_id = auth.uid()
  )
);

CREATE POLICY "guide_area_applications_admin_all"
ON public.guide_service_areas_applications
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "guides_public_select"
ON public.guides
FOR SELECT
USING (true);

CREATE POLICY "guides_self_manage"
ON public.guides
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "guides_admin_all"
ON public.guides
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "guide_service_areas_public_select"
ON public.guide_service_areas
FOR SELECT
USING (true);

CREATE POLICY "guide_service_areas_self_manage"
ON public.guide_service_areas
FOR ALL
USING (auth.uid() = guide_id)
WITH CHECK (auth.uid() = guide_id);

CREATE POLICY "guide_service_areas_admin_all"
ON public.guide_service_areas
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "guide_reviews_public_select"
ON public.guide_reviews
FOR SELECT
USING (true);

CREATE POLICY "guide_reviews_self_manage"
ON public.guide_reviews
FOR ALL
USING (auth.uid() = reviewer_id)
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "guide_reviews_admin_all"
ON public.guide_reviews
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "suspended_guides_owner_or_admin_select"
ON public.suspended_guides
FOR SELECT
USING (guide_id = auth.uid() OR public.current_user_is_admin());

CREATE POLICY "suspended_guides_admin_all"
ON public.suspended_guides
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "unsuspension_requests_owner_or_admin_select"
ON public.unsuspension_requests
FOR SELECT
USING (guide_id = auth.uid() OR public.current_user_is_admin());

CREATE POLICY "unsuspension_requests_owner_insert"
ON public.unsuspension_requests
FOR INSERT
WITH CHECK (guide_id = auth.uid());

CREATE POLICY "unsuspension_requests_owner_delete_pending"
ON public.unsuspension_requests
FOR DELETE
USING (guide_id = auth.uid() AND status = 'pending');

CREATE POLICY "unsuspension_requests_admin_all"
ON public.unsuspension_requests
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());
