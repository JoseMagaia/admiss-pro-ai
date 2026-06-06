
-- ============ OFFERS (opportunity products) ============
CREATE TABLE public.offers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  products text,
  stage text NOT NULL DEFAULT 'new',
  default_valuation numeric NOT NULL DEFAULT 0,
  expected_liquidity numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offers TO authenticated;
GRANT ALL ON public.offers TO service_role;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- ============ LEAD OPPORTUNITIES (per-lead values) ============
CREATE TABLE public.lead_opportunities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL UNIQUE,
  offer_id uuid,
  valuation numeric NOT NULL DEFAULT 0,
  liquidity numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_opportunities TO authenticated;
GRANT ALL ON public.lead_opportunities TO service_role;
ALTER TABLE public.lead_opportunities ENABLE ROW LEVEL SECURITY;

-- ============ USER PERMISSIONS (granular feature access) ============
CREATE TABLE public.user_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  permission text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, permission)
);
GRANT SELECT ON public.user_permissions TO authenticated;
GRANT ALL ON public.user_permissions TO service_role;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own permissions"
  ON public.user_permissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Helper: check whether a user holds a permission (security definer).
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_permissions
    WHERE user_id = _user_id AND permission = _permission
  )
$$;

-- updated_at triggers (reuse existing set_updated_at function)
CREATE TRIGGER set_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_lead_opportunities_updated_at
  BEFORE UPDATE ON public.lead_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
