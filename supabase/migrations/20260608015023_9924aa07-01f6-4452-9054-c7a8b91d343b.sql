CREATE TABLE public.ai_provider_pool (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  priority integer NOT NULL DEFAULT 0,
  label text NOT NULL DEFAULT '',
  provider text NOT NULL DEFAULT 'openai',
  base_url text,
  models text[] NOT NULL DEFAULT '{}',
  api_key text,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_provider_pool TO authenticated;
GRANT ALL ON public.ai_provider_pool TO service_role;

ALTER TABLE public.ai_provider_pool ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_ai_provider_pool_updated_at
  BEFORE UPDATE ON public.ai_provider_pool
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.ai_configuration
  ADD COLUMN IF NOT EXISTS fallback_enabled boolean NOT NULL DEFAULT false;