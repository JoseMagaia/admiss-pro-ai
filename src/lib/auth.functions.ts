import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { ALL_ROLES, type AppRole } from "@/lib/roles";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

// Server-only local-auth helpers. Imported dynamically so the client bundle
// never pulls in node:crypto / node:fs via this (client-imported) module.
async function localDb() {
  return import("@/lib/local-db/db.server");
}

/** Returns the signed-in user's profile, role and granted permissions. */
export const getMyProfile = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequestUser } = await import("@/integrations/supabase/role-guard.server");
  const user = await getRequestUser();
  if (!user)
    return { authenticated: false, role: null, email: null, full_name: null, userId: null, permissions: [] as string[] };

  const db = await admin();
  const [{ data: profile }, { data: perms }] = await Promise.all([
    db.from("profiles").select("full_name").eq("user_id", user.userId).maybeSingle(),
    db.from("user_permissions").select("permission").eq("user_id", user.userId),
  ]);
  return {
    authenticated: true,
    role: user.role,
    email: user.email,
    full_name: profile?.full_name ?? null,
    userId: user.userId,
    permissions: ((perms ?? []) as { permission: string }[]).map((p) => p.permission),
  };
});

/** Lists all platform users with their roles and permissions. Super admin only. */
export const listUsers = createServerFn({ method: "GET" }).handler(async () => {
  const { assertRole } = await import("@/integrations/supabase/role-guard.server");
  try {
    await assertRole(["super_admin"]);
  } catch (e) {
    return { users: [], error: (e as Error).message };
  }
  const db = await admin();
  const [{ data: profiles }, { data: roles }, { data: perms }] = await Promise.all([
    db.from("profiles").select("user_id, email, full_name, created_at").order("created_at", { ascending: true }),
    db.from("user_roles").select("user_id, role"),
    db.from("user_permissions").select("user_id, permission"),
  ]);
  const roleMap = new Map<string, string>();
  for (const r of (roles ?? []) as { user_id: string; role: string }[]) roleMap.set(r.user_id, r.role);
  const permMap = new Map<string, string[]>();
  for (const p of (perms ?? []) as { user_id: string; permission: string }[]) {
    permMap.set(p.user_id, [...(permMap.get(p.user_id) ?? []), p.permission]);
  }
  const users = ((profiles ?? []) as Array<{
    user_id: string;
    email: string | null;
    full_name: string | null;
    created_at: string;
  }>).map((p) => ({
    user_id: p.user_id,
    email: p.email,
    full_name: p.full_name,
    created_at: p.created_at,
    role: roleMap.get(p.user_id) ?? null,
    permissions: permMap.get(p.user_id) ?? [],
  }));
  return { users, error: null };
});

/** Creates a new platform user with a role. Super admin only. */
export const createUser = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        email: z.string().email().max(200),
        password: z.string().min(8).max(200),
        full_name: z.string().min(1).max(200),
        role: z.enum(ALL_ROLES as [AppRole, ...AppRole[]]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { assertRole } = await import("@/integrations/supabase/role-guard.server");
    try {
      await assertRole(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const ldb = await localDb();
    const existing = await ldb.getUserByEmail(data.email);
    if (existing) return { ok: false, error: "A user with this email already exists." };
    try {
      await ldb.createLocalUser({ email: data.email, password: data.password, full_name: data.full_name, role: data.role });
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Failed to create user" };
    }
    return { ok: true, error: null };
  });

/** Changes a user's role. Super admin only. */
export const updateUserRole = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ user_id: z.string().uuid(), role: z.enum(ALL_ROLES as [AppRole, ...AppRole[]]) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { assertRole } = await import("@/integrations/supabase/role-guard.server");
    let me;
    try {
      me = await assertRole(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    if (me.userId === data.user_id && data.role !== "super_admin") {
      return { ok: false, error: "You cannot remove your own super admin role." };
    }
    const db = await admin();
    await db.from("user_roles").delete().eq("user_id", data.user_id);
    const { error } = await db.from("user_roles").insert({ user_id: data.user_id, role: data.role } as never);
    return { ok: !error, error: error?.message ?? null };
  });

/** Deletes a user entirely. Super admin only. */
export const deleteUser = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { assertRole } = await import("@/integrations/supabase/role-guard.server");
    let me;
    try {
      me = await assertRole(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    if (me.userId === data.user_id) return { ok: false, error: "You cannot delete your own account." };
    try {
      const ldb = await localDb();
      await ldb.deleteLocalUser(data.user_id);
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Failed to delete user" };
    }
    return { ok: true, error: null };
  });

/** Grants or revokes a granular feature permission for a user. Super admin only. */
export const setUserPermission = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        user_id: z.string().uuid(),
        permission: z.string().min(1).max(50).regex(/^[a-z_]+$/),
        enabled: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { assertRole } = await import("@/integrations/supabase/role-guard.server");
    try {
      await assertRole(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    if (data.enabled) {
      const { error } = await db
        .from("user_permissions")
        .upsert({ user_id: data.user_id, permission: data.permission } as never, {
          onConflict: "user_id,permission",
        });
      return { ok: !error, error: error?.message ?? null };
    }
    const { error } = await db
      .from("user_permissions")
      .delete()
      .eq("user_id", data.user_id)
      .eq("permission", data.permission);
    return { ok: !error, error: error?.message ?? null };
  });

/* --------------------------- LOCAL SESSION AUTH --------------------------- */

/** Verifies email/password and returns a session token. */
export const localLogin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ email: z.string().email().max(200), password: z.string().min(1).max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const ldb = await localDb();
    const user = await ldb.getUserByEmail(data.email);
    if (!user) return { ok: false, error: "Invalid email or password." };
    const db = await admin();
    const { data: row } = await db.from("users").select("password_hash").eq("id", user.id).maybeSingle();
    const stored = (row as { password_hash?: string } | null)?.password_hash ?? "";
    if (!ldb.verifyPassword(data.password, stored)) return { ok: false, error: "Invalid email or password." };
    const token = await ldb.createSession(user.id);
    return { ok: true, token, user: { id: user.id, email: user.email, user_metadata: { full_name: user.full_name } } };
  });

/** Revokes the current session token. */
export const localLogout = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ token: z.string().optional() }).parse(d))
  .handler(async ({ data }) => {
    let token = data.token ?? null;
    if (!token) {
      const request = getRequest();
      const authHeader = request?.headers?.get("authorization");
      if (authHeader?.startsWith("Bearer ")) token = authHeader.slice("Bearer ".length).trim();
    }
    if (token) {
      const ldb = await localDb();
      await ldb.deleteSessionByToken(token);
    }
    return { ok: true };
  });

/** Self-service sign-up. The first account (or any sign-up while no super
 *  admin exists) becomes super_admin so the platform can be bootstrapped. */
export const signUpLocal = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        email: z.string().email().max(200),
        password: z.string().min(8).max(200),
        full_name: z.string().min(1).max(200),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const ldb = await localDb();
    const existing = await ldb.getUserByEmail(data.email);
    if (existing) return { ok: false, error: "An account with this email already exists. Try signing in." };
    const makeSuper = !(await ldb.hasSuperAdmin());
    const role: AppRole = makeSuper ? "super_admin" : "agent";
    try {
      const user = await ldb.createLocalUser({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role,
      });
      const token = await ldb.createSession(user.id);
      return {
        ok: true,
        token,
        role,
        user: { id: user.id, email: user.email, user_metadata: { full_name: user.full_name } },
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Failed to create account" };
    }
  });

/** Returns the current session user (used by the client shim's getUser). */
export const whoAmI = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequestUser } = await import("@/integrations/supabase/role-guard.server");
  const user = await getRequestUser();
  if (!user) return { user: null };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.userId)
    .maybeSingle();
  return {
    user: {
      id: user.userId,
      email: user.email,
      user_metadata: { full_name: profile?.full_name ?? null },
    },
  };
});
