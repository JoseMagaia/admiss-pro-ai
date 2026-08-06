import { c as createServerRpc } from "./createServerRpc-Baarst8k.mjs";
import { A as ALL_ROLES, C as CALL_CAMPAIGN_ROLES } from "./roles-vB9M4HoO.mjs";
import { P as PIPELINE_COLUMNS } from "./pipeline-BHDikEyF.mjs";
import { c as createServerFn } from "./server-BpMAhPfL.mjs";

import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, b as booleanType, s as stringType, e as enumType, n as numberType, a as arrayType, r as recordType, u as unknownType } from "../_libs/zod.mjs";

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
async function currentUser() {
  const {
    getRequestUser
  } = await import("./role-guard.server-D4B58koo.mjs");
  return getRequestUser();
}
async function isAuthed() {
  const u = await currentUser();
  return Boolean(u?.role);
}
const ANY_ROLE = ALL_ROLES;
function agentIdentity(userId) {
  return `agent_${userId.replace(/-/g, "")}`;
}
const getVoipSettings_createServerFn_handler = createServerRpc({
  id: "b03ddef266c0950392b12635353029702c87de4525dc8d88b2ac114e4d0ec662",
  name: "getVoipSettings",
  filename: "src/lib/calls.functions.ts"
}, (opts) => getVoipSettings.__executeServer(opts));
const getVoipSettings = createServerFn({
  method: "GET"
}).handler(getVoipSettings_createServerFn_handler, async () => {
  try {
    await guard(["super_admin"]);
  } catch {
    return {
      settings: null,
      error: "Forbidden"
    };
  }
  const db = await scopedDb();
  const {
    data
  } = await db.from("voip_settings").select("*").limit(1).maybeSingle();
  return {
    settings: data ?? null,
    error: null
  };
});
const voipSchema = objectType({
  id: stringType().uuid().optional(),
  provider: enumType(["disabled", "sip", "twilio"]),
  enabled: booleanType(),
  sip_ws_server: stringType().max(500).nullable().optional(),
  sip_domain: stringType().max(300).nullable().optional(),
  sip_uri: stringType().max(300).nullable().optional(),
  sip_username: stringType().max(300).nullable().optional(),
  sip_password: stringType().max(500).nullable().optional(),
  sip_display_name: stringType().max(200).nullable().optional(),
  twilio_account_sid: stringType().max(100).nullable().optional(),
  twilio_api_key_sid: stringType().max(100).nullable().optional(),
  twilio_api_key_secret: stringType().max(500).nullable().optional(),
  twilio_twiml_app_sid: stringType().max(100).nullable().optional(),
  twilio_caller_id: stringType().max(60).nullable().optional(),
  inbound_enabled: booleanType().optional()
});
const SECRET_FIELDS = ["sip_password", "twilio_api_key_secret"];
const saveVoipSettings_createServerFn_handler = createServerRpc({
  id: "dad28c0d24bb0f8d3f94b0787e0c5251b71059f48a69bafc1733951b251659be",
  name: "saveVoipSettings",
  filename: "src/lib/calls.functions.ts"
}, (opts) => saveVoipSettings.__executeServer(opts));
const saveVoipSettings = createServerFn({
  method: "POST"
}).inputValidator((d) => voipSchema.parse(d)).handler(saveVoipSettings_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(["super_admin"]);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    id,
    ...rest
  } = data;
  for (const f of SECRET_FIELDS) {
    if (rest[f] === "" || rest[f] === void 0) delete rest[f];
  }
  if (id) {
    const {
      error: error2
    } = await db.from("voip_settings").update(rest).eq("id", id);
    return {
      ok: !error2,
      error: error2?.message ?? null
    };
  }
  const {
    error
  } = await db.from("voip_settings").insert(rest);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
async function mintTwilioToken(opts) {
  const {
    SignJWT
  } = await import("../_libs/jose.mjs");
  const secret = new TextEncoder().encode(opts.apiKeySecret);
  const now = Math.floor(Date.now() / 1e3);
  return new SignJWT({
    grants: {
      identity: opts.identity,
      voice: {
        incoming: {
          allow: true
        },
        outgoing: {
          application_sid: opts.twimlAppSid
        }
      }
    }
  }).setProtectedHeader({
    alg: "HS256",
    typ: "JWT",
    cty: "twilio-fpa;v=1"
  }).setIssuer(opts.apiKeySid).setSubject(opts.accountSid).setIssuedAt(now).setNotBefore(now).setExpirationTime(now + 3600).setJti(`${opts.apiKeySid}-${now}`).sign(secret);
}
const getVoipClientConfig_createServerFn_handler = createServerRpc({
  id: "25caaca990ebedc2f903c87ae54da6728d0ea78bafac960a8ee62cb6162a72a4",
  name: "getVoipClientConfig",
  filename: "src/lib/calls.functions.ts"
}, (opts) => getVoipClientConfig.__executeServer(opts));
const getVoipClientConfig = createServerFn({
  method: "GET"
}).handler(getVoipClientConfig_createServerFn_handler, async () => {
  const u = await currentUser();
  if (!u?.role) return {
    config: {
      provider: "disabled",
      reason: "Unauthorized"
    }
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("voip_settings").select("*").limit(1).maybeSingle();
  const s = data;
  if (!s || !s.enabled || s.provider === "disabled") {
    return {
      config: {
        provider: "disabled",
        reason: "Calling is not set up yet. Ask a super admin to configure telephony."
      }
    };
  }
  const inbound = Boolean(s.inbound_enabled);
  if (s.provider === "sip") {
    const wsServer = String(s.sip_ws_server ?? "");
    const uri = String(s.sip_uri ?? "");
    if (!wsServer || !uri) {
      return {
        config: {
          provider: "disabled",
          reason: "SIP settings are incomplete."
        }
      };
    }
    return {
      config: {
        provider: "sip",
        wsServer,
        uri,
        authUser: String(s.sip_username ?? ""),
        password: String(s.sip_password ?? ""),
        domain: String(s.sip_domain ?? ""),
        displayName: String(s.sip_display_name ?? ""),
        callerId: String(s.sip_uri ?? ""),
        identity: agentIdentity(u.userId),
        inbound
      }
    };
  }
  if (s.provider === "twilio") {
    const accountSid = String(s.twilio_account_sid ?? "");
    const apiKeySid = String(s.twilio_api_key_sid ?? "");
    const apiKeySecret = String(s.twilio_api_key_secret ?? "");
    const twimlAppSid = String(s.twilio_twiml_app_sid ?? "");
    if (!accountSid || !apiKeySid || !apiKeySecret || !twimlAppSid) {
      return {
        config: {
          provider: "disabled",
          reason: "Twilio settings are incomplete."
        }
      };
    }
    try {
      const token = await mintTwilioToken({
        accountSid,
        apiKeySid,
        apiKeySecret,
        twimlAppSid,
        identity: agentIdentity(u.userId)
      });
      return {
        config: {
          provider: "twilio",
          token,
          callerId: String(s.twilio_caller_id ?? ""),
          identity: agentIdentity(u.userId),
          inbound
        }
      };
    } catch {
      return {
        config: {
          provider: "disabled",
          reason: "Could not create a Twilio session."
        }
      };
    }
  }
  return {
    config: {
      provider: "disabled",
      reason: "Unknown provider."
    }
  };
});
const listCalls_createServerFn_handler = createServerRpc({
  id: "c58440861d680dc087dbe989cbc83d688543877ef870f2f762b3e3c70a11d787",
  name: "listCalls",
  filename: "src/lib/calls.functions.ts"
}, (opts) => listCalls.__executeServer(opts));
const listCalls = createServerFn({
  method: "GET"
}).handler(listCalls_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    calls: []
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("calls").select("*").order("created_at", {
    ascending: false
  }).limit(500);
  return {
    calls: data ?? []
  };
});
const logCallSchema = objectType({
  id: stringType().uuid().optional(),
  lead_id: stringType().uuid().nullable().optional(),
  phone_number: stringType().min(1).max(60),
  direction: enumType(["outbound", "inbound"]).optional(),
  status: enumType(["completed", "no_answer", "busy", "failed", "voicemail", "canceled"]).optional(),
  disposition: stringType().max(200).nullable().optional(),
  notes: stringType().max(5e3).nullable().optional(),
  provider: stringType().max(20).nullable().optional(),
  provider_call_sid: stringType().max(120).nullable().optional(),
  started_at: stringType().nullable().optional(),
  ended_at: stringType().nullable().optional(),
  duration_seconds: numberType().int().min(0).max(86400).optional()
});
const logCall_createServerFn_handler = createServerRpc({
  id: "fd0d3b9c8ce4e5ac2d87acf54c38f2ec4eb625ed91f013ca94d2e97381299ed1",
  name: "logCall",
  filename: "src/lib/calls.functions.ts"
}, (opts) => logCall.__executeServer(opts));
const logCall = createServerFn({
  method: "POST"
}).inputValidator((d) => logCallSchema.parse(d)).handler(logCall_createServerFn_handler, async ({
  data
}) => {
  let me;
  try {
    me = await guard(ANY_ROLE);
  } catch (e) {
    return {
      ok: false,
      error: e.message,
      id: null
    };
  }
  const db = await scopedDb();
  const {
    id,
    ...rest
  } = data;
  if (id) {
    const {
      error: error2
    } = await db.from("calls").update(rest).eq("id", id);
    return {
      ok: !error2,
      error: error2?.message ?? null,
      id
    };
  }
  const {
    data: inserted,
    error
  } = await db.from("calls").insert({
    ...rest,
    agent_user_id: me.userId
  }).select("id").maybeSingle();
  return {
    ok: !error,
    error: error?.message ?? null,
    id: inserted?.id ?? null
  };
});
const updateCallNotes_createServerFn_handler = createServerRpc({
  id: "d4891ea68ff5307322482a8a30200c4fd9b87d627ec15141a9ad18b11ff050ac",
  name: "updateCallNotes",
  filename: "src/lib/calls.functions.ts"
}, (opts) => updateCallNotes.__executeServer(opts));
const updateCallNotes = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid(),
  notes: stringType().max(5e3).nullable(),
  disposition: stringType().max(200).nullable().optional()
}).parse(d)).handler(updateCallNotes_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(ANY_ROLE);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const patch = {
    notes: data.notes
  };
  if (data.disposition !== void 0) patch.disposition = data.disposition;
  const {
    error
  } = await db.from("calls").update(patch).eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const scheduleCallback_createServerFn_handler = createServerRpc({
  id: "41f4843a9bb81e173789f270baaece6814a69fbb86bd369e6761aad89e1e9a9f",
  name: "scheduleCallback",
  filename: "src/lib/calls.functions.ts"
}, (opts) => scheduleCallback.__executeServer(opts));
const scheduleCallback = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  lead_id: stringType().uuid().nullable().optional(),
  phone_number: stringType().min(1).max(60),
  scheduled_at: stringType().min(1),
  reason: stringType().max(500).nullable().optional(),
  notes: stringType().max(5e3).nullable().optional(),
  from_call_id: stringType().uuid().nullable().optional()
}).parse(d)).handler(scheduleCallback_createServerFn_handler, async ({
  data
}) => {
  let me;
  try {
    me = await guard(ANY_ROLE);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    error
  } = await db.from("call_callbacks").insert({
    ...data,
    agent_user_id: me.userId
  });
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const listCallbacks_createServerFn_handler = createServerRpc({
  id: "560bf64a863cbd8cd6b5531a42029c43ed906bfb77fd28e0dc1fdb5b89cd53e5",
  name: "listCallbacks",
  filename: "src/lib/calls.functions.ts"
}, (opts) => listCallbacks.__executeServer(opts));
const listCallbacks = createServerFn({
  method: "GET"
}).handler(listCallbacks_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    callbacks: []
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("call_callbacks").select("*").eq("status", "pending").order("scheduled_at", {
    ascending: true
  }).limit(500);
  return {
    callbacks: data ?? []
  };
});
const completeCallback_createServerFn_handler = createServerRpc({
  id: "e50779576e31bc4f3b51972f15a3b4f562c03487d5fad48da4dfaa1399c0710c",
  name: "completeCallback",
  filename: "src/lib/calls.functions.ts"
}, (opts) => completeCallback.__executeServer(opts));
const completeCallback = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["done", "canceled"]).optional()
}).parse(d)).handler(completeCallback_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(ANY_ROLE);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    error
  } = await db.from("call_callbacks").update({
    status: data.status ?? "done"
  }).eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const listDialCampaigns_createServerFn_handler = createServerRpc({
  id: "9512807060990a885c1149e0e40f5adaebf01a7887a18006efacdfdee00d891d",
  name: "listDialCampaigns",
  filename: "src/lib/calls.functions.ts"
}, (opts) => listDialCampaigns.__executeServer(opts));
const listDialCampaigns = createServerFn({
  method: "GET"
}).handler(listDialCampaigns_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    campaigns: []
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("dial_campaigns").select("*").order("created_at", {
    ascending: false
  }).limit(200);
  return {
    campaigns: data ?? []
  };
});
const campaignSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(200),
  source_type: enumType(["stage", "filter", "manual", "callbacks"]),
  criteria: recordType(stringType(), unknownType()).optional(),
  active: booleanType().optional(),
  // For manual campaigns: the members to (re)set.
  members: arrayType(objectType({
    lead_id: stringType().uuid().nullable().optional(),
    phone_number: stringType().min(1).max(60)
  })).max(5e3).optional()
});
const saveDialCampaign_createServerFn_handler = createServerRpc({
  id: "151d2799439b6ae93ab9a47ee982f29e75feccb9965783a29f60105bc34369ca",
  name: "saveDialCampaign",
  filename: "src/lib/calls.functions.ts"
}, (opts) => saveDialCampaign.__executeServer(opts));
const saveDialCampaign = createServerFn({
  method: "POST"
}).inputValidator((d) => campaignSchema.parse(d)).handler(saveDialCampaign_createServerFn_handler, async ({
  data
}) => {
  let me;
  try {
    me = await guard(CALL_CAMPAIGN_ROLES);
  } catch (e) {
    return {
      ok: false,
      error: e.message,
      id: null
    };
  }
  const db = await scopedDb();
  const {
    id,
    members,
    ...rest
  } = data;
  const row = {
    name: rest.name,
    source_type: rest.source_type,
    criteria: rest.criteria ?? {}
  };
  if (rest.active !== void 0) row.active = rest.active;
  let campaignId = id ?? null;
  if (id) {
    const {
      error
    } = await db.from("dial_campaigns").update(row).eq("id", id);
    if (error) return {
      ok: false,
      error: error.message,
      id: null
    };
  } else {
    const {
      data: inserted,
      error
    } = await db.from("dial_campaigns").insert({
      ...row,
      created_by: me.userId
    }).select("id").maybeSingle();
    if (error) return {
      ok: false,
      error: error.message,
      id: null
    };
    campaignId = inserted?.id ?? null;
  }
  if (campaignId && data.source_type === "manual" && members) {
    await db.from("dial_campaign_members").delete().eq("campaign_id", campaignId);
    if (members.length) {
      const rows = members.map((m, i) => ({
        campaign_id: campaignId,
        lead_id: m.lead_id ?? null,
        phone_number: m.phone_number,
        position: i
      }));
      await db.from("dial_campaign_members").insert(rows);
    }
  }
  return {
    ok: true,
    error: null,
    id: campaignId
  };
});
const deleteDialCampaign_createServerFn_handler = createServerRpc({
  id: "cae24ae13cf900c489434963e29055a95a2f60a30b9b3539f702f5a84a9c43b6",
  name: "deleteDialCampaign",
  filename: "src/lib/calls.functions.ts"
}, (opts) => deleteDialCampaign.__executeServer(opts));
const deleteDialCampaign = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteDialCampaign_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(CALL_CAMPAIGN_ROLES);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  await db.from("dial_campaign_members").delete().eq("campaign_id", data.id);
  const {
    error
  } = await db.from("dial_campaigns").delete().eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
function stagesForColumn(columnId) {
  return PIPELINE_COLUMNS.find((c) => c.id === columnId)?.stages ?? [];
}
const getDialQueue_createServerFn_handler = createServerRpc({
  id: "b451d9a310b3253a27530f6a912668e1efd903735a5262c1b5da76277d66f334",
  name: "getDialQueue",
  filename: "src/lib/calls.functions.ts"
}, (opts) => getDialQueue.__executeServer(opts));
const getDialQueue = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  campaignId: stringType().uuid()
}).parse(d)).handler(getDialQueue_createServerFn_handler, async ({
  data
}) => {
  if (!await isAuthed()) return {
    queue: [],
    error: "Unauthorized"
  };
  const db = await scopedDb();
  const {
    data: campaign
  } = await db.from("dial_campaigns").select("*").eq("id", data.campaignId).maybeSingle();
  const c = campaign;
  if (!c) return {
    queue: [],
    error: "Campaign not found"
  };
  if (c.source_type === "manual") {
    const {
      data: members
    } = await db.from("dial_campaign_members").select("lead_id, phone_number").eq("campaign_id", data.campaignId).order("position", {
      ascending: true
    });
    const rows2 = members ?? [];
    const phones = rows2.map((r) => r.phone_number);
    const nameMap = /* @__PURE__ */ new Map();
    if (phones.length) {
      const {
        data: leads2
      } = await db.from("leads").select("phone_number, lead_name").in("phone_number", phones);
      for (const l of leads2 ?? []) {
        nameMap.set(l.phone_number, l.lead_name);
      }
    }
    return {
      queue: rows2.map((r) => ({
        lead_id: r.lead_id,
        phone_number: r.phone_number,
        lead_name: nameMap.get(r.phone_number) ?? null
      })),
      error: null
    };
  }
  if (c.source_type === "callbacks") {
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const {
      data: cbs
    } = await db.from("call_callbacks").select("lead_id, phone_number").eq("status", "pending").lte("scheduled_at", nowIso).order("scheduled_at", {
      ascending: true
    }).limit(1e3);
    const rows2 = cbs ?? [];
    const phones = rows2.map((r) => r.phone_number);
    const nameMap = /* @__PURE__ */ new Map();
    if (phones.length) {
      const {
        data: leads2
      } = await db.from("leads").select("phone_number, lead_name").in("phone_number", phones);
      for (const l of leads2 ?? []) {
        nameMap.set(l.phone_number, l.lead_name);
      }
    }
    return {
      queue: rows2.map((r) => ({
        lead_id: r.lead_id,
        phone_number: r.phone_number,
        lead_name: nameMap.get(r.phone_number) ?? null
      })),
      error: null
    };
  }
  const criteria = c.criteria ?? {};
  const explicitStage = typeof criteria.stage === "string" ? criteria.stage : null;
  const columnId = typeof criteria.column === "string" ? criteria.column : null;
  let stages = [];
  if (explicitStage) stages = [explicitStage];
  else if (columnId && columnId !== "all") stages = stagesForColumn(columnId);
  let query = db.from("leads").select("id, phone_number, lead_name, qualification_status").order("updated_at", {
    ascending: false
  }).limit(1e3);
  if (stages.length) query = query.in("qualification_status", stages);
  const {
    data: leads
  } = await query;
  const rows = leads ?? [];
  return {
    queue: rows.map((l) => ({
      lead_id: l.id,
      phone_number: l.phone_number,
      lead_name: l.lead_name,
      stage: l.qualification_status
    })),
    error: null
  };
});
const searchDialContacts_createServerFn_handler = createServerRpc({
  id: "1dbdb8a6d4237e2084fd6628fcfdf07fce535a0e98aa344f32c319e4008ddd6b",
  name: "searchDialContacts",
  filename: "src/lib/calls.functions.ts"
}, (opts) => searchDialContacts.__executeServer(opts));
const searchDialContacts = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  query: stringType().max(200).optional()
}).parse(d ?? {})).handler(searchDialContacts_createServerFn_handler, async ({
  data
}) => {
  if (!await isAuthed()) return {
    contacts: []
  };
  const db = await scopedDb();
  const q = (data.query ?? "").trim();
  let query = db.from("leads").select("id, phone_number, lead_name, course_interest, country_interest, qualification_status");
  if (q) {
    query = query.or(`lead_name.ilike.%${q}%,phone_number.ilike.%${q}%`);
  }
  const {
    data: leads
  } = await query.order("updated_at", {
    ascending: false
  }).limit(50);
  return {
    contacts: leads ?? []
  };
});
const listSpaceAgents_createServerFn_handler = createServerRpc({
  id: "45267149e0cd688d5407f5e514733fde814645ac8754f46f47b109826842d319",
  name: "listSpaceAgents",
  filename: "src/lib/calls.functions.ts"
}, (opts) => listSpaceAgents.__executeServer(opts));
const listSpaceAgents = createServerFn({
  method: "GET"
}).handler(listSpaceAgents_createServerFn_handler, async () => {
  try {
    await guard(["super_admin"]);
  } catch {
    return {
      agents: []
    };
  }
  const db = await scopedDb();
  const [{
    data: profiles
  }, {
    data: roles
  }] = await Promise.all([db.from("profiles").select("user_id, email, full_name").order("full_name", {
    ascending: true
  }), db.from("user_roles").select("user_id, role")]);
  const roleMap = /* @__PURE__ */ new Map();
  for (const r of roles ?? []) roleMap.set(r.user_id, r.role);
  const agents = (profiles ?? []).map((p) => ({
    user_id: p.user_id,
    full_name: p.full_name,
    email: p.email,
    role: roleMap.get(p.user_id) ?? null
  }));
  return {
    agents
  };
});
const listRingGroups_createServerFn_handler = createServerRpc({
  id: "aecdb3a5a8a7c7efbc47721add99adf014cc1f7734d33bcd0e118e4fa6775e61",
  name: "listRingGroups",
  filename: "src/lib/calls.functions.ts"
}, (opts) => listRingGroups.__executeServer(opts));
const listRingGroups = createServerFn({
  method: "GET"
}).handler(listRingGroups_createServerFn_handler, async () => {
  try {
    await guard(["super_admin"]);
  } catch {
    return {
      groups: []
    };
  }
  const db = await scopedDb();
  const {
    data: groups
  } = await db.from("ring_groups").select("*").order("created_at", {
    ascending: false
  }).limit(200);
  const rows = groups ?? [];
  const {
    data: members
  } = await db.from("ring_group_members").select("ring_group_id, user_id, position").order("position", {
    ascending: true
  });
  const memberMap = /* @__PURE__ */ new Map();
  for (const m of members ?? []) {
    memberMap.set(m.ring_group_id, [...memberMap.get(m.ring_group_id) ?? [], m.user_id]);
  }
  return {
    groups: rows.map((g) => ({
      id: g.id,
      name: g.name,
      ring_seconds: g.ring_seconds,
      active: g.active,
      member_ids: memberMap.get(g.id) ?? []
    }))
  };
});
const ringGroupSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(200),
  ring_seconds: numberType().int().min(5).max(120).optional(),
  active: booleanType().optional(),
  member_ids: arrayType(stringType().uuid()).max(50).optional()
});
const saveRingGroup_createServerFn_handler = createServerRpc({
  id: "fbc23770a8f8afc5871df4155273041ecf595e1276788a4ee8818548276f3a7e",
  name: "saveRingGroup",
  filename: "src/lib/calls.functions.ts"
}, (opts) => saveRingGroup.__executeServer(opts));
const saveRingGroup = createServerFn({
  method: "POST"
}).inputValidator((d) => ringGroupSchema.parse(d)).handler(saveRingGroup_createServerFn_handler, async ({
  data
}) => {
  let me;
  try {
    me = await guard(["super_admin"]);
  } catch (e) {
    return {
      ok: false,
      error: e.message,
      id: null
    };
  }
  const db = await scopedDb();
  const {
    id,
    member_ids,
    ...rest
  } = data;
  const row = {
    name: rest.name
  };
  if (rest.ring_seconds !== void 0) row.ring_seconds = rest.ring_seconds;
  if (rest.active !== void 0) row.active = rest.active;
  let groupId = id ?? null;
  if (id) {
    const {
      error
    } = await db.from("ring_groups").update(row).eq("id", id);
    if (error) return {
      ok: false,
      error: error.message,
      id: null
    };
  } else {
    const {
      data: inserted,
      error
    } = await db.from("ring_groups").insert({
      ...row,
      created_by: me.userId
    }).select("id").maybeSingle();
    if (error) return {
      ok: false,
      error: error.message,
      id: null
    };
    groupId = inserted?.id ?? null;
  }
  if (groupId && member_ids) {
    await db.from("ring_group_members").delete().eq("ring_group_id", groupId);
    if (member_ids.length) {
      const rows = member_ids.map((uid, i) => ({
        ring_group_id: groupId,
        user_id: uid,
        position: i
      }));
      await db.from("ring_group_members").insert(rows);
    }
  }
  return {
    ok: true,
    error: null,
    id: groupId
  };
});
const deleteRingGroup_createServerFn_handler = createServerRpc({
  id: "3429ef1809e40da5b2765ce7321f0f8c0bd4480c84d52df3a7704240989c480f",
  name: "deleteRingGroup",
  filename: "src/lib/calls.functions.ts"
}, (opts) => deleteRingGroup.__executeServer(opts));
const deleteRingGroup = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteRingGroup_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(["super_admin"]);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  await db.from("ring_group_members").delete().eq("ring_group_id", data.id);
  await db.from("inbound_routes").update({
    ring_group_id: null
  }).eq("ring_group_id", data.id);
  const {
    error
  } = await db.from("ring_groups").delete().eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const listInboundRoutes_createServerFn_handler = createServerRpc({
  id: "8d09d91d64c2cae32ca5c0a11dbb00c5071882202f78582bb53815a16ed0c698",
  name: "listInboundRoutes",
  filename: "src/lib/calls.functions.ts"
}, (opts) => listInboundRoutes.__executeServer(opts));
const listInboundRoutes = createServerFn({
  method: "GET"
}).handler(listInboundRoutes_createServerFn_handler, async () => {
  try {
    await guard(["super_admin"]);
  } catch {
    return {
      routes: []
    };
  }
  const db = await scopedDb();
  const {
    data
  } = await db.from("inbound_routes").select("*").order("created_at", {
    ascending: false
  }).limit(200);
  const rows = data ?? [];
  return {
    routes: rows.map((r) => ({
      id: r.id,
      did: r.did,
      ring_group_id: r.ring_group_id ?? null,
      no_answer_action: r.no_answer_action,
      active: r.active
    }))
  };
});
const inboundRouteSchema = objectType({
  id: stringType().uuid().optional(),
  did: stringType().min(3).max(60),
  ring_group_id: stringType().uuid().nullable().optional(),
  no_answer_action: enumType(["hangup", "voicemail"]).optional(),
  active: booleanType().optional()
});
const saveInboundRoute_createServerFn_handler = createServerRpc({
  id: "d6bba8bf2ff4c4c4ce4be456d16903a034e17424789545613276745cf9416ecd",
  name: "saveInboundRoute",
  filename: "src/lib/calls.functions.ts"
}, (opts) => saveInboundRoute.__executeServer(opts));
const saveInboundRoute = createServerFn({
  method: "POST"
}).inputValidator((d) => inboundRouteSchema.parse(d)).handler(saveInboundRoute_createServerFn_handler, async ({
  data
}) => {
  let me;
  try {
    me = await guard(["super_admin"]);
  } catch (e) {
    return {
      ok: false,
      error: e.message,
      id: null
    };
  }
  const db = await scopedDb();
  const {
    id,
    ...rest
  } = data;
  const row = {
    did: rest.did.replace(/[\s\-().]/g, ""),
    ring_group_id: rest.ring_group_id ?? null
  };
  if (rest.no_answer_action !== void 0) row.no_answer_action = rest.no_answer_action;
  if (rest.active !== void 0) row.active = rest.active;
  if (id) {
    const {
      error: error2
    } = await db.from("inbound_routes").update(row).eq("id", id);
    return {
      ok: !error2,
      error: error2?.message ?? null,
      id
    };
  }
  const {
    data: inserted,
    error
  } = await db.from("inbound_routes").insert({
    ...row,
    created_by: me.userId
  }).select("id").maybeSingle();
  return {
    ok: !error,
    error: error?.message ?? null,
    id: inserted?.id ?? null
  };
});
const deleteInboundRoute_createServerFn_handler = createServerRpc({
  id: "11fc11bca3071e8facf27c51f7dd5dfe326353ee39ceb5b8e190f33464c9556a",
  name: "deleteInboundRoute",
  filename: "src/lib/calls.functions.ts"
}, (opts) => deleteInboundRoute.__executeServer(opts));
const deleteInboundRoute = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteInboundRoute_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(["super_admin"]);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    error
  } = await db.from("inbound_routes").delete().eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
export {
  completeCallback_createServerFn_handler,
  deleteDialCampaign_createServerFn_handler,
  deleteInboundRoute_createServerFn_handler,
  deleteRingGroup_createServerFn_handler,
  getDialQueue_createServerFn_handler,
  getVoipClientConfig_createServerFn_handler,
  getVoipSettings_createServerFn_handler,
  listCallbacks_createServerFn_handler,
  listCalls_createServerFn_handler,
  listDialCampaigns_createServerFn_handler,
  listInboundRoutes_createServerFn_handler,
  listRingGroups_createServerFn_handler,
  listSpaceAgents_createServerFn_handler,
  logCall_createServerFn_handler,
  saveDialCampaign_createServerFn_handler,
  saveInboundRoute_createServerFn_handler,
  saveRingGroup_createServerFn_handler,
  saveVoipSettings_createServerFn_handler,
  scheduleCallback_createServerFn_handler,
  searchDialContacts_createServerFn_handler,
  updateCallNotes_createServerFn_handler
};
