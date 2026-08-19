// Shared runtime helpers for src/lib/dashboard.functions.ts.
// Kept in a sibling module so the server-function file stays a thin wrapper
// (the server-fn splitter strips runtime siblings from *.functions.ts files).
import { ALL_ROLES, type AppRole } from "@/lib/roles";

// Resolve the caller's active Space (honors x-space-id, validates membership).
export async function spaceCtx() {
  const { resolveSpaceContext } = await import("./space-context.server");
  return resolveSpaceContext();
}

// Service-role client scoped to the caller's active Space. Tenant tables are
// auto-filtered/tagged by space_id. Suspended spaces (for non-super-admins)
// resolve to an empty sentinel space so nothing leaks.
export async function scopedDb() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { makeScopedClient, NO_SPACE } = await import("./space-context.server");
  const ctx = await spaceCtx();
  const sid = ctx && (ctx.isSuperAdmin || ctx.status === "active") ? ctx.spaceId : NO_SPACE;
  return makeScopedClient(supabaseAdmin, sid);
}

// Active space id, used to run admissions-pipeline helpers inside the space.
export async function activeSpaceId(): Promise<string | null> {
  const ctx = await spaceCtx();
  if (!ctx) return null;
  if (ctx.status === "suspended" && !ctx.isSuperAdmin) return null;
  return ctx.spaceId;
}

// Throws when the caller lacks an allowed role. Use inside write handlers.
export async function guard(allowed: AppRole[]) {
  const { assertRole } = await import("@/integrations/supabase/role-guard.server");
  return assertRole(allowed);
}

// Returns true when the caller is authenticated with any role. Use for reads.
export async function isAuthed(): Promise<boolean> {
  const { getRequestUser } = await import("@/integrations/supabase/role-guard.server");
  const u = await getRequestUser();
  return Boolean(u?.role);
}

export const ANY_ROLE = ALL_ROLES;
