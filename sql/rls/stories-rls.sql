ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stories_public_select"
ON public.stories
FOR SELECT
USING (is_archived = false OR auth.uid() = uploader_id OR public.current_user_is_admin());

CREATE POLICY "stories_owner_manage"
ON public.stories
FOR ALL
USING (auth.uid() = uploader_id)
WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "stories_admin_all"
ON public.stories
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "story_likes_public_select"
ON public.story_likes
FOR SELECT
USING (true);

CREATE POLICY "story_likes_owner_manage"
ON public.story_likes
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "story_likes_admin_all"
ON public.story_likes
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "story_comments_public_select"
ON public.story_comments
FOR SELECT
USING (true);

CREATE POLICY "story_comments_owner_manage"
ON public.story_comments
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "story_comments_admin_all"
ON public.story_comments
FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());
