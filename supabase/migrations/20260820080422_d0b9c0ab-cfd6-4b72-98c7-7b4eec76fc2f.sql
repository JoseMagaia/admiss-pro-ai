CREATE TABLE IF NOT EXISTS public.report_ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  mode text NOT NULL DEFAULT 'built_in',
  provider text,
  base_url text,
  model text,
  api_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Credential-bearing table: server-side (service role) access only.
REVOKE ALL ON public.report_ai_settings FROM anon, authenticated;
GRANT ALL ON public.report_ai_settings TO service_role;
ALTER TABLE public.report_ai_settings ENABLE ROW LEVEL SECURITY;