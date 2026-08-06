import { c as createServerRpc } from "./createServerRpc-Baarst8k.mjs";
import { A as ALL_ROLES } from "./roles-vB9M4HoO.mjs";
import { c as createServerFn } from "./server-BpMAhPfL.mjs";

import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, b as booleanType, n as numberType, e as enumType, c as coerce, a as arrayType, r as recordType, d as anyType } from "../_libs/zod.mjs";

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
async function activeSpaceId() {
  const ctx = await spaceCtx();
  if (!ctx) return null;
  if (ctx.status === "suspended" && !ctx.isSuperAdmin) return null;
  return ctx.spaceId;
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
const ANY_ROLE = ALL_ROLES;
const listLeads_createServerFn_handler = createServerRpc({
  id: "f0e93a0b7066b7c79999a92f026934cfc6656b011cf6524a61d5aa02251d0632",
  name: "listLeads",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listLeads.__executeServer(opts));
const listLeads = createServerFn({
  method: "GET"
}).handler(listLeads_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    leads: [],
    error: "Unauthorized"
  };
  const db = await scopedDb();
  const {
    data,
    error
  } = await db.from("leads").select("*").order("updated_at", {
    ascending: false
  }).limit(1e3);
  if (error) return {
    leads: [],
    error: error.message
  };
  return {
    leads: data ?? [],
    error: null
  };
});
const updateLeadStage_createServerFn_handler = createServerRpc({
  id: "825baabcd2e01f1299a63f2a8983d830cafb53e43441866f672e50d3e6f84c72",
  name: "updateLeadStage",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => updateLeadStage.__executeServer(opts));
const updateLeadStage = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid(),
  stage: stringType().min(1)
}).parse(d)).handler(updateLeadStage_createServerFn_handler, async ({
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
  } = await db.from("leads").update({
    qualification_status: data.stage
  }).eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const toggleHumanTakeover_createServerFn_handler = createServerRpc({
  id: "865375d9ccafee3d1229b082d70de486e66adb59e64b84339c9fba1aee4ad269",
  name: "toggleHumanTakeover",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => toggleHumanTakeover.__executeServer(opts));
const toggleHumanTakeover = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: stringType().min(1),
  enabled: booleanType()
}).parse(d)).handler(toggleHumanTakeover_createServerFn_handler, async ({
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
  } = await db.from("conversations").update({
    human_takeover: data.enabled,
    status: data.enabled ? "pending" : "open",
    assigned_agent: data.enabled ? "Admissions Team" : null,
    // When AI is switched back on (enabled=false), mark the conversation
    // as resumed so the AI replies again even after the booking stop.
    ai_resumed: !data.enabled
  }).eq("phone_number", data.phone);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const deleteLead_createServerFn_handler = createServerRpc({
  id: "51393a7c454620868fb50a10e9147854d1cfc9cc0cb94e14dbc0b8d4db4791e9",
  name: "deleteLead",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => deleteLead.__executeServer(opts));
const deleteLead = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteLead_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(["super_admin", "admin"]);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    data: lead
  } = await db.from("leads").select("phone_number").eq("id", data.id).maybeSingle();
  const phone = lead?.phone_number;
  if (!phone) return {
    ok: false,
    error: "Lead not found"
  };
  await Promise.all([db.from("conversations").delete().eq("phone_number", phone), db.from("whatsapp_messages").delete().eq("phone_number", phone), db.from("appointments").delete().eq("phone_number", phone), db.from("scheduled_messages").delete().eq("phone_number", phone)]);
  const {
    error
  } = await db.from("leads").delete().eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
function phoneCandidates(phone) {
  const raw = phone.trim();
  const digits = raw.replace(/\D/g, "");
  return Array.from(new Set([raw, digits, digits ? `+${digits}` : "", digits.startsWith("00") ? `+${digits.slice(2)}` : ""].filter(Boolean)));
}
function mergeThread(threads, phone, patch) {
  const existing = threads.get(phone) ?? {
    phone_number: phone,
    lead_name: null,
    human_takeover: null,
    status: null,
    conversation_updated_at: null,
    last_message_content: null,
    last_message_at: null,
    last_sender: null,
    match_message_content: null,
    match_message_at: null,
    match_sender: null
  };
  threads.set(phone, {
    ...existing,
    ...patch
  });
}
const listConversations_createServerFn_handler = createServerRpc({
  id: "2b4d2e59f3254b842a76a501b6da5ab7b8c16005a79e1d77989c2d30835a8f35",
  name: "listConversations",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listConversations.__executeServer(opts));
const listConversations = createServerFn({
  method: "GET"
}).handler(listConversations_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    conversations: []
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("conversations").select("*").order("updated_at", {
    ascending: false
  }).limit(1e3);
  return {
    conversations: data ?? []
  };
});
const listMessages_createServerFn_handler = createServerRpc({
  id: "23974f2d0c70549522eb1ebb0e91a21c4d86f65ecc631f4a20385cf0d7471122",
  name: "listMessages",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listMessages.__executeServer(opts));
const listMessages = createServerFn({
  method: "GET"
}).handler(listMessages_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    messages: []
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("whatsapp_messages").select("*").order("received_at", {
    ascending: true
  }).limit(1e3);
  return {
    messages: data ?? []
  };
});
const listMessageThreads_createServerFn_handler = createServerRpc({
  id: "9a62019c9c28a0c86cc6481d2e1748e8ebcc47d59266e272f978e7b3a6f40c09",
  name: "listMessageThreads",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listMessageThreads.__executeServer(opts));
const listMessageThreads = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  search: stringType().max(200).optional(),
  limit: numberType().int().min(10).max(50).optional(),
  offset: numberType().int().min(0).max(1e4).optional()
}).parse(d ?? {})).handler(listMessageThreads_createServerFn_handler, async ({
  data
}) => {
  if (!await isAuthed()) return {
    threads: [],
    hasMore: false
  };
  const db = await scopedDb();
  const search = (data.search ?? "").trim();
  const limit = data.limit ?? 30;
  const offset = data.offset ?? 0;
  const needed = offset + limit + 1;
  const threads = /* @__PURE__ */ new Map();
  if (search) {
    let start = 0;
    while (threads.size < needed && start < 1e4) {
      const {
        data: matches
      } = await db.from("whatsapp_messages").select("id, phone_number, message_content, sender, received_at").ilike("message_content", `%${search}%`).order("received_at", {
        ascending: false
      }).range(start, start + 999);
      const rows = matches ?? [];
      for (const msg of rows) {
        const existing = threads.get(msg.phone_number);
        if (!existing) {
          mergeThread(threads, msg.phone_number, {
            last_message_content: msg.message_content,
            last_message_at: msg.received_at,
            last_sender: msg.sender,
            match_message_content: msg.message_content,
            match_message_at: msg.received_at,
            match_sender: msg.sender
          });
        } else if (msg.sender === "lead" && existing.match_sender !== "lead") {
          mergeThread(threads, msg.phone_number, {
            match_message_content: msg.message_content,
            match_message_at: msg.received_at,
            match_sender: "lead"
          });
        }
      }
      if (rows.length < 1e3) break;
      start += 1e3;
    }
    const [{
      data: phoneLeads
    }, {
      data: nameLeads
    }, {
      data: phoneConvs
    }] = await Promise.all([db.from("leads").select("phone_number, lead_name").ilike("phone_number", `%${search}%`).limit(200), db.from("leads").select("phone_number, lead_name").ilike("lead_name", `%${search}%`).limit(200), db.from("conversations").select("phone_number, human_takeover, status, updated_at").ilike("phone_number", `%${search}%`).limit(200)]);
    for (const lead of [...phoneLeads ?? [], ...nameLeads ?? []]) {
      mergeThread(threads, lead.phone_number, {
        lead_name: lead.lead_name ?? null
      });
    }
    for (const conv of phoneConvs ?? []) {
      mergeThread(threads, conv.phone_number, {
        human_takeover: conv.human_takeover,
        status: conv.status,
        conversation_updated_at: conv.updated_at ?? null
      });
    }
  } else {
    let start = 0;
    while (threads.size < needed && start < 2e4) {
      const {
        data: recent
      } = await db.from("whatsapp_messages").select("id, phone_number, message_content, sender, received_at").order("received_at", {
        ascending: false
      }).range(start, start + 999);
      const rows = recent ?? [];
      for (const msg of rows) {
        if (!threads.has(msg.phone_number)) {
          mergeThread(threads, msg.phone_number, {
            last_message_content: msg.message_content,
            last_message_at: msg.received_at,
            last_sender: msg.sender,
            match_message_content: null,
            match_message_at: null
          });
        }
      }
      if (rows.length < 1e3) break;
      start += 1e3;
    }
    const {
      data: convs
    } = await db.from("conversations").select("phone_number, human_takeover, status, updated_at").order("updated_at", {
      ascending: false
    }).limit(needed + 200);
    for (const conv of convs ?? []) {
      mergeThread(threads, conv.phone_number, {
        human_takeover: conv.human_takeover,
        status: conv.status,
        conversation_updated_at: conv.updated_at ?? null
      });
    }
  }
  const phones = Array.from(threads.keys());
  if (phones.length) {
    const [{
      data: convRows
    }, {
      data: leadRows
    }] = await Promise.all([db.from("conversations").select("phone_number, human_takeover, status, updated_at").in("phone_number", phones), db.from("leads").select("phone_number, lead_name").in("phone_number", phones)]);
    for (const conv of convRows ?? []) {
      mergeThread(threads, conv.phone_number, {
        human_takeover: conv.human_takeover,
        status: conv.status,
        conversation_updated_at: conv.updated_at ?? null
      });
    }
    for (const lead of leadRows ?? []) {
      mergeThread(threads, lead.phone_number, {
        lead_name: lead.lead_name ?? null
      });
    }
    const missingLatest = phones.filter((phone) => !threads.get(phone)?.last_message_at);
    await Promise.all(missingLatest.map(async (phone) => {
      const {
        data: latest
      } = await db.from("whatsapp_messages").select("id, phone_number, message_content, sender, received_at").eq("phone_number", phone).order("received_at", {
        ascending: false
      }).limit(1).maybeSingle();
      const msg = latest;
      if (msg) {
        mergeThread(threads, phone, {
          last_message_content: msg.message_content,
          last_message_at: msg.received_at,
          last_sender: msg.sender
        });
      }
    }));
  }
  const ordered = Array.from(threads.values()).sort((a, b) => {
    const aTime = String(a.last_message_at ?? a.match_message_at ?? a.conversation_updated_at ?? "");
    const bTime = String(b.last_message_at ?? b.match_message_at ?? b.conversation_updated_at ?? "");
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });
  return {
    threads: ordered.slice(offset, offset + limit),
    hasMore: ordered.length > offset + limit
  };
});
const listConversationMessages_createServerFn_handler = createServerRpc({
  id: "02c8c501c1fac8aa0095749c2a480a9ec3cf94537cbf03922b721d8e661df9cd",
  name: "listConversationMessages",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listConversationMessages.__executeServer(opts));
const listConversationMessages = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: stringType().min(1).max(60),
  limit: numberType().int().min(1).max(1e3).optional()
}).parse(d)).handler(listConversationMessages_createServerFn_handler, async ({
  data
}) => {
  if (!await isAuthed()) return {
    phone: data.phone,
    messages: [],
    conversation: null
  };
  const db = await scopedDb();
  const candidates = phoneCandidates(data.phone);
  const {
    data: conv
  } = await db.from("conversations").select("phone_number, human_takeover, status, updated_at, workspace_id").in("phone_number", candidates).order("updated_at", {
    ascending: false
  }).limit(1).maybeSingle();
  const canonicalPhone = conv?.phone_number ?? data.phone;
  const messagePhones = Array.from(/* @__PURE__ */ new Set([canonicalPhone, ...candidates]));
  const {
    data: rows
  } = await db.from("whatsapp_messages").select("*").in("phone_number", messagePhones).order("received_at", {
    ascending: false
  }).limit(data.limit ?? 1e3);
  const messages = (rows ?? []).reverse();
  return {
    phone: messages.at(-1)?.phone_number ?? canonicalPhone,
    messages,
    conversation: conv ?? null
  };
});
const listAppointments_createServerFn_handler = createServerRpc({
  id: "564a4016049afdf95c3c424566a3feca0914abd1ac919b34b25c47f7d12b4189",
  name: "listAppointments",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listAppointments.__executeServer(opts));
const listAppointments = createServerFn({
  method: "GET"
}).handler(listAppointments_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    appointments: []
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("appointments").select("*").order("created_at", {
    ascending: false
  }).limit(1e3);
  return {
    appointments: data ?? []
  };
});
const updateAppointmentStatus_createServerFn_handler = createServerRpc({
  id: "197a0c862f5e9927f094c52fdb720aa9f4763d423fc2d5ba6d5c7f440ec09f8f",
  name: "updateAppointmentStatus",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => updateAppointmentStatus.__executeServer(opts));
const updateAppointmentStatus = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["pending", "confirmed", "completed", "cancelled"]),
  appointment_date: stringType().nullable().optional()
}).parse(d)).handler(updateAppointmentStatus_createServerFn_handler, async ({
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
  const update = {
    status: data.status
  };
  if (data.appointment_date !== void 0) update.appointment_date = data.appointment_date;
  const {
    error
  } = await db.from("appointments").update(update).eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const getSettings_createServerFn_handler = createServerRpc({
  id: "7180026c600c721a62b1ac583b5fea60a9a24b9cef2c2e9d29b375367c760773",
  name: "getSettings",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => getSettings.__executeServer(opts));
const getSettings = createServerFn({
  method: "GET"
}).handler(getSettings_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    settings: null
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("education_settings").select("*").limit(1).maybeSingle();
  return {
    settings: data ?? null
  };
});
const settingsSchema = objectType({
  id: stringType().uuid().optional(),
  company_name: stringType().max(200).optional(),
  company_phone: stringType().max(60).nullable().optional(),
  company_email: stringType().max(200).nullable().optional(),
  office_address: stringType().max(500).nullable().optional(),
  working_hours: stringType().max(200).nullable().optional(),
  active_destinations: stringType().max(2e3).nullable().optional(),
  active_programs: stringType().max(2e3).nullable().optional(),
  scholarship_information: stringType().max(4e3).nullable().optional(),
  whatsapp_webhook_url: stringType().max(500).nullable().optional(),
  chatwoot_url: stringType().max(500).nullable().optional(),
  chatwoot_account_id: stringType().max(100).nullable().optional(),
  chatwoot_inbox_id: stringType().max(100).nullable().optional(),
  chatwoot_api_token: stringType().max(500).nullable().optional(),
  // White-label branding (per-space)
  brand_name: stringType().max(120).nullable().optional(),
  brand_tagline: stringType().max(300).nullable().optional(),
  logo_light_url: stringType().max(3e6).nullable().optional(),
  logo_dark_url: stringType().max(3e6).nullable().optional(),
  logo_scale: coerce.number().int().min(50).max(300).nullable().optional()
});
const CHATWOOT_FIELDS = ["chatwoot_url", "chatwoot_account_id", "chatwoot_inbox_id", "chatwoot_api_token"];
const updateSettings_createServerFn_handler = createServerRpc({
  id: "7360a65b44b390ce454157541ae48f1b17feecce8fdb6b9e8a5af44cfc399626",
  name: "updateSettings",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => updateSettings.__executeServer(opts));
const updateSettings = createServerFn({
  method: "POST"
}).inputValidator((d) => settingsSchema.parse(d)).handler(updateSettings_createServerFn_handler, async ({
  data
}) => {
  let me;
  try {
    me = await guard(["super_admin", "admin"]);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const {
    id,
    ...rest
  } = data;
  if (me.role !== "super_admin") {
    for (const f of CHATWOOT_FIELDS) delete rest[f];
  }
  const db = await scopedDb();
  if (id) {
    const {
      error: error2
    } = await db.from("education_settings").update(rest).eq("id", id);
    return {
      ok: !error2,
      error: error2?.message ?? null
    };
  }
  const {
    error
  } = await db.from("education_settings").insert(rest);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const getAiConfig_createServerFn_handler = createServerRpc({
  id: "13e4dc2eebece3ebba74f145e6a44ddafa474f649ded3187578efe489127a756",
  name: "getAiConfig",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => getAiConfig.__executeServer(opts));
const getAiConfig = createServerFn({
  method: "GET"
}).handler(getAiConfig_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    config: null
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("ai_configuration").select("*").order("updated_at", {
    ascending: false
  }).limit(1).maybeSingle();
  return {
    config: data ?? null
  };
});
const saveAiConfig_createServerFn_handler = createServerRpc({
  id: "24e1c1463017b740a61277061d0e4df5d075a8ee0a304ff4467d4470e1c44f08",
  name: "saveAiConfig",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => saveAiConfig.__executeServer(opts));
const saveAiConfig = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  system_prompt: stringType().max(5e4),
  model: stringType().min(1).max(100),
  temperature: numberType().min(0).max(2)
}).parse(d)).handler(saveAiConfig_createServerFn_handler, async ({
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
  if (id) {
    await db.from("ai_configuration").update(rest).eq("id", id);
  } else {
    await db.from("ai_configuration").insert(rest);
  }
  const {
    data: versions
  } = await db.from("prompt_versions").select("version_number").order("version_number", {
    ascending: false
  }).limit(1);
  const nextVersion = (versions?.[0]?.version_number ?? 0) + 1;
  await db.from("prompt_versions").insert({
    version_number: nextVersion,
    system_prompt: data.system_prompt,
    created_by: "admin"
  });
  return {
    ok: true,
    version: nextVersion
  };
});
const saveAiProvider_createServerFn_handler = createServerRpc({
  id: "b62418704bebf2a3b1fc360ceed67e8c40d309e6b75692cdf9c950157b72a0ad",
  name: "saveAiProvider",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => saveAiProvider.__executeServer(opts));
const saveAiProvider = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  provider_mode: enumType(["built_in", "custom"]),
  custom_provider: stringType().max(100).nullable().optional(),
  custom_base_url: stringType().max(500).nullable().optional(),
  custom_model: stringType().max(200).nullable().optional(),
  custom_api_key: stringType().max(500).nullable().optional()
}).parse(d)).handler(saveAiProvider_createServerFn_handler, async ({
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
  if (rest.custom_api_key === "" || rest.custom_api_key === void 0) {
    delete rest.custom_api_key;
  }
  if (id) {
    const {
      error: error2
    } = await db.from("ai_configuration").update(rest).eq("id", id);
    return {
      ok: !error2,
      error: error2?.message ?? null
    };
  }
  const {
    error
  } = await db.from("ai_configuration").insert(rest);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const testAiProvider_createServerFn_handler = createServerRpc({
  id: "0541c2b8a4d13a7e9ba6f76aacb1657b1dec2aec167ffddd6ebb4533447b833d",
  name: "testAiProvider",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => testAiProvider.__executeServer(opts));
const testAiProvider = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  provider_mode: enumType(["built_in", "custom"]),
  custom_provider: stringType().max(100).nullable().optional(),
  custom_base_url: stringType().max(500).nullable().optional(),
  custom_model: stringType().max(200).nullable().optional(),
  custom_api_key: stringType().max(500).nullable().optional()
}).parse(d)).handler(testAiProvider_createServerFn_handler, async ({
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
  if (data.provider_mode === "built_in") {
    return {
      ok: false,
      error: "Built-in AI is no longer available. Configure your own provider and API key."
    };
  }
  let apiKey = (data.custom_api_key ?? "").trim();
  const baseUrl = (data.custom_base_url ?? "").trim();
  const model = (data.custom_model ?? "").trim();
  const provider = (data.custom_provider ?? "").toLowerCase();
  if (!apiKey) {
    const db = await scopedDb();
    const {
      data: cfg
    } = await db.from("ai_configuration").select("custom_api_key").order("updated_at", {
      ascending: false
    }).limit(1).maybeSingle();
    apiKey = String(cfg?.custom_api_key ?? "").trim();
  }
  if (!apiKey) return {
    ok: false,
    error: "No API key provided or saved."
  };
  if (!model) return {
    ok: false,
    error: "Select a model first."
  };
  try {
    if (provider === "anthropic") {
      const url2 = (baseUrl.replace(/\/+$/, "") || "https://api.anthropic.com") + "/v1/messages";
      const res2 = await fetch(url2, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model,
          max_tokens: 8,
          messages: [{
            role: "user",
            content: "ping"
          }]
        })
      });
      if (!res2.ok) {
        const t = await res2.text().catch(() => "");
        return {
          ok: false,
          error: `Provider error ${res2.status}: ${t.slice(0, 200)}`
        };
      }
      return {
        ok: true,
        error: null
      };
    }
    if (!baseUrl) return {
      ok: false,
      error: "Base URL is required for this provider."
    };
    const url = baseUrl.replace(/\/+$/, "") + "/chat/completions";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        max_tokens: 8,
        messages: [{
          role: "user",
          content: "ping"
        }]
      })
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Provider error ${res.status}: ${t.slice(0, 200)}`
      };
    }
    return {
      ok: true,
      error: null
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Connection failed"
    };
  }
});
const listAiProviders_createServerFn_handler = createServerRpc({
  id: "eb9823de071ea6bb3e86a38ed7bdfc2f036aa8acbea52ebfa25a2701fc6201d4",
  name: "listAiProviders",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listAiProviders.__executeServer(opts));
const listAiProviders = createServerFn({
  method: "GET"
}).handler(listAiProviders_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    providers: [],
    fallbackEnabled: false
  };
  const db = await scopedDb();
  const [{
    data: pool
  }, {
    data: cfg
  }] = await Promise.all([db.from("ai_provider_pool").select("*").order("priority", {
    ascending: true
  }), db.from("ai_configuration").select("fallback_enabled").order("updated_at", {
    ascending: false
  }).limit(1).maybeSingle()]);
  const providers = (pool ?? []).map((p) => ({
    id: p.id,
    priority: Number(p.priority ?? 0),
    label: p.label ?? "",
    provider: p.provider ?? "openai",
    base_url: p.base_url ?? "",
    models: Array.isArray(p.models) ? p.models : [],
    enabled: Boolean(p.enabled),
    has_key: Boolean(p.api_key)
  }));
  return {
    providers,
    fallbackEnabled: Boolean(cfg?.fallback_enabled)
  };
});
const providerPoolSchema = objectType({
  id: stringType().uuid().optional(),
  label: stringType().max(120).optional(),
  provider: stringType().min(1).max(100),
  base_url: stringType().max(500).nullable().optional(),
  models: arrayType(stringType().min(1).max(200)).max(25),
  api_key: stringType().max(2e3).nullable().optional(),
  enabled: booleanType().optional(),
  priority: numberType().int().min(0).max(1e3).optional()
});
const saveAiProviderPool_createServerFn_handler = createServerRpc({
  id: "81a4541797d12907d7c89e5c66e19a2815ab943462bb25103102789e2a25e008",
  name: "saveAiProviderPool",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => saveAiProviderPool.__executeServer(opts));
const saveAiProviderPool = createServerFn({
  method: "POST"
}).inputValidator((d) => providerPoolSchema.parse(d)).handler(saveAiProviderPool_createServerFn_handler, async ({
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
  const row = {
    label: rest.label ?? "",
    provider: rest.provider,
    base_url: rest.base_url ?? null,
    models: rest.models ?? [],
    enabled: rest.enabled ?? true
  };
  if (rest.priority !== void 0) row.priority = rest.priority;
  if (rest.api_key && rest.api_key.trim()) row.api_key = rest.api_key.trim();
  if (id) {
    const {
      error: error2
    } = await db.from("ai_provider_pool").update(row).eq("id", id);
    return {
      ok: !error2,
      error: error2?.message ?? null
    };
  }
  if (row.priority === void 0) {
    const {
      data: last
    } = await db.from("ai_provider_pool").select("priority").order("priority", {
      ascending: false
    }).limit(1).maybeSingle();
    row.priority = (Number(last?.priority ?? -1) || 0) + 1;
  }
  const {
    error
  } = await db.from("ai_provider_pool").insert(row);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const deleteAiProvider_createServerFn_handler = createServerRpc({
  id: "32a1e2a372abf770d5b154b3c2160f8e5508f9f5a0def7a4c833c95dfae4c6ec",
  name: "deleteAiProvider",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => deleteAiProvider.__executeServer(opts));
const deleteAiProvider = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteAiProvider_createServerFn_handler, async ({
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
  } = await db.from("ai_provider_pool").delete().eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const reorderAiProviders_createServerFn_handler = createServerRpc({
  id: "e797e8175d224c32a4d8048c0f4eaf0aa8e336e098e43bbec29809e408c00479",
  name: "reorderAiProviders",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => reorderAiProviders.__executeServer(opts));
const reorderAiProviders = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  order: arrayType(stringType().uuid()).max(50)
}).parse(d)).handler(reorderAiProviders_createServerFn_handler, async ({
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
  await Promise.all(data.order.map((id, idx) => db.from("ai_provider_pool").update({
    priority: idx
  }).eq("id", id)));
  return {
    ok: true,
    error: null
  };
});
const setFallbackEnabled_createServerFn_handler = createServerRpc({
  id: "a57b02ab4b911d002e0fc4e5c23da5ace8c2ac6e932b67a8a4ebaa89e2f409df",
  name: "setFallbackEnabled",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => setFallbackEnabled.__executeServer(opts));
const setFallbackEnabled = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  enabled: booleanType()
}).parse(d)).handler(setFallbackEnabled_createServerFn_handler, async ({
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
    data: cfg
  } = await db.from("ai_configuration").select("id").order("updated_at", {
    ascending: false
  }).limit(1).maybeSingle();
  const id = cfg?.id;
  if (id) {
    const {
      error: error2
    } = await db.from("ai_configuration").update({
      fallback_enabled: data.enabled
    }).eq("id", id);
    return {
      ok: !error2,
      error: error2?.message ?? null
    };
  }
  const {
    error
  } = await db.from("ai_configuration").insert({
    fallback_enabled: data.enabled
  });
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const testAiProviderPool_createServerFn_handler = createServerRpc({
  id: "0ad581a4cea2ac1d973f1c42afaec63983782d7f6da130d464d4efce3538de0f",
  name: "testAiProviderPool",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => testAiProviderPool.__executeServer(opts));
const testAiProviderPool = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  provider: stringType().min(1).max(100),
  base_url: stringType().max(500).nullable().optional(),
  model: stringType().min(1).max(200),
  api_key: stringType().max(2e3).nullable().optional()
}).parse(d)).handler(testAiProviderPool_createServerFn_handler, async ({
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
  const provider = (data.provider ?? "").toLowerCase();
  const baseUrl = (data.base_url ?? "").trim();
  const model = (data.model ?? "").trim();
  let apiKey = (data.api_key ?? "").trim();
  if (provider === "built_in") {
    return {
      ok: false,
      error: "Built-in AI is no longer available. Configure your own provider and API key."
    };
  }
  if (!apiKey && data.id) {
    const db = await scopedDb();
    const {
      data: row
    } = await db.from("ai_provider_pool").select("api_key").eq("id", data.id).maybeSingle();
    apiKey = String(row?.api_key ?? "").trim();
  }
  if (!apiKey) return {
    ok: false,
    error: "No API key provided or saved."
  };
  if (!model) return {
    ok: false,
    error: "Add at least one model first."
  };
  try {
    if (provider === "anthropic") {
      const url2 = (baseUrl.replace(/\/+$/, "") || "https://api.anthropic.com") + "/v1/messages";
      const res2 = await fetch(url2, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model,
          max_tokens: 8,
          messages: [{
            role: "user",
            content: "ping"
          }]
        })
      });
      if (!res2.ok) {
        const t = await res2.text().catch(() => "");
        return {
          ok: false,
          error: `Provider error ${res2.status}: ${t.slice(0, 200)}`
        };
      }
      return {
        ok: true,
        error: null
      };
    }
    if (!baseUrl) return {
      ok: false,
      error: "Base URL is required for this provider."
    };
    const url = baseUrl.replace(/\/+$/, "") + "/chat/completions";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        max_tokens: 8,
        messages: [{
          role: "user",
          content: "ping"
        }]
      })
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Provider error ${res.status}: ${t.slice(0, 200)}`
      };
    }
    return {
      ok: true,
      error: null
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Connection failed"
    };
  }
});
const listPromptVersions_createServerFn_handler = createServerRpc({
  id: "52607a6cc61f168ef0d44392548f95e38774a4bff42ec75aea0a2d8e6bf8a8d1",
  name: "listPromptVersions",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listPromptVersions.__executeServer(opts));
const listPromptVersions = createServerFn({
  method: "GET"
}).handler(listPromptVersions_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    versions: []
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("prompt_versions").select("*").order("version_number", {
    ascending: false
  }).limit(100);
  return {
    versions: data ?? []
  };
});
const listAiVariables_createServerFn_handler = createServerRpc({
  id: "58e1462d19c125efd345c981b757c6f3e7d13cd5a7cb99a9fbb63e84ece5bce9",
  name: "listAiVariables",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listAiVariables.__executeServer(opts));
const listAiVariables = createServerFn({
  method: "GET"
}).handler(listAiVariables_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    variables: []
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("ai_variables").select("*").order("variable_name", {
    ascending: true
  });
  return {
    variables: data ?? []
  };
});
const upsertAiVariable_createServerFn_handler = createServerRpc({
  id: "a755caa91272b301890cba49b6956161a3cf8542de43edbec63e28bfae5900a1",
  name: "upsertAiVariable",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => upsertAiVariable.__executeServer(opts));
const upsertAiVariable = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  variable_name: stringType().min(1).max(100).regex(/^[A-Z0-9_]+$/),
  variable_value: stringType().max(2e3),
  description: stringType().max(500).nullable().optional()
}).parse(d)).handler(upsertAiVariable_createServerFn_handler, async ({
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
  if (id) {
    const {
      error: error2
    } = await db.from("ai_variables").update(rest).eq("id", id);
    return {
      ok: !error2,
      error: error2?.message ?? null
    };
  }
  const {
    error
  } = await db.from("ai_variables").insert(rest);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const deleteAiVariable_createServerFn_handler = createServerRpc({
  id: "8afe1fc610729473cda96c40b70a63152808e686513f32da5538f5d3a0c02e2a",
  name: "deleteAiVariable",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => deleteAiVariable.__executeServer(opts));
const deleteAiVariable = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteAiVariable_createServerFn_handler, async ({
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
  } = await db.from("ai_variables").delete().eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const listHttpActions_createServerFn_handler = createServerRpc({
  id: "d37ffddafc3b5eb13af17cc93be0b6cf2f22827948b3c3bc2c59ee84b5ae664c",
  name: "listHttpActions",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listHttpActions.__executeServer(opts));
const listHttpActions = createServerFn({
  method: "GET"
}).handler(listHttpActions_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    actions: []
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("http_actions").select("*").order("created_at", {
    ascending: false
  });
  return {
    actions: data ?? []
  };
});
const upsertHttpAction_createServerFn_handler = createServerRpc({
  id: "86f152a60e6c47ac360b71d69625bf9fa4cc372691a904fc0aa4fda4340a0b58",
  name: "upsertHttpAction",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => upsertHttpAction.__executeServer(opts));
const upsertHttpAction = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(200),
  trigger_stage: stringType().min(1).max(100),
  url: stringType().url().max(1e3),
  method: enumType(["POST", "GET", "PUT", "PATCH"]),
  headers: recordType(stringType(), stringType()).optional(),
  payload_template: stringType().max(1e4),
  enabled: booleanType()
}).parse(d)).handler(upsertHttpAction_createServerFn_handler, async ({
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
  if (id) {
    const {
      error: error2
    } = await db.from("http_actions").update(rest).eq("id", id);
    return {
      ok: !error2,
      error: error2?.message ?? null
    };
  }
  const {
    error
  } = await db.from("http_actions").insert(rest);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const deleteHttpAction_createServerFn_handler = createServerRpc({
  id: "c06b718bc55b75cfe58b1e201e5678e944c142692ff8c0983342201cbd4a47f0",
  name: "deleteHttpAction",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => deleteHttpAction.__executeServer(opts));
const deleteHttpAction = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteHttpAction_createServerFn_handler, async ({
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
  } = await db.from("http_actions").delete().eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const testPrompt_createServerFn_handler = createServerRpc({
  id: "953debe6bbad54855647525573f9fa910337130f082a4420e0b8160248ab3716",
  name: "testPrompt",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => testPrompt.__executeServer(opts));
const testPrompt = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  message: stringType().min(1).max(4e3),
  phone: stringType().max(60).optional()
}).parse(d)).handler(testPrompt_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(["super_admin", "admin"]);
  } catch (e) {
    return {
      promptUsed: "",
      modelUsed: "",
      memory: null,
      decision: null,
      error: e.message
    };
  }
  const {
    loadAiContext,
    recentHistory,
    runInSpace
  } = await import("./admissions.server-Dhr9qutG.mjs");
  const {
    runQualification
  } = await import("./ai-engine.server-CY0T1eib.mjs");
  const sid = await activeSpaceId();
  const ctx = sid ? await runInSpace(sid, () => loadAiContext()) : await loadAiContext();
  const phone = data.phone?.trim() || "test-lab";
  const db = await scopedDb();
  const {
    data: existingLead
  } = await db.from("leads").select("*").eq("phone_number", phone).maybeSingle();
  const lead = existingLead ?? {
    phone_number: phone,
    qualification_status: "NEW_LEAD"
  };
  const history = phone === "test-lab" ? [] : sid ? await runInSpace(sid, () => recentHistory(phone)) : await recentHistory(phone);
  const {
    decision,
    promptUsed,
    modelUsed,
    error
  } = await runQualification({
    lead,
    history,
    userMessage: data.message,
    systemPrompt: ctx.systemPrompt,
    model: ctx.model,
    temperature: ctx.temperature,
    variables: ctx.variables,
    settings: ctx.settings,
    provider: ctx.provider
  });
  return {
    promptUsed,
    modelUsed,
    memory: lead,
    decision,
    error: error ?? null
  };
});
const getDashboardStats_createServerFn_handler = createServerRpc({
  id: "d8dd0f2f33ee8ce5e2ea2bfc749715b8e981950fa8bc0e14ec15d540b50039e9",
  name: "getDashboardStats",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => getDashboardStats.__executeServer(opts));
const getDashboardStats = createServerFn({
  method: "GET"
}).handler(getDashboardStats_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    leads: 0,
    qualified: 0,
    bookings: 0,
    messages: 0,
    onboarding: 0,
    disqualified: 0
  };
  const db = await scopedDb();
  const [{
    count: leadsCount
  }, {
    count: qualifiedCount
  }, {
    count: bookingsCount
  }, {
    count: msgCount
  }, {
    count: onboardingCount
  }, {
    count: disqualifiedCount
  }] = await Promise.all([db.from("leads").select("*", {
    count: "exact",
    head: true
  }), db.from("leads").select("*", {
    count: "exact",
    head: true
  }).in("qualification_status", ["QUALIFIED", "BOOKING_REQUEST_CREATED"]), db.from("appointments").select("*", {
    count: "exact",
    head: true
  }), db.from("whatsapp_messages").select("*", {
    count: "exact",
    head: true
  }), db.from("leads").select("*", {
    count: "exact",
    head: true
  }).eq("qualification_status", "ONBOARDING"), db.from("leads").select("*", {
    count: "exact",
    head: true
  }).eq("qualification_status", "DISQUALIFIED")]);
  return {
    leads: leadsCount ?? 0,
    qualified: qualifiedCount ?? 0,
    bookings: bookingsCount ?? 0,
    messages: msgCount ?? 0,
    onboarding: onboardingCount ?? 0,
    disqualified: disqualifiedCount ?? 0
  };
});
const sendHumanMessage_createServerFn_handler = createServerRpc({
  id: "0e7aa1648511bbf1542fd49315db551c43322e38f2328b59f7e42d6300e0a674",
  name: "sendHumanMessage",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => sendHumanMessage.__executeServer(opts));
const sendHumanMessage = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: stringType().min(1).max(60),
  message: stringType().min(1).max(4e3),
  workspaceId: stringType().uuid().optional()
}).parse(d)).handler(sendHumanMessage_createServerFn_handler, async ({
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
  const {
    deliverHumanMessage,
    runInSpace
  } = await import("./admissions.server-Dhr9qutG.mjs");
  const sid = await activeSpaceId();
  if (!sid) return {
    ok: false,
    error: "No active space."
  };
  const db = await scopedDb();
  await db.from("conversations").update({
    human_takeover: true,
    status: "pending",
    assigned_agent: me.email ?? "Agent",
    ai_resumed: false
  }).eq("phone_number", data.phone);
  const result = await runInSpace(sid, () => deliverHumanMessage({
    phone: data.phone,
    message: data.message,
    workspaceId: data.workspaceId ?? null,
    actor: me.email ?? "Agent"
  }));
  return {
    ok: result.ok,
    error: result.error ?? null
  };
});
const startConversation_createServerFn_handler = createServerRpc({
  id: "8d253e5b4831da25aa156bcfa56d75dcd7076c12e19b4aff4e5470996e15c01c",
  name: "startConversation",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => startConversation.__executeServer(opts));
const startConversation = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: stringType().min(3).max(60),
  name: stringType().min(1).max(200).optional(),
  workspaceId: stringType().uuid().optional(),
  message: stringType().min(1).max(4e3)
}).parse(d)).handler(startConversation_createServerFn_handler, async ({
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
  const phone = data.phone.trim();
  const db = await scopedDb();
  const {
    data: existing
  } = await db.from("leads").select("id").eq("phone_number", phone).maybeSingle();
  if (existing) {
    return {
      ok: false,
      error: "A lead with this number already exists. Open it from the list."
    };
  }
  const {
    resolveWorkspace,
    resolveCreds,
    createChatwootConversation,
    getOrCreateLead,
    deliverHumanMessage
  } = await import("./admissions.server-Dhr9qutG.mjs");
  const workspace = await resolveWorkspace({
    workspaceId: data.workspaceId ?? null
  });
  const creds = await resolveCreds(workspace);
  const conversationId = await createChatwootConversation({
    creds,
    inboxId: workspace?.chatwoot_inbox_id ?? null,
    phone,
    name: data.name ?? null
  });
  const lead = await getOrCreateLead(phone, conversationId, null, workspace?.id ?? null);
  if (data.name) {
    await db.from("leads").update({
      lead_name: data.name
    }).eq("id", lead.id);
  }
  const {
    data: existingConv
  } = await db.from("conversations").select("id").eq("phone_number", phone).maybeSingle();
  if (!existingConv) {
    await db.from("conversations").insert({
      phone_number: phone,
      lead_id: lead.id ?? null,
      chatwoot_conversation_id: conversationId,
      workspace_id: workspace?.id ?? null,
      status: "pending",
      human_takeover: true,
      assigned_agent: me.email ?? "Agent",
      ai_resumed: false
    });
  }
  const result = await deliverHumanMessage({
    phone,
    message: data.message
  });
  await db.from("audit_logs").insert({
    actor_email: me.email ?? null,
    actor_role: me.role ?? null,
    action: "conversation_started",
    entity_type: "lead",
    entity_id: lead.id ?? null,
    details: {
      phone,
      workspace_id: workspace?.id ?? null,
      delivered: result.ok
    }
  });
  return {
    ok: true,
    error: result.ok ? null : result.error ?? null
  };
});
const listScheduledMessages_createServerFn_handler = createServerRpc({
  id: "ad1643801ede61d74514e1094b8f221a71f752841fb9210dda546612d90407d5",
  name: "listScheduledMessages",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listScheduledMessages.__executeServer(opts));
const listScheduledMessages = createServerFn({
  method: "GET"
}).handler(listScheduledMessages_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    scheduled: []
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("scheduled_messages").select("*").order("scheduled_for", {
    ascending: true
  }).limit(500);
  return {
    scheduled: data ?? []
  };
});
const scheduleMessage_createServerFn_handler = createServerRpc({
  id: "883b00768c8c2b8026046c9eb39fc8611565f3cbe8278b2bac7d7ad0aecb8c13",
  name: "scheduleMessage",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => scheduleMessage.__executeServer(opts));
const scheduleMessage = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: stringType().min(1).max(60),
  message: stringType().min(1).max(4e3),
  scheduledFor: stringType().min(1)
}).parse(d)).handler(scheduleMessage_createServerFn_handler, async ({
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
  const when = new Date(data.scheduledFor);
  if (isNaN(when.getTime())) return {
    ok: false,
    error: "Invalid date"
  };
  if (when.getTime() < Date.now() - 6e4) return {
    ok: false,
    error: "Scheduled time must be in the future"
  };
  const db = await scopedDb();
  const {
    error
  } = await db.from("scheduled_messages").insert({
    phone_number: data.phone,
    message_content: data.message,
    scheduled_for: when.toISOString(),
    status: "pending",
    created_by: me.email ?? "Agent"
  });
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const cancelScheduledMessage_createServerFn_handler = createServerRpc({
  id: "456f762fcd34813bc6451d1571226817d097283ce129ec1df0fecbd3de40b329",
  name: "cancelScheduledMessage",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => cancelScheduledMessage.__executeServer(opts));
const cancelScheduledMessage = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(cancelScheduledMessage_createServerFn_handler, async ({
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
  } = await db.from("scheduled_messages").update({
    status: "cancelled"
  }).eq("id", data.id).eq("status", "pending");
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const listWorkspaces_createServerFn_handler = createServerRpc({
  id: "6d2f2003ef6c38cba68de8895e418fb6a1d0e684d8d1cda5f472c9858e1aa393",
  name: "listWorkspaces",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listWorkspaces.__executeServer(opts));
const listWorkspaces = createServerFn({
  method: "GET"
}).handler(listWorkspaces_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    workspaces: []
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("chatwoot_workspaces").select("*").order("is_default", {
    ascending: false
  }).order("created_at", {
    ascending: true
  });
  const workspaces = (data ?? []).map((w) => ({
    ...w,
    chatwoot_api_token: w.chatwoot_api_token ? "********" : null,
    evolution_api_key: w.evolution_api_key ? "********" : null,
    waba_access_token: w.waba_access_token ? "********" : null,
    waba_app_secret: w.waba_app_secret ? "********" : null,
    waba_verify_token: w.waba_verify_token ? "********" : null
  }));
  return {
    workspaces
  };
});
const workspaceSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(200),
  provider_type: enumType(["chatwoot", "evolution", "waba"]).optional(),
  chatwoot_url: stringType().max(500).nullable().optional(),
  chatwoot_account_id: stringType().max(100).nullable().optional(),
  chatwoot_inbox_id: stringType().max(100).nullable().optional(),
  chatwoot_api_token: stringType().max(500).nullable().optional(),
  evolution_url: stringType().max(500).nullable().optional(),
  evolution_api_key: stringType().max(500).nullable().optional(),
  evolution_instance: stringType().max(200).nullable().optional(),
  waba_phone_number_id: stringType().max(100).nullable().optional(),
  waba_business_account_id: stringType().max(100).nullable().optional(),
  waba_access_token: stringType().max(500).nullable().optional(),
  waba_api_version: stringType().max(20).nullable().optional(),
  waba_verify_token: stringType().max(300).nullable().optional(),
  waba_app_secret: stringType().max(500).nullable().optional(),
  waba_display_name: stringType().max(100).nullable().optional(),
  enabled: booleanType().optional(),
  is_default: booleanType().optional(),
  use_shared_ai: booleanType().optional()
});
const upsertWorkspace_createServerFn_handler = createServerRpc({
  id: "bd0c10c3d71df975f9a7c322a8b1cb774ed4e90ae3fbb95f879e30d69d5eea30",
  name: "upsertWorkspace",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => upsertWorkspace.__executeServer(opts));
const upsertWorkspace = createServerFn({
  method: "POST"
}).inputValidator((d) => workspaceSchema.parse(d)).handler(upsertWorkspace_createServerFn_handler, async ({
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
  const token = rest.chatwoot_api_token;
  if (token === "" || token === "********" || token === void 0) {
    delete rest.chatwoot_api_token;
  }
  const evoKey = rest.evolution_api_key;
  if (evoKey === "" || evoKey === "********" || evoKey === void 0) {
    delete rest.evolution_api_key;
  } else if (typeof evoKey === "string") {
    rest.evolution_api_key = evoKey.trim();
  }
  for (const f of ["waba_access_token", "waba_app_secret", "waba_verify_token"]) {
    const v = rest[f];
    if (v === "" || v === "********" || v === void 0) {
      delete rest[f];
    } else if (typeof v === "string") {
      rest[f] = v.trim();
    }
  }
  for (const field of ["evolution_url", "evolution_instance", "chatwoot_url", "waba_api_version"]) {
    const v = rest[field];
    if (typeof v === "string") rest[field] = v.trim();
  }
  if (rest.is_default) {
    await db.from("chatwoot_workspaces").update({
      is_default: false
    }).neq("id", id ?? "00000000-0000-0000-0000-000000000000");
  }
  if (id) {
    const {
      error: error2
    } = await db.from("chatwoot_workspaces").update(rest).eq("id", id);
    return {
      ok: !error2,
      error: error2?.message ?? null
    };
  }
  const {
    error
  } = await db.from("chatwoot_workspaces").insert(rest);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const deleteWorkspace_createServerFn_handler = createServerRpc({
  id: "c40056803d857e2486e3d4f3f6d7e8f0fc233a635670f378fe81fc11be8b261e",
  name: "deleteWorkspace",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => deleteWorkspace.__executeServer(opts));
const deleteWorkspace = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteWorkspace_createServerFn_handler, async ({
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
  } = await db.from("chatwoot_workspaces").delete().eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const setEvolutionWebhook_createServerFn_handler = createServerRpc({
  id: "ebe6d9ce2cf65372a2f93b8547332d4b4d5ed1807c5114e34d962c979d877d0a",
  name: "setEvolutionWebhook",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => setEvolutionWebhook.__executeServer(opts));
const setEvolutionWebhook = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  evolution_url: stringType().min(1).max(500),
  evolution_api_key: stringType().max(500).optional(),
  evolution_instance: stringType().min(1).max(200),
  webhookUrl: stringType().url().max(500)
}).parse(d)).handler(setEvolutionWebhook_createServerFn_handler, async ({
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
  let apiKey = data.evolution_api_key;
  if (!apiKey || apiKey === "********") {
    if (!data.id) return {
      ok: false,
      error: "Save the workspace first, then set the webhook."
    };
    const db = await scopedDb();
    const {
      data: row
    } = await db.from("chatwoot_workspaces").select("evolution_api_key").eq("id", data.id).maybeSingle();
    apiKey = row?.evolution_api_key ?? "";
  }
  if (!apiKey) return {
    ok: false,
    error: "Missing Evolution API key."
  };
  apiKey = apiKey.trim();
  const base = data.evolution_url.trim().replace(/\/+$/, "");
  const url = `${base}/webhook/set/${encodeURIComponent(data.evolution_instance.trim())}`;
  const config = {
    enabled: true,
    url: data.webhookUrl,
    webhookByEvents: false,
    webhookBase64: false,
    events: ["MESSAGES_UPSERT"]
  };
  const post = (body) => fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey
    },
    body: JSON.stringify(body)
  });
  try {
    let res = await post(config);
    if (!res.ok && (res.status === 400 || res.status === 404)) {
      res = await post({
        webhook: config
      });
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Evolution returned ${res.status}. ${text.slice(0, 200)}`
      };
    }
    return {
      ok: true,
      error: null
    };
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
});
const testWorkspaceConnection_createServerFn_handler = createServerRpc({
  id: "4e98ad4bc171ac6474d4d22d3267fe1d4591a372f03b21e8437ed7486ba90df4",
  name: "testWorkspaceConnection",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => testWorkspaceConnection.__executeServer(opts));
const testWorkspaceConnection = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  provider_type: enumType(["chatwoot", "evolution", "waba"]),
  chatwoot_url: stringType().max(500).nullable().optional(),
  chatwoot_account_id: stringType().max(100).nullable().optional(),
  chatwoot_api_token: stringType().max(500).nullable().optional(),
  evolution_url: stringType().max(500).nullable().optional(),
  evolution_api_key: stringType().max(500).nullable().optional(),
  evolution_instance: stringType().max(200).nullable().optional(),
  waba_phone_number_id: stringType().max(100).nullable().optional(),
  waba_business_account_id: stringType().max(100).nullable().optional(),
  waba_access_token: stringType().max(500).nullable().optional(),
  waba_api_version: stringType().max(20).nullable().optional()
}).parse(d)).handler(testWorkspaceConnection_createServerFn_handler, async ({
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
  const resolveSavedKey = async (field) => {
    if (!data.id) return "";
    const db = await scopedDb();
    const {
      data: row
    } = await db.from("chatwoot_workspaces").select(field).eq("id", data.id).maybeSingle();
    return String(row?.[field] ?? "");
  };
  try {
    if (data.provider_type === "evolution") {
      const base2 = (data.evolution_url ?? "").trim().replace(/\/+$/, "");
      const instance = (data.evolution_instance ?? "").trim();
      let apiKey = (data.evolution_api_key ?? "").trim();
      if (!apiKey || apiKey === "********") apiKey = (await resolveSavedKey("evolution_api_key")).trim();
      if (!base2) return {
        ok: false,
        error: "Enter the Evolution API base URL first."
      };
      if (!instance) return {
        ok: false,
        error: "Enter the instance name first."
      };
      if (!apiKey) return {
        ok: false,
        error: "Enter the Evolution API key first."
      };
      const url2 = `${base2}/instance/connectionState/${encodeURIComponent(instance)}`;
      const res2 = await fetch(url2, {
        headers: {
          apikey: apiKey
        }
      });
      if (!res2.ok) {
        if (res2.status === 401 || res2.status === 403) return {
          ok: false,
          error: "The API key was rejected. Double-check it."
        };
        if (res2.status === 404) return {
          ok: false,
          error: "Instance not found. Check the instance name."
        };
        return {
          ok: false,
          error: `Evolution returned an error (${res2.status}).`
        };
      }
      const json = await res2.json().catch(() => null);
      const state = json?.instance?.state ?? json?.state ?? "";
      if (state && state !== "open") {
        return {
          ok: false,
          error: `Connected, but the WhatsApp instance is "${state}" (not open).`
        };
      }
      return {
        ok: true,
        error: null
      };
    }
    if (data.provider_type === "waba") {
      const phoneNumberId = (data.waba_phone_number_id ?? "").trim();
      const apiVersion = (data.waba_api_version ?? "v21.0").trim() || "v21.0";
      let token2 = (data.waba_access_token ?? "").trim();
      if (!token2 || token2 === "********") token2 = (await resolveSavedKey("waba_access_token")).trim();
      if (!phoneNumberId) return {
        ok: false,
        error: "Enter the WhatsApp Phone Number ID first."
      };
      if (!token2) return {
        ok: false,
        error: "Enter the WhatsApp access token first."
      };
      const url2 = `https://graph.facebook.com/${encodeURIComponent(apiVersion)}/${encodeURIComponent(phoneNumberId)}?fields=id,display_phone_number,verified_name,quality_rating`;
      const res2 = await fetch(url2, {
        headers: {
          Authorization: `Bearer ${token2}`
        }
      });
      if (!res2.ok) {
        if (res2.status === 401 || res2.status === 403) return {
          ok: false,
          error: "The access token was rejected. Check its permissions (whatsapp_business_messaging, whatsapp_business_management)."
        };
        if (res2.status === 404) return {
          ok: false,
          error: "Phone number ID not found. Double-check it and the API version."
        };
        return {
          ok: false,
          error: `Meta Graph API returned an error (${res2.status}).`
        };
      }
      const json = await res2.json().catch(() => null);
      const number = json?.display_phone_number ?? phoneNumberId;
      const name = json?.verified_name ?? "";
      return {
        ok: true,
        error: null,
        detail: `Connected to WhatsApp number ${number}${name ? ` (${name})` : ""}.`
      };
    }
    const base = (data.chatwoot_url ?? "").trim().replace(/\/+$/, "");
    const accountId = (data.chatwoot_account_id ?? "").trim();
    let token = (data.chatwoot_api_token ?? "").trim();
    if (!token || token === "********") token = (await resolveSavedKey("chatwoot_api_token")).trim();
    if (!base) return {
      ok: false,
      error: "Enter the Chatwoot base URL first."
    };
    if (!accountId) return {
      ok: false,
      error: "Enter the account ID first."
    };
    if (!token) return {
      ok: false,
      error: "Enter the API token first."
    };
    const url = `${base}/api/v1/accounts/${encodeURIComponent(accountId)}/inboxes`;
    const res = await fetch(url, {
      headers: {
        api_access_token: token
      }
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) return {
        ok: false,
        error: "The API token was rejected. Double-check it."
      };
      if (res.status === 404) return {
        ok: false,
        error: "Account not found. Check the account ID and URL."
      };
      return {
        ok: false,
        error: `Chatwoot returned an error (${res.status}).`
      };
    }
    return {
      ok: true,
      error: null
    };
  } catch {
    return {
      ok: false,
      error: "Couldn't reach the server. Check the base URL."
    };
  }
});
const SUPER = ["super_admin"];
async function isSuper() {
  const {
    getRequestUser
  } = await import("./role-guard.server-D4B58koo.mjs");
  const u = await getRequestUser();
  return u?.role === "super_admin";
}
const listResponderAgents_createServerFn_handler = createServerRpc({
  id: "e37c15b1836defd0d9880d82f89d426b3c046a45fbe5055a3c8bd9716d15b842",
  name: "listResponderAgents",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listResponderAgents.__executeServer(opts));
const listResponderAgents = createServerFn({
  method: "GET"
}).handler(listResponderAgents_createServerFn_handler, async () => {
  if (!await isSuper()) return {
    agents: []
  };
  const db = await scopedDb();
  const {
    DEFAULT_AGENT_ID
  } = await import("./orchestration-lZ10Rxtv.mjs");
  const {
    data: cfg
  } = await db.from("ai_configuration").select("*").order("updated_at", {
    ascending: false
  }).limit(1).maybeSingle();
  const c = cfg;
  const defaultAgent = {
    id: DEFAULT_AGENT_ID,
    name: "Default Qualification Agent",
    description: "The main admissions agent configured in AI Settings.",
    workspace_id: null,
    system_prompt: String(c?.system_prompt ?? ""),
    model: String(c?.model ?? "google/gemini-3-flash-preview"),
    temperature: Number(c?.temperature ?? 0.7),
    provider_mode: "inherit",
    custom_provider: null,
    custom_base_url: null,
    custom_model: null,
    custom_api_key: null,
    inherit_variables: true,
    enabled: true,
    is_default: true
  };
  const {
    data
  } = await db.from("responder_agents").select("*").order("created_at", {
    ascending: true
  });
  const agents = (data ?? []).map((a) => ({
    ...a,
    is_default: false,
    custom_api_key: a.custom_api_key ? "********" : null
  }));
  return {
    agents: [defaultAgent, ...agents]
  };
});
const responderAgentSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(200),
  description: stringType().max(1e3).nullable().optional(),
  workspace_id: stringType().uuid().nullable().optional(),
  system_prompt: stringType().max(5e4),
  model: stringType().min(1).max(100),
  temperature: numberType().min(0).max(2),
  provider_mode: enumType(["inherit", "built_in", "custom"]),
  custom_provider: stringType().max(100).nullable().optional(),
  custom_base_url: stringType().max(500).nullable().optional(),
  custom_model: stringType().max(200).nullable().optional(),
  custom_api_key: stringType().max(500).nullable().optional(),
  inherit_variables: booleanType(),
  enabled: booleanType()
});
const upsertResponderAgent_createServerFn_handler = createServerRpc({
  id: "20e65fdb203b5171275d62545ec5a251cc84f18dc147d735f2ce8adc6ad3d632",
  name: "upsertResponderAgent",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => upsertResponderAgent.__executeServer(opts));
const upsertResponderAgent = createServerFn({
  method: "POST"
}).inputValidator((d) => responderAgentSchema.parse(d)).handler(upsertResponderAgent_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(SUPER);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const {
    DEFAULT_AGENT_ID
  } = await import("./orchestration-lZ10Rxtv.mjs");
  if (data.id === DEFAULT_AGENT_ID) {
    return {
      ok: false,
      error: "The default agent is managed in AI Settings."
    };
  }
  const db = await scopedDb();
  const {
    id,
    ...rest
  } = data;
  const key = rest.custom_api_key;
  if (key === "" || key === "********" || key === void 0) {
    delete rest.custom_api_key;
  }
  if (id) {
    const {
      error: error2
    } = await db.from("responder_agents").update(rest).eq("id", id);
    return {
      ok: !error2,
      error: error2?.message ?? null
    };
  }
  const {
    data: created,
    error
  } = await db.from("responder_agents").insert(rest).select("id").single();
  return {
    ok: !error,
    error: error?.message ?? null,
    id: created?.id
  };
});
const deleteResponderAgent_createServerFn_handler = createServerRpc({
  id: "2bb66c2d3f2895a457b0d983ebdd86324feff86d6de6f6d9571b0f2cd6ce5760",
  name: "deleteResponderAgent",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => deleteResponderAgent.__executeServer(opts));
const deleteResponderAgent = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteResponderAgent_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(SUPER);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const {
    DEFAULT_AGENT_ID
  } = await import("./orchestration-lZ10Rxtv.mjs");
  if (data.id === DEFAULT_AGENT_ID) {
    return {
      ok: false,
      error: "The default agent cannot be deleted."
    };
  }
  const db = await scopedDb();
  const {
    error
  } = await db.from("responder_agents").delete().eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const listResponderAgentVariables_createServerFn_handler = createServerRpc({
  id: "ebd250ee813ec8c5bbf5349154ac1ac9dba7aff6b8e41051bf4b10270b63806a",
  name: "listResponderAgentVariables",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listResponderAgentVariables.__executeServer(opts));
const listResponderAgentVariables = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  agentId: stringType().uuid()
}).parse(d)).handler(listResponderAgentVariables_createServerFn_handler, async ({
  data
}) => {
  if (!await isSuper()) return {
    variables: []
  };
  const db = await scopedDb();
  const {
    data: rows
  } = await db.from("responder_agent_variables").select("*").eq("agent_id", data.agentId).order("variable_name", {
    ascending: true
  });
  return {
    variables: rows ?? []
  };
});
const upsertResponderAgentVariable_createServerFn_handler = createServerRpc({
  id: "5228ff2a4da0b65c98975ef231c9086c9b48907dd519d9963a4fc3ccbf6a7bfe",
  name: "upsertResponderAgentVariable",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => upsertResponderAgentVariable.__executeServer(opts));
const upsertResponderAgentVariable = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  agent_id: stringType().uuid(),
  variable_name: stringType().min(1).max(100).regex(/^[A-Z0-9_]+$/),
  variable_value: stringType().max(2e3),
  description: stringType().max(500).nullable().optional()
}).parse(d)).handler(upsertResponderAgentVariable_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(SUPER);
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
  if (id) {
    const {
      error: error2
    } = await db.from("responder_agent_variables").update(rest).eq("id", id);
    return {
      ok: !error2,
      error: error2?.message ?? null
    };
  }
  const {
    error
  } = await db.from("responder_agent_variables").insert(rest);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const deleteResponderAgentVariable_createServerFn_handler = createServerRpc({
  id: "0437bc527358ea40e84168d2681cf12209b54cc1b7ba07bee2b78e48e7f9ac75",
  name: "deleteResponderAgentVariable",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => deleteResponderAgentVariable.__executeServer(opts));
const deleteResponderAgentVariable = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteResponderAgentVariable_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(SUPER);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    error
  } = await db.from("responder_agent_variables").delete().eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const listWorkflows_createServerFn_handler = createServerRpc({
  id: "8817508e78df521de8f00a80415c9431f2ad0b2c1df5f50661131f8e19972ad4",
  name: "listWorkflows",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listWorkflows.__executeServer(opts));
const listWorkflows = createServerFn({
  method: "GET"
}).handler(listWorkflows_createServerFn_handler, async () => {
  if (!await isSuper()) return {
    workflows: []
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("workflows").select("*").order("created_at", {
    ascending: true
  });
  return {
    workflows: data ?? []
  };
});
const listWorkflowEnrollments_createServerFn_handler = createServerRpc({
  id: "99d88c22ed58f65406bcece6dd8e0282b66384b204a4342850cfeb4e8563517d",
  name: "listWorkflowEnrollments",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listWorkflowEnrollments.__executeServer(opts));
const listWorkflowEnrollments = createServerFn({
  method: "GET"
}).handler(listWorkflowEnrollments_createServerFn_handler, async () => {
  if (!await isSuper()) return {
    enrollments: []
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("workflow_enrollments").select("*").order("updated_at", {
    ascending: false
  }).limit(500);
  return {
    enrollments: data ?? []
  };
});
const workflowSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(200),
  description: stringType().max(1e3).nullable().optional(),
  workspace_id: stringType().uuid().nullable().optional(),
  agent_id: stringType().uuid().nullable().optional(),
  trigger_type: enumType(["manual", "pipeline_stage", "time_since_first_message", "time_since_last_message", "booking_status"]).optional(),
  trigger_config: objectType({
    segment: stringType().max(100).optional(),
    amount: numberType().min(0).max(1e5).optional(),
    unit: enumType(["seconds", "minutes", "hours", "days"]).optional(),
    status: enumType(["pending", "confirmed", "completed", "cancelled"]).optional()
  }).optional(),
  trigger_segment: stringType().min(1).max(100).optional(),
  enabled: booleanType(),
  graph: anyType().optional()
});
const upsertWorkflow_createServerFn_handler = createServerRpc({
  id: "790071a7841e58281ff9edf77fb76210117f19f310f8994e3ee65c4737bdaaf9",
  name: "upsertWorkflow",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => upsertWorkflow.__executeServer(opts));
const upsertWorkflow = createServerFn({
  method: "POST"
}).inputValidator((d) => workflowSchema.parse(d)).handler(upsertWorkflow_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(SUPER);
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
  const triggerType = rest.trigger_type ?? "manual";
  rest.trigger_segment = triggerType === "pipeline_stage" ? rest.trigger_config?.segment ?? "manual" : "manual";
  if (!rest.trigger_type) rest.trigger_type = triggerType;
  if (!rest.trigger_config) rest.trigger_config = {};
  if (id) {
    const {
      error: error2
    } = await db.from("workflows").update(rest).eq("id", id);
    return {
      ok: !error2,
      error: error2?.message ?? null
    };
  }
  const {
    data: created,
    error
  } = await db.from("workflows").insert(rest).select("id").single();
  return {
    ok: !error,
    error: error?.message ?? null,
    id: created?.id
  };
});
const seedMeetingOutcomeWorkflows_createServerFn_handler = createServerRpc({
  id: "d092086720309421ae894c32c66ad3573d7b3ca8732e317adedb9a0895ed0290",
  name: "seedMeetingOutcomeWorkflows",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => seedMeetingOutcomeWorkflows.__executeServer(opts));
const seedMeetingOutcomeWorkflows = createServerFn({
  method: "POST"
}).handler(seedMeetingOutcomeWorkflows_createServerFn_handler, async () => {
  try {
    await guard(["super_admin", "admin"]);
  } catch (e) {
    return {
      ok: false,
      error: e.message,
      created: 0
    };
  }
  const {
    ensureMeetingOutcomeWorkflows
  } = await import("./admissions.server-Dhr9qutG.mjs");
  const res = await ensureMeetingOutcomeWorkflows();
  return {
    ok: true,
    error: null,
    created: res.created
  };
});
const deleteWorkflow_createServerFn_handler = createServerRpc({
  id: "624de0f426b99fc8bd24410df7c564c3de2b6e41ec4a7b20ae273eb773f7abfe",
  name: "deleteWorkflow",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => deleteWorkflow.__executeServer(opts));
const deleteWorkflow = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteWorkflow_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(SUPER);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    error
  } = await db.from("workflows").delete().eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const listActiveWorkflows_createServerFn_handler = createServerRpc({
  id: "7b12eb82f1a429cbbd09f3c85d3fbacbe2b4fa0112e875b07fe56db6e0c5a745",
  name: "listActiveWorkflows",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listActiveWorkflows.__executeServer(opts));
const listActiveWorkflows = createServerFn({
  method: "GET"
}).handler(listActiveWorkflows_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    workflows: []
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("workflows").select("id, name, enabled").eq("enabled", true).order("name", {
    ascending: true
  });
  return {
    workflows: data ?? []
  };
});
const triggerLeadWorkflow_createServerFn_handler = createServerRpc({
  id: "dacd3c7e914c8438f804a485fff697f1e5daada875cd5c2ab8d0f0979cdb1d03",
  name: "triggerLeadWorkflow",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => triggerLeadWorkflow.__executeServer(opts));
const triggerLeadWorkflow = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  workflowId: stringType().uuid(),
  phone: stringType().min(1).max(60),
  workspaceId: stringType().uuid().nullable().optional()
}).parse(d)).handler(triggerLeadWorkflow_createServerFn_handler, async ({
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
    data: wf
  } = await db.from("workflows").select("id, name, enabled").eq("id", data.workflowId).maybeSingle();
  const workflow = wf;
  if (!workflow) return {
    ok: false,
    error: "Workflow not found"
  };
  if (!workflow.enabled) return {
    ok: false,
    error: "This workflow is disabled"
  };
  const {
    data: lead
  } = await db.from("leads").select("id").eq("phone_number", data.phone).maybeSingle();
  const {
    enrollLeadInWorkflowByName
  } = await import("./admissions.server-Dhr9qutG.mjs");
  let status;
  try {
    const res = await enrollLeadInWorkflowByName({
      workflowName: workflow.name,
      phone: data.phone,
      leadId: lead?.id ?? null,
      workspaceId: data.workspaceId ?? null,
      sendNow: true
    });
    status = res.status;
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to trigger workflow"
    };
  }
  if (status === "no_workflow") return {
    ok: false,
    error: "Workflow has no message steps configured"
  };
  if (status === "already_enrolled") return {
    ok: false,
    error: "Lead is already enrolled in this workflow"
  };
  await db.from("audit_logs").insert({
    actor_email: me.email ?? null,
    actor_role: me.role ?? null,
    action: "workflow_triggered",
    entity_type: "lead",
    entity_id: lead?.id ?? null,
    details: {
      phone: data.phone,
      workflow: workflow.name
    }
  });
  return {
    ok: true,
    error: null,
    status
  };
});
const MEETING_ROLES = ["super_admin", "admin"];
async function isAdminOrSuper() {
  const {
    getRequestUser
  } = await import("./role-guard.server-D4B58koo.mjs");
  const u = await getRequestUser();
  return u?.role === "super_admin" || u?.role === "admin";
}
const listMeetingOutcomes_createServerFn_handler = createServerRpc({
  id: "e0900568cd95d7036f7b4f572bb10f167d4437bf97f89bb9233c17de0cc5c6f7",
  name: "listMeetingOutcomes",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listMeetingOutcomes.__executeServer(opts));
const listMeetingOutcomes = createServerFn({
  method: "GET"
}).handler(listMeetingOutcomes_createServerFn_handler, async () => {
  if (!await isAdminOrSuper()) return {
    outcomes: []
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("meeting_outcomes").select("*").order("meeting_date", {
    ascending: false
  }).limit(500);
  return {
    outcomes: data ?? []
  };
});
const meetingOutcomeSchema = objectType({
  lead_id: stringType().uuid(),
  meeting_date: stringType().min(1).optional(),
  outcome: enumType(["ready_to_pay", "parent_discussion", "financial_delay", "future_applicant", "not_qualified"]),
  commitment_level: enumType(["high", "medium", "low"]).nullable().optional(),
  main_obstacle: stringType().max(100).nullable().optional(),
  next_action: stringType().max(100).nullable().optional(),
  follow_up_date: stringType().max(40).nullable().optional(),
  internal_notes: stringType().max(5e3).nullable().optional(),
  workspace_id: stringType().uuid().nullable().optional()
});
const saveMeetingOutcome_createServerFn_handler = createServerRpc({
  id: "99568c530a7ecd49cbbd9f6c4ec06c7dbbcbc3b92247357f1996d55ab2f8819b",
  name: "saveMeetingOutcome",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => saveMeetingOutcome.__executeServer(opts));
const saveMeetingOutcome = createServerFn({
  method: "POST"
}).inputValidator((d) => meetingOutcomeSchema.parse(d)).handler(saveMeetingOutcome_createServerFn_handler, async ({
  data
}) => {
  let me;
  try {
    me = await guard(MEETING_ROLES);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const {
    findOutcome
  } = await import("./meeting-outcomes-C7fm1Xor.mjs");
  const mapping = findOutcome(data.outcome);
  if (!mapping) return {
    ok: false,
    error: "Unknown outcome"
  };
  const db = await scopedDb();
  const {
    data: lead
  } = await db.from("leads").select("id, phone_number, lead_name").eq("id", data.lead_id).maybeSingle();
  const leadRow = lead;
  if (!leadRow) return {
    ok: false,
    error: "Lead not found"
  };
  const {
    enrollLeadInWorkflowByName,
    ensureMeetingOutcomeWorkflows
  } = await import("./admissions.server-Dhr9qutG.mjs");
  let workflowStatus = "no_workflow";
  try {
    await ensureMeetingOutcomeWorkflows();
    const res = await enrollLeadInWorkflowByName({
      workflowName: mapping.workflow,
      phone: leadRow.phone_number,
      leadId: leadRow.id,
      workspaceId: data.workspace_id ?? null,
      sendNow: false,
      startDelayMs: OUTCOME_EDIT_WINDOW_MS
    });
    workflowStatus = res.status;
  } catch (e) {
    console.error("Workflow enrollment failed:", e);
  }
  const meetingDate = data.meeting_date ? new Date(data.meeting_date) : /* @__PURE__ */ new Date();
  const {
    data: inserted,
    error: insertErr
  } = await db.from("meeting_outcomes").insert({
    lead_id: leadRow.id,
    phone_number: leadRow.phone_number,
    lead_name: leadRow.lead_name,
    meeting_date: isNaN(meetingDate.getTime()) ? (/* @__PURE__ */ new Date()).toISOString() : meetingDate.toISOString(),
    outcome: data.outcome,
    commitment_level: data.commitment_level ?? null,
    main_obstacle: data.main_obstacle ?? null,
    next_action: data.next_action ?? null,
    follow_up_date: data.follow_up_date || null,
    internal_notes: data.internal_notes ?? null,
    workflow_triggered: mapping.workflow,
    recorded_by: me.email ?? "Admissions Team"
  }).select("id").single();
  if (insertErr) return {
    ok: false,
    error: insertErr.message
  };
  await db.from("leads").update({
    qualification_status: mapping.stage
  }).eq("id", leadRow.id);
  await db.from("audit_logs").insert({
    actor_email: me.email ?? null,
    actor_role: me.role ?? null,
    action: "meeting_outcome_recorded",
    entity_type: "lead",
    entity_id: leadRow.id,
    details: {
      outcome: data.outcome,
      outcome_label: mapping.label,
      new_stage: mapping.stage,
      workflow: mapping.workflow,
      workflow_status: workflowStatus,
      commitment_level: data.commitment_level ?? null,
      main_obstacle: data.main_obstacle ?? null,
      next_action: data.next_action ?? null,
      follow_up_date: data.follow_up_date ?? null,
      outcome_id: inserted?.id ?? null
    }
  });
  return {
    ok: true,
    error: null,
    workflowStatus,
    stage: mapping.stage
  };
});
const OUTCOME_EDIT_WINDOW_MS = 6e4;
const updateMeetingOutcomeSchema = objectType({
  id: stringType().uuid(),
  outcome: enumType(["ready_to_pay", "parent_discussion", "financial_delay", "future_applicant", "not_qualified"]),
  commitment_level: enumType(["high", "medium", "low"]).nullable().optional(),
  main_obstacle: stringType().max(100).nullable().optional(),
  next_action: stringType().max(100).nullable().optional(),
  follow_up_date: stringType().max(40).nullable().optional(),
  internal_notes: stringType().max(5e3).nullable().optional()
});
const updateMeetingOutcome_createServerFn_handler = createServerRpc({
  id: "a5862b4a7392e595242d8471a57c7aa0030669a214d3749f88639c2ddec3ecf0",
  name: "updateMeetingOutcome",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => updateMeetingOutcome.__executeServer(opts));
const updateMeetingOutcome = createServerFn({
  method: "POST"
}).inputValidator((d) => updateMeetingOutcomeSchema.parse(d)).handler(updateMeetingOutcome_createServerFn_handler, async ({
  data
}) => {
  let me;
  try {
    me = await guard(MEETING_ROLES);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    data: existing
  } = await db.from("meeting_outcomes").select("id, lead_id, phone_number, outcome, workflow_triggered, created_at").eq("id", data.id).maybeSingle();
  const row = existing;
  if (!row) return {
    ok: false,
    error: "Outcome not found"
  };
  const age = Date.now() - new Date(row.created_at).getTime();
  if (age > OUTCOME_EDIT_WINDOW_MS) {
    return {
      ok: false,
      error: "This outcome can no longer be edited (1 minute window passed)."
    };
  }
  const {
    findOutcome
  } = await import("./meeting-outcomes-C7fm1Xor.mjs");
  const mapping = findOutcome(data.outcome);
  if (!mapping) return {
    ok: false,
    error: "Unknown outcome"
  };
  const {
    error: updErr
  } = await db.from("meeting_outcomes").update({
    outcome: data.outcome,
    commitment_level: data.commitment_level ?? null,
    main_obstacle: data.main_obstacle ?? null,
    next_action: data.next_action ?? null,
    follow_up_date: data.follow_up_date || null,
    internal_notes: data.internal_notes ?? null,
    workflow_triggered: mapping.workflow
  }).eq("id", data.id);
  if (updErr) return {
    ok: false,
    error: updErr.message
  };
  if (row.lead_id) {
    await db.from("leads").update({
      qualification_status: mapping.stage
    }).eq("id", row.lead_id);
  }
  if (row.workflow_triggered !== mapping.workflow && row.phone_number) {
    try {
      const {
        enrollLeadInWorkflowByName
      } = await import("./admissions.server-Dhr9qutG.mjs");
      await db.from("workflow_enrollments").delete().eq("phone_number", row.phone_number).eq("current_step", 0).eq("status", "active");
      const remaining = Math.max(0, OUTCOME_EDIT_WINDOW_MS - age);
      await enrollLeadInWorkflowByName({
        workflowName: mapping.workflow,
        phone: row.phone_number,
        leadId: row.lead_id ?? null,
        sendNow: false,
        startDelayMs: remaining
      });
    } catch (e) {
      console.error("Re-enrollment after outcome edit failed:", e);
    }
  }
  await db.from("audit_logs").insert({
    actor_email: me.email ?? null,
    actor_role: me.role ?? null,
    action: "meeting_outcome_edited",
    entity_type: "meeting_outcome",
    entity_id: data.id,
    details: {
      previous_outcome: row.outcome,
      outcome: data.outcome,
      new_stage: mapping.stage
    }
  });
  return {
    ok: true,
    error: null
  };
});
const getMeetingOutcomeStats_createServerFn_handler = createServerRpc({
  id: "364620d9768c1f98a5db7344080f8433b793ca08e1dc6c4d279786921253883a",
  name: "getMeetingOutcomeStats",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => getMeetingOutcomeStats.__executeServer(opts));
const getMeetingOutcomeStats = createServerFn({
  method: "GET"
}).handler(getMeetingOutcomeStats_createServerFn_handler, async () => {
  const empty = {
    meetingsThisWeek: 0,
    readyToPay: 0,
    parentDiscussion: 0,
    financialDelay: 0,
    futureApplicants: 0,
    conversionForecast: 0
  };
  if (!await isAdminOrSuper()) return empty;
  const db = await scopedDb();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString();
  const {
    data
  } = await db.from("meeting_outcomes").select("outcome, commitment_level, meeting_date").gte("meeting_date", weekAgo).limit(2e3);
  const rows = data ?? [];
  const {
    MEETING_OUTCOMES,
    COMMITMENT_WEIGHTS
  } = await import("./meeting-outcomes-C7fm1Xor.mjs");
  let forecast = 0;
  const counts = {};
  for (const r of rows) {
    counts[r.outcome] = (counts[r.outcome] ?? 0) + 1;
    const base = MEETING_OUTCOMES.find((o) => o.value === r.outcome)?.weight ?? 0;
    const mult = r.commitment_level ? COMMITMENT_WEIGHTS[r.commitment_level] ?? 0.7 : 0.7;
    forecast += base * mult;
  }
  return {
    meetingsThisWeek: rows.length,
    readyToPay: counts["ready_to_pay"] ?? 0,
    parentDiscussion: counts["parent_discussion"] ?? 0,
    financialDelay: counts["financial_delay"] ?? 0,
    futureApplicants: counts["future_applicant"] ?? 0,
    conversionForecast: Math.round(forecast)
  };
});
const deleteMeetingOutcome_createServerFn_handler = createServerRpc({
  id: "8b4ea44888678761b2bed0e29cdf9e531d4673d812c609995c1b5c2c378bc7ef",
  name: "deleteMeetingOutcome",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => deleteMeetingOutcome.__executeServer(opts));
const deleteMeetingOutcome = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteMeetingOutcome_createServerFn_handler, async ({
  data
}) => {
  let me;
  try {
    me = await guard(["super_admin"]);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    error
  } = await db.from("meeting_outcomes").delete().eq("id", data.id);
  if (error) return {
    ok: false,
    error: error.message
  };
  await db.from("audit_logs").insert({
    actor_email: me.email ?? null,
    actor_role: me.role ?? null,
    action: "meeting_outcome_deleted",
    entity_type: "meeting_outcome",
    entity_id: data.id,
    details: {}
  });
  return {
    ok: true,
    error: null
  };
});
const processDueWorkflows_createServerFn_handler = createServerRpc({
  id: "c2712e5db5e52b9f6c2978d9009d1aa8ae496911c8bedbb48c9b44eff52dc2b2",
  name: "processDueWorkflows",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => processDueWorkflows.__executeServer(opts));
const processDueWorkflows = createServerFn({
  method: "POST"
}).handler(processDueWorkflows_createServerFn_handler, async () => {
  try {
    await guard(["super_admin", "admin"]);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  try {
    const {
      processWorkflows
    } = await import("./admissions.server-Dhr9qutG.mjs");
    const res = await processWorkflows();
    return {
      ok: true,
      error: null,
      ...res
    };
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
});
const listWorkflowStates_createServerFn_handler = createServerRpc({
  id: "1f1865c13caac15197f9fc2542dfc2b29416d27f4968c190d3b6d71978d481ca",
  name: "listWorkflowStates",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listWorkflowStates.__executeServer(opts));
const listWorkflowStates = createServerFn({
  method: "GET"
}).handler(listWorkflowStates_createServerFn_handler, async () => {
  if (!await isAdminOrSuper()) return {
    states: []
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("workflow_enrollments").select("phone_number, status").in("status", ["active", "paused"]).limit(2e3);
  const byPhone = /* @__PURE__ */ new Map();
  for (const r of data ?? []) {
    const cur = byPhone.get(r.phone_number);
    if (r.status === "active" || cur !== "active") {
      byPhone.set(r.phone_number, r.status === "active" ? "active" : "paused");
    }
  }
  return {
    states: Array.from(byPhone.entries()).map(([phone_number, status]) => ({
      phone_number,
      status
    }))
  };
});
const pauseLeadWorkflow_createServerFn_handler = createServerRpc({
  id: "a518d2d3284cb90077e775b3bbd4225e7b9e60249987d261096a1e01369ee275",
  name: "pauseLeadWorkflow",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => pauseLeadWorkflow.__executeServer(opts));
const pauseLeadWorkflow = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: stringType().min(1).max(60),
  paused: booleanType()
}).parse(d)).handler(pauseLeadWorkflow_createServerFn_handler, async ({
  data
}) => {
  let me;
  try {
    me = await guard(["super_admin", "admin"]);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const from = data.paused ? "active" : "paused";
  const to = data.paused ? "paused" : "active";
  const {
    error
  } = await db.from("workflow_enrollments").update({
    status: to
  }).eq("phone_number", data.phone).eq("status", from);
  if (error) return {
    ok: false,
    error: error.message
  };
  await db.from("audit_logs").insert({
    actor_email: me.email ?? null,
    actor_role: me.role ?? null,
    action: data.paused ? "workflow_paused" : "workflow_resumed",
    entity_type: "lead",
    details: {
      phone: data.phone
    }
  });
  return {
    ok: true,
    error: null
  };
});
const listContacts_createServerFn_handler = createServerRpc({
  id: "4cf58d2d1f1e29b559294f4f1c402c449ddd01d68d7d73f8c008e1fd4419fb00",
  name: "listContacts",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listContacts.__executeServer(opts));
const listContacts = createServerFn({
  method: "GET"
}).handler(listContacts_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    contacts: []
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("leads").select("id, lead_name, phone_number, course_interest, country_interest, created_at").order("created_at", {
    ascending: false
  }).limit(2e3);
  return {
    contacts: data ?? []
  };
});
const listLeadWorkflows_createServerFn_handler = createServerRpc({
  id: "ee41387a2c2f7d1249e4cc0da5bd5c9009aa9ce45c3928daffee0cabd22874b8",
  name: "listLeadWorkflows",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => listLeadWorkflows.__executeServer(opts));
const listLeadWorkflows = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  phone: stringType().min(1).max(60)
}).parse(d)).handler(listLeadWorkflows_createServerFn_handler, async ({
  data
}) => {
  if (!await isAdminOrSuper()) return {
    assigned: [],
    available: []
  };
  const db = await scopedDb();
  const {
    data: enr
  } = await db.from("workflow_enrollments").select("id, workflow_id, status, current_step, goal_at, next_run_at, updated_at").eq("phone_number", data.phone).order("updated_at", {
    ascending: false
  }).limit(100);
  const enrollments = enr ?? [];
  const {
    data: wfRows
  } = await db.from("workflows").select("id, name, enabled").order("name", {
    ascending: true
  });
  const workflows = wfRows ?? [];
  const nameById = new Map(workflows.map((w) => [w.id, w.name]));
  const assigned = enrollments.map((e) => ({
    ...e,
    name: nameById.get(e.workflow_id) ?? "Unknown workflow"
  }));
  const available = workflows.filter((w) => w.enabled).map((w) => ({
    id: w.id,
    name: w.name
  }));
  return {
    assigned,
    available
  };
});
const assignLeadWorkflow_createServerFn_handler = createServerRpc({
  id: "8c801bac72f2ae1b1db8e156395e60d29fc6a9474f900a962737946ed2f80151",
  name: "assignLeadWorkflow",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => assignLeadWorkflow.__executeServer(opts));
const assignLeadWorkflow = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: stringType().min(1).max(60),
  workflowId: stringType().uuid(),
  goalAt: stringType().min(1).max(40).nullable().optional()
}).parse(d)).handler(assignLeadWorkflow_createServerFn_handler, async ({
  data
}) => {
  let me;
  try {
    me = await guard(["super_admin", "admin"]);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    data: wf
  } = await db.from("workflows").select("id, name, enabled").eq("id", data.workflowId).maybeSingle();
  const workflow = wf;
  if (!workflow) return {
    ok: false,
    error: "Workflow not found"
  };
  if (!workflow.enabled) return {
    ok: false,
    error: "This workflow is disabled"
  };
  let goalIso = null;
  if (data.goalAt) {
    const g = new Date(data.goalAt);
    if (isNaN(g.getTime())) return {
      ok: false,
      error: "Invalid goal date"
    };
    goalIso = g.toISOString();
  }
  const {
    data: lead
  } = await db.from("leads").select("id").eq("phone_number", data.phone).maybeSingle();
  const {
    enrollLeadInWorkflowByName
  } = await import("./admissions.server-Dhr9qutG.mjs");
  let status;
  try {
    const res = await enrollLeadInWorkflowByName({
      workflowName: workflow.name,
      phone: data.phone,
      leadId: lead?.id ?? null,
      sendNow: false,
      goalAt: goalIso
    });
    status = res.status;
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to assign workflow"
    };
  }
  if (status === "no_workflow") return {
    ok: false,
    error: "Workflow has no message steps configured"
  };
  if (status === "already_enrolled") return {
    ok: false,
    error: "Lead is already enrolled in this workflow"
  };
  await db.from("audit_logs").insert({
    actor_email: me.email ?? null,
    actor_role: me.role ?? null,
    action: "workflow_assigned",
    entity_type: "lead",
    entity_id: lead?.id ?? null,
    details: {
      phone: data.phone,
      workflow: workflow.name,
      goal_at: goalIso
    }
  });
  return {
    ok: true,
    error: null,
    status
  };
});
const removeLeadWorkflow_createServerFn_handler = createServerRpc({
  id: "25b053a1ae71f696e147e730db4a3880efbd3b2b2a234ab63ea2a7ba8a2491e2",
  name: "removeLeadWorkflow",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => removeLeadWorkflow.__executeServer(opts));
const removeLeadWorkflow = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: stringType().min(1).max(60),
  workflowId: stringType().uuid()
}).parse(d)).handler(removeLeadWorkflow_createServerFn_handler, async ({
  data
}) => {
  let me;
  try {
    me = await guard(["super_admin", "admin"]);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    error
  } = await db.from("workflow_enrollments").delete().eq("phone_number", data.phone).eq("workflow_id", data.workflowId);
  if (error) return {
    ok: false,
    error: error.message
  };
  await db.from("audit_logs").insert({
    actor_email: me.email ?? null,
    actor_role: me.role ?? null,
    action: "workflow_unassigned",
    entity_type: "lead",
    details: {
      phone: data.phone,
      workflow_id: data.workflowId
    }
  });
  return {
    ok: true,
    error: null
  };
});
export {
  assignLeadWorkflow_createServerFn_handler,
  cancelScheduledMessage_createServerFn_handler,
  deleteAiProvider_createServerFn_handler,
  deleteAiVariable_createServerFn_handler,
  deleteHttpAction_createServerFn_handler,
  deleteLead_createServerFn_handler,
  deleteMeetingOutcome_createServerFn_handler,
  deleteResponderAgentVariable_createServerFn_handler,
  deleteResponderAgent_createServerFn_handler,
  deleteWorkflow_createServerFn_handler,
  deleteWorkspace_createServerFn_handler,
  getAiConfig_createServerFn_handler,
  getDashboardStats_createServerFn_handler,
  getMeetingOutcomeStats_createServerFn_handler,
  getSettings_createServerFn_handler,
  listActiveWorkflows_createServerFn_handler,
  listAiProviders_createServerFn_handler,
  listAiVariables_createServerFn_handler,
  listAppointments_createServerFn_handler,
  listContacts_createServerFn_handler,
  listConversationMessages_createServerFn_handler,
  listConversations_createServerFn_handler,
  listHttpActions_createServerFn_handler,
  listLeadWorkflows_createServerFn_handler,
  listLeads_createServerFn_handler,
  listMeetingOutcomes_createServerFn_handler,
  listMessageThreads_createServerFn_handler,
  listMessages_createServerFn_handler,
  listPromptVersions_createServerFn_handler,
  listResponderAgentVariables_createServerFn_handler,
  listResponderAgents_createServerFn_handler,
  listScheduledMessages_createServerFn_handler,
  listWorkflowEnrollments_createServerFn_handler,
  listWorkflowStates_createServerFn_handler,
  listWorkflows_createServerFn_handler,
  listWorkspaces_createServerFn_handler,
  pauseLeadWorkflow_createServerFn_handler,
  processDueWorkflows_createServerFn_handler,
  removeLeadWorkflow_createServerFn_handler,
  reorderAiProviders_createServerFn_handler,
  saveAiConfig_createServerFn_handler,
  saveAiProviderPool_createServerFn_handler,
  saveAiProvider_createServerFn_handler,
  saveMeetingOutcome_createServerFn_handler,
  scheduleMessage_createServerFn_handler,
  seedMeetingOutcomeWorkflows_createServerFn_handler,
  sendHumanMessage_createServerFn_handler,
  setEvolutionWebhook_createServerFn_handler,
  setFallbackEnabled_createServerFn_handler,
  startConversation_createServerFn_handler,
  testAiProviderPool_createServerFn_handler,
  testAiProvider_createServerFn_handler,
  testPrompt_createServerFn_handler,
  testWorkspaceConnection_createServerFn_handler,
  toggleHumanTakeover_createServerFn_handler,
  triggerLeadWorkflow_createServerFn_handler,
  updateAppointmentStatus_createServerFn_handler,
  updateLeadStage_createServerFn_handler,
  updateMeetingOutcome_createServerFn_handler,
  updateSettings_createServerFn_handler,
  upsertAiVariable_createServerFn_handler,
  upsertHttpAction_createServerFn_handler,
  upsertResponderAgentVariable_createServerFn_handler,
  upsertResponderAgent_createServerFn_handler,
  upsertWorkflow_createServerFn_handler,
  upsertWorkspace_createServerFn_handler
};
