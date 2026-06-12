ALTER TABLE public.education_settings
  ADD COLUMN IF NOT EXISTS logo_scale integer NOT NULL DEFAULT 100;