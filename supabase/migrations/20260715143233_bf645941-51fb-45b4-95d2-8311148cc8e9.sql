
ALTER TABLE public.chatwoot_workspaces
  ADD COLUMN IF NOT EXISTS wa_phone_number_id text,
  ADD COLUMN IF NOT EXISTS wa_business_account_id text,
  ADD COLUMN IF NOT EXISTS wa_access_token text,
  ADD COLUMN IF NOT EXISTS wa_verify_token text,
  ADD COLUMN IF NOT EXISTS wa_app_secret text;

ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS attachment_url text,
  ADD COLUMN IF NOT EXISTS attachment_mime text,
  ADD COLUMN IF NOT EXISTS attachment_kind text;
