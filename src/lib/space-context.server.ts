// Server-only multi-tenant "Spaces" context.
//
// Tenancy is enforced in the server-function / pipeline layer (all data access
// goes through the service-role admin client). This module provides:
//   - A scoped admin client proxy that auto-filters tenant tables by space_id
//     and injects space_id on writes.
//   - An AsyncLocalStorage binding so the admissions pipeline (webhooks / cron)
//     can run a block "inside" a space without threading the id everywhere.
//   - resolveSpaceContext() for authenticated dashboard requests.
import { AsyncLocalStorage } from "node:async_hooks";
import { getRequestHeader } from "@tanstack/react-start/server";
import type { AppRole } from "@/lib/roles";

// Tables that carry a space_id and must be isolated per Space.
export const TENANT_TABLES = new Set<string>([
  "leads",
  "conversations",
  "whatsapp_messages",
  "appointments",
  "education_settings",
  "ai_configuration",
  "ai_variables",
  "prompt_versions",
  "http_actions",
  "chatwoot_workspaces",
  "scheduled_messages",
  "responder_agents",
  "workflows",
  "workflow_enrollments",
  "lead_opportunities",
  "meeting_outcomes",
  "offers",
  "stage_opportunity_settings",
  "report_conversations",
  "ai_provider_pool",
  "audit_logs",
  "pipelines",
  "pipeline_stages",
  "campaigns",
  "campaign_recipients",
  "voip_settings",
  "calls",
  "call_callbacks",
  "dial_campaigns",
  "dial_campaign_members",
  "ring_groups",
  "ring_group_members",
  "inbound_routes",
]);

// A space id that matches nothing — used as a safe fallback so reads return
// empty and writes fail cleanly instead of leaking across tenants.
export const NO_SPACE = "00000000-0000-0000-0000-000000000000";

/* eslint-disable @typescript-eslint/no-explicit-any */
function injectSpace(rows: any, spaceId: string): any {
  if (Array.isArray(rows)) return rows.map((r) => ({ ...r, space_id: spaceId }));
  return { ...rows, space_id: spaceId };
}

function wrapBuilder(builder: any, spaceId: string): any {
  return new Proxy(builder, {
    get(target, prop, receiver) {
      if (prop === "select") {
        return (...args: any[]) => target.select(...args).eq("space_id", spaceId);
      }
      if (prop === "update") {
        return (vals: any, ...rest: any[]) => target.update(vals, ...rest).eq("space_id", spaceId);
      }
      if (prop === "delete") {
        return (...args: any[]) => target.delete(...args).eq("space_id", spaceId);
      }
      if (prop === "insert") {
        return (rows: any, ...rest: any[]) => target.insert(injectSpace(rows, spaceId), ...rest);
      }
      if (prop === "upsert") {
        return (rows: any, ...rest: any[]) => target.upsert(injectSpace(rows, spaceId), ...rest);
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

// Wrap a service-role client so every tenant-table query is scoped to one space.
export function makeScopedClient(db: any, spaceId: string): any {
  return new Proxy(db, {
    get(target, prop, receiver) {
      if (prop === "from") {
        return (table: string) => {
          const builder = target.from(table);
          if (!TENANT_TABLES.has(table)) return builder;
          return wrapBuilder(builder, spaceId);
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---- Ambient space binding (for the admissions pipeline) ----
const spaceALS = new AsyncLocalStorage<{ spaceId: string }>();

export function runInSpace<T>(spaceId: string, fn: () => Promise<T>): Promise<T> {
  return spaceALS.run({ spaceId }, fn);
}

export function currentSpaceId(): string | null {
  return spaceALS.getStore()?.spaceId ?? null;
}

let _defaultSpaceId: string | null = null;
export async function getDefaultSpaceId(): Promise<string> {
  if (_defaultSpaceId) return _defaultSpaceId;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("spaces").select("id").eq("is_default", true).maybeSingle();
  _defaultSpaceId = (data as { id?: string } | null)?.id ?? NO_SPACE;
  return _defaultSpaceId;
}

export interface SpaceContext {
  spaceId: string;
  role: AppRole | null; // the caller's role within this space (or global role for super admin)
  isSuperAdmin: boolean;
  status: string;
  flags: Record<string, boolean>;
  limits: Record<string, number>;
}

// Resolve the active space for an authenticated dashboard request.
// Honors the optional `x-space-id` header (validated against membership), then
// falls back to the caller's first membership, then the Default Space for
// super admins.
export async function resolveSpaceContext(): Promise<SpaceContext | null> {
  const { getRequestUser } = await import("@/integrations/supabase/role-guard.server");
  const u = await getRequestUser();
  if (!u) return null;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const isSuper = u.role === "super_admin";

  let headerSpace: string | null = null;
  try {
    headerSpace = (getRequestHeader("x-space-id") || "").trim() || null;
  } catch {
    headerSpace = null;
  }

  const { data: memberships } = await supabaseAdmin
    .from("space_members")
    .select("space_id, role")
    .eq("user_id", u.userId);
  const memberRows = (memberships as Array<{ space_id: string; role: AppRole }>) ?? [];
  const memberMap = new Map(memberRows.map((m) => [m.space_id, m.role]));

  let spaceId: string | null = null;
  let roleInSpace: AppRole | null = u.role;

  if (headerSpace && (isSuper || memberMap.has(headerSpace))) {
    spaceId = headerSpace;
    roleInSpace = memberMap.get(headerSpace) ?? u.role;
  }
  if (!spaceId) {
    if (memberRows.length > 0) {
      spaceId = memberRows[0].space_id;
      roleInSpace = memberRows[0].role;
    } else if (isSuper) {
      spaceId = await getDefaultSpaceId();
    }
  }
  if (!spaceId) return null;

  const { data: space } = await supabaseAdmin
    .from("spaces")
    .select("status, feature_flags, limits")
    .eq("id", spaceId)
    .maybeSingle();
  const s = space as { status?: string; feature_flags?: Record<string, boolean>; limits?: Record<string, number> } | null;

  return {
    spaceId,
    role: roleInSpace,
    isSuperAdmin: isSuper,
    status: s?.status ?? "active",
    flags: s?.feature_flags ?? {},
    limits: s?.limits ?? {},
  };
}
