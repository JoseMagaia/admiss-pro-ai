-- Drip Campaigns: bulk outbound messaging with controlled drip scheduling.

-- 1. Campaigns
CREATE TABLE public.campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id uuid NOT NULL,
  name text NOT NULL,
  channel text NOT NULL DEFAULT 'whatsapp',
  workspace_id uuid,
  message_template text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  batch_size integer NOT NULL DEFAULT 25,
  delay_seconds integer NOT NULL DEFAULT 2,
  send_rate_per_min integer NOT NULL DEFAULT 60,
  start_at timestamp with time zone,
  end_at timestamp with time zone,
  last_batch_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_campaigns_space ON public.campaigns(space_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);

-- 2. Campaign recipients
CREATE TABLE public.campaign_recipients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id uuid NOT NULL,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  lead_id uuid,
  phone_number text NOT NULL,
  name text,
  merge_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  sent_at timestamp with time zone,
  delivered_at timestamp with time zone,
  opened_at timestamp with time zone,
  replied_at timestamp with time zone,
  error text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, phone_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_recipients TO authenticated;
GRANT ALL ON public.campaign_recipients TO service_role;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_campaign_recipients_updated_at
  BEFORE UPDATE ON public.campaign_recipients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_campaign_recipients_campaign ON public.campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_campaign_status ON public.campaign_recipients(campaign_id, status);
CREATE INDEX idx_campaign_recipients_space_phone ON public.campaign_recipients(space_id, phone_number);