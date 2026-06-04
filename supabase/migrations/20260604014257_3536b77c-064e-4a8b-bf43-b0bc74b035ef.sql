CREATE TABLE public.meeting_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid,
  phone_number text NOT NULL,
  lead_name text,
  meeting_date timestamptz NOT NULL DEFAULT now(),
  outcome text NOT NULL,
  commitment_level text,
  main_obstacle text,
  next_action text,
  follow_up_date date,
  internal_notes text,
  workflow_triggered text,
  recorded_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meeting_outcomes TO authenticated;
GRANT ALL ON public.meeting_outcomes TO service_role;
ALTER TABLE public.meeting_outcomes ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_meeting_outcomes_updated_at
  BEFORE UPDATE ON public.meeting_outcomes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_meeting_outcomes_meeting_date ON public.meeting_outcomes (meeting_date DESC);
CREATE INDEX idx_meeting_outcomes_phone ON public.meeting_outcomes (phone_number);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email text,
  actor_role text,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs (created_at DESC);