-- GUIDE APPLICATION HANDLER
CREATE OR REPLACE FUNCTION public.handle_guide_application_update()
RETURNS trigger AS $$
DECLARE
  v_application_id uuid;
BEGIN
  v_application_id := COALESCE(NEW.application_id, OLD.application_id);

  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    UPDATE public.profiles
    SET is_guide_applicantion_pending = true
    WHERE id = NEW.user_id;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'pending' THEN
      UPDATE public.profiles
      SET is_guide_applicantion_pending = true
      WHERE id = NEW.user_id;
    ELSIF NEW.status = 'approved' THEN
      UPDATE public.profiles
      SET is_guide = true,
          is_guide_applicantion_pending = false
      WHERE id = NEW.user_id;

      INSERT INTO public.guides (id, description, previous_experience, known_languages, admin_feedback, is_available, is_suspended)
      VALUES (
        NEW.user_id,
        NEW.description,
        NEW.previous_experience,
        COALESCE(NEW.known_languages, '[]'::jsonb),
        NEW.admin_feedback,
        true,
        false
      )
      ON CONFLICT (id)
      DO UPDATE SET
        description = EXCLUDED.description,
        previous_experience = EXCLUDED.previous_experience,
        known_languages = EXCLUDED.known_languages,
        admin_feedback = EXCLUDED.admin_feedback;

      INSERT INTO public.guide_service_areas (guide_id, location, radius_meters, location_name)
      SELECT NEW.user_id, gsa.location, gsa.radius_meters, gsa.location_name
      FROM public.guide_service_areas_applications gsa
      WHERE gsa.application_id = v_application_id;
    ELSIF NEW.status = 'rejected' THEN
      UPDATE public.profiles
      SET is_guide_applicantion_pending = false
      WHERE id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_guide_application_created ON public.guide_applications;
CREATE TRIGGER on_guide_application_created
  AFTER INSERT ON public.guide_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_guide_application_update();

DROP TRIGGER IF EXISTS on_guide_application_status_change ON public.guide_applications;
CREATE TRIGGER on_guide_application_status_change
  AFTER UPDATE OF status ON public.guide_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_guide_application_update();

-- GUIDE RATING AUTOMATION
CREATE OR REPLACE FUNCTION public.update_guide_rating()
RETURNS trigger AS $$
DECLARE
  v_guide_id uuid;
BEGIN
  v_guide_id := COALESCE(NEW.guide_id, OLD.guide_id);

  UPDATE public.guides
  SET avg_rating = COALESCE((
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM public.guide_reviews
    WHERE guide_id = v_guide_id
  ), 0)
  WHERE id = v_guide_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_guide_review_change ON public.guide_reviews;
CREATE TRIGGER on_guide_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.guide_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_guide_rating();
