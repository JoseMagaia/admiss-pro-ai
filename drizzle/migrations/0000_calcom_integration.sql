ALTER TABLE public.education_settings
  ADD COLUMN IF NOT EXISTS calcom_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS calcom_api_key text,
  ADD COLUMN IF NOT EXISTS calcom_event_type_id text,
  ADD COLUMN IF NOT EXISTS calcom_timezone text DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS calcom_notify_queue_id uuid;

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS external_provider text,
  ADD COLUMN IF NOT EXISTS external_booking_uid text,
  ADD COLUMN IF NOT EXISTS meeting_url text;