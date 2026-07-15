ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS media jsonb,
  ADD COLUMN IF NOT EXISTS buttons jsonb NOT NULL DEFAULT '[]'::jsonb;