ALTER TABLE public.hiring_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hiring_proposals_participant_select" ON public.hiring_proposals;
DROP POLICY IF EXISTS "hiring_proposals_tourist_insert" ON public.hiring_proposals;
DROP POLICY IF EXISTS "hiring_proposals_participant_update" ON public.hiring_proposals;
DROP POLICY IF EXISTS "hiring_proposals_admin_all" ON public.hiring_proposals;

DROP POLICY IF EXISTS "guide_bookings_participant_select" ON public.guide_bookings;
DROP POLICY IF EXISTS "guide_bookings_tourist_insert" ON public.guide_bookings;
DROP POLICY IF EXISTS "guide_bookings_admin_all" ON public.guide_bookings;

DROP POLICY IF EXISTS "package_bookings_owner_select" ON public.package_bookings;
DROP POLICY IF EXISTS "package_bookings_owner_insert" ON public.package_bookings;
DROP POLICY IF EXISTS "package_bookings_admin_all" ON public.package_bookings;

DROP POLICY IF EXISTS "payment_logs_participant_select" ON public.payment_logs;
DROP POLICY IF EXISTS "payment_logs_tourist_insert" ON public.payment_logs;
DROP POLICY IF EXISTS "payment_logs_admin_all" ON public.payment_logs;

CREATE POLICY "hiring_proposals_participant_select"
ON public.hiring_proposals
FOR SELECT
USING (
  auth.uid() = tourist_id
  OR auth.uid() = guide_id
  OR public.current_user_is_admin()
);

CREATE POLICY "hiring_proposals_admin_all"
ON public.hiring_proposals
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "guide_bookings_participant_select"
ON public.guide_bookings
FOR SELECT
USING (
  auth.uid() = tourist_id
  OR auth.uid() = guide_id
  OR public.current_user_is_admin()
);

CREATE POLICY "guide_bookings_admin_all"
ON public.guide_bookings
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "package_bookings_owner_select"
ON public.package_bookings
FOR SELECT
USING (public.current_user_is_admin());

CREATE POLICY "package_bookings_admin_all"
ON public.package_bookings
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "payment_logs_participant_select"
ON public.payment_logs
FOR SELECT
USING (
  auth.uid() = tourist_id
  OR EXISTS (
    SELECT 1
    FROM public.guide_bookings gb
    WHERE gb.id = payment_logs.guide_booking_id
      AND gb.guide_id = auth.uid()
  )
  OR public.current_user_is_admin()
);

CREATE POLICY "payment_logs_admin_all"
ON public.payment_logs
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());
