
-- Create a private schema not exposed via the Data API (PostgREST only exposes `public`).
CREATE SCHEMA IF NOT EXISTS private;

-- Recreate the SECURITY DEFINER helpers inside the private schema.
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION private.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_permissions
    WHERE user_id = _user_id AND permission = _permission
  )
$$;

-- RLS policies that reference these functions run as the querying role, so that
-- role needs USAGE on the schema + EXECUTE on the function. Granting these does
-- NOT expose the functions through the Data API (the API only serves `public`).
GRANT USAGE ON SCHEMA private TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION private.has_permission(uuid, text) TO authenticated, anon, service_role;

-- Repoint the policies that depend on public.has_role onto the private version.
DROP POLICY IF EXISTS "Users can view own profile, admins view all" ON public.profiles;
CREATE POLICY "Users can view own profile, admins view all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (auth.uid() = user_id)
  OR private.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR private.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Remove the publicly-exposed copies now that nothing depends on them.
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.has_permission(uuid, text);
