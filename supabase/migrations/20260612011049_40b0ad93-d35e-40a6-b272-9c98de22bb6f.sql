-- Re-scope profiles SELECT policy to authenticated users only
DROP POLICY "Users can view own profile, super admins view all" ON public.profiles;
CREATE POLICY "Users can view own profile, super admins view all"
ON public.profiles
FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR private.has_role(auth.uid(), 'super_admin'::app_role));

-- Re-scope stage_opportunity_settings write policies to authenticated users only
DROP POLICY "Members can insert stage settings" ON public.stage_opportunity_settings;
CREATE POLICY "Members can insert stage settings"
ON public.stage_opportunity_settings
FOR INSERT
TO authenticated
WITH CHECK (is_space_member(space_id, auth.uid()) OR is_super_admin(auth.uid()));

DROP POLICY "Members can update stage settings" ON public.stage_opportunity_settings;
CREATE POLICY "Members can update stage settings"
ON public.stage_opportunity_settings
FOR UPDATE
TO authenticated
USING (is_space_member(space_id, auth.uid()) OR is_super_admin(auth.uid()))
WITH CHECK (is_space_member(space_id, auth.uid()) OR is_super_admin(auth.uid()));

DROP POLICY "Members can delete stage settings" ON public.stage_opportunity_settings;
CREATE POLICY "Members can delete stage settings"
ON public.stage_opportunity_settings
FOR DELETE
TO authenticated
USING (is_space_member(space_id, auth.uid()) OR is_super_admin(auth.uid()));