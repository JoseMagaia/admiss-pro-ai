ALTER TABLE public.chatwoot_workspaces
  ADD COLUMN IF NOT EXISTS wa_default_template text,
  ADD COLUMN IF NOT EXISTS wa_template_language text DEFAULT 'en_US';

ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS delivery_error text;