-- =========================================================================
-- Defense-in-depth RLS hardening.
-- All app data access happens through the service-role client (bypasses RLS).
-- These policies enforce tenant isolation and privilege protection at the DB
-- layer as a safety net, without changing existing app behavior.
-- =========================================================================

-- ---- Privilege tables: super-admin-only writes ----

-- user_roles
DROP POLICY IF EXISTS "Super admins manage roles" ON public.user_roles;
CREATE POLICY "Super admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- user_permissions
DROP POLICY IF EXISTS "Super admins manage permissions" ON public.user_permissions;
CREATE POLICY "Super admins manage permissions" ON public.user_permissions
  FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- space_members: super-admin-only writes (SELECT policy already exists)
DROP POLICY IF EXISTS "Super admins manage memberships" ON public.space_members;
CREATE POLICY "Super admins manage memberships" ON public.space_members
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "Super admins update memberships" ON public.space_members;
CREATE POLICY "Super admins update memberships" ON public.space_members
  FOR UPDATE TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "Super admins delete memberships" ON public.space_members;
CREATE POLICY "Super admins delete memberships" ON public.space_members
  FOR DELETE TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- ---- Tenant tables with space_id: space-scoped CRUD ----
DO $$
DECLARE
  t text;
  tenant_tables text[] := ARRAY[
    'ai_variables','appointments','audit_logs','campaign_recipients','campaigns',
    'conversations','http_actions','lead_opportunities','leads','meeting_outcomes',
    'offers','pipeline_stages','pipelines','prompt_versions','scheduled_messages',
    'whatsapp_messages','workflow_enrollments','workflows'
  ];
BEGIN
  FOREACH t IN ARRAY tenant_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Space members access ' || t, t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_space_member(space_id, auth.uid()) OR public.is_super_admin(auth.uid())) WITH CHECK (public.is_space_member(space_id, auth.uid()) OR public.is_super_admin(auth.uid()))',
      'Space members access ' || t, t
    );
  END LOOP;
END $$;

-- ---- report_conversations: owner-scoped (per-user AI report chats) ----
DROP POLICY IF EXISTS "Owners access report conversations" ON public.report_conversations;
CREATE POLICY "Owners access report conversations" ON public.report_conversations
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_super_admin(auth.uid()));

-- ---- responder_agent_variables: scoped via parent agent's space ----
DROP POLICY IF EXISTS "Space members access responder_agent_variables" ON public.responder_agent_variables;
CREATE POLICY "Space members access responder_agent_variables" ON public.responder_agent_variables
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.responder_agents ra
      WHERE ra.id = responder_agent_variables.agent_id
        AND (public.is_space_member(ra.space_id, auth.uid()) OR public.is_super_admin(auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.responder_agents ra
      WHERE ra.id = responder_agent_variables.agent_id
        AND (public.is_space_member(ra.space_id, auth.uid()) OR public.is_super_admin(auth.uid()))
    )
  );
