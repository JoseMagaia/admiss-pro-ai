import { AsyncLocalStorage } from "node:async_hooks";
import { b as getRequestHeader } from "./server-BpMAhPfL.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";

import "../_libs/h3-v2.mjs";
import "../_libs/unenv.mjs";


import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";





import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";

import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
const TENANT_TABLES = /* @__PURE__ */ new Set([
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
  "calendar_settings",
  "jitsi_settings"
]);
const NO_SPACE = "00000000-0000-0000-0000-000000000000";
function injectSpace(rows, spaceId) {
  if (Array.isArray(rows)) return rows.map((r) => ({ ...r, space_id: spaceId }));
  return { ...rows, space_id: spaceId };
}
function wrapBuilder(builder, spaceId) {
  return new Proxy(builder, {
    get(target, prop, receiver) {
      if (prop === "select") {
        return (...args) => target.select(...args).eq("space_id", spaceId);
      }
      if (prop === "update") {
        return (vals, ...rest) => target.update(vals, ...rest).eq("space_id", spaceId);
      }
      if (prop === "delete") {
        return (...args) => target.delete(...args).eq("space_id", spaceId);
      }
      if (prop === "insert") {
        return (rows, ...rest) => target.insert(injectSpace(rows, spaceId), ...rest);
      }
      if (prop === "upsert") {
        return (rows, ...rest) => target.upsert(injectSpace(rows, spaceId), ...rest);
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}
function makeScopedClient(db, spaceId) {
  return new Proxy(db, {
    get(target, prop, receiver) {
      if (prop === "from") {
        return (table) => {
          const builder = target.from(table);
          if (!TENANT_TABLES.has(table)) return builder;
          return wrapBuilder(builder, spaceId);
        };
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}
const spaceALS = new AsyncLocalStorage();
function runInSpace(spaceId, fn) {
  return spaceALS.run({ spaceId }, fn);
}
function currentSpaceId() {
  return spaceALS.getStore()?.spaceId ?? null;
}
let _defaultSpaceId = null;
async function getDefaultSpaceId() {
  if (_defaultSpaceId) return _defaultSpaceId;
  const { supabaseAdmin } = await import("./client.server-5D-kk_Jp.mjs");
  const { data } = await supabaseAdmin.from("spaces").select("id").eq("is_default", true).maybeSingle();
  _defaultSpaceId = data?.id ?? NO_SPACE;
  return _defaultSpaceId;
}
async function resolveSpaceContext() {
  const { getRequestUser } = await import("./role-guard.server-D4B58koo.mjs");
  const u = await getRequestUser();
  if (!u) return null;
  const { supabaseAdmin } = await import("./client.server-5D-kk_Jp.mjs");
  const isSuper = u.role === "super_admin";
  let headerSpace = null;
  try {
    headerSpace = (getRequestHeader("x-space-id") || "").trim() || null;
  } catch {
    headerSpace = null;
  }
  const { data: memberships } = await supabaseAdmin.from("space_members").select("space_id, role").eq("user_id", u.userId);
  const memberRows = memberships ?? [];
  const memberMap = new Map(memberRows.map((m) => [m.space_id, m.role]));
  let spaceId = null;
  let roleInSpace = u.role;
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
  const { data: space } = await supabaseAdmin.from("spaces").select("status, feature_flags, limits").eq("id", spaceId).maybeSingle();
  const s = space;
  return {
    spaceId,
    role: roleInSpace,
    isSuperAdmin: isSuper,
    status: s?.status ?? "active",
    flags: s?.feature_flags ?? {},
    limits: s?.limits ?? {}
  };
}
export {
  NO_SPACE,
  TENANT_TABLES,
  currentSpaceId,
  getDefaultSpaceId,
  makeScopedClient,
  resolveSpaceContext,
  runInSpace
};
