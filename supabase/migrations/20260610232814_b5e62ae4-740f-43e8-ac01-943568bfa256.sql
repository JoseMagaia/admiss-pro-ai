DO $$ BEGIN
  CREATE TYPE public.space_status AS ENUM ('active', 'suspended');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user AND role = 'super_admin'::public.app_role)
$$;

CREATE TABLE IF NOT EXISTS public.spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  status public.space_status NOT NULL DEFAULT 'active',
  plan text NOT NULL DEFAULT 'standard',
  feature_flags jsonb NOT NULL DEFAULT '{"orchestration":true,"advanced":true,"agentic":true,"http_actions":true,"workflows":true,"evolution":true}'::jsonb,
  limits jsonb NOT NULL DEFAULT '{"max_users":100,"max_leads":100000,"max_workflows":200,"max_inboxes":50}'::jsonb,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.spaces TO authenticated;
GRANT ALL ON public.spaces TO service_role;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE TRIGGER spaces_set_updated_at BEFORE UPDATE ON public.spaces
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.space_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'agent',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (space_id, user_id)
);
GRANT SELECT ON public.space_members TO authenticated;
GRANT ALL ON public.space_members TO service_role;
ALTER TABLE public.space_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_space_members_user ON public.space_members (user_id);

CREATE OR REPLACE FUNCTION public.is_space_member(_space uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.space_members WHERE space_id = _space AND user_id = _user)
$$;

CREATE OR REPLACE FUNCTION public.space_is_active(_space uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.spaces WHERE id = _space AND status = 'active')
$$;

DROP POLICY IF EXISTS "Members can view their spaces" ON public.spaces;
CREATE POLICY "Members can view their spaces"
  ON public.spaces FOR SELECT TO authenticated
  USING (public.is_space_member(id, auth.uid()) OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Members can view their memberships" ON public.space_members;
CREATE POLICY "Members can view their memberships"
  ON public.space_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()));

ALTER TABLE public.leads                       ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.conversations               ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.whatsapp_messages           ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.appointments                ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.education_settings          ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.ai_configuration            ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.ai_variables                ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.prompt_versions             ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.http_actions                ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.chatwoot_workspaces         ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.scheduled_messages          ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.responder_agents            ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.workflows                   ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.workflow_enrollments        ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.lead_opportunities          ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.meeting_outcomes            ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.offers                      ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.stage_opportunity_settings  ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.report_conversations        ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.ai_provider_pool            ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;
ALTER TABLE public.audit_logs                  ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE;

INSERT INTO public.spaces (name, slug, status, plan, is_default, feature_flags, limits)
SELECT 'Default Space', 'default', 'active', 'enterprise', true,
  '{"orchestration":true,"advanced":true,"agentic":true,"http_actions":true,"workflows":true,"evolution":true}'::jsonb,
  '{"max_users":100000,"max_leads":100000000,"max_workflows":100000,"max_inboxes":100000}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.spaces WHERE is_default = true);

DO $$
DECLARE
  def uuid;
  t text;
  tbls text[] := ARRAY[
    'leads','conversations','whatsapp_messages','appointments','education_settings',
    'ai_configuration','ai_variables','prompt_versions','http_actions','chatwoot_workspaces',
    'scheduled_messages','responder_agents','workflows','workflow_enrollments','lead_opportunities',
    'meeting_outcomes','offers','stage_opportunity_settings','report_conversations','ai_provider_pool','audit_logs'
  ];
BEGIN
  SELECT id INTO def FROM public.spaces WHERE is_default = true LIMIT 1;
  FOREACH t IN ARRAY tbls LOOP
    EXECUTE format('UPDATE public.%I SET space_id = $1 WHERE space_id IS NULL', t) USING def;
  END LOOP;

  INSERT INTO public.space_members (space_id, user_id, role)
  SELECT def, ur.user_id, ur.role
  FROM public.user_roles ur
  WHERE ur.role IN ('admin','agent')
  ON CONFLICT (space_id, user_id) DO NOTHING;
END $$;

DROP INDEX IF EXISTS public.leads_phone_number_idx;
CREATE UNIQUE INDEX IF NOT EXISTS leads_space_phone_idx ON public.leads (space_id, phone_number);

DROP INDEX IF EXISTS public.ai_variables_name_idx;
CREATE UNIQUE INDEX IF NOT EXISTS ai_variables_space_name_idx ON public.ai_variables (space_id, variable_name);

ALTER TABLE public.stage_opportunity_settings DROP CONSTRAINT IF EXISTS stage_opportunity_settings_stage_key;
CREATE UNIQUE INDEX IF NOT EXISTS stage_opportunity_settings_space_stage_idx ON public.stage_opportunity_settings (space_id, stage);

CREATE INDEX IF NOT EXISTS idx_leads_space ON public.leads (space_id);
CREATE INDEX IF NOT EXISTS idx_conversations_space ON public.conversations (space_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_space ON public.whatsapp_messages (space_id);
CREATE INDEX IF NOT EXISTS idx_workflows_space ON public.workflows (space_id);
CREATE INDEX IF NOT EXISTS idx_workflow_enrollments_space ON public.workflow_enrollments (space_id);