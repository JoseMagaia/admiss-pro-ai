-- Drip campaign advanced scheduling + message rotation
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS message_variations text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS batch_break_seconds integer NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS send_days integer[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}'::integer[],
  ADD COLUMN IF NOT EXISTS send_window_start text,
  ADD COLUMN IF NOT EXISTS send_window_end text,
  ADD COLUMN IF NOT EXISTS send_timezone text NOT NULL DEFAULT 'UTC';

-- White-label branding (per-space, stored in education_settings)
ALTER TABLE public.education_settings
  ADD COLUMN IF NOT EXISTS logo_light_url text,
  ADD COLUMN IF NOT EXISTS logo_dark_url text,
  ADD COLUMN IF NOT EXISTS brand_name text,
  ADD COLUMN IF NOT EXISTS brand_tagline text;