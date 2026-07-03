
-- =====================================================================
-- Finding 1 (SUPA_authenticated_security_definer_function_executable):
-- Move SECURITY DEFINER RLS-helper functions out of the exposed `public`
-- schema into the non-exposed `private` schema (same pattern already used
-- by private.has_role). PostgREST does not expose `private`, so signed-in
-- users can no longer invoke them via /rest/v1/rpc, while RLS policies keep
-- working (authenticated retains USAGE on schema + EXECUTE on functions).
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_super_admin(_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user AND role = 'super_admin'::public.app_role)
$$;

CREATE OR REPLACE FUNCTION private.is_space_member(_space uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.space_members WHERE space_id = _space AND user_id = _user)
$$;

CREATE OR REPLACE FUNCTION private.space_is_active(_space uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.spaces WHERE id = _space AND status = 'active')
$$;

REVOKE EXECUTE ON FUNCTION private.is_super_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.is_space_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.space_is_active(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_super_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_space_member(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.space_is_active(uuid) TO authenticated, service_role;

-- Recreate the 18 identical space-scoped policies to reference private.*
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'ai_variables','appointments','audit_logs','campaign_recipients','campaigns',
    'conversations','http_actions','lead_opportunities','leads','meeting_outcomes',
    'offers','pipeline_stages','pipelines','prompt_versions','scheduled_messages',
    'whatsapp_messages','workflow_enrollments','workflows'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Space members access '||t, t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated '
      || 'USING (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid())) '
      || 'WITH CHECK (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()))',
      'Space members access '||t, t);
  END LOOP;
END $$;

-- report_conversations (owner or super admin)
DROP POLICY IF EXISTS "Owners access report conversations" ON public.report_conversations;
CREATE POLICY "Owners access report conversations" ON public.report_conversations
  FOR ALL TO authenticated
  USING ((user_id = auth.uid()) OR private.is_super_admin(auth.uid()))
  WITH CHECK ((user_id = auth.uid()) OR private.is_super_admin(auth.uid()));

-- responder_agent_variables (via parent responder_agents space)
DROP POLICY IF EXISTS "Space members access responder_agent_variables" ON public.responder_agent_variables;
CREATE POLICY "Space members access responder_agent_variables" ON public.responder_agent_variables
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.responder_agents ra WHERE ra.id = responder_agent_variables.agent_id AND (private.is_space_member(ra.space_id, auth.uid()) OR private.is_super_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.responder_agents ra WHERE ra.id = responder_agent_variables.agent_id AND (private.is_space_member(ra.space_id, auth.uid()) OR private.is_super_admin(auth.uid()))));

-- space_members
DROP POLICY IF EXISTS "Members can view their memberships" ON public.space_members;
CREATE POLICY "Members can view their memberships" ON public.space_members
  FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR private.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins delete memberships" ON public.space_members;
CREATE POLICY "Super admins delete memberships" ON public.space_members
  FOR DELETE TO authenticated
  USING (private.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins manage memberships" ON public.space_members;
CREATE POLICY "Super admins manage memberships" ON public.space_members
  FOR INSERT TO authenticated
  WITH CHECK (private.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins update memberships" ON public.space_members;
CREATE POLICY "Super admins update memberships" ON public.space_members
  FOR UPDATE TO authenticated
  USING (private.is_super_admin(auth.uid()))
  WITH CHECK (private.is_super_admin(auth.uid()));

-- spaces
DROP POLICY IF EXISTS "Members can view their spaces" ON public.spaces;
CREATE POLICY "Members can view their spaces" ON public.spaces
  FOR SELECT TO authenticated
  USING (private.is_space_member(id, auth.uid()) OR private.is_super_admin(auth.uid()));

-- stage_opportunity_settings
DROP POLICY IF EXISTS "Members can delete stage settings" ON public.stage_opportunity_settings;
CREATE POLICY "Members can delete stage settings" ON public.stage_opportunity_settings
  FOR DELETE TO authenticated
  USING (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Members can insert stage settings" ON public.stage_opportunity_settings;
CREATE POLICY "Members can insert stage settings" ON public.stage_opportunity_settings
  FOR INSERT TO authenticated
  WITH CHECK (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Members can update stage settings" ON public.stage_opportunity_settings;
CREATE POLICY "Members can update stage settings" ON public.stage_opportunity_settings
  FOR UPDATE TO authenticated
  USING (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()))
  WITH CHECK (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Members can view stage settings" ON public.stage_opportunity_settings;
CREATE POLICY "Members can view stage settings" ON public.stage_opportunity_settings
  FOR SELECT TO authenticated
  USING (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));

-- user_permissions
DROP POLICY IF EXISTS "Super admins manage permissions" ON public.user_permissions;
CREATE POLICY "Super admins manage permissions" ON public.user_permissions
  FOR ALL TO authenticated
  USING (private.is_super_admin(auth.uid()))
  WITH CHECK (private.is_super_admin(auth.uid()));

-- user_roles
DROP POLICY IF EXISTS "Super admins manage roles" ON public.user_roles;
CREATE POLICY "Super admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (private.is_super_admin(auth.uid()))
  WITH CHECK (private.is_super_admin(auth.uid()));

-- Now that no policy references them, drop the public copies.
DROP FUNCTION IF EXISTS public.is_space_member(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_super_admin(uuid);
DROP FUNCTION IF EXISTS public.space_is_active(uuid);

-- =====================================================================
-- Finding 2 (SUPA_extension_in_public): relocate pg_net out of `public`.
-- pg_net is not relocatable via ALTER EXTENSION SET SCHEMA, so drop and
-- recreate it in the `extensions` schema. Its callable functions live in
-- the dedicated `net` schema regardless, so cron jobs calling net.http_post
-- continue to work unchanged.
-- =====================================================================
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- =====================================================================
-- Finding 3 (ai_configuration_custom_api_key_exposure): make the
-- default-deny posture explicit at the grant layer. These credential /
-- config tables are only ever accessed by trusted server code via the
-- service role, so remove all Data API reach for anon/authenticated. This
-- guarantees that even if an RLS SELECT policy were later added by mistake,
-- these roles still cannot reach the tables over the API.
-- =====================================================================
REVOKE ALL ON public.ai_configuration    FROM anon, authenticated;
REVOKE ALL ON public.ai_provider_pool    FROM anon, authenticated;
REVOKE ALL ON public.responder_agents    FROM anon, authenticated;
REVOKE ALL ON public.chatwoot_workspaces FROM anon, authenticated;
REVOKE ALL ON public.education_settings  FROM anon, authenticated;

GRANT ALL ON public.ai_configuration    TO service_role;
GRANT ALL ON public.ai_provider_pool    TO service_role;
GRANT ALL ON public.responder_agents    TO service_role;
GRANT ALL ON public.chatwoot_workspaces TO service_role;
GRANT ALL ON public.education_settings  TO service_role;
