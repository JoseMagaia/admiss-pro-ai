import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ADVANCED_PERMISSION } from "@/lib/roles";
import { PIPELINE_COLUMNS, columnForStage } from "@/lib/pipeline";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

// Service-role client scoped to the caller's active Space, so agentic actions
// read and write only within the selected sub-account.
async function scopedAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { makeScopedClient, NO_SPACE, resolveSpaceContext } = await import("./space-context.server");
  const ctx = await resolveSpaceContext();
  const sid = ctx && (ctx.isSuperAdmin || ctx.status === "active") ? ctx.spaceId : NO_SPACE;
  return makeScopedClient(supabaseAdmin, sid);
}

// Allow super admins and users granted the "advanced" permission.
async function guardAdvanced() {
  const { getRequestUser } = await import("@/integrations/supabase/role-guard.server");
  const u = await getRequestUser();
  if (!u) throw new Error("Unauthorized: please sign in");
  if (u.role === "super_admin") return u;
  const db = await admin();
  const { data } = await db
    .from("user_permissions")
    .select("permission")
    .eq("user_id", u.userId)
    .eq("permission", ADVANCED_PERMISSION)
    .maybeSingle();
  if (!data) throw new Error("Forbidden: insufficient permissions");
  return u;
}

async function hasAdvanced(): Promise<boolean> {
  try {
    await guardAdvanced();
    return true;
  } catch {
    return false;
  }
}

/* ============================== OFFERS ============================== */

export const listOffers = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await hasAdvanced())) return { offers: [], error: "Forbidden" };
  const db = await admin();
  const { data, error } = await db
    .from("offers")
    .select("*")
    .order("created_at", { ascending: false });
  return { offers: data ?? [], error: error?.message ?? null };
});

const offerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  products: z.string().max(2000).nullable().optional(),
  stage: z.string().min(1).max(100),
  stages: z.array(z.string().min(1).max(100)).max(50).optional(),
  default_valuation: z.number().min(0).max(1_000_000_000),
  expected_liquidity: z.number().min(0).max(1_000_000_000),
  currency: z.string().min(1).max(8),
  enabled: z.boolean(),
});

export const upsertOffer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => offerSchema.parse(d))
  .handler(async ({ data }) => {
    try {
      await guardAdvanced();
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { id, ...rest } = data;
    if (id) {
      const { error } = await db.from("offers").update(rest as never).eq("id", id);
      return { ok: !error, error: error?.message ?? null };
    }
    const { error } = await db.from("offers").insert(rest as never);
    return { ok: !error, error: error?.message ?? null };
  });

export const deleteOffer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guardAdvanced();
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { error } = await db.from("offers").delete().eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

/* ======================== LEAD OPPORTUNITIES ======================== */

export const listLeadOpportunities = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await hasAdvanced())) return { opportunities: [] };
  const db = await admin();
  const { data } = await db.from("lead_opportunities").select("*").limit(5000);
  return { opportunities: data ?? [] };
});

export const upsertLeadOpportunity = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        lead_id: z.string().uuid(),
        offer_id: z.string().uuid().nullable().optional(),
        valuation: z.number().min(0).max(1_000_000_000),
        liquidity: z.number().min(0).max(1_000_000_000),
        notes: z.string().max(2000).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guardAdvanced();
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { error } = await db
      .from("lead_opportunities")
      .upsert(data as never, { onConflict: "lead_id" });
    return { ok: !error, error: error?.message ?? null };
  });

/* ===================== STAGE OPPORTUNITY SETTINGS ===================== */

export const listStageSettings = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await hasAdvanced())) return { settings: [] };
  const db = await admin();
  const { data } = await db.from("stage_opportunity_settings").select("*").limit(100);
  return { settings: data ?? [] };
});

export const upsertStageSetting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        stage: z.string().min(1).max(100),
        offer_id: z.string().uuid().nullable().optional(),
        valuation: z.number().min(0).max(1_000_000_000),
        liquidity: z.number().min(0).max(1_000_000_000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guardAdvanced();
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { error } = await db
      .from("stage_opportunity_settings")
      .upsert(data as never, { onConflict: "stage" });
    return { ok: !error, error: error?.message ?? null };
  });

/* ============================ ANALYTICS ============================ */

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function bucketByDay(timestamps: string[], days: number): { date: string; count: number }[] {
  const buckets = new Map<string, number>();
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(now.getUTCDate() - i);
    buckets.set(dayKey(d), 0);
  }
  for (const ts of timestamps) {
    const key = ts.slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
}

function bucketByHour(timestamps: string[]): { hour: number; count: number }[] {
  const counts = new Array(24).fill(0);
  for (const ts of timestamps) {
    const h = new Date(ts).getUTCHours();
    if (!Number.isNaN(h)) counts[h] += 1;
  }
  return counts.map((count, hour) => ({ hour, count }));
}

// Builds a structured analytics snapshot used by both the dashboard and the AI report.
// When opts.includeContent is true it also attaches a bounded sample of recent
// message contents/timestamps and a lead directory so the assistant can answer
// content-specific questions and (in agentic mode) reference leads by phone.
async function buildAnalytics(days = 14, opts: { includeContent?: boolean } = {}) {
  const db = await admin();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  const sinceIso = since.toISOString();

  const [
    { data: leads },
    { data: recentMessages },
    { count: messageCount },
    { count: bookingCount },
    { data: opportunities },
    { data: offers },
  ] = await Promise.all([
    db
      .from("leads")
      .select(
        "id, phone_number, lead_name, qualification_status, created_at, updated_at, course_interest, country_interest",
      )
      .order("updated_at", { ascending: false })
      .limit(5000),
    db.from("whatsapp_messages").select("received_at, sender").gte("received_at", sinceIso).limit(20000),
    db.from("whatsapp_messages").select("*", { count: "exact", head: true }),
    db.from("appointments").select("*", { count: "exact", head: true }),
    db.from("lead_opportunities").select("lead_id, valuation, liquidity, offer_id").limit(5000),
    db.from("offers").select("id, name, stage").limit(500),
  ]);

  const leadRows = (leads ?? []) as {
    id: string;
    phone_number: string;
    lead_name: string | null;
    qualification_status: string;
    created_at: string;
    updated_at: string;
    course_interest: string | null;
    country_interest: string | null;
  }[];

  // Column distribution
  const columnCounts = new Map<string, number>();
  for (const c of PIPELINE_COLUMNS) columnCounts.set(c.id, 0);
  for (const l of leadRows) {
    const col = columnForStage(l.qualification_status);
    columnCounts.set(col.id, (columnCounts.get(col.id) ?? 0) + 1);
  }
  const stageDistribution = PIPELINE_COLUMNS.map((c) => ({
    id: c.id,
    label: c.label,
    count: columnCounts.get(c.id) ?? 0,
  }));

  // Lead value per column (from opportunities, joined by current stage)
  const oppRows = (opportunities ?? []) as {
    lead_id: string;
    valuation: number;
    liquidity: number;
    offer_id: string | null;
  }[];
  const totalValuation = oppRows.reduce((s, o) => s + Number(o.valuation ?? 0), 0);
  const totalLiquidity = oppRows.reduce((s, o) => s + Number(o.liquidity ?? 0), 0);

  const leadsByDay = bucketByDay(
    leadRows.map((l) => l.created_at).filter(Boolean),
    days,
  );
  const messagesByDay = bucketByDay(
    ((recentMessages ?? []) as { received_at: string }[]).map((m) => m.received_at),
    days,
  );
  const messagesByHour = bucketByHour(
    ((recentMessages ?? []) as { received_at: string }[]).map((m) => m.received_at),
  );

  // Top courses / destinations
  const courseCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();
  for (const l of leadRows) {
    if (l.course_interest) courseCounts.set(l.course_interest, (courseCounts.get(l.course_interest) ?? 0) + 1);
    if (l.country_interest) countryCounts.set(l.country_interest, (countryCounts.get(l.country_interest) ?? 0) + 1);
  }
  const topCourses = Array.from(courseCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
  const topCountries = Array.from(countryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const qualified = leadRows.filter((l) =>
    ["QUALIFIED", "BOOKING_REQUEST_CREATED"].includes(l.qualification_status),
  ).length;
  const disqualified = leadRows.filter((l) => l.qualification_status === "DISQUALIFIED").length;

  // Optional deep content: recent message bodies with timestamps + a lead
  // directory. Bounded to keep the prompt within token limits.
  let messageLog: Array<{ phone: string; sender: string; at: string; text: string }> | undefined;
  let leadDirectory:
    | Array<{
        phone: string;
        name: string | null;
        stage: string;
        course: string | null;
        country: string | null;
        updated_at: string;
      }>
    | undefined;
  if (opts.includeContent) {
    const { data: detailed } = await db
      .from("whatsapp_messages")
      .select("phone_number, sender, received_at, message_content")
      .order("received_at", { ascending: false })
      .limit(120);
    messageLog = ((detailed ?? []) as Array<{
      phone_number: string;
      sender: string;
      received_at: string;
      message_content: string;
    }>).map((m) => ({
      phone: m.phone_number,
      sender: m.sender,
      at: m.received_at,
      text: String(m.message_content ?? "").slice(0, 500),
    }));
    leadDirectory = leadRows.slice(0, 80).map((l) => ({
      phone: l.phone_number,
      name: l.lead_name,
      stage: l.qualification_status,
      course: l.course_interest,
      country: l.country_interest,
      updated_at: l.updated_at,
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
      offers: (offers ?? []).length,
    },
    opportunityTotals: { valuation: totalValuation, liquidity: totalLiquidity, count: oppRows.length },
    stageDistribution,
    leadsByDay,
    messagesByDay,
    messagesByHour,
    topCourses,
    topCountries,
    ...(messageLog ? { messageLog } : {}),
    ...(leadDirectory ? { leadDirectory } : {}),
  };
}

export const getReportDashboard = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await hasAdvanced())) return { analytics: null, error: "Forbidden" };
  const analytics = await buildAnalytics(14);
  return { analytics, error: null };
});

/* ========================== AI REPORT ========================== */

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Optional per-request AI provider override. Defaults to the built-in Lovable AI.
const modelConfigSchema = z
  .object({
    mode: z.enum(["built_in", "ai_settings", "custom"]).optional(),
    provider: z.string().max(40).nullable().optional(),
    baseUrl: z.string().max(500).nullable().optional(),
    model: z.string().max(160).nullable().optional(),
    apiKey: z.string().max(2000).nullable().optional(),
  })
  .optional();

type ModelConfig = z.infer<typeof modelConfigSchema>;

type AiTarget = { url: string; headers: Record<string, string>; model: string };

// Resolve which AI endpoint + credentials to use:
//  - built_in: Lovable AI gateway (default)
//  - custom: a provider/base URL/model/key supplied per conversation
//  - ai_settings: the custom provider configured in AI Settings, else built-in
async function resolveAiTarget(cfg?: ModelConfig): Promise<AiTarget | { error: string }> {
  const mode = cfg?.mode ?? "built_in";
  const lovableKey = process.env.LOVABLE_API_KEY;

  if (mode === "custom") {
    if (!cfg?.baseUrl || !cfg?.apiKey || !cfg?.model) {
      return { error: "Custom provider needs a base URL, model and API key." };
    }
    return {
      url: cfg.baseUrl.replace(/\/+$/, "") + "/chat/completions",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.apiKey}` },
      model: cfg.model,
    };
  }

  if (mode === "ai_settings") {
    const db = await admin();
    const { data } = await db
      .from("ai_configuration")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const c = data as Record<string, unknown> | null;
    if (c && c.provider_mode === "custom" && c.custom_base_url && c.custom_api_key) {
      return {
        url: String(c.custom_base_url).replace(/\/+$/, "") + "/chat/completions",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${String(c.custom_api_key)}`,
        },
        model: String(c.custom_model || c.model || "gpt-4o-mini"),
      };
    }
    if (!lovableKey) return { error: "AI is not configured." };
    return {
      url: GATEWAY_URL,
      headers: { "Content-Type": "application/json", "Lovable-API-Key": lovableKey },
      model: String(c?.model || "google/gemini-3-flash-preview"),
    };
  }

  // built_in (default)
  if (!lovableKey) return { error: "AI is not configured." };
  return {
    url: GATEWAY_URL,
    headers: { "Content-Type": "application/json", "Lovable-API-Key": lovableKey },
    model: cfg?.model || "google/gemini-3-flash-preview",
  };
}





export const generateReport = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ prompt: z.string().min(1).max(4000), days: z.number().int().min(1).max(365).optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guardAdvanced();
    } catch (e) {
      return { report: "", error: (e as Error).message };
    }

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { report: "", error: "AI is not configured." };

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
      const res = await fetch(GATEWAY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          temperature: 0.4,
          messages: [
            { role: "system", content: system },
            { role: "user", content: userMsg },
          ],
        }),
      });
      if (!res.ok) {
        let msg = `AI error ${res.status}`;
        if (res.status === 429) msg = "Rate limit reached. Please retry shortly.";
        if (res.status === 402) msg = "AI credits exhausted. Add credits in workspace settings.";
        return { report: "", error: msg };
      }
      const json = await res.json();
      const report = json?.choices?.[0]?.message?.content ?? "";
      return { report, error: report ? null : "Empty response from AI." };
    } catch (e) {
      return { report: "", error: e instanceof Error ? e.message : "AI request failed" };
    }
  });

/* ===================== CONVERSATIONAL AI CHAT ===================== */

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(20000),
});

export const generateChatReply = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        messages: z.array(chatMessageSchema).min(1).max(40),
        days: z.number().int().min(1).max(365).optional(),
        deepContent: z.boolean().optional(),
        model: modelConfigSchema,
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guardAdvanced();
    } catch (e) {
      return { reply: "", error: (e as Error).message };
    }

    const target = await resolveAiTarget(data.model);
    if ("error" in target) return { reply: "", error: target.error };

    const analytics = await buildAnalytics(data.days ?? 30, { includeContent: data.deepContent ?? true });

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
        body: JSON.stringify({
          model: target.model,
          temperature: 0.4,
          messages: [{ role: "system", content: system }, ...data.messages],
        }),
      });
      if (!res.ok) {
        let msg = `AI error ${res.status}`;
        if (res.status === 429) msg = "Rate limit reached. Please retry shortly.";
        if (res.status === 402) msg = "AI credits exhausted. Add credits in workspace settings.";
        return { reply: "", error: msg };
      }
      const json = await res.json();
      const reply = json?.choices?.[0]?.message?.content ?? "";
      return { reply, error: reply ? null : "Empty response from AI." };
    } catch (e) {
      return { reply: "", error: e instanceof Error ? e.message : "AI request failed" };
    }
  });

/* ===================== SAVED CONVERSATIONS (FAVORITES) ===================== */

export const listConversations = createServerFn({ method: "GET" }).handler(async () => {
  let user;
  try {
    user = await guardAdvanced();
  } catch {
    return { conversations: [] };
  }
  const db = await admin();
  const { data } = await db
    .from("report_conversations")
    .select("*")
    .eq("user_id", user.userId)
    .order("updated_at", { ascending: false })
    .limit(200);
  return { conversations: data ?? [] };
});

export const saveConversation = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        title: z.string().min(1).max(200),
        messages: z.array(chatMessageSchema).min(1).max(60),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    let user;
    try {
      user = await guardAdvanced();
    } catch (e) {
      return { ok: false, id: null, error: (e as Error).message };
    }
    const db = await admin();
    if (data.id) {
      const { error } = await db
        .from("report_conversations")
        .update({ title: data.title, messages: data.messages } as never)
        .eq("id", data.id)
        .eq("user_id", user.userId);
      return { ok: !error, id: data.id, error: error?.message ?? null };
    }
    const { data: inserted, error } = await db
      .from("report_conversations")
      .insert({ title: data.title, messages: data.messages, user_id: user.userId } as never)
      .select("id")
      .single();
    return {
      ok: !error,
      id: (inserted as { id: string } | null)?.id ?? null,
      error: error?.message ?? null,
    };
  });

export const deleteConversation = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    let user;
    try {
      user = await guardAdvanced();
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { error } = await db
      .from("report_conversations")
      .delete()
      .eq("id", data.id)
      .eq("user_id", user.userId);
    return { ok: !error, error: error?.message ?? null };
  });

/* ===================== AGENTIC MODE (PROPOSE + CONFIRM) ===================== */

// Function/tool catalogue the assistant may propose. Nothing here executes
// automatically — proposed calls are returned to the UI for explicit approval.
const AGENT_TOOLS = [
  {
    type: "function",
    function: {
      name: "move_lead_stage",
      description: "Move a lead to a different pipeline qualification status.",
      parameters: {
        type: "object",
        properties: {
          phone: { type: "string", description: "The lead's phone number." },
          qualification_status: {
            type: "string",
            description:
              "The new qualification status, e.g. NEW_LEAD, IN_PROGRESS, QUALIFIED, BOOKING_REQUEST_CREATED, ONBOARDING, DISQUALIFIED. Prefer a value already seen in leadDirectory.",
          },
        },
        required: ["phone", "qualification_status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_lead",
      description: "Update editable fields on a lead.",
      parameters: {
        type: "object",
        properties: {
          phone: { type: "string" },
          lead_name: { type: "string" },
          course_interest: { type: "string" },
          country_interest: { type: "string" },
          notes: { type: "string" },
        },
        required: ["phone"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "assign_workflow",
      description: "Enrol a lead into an outbound workflow by its exact name.",
      parameters: {
        type: "object",
        properties: {
          phone: { type: "string" },
          workflow_name: { type: "string" },
          goal_at: {
            type: "string",
            description: "Optional ISO date for countdown steps (e.g. 2026-07-01).",
          },
        },
        required: ["phone", "workflow_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remove_workflow",
      description: "Remove a lead from a workflow by its exact name.",
      parameters: {
        type: "object",
        properties: { phone: { type: "string" }, workflow_name: { type: "string" } },
        required: ["phone", "workflow_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_opportunity",
      description: "Set the opportunity valuation and expected liquidity for a lead.",
      parameters: {
        type: "object",
        properties: {
          phone: { type: "string" },
          valuation: { type: "number" },
          liquidity: { type: "number" },
        },
        required: ["phone"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "upsert_ai_variable",
      description:
        "Create or update an AI variable. If a variable with the same name exists it is updated, otherwise created.",
      parameters: {
        type: "object",
        properties: {
          variable_name: { type: "string", description: "UPPER_SNAKE_CASE name, e.g. TUITION_FEE." },
          variable_value: { type: "string" },
          description: { type: "string" },
        },
        required: ["variable_name", "variable_value"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_ai_variable",
      description: "Delete an AI variable by its exact name.",
      parameters: {
        type: "object",
        properties: { variable_name: { type: "string" } },
        required: ["variable_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_workflow",
      description: "Create a new outbound workflow.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          trigger_type: {
            type: "string",
            description: "One of: manual, pipeline_stage. Defaults to manual.",
          },
          enabled: { type: "boolean" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_workflow",
      description: "Update an existing workflow identified by its current exact name.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The workflow's current name." },
          new_name: { type: "string" },
          description: { type: "string" },
          enabled: { type: "boolean" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_responder_agent",
      description: "Create a new responder agent.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          system_prompt: { type: "string" },
          enabled: { type: "boolean" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_responder_agent",
      description: "Update an existing responder agent identified by its current exact name.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The agent's current name." },
          new_name: { type: "string" },
          description: { type: "string" },
          system_prompt: { type: "string" },
          enabled: { type: "boolean" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_http_action",
      description: "Create a new outbound HTTP action (webhook).",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          trigger_stage: { type: "string", description: "The pipeline stage that fires this action." },
          url: { type: "string" },
          method: { type: "string", description: "POST, GET, PUT or PATCH. Defaults to POST." },
          payload_template: { type: "string", description: "JSON body template; may use {{variables}}." },
          enabled: { type: "boolean" },
        },
        required: ["name", "trigger_stage", "url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_http_action",
      description: "Update an existing HTTP action identified by its current exact name.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The action's current name." },
          new_name: { type: "string" },
          trigger_stage: { type: "string" },
          url: { type: "string" },
          method: { type: "string" },
          payload_template: { type: "string" },
          enabled: { type: "boolean" },
        },
        required: ["name"],
      },
    },
  },
] as const;

export const generateAgentReply = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        messages: z.array(chatMessageSchema).min(1).max(40),
        days: z.number().int().min(1).max(365).optional(),
        model: modelConfigSchema,
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guardAdvanced();
    } catch (e) {
      return { reply: "", actions: [], error: (e as Error).message };
    }

    const target = await resolveAiTarget(data.model);
    if ("error" in target) return { reply: "", actions: [], error: target.error };

    const analytics = await buildAnalytics(data.days ?? 30, { includeContent: true });
    const db = await scopedAdmin();
    const [{ data: wfRows }, { data: varRows }, { data: agentRows }, { data: actionRows }] = await Promise.all([
      db.from("workflows").select("name, enabled, description").limit(200),
      db.from("ai_variables").select("variable_name, description").limit(300),
      db.from("responder_agents").select("name, enabled").limit(200),
      db.from("http_actions").select("name, trigger_stage, method, enabled").limit(200),
    ]);
    const workflows = ((wfRows ?? []) as Array<{ name: string; enabled: boolean; description: string | null }>);
    const workflowNames = workflows.filter((w) => w.enabled).map((w) => w.name);
    const catalogue = {
      workflows,
      aiVariables: (varRows ?? []) as Array<{ variable_name: string; description: string | null }>,
      responderAgents: (agentRows ?? []) as Array<{ name: string; enabled: boolean }>,
      httpActions: (actionRows ?? []) as Array<{ name: string; trigger_stage: string; method: string; enabled: boolean }>,
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
          messages: [{ role: "system", content: system }, ...data.messages],
        }),
      });
      if (!res.ok) {
        let msg = `AI error ${res.status}`;
        if (res.status === 429) msg = "Rate limit reached. Please retry shortly.";
        if (res.status === 402) msg = "AI credits exhausted. Add credits in workspace settings.";
        return { reply: "", actions: [], error: msg };
      }
      const json = await res.json();
      const message = json?.choices?.[0]?.message ?? {};
      const reply = String(message.content ?? "");
      const rawCalls = Array.isArray(message.tool_calls) ? message.tool_calls : [];
      const actions = rawCalls
        .map((c: { id?: string; function?: { name?: string; arguments?: string } }) => {
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(c.function?.arguments ?? "{}");
          } catch {
            args = {};
          }
          return { id: c.id ?? crypto.randomUUID(), name: c.function?.name ?? "", args };
        })
        .filter((a: { name: string }) => a.name);
      return {
        reply: reply || (actions.length ? "I've prepared the following actions for your approval." : ""),
        actions,
        error: null,
      };
    } catch (e) {
      return { reply: "", actions: [], error: e instanceof Error ? e.message : "AI request failed" };
    }
  });

type CfgResult = { ok: boolean; error: string | null; result?: string };
type CfgAudit = (
  action: string,
  entityType: string,
  entityId: string | null,
  details: Record<string, unknown>,
) => Promise<void>;

const CONFIG_ACTIONS = new Set([
  "upsert_ai_variable",
  "delete_ai_variable",
  "create_workflow",
  "update_workflow",
  "create_responder_agent",
  "update_responder_agent",
  "create_http_action",
  "update_http_action",
]);

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const VALID_METHODS = new Set(["POST", "GET", "PUT", "PATCH"]);

// Execute config-level agentic actions (AI variables, workflows, responder
// agents, HTTP actions). Returns null when `name` is not a config action so the
// caller can fall through to lead-based actions.
/* eslint-disable @typescript-eslint/no-explicit-any */
async function executeConfigAction(
  db: any,
  name: string,
  args: Record<string, unknown>,
  audit: CfgAudit,
): Promise<CfgResult | null> {
  if (!CONFIG_ACTIONS.has(name)) return null;

  try {
    if (name === "upsert_ai_variable") {
      const varName = str(args.variable_name).toUpperCase();
      if (!/^[A-Z0-9_]+$/.test(varName)) return { ok: false, error: "Variable name must be UPPER_SNAKE_CASE." };
      const value = typeof args.variable_value === "string" ? args.variable_value.slice(0, 2000) : "";
      const description = typeof args.description === "string" ? args.description.slice(0, 500) : null;
      const { data: existing } = await db
        .from("ai_variables")
        .select("id")
        .eq("variable_name", varName)
        .maybeSingle();
      const exId = (existing as { id?: string } | null)?.id;
      if (exId) {
        const { error } = await db
          .from("ai_variables")
          .update({ variable_value: value, description } as never)
          .eq("id", exId);
        if (error) return { ok: false, error: error.message };
        await audit("ai_variable_updated", "ai_variable", exId, { variable_name: varName });
        return { ok: true, error: null, result: `Updated variable ${varName}` };
      }
      const { error } = await db
        .from("ai_variables")
        .insert({ variable_name: varName, variable_value: value, description } as never);
      if (error) return { ok: false, error: error.message };
      await audit("ai_variable_created", "ai_variable", null, { variable_name: varName });
      return { ok: true, error: null, result: `Created variable ${varName}` };
    }

    if (name === "delete_ai_variable") {
      const varName = str(args.variable_name).toUpperCase();
      if (!varName) return { ok: false, error: "Missing variable name." };
      const { data: existing } = await db
        .from("ai_variables")
        .select("id")
        .eq("variable_name", varName)
        .maybeSingle();
      const exId = (existing as { id?: string } | null)?.id;
      if (!exId) return { ok: false, error: "Variable not found." };
      const { error } = await db.from("ai_variables").delete().eq("id", exId);
      if (error) return { ok: false, error: error.message };
      await audit("ai_variable_deleted", "ai_variable", exId, { variable_name: varName });
      return { ok: true, error: null, result: `Deleted variable ${varName}` };
    }

    if (name === "create_workflow") {
      const wfName = str(args.name);
      if (!wfName) return { ok: false, error: "Missing workflow name." };
      const triggerType = str(args.trigger_type) === "pipeline_stage" ? "pipeline_stage" : "manual";
      const { data: created, error } = await db
        .from("workflows")
        .insert({
          name: wfName,
          description: typeof args.description === "string" ? args.description.slice(0, 1000) : null,
          enabled: typeof args.enabled === "boolean" ? args.enabled : false,
          trigger_type: triggerType,
          trigger_segment: "manual",
          trigger_config: {},
          graph: {},
        } as never)
        .select("id")
        .single();
      if (error) return { ok: false, error: error.message };
      await audit("ai_workflow_created", "workflow", (created as { id?: string } | null)?.id ?? null, { name: wfName });
      return { ok: true, error: null, result: `Created workflow "${wfName}"` };
    }

    if (name === "update_workflow") {
      const wfName = str(args.name);
      if (!wfName) return { ok: false, error: "Missing workflow name." };
      const { data: wf } = await db.from("workflows").select("id").ilike("name", wfName).maybeSingle();
      const wfId = (wf as { id?: string } | null)?.id;
      if (!wfId) return { ok: false, error: "Workflow not found." };
      const patch: Record<string, unknown> = {};
      if (str(args.new_name)) patch.name = str(args.new_name);
      if (typeof args.description === "string") patch.description = args.description.slice(0, 1000);
      if (typeof args.enabled === "boolean") patch.enabled = args.enabled;
      if (Object.keys(patch).length === 0) return { ok: false, error: "No fields to update." };
      const { error } = await db.from("workflows").update(patch as never).eq("id", wfId);
      if (error) return { ok: false, error: error.message };
      await audit("ai_workflow_updated", "workflow", wfId, { name: wfName, fields: Object.keys(patch) });
      return { ok: true, error: null, result: `Updated workflow "${wfName}"` };
    }

    if (name === "create_responder_agent") {
      const agName = str(args.name);
      if (!agName) return { ok: false, error: "Missing agent name." };
      const { data: created, error } = await db
        .from("responder_agents")
        .insert({
          name: agName,
          description: typeof args.description === "string" ? args.description.slice(0, 1000) : null,
          system_prompt: typeof args.system_prompt === "string" ? args.system_prompt.slice(0, 20000) : "",
          enabled: typeof args.enabled === "boolean" ? args.enabled : true,
        } as never)
        .select("id")
        .single();
      if (error) return { ok: false, error: error.message };
      await audit("ai_responder_agent_created", "responder_agent", (created as { id?: string } | null)?.id ?? null, {
        name: agName,
      });
      return { ok: true, error: null, result: `Created responder agent "${agName}"` };
    }

    if (name === "update_responder_agent") {
      const agName = str(args.name);
      if (!agName) return { ok: false, error: "Missing agent name." };
      const { data: ag } = await db.from("responder_agents").select("id").ilike("name", agName).maybeSingle();
      const agId = (ag as { id?: string } | null)?.id;
      if (!agId) return { ok: false, error: "Responder agent not found." };
      const patch: Record<string, unknown> = {};
      if (str(args.new_name)) patch.name = str(args.new_name);
      if (typeof args.description === "string") patch.description = args.description.slice(0, 1000);
      if (typeof args.system_prompt === "string") patch.system_prompt = args.system_prompt.slice(0, 20000);
      if (typeof args.enabled === "boolean") patch.enabled = args.enabled;
      if (Object.keys(patch).length === 0) return { ok: false, error: "No fields to update." };
      const { error } = await db.from("responder_agents").update(patch as never).eq("id", agId);
      if (error) return { ok: false, error: error.message };
      await audit("ai_responder_agent_updated", "responder_agent", agId, { name: agName, fields: Object.keys(patch) });
      return { ok: true, error: null, result: `Updated responder agent "${agName}"` };
    }

    if (name === "create_http_action") {
      const acName = str(args.name);
      const triggerStage = str(args.trigger_stage);
      const url = str(args.url);
      if (!acName || !triggerStage || !url) return { ok: false, error: "Name, trigger stage and URL are required." };
      if (!/^https?:\/\//i.test(url)) return { ok: false, error: "URL must start with http:// or https://." };
      const method = VALID_METHODS.has(str(args.method).toUpperCase()) ? str(args.method).toUpperCase() : "POST";
      const { data: created, error } = await db
        .from("http_actions")
        .insert({
          name: acName,
          trigger_stage: triggerStage,
          url,
          method,
          headers: {},
          payload_template: typeof args.payload_template === "string" ? args.payload_template.slice(0, 10000) : "{}",
          enabled: typeof args.enabled === "boolean" ? args.enabled : true,
        } as never)
        .select("id")
        .single();
      if (error) return { ok: false, error: error.message };
      await audit("ai_http_action_created", "http_action", (created as { id?: string } | null)?.id ?? null, {
        name: acName,
      });
      return { ok: true, error: null, result: `Created HTTP action "${acName}"` };
    }

    if (name === "update_http_action") {
      const acName = str(args.name);
      if (!acName) return { ok: false, error: "Missing action name." };
      const { data: ac } = await db.from("http_actions").select("id").ilike("name", acName).maybeSingle();
      const acId = (ac as { id?: string } | null)?.id;
      if (!acId) return { ok: false, error: "HTTP action not found." };
      const patch: Record<string, unknown> = {};
      if (str(args.new_name)) patch.name = str(args.new_name);
      if (str(args.trigger_stage)) patch.trigger_stage = str(args.trigger_stage);
      if (str(args.url)) {
        const url = str(args.url);
        if (!/^https?:\/\//i.test(url)) return { ok: false, error: "URL must start with http:// or https://." };
        patch.url = url;
      }
      if (VALID_METHODS.has(str(args.method).toUpperCase())) patch.method = str(args.method).toUpperCase();
      if (typeof args.payload_template === "string") patch.payload_template = args.payload_template.slice(0, 10000);
      if (typeof args.enabled === "boolean") patch.enabled = args.enabled;
      if (Object.keys(patch).length === 0) return { ok: false, error: "No fields to update." };
      const { error } = await db.from("http_actions").update(patch as never).eq("id", acId);
      if (error) return { ok: false, error: error.message };
      await audit("ai_http_action_updated", "http_action", acId, { name: acName, fields: Object.keys(patch) });
      return { ok: true, error: null, result: `Updated HTTP action "${acName}"` };
    }

    return { ok: false, error: "Unknown configuration action." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Action failed" };
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Execute a single approved agent action. Validated per-action and audit-logged.
export const executeAgentAction = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        name: z.enum([
          "move_lead_stage",
          "update_lead",
          "assign_workflow",
          "remove_workflow",
          "set_opportunity",
          "upsert_ai_variable",
          "delete_ai_variable",
          "create_workflow",
          "update_workflow",
          "create_responder_agent",
          "update_responder_agent",
          "create_http_action",
          "update_http_action",
        ]),
        args: z.record(z.string(), z.unknown()),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    let user;
    try {
      user = await guardAdvanced();
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedAdmin();
    const args = data.args as Record<string, unknown>;

    const auditCfg = async (action: string, entityType: string, entityId: string | null, details: Record<string, unknown>) => {
      await db.from("audit_logs").insert({
        actor_email: user.email ?? null,
        actor_role: user.role ?? null,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details: { ...details, via: "ai_agent" },
      } as never);
    };

    // ---- Configuration actions (no lead phone required) ----
    const cfg = await executeConfigAction(db, data.name, args, auditCfg);
    if (cfg) return cfg;

    // ---- Lead-based actions (require a phone number) ----
    const phone = typeof args.phone === "string" ? args.phone.trim() : "";
    if (!phone) return { ok: false, error: "Action is missing a lead phone number." };

    const { data: leadRow } = await db
      .from("leads")
      .select("id")
      .eq("phone_number", phone)
      .maybeSingle();
    const leadId = (leadRow as { id?: string } | null)?.id ?? null;

    const audit = async (action: string, details: Record<string, unknown>) => {
      await db.from("audit_logs").insert({
        actor_email: user.email ?? null,
        actor_role: user.role ?? null,
        action,
        entity_type: "lead",
        entity_id: leadId,
        details: { ...details, phone, via: "ai_agent" },
      } as never);
    };


    try {
      if (data.name === "move_lead_stage") {
        const status =
          typeof args.qualification_status === "string" ? args.qualification_status.trim() : "";
        if (!status) return { ok: false, error: "Missing qualification status." };
        if (!leadId) return { ok: false, error: "Lead not found." };
        const { error } = await db
          .from("leads")
          .update({ qualification_status: status } as never)
          .eq("phone_number", phone);
        if (error) return { ok: false, error: error.message };
        await audit("ai_lead_stage_changed", { qualification_status: status });
        return { ok: true, error: null, result: `Moved to ${status}` };
      }

      if (data.name === "update_lead") {
        if (!leadId) return { ok: false, error: "Lead not found." };
        const patch: Record<string, string> = {};
        for (const f of ["lead_name", "course_interest", "country_interest", "notes"]) {
          if (typeof args[f] === "string" && args[f]) patch[f] = String(args[f]).slice(0, 2000);
        }
        if (Object.keys(patch).length === 0) return { ok: false, error: "No fields to update." };
        const { error } = await db.from("leads").update(patch as never).eq("phone_number", phone);
        if (error) return { ok: false, error: error.message };
        await audit("ai_lead_updated", { fields: Object.keys(patch) });
        return { ok: true, error: null, result: `Updated ${Object.keys(patch).join(", ")}` };
      }

      if (data.name === "assign_workflow") {
        const wfName = typeof args.workflow_name === "string" ? args.workflow_name.trim() : "";
        if (!wfName) return { ok: false, error: "Missing workflow name." };
        let goalIso: string | null = null;
        if (typeof args.goal_at === "string" && args.goal_at) {
          const g = new Date(args.goal_at);
          if (!isNaN(g.getTime())) goalIso = g.toISOString();
        }
        const { enrollLeadInWorkflowByName } = await import("./admissions.server");
        const res = await enrollLeadInWorkflowByName({
          workflowName: wfName,
          phone,
          leadId,
          sendNow: false,
          goalAt: goalIso,
        });
        if (res.status === "no_workflow")
          return { ok: false, error: "Workflow not found or has no steps." };
        if (res.status === "already_enrolled")
          return { ok: false, error: "Lead is already in this workflow." };
        await audit("ai_workflow_assigned", { workflow: wfName, goal_at: goalIso });
        return { ok: true, error: null, result: `Assigned "${wfName}"` };
      }

      if (data.name === "remove_workflow") {
        const wfName = typeof args.workflow_name === "string" ? args.workflow_name.trim() : "";
        if (!wfName) return { ok: false, error: "Missing workflow name." };
        const { data: wf } = await db
          .from("workflows")
          .select("id")
          .ilike("name", wfName)
          .maybeSingle();
        const wfId = (wf as { id?: string } | null)?.id;
        if (!wfId) return { ok: false, error: "Workflow not found." };
        const { error } = await db
          .from("workflow_enrollments")
          .delete()
          .eq("phone_number", phone)
          .eq("workflow_id", wfId);
        if (error) return { ok: false, error: error.message };
        await audit("ai_workflow_unassigned", { workflow: wfName });
        return { ok: true, error: null, result: `Removed "${wfName}"` };
      }

      if (data.name === "set_opportunity") {
        if (!leadId) return { ok: false, error: "Lead not found." };
        const valuation = Math.max(0, Math.min(1_000_000_000, Number(args.valuation ?? 0)));
        const liquidity = Math.max(0, Math.min(1_000_000_000, Number(args.liquidity ?? 0)));
        const { error } = await db
          .from("lead_opportunities")
          .upsert({ lead_id: leadId, valuation, liquidity } as never, { onConflict: "lead_id" });
        if (error) return { ok: false, error: error.message };
        await audit("ai_opportunity_set", { valuation, liquidity });
        return { ok: true, error: null, result: `Set valuation ${valuation}, liquidity ${liquidity}` };
      }

      return { ok: false, error: "Unknown action." };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Action failed" };
    }
  });
