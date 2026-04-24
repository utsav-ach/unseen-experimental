ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "photos_public_select"
ON public.photos
FOR SELECT
USING (true);

CREATE POLICY "photos_owner_manage"
ON public.photos
FOR ALL
USING (auth.uid() = uploader_id)
WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "photos_admin_all"
ON public.photos
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());
