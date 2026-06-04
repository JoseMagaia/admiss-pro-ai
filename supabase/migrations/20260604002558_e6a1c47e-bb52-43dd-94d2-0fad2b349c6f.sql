-- ===================== RESPONDER AGENTS =====================
CREATE TABLE public.responder_agents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  workspace_id uuid,
  system_prompt text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT 'google/gemini-3-flash-preview',
  temperature numeric NOT NULL DEFAULT 0.7,
  provider_mode text NOT NULL DEFAULT 'inherit',
  custom_provider text,
  custom_base_url text,
  custom_model text,
  custom_api_key text,
  inherit_variables boolean NOT NULL DEFAULT true,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.responder_agents TO service_role;
ALTER TABLE public.responder_agents ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.responder_agent_variables (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL REFERENCES public.responder_agents(id) ON DELETE CASCADE,
  variable_name text NOT NULL,
  variable_value text NOT NULL DEFAULT '',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agent_id, variable_name)
);
GRANT ALL ON public.responder_agent_variables TO service_role;
ALTER TABLE public.responder_agent_variables ENABLE ROW LEVEL SECURITY;

-- ===================== WORKFLOWS =====================
CREATE TABLE public.workflows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  workspace_id uuid,
  agent_id uuid REFERENCES public.responder_agents(id) ON DELETE SET NULL,
  trigger_segment text NOT NULL DEFAULT 'manual',
  enabled boolean NOT NULL DEFAULT false,
  graph jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.workflows TO service_role;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.workflow_enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id uuid NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  lead_id uuid,
  phone_number text NOT NULL,
  current_step integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  reacted boolean NOT NULL DEFAULT false,
  next_run_at timestamptz,
  last_step_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workflow_id, phone_number)
);
GRANT ALL ON public.workflow_enrollments TO service_role;
ALTER TABLE public.workflow_enrollments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_workflow_enrollments_phone ON public.workflow_enrollments (phone_number);
CREATE INDEX idx_workflow_enrollments_due ON public.workflow_enrollments (status, next_run_at);

-- ===================== updated_at triggers =====================
CREATE TRIGGER trg_responder_agents_updated BEFORE UPDATE ON public.responder_agents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_responder_agent_variables_updated BEFORE UPDATE ON public.responder_agent_variables
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_workflows_updated BEFORE UPDATE ON public.workflows
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_workflow_enrollments_updated BEFORE UPDATE ON public.workflow_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===================== background job =====================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-workflows') THEN
    PERFORM cron.unschedule('process-workflows');
  END IF;
END $$;

SELECT cron.schedule(
  'process-workflows',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--e01e4fe6-fbb9-4991-917e-e1bd97b5a9f3.lovable.app/api/public/process-workflows',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6Y3lsa3VkemN2dW5hc3lpdHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0Mjg1MzUsImV4cCI6MjA5NjAwNDUzNX0.eUM8-wiVhzmFZRZN1dkHaHO94qP3Yx2WnI2CVLzeDGk"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);