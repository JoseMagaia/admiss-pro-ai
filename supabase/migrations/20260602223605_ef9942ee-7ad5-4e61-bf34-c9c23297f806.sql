-- Updated-at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- whatsapp_messages
CREATE TABLE public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  message_content text NOT NULL DEFAULT '',
  sender text NOT NULL DEFAULT 'lead',
  message_type text NOT NULL DEFAULT 'text',
  ai_response text,
  processed boolean NOT NULL DEFAULT false,
  received_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.whatsapp_messages TO service_role;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- leads
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  chatwoot_contact_id text,
  chatwoot_conversation_id text,
  lead_name text,
  student_or_parent text,
  course_interest text,
  country_interest text,
  passport_status text,
  academic_status text,
  parent_phone text,
  financial_alignment text,
  parent_confirmation text,
  document_received boolean NOT NULL DEFAULT false,
  qualification_status text NOT NULL DEFAULT 'NEW_LEAD',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX leads_phone_number_idx ON public.leads (phone_number);
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER leads_set_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- conversations
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatwoot_conversation_id text,
  phone_number text NOT NULL,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'open',
  assigned_agent text,
  human_takeover boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER conversations_set_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- appointments
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text,
  lead_name text,
  appointment_date timestamptz,
  appointment_type text NOT NULL DEFAULT 'booking',
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER appointments_set_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- education_settings (single row)
CREATE TABLE public.education_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT 'Linkmoore Education',
  company_phone text,
  company_email text,
  office_address text,
  working_hours text,
  active_destinations text,
  active_programs text,
  scholarship_information text,
  whatsapp_webhook_url text,
  chatwoot_url text,
  chatwoot_account_id text,
  chatwoot_inbox_id text,
  chatwoot_api_token text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.education_settings TO service_role;
ALTER TABLE public.education_settings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER education_settings_set_updated_at BEFORE UPDATE ON public.education_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ai_configuration (single row)
CREATE TABLE public.ai_configuration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system_prompt text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT 'google/gemini-3-flash-preview',
  temperature numeric NOT NULL DEFAULT 0.7,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_configuration TO service_role;
ALTER TABLE public.ai_configuration ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER ai_configuration_set_updated_at BEFORE UPDATE ON public.ai_configuration
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- prompt_versions
CREATE TABLE public.prompt_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number integer NOT NULL DEFAULT 1,
  system_prompt text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text
);
GRANT ALL ON public.prompt_versions TO service_role;
ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;

-- ai_variables
CREATE TABLE public.ai_variables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variable_name text NOT NULL,
  variable_value text NOT NULL DEFAULT '',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ai_variables_name_idx ON public.ai_variables (variable_name);
GRANT ALL ON public.ai_variables TO service_role;
ALTER TABLE public.ai_variables ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER ai_variables_set_updated_at BEFORE UPDATE ON public.ai_variables
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- http_actions
CREATE TABLE public.http_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trigger_stage text NOT NULL,
  url text NOT NULL,
  method text NOT NULL DEFAULT 'POST',
  headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  payload_template text NOT NULL DEFAULT '{}',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.http_actions TO service_role;
ALTER TABLE public.http_actions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER http_actions_set_updated_at BEFORE UPDATE ON public.http_actions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed default singleton rows
INSERT INTO public.education_settings (company_name, company_email, working_hours, active_destinations, active_programs)
VALUES ('Linkmoore Education', 'admissions@linkmoore.edu', 'Mon-Fri 9:00-18:00', 'United Kingdom, Canada, Australia, Ireland', 'Undergraduate, Postgraduate, Foundation, MBA');

INSERT INTO public.ai_configuration (system_prompt, model, temperature)
VALUES (
'You are the Linkmoore Education AI Admissions Assistant. Your job is to qualify incoming student leads on WhatsApp, collect admission requirements, confirm financial alignment, gather parent/guardian contact details, and prepare qualified leads for the admissions team.

Move the lead through these stages in order: NEW_LEAD -> NAME_CAPTURED -> STRUCTURAL_CONFIRMATION -> COURSE_IDENTIFIED -> DESTINATION_IDENTIFIED -> ACADEMIC_PROFILE_VERIFIED -> DOCUMENT_REQUESTED -> FINANCIAL_ALIGNMENT -> PARENT_CONTACT_RECEIVED -> QUALIFIED -> BOOKING_REQUEST_CREATED.

Be warm, professional, concise, and reply in the language the student uses (Portuguese or English). Ask one question at a time. You do NOT close sales, accept payments, or run specialist consultations. Stop once a qualified lead has a booking request created.',
'google/gemini-3-flash-preview', 0.7);

INSERT INTO public.ai_variables (variable_name, variable_value, description) VALUES
('COMPANY_NAME', 'Linkmoore Education', 'Company name used in messages'),
('SERVICE_FEE', '$1,200', 'One-time service fee'),
('ACTIVATION_FEE', '$300', 'Activation fee to start onboarding'),
('MONTHLY_COST', '$150', 'Monthly cost during onboarding'),
('TUITION_RANGE', '$10,000 - $25,000 / year', 'Typical tuition range'),
('DESTINATION_PRIMARY', 'United Kingdom', 'Primary study destination');