CREATE POLICY "storage_profile_pics_public_select"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profile_pics');

CREATE POLICY "storage_profile_pics_owner_manage"
ON storage.objects
FOR ALL
USING (bucket_id = 'profile_pics' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'profile_pics' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "storage_profile_pics_admin_manage"
ON storage.objects
FOR ALL
USING (bucket_id = 'profile_pics' AND public.current_user_is_admin())
WITH CHECK (bucket_id = 'profile_pics' AND public.current_user_is_admin());

CREATE POLICY "storage_vault_owner_select"
ON storage.objects
FOR SELECT
USING (bucket_id = 'vault' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "storage_vault_owner_insert"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'vault' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "storage_vault_owner_update_delete"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'vault' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'vault' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "storage_vault_owner_delete"
ON storage.objects
FOR DELETE
USING (bucket_id = 'vault' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "storage_vault_admin_all"
ON storage.objects
FOR ALL
USING (bucket_id = 'vault' AND public.current_user_is_admin())
WITH CHECK (bucket_id = 'vault' AND public.current_user_is_admin());

CREATE POLICY "storage_stories_images_public_select"
ON storage.objects
FOR SELECT
USING (bucket_id = 'stories_images');

CREATE POLICY "storage_stories_images_owner_manage"
ON storage.objects
FOR ALL
USING (bucket_id = 'stories_images' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'stories_images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "storage_stories_images_admin_manage"
ON storage.objects
FOR ALL
USING (bucket_id = 'stories_images' AND public.current_user_is_admin())
WITH CHECK (bucket_id = 'stories_images' AND public.current_user_is_admin());

CREATE POLICY "storage_user_gallery_public_select"
ON storage.objects
FOR SELECT
USING (bucket_id = 'user-gallery');

CREATE POLICY "storage_user_gallery_owner_manage"
ON storage.objects
FOR ALL
USING (bucket_id = 'user-gallery' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'user-gallery' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "storage_user_gallery_admin_manage"
ON storage.objects
FOR ALL
USING (bucket_id = 'user-gallery' AND public.current_user_is_admin())
WITH CHECK (bucket_id = 'user-gallery' AND public.current_user_is_admin());
