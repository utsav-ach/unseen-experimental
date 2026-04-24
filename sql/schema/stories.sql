-- Stories: User-generated content
CREATE TABLE public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  feature_image text NOT NULL,
  description GFM NOT NULL,
  categories text,
  tags text[] DEFAULT '{}',
  likes_count integer DEFAULT 0 NOT NULL,
  comments_count integer DEFAULT 0 NOT NULL,
  is_archived boolean DEFAULT false NOT NULL,
  related_location geography(POINT, 4326),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Story Likes
CREATE TABLE public.story_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(story_id, user_id)
);

-- Story Comments
CREATE TABLE public.story_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES public.stories(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);



CREATE TABLE public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  media_urls text[] NOT NULL DEFAULT '{}',
  description text,
  location geography(POINT, 4326),
  location_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT photos_have_media CHECK (array_length(media_urls, 1) >= 1)
);

CREATE INDEX idx_photos_uploader_id ON public.photos(uploader_id);
CREATE INDEX idx_photos_created_at ON public.photos(created_at DESC);
CREATE INDEX idx_photos_location ON public.photos USING GIST (location);


-- Indexes
CREATE INDEX idx_stories_uploader_id ON public.stories(uploader_id);
CREATE INDEX idx_stories_is_archived ON public.stories(is_archived);
CREATE INDEX idx_stories_related_location ON public.stories USING GIST (related_location);
CREATE INDEX idx_story_likes_story_id ON public.story_likes(story_id);
CREATE INDEX idx_story_comments_story_id ON public.story_comments(story_id);
