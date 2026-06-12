DROP POLICY IF EXISTS "Authenticated can view stage settings" ON public.stage_opportunity_settings;

CREATE POLICY "Members can view stage settings"
ON public.stage_opportunity_settings
FOR SELECT
TO authenticated
USING (
  public.is_space_member(space_id, auth.uid())
  OR public.is_super_admin(auth.uid())
);