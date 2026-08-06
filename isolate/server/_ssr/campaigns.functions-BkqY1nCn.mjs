import { c as createServerRpc } from "./createServerRpc-Baarst8k.mjs";
import { c as createServerFn } from "./server-BpMAhPfL.mjs";

import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, a as arrayType, n as numberType, e as enumType, r as recordType } from "../_libs/zod.mjs";

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
async function spaceCtx() {
  const {
    resolveSpaceContext
  } = await import("./space-context.server-D2TjyZvs.mjs");
  return resolveSpaceContext();
}
async function scopedDb() {
  const {
    supabaseAdmin
  } = await import("./client.server-5D-kk_Jp.mjs");
  const {
    makeScopedClient,
    NO_SPACE
  } = await import("./space-context.server-D2TjyZvs.mjs");
  const ctx = await spaceCtx();
  const sid = ctx && (ctx.isSuperAdmin || ctx.status === "active") ? ctx.spaceId : NO_SPACE;
  return makeScopedClient(supabaseAdmin, sid);
}
async function guard(allowed) {
  const {
    assertRole
  } = await import("./role-guard.server-D4B58koo.mjs");
  return assertRole(allowed);
}
async function isAuthed() {
  const {
    getRequestUser
  } = await import("./role-guard.server-D4B58koo.mjs");
  const u = await getRequestUser();
  return Boolean(u?.role);
}
const MANAGE_ROLES = ["super_admin", "admin"];
const emptyStats = () => ({
  total: 0,
  pending: 0,
  sent: 0,
  delivered: 0,
  opened: 0,
  replied: 0,
  failed: 0
});
const listCampaigns_createServerFn_handler = createServerRpc({
  id: "a9d93f07e9116cae197653f9538f075fa602afd61a82cb0828323b152fbbb57b",
  name: "listCampaigns",
  filename: "src/lib/campaigns.functions.ts"
}, (opts) => listCampaigns.__executeServer(opts));
const listCampaigns = createServerFn({
  method: "GET"
}).handler(listCampaigns_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    campaigns: [],
    error: "Unauthorized"
  };
  const db = await scopedDb();
  const {
    data: camps,
    error
  } = await db.from("campaigns").select("*").order("created_at", {
    ascending: false
  }).limit(500);
  if (error) return {
    campaigns: [],
    error: error.message
  };
  const rows = camps ?? [];
  const ids = rows.map((c) => c.id);
  const statsById = /* @__PURE__ */ new Map();
  if (ids.length > 0) {
    const {
      data: recips
    } = await db.from("campaign_recipients").select("campaign_id, status").in("campaign_id", ids).limit(1e5);
    for (const r of recips ?? []) {
      const s = statsById.get(r.campaign_id) ?? emptyStats();
      s.total += 1;
      if (s[r.status] !== void 0 && r.status !== "total") {
        s[r.status] += 1;
      }
      statsById.set(r.campaign_id, s);
    }
  }
  const campaigns = rows.map((c) => ({
    id: c.id,
    name: c.name,
    channel: c.channel,
    workspace_id: c.workspace_id,
    message_template: c.message_template,
    status: c.status,
    batch_size: c.batch_size,
    delay_seconds: c.delay_seconds,
    send_rate_per_min: c.send_rate_per_min,
    message_variations: c.message_variations ?? [],
    batch_break_seconds: c.batch_break_seconds ?? 60,
    send_days: c.send_days ?? [0, 1, 2, 3, 4, 5, 6],
    send_window_start: c.send_window_start ?? null,
    send_window_end: c.send_window_end ?? null,
    send_timezone: c.send_timezone ?? "UTC",
    start_at: c.start_at,
    end_at: c.end_at,
    last_batch_at: c.last_batch_at,
    created_at: c.created_at,
    updated_at: c.updated_at,
    stats: statsById.get(c.id) ?? emptyStats()
  }));
  return {
    campaigns,
    error: null
  };
});
const listCampaignRecipients_createServerFn_handler = createServerRpc({
  id: "9be36f205e095650b906a98cdcbb1c9b6b2e6294d4d303807d1c7ffc72991024",
  name: "listCampaignRecipients",
  filename: "src/lib/campaigns.functions.ts"
}, (opts) => listCampaignRecipients.__executeServer(opts));
const listCampaignRecipients = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  campaignId: stringType().uuid()
}).parse(d)).handler(listCampaignRecipients_createServerFn_handler, async ({
  data
}) => {
  if (!await isAuthed()) return {
    recipients: [],
    error: "Unauthorized"
  };
  const db = await scopedDb();
  const {
    data: recips,
    error
  } = await db.from("campaign_recipients").select("id, phone_number, name, status, error, sent_at, replied_at, created_at").eq("campaign_id", data.campaignId).order("created_at", {
    ascending: true
  }).limit(2e3);
  if (error) return {
    recipients: [],
    error: error.message
  };
  return {
    recipients: recips ?? [],
    error: null
  };
});
const getCampaignOptions_createServerFn_handler = createServerRpc({
  id: "c4e7b21088ea68ff37cddb27e497bf5d69b1a5a0f3d35b4e94fee95838219e5a",
  name: "getCampaignOptions",
  filename: "src/lib/campaigns.functions.ts"
}, (opts) => getCampaignOptions.__executeServer(opts));
const getCampaignOptions = createServerFn({
  method: "GET"
}).handler(getCampaignOptions_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    workspaces: [],
    offers: [],
    stages: [],
    error: "Unauthorized"
  };
  const db = await scopedDb();
  const [{
    data: ws
  }, {
    data: offers
  }, {
    data: pipes
  }, {
    data: stages
  }] = await Promise.all([db.from("chatwoot_workspaces").select("id, name, provider_type, enabled").order("name", {
    ascending: true
  }), db.from("offers").select("id, name").order("name", {
    ascending: true
  }), db.from("pipelines").select("id, name").order("position", {
    ascending: true
  }), db.from("pipeline_stages").select("id, pipeline_id, label, stage_keys, position").order("position", {
    ascending: true
  })]);
  const pipeName = new Map((pipes ?? []).map((p) => [p.id, p.name]));
  const stageList = (stages ?? []).map((s) => ({
    id: s.id,
    label: s.label,
    stage_keys: s.stage_keys ?? [],
    pipeline_name: pipeName.get(s.pipeline_id) ?? ""
  }));
  return {
    workspaces: (ws ?? []).filter((w) => w.enabled),
    offers: offers ?? [],
    stages: stageList,
    error: null
  };
});
const campaignInput = objectType({
  name: stringType().trim().min(1).max(120),
  channel: enumType(["whatsapp", "sms", "email", "other"]).default("whatsapp"),
  workspace_id: stringType().uuid().nullable().optional(),
  message_template: stringType().max(8e3).default(""),
  message_variations: arrayType(stringType().max(8e3)).max(10).default([]),
  batch_size: numberType().int().min(1).max(100).default(25),
  delay_seconds: numberType().int().min(0).max(5).default(2),
  batch_break_seconds: numberType().int().min(0).max(86400).default(60),
  send_rate_per_min: numberType().int().min(1).max(600).default(60),
  send_days: arrayType(numberType().int().min(0).max(6)).max(7).default([0, 1, 2, 3, 4, 5, 6]),
  send_window_start: stringType().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  send_window_end: stringType().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  send_timezone: stringType().max(64).default("UTC"),
  start_at: stringType().nullable().optional(),
  end_at: stringType().nullable().optional()
});
const createCampaign_createServerFn_handler = createServerRpc({
  id: "fdd1cd7187316037ea146cc01f5803c448f81fba3975f8ab8d92e76b9ef5f2d3",
  name: "createCampaign",
  filename: "src/lib/campaigns.functions.ts"
}, (opts) => createCampaign.__executeServer(opts));
const createCampaign = createServerFn({
  method: "POST"
}).inputValidator((d) => campaignInput.parse(d)).handler(createCampaign_createServerFn_handler, async ({
  data
}) => {
  let me;
  try {
    me = await guard(MANAGE_ROLES);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    data: created,
    error
  } = await db.from("campaigns").insert({
    name: data.name,
    channel: data.channel,
    workspace_id: data.workspace_id ?? null,
    message_template: data.message_template ?? "",
    status: "draft",
    batch_size: data.batch_size,
    delay_seconds: data.delay_seconds,
    batch_break_seconds: data.batch_break_seconds,
    send_rate_per_min: data.send_rate_per_min,
    message_variations: data.message_variations ?? [],
    send_days: data.send_days ?? [0, 1, 2, 3, 4, 5, 6],
    send_window_start: data.send_window_start || null,
    send_window_end: data.send_window_end || null,
    send_timezone: data.send_timezone || "UTC",
    start_at: data.start_at || null,
    end_at: data.end_at || null,
    created_by: me?.userId ?? null
  }).select("id").single();
  if (error || !created) return {
    ok: false,
    error: error?.message ?? "Could not create campaign"
  };
  return {
    ok: true,
    error: null,
    id: created.id
  };
});
const updateCampaign_createServerFn_handler = createServerRpc({
  id: "00cb2e82a9b0990de75f2084e38d68c14eb0cbf41b0519728fbdb9e040635442",
  name: "updateCampaign",
  filename: "src/lib/campaigns.functions.ts"
}, (opts) => updateCampaign.__executeServer(opts));
const updateCampaign = createServerFn({
  method: "POST"
}).inputValidator((d) => campaignInput.partial().extend({
  id: stringType().uuid()
}).parse(d)).handler(updateCampaign_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(MANAGE_ROLES);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const patch = {};
  for (const k of ["name", "channel", "workspace_id", "message_template", "message_variations", "batch_size", "delay_seconds", "batch_break_seconds", "send_rate_per_min", "send_days", "send_timezone"]) {
    if (data[k] !== void 0) patch[k] = data[k];
  }
  if (data.start_at !== void 0) patch.start_at = data.start_at || null;
  if (data.end_at !== void 0) patch.end_at = data.end_at || null;
  if (data.send_window_start !== void 0) patch.send_window_start = data.send_window_start || null;
  if (data.send_window_end !== void 0) patch.send_window_end = data.send_window_end || null;
  if (Object.keys(patch).length === 0) return {
    ok: false,
    error: "Nothing to update."
  };
  const {
    error
  } = await db.from("campaigns").update(patch).eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const setCampaignStatus_createServerFn_handler = createServerRpc({
  id: "a08e28dc292e44c75289d5fcca1f137485ba52c925213b0bee3d203a894437ea",
  name: "setCampaignStatus",
  filename: "src/lib/campaigns.functions.ts"
}, (opts) => setCampaignStatus.__executeServer(opts));
const setCampaignStatus = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid(),
  action: enumType(["start", "pause", "resume", "cancel"])
}).parse(d)).handler(setCampaignStatus_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(MANAGE_ROLES);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    data: camp
  } = await db.from("campaigns").select("id, status, message_template, workspace_id, start_at").eq("id", data.id).maybeSingle();
  const c = camp;
  if (!c) return {
    ok: false,
    error: "Campaign not found."
  };
  if (data.action === "start") {
    if (!c.workspace_id) return {
      ok: false,
      error: "Choose a sending workspace before starting."
    };
    if (!String(c.message_template ?? "").trim()) return {
      ok: false,
      error: "Add a message template before starting."
    };
    const {
      count
    } = await db.from("campaign_recipients").select("id", {
      count: "exact",
      head: true
    }).eq("campaign_id", data.id).eq("status", "pending");
    if ((count ?? 0) === 0) return {
      ok: false,
      error: "Add at least one pending recipient before starting."
    };
    const future = c.start_at && new Date(String(c.start_at)).getTime() > Date.now();
    const {
      error: error2
    } = await db.from("campaigns").update({
      status: future ? "scheduled" : "running"
    }).eq("id", data.id);
    return {
      ok: !error2,
      error: error2?.message ?? null
    };
  }
  if (data.action === "pause") {
    const {
      error: error2
    } = await db.from("campaigns").update({
      status: "paused"
    }).eq("id", data.id);
    return {
      ok: !error2,
      error: error2?.message ?? null
    };
  }
  if (data.action === "resume") {
    const {
      error: error2
    } = await db.from("campaigns").update({
      status: "running"
    }).eq("id", data.id);
    return {
      ok: !error2,
      error: error2?.message ?? null
    };
  }
  const {
    error
  } = await db.from("campaigns").update({
    status: "cancelled"
  }).eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const deleteCampaign_createServerFn_handler = createServerRpc({
  id: "0fdd36c83dd8dd2d96973afb69b82f5a87217c21241a67b302d9e0853cca7a4a",
  name: "deleteCampaign",
  filename: "src/lib/campaigns.functions.ts"
}, (opts) => deleteCampaign.__executeServer(opts));
const deleteCampaign = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteCampaign_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(MANAGE_ROLES);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    error
  } = await db.from("campaigns").delete().eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const PHONE_DIGITS = (p) => String(p ?? "").replace(/@.*$/, "").replace(/[^0-9]/g, "");
async function insertRecipients(db, campaignId, rows) {
  const seen = /* @__PURE__ */ new Set();
  const cleaned = rows.filter((r) => {
    const d = PHONE_DIGITS(r.phone_number);
    if (!d || d.length < 6 || seen.has(d)) return false;
    seen.add(d);
    return true;
  });
  if (cleaned.length === 0) return {
    added: 0,
    skipped: rows.length
  };
  const {
    data: existing
  } = await db.from("campaign_recipients").select("phone_number").eq("campaign_id", campaignId).limit(1e5);
  const existingSet = new Set((existing ?? []).map((e) => PHONE_DIGITS(e.phone_number)));
  const toInsert = cleaned.filter((r) => !existingSet.has(PHONE_DIGITS(r.phone_number)));
  if (toInsert.length === 0) return {
    added: 0,
    skipped: rows.length
  };
  const payload = toInsert.map((r) => ({
    campaign_id: campaignId,
    lead_id: r.lead_id,
    phone_number: r.phone_number,
    name: r.name,
    merge_data: r.merge_data,
    status: "pending"
  }));
  const {
    error
  } = await db.from("campaign_recipients").insert(payload);
  if (error) return {
    added: 0,
    skipped: rows.length
  };
  return {
    added: toInsert.length,
    skipped: rows.length - toInsert.length
  };
}
function leadToMerge(l) {
  return {
    course_interest: l.course_interest ?? "",
    country_interest: l.country_interest ?? "",
    student_or_parent: l.student_or_parent ?? ""
  };
}
const addRecipientsFromLeads_createServerFn_handler = createServerRpc({
  id: "8b30a5d064821f11309968fded3e3d07404a06454930c94cd9b8645a04a59e43",
  name: "addRecipientsFromLeads",
  filename: "src/lib/campaigns.functions.ts"
}, (opts) => addRecipientsFromLeads.__executeServer(opts));
const addRecipientsFromLeads = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  campaignId: stringType().uuid(),
  source: enumType(["all", "offer", "stage", "ids"]),
  offerId: stringType().uuid().optional(),
  stageKeys: arrayType(stringType().max(80)).max(100).optional(),
  leadIds: arrayType(stringType().uuid()).max(5e3).optional()
}).parse(d)).handler(addRecipientsFromLeads_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(MANAGE_ROLES);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  let leadIds = null;
  if (data.source === "offer") {
    if (!data.offerId) return {
      ok: false,
      error: "Choose an offer."
    };
    const {
      data: opps
    } = await db.from("lead_opportunities").select("lead_id").eq("offer_id", data.offerId).limit(1e4);
    leadIds = Array.from(new Set((opps ?? []).map((o) => o.lead_id).filter(Boolean)));
    if (leadIds.length === 0) return {
      ok: true,
      error: null,
      added: 0,
      skipped: 0
    };
  } else if (data.source === "ids") {
    leadIds = data.leadIds ?? [];
    if (leadIds.length === 0) return {
      ok: false,
      error: "No contacts selected."
    };
  }
  let q = db.from("leads").select("id, phone_number, lead_name, course_interest, country_interest, student_or_parent").limit(2e4);
  if (leadIds) q = q.in("id", leadIds);
  if (data.source === "stage") {
    const keys = data.stageKeys ?? [];
    if (keys.length === 0) return {
      ok: false,
      error: "Choose at least one stage."
    };
    q = q.in("qualification_status", keys);
  }
  const {
    data: leads,
    error
  } = await q;
  if (error) return {
    ok: false,
    error: error.message
  };
  const rows = (leads ?? []).filter((l) => l.phone_number).map((l) => ({
    phone_number: String(l.phone_number),
    name: l.lead_name ?? null,
    lead_id: l.id,
    merge_data: leadToMerge(l)
  }));
  if (rows.length === 0) return {
    ok: true,
    error: null,
    added: 0,
    skipped: 0
  };
  const res = await insertRecipients(db, data.campaignId, rows);
  return {
    ok: true,
    error: null,
    ...res
  };
});
const addRecipientsFromCsv_createServerFn_handler = createServerRpc({
  id: "799b5d005056f07de102e92a10b6deb8bee353c5957305173efa90827334250d",
  name: "addRecipientsFromCsv",
  filename: "src/lib/campaigns.functions.ts"
}, (opts) => addRecipientsFromCsv.__executeServer(opts));
const addRecipientsFromCsv = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  campaignId: stringType().uuid(),
  rows: arrayType(recordType(stringType(), stringType().max(2e3))).min(1).max(1e4)
}).parse(d)).handler(addRecipientsFromCsv_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(MANAGE_ROLES);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const findKey = (obj, candidates) => {
    const keys = Object.keys(obj);
    for (const c of candidates) {
      const hit = keys.find((k) => k.trim().toLowerCase() === c);
      if (hit) return hit;
    }
    return null;
  };
  const rows = [];
  for (const raw of data.rows) {
    const phoneKey = findKey(raw, ["phone", "phone_number", "telephone", "mobile", "whatsapp", "number"]);
    if (!phoneKey) continue;
    const phone = String(raw[phoneKey] ?? "").trim();
    if (!phone) continue;
    const nameKey = findKey(raw, ["name", "full_name", "first_name", "contact"]);
    const name = nameKey ? String(raw[nameKey] ?? "").trim() || null : null;
    const merge = {};
    for (const [k, v] of Object.entries(raw)) {
      if (k === phoneKey) continue;
      merge[k.trim().toLowerCase().replace(/\s+/g, "_")] = v;
    }
    rows.push({
      phone_number: phone,
      name,
      lead_id: null,
      merge_data: merge
    });
  }
  if (rows.length === 0) return {
    ok: false,
    error: "No valid rows with a phone column were found."
  };
  const res = await insertRecipients(db, data.campaignId, rows);
  return {
    ok: true,
    error: null,
    ...res
  };
});
const clearPendingRecipients_createServerFn_handler = createServerRpc({
  id: "f333da84ff96ee40bd85f2d29b1c58ea9f888d3d77136f98a371e2480526de20",
  name: "clearPendingRecipients",
  filename: "src/lib/campaigns.functions.ts"
}, (opts) => clearPendingRecipients.__executeServer(opts));
const clearPendingRecipients = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  campaignId: stringType().uuid()
}).parse(d)).handler(clearPendingRecipients_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(MANAGE_ROLES);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    error
  } = await db.from("campaign_recipients").delete().eq("campaign_id", data.campaignId).eq("status", "pending");
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
function csvCell(v) {
  const s = v === null || v === void 0 ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
const exportContactsCsv_createServerFn_handler = createServerRpc({
  id: "e373b73fb9719155d87a4061ab7f678ef710dc53c0ccbc3e08bc044c1b58808a",
  name: "exportContactsCsv",
  filename: "src/lib/campaigns.functions.ts"
}, (opts) => exportContactsCsv.__executeServer(opts));
const exportContactsCsv = createServerFn({
  method: "GET"
}).handler(exportContactsCsv_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    csv: "",
    error: "Unauthorized"
  };
  const db = await scopedDb();
  const {
    data,
    error
  } = await db.from("leads").select("lead_name, phone_number, student_or_parent, course_interest, country_interest, qualification_status, created_at").order("created_at", {
    ascending: false
  }).limit(2e4);
  if (error) return {
    csv: "",
    error: error.message
  };
  const headers = ["name", "phone", "type", "course_interest", "country_interest", "stage", "created_at"];
  const lines = [headers.join(",")];
  for (const l of data ?? []) {
    lines.push([csvCell(l.lead_name), csvCell(l.phone_number), csvCell(l.student_or_parent), csvCell(l.course_interest), csvCell(l.country_interest), csvCell(l.qualification_status), csvCell(l.created_at)].join(","));
  }
  return {
    csv: lines.join("\n"),
    error: null
  };
});
export {
  addRecipientsFromCsv_createServerFn_handler,
  addRecipientsFromLeads_createServerFn_handler,
  clearPendingRecipients_createServerFn_handler,
  createCampaign_createServerFn_handler,
  deleteCampaign_createServerFn_handler,
  exportContactsCsv_createServerFn_handler,
  getCampaignOptions_createServerFn_handler,
  listCampaignRecipients_createServerFn_handler,
  listCampaigns_createServerFn_handler,
  setCampaignStatus_createServerFn_handler,
  updateCampaign_createServerFn_handler
};
