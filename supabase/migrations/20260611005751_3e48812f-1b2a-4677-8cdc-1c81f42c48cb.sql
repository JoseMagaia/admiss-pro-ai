-- Lock down SECURITY DEFINER / trigger functions from public (anon) execution.

-- Trigger functions: only invoked by triggers (table owner), never called directly.
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- RLS helper functions: must stay executable by signed-in users (used in policies),
-- but must NOT be callable by anonymous visitors.
REVOKE ALL ON FUNCTION public.is_space_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.space_is_active(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_space_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.space_is_active(uuid) TO authenticated;