DROP POLICY IF EXISTS "Authenticated can view profiles" ON public.profiles;

CREATE POLICY "Users can view own profile, admins view all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'admin')
);