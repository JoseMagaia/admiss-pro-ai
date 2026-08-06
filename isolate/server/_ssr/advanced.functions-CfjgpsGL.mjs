import { c as createServerRpc } from "./createServerRpc-Baarst8k.mjs";
import { a as ADVANCED_PERMISSION } from "./roles-vB9M4HoO.mjs";
import { P as PIPELINE_COLUMNS, c as columnForStage } from "./pipeline-BHDikEyF.mjs";
import { c as createServerFn } from "./server-BpMAhPfL.mjs";

import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, b as booleanType, n as numberType, a as arrayType, e as enumType, r as recordType, u as unknownType } from "../_libs/zod.mjs";

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
async function admin() {
  const {
    supabaseAdmin
  } = await import("./client.server-5D-kk_Jp.mjs");
  return supabaseAdmin;
}
async function scopedAdmin() {
  const {
    supabaseAdmin
  } = await import("./client.server-5D-kk_Jp.mjs");
  const {
    makeScopedClient,
    NO_SPACE,
    resolveSpaceContext
  } = await import("./space-context.server-D2TjyZvs.mjs");
  const ctx = await resolveSpaceContext();
  const sid = ctx && (ctx.isSuperAdmin || ctx.status === "active") ? ctx.spaceId : NO_SPACE;
  return makeScopedClient(supabaseAdmin, sid);
}
async function guardAdvanced() {
  const {
    getRequestUser
  } = await import("./role-guard.server-D4B58koo.mjs");
  const u = await getRequestUser();
  if (!u) throw new Error("Unauthorized: please sign in");
  if (u.role === "super_admin") return u;
  const db = await admin();
  const {
    data
  } = await db.from("user_permissions").select("permission").eq("user_id", u.userId).eq("permission", ADVANCED_PERMISSION).maybeSingle();
  if (!data) throw new Error("Forbidden: insufficient permissions");
  return u;
}
async function hasAdvanced() {
  try {
    await guardAdvanced();
    return true;
  } catch {
    return false;
  }
}
const listOffers_createServerFn_handler = createServerRpc({
  id: "aa731155c44b879ab903335fbbe2553bfafaccbb340e57b6136a779062820fe4",
  name: "listOffers",
  filename: "src/lib/advanced.functions.ts"
}, (opts) => listOffers.__executeServer(opts));
const listOffers = createServerFn({
  method: "GET"
}).handler(listOffers_createServerFn_handler, async () => {
  if (!await hasAdvanced()) return {
    offers: [],
    error: "Forbidden"
  };
  const db = await admin();
  const {
    data,
    error
  } = await db.from("offers").select("*").order("created_at", {
    ascending: false
  });
  return {
    offers: data ?? [],
    error: error?.message ?? null
  };
});
const offerSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(200),
  description: stringType().max(2e3).nullable().optional(),
  products: stringType().max(2e3).nullable().optional(),
  stage: stringType().min(1).max(100),
  stages: arrayType(stringType().min(1).max(100)).max(50).optional(),
  default_valuation: numberType().min(0).max(1e9),
  expected_liquidity: numberType().min(0).max(1e9),
  currency: stringType().min(1).max(8),
  enabled: booleanType(),
  pipeline_id: stringType().uuid().nullable().optional()
});
const upsertOffer_createServerFn_handler = createServerRpc({
  id: "a4b0b7d8cee7ea93538428d5b7b68799d44cae751347f84ca8526fdac64369cc",
  name: "upsertOffer",
  filename: "src/lib/advanced.functions.ts"
}, (opts) => upsertOffer.__executeServer(opts));
const upsertOffer = createServerFn({
  method: "POST"
}).inputValidator((d) => offerSchema.parse(d)).handler(upsertOffer_createServerFn_handler, async ({
  data
}) => {
  try {
    await guardAdvanced();
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await admin();
  const {
    id,
    ...rest
  } = data;
  if (id) {
    const {
      error: error2
    } = await db.from("offers").update(rest).eq("id", id);
    return {
      ok: !error2,
      error: error2?.message ?? null
    };
  }
  const {
    error
  } = await db.from("offers").insert(rest);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const deleteOffer_createServerFn_handler = createServerRpc({
  id: "ad4ab0e5a64fac56d2cdf88e298c149c0487349381e29d74143710db753b5ac6",
  name: "deleteOffer",
  filename: "src/lib/advanced.functions.ts"
}, (opts) => deleteOffer.__executeServer(opts));
const deleteOffer = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteOffer_createServerFn_handler, async ({
  data
}) => {
  try {
    await guardAdvanced();
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await admin();
  const {
    error
  } = await db.from("offers").delete().eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const listLeadOpportunities_createServerFn_handler = createServerRpc({
  id: "35e53c6f9bcbf54bb276553c1426073f35ba91fd10d7cd2c87f3f542a3453ac3",
  name: "listLeadOpportunities",
  filename: "src/lib/advanced.functions.ts"
}, (opts) => listLeadOpportunities.__executeServer(opts));
const listLeadOpportunities = createServerFn({
  method: "GET"
}).handler(listLeadOpportunities_createServerFn_handler, async () => {
  if (!await hasAdvanced()) return {
    opportunities: []
  };
  const db = await admin();
  const {
    data
  } = await db.from("lead_opportunities").select("*").limit(5e3);
  return {
    opportunities: data ?? []
  };
});
const upsertLeadOpportunity_createServerFn_handler = createServerRpc({
  id: "388deb8e6034e8877ea6327ba4c528a3333db9a1d5404fdd1172745acf6d0fe6",
  name: "upsertLeadOpportunity",
  filename: "src/lib/advanced.functions.ts"
}, (opts) => upsertLeadOpportunity.__executeServer(opts));
const upsertLeadOpportunity = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  lead_id: stringType().uuid(),
  offer_id: stringType().uuid().nullable().optional(),
  valuation: numberType().min(0).max(1e9),
  liquidity: numberType().min(0).max(1e9),
  notes: stringType().max(2e3).nullable().optional()
}).parse(d)).handler(upsertLeadOpportunity_createServerFn_handler, async ({
  data
}) => {
  try {
    await guardAdvanced();
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await admin();
  const {
    error
  } = await db.from("lead_opportunities").upsert(data, {
    onConflict: "lead_id"
  });
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const listStageSettings_createServerFn_handler = createServerRpc({
  id: "00d37a705f76d0f5cd6958bb87af50a7d275c0d15f4453ac6beef79ac19ee567",
  name: "listStageSettings",
  filename: "src/lib/advanced.functions.ts"
}, (opts) => listStageSettings.__executeServer(opts));
const listStageSettings = createServerFn({
  method: "GET"
}).handler(listStageSettings_createServerFn_handler, async () => {
  if (!await hasAdvanced()) return {
    settings: []
  };
  const db = await admin();
  const {
    data
  } = await db.from("stage_opportunity_settings").select("*").limit(100);
  return {
    settings: data ?? []
  };
});
const upsertStageSetting_createServerFn_handler = createServerRpc({
  id: "df5bdc994b5d58ed12c9624d2d76897bee25682773457a5663b3226d43339e16",
  name: "upsertStageSetting",
  filename: "src/lib/advanced.functions.ts"
}, (opts) => upsertStageSetting.__executeServer(opts));
const upsertStageSetting = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  stage: stringType().min(1).max(100),
  offer_id: stringType().uuid().nullable().optional(),
  valuation: numberType().min(0).max(1e9),
  liquidity: numberType().min(0).max(1e9)
}).parse(d)).handler(upsertStageSetting_createServerFn_handler, async ({
  data
}) => {
  try {
    await guardAdvanced();
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await admin();
  const {
    error
  } = await db.from("stage_opportunity_settings").upsert(data, {
    onConflict: "stage"
  });
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
function dayKey(d) {
  return d.toISOString().slice(0, 10);
}
function bucketByDay(timestamps, days) {
  const buckets = /* @__PURE__ */ new Map();
  const now = /* @__PURE__ */ new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(now.getUTCDate() - i);
    buckets.set(dayKey(d), 0);
  }
  for (const ts of timestamps) {
    const key = ts.slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return Array.from(buckets.entries()).map(([date, count]) => ({
    date,
    count
  }));
}
function bucketByHour(timestamps) {
  const counts = new Array(24).fill(0);
  for (const ts of timestamps) {
    const h = new Date(ts).getUTCHours();
    if (!Number.isNaN(h)) counts[h] += 1;
  }
  return counts.map((count, hour) => ({
    hour,
    count
  }));
}
async function buildAnalytics(days = 14, opts = {}) {
  const db = await admin();
  const since = /* @__PURE__ */ new Date();
  since.setUTCDate(since.getUTCDate() - days);
  const sinceIso = since.toISOString();
  const [{
    data: leads
  }, {
    data: recentMessages
  }, {
    count: messageCount
  }, {
    count: bookingCount
  }, {
    data: opportunities
  }, {
    data: offers
  }] = await Promise.all([db.from("leads").select("id, phone_number, lead_name, qualification_status, created_at, updated_at, course_interest, country_interest").order("updated_at", {
    ascending: false
  }).limit(5e3), db.from("whatsapp_messages").select("received_at, sender").gte("received_at", sinceIso).limit(2e4), db.from("whatsapp_messages").select("*", {
    count: "exact",
    head: true
  }), db.from("appointments").select("*", {
    count: "exact",
    head: true
  }), db.from("lead_opportunities").select("lead_id, valuation, liquidity, offer_id").limit(5e3), db.from("offers").select("id, name, stage").limit(500)]);
  const leadRows = leads ?? [];
  const columnCounts = /* @__PURE__ */ new Map();
  for (const c of PIPELINE_COLUMNS) columnCounts.set(c.id, 0);
  for (const l of leadRows) {
    const col = columnForStage(l.qualification_status);
    columnCounts.set(col.id, (columnCounts.get(col.id) ?? 0) + 1);
  }
  const stageDistribution = PIPELINE_COLUMNS.map((c) => ({
    id: c.id,
    label: c.label,
    count: columnCounts.get(c.id) ?? 0
  }));
  const oppRows = opportunities ?? [];
  const totalValuation = oppRows.reduce((s, o) => s + Number(o.valuation ?? 0), 0);
  const totalLiquidity = oppRows.reduce((s, o) => s + Number(o.liquidity ?? 0), 0);
  const leadsByDay = bucketByDay(leadRows.map((l) => l.created_at).filter(Boolean), days);
  const messagesByDay = bucketByDay((recentMessages ?? []).map((m) => m.received_at), days);
  const messagesByHour = bucketByHour((recentMessages ?? []).map((m) => m.received_at));
  const courseCounts = /* @__PURE__ */ new Map();
  const countryCounts = /* @__PURE__ */ new Map();
  for (const l of leadRows) {
    if (l.course_interest) courseCounts.set(l.course_interest, (courseCounts.get(l.course_interest) ?? 0) + 1);
    if (l.country_interest) countryCounts.set(l.country_interest, (countryCounts.get(l.country_interest) ?? 0) + 1);
  }
  const topCourses = Array.from(courseCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({
    name,
    count
  }));
  const topCountries = Array.from(countryCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({
    name,
    count
  }));
  const qualified = leadRows.filter((l) => ["QUALIFIED", "BOOKING_REQUEST_CREATED"].includes(l.qualification_status)).length;
  const disqualified = leadRows.filter((l) => l.qualification_status === "DISQUALIFIED").length;
  let messageLog;
  let leadDirectory;
  if (opts.includeContent) {
    const {
      data: detailed
    } = await db.from("whatsapp_messages").select("phone_number, sender, received_at, message_content").order("received_at", {
      ascending: false
    }).limit(120);
    messageLog = (detailed ?? []).map((m) => ({
      phone: m.phone_number,
      sender: m.sender,
      at: m.received_at,
      text: String(m.message_content ?? "").slice(0, 500)
    }));
    leadDirectory = leadRows.slice(0, 80).map((l) => ({
      phone: l.phone_number,
      name: l.lead_name,
      stage: l.qualification_status,
      course: l.course_interest,
      country: l.country_interest,
      updated_at: l.updated_at
    }));
  }
  return {
    rangeDays: days,
    totals: {
      leads: leadRows.length,
      qualified,
      disqualified,
      bookings: bookingCount ?? 0,
      messages: messageCount ?? 0,
      offers: (offers ?? []).length
    },
    opportunityTotals: {
      valuation: totalValuation,
      liquidity: totalLiquidity,
      count: oppRows.length
    },
    stageDistribution,
    leadsByDay,
    messagesByDay,
    messagesByHour,
    topCourses,
    topCountries,
    ...messageLog ? {
      messageLog
    } : {},
    ...leadDirectory ? {
      leadDirectory
    } : {}
  };
}
const getReportDashboard_createServerFn_handler = createServerRpc({
  id: "3513636ab79ebf95fb7f672e5b566664e026d5866df0b8fbb366c4c2cf84bf94",
  name: "getReportDashboard",
  filename: "src/lib/advanced.functions.ts"
}, (opts) => getReportDashboard.__executeServer(opts));
const getReportDashboard = createServerFn({
  method: "GET"
}).handler(getReportDashboard_createServerFn_handler, async () => {
  if (!await hasAdvanced()) return {
    analytics: null,
    error: "Forbidden"
  };
  const analytics = await buildAnalytics(14);
  return {
    analytics,
    error: null
  };
});
const modelConfigSchema = objectType({
  mode: enumType(["built_in", "ai_settings", "custom"]).optional(),
  provider: stringType().max(40).nullable().optional(),
  baseUrl: stringType().max(500).nullable().optional(),
  model: stringType().max(160).nullable().optional(),
  apiKey: stringType().max(2e3).nullable().optional()
}).optional();
async function resolveAiTarget(cfg) {
  const mode = cfg?.mode ?? "ai_settings";
  if (mode === "custom") {
    if (!cfg?.baseUrl || !cfg?.apiKey || !cfg?.model) {
      return {
        error: "Custom provider needs a base URL, model and API key."
      };
    }
    const providerName2 = String(cfg.provider ?? "").toLowerCase();
    if (providerName2 === "anthropic") {
      return {
        url: (cfg.baseUrl.replace(/\/+$/, "") || "https://api.anthropic.com") + "/v1/messages",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": cfg.apiKey,
          "anthropic-version": "2023-06-01"
        },
        model: cfg.model,
        nativeAnthropic: true
      };
    }
    return {
      url: cfg.baseUrl.replace(/\/+$/, "") + "/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`
      },
      model: cfg.model
    };
  }
  const db = await admin();
  const {
    data
  } = await db.from("ai_configuration").select("*").order("updated_at", {
    ascending: false
  }).limit(1).maybeSingle();
  const c = data;
  const apiKey = String(c?.custom_api_key ?? "").trim();
  if (!c || !apiKey) {
    return {
      error: "AI is not configured. Add your own provider and API key in Settings → AI Provider."
    };
  }
  const providerName = String(c.custom_provider ?? "").toLowerCase();
  if (providerName === "anthropic") {
    return {
      url: (String(c.custom_base_url ?? "").replace(/\/+$/, "") || "https://api.anthropic.com") + "/v1/messages",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      model: String(c.custom_model || c.model || "claude-3-5-sonnet-latest"),
      nativeAnthropic: true
    };
  }
  if (!c.custom_base_url) {
    return {
      error: "AI provider is missing a base URL. Fix it in Settings → AI Provider."
    };
  }
  return {
    url: String(c.custom_base_url).replace(/\/+$/, "") + "/chat/completions",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    model: String(c.custom_model || c.model || "gpt-4o-mini")
  };
}
const generateReport_createServerFn_handler = createServerRpc({
  id: "2c2cdf22ef130c8637595a54d48f42d915291b312305fe594ee940274727155c",
  name: "generateReport",
  filename: "src/lib/advanced.functions.ts"
}, (opts) => generateReport.__executeServer(opts));
const generateReport = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  prompt: stringType().min(1).max(4e3),
  days: numberType().int().min(1).max(365).optional()
}).parse(d)).handler(generateReport_createServerFn_handler, async ({
  data
}) => {
  try {
    await guardAdvanced();
  } catch (e) {
    return {
      report: "",
      error: e.message
    };
  }
  const target = await resolveAiTarget({
    mode: "ai_settings"
  });
  if ("error" in target) return {
    report: "",
    error: target.error
  };
  const analytics = await buildAnalytics(data.days ?? 30);
  const system = `You are a senior revenue & growth analyst for an international education admissions company.
You will be given a JSON snapshot of the platform's analytics. Answer the user's request using ONLY this data.
Write a clear, well-structured report in GitHub-flavored Markdown.
Guidelines:
- Start with a short "## Executive Summary".
- Use "##" / "###" headings, bullet lists and Markdown tables where useful.
- When you cite numbers, use the data provided (do not invent figures).
- Include a "## Insights" section and a "## Recommendations" section with concrete, revenue-focused actions.
- Be concise and skimmable. Do not include code blocks or JSON in the output.`;
  const userMsg = `User request: ${data.prompt}

Analytics snapshot (last ${analytics.rangeDays} days where time-based):
${JSON.stringify(analytics, null, 2)}`;
  try {
    const res = await fetch(target.url, {
      method: "POST",
      headers: target.headers,
      body: target.nativeAnthropic ? JSON.stringify({
        model: target.model,
        max_tokens: 2048,
        temperature: 0.4,
        system,
        messages: [{
          role: "user",
          content: userMsg
        }]
      }) : JSON.stringify({
        model: target.model,
        temperature: 0.4,
        messages: [{
          role: "system",
          content: system
        }, {
          role: "user",
          content: userMsg
        }]
      })
    });
    if (!res.ok) {
      let msg = `AI error ${res.status}`;
      if (res.status === 429) msg = "Rate limit reached. Please retry shortly.";
      if (res.status === 402) msg = "AI credits exhausted. Add credits in workspace settings.";
      return {
        report: "",
        error: msg
      };
    }
    const json = await res.json();
    const report = target.nativeAnthropic ? Array.isArray(json?.content) ? json.content.map((c) => c?.text ?? "").join("") : "" : json?.choices?.[0]?.message?.content ?? "";
    return {
      report,
      error: report ? null : "Empty response from AI."
    };
  } catch (e) {
    return {
      report: "",
      error: e instanceof Error ? e.message : "AI request failed"
    };
  }
});
const chatMessageSchema = objectType({
  role: enumType(["user", "assistant"]),
  content: stringType().min(1).max(2e4)
});
const generateChatReply_createServerFn_handler = createServerRpc({
  id: "ac0297c0358c09ca8175b3f59846a6e28294069e71be6e665bce70954f15da38",
  name: "generateChatReply",
  filename: "src/lib/advanced.functions.ts"
}, (opts) => generateChatReply.__executeServer(opts));
const generateChatReply = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  messages: arrayType(chatMessageSchema).min(1).max(40),
  days: numberType().int().min(1).max(365).optional(),
  deepContent: booleanType().optional(),
  model: modelConfigSchema
}).parse(d)).handler(generateChatReply_createServerFn_handler, async ({
  data
}) => {
  try {
    await guardAdvanced();
  } catch (e) {
    return {
      reply: "",
      error: e.message
    };
  }
  const target = await resolveAiTarget(data.model);
  if ("error" in target) return {
    reply: "",
    error: target.error
  };
  const analytics = await buildAnalytics(data.days ?? 30, {
    includeContent: data.deepContent ?? true
  });
  const system = `You are a senior revenue & growth analyst for an international education admissions company, having an ongoing conversation with an admissions manager.
You are given a JSON snapshot of the platform's live analytics. Answer using ONLY this data and the conversation so far.
The snapshot may include a "messageLog" (recent WhatsApp message contents with timestamps and the lead's phone) and a "leadDirectory" (recent leads with phone, name, stage and interests) — use these to answer questions about specific message contents, timing, or particular leads.
Guidelines:
- Respond conversationally and directly to the latest question, referencing earlier turns when relevant.
- By default keep replies short, conversational and skimmable. Do NOT produce a long formal document/report unless the user explicitly asks for a report, document, write-up, or download on a specific topic. When they do, structure it as a full report with clear headings and sections.
- Format answers in GitHub-flavored Markdown using headings, bullet lists and tables where useful.
- When you cite numbers, use the data provided (do not invent figures). If something cannot be answered from the data, say so.
- Keep insights revenue-focused. Do not output code blocks or raw JSON.

Analytics snapshot (last ${analytics.rangeDays} days where time-based):
${JSON.stringify(analytics)}`;
  try {
    const res = await fetch(target.url, {
      method: "POST",
      headers: target.headers,
      body: target.nativeAnthropic ? JSON.stringify({
        model: target.model,
        max_tokens: 2048,
        temperature: 0.4,
        system,
        messages: [{
          role: "user",
          content: data.messages.map((m) => m.content).join("\n\n")
        }]
      }) : JSON.stringify({
        model: target.model,
        temperature: 0.4,
        messages: [{
          role: "system",
          content: system
        }, ...data.messages]
      })
    });
    if (!res.ok) {
      let msg = `AI error ${res.status}`;
      if (res.status === 429) msg = "Rate limit reached. Please retry shortly.";
      if (res.status === 402) msg = "AI credits exhausted. Add credits in workspace settings.";
      return {
        reply: "",
        error: msg
      };
    }
    const json = await res.json();
    const reply = target.nativeAnthropic ? Array.isArray(json?.content) ? json.content.map((c) => c?.text ?? "").join("") : "" : json?.choices?.[0]?.message?.content ?? "";
    return {
      reply,
      error: reply ? null : "Empty response from AI."
    };
  } catch (e) {
    return {
      reply: "",
      error: e instanceof Error ? e.message : "AI request failed"
    };
  }
});
const listConversations_createServerFn_handler = createServerRpc({
  id: "f26db4cd0d46d8e37a39bfb82aac17baa1e813b543f4182a529f582eb4e1ac49",
  name: "listConversations",
  filename: "src/lib/advanced.functions.ts"
}, (opts) => listConversations.__executeServer(opts));
const listConversations = createServerFn({
  method: "GET"
}).handler(listConversations_createServerFn_handler, async () => {
  let user;
  try {
    user = await guardAdvanced();
  } catch {
    return {
      conversations: []
    };
  }
  const db = await admin();
  const {
    data
  } = await db.from("report_conversations").select("*").eq("user_id", user.userId).order("updated_at", {
    ascending: false
  }).limit(200);
  return {
    conversations: data ?? []
  };
});
const saveConversation_createServerFn_handler = createServerRpc({
  id: "2221cb2a72ee74292562bf1dc073cf06bb52922e96276f0d2b9130feb3ea0ca2",
  name: "saveConversation",
  filename: "src/lib/advanced.functions.ts"
}, (opts) => saveConversation.__executeServer(opts));
const saveConversation = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  title: stringType().min(1).max(200),
  messages: arrayType(chatMessageSchema).min(1).max(60)
}).parse(d)).handler(saveConversation_createServerFn_handler, async ({
  data
}) => {
  let user;
  try {
    user = await guardAdvanced();
  } catch (e) {
    return {
      ok: false,
      id: null,
      error: e.message
    };
  }
  const db = await admin();
  if (data.id) {
    const {
      error: error2
    } = await db.from("report_conversations").update({
      title: data.title,
      messages: data.messages
    }).eq("id", data.id).eq("user_id", user.userId);
    return {
      ok: !error2,
      id: data.id,
      error: error2?.message ?? null
    };
  }
  const {
    data: inserted,
    error
  } = await db.from("report_conversations").insert({
    title: data.title,
    messages: data.messages,
    user_id: user.userId
  }).select("id").single();
  return {
    ok: !error,
    id: inserted?.id ?? null,
    error: error?.message ?? null
  };
});
const deleteConversation_createServerFn_handler = createServerRpc({
  id: "0f91df053876de7855f9ca6e95ac99a5e7cadd97917e7922b6dabc99e4e47844",
  name: "deleteConversation",
  filename: "src/lib/advanced.functions.ts"
}, (opts) => deleteConversation.__executeServer(opts));
const deleteConversation = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteConversation_createServerFn_handler, async ({
  data
}) => {
  let user;
  try {
    user = await guardAdvanced();
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await admin();
  const {
    error
  } = await db.from("report_conversations").delete().eq("id", data.id).eq("user_id", user.userId);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const AGENT_TOOLS = [{
  type: "function",
  function: {
    name: "move_lead_stage",
    description: "Move a lead to a different pipeline qualification status.",
    parameters: {
      type: "object",
      properties: {
        phone: {
          type: "string",
          description: "The lead's phone number."
        },
        qualification_status: {
          type: "string",
          description: "The new qualification status, e.g. NEW_LEAD, IN_PROGRESS, QUALIFIED, BOOKING_REQUEST_CREATED, ONBOARDING, DISQUALIFIED. Prefer a value already seen in leadDirectory."
        }
      },
      required: ["phone", "qualification_status"]
    }
  }
}, {
  type: "function",
  function: {
    name: "update_lead",
    description: "Update editable fields on a lead.",
    parameters: {
      type: "object",
      properties: {
        phone: {
          type: "string"
        },
        lead_name: {
          type: "string"
        },
        course_interest: {
          type: "string"
        },
        country_interest: {
          type: "string"
        },
        notes: {
          type: "string"
        }
      },
      required: ["phone"]
    }
  }
}, {
  type: "function",
  function: {
    name: "assign_workflow",
    description: "Enrol a lead into an outbound workflow by its exact name.",
    parameters: {
      type: "object",
      properties: {
        phone: {
          type: "string"
        },
        workflow_name: {
          type: "string"
        },
        goal_at: {
          type: "string",
          description: "Optional ISO date for countdown steps (e.g. 2026-07-01)."
        }
      },
      required: ["phone", "workflow_name"]
    }
  }
}, {
  type: "function",
  function: {
    name: "remove_workflow",
    description: "Remove a lead from a workflow by its exact name.",
    parameters: {
      type: "object",
      properties: {
        phone: {
          type: "string"
        },
        workflow_name: {
          type: "string"
        }
      },
      required: ["phone", "workflow_name"]
    }
  }
}, {
  type: "function",
  function: {
    name: "set_opportunity",
    description: "Set the opportunity valuation and expected liquidity for a lead.",
    parameters: {
      type: "object",
      properties: {
        phone: {
          type: "string"
        },
        valuation: {
          type: "number"
        },
        liquidity: {
          type: "number"
        }
      },
      required: ["phone"]
    }
  }
}, {
  type: "function",
  function: {
    name: "upsert_ai_variable",
    description: "Create or update an AI variable. If a variable with the same name exists it is updated, otherwise created.",
    parameters: {
      type: "object",
      properties: {
        variable_name: {
          type: "string",
          description: "UPPER_SNAKE_CASE name, e.g. TUITION_FEE."
        },
        variable_value: {
          type: "string"
        },
        description: {
          type: "string"
        }
      },
      required: ["variable_name", "variable_value"]
    }
  }
}, {
  type: "function",
  function: {
    name: "delete_ai_variable",
    description: "Delete an AI variable by its exact name.",
    parameters: {
      type: "object",
      properties: {
        variable_name: {
          type: "string"
        }
      },
      required: ["variable_name"]
    }
  }
}, {
  type: "function",
  function: {
    name: "create_workflow",
    description: "Create a new outbound workflow.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string"
        },
        description: {
          type: "string"
        },
        trigger_type: {
          type: "string",
          description: "One of: manual, pipeline_stage. Defaults to manual."
        },
        enabled: {
          type: "boolean"
        }
      },
      required: ["name"]
    }
  }
}, {
  type: "function",
  function: {
    name: "update_workflow",
    description: "Update an existing workflow identified by its current exact name.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The workflow's current name."
        },
        new_name: {
          type: "string"
        },
        description: {
          type: "string"
        },
        enabled: {
          type: "boolean"
        }
      },
      required: ["name"]
    }
  }
}, {
  type: "function",
  function: {
    name: "create_responder_agent",
    description: "Create a new responder agent.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string"
        },
        description: {
          type: "string"
        },
        system_prompt: {
          type: "string"
        },
        enabled: {
          type: "boolean"
        }
      },
      required: ["name"]
    }
  }
}, {
  type: "function",
  function: {
    name: "update_responder_agent",
    description: "Update an existing responder agent identified by its current exact name.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The agent's current name."
        },
        new_name: {
          type: "string"
        },
        description: {
          type: "string"
        },
        system_prompt: {
          type: "string"
        },
        enabled: {
          type: "boolean"
        }
      },
      required: ["name"]
    }
  }
}, {
  type: "function",
  function: {
    name: "create_http_action",
    description: "Create a new outbound HTTP action (webhook).",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string"
        },
        trigger_stage: {
          type: "string",
          description: "The pipeline stage that fires this action."
        },
        url: {
          type: "string"
        },
        method: {
          type: "string",
          description: "POST, GET, PUT or PATCH. Defaults to POST."
        },
        payload_template: {
          type: "string",
          description: "JSON body template; may use {{variables}}."
        },
        enabled: {
          type: "boolean"
        }
      },
      required: ["name", "trigger_stage", "url"]
    }
  }
}, {
  type: "function",
  function: {
    name: "update_http_action",
    description: "Update an existing HTTP action identified by its current exact name.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The action's current name."
        },
        new_name: {
          type: "string"
        },
        trigger_stage: {
          type: "string"
        },
        url: {
          type: "string"
        },
        method: {
          type: "string"
        },
        payload_template: {
          type: "string"
        },
        enabled: {
          type: "boolean"
        }
      },
      required: ["name"]
    }
  }
}];
const generateAgentReply_createServerFn_handler = createServerRpc({
  id: "6f92326e3fd40ca9d279909c087a509aae4e6fee844c5f68d7056e79ea106138",
  name: "generateAgentReply",
  filename: "src/lib/advanced.functions.ts"
}, (opts) => generateAgentReply.__executeServer(opts));
const generateAgentReply = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  messages: arrayType(chatMessageSchema).min(1).max(40),
  days: numberType().int().min(1).max(365).optional(),
  model: modelConfigSchema
}).parse(d)).handler(generateAgentReply_createServerFn_handler, async ({
  data
}) => {
  try {
    await guardAdvanced();
  } catch (e) {
    return {
      reply: "",
      actions: [],
      error: e.message
    };
  }
  const target = await resolveAiTarget(data.model);
  if ("error" in target) return {
    reply: "",
    actions: [],
    error: target.error
  };
  const analytics = await buildAnalytics(data.days ?? 30, {
    includeContent: true
  });
  const db = await scopedAdmin();
  const [{
    data: wfRows
  }, {
    data: varRows
  }, {
    data: agentRows
  }, {
    data: actionRows
  }] = await Promise.all([db.from("workflows").select("name, enabled, description").limit(200), db.from("ai_variables").select("variable_name, description").limit(300), db.from("responder_agents").select("name, enabled").limit(200), db.from("http_actions").select("name, trigger_stage, method, enabled").limit(200)]);
  const workflows = wfRows ?? [];
  const workflowNames = workflows.filter((w) => w.enabled).map((w) => w.name);
  const catalogue = {
    workflows,
    aiVariables: varRows ?? [],
    responderAgents: agentRows ?? [],
    httpActions: actionRows ?? []
  };
  const system = `You are an agentic operations assistant for an international education admissions platform.
You can both answer questions AND take actions on the platform by calling the provided tools.
You are given a JSON analytics snapshot including a "leadDirectory" (leads with phone, name, stage, interests) and a "messageLog" (recent message contents/timestamps). Use these to identify the right lead phone numbers.
You are also given a "catalogue" of the current configuration: workflows, AI variables, responder agents and HTTP actions. Use the EXACT names from the catalogue when editing existing items.
Available workflow names for assign/remove: ${JSON.stringify(workflowNames)}.
Rules:
- When the user asks you to change something — move/edit a lead, assign/remove a workflow, set opportunity values, create or edit an AI variable, create or edit a workflow, create or edit a responder agent, or create or edit an HTTP action — call the appropriate tool with concrete arguments. You may call several tools in one turn.
- AI variable names must be UPPER_SNAKE_CASE (letters, numbers, underscores).
- Each tool call is only a PROPOSAL — a human will approve or reject it before it runs. Briefly describe what you are proposing in your text reply.
- Only act on leads that exist in the data, and only edit configuration items that exist in the catalogue. If you cannot find the item or required info, ask for clarification instead of guessing.
- For analysis-only questions, just answer in concise Markdown without calling tools.

Configuration catalogue:
${JSON.stringify(catalogue)}

Analytics snapshot (last ${analytics.rangeDays} days where time-based):
${JSON.stringify(analytics)}`;
  try {
    const res = await fetch(target.url, {
      method: "POST",
      headers: target.headers,
      body: JSON.stringify({
        model: target.model,
        temperature: 0.3,
        tools: AGENT_TOOLS,
        tool_choice: "auto",
        messages: [{
          role: "system",
          content: system
        }, ...data.messages]
      })
    });
    if (!res.ok) {
      let msg = `AI error ${res.status}`;
      if (res.status === 429) msg = "Rate limit reached. Please retry shortly.";
      if (res.status === 402) msg = "AI credits exhausted. Add credits in workspace settings.";
      return {
        reply: "",
        actions: [],
        error: msg
      };
    }
    const json = await res.json();
    const message = json?.choices?.[0]?.message ?? {};
    const reply = String(message.content ?? "");
    const rawCalls = Array.isArray(message.tool_calls) ? message.tool_calls : [];
    const actions = rawCalls.map((c) => {
      let args = {};
      try {
        args = JSON.parse(c.function?.arguments ?? "{}");
      } catch {
        args = {};
      }
      return {
        id: c.id ?? crypto.randomUUID(),
        name: c.function?.name ?? "",
        args
      };
    }).filter((a) => a.name);
    return {
      reply: reply || (actions.length ? "I've prepared the following actions for your approval." : ""),
      actions,
      error: null
    };
  } catch (e) {
    return {
      reply: "",
      actions: [],
      error: e instanceof Error ? e.message : "AI request failed"
    };
  }
});
const CONFIG_ACTIONS = /* @__PURE__ */ new Set(["upsert_ai_variable", "delete_ai_variable", "create_workflow", "update_workflow", "create_responder_agent", "update_responder_agent", "create_http_action", "update_http_action"]);
const str = (v) => typeof v === "string" ? v.trim() : "";
const VALID_METHODS = /* @__PURE__ */ new Set(["POST", "GET", "PUT", "PATCH"]);
async function executeConfigAction(db, name, args, audit) {
  if (!CONFIG_ACTIONS.has(name)) return null;
  try {
    if (name === "upsert_ai_variable") {
      const varName = str(args.variable_name).toUpperCase();
      if (!/^[A-Z0-9_]+$/.test(varName)) return {
        ok: false,
        error: "Variable name must be UPPER_SNAKE_CASE."
      };
      const value = typeof args.variable_value === "string" ? args.variable_value.slice(0, 2e3) : "";
      const description = typeof args.description === "string" ? args.description.slice(0, 500) : null;
      const {
        data: existing
      } = await db.from("ai_variables").select("id").eq("variable_name", varName).maybeSingle();
      const exId = existing?.id;
      if (exId) {
        const {
          error: error2
        } = await db.from("ai_variables").update({
          variable_value: value,
          description
        }).eq("id", exId);
        if (error2) return {
          ok: false,
          error: error2.message
        };
        await audit("ai_variable_updated", "ai_variable", exId, {
          variable_name: varName
        });
        return {
          ok: true,
          error: null,
          result: `Updated variable ${varName}`
        };
      }
      const {
        error
      } = await db.from("ai_variables").insert({
        variable_name: varName,
        variable_value: value,
        description
      });
      if (error) return {
        ok: false,
        error: error.message
      };
      await audit("ai_variable_created", "ai_variable", null, {
        variable_name: varName
      });
      return {
        ok: true,
        error: null,
        result: `Created variable ${varName}`
      };
    }
    if (name === "delete_ai_variable") {
      const varName = str(args.variable_name).toUpperCase();
      if (!varName) return {
        ok: false,
        error: "Missing variable name."
      };
      const {
        data: existing
      } = await db.from("ai_variables").select("id").eq("variable_name", varName).maybeSingle();
      const exId = existing?.id;
      if (!exId) return {
        ok: false,
        error: "Variable not found."
      };
      const {
        error
      } = await db.from("ai_variables").delete().eq("id", exId);
      if (error) return {
        ok: false,
        error: error.message
      };
      await audit("ai_variable_deleted", "ai_variable", exId, {
        variable_name: varName
      });
      return {
        ok: true,
        error: null,
        result: `Deleted variable ${varName}`
      };
    }
    if (name === "create_workflow") {
      const wfName = str(args.name);
      if (!wfName) return {
        ok: false,
        error: "Missing workflow name."
      };
      const triggerType = str(args.trigger_type) === "pipeline_stage" ? "pipeline_stage" : "manual";
      const {
        data: created,
        error
      } = await db.from("workflows").insert({
        name: wfName,
        description: typeof args.description === "string" ? args.description.slice(0, 1e3) : null,
        enabled: typeof args.enabled === "boolean" ? args.enabled : false,
        trigger_type: triggerType,
        trigger_segment: "manual",
        trigger_config: {},
        graph: {}
      }).select("id").single();
      if (error) return {
        ok: false,
        error: error.message
      };
      await audit("ai_workflow_created", "workflow", created?.id ?? null, {
        name: wfName
      });
      return {
        ok: true,
        error: null,
        result: `Created workflow "${wfName}"`
      };
    }
    if (name === "update_workflow") {
      const wfName = str(args.name);
      if (!wfName) return {
        ok: false,
        error: "Missing workflow name."
      };
      const {
        data: wf
      } = await db.from("workflows").select("id").ilike("name", wfName).maybeSingle();
      const wfId = wf?.id;
      if (!wfId) return {
        ok: false,
        error: "Workflow not found."
      };
      const patch = {};
      if (str(args.new_name)) patch.name = str(args.new_name);
      if (typeof args.description === "string") patch.description = args.description.slice(0, 1e3);
      if (typeof args.enabled === "boolean") patch.enabled = args.enabled;
      if (Object.keys(patch).length === 0) return {
        ok: false,
        error: "No fields to update."
      };
      const {
        error
      } = await db.from("workflows").update(patch).eq("id", wfId);
      if (error) return {
        ok: false,
        error: error.message
      };
      await audit("ai_workflow_updated", "workflow", wfId, {
        name: wfName,
        fields: Object.keys(patch)
      });
      return {
        ok: true,
        error: null,
        result: `Updated workflow "${wfName}"`
      };
    }
    if (name === "create_responder_agent") {
      const agName = str(args.name);
      if (!agName) return {
        ok: false,
        error: "Missing agent name."
      };
      const {
        data: created,
        error
      } = await db.from("responder_agents").insert({
        name: agName,
        description: typeof args.description === "string" ? args.description.slice(0, 1e3) : null,
        system_prompt: typeof args.system_prompt === "string" ? args.system_prompt.slice(0, 2e4) : "",
        enabled: typeof args.enabled === "boolean" ? args.enabled : true
      }).select("id").single();
      if (error) return {
        ok: false,
        error: error.message
      };
      await audit("ai_responder_agent_created", "responder_agent", created?.id ?? null, {
        name: agName
      });
      return {
        ok: true,
        error: null,
        result: `Created responder agent "${agName}"`
      };
    }
    if (name === "update_responder_agent") {
      const agName = str(args.name);
      if (!agName) return {
        ok: false,
        error: "Missing agent name."
      };
      const {
        data: ag
      } = await db.from("responder_agents").select("id").ilike("name", agName).maybeSingle();
      const agId = ag?.id;
      if (!agId) return {
        ok: false,
        error: "Responder agent not found."
      };
      const patch = {};
      if (str(args.new_name)) patch.name = str(args.new_name);
      if (typeof args.description === "string") patch.description = args.description.slice(0, 1e3);
      if (typeof args.system_prompt === "string") patch.system_prompt = args.system_prompt.slice(0, 2e4);
      if (typeof args.enabled === "boolean") patch.enabled = args.enabled;
      if (Object.keys(patch).length === 0) return {
        ok: false,
        error: "No fields to update."
      };
      const {
        error
      } = await db.from("responder_agents").update(patch).eq("id", agId);
      if (error) return {
        ok: false,
        error: error.message
      };
      await audit("ai_responder_agent_updated", "responder_agent", agId, {
        name: agName,
        fields: Object.keys(patch)
      });
      return {
        ok: true,
        error: null,
        result: `Updated responder agent "${agName}"`
      };
    }
    if (name === "create_http_action") {
      const acName = str(args.name);
      const triggerStage = str(args.trigger_stage);
      const url = str(args.url);
      if (!acName || !triggerStage || !url) return {
        ok: false,
        error: "Name, trigger stage and URL are required."
      };
      if (!/^https?:\/\//i.test(url)) return {
        ok: false,
        error: "URL must start with http:// or https://."
      };
      const method = VALID_METHODS.has(str(args.method).toUpperCase()) ? str(args.method).toUpperCase() : "POST";
      const {
        data: created,
        error
      } = await db.from("http_actions").insert({
        name: acName,
        trigger_stage: triggerStage,
        url,
        method,
        headers: {},
        payload_template: typeof args.payload_template === "string" ? args.payload_template.slice(0, 1e4) : "{}",
        enabled: typeof args.enabled === "boolean" ? args.enabled : true
      }).select("id").single();
      if (error) return {
        ok: false,
        error: error.message
      };
      await audit("ai_http_action_created", "http_action", created?.id ?? null, {
        name: acName
      });
      return {
        ok: true,
        error: null,
        result: `Created HTTP action "${acName}"`
      };
    }
    if (name === "update_http_action") {
      const acName = str(args.name);
      if (!acName) return {
        ok: false,
        error: "Missing action name."
      };
      const {
        data: ac
      } = await db.from("http_actions").select("id").ilike("name", acName).maybeSingle();
      const acId = ac?.id;
      if (!acId) return {
        ok: false,
        error: "HTTP action not found."
      };
      const patch = {};
      if (str(args.new_name)) patch.name = str(args.new_name);
      if (str(args.trigger_stage)) patch.trigger_stage = str(args.trigger_stage);
      if (str(args.url)) {
        const url = str(args.url);
        if (!/^https?:\/\//i.test(url)) return {
          ok: false,
          error: "URL must start with http:// or https://."
        };
        patch.url = url;
      }
      if (VALID_METHODS.has(str(args.method).toUpperCase())) patch.method = str(args.method).toUpperCase();
      if (typeof args.payload_template === "string") patch.payload_template = args.payload_template.slice(0, 1e4);
      if (typeof args.enabled === "boolean") patch.enabled = args.enabled;
      if (Object.keys(patch).length === 0) return {
        ok: false,
        error: "No fields to update."
      };
      const {
        error
      } = await db.from("http_actions").update(patch).eq("id", acId);
      if (error) return {
        ok: false,
        error: error.message
      };
      await audit("ai_http_action_updated", "http_action", acId, {
        name: acName,
        fields: Object.keys(patch)
      });
      return {
        ok: true,
        error: null,
        result: `Updated HTTP action "${acName}"`
      };
    }
    return {
      ok: false,
      error: "Unknown configuration action."
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Action failed"
    };
  }
}
const executeAgentAction_createServerFn_handler = createServerRpc({
  id: "743d522a1acc4a7eee1e7188b0fb967b0b6915f5ead7d2fa04cf4c76f0036e80",
  name: "executeAgentAction",
  filename: "src/lib/advanced.functions.ts"
}, (opts) => executeAgentAction.__executeServer(opts));
const executeAgentAction = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  name: enumType(["move_lead_stage", "update_lead", "assign_workflow", "remove_workflow", "set_opportunity", "upsert_ai_variable", "delete_ai_variable", "create_workflow", "update_workflow", "create_responder_agent", "update_responder_agent", "create_http_action", "update_http_action"]),
  args: recordType(stringType(), unknownType())
}).parse(d)).handler(executeAgentAction_createServerFn_handler, async ({
  data
}) => {
  let user;
  try {
    user = await guardAdvanced();
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedAdmin();
  const args = data.args;
  const auditCfg = async (action, entityType, entityId, details) => {
    await db.from("audit_logs").insert({
      actor_email: user.email ?? null,
      actor_role: user.role ?? null,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: {
        ...details,
        via: "ai_agent"
      }
    });
  };
  const cfg = await executeConfigAction(db, data.name, args, auditCfg);
  if (cfg) return cfg;
  const phone = typeof args.phone === "string" ? args.phone.trim() : "";
  if (!phone) return {
    ok: false,
    error: "Action is missing a lead phone number."
  };
  const {
    data: leadRow
  } = await db.from("leads").select("id").eq("phone_number", phone).maybeSingle();
  const leadId = leadRow?.id ?? null;
  const audit = async (action, details) => {
    await db.from("audit_logs").insert({
      actor_email: user.email ?? null,
      actor_role: user.role ?? null,
      action,
      entity_type: "lead",
      entity_id: leadId,
      details: {
        ...details,
        phone,
        via: "ai_agent"
      }
    });
  };
  try {
    if (data.name === "move_lead_stage") {
      const status = typeof args.qualification_status === "string" ? args.qualification_status.trim() : "";
      if (!status) return {
        ok: false,
        error: "Missing qualification status."
      };
      if (!leadId) return {
        ok: false,
        error: "Lead not found."
      };
      const {
        error
      } = await db.from("leads").update({
        qualification_status: status
      }).eq("phone_number", phone);
      if (error) return {
        ok: false,
        error: error.message
      };
      await audit("ai_lead_stage_changed", {
        qualification_status: status
      });
      return {
        ok: true,
        error: null,
        result: `Moved to ${status}`
      };
    }
    if (data.name === "update_lead") {
      if (!leadId) return {
        ok: false,
        error: "Lead not found."
      };
      const patch = {};
      for (const f of ["lead_name", "course_interest", "country_interest", "notes"]) {
        if (typeof args[f] === "string" && args[f]) patch[f] = String(args[f]).slice(0, 2e3);
      }
      if (Object.keys(patch).length === 0) return {
        ok: false,
        error: "No fields to update."
      };
      const {
        error
      } = await db.from("leads").update(patch).eq("phone_number", phone);
      if (error) return {
        ok: false,
        error: error.message
      };
      await audit("ai_lead_updated", {
        fields: Object.keys(patch)
      });
      return {
        ok: true,
        error: null,
        result: `Updated ${Object.keys(patch).join(", ")}`
      };
    }
    if (data.name === "assign_workflow") {
      const wfName = typeof args.workflow_name === "string" ? args.workflow_name.trim() : "";
      if (!wfName) return {
        ok: false,
        error: "Missing workflow name."
      };
      let goalIso = null;
      if (typeof args.goal_at === "string" && args.goal_at) {
        const g = new Date(args.goal_at);
        if (!isNaN(g.getTime())) goalIso = g.toISOString();
      }
      const {
        enrollLeadInWorkflowByName
      } = await import("./admissions.server-Dhr9qutG.mjs");
      const res = await enrollLeadInWorkflowByName({
        workflowName: wfName,
        phone,
        leadId,
        sendNow: false,
        goalAt: goalIso
      });
      if (res.status === "no_workflow") return {
        ok: false,
        error: "Workflow not found or has no steps."
      };
      if (res.status === "already_enrolled") return {
        ok: false,
        error: "Lead is already in this workflow."
      };
      await audit("ai_workflow_assigned", {
        workflow: wfName,
        goal_at: goalIso
      });
      return {
        ok: true,
        error: null,
        result: `Assigned "${wfName}"`
      };
    }
    if (data.name === "remove_workflow") {
      const wfName = typeof args.workflow_name === "string" ? args.workflow_name.trim() : "";
      if (!wfName) return {
        ok: false,
        error: "Missing workflow name."
      };
      const {
        data: wf
      } = await db.from("workflows").select("id").ilike("name", wfName).maybeSingle();
      const wfId = wf?.id;
      if (!wfId) return {
        ok: false,
        error: "Workflow not found."
      };
      const {
        error
      } = await db.from("workflow_enrollments").delete().eq("phone_number", phone).eq("workflow_id", wfId);
      if (error) return {
        ok: false,
        error: error.message
      };
      await audit("ai_workflow_unassigned", {
        workflow: wfName
      });
      return {
        ok: true,
        error: null,
        result: `Removed "${wfName}"`
      };
    }
    if (data.name === "set_opportunity") {
      if (!leadId) return {
        ok: false,
        error: "Lead not found."
      };
      const valuation = Math.max(0, Math.min(1e9, Number(args.valuation ?? 0)));
      const liquidity = Math.max(0, Math.min(1e9, Number(args.liquidity ?? 0)));
      const {
        error
      } = await db.from("lead_opportunities").upsert({
        lead_id: leadId,
        valuation,
        liquidity
      }, {
        onConflict: "lead_id"
      });
      if (error) return {
        ok: false,
        error: error.message
      };
      await audit("ai_opportunity_set", {
        valuation,
        liquidity
      });
      return {
        ok: true,
        error: null,
        result: `Set valuation ${valuation}, liquidity ${liquidity}`
      };
    }
    return {
      ok: false,
      error: "Unknown action."
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Action failed"
    };
  }
});
export {
  deleteConversation_createServerFn_handler,
  deleteOffer_createServerFn_handler,
  executeAgentAction_createServerFn_handler,
  generateAgentReply_createServerFn_handler,
  generateChatReply_createServerFn_handler,
  generateReport_createServerFn_handler,
  getReportDashboard_createServerFn_handler,
  listConversations_createServerFn_handler,
  listLeadOpportunities_createServerFn_handler,
  listOffers_createServerFn_handler,
  listStageSettings_createServerFn_handler,
  saveConversation_createServerFn_handler,
  upsertLeadOpportunity_createServerFn_handler,
  upsertOffer_createServerFn_handler,
  upsertStageSetting_createServerFn_handler
};
