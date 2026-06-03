-- ============ chatwoot_workspaces ============
CREATE TABLE public.chatwoot_workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  chatwoot_url text,
  chatwoot_account_id text,
  chatwoot_inbox_id text,
  chatwoot_api_token text,
  enabled boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  use_shared_ai boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chatwoot_workspaces TO authenticated;
GRANT ALL ON public.chatwoot_workspaces TO service_role;
ALTER TABLE public.chatwoot_workspaces ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: this table is accessed only through the trusted
-- service-role admin client, consistent with the other core data tables.
CREATE TRIGGER set_chatwoot_workspaces_updated_at
  BEFORE UPDATE ON public.chatwoot_workspaces
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ scheduled_messages ============
CREATE TABLE public.scheduled_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  chatwoot_conversation_id text,
  workspace_id uuid,
  message_content text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  sent_at timestamptz,
  error text,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_messages TO authenticated;
GRANT ALL ON public.scheduled_messages TO service_role;
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: accessed only through the trusted server.
CREATE TRIGGER set_scheduled_messages_updated_at
  BEFORE UPDATE ON public.scheduled_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_scheduled_messages_due
  ON public.scheduled_messages (status, scheduled_for);

-- ============ workspace references ============
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS workspace_id uuid;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS workspace_id uuid;

-- ============ seed default workspace from existing settings ============
INSERT INTO public.chatwoot_workspaces
  (name, chatwoot_url, chatwoot_account_id, chatwoot_inbox_id, chatwoot_api_token, is_default, use_shared_ai)
SELECT 'Default Workspace', chatwoot_url, chatwoot_account_id, chatwoot_inbox_id, chatwoot_api_token, true, true
FROM public.education_settings
LIMIT 1;

-- ============ cron job to deliver due scheduled messages ============
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'process-scheduled-messages',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--e01e4fe6-fbb9-4991-917e-e1bd97b5a9f3.lovable.app/api/public/process-scheduled-messages',
    headers := '{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6Y3lsa3VkemN2dW5hc3lpdHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0Mjg1MzUsImV4cCI6MjA5NjAwNDUzNX0.eUM8-wiVhzmFZRZN1dkHaHO94qP3Yx2WnI2CVLzeDGk"}'::jsonb,
    body := '{"source": "cron"}'::jsonb
  );
  $$
);