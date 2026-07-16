
ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS wamid text,
  ADD COLUMN IF NOT EXISTS delivery_status text,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS read_at timestamptz,
  ADD COLUMN IF NOT EXISTS campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS whatsapp_messages_wamid_idx ON public.whatsapp_messages(wamid) WHERE wamid IS NOT NULL;
CREATE INDEX IF NOT EXISTS whatsapp_messages_campaign_id_idx ON public.whatsapp_messages(campaign_id) WHERE campaign_id IS NOT NULL;
