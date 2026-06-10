ALTER TABLE public.chatwoot_workspaces
  ADD COLUMN IF NOT EXISTS provider_type text NOT NULL DEFAULT 'chatwoot',
  ADD COLUMN IF NOT EXISTS evolution_url text,
  ADD COLUMN IF NOT EXISTS evolution_api_key text,
  ADD COLUMN IF NOT EXISTS evolution_instance text;