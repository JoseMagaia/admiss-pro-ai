import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ALL_ROLES, type AppRole } from "@/lib/roles";

export type SpaceLite = { id: string; name: string; status: string; is_default: boolean };
export type SpaceRow = {
  id: string;
  name: string;
  slug: string | null;
  status: string;
  plan: string;
  feature_flags: Record<string, boolean>;
  limits: Record<string, number>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  member_count: number;
};

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function guardSuper() {
  const { assertRole } = await import("@/integrations/supabase/role-guard.server");
  return assertRole(["super_admin"]);
}

const DEFAULT_FLAGS = {
  orchestration: true,
  workflows: true,
  advanced: true,
  agentic: true,
  http_actions: true,
  evolution: true,
};

const DEFAULT_LIMITS = {
  max_users: 25,
  max_leads: 10000,
  max_workflows: 50,
  max_inboxes: 10,
};

const flagsSchema = z.record(z.string(), z.boolean());
const limitsSchema = z.record(z.string(), z.number().int().min(0).max(100_000_000));

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "space";
}

/* ----------------------- Active space context ----------------------- */

export type ActiveSpaceContext = {
  spaceId: string | null;
  name: string;
  plan: string;
  status: string;
  isSuperAdmin: boolean;
  flags: Record<string, boolean>;
  limits: Record<string, number>;
};

// The caller's resolved active Space, with its feature flags and limits. Used
// by the dashboard to gate features and show a suspended notice.
export const getActiveSpaceContext = createServerFn({ method: "GET" }).handler(async (): Promise<ActiveSpaceContext> => {
  const { resolveSpaceContext } = await import("./space-context.server");
  const ctx = await resolveSpaceContext();
  if (!ctx) {
    return { spaceId: null, name: "", plan: "", status: "active", isSuperAdmin: false, flags: {}, limits: {} };
  }
  const db = await admin();
  const { data } = await db.from("spaces").select("name, plan").eq("id", ctx.spaceId).maybeSingle();
  const s = data as { name?: string; plan?: string } | null;
  return {
    spaceId: ctx.spaceId,
    name: s?.name ?? "",
    plan: s?.plan ?? "",
    status: ctx.status,
    isSuperAdmin: ctx.isSuperAdmin,
    flags: ctx.flags ?? {},
    limits: ctx.limits ?? {},
  };
});

/* ----------------------- Spaces a user can view ----------------------- */



// Returns the Spaces the caller may switch between. Super admins see all
// Spaces; other users see only the Spaces they belong to. Used by the header
// Space selector.
export const listMySpaces = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequestUser } = await import("@/integrations/supabase/role-guard.server");
  const u = await getRequestUser();
  if (!u) return { spaces: [], isSuperAdmin: false, error: "Unauthorized" };
  const db = await admin();
  const isSuper = u.role === "super_admin";

  if (isSuper) {
    const { data } = await db
      .from("spaces")
      .select("id, name, status, is_default")
      .order("is_default", { ascending: false })
      .order("name", { ascending: true });
    return { spaces: (data ?? []) as SpaceLite[], isSuperAdmin: true, error: null };
  }

  const { data: memberships } = await db
    .from("space_members")
    .select("space_id, role")
    .eq("user_id", u.userId);
  const ids = ((memberships ?? []) as Array<{ space_id: string }>).map((m) => m.space_id);
  if (ids.length === 0) return { spaces: [], isSuperAdmin: false, error: null };
  const { data: spaces } = await db
    .from("spaces")
    .select("id, name, status, is_default")
    .in("id", ids)
    .eq("status", "active")
    .order("name", { ascending: true });
  return { spaces: (spaces ?? []) as SpaceLite[], isSuperAdmin: false, error: null };
});

/* ----------------------- Super admin: manage spaces ----------------------- */

export const listSpaces = createServerFn({ method: "GET" }).handler(async () => {
  try {
    await guardSuper();
  } catch (e) {
    return { spaces: [], error: (e as Error).message };
  }
  const db = await admin();
  const { data: spaces, error } = await db
    .from("spaces")
    .select("*")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) return { spaces: [], error: error.message };

  // Attach a member count per space.
  const { data: members } = await db.from("space_members").select("space_id");
  const counts = new Map<string, number>();
  for (const m of (members ?? []) as Array<{ space_id: string }>) {
    counts.set(m.space_id, (counts.get(m.space_id) ?? 0) + 1);
  }
  const withCounts = ((spaces ?? []) as Array<{ id: string }>).map((s) => ({
    ...s,
    member_count: counts.get(s.id) ?? 0,
  }));
  return { spaces: withCounts as SpaceRow[], error: null };
});

export const createSpace = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        name: z.string().min(1).max(120),
        plan: z.string().max(60).optional(),
        feature_flags: flagsSchema.optional(),
        limits: limitsSchema.optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guardSuper();
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    let slug = slugify(data.name);
    // Ensure unique slug.
    const { data: existing } = await db.from("spaces").select("slug").like("slug", `${slug}%`);
    const taken = new Set(((existing ?? []) as Array<{ slug: string }>).map((s) => s.slug));
    if (taken.has(slug)) {
      let i = 2;
      while (taken.has(`${slug}-${i}`)) i++;
      slug = `${slug}-${i}`;
    }
    const { data: created, error } = await db
      .from("spaces")
      .insert({
        name: data.name,
        slug,
        status: "active",
        plan: data.plan ?? "standard",
        feature_flags: data.feature_flags ?? DEFAULT_FLAGS,
        limits: data.limits ?? DEFAULT_LIMITS,
        is_default: false,
      } as never)
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, error: null, id: (created as { id: string }).id };
  });

export const updateSpace = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().min(1).max(120).optional(),
        plan: z.string().max(60).optional(),
        feature_flags: flagsSchema.optional(),
        limits: limitsSchema.optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guardSuper();
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.plan !== undefined) patch.plan = data.plan;
    if (data.feature_flags !== undefined) patch.feature_flags = data.feature_flags;
    if (data.limits !== undefined) patch.limits = data.limits;
    if (Object.keys(patch).length === 0) return { ok: false, error: "Nothing to update." };
    const { error } = await db.from("spaces").update(patch as never).eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

export const setSpaceStatus = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["active", "suspended"]) }).parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guardSuper();
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { data: space } = await db.from("spaces").select("is_default").eq("id", data.id).maybeSingle();
    if ((space as { is_default?: boolean } | null)?.is_default && data.status === "suspended") {
      return { ok: false, error: "The Default Space cannot be suspended." };
    }
    const { error } = await db.from("spaces").update({ status: data.status } as never).eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

export const deleteSpace = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guardSuper();
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { data: space } = await db.from("spaces").select("is_default").eq("id", data.id).maybeSingle();
    if ((space as { is_default?: boolean } | null)?.is_default) {
      return { ok: false, error: "The Default Space cannot be deleted." };
    }
    // All tenant tables are ON DELETE CASCADE from spaces, so this removes the
    // Space and every record that belongs to it.
    const { error } = await db.from("spaces").delete().eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

/* ----------------------- Members ----------------------- */

export const listSpaceMembers = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ spaceId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guardSuper();
    } catch (e) {
      return { members: [], users: [], error: (e as Error).message };
    }
    const db = await admin();
    const [{ data: members }, { data: profiles }, { data: roles }] = await Promise.all([
      db.from("space_members").select("id, user_id, role").eq("space_id", data.spaceId),
      db.from("profiles").select("user_id, email, full_name"),
      db.from("user_roles").select("user_id, role"),
    ]);
    const profileMap = new Map(
      ((profiles ?? []) as Array<{ user_id: string; email: string | null; full_name: string | null }>).map((p) => [
        p.user_id,
        p,
      ]),
    );
    // Super admins are platform-wide and never space members.
    const superIds = new Set(
      ((roles ?? []) as Array<{ user_id: string; role: string }>)
        .filter((r) => r.role === "super_admin")
        .map((r) => r.user_id),
    );
    const memberRows = ((members ?? []) as Array<{ id: string; user_id: string; role: AppRole }>).map((m) => ({
      id: m.id,
      user_id: m.user_id,
      role: m.role,
      email: profileMap.get(m.user_id)?.email ?? null,
      full_name: profileMap.get(m.user_id)?.full_name ?? null,
    }));
    const memberIds = new Set(memberRows.map((m) => m.user_id));
    const assignable = ((profiles ?? []) as Array<{ user_id: string; email: string | null; full_name: string | null }>)
      .filter((p) => !memberIds.has(p.user_id) && !superIds.has(p.user_id))
      .map((p) => ({ user_id: p.user_id, email: p.email, full_name: p.full_name }));
    return { members: memberRows, users: assignable, error: null };
  });

export const addSpaceMember = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        spaceId: z.string().uuid(),
        userId: z.string().uuid(),
        role: z.enum(["admin", "agent"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guardSuper();
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();

    // Enforce the Space's max_users limit (only counts new members).
    const [{ data: space }, { count }] = await Promise.all([
      db.from("spaces").select("limits").eq("id", data.spaceId).maybeSingle(),
      db.from("space_members").select("id", { count: "exact", head: true }).eq("space_id", data.spaceId),
    ]);
    const maxUsers = (space as { limits?: { max_users?: number } } | null)?.limits?.max_users;
    const { data: existingMember } = await db
      .from("space_members")
      .select("id")
      .eq("space_id", data.spaceId)
      .eq("user_id", data.userId)
      .maybeSingle();
    if (!existingMember && typeof maxUsers === "number" && maxUsers > 0 && (count ?? 0) >= maxUsers) {
      return { ok: false, error: `Plan limit reached: this Space allows up to ${maxUsers} members.` };
    }

    const { error } = await db
      .from("space_members")
      .upsert(
        { space_id: data.spaceId, user_id: data.userId, role: data.role } as never,
        { onConflict: "space_id,user_id" },
      );
    return { ok: !error, error: error?.message ?? null };
  });

export const removeSpaceMember = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guardSuper();
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { error } = await db.from("space_members").delete().eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

export type SpaceRole = (typeof ALL_ROLES)[number];
