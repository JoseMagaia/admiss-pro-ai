
CREATE TABLE public.voip_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL,
  provider TEXT NOT NULL DEFAULT 'disabled',
  enabled BOOLEAN NOT NULL DEFAULT false,
  sip_ws_server TEXT,
  sip_domain TEXT,
  sip_uri TEXT,
  sip_username TEXT,
  sip_password TEXT,
  sip_display_name TEXT,
  twilio_account_sid TEXT,
  twilio_api_key_sid TEXT,
  twilio_api_key_secret TEXT,
  twilio_twiml_app_sid TEXT,
  twilio_caller_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (space_id)
);
GRANT ALL ON public.voip_settings TO service_role;
ALTER TABLE public.voip_settings ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL,
  lead_id UUID,
  phone_number TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'outbound',
  agent_user_id UUID,
  status TEXT NOT NULL DEFAULT 'completed',
  disposition TEXT,
  notes TEXT,
  provider TEXT,
  provider_call_sid TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.calls TO service_role;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_calls_space_created ON public.calls (space_id, created_at DESC);
CREATE INDEX idx_calls_space_phone ON public.calls (space_id, phone_number);

CREATE TABLE public.call_callbacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL,
  lead_id UUID,
  phone_number TEXT NOT NULL,
  agent_user_id UUID,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  notes TEXT,
  from_call_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.call_callbacks TO service_role;
ALTER TABLE public.call_callbacks ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_callbacks_space_due ON public.call_callbacks (space_id, status, scheduled_at);

CREATE TABLE public.dial_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'manual',
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.dial_campaigns TO service_role;
ALTER TABLE public.dial_campaigns ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_dial_campaigns_space ON public.dial_campaigns (space_id, created_at DESC);

CREATE TABLE public.dial_campaign_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL,
  campaign_id UUID NOT NULL,
  lead_id UUID,
  phone_number TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.dial_campaign_members TO service_role;
ALTER TABLE public.dial_campaign_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_dial_members_campaign ON public.dial_campaign_members (campaign_id, position);

CREATE TRIGGER update_voip_settings_updated_at BEFORE UPDATE ON public.voip_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calls_updated_at BEFORE UPDATE ON public.calls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_call_callbacks_updated_at BEFORE UPDATE ON public.call_callbacks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dial_campaigns_updated_at BEFORE UPDATE ON public.dial_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dial_campaign_members_updated_at BEFORE UPDATE ON public.dial_campaign_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
