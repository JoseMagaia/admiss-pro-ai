ALTER TABLE public.education_settings
  ADD COLUMN IF NOT EXISTS audio_delivery_format text NOT NULL DEFAULT 'mp3_document';