CREATE TYPE admin_analytics_type AS ENUM ('daily', 'weekly', 'triday');

CREATE TABLE public.admin_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  type admin_analytics_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT admin_analytics_data_is_object
    CHECK (jsonb_typeof(data) = 'object')
);

CREATE INDEX idx_admin_analytics_type_created_at
  ON public.admin_analytics(type, created_at DESC);

CREATE INDEX idx_admin_analytics_created_at
  ON public.admin_analytics(created_at DESC);
