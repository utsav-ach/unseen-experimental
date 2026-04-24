ALTER TABLE public.admin_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_analytics_admin_read_only" ON public.admin_analytics;

CREATE POLICY "admin_analytics_admin_read_only"
ON public.admin_analytics
FOR SELECT
USING (public.current_user_is_admin());
