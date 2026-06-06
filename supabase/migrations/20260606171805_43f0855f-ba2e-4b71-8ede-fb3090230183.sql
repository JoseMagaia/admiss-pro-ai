CREATE TABLE public.stage_opportunity_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage text NOT NULL UNIQUE,
  offer_id uuid,
  valuation numeric NOT NULL DEFAULT 0,
  liquidity numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stage_opportunity_settings TO authenticated;
GRANT ALL ON public.stage_opportunity_settings TO service_role;

ALTER TABLE public.stage_opportunity_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view stage settings"
  ON public.stage_opportunity_settings FOR SELECT
  TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_stage_opportunity_settings_updated_at
  BEFORE UPDATE ON public.stage_opportunity_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();