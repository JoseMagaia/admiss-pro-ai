import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ADVANCED_PERMISSION } from "@/lib/roles";
import { PIPELINE_COLUMNS, columnForStage } from "@/lib/pipeline";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
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
async function buildAnalytics(days = 14) {
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
    db.from("leads").select("qualification_status, created_at, course_interest, country_interest").limit(5000),
    db.from("whatsapp_messages").select("received_at, sender").gte("received_at", sinceIso).limit(20000),
    db.from("whatsapp_messages").select("*", { count: "exact", head: true }),
    db.from("appointments").select("*", { count: "exact", head: true }),
    db.from("lead_opportunities").select("lead_id, valuation, liquidity, offer_id").limit(5000),
    db.from("offers").select("id, name, stage").limit(500),
  ]);

  const leadRows = (leads ?? []) as {
    qualification_status: string;
    created_at: string;
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
  };
}

export const getReportDashboard = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await hasAdvanced())) return { analytics: null, error: "Forbidden" };
  const analytics = await buildAnalytics(14);
  return { analytics, error: null };
});

/* ========================== AI REPORT ========================== */

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

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
