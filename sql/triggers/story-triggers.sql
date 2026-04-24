-- STORY COUNTS AUTOMATION
CREATE OR REPLACE FUNCTION public.manage_story_counts()
RETURNS trigger AS $$
BEGIN
  IF TG_TABLE_NAME = 'story_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.stories SET likes_count = likes_count + 1 WHERE id = NEW.story_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.stories SET likes_count = likes_count - 1 WHERE id = OLD.story_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'story_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.stories SET comments_count = comments_count + 1 WHERE id = NEW.story_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.stories SET comments_count = comments_count - 1 WHERE id = OLD.story_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql security definer;

CREATE TRIGGER on_story_like_change
  AFTER INSERT OR DELETE ON public.story_likes
  FOR EACH ROW EXECUTE FUNCTION public.manage_story_counts();

CREATE TRIGGER on_story_comment_change
  AFTER INSERT OR DELETE ON public.story_comments
  FOR EACH ROW EXECUTE FUNCTION public.manage_story_counts();
