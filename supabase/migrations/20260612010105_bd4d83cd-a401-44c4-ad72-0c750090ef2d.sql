-- 1) Restrict cross-tenant profile reads to super admins only.
-- Space-level "admin" role users should not be able to enumerate all
-- profiles (including emails) across tenants. User management is a
-- super-admin-only feature, so admins do not need to read other profiles.
DROP POLICY IF EXISTS "Users can view own profile, admins view all" ON public.profiles;

CREATE POLICY "Users can view own profile, super admins view all"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id
  OR private.has_role(auth.uid(), 'super_admin'::app_role)
);

-- 2) Add write protection to stage_opportunity_settings (had SELECT only).
-- Scope writes to space members or super admins, matching other tenant tables.
CREATE POLICY "Members can insert stage settings"
ON public.stage_opportunity_settings
FOR INSERT
WITH CHECK (is_space_member(space_id, auth.uid()) OR is_super_admin(auth.uid()));

CREATE POLICY "Members can update stage settings"
ON public.stage_opportunity_settings
FOR UPDATE
USING (is_space_member(space_id, auth.uid()) OR is_super_admin(auth.uid()))
WITH CHECK (is_space_member(space_id, auth.uid()) OR is_super_admin(auth.uid()));

CREATE POLICY "Members can delete stage settings"
ON public.stage_opportunity_settings
FOR DELETE
USING (is_space_member(space_id, auth.uid()) OR is_super_admin(auth.uid()));