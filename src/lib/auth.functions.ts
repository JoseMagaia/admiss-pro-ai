import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ALL_ROLES, type AppRole } from "@/lib/roles";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
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
  for (const r of roles ?? []) roleMap.set(r.user_id, r.role);
  const permMap = new Map<string, string[]>();
  for (const p of (perms ?? []) as { user_id: string; permission: string }[]) {
    permMap.set(p.user_id, [...(permMap.get(p.user_id) ?? []), p.permission]);
  }
  const users = (profiles ?? []).map((p) => ({
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
    const db = await admin();
    const { data: created, error } = await db.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    if (error || !created.user) return { ok: false, error: error?.message ?? "Failed to create user" };

    await db.from("profiles").upsert(
      { user_id: created.user.id, email: data.email, full_name: data.full_name } as never,
      { onConflict: "user_id" },
    );
    const { error: roleErr } = await db
      .from("user_roles")
      .upsert({ user_id: created.user.id, role: data.role } as never, { onConflict: "user_id,role" });
    if (roleErr) return { ok: false, error: roleErr.message };
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

/** Updates a user's credentials (email, password) and/or full name. Super admin only. */
export const updateUserCredentials = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        user_id: z.string().uuid(),
        email: z.string().email().max(200).optional(),
        password: z.string().min(8).max(200).optional(),
        full_name: z.string().min(1).max(200).optional(),
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
    const authUpdate: { email?: string; password?: string; user_metadata?: Record<string, unknown> } = {};
    if (data.email) authUpdate.email = data.email;
    if (data.password) authUpdate.password = data.password;
    if (data.full_name) authUpdate.user_metadata = { full_name: data.full_name };
    if (Object.keys(authUpdate).length === 0) return { ok: false, error: "Nothing to update." };

    const { error: authErr } = await db.auth.admin.updateUserById(data.user_id, authUpdate);
    if (authErr) return { ok: false, error: authErr.message };

    const profileUpdate: Record<string, string> = {};
    if (data.email) profileUpdate.email = data.email;
    if (data.full_name) profileUpdate.full_name = data.full_name;
    if (Object.keys(profileUpdate).length > 0) {
      await db.from("profiles").update(profileUpdate as never).eq("user_id", data.user_id);
    }
    return { ok: true, error: null };
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
    const db = await admin();
    const { error } = await db.auth.admin.deleteUser(data.user_id);
    return { ok: !error, error: error?.message ?? null };
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
