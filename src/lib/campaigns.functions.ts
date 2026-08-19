import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { AppRole } from "@/lib/roles";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Resolve the caller's active Space (honors x-space-id, validates membership).
async function spaceCtx() {
  const { resolveSpaceContext } = await import("./space-context.server");
  return resolveSpaceContext();
}

// Service-role client scoped to the caller's active Space.
async function scopedDb() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { makeScopedClient, NO_SPACE } = await import("./space-context.server");
  const ctx = await spaceCtx();
  const sid = ctx && (ctx.isSuperAdmin || ctx.status === "active") ? ctx.spaceId : NO_SPACE;
  return makeScopedClient(supabaseAdmin, sid);
}

async function guard(allowed: AppRole[]) {
  const { assertRole } = await import("@/integrations/supabase/role-guard.server");
  return assertRole(allowed);
}

async function isAuthed(): Promise<boolean> {
  const { getRequestUser } = await import("@/integrations/supabase/role-guard.server");
  const u = await getRequestUser();
  return Boolean(u?.role);
}

const MANAGE_ROLES: AppRole[] = ["super_admin", "admin"];

export type RecipientStats = {
  total: number;
  pending: number;
  sent: number;
  delivered: number;
  opened: number;
  replied: number;
  failed: number;
};

export type CampaignMedia = {
  url: string;
  path?: string | null;
  mime: string;
  kind: "image" | "audio" | "video" | "document";
  filename?: string | null;
  caption?: string | null;
} | null;

export type CampaignButton = {
  id?: string;
  title: string;
  /** Optional workflow to enroll the recipient into when they tap this button. */
  next_workflow_id?: string | null;
};

export type CampaignRow = {
  id: string;
  name: string;
  channel: string;
  workspace_id: string | null;
  message_template: string;
  status: string;
  batch_size: number;
  delay_seconds: number;
  send_rate_per_min: number;
  message_variations: string[];
  batch_break_seconds: number;
  send_days: number[];
  send_window_start: string | null;
  send_window_end: string | null;
  send_timezone: string;
  start_at: string | null;
  end_at: string | null;
  last_batch_at: string | null;
  created_at: string;
  updated_at: string;
  media: CampaignMedia;
  buttons: CampaignButton[];
  stats: RecipientStats;
};

const emptyStats = (): RecipientStats => ({
  total: 0,
  pending: 0,
  sent: 0,
  delivered: 0,
  opened: 0,
  replied: 0,
  failed: 0,
});

/* ----------------------------- Reads ----------------------------- */

// List campaigns for the active space with per-campaign recipient stats.
export const listCampaigns = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { campaigns: [] as CampaignRow[], error: "Unauthorized" };
  const db = await scopedDb();
  const { data: camps, error } = await db
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return { campaigns: [] as CampaignRow[], error: error.message };

  const rows = (camps as any[]) ?? [];
  const ids = rows.map((c) => c.id);
  const statsById = new Map<string, RecipientStats>();
  if (ids.length > 0) {
    const { data: recips } = await db
      .from("campaign_recipients")
      .select("campaign_id, status")
      .in("campaign_id", ids)
      .limit(100000);
    for (const r of (recips as any[]) ?? []) {
      const s = statsById.get(r.campaign_id) ?? emptyStats();
      s.total += 1;
      if (s[r.status as keyof RecipientStats] !== undefined && r.status !== "total") {
        (s as any)[r.status] += 1;
      }
      statsById.set(r.campaign_id, s);
    }
  }

  const campaigns: CampaignRow[] = rows.map((c) => ({
    id: c.id,
    name: c.name,
    channel: c.channel,
    workspace_id: c.workspace_id,
    message_template: c.message_template,
    status: c.status,
    batch_size: c.batch_size,
    delay_seconds: c.delay_seconds,
    send_rate_per_min: c.send_rate_per_min,
    message_variations: (c.message_variations ?? []) as string[],
    batch_break_seconds: c.batch_break_seconds ?? 60,
    send_days: (c.send_days ?? [0, 1, 2, 3, 4, 5, 6]) as number[],
    send_window_start: c.send_window_start ?? null,
    send_window_end: c.send_window_end ?? null,
    send_timezone: c.send_timezone ?? "UTC",
    start_at: c.start_at,
    end_at: c.end_at,
    last_batch_at: c.last_batch_at,
    created_at: c.created_at,
    updated_at: c.updated_at,
    media: (c.media ?? null) as CampaignMedia,
    buttons: (Array.isArray(c.buttons) ? c.buttons : []) as CampaignButton[],
    stats: statsById.get(c.id) ?? emptyStats(),
  }));
  return { campaigns, error: null };
});

// Recipients of a single campaign (most recent first), capped for the UI.
export const listCampaignRecipients = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ campaignId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await isAuthed())) return { recipients: [] as any[], error: "Unauthorized" };
    const db = await scopedDb();
    const { data: recips, error } = await db
      .from("campaign_recipients")
      .select("id, phone_number, name, status, error, sent_at, replied_at, created_at")
      .eq("campaign_id", data.campaignId)
      .order("created_at", { ascending: true })
      .limit(2000);
    if (error) return { recipients: [], error: error.message };
    return { recipients: (recips as any[]) ?? [], error: null };
  });

// Sending workspaces + audience filter options (offers, pipeline stages).
export const getCampaignOptions = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed()))
    return { workspaces: [] as any[], offers: [] as any[], stages: [] as any[], error: "Unauthorized" };
  const db = await scopedDb();
  const [{ data: ws }, { data: offers }, { data: pipes }, { data: stages }] = await Promise.all([
    db.from("chatwoot_workspaces").select("id, name, provider_type, enabled").order("name", { ascending: true }),
    db.from("offers").select("id, name").order("name", { ascending: true }),
    db.from("pipelines").select("id, name").order("position", { ascending: true }),
    db.from("pipeline_stages").select("id, pipeline_id, label, stage_keys, position").order("position", { ascending: true }),
  ]);
  const pipeName = new Map<string, string>(((pipes as any[]) ?? []).map((p) => [p.id, p.name]));
  const stageList = ((stages as any[]) ?? []).map((s) => ({
    id: s.id,
    label: s.label,
    stage_keys: (s.stage_keys ?? []) as string[],
    pipeline_name: pipeName.get(s.pipeline_id) ?? "",
  }));
  return {
    workspaces: ((ws as any[]) ?? []).filter((w) => w.enabled),
    offers: (offers as any[]) ?? [],
    stages: stageList,
    error: null,
  };
});

/* ----------------------------- Writes ----------------------------- */

const mediaSchema = z
  .object({
    url: z.string().url().max(2000),
    path: z.string().min(1).max(1000).nullable().optional(),
    mime: z.string().max(200),
    kind: z.enum(["image", "audio", "video", "document"]),
    filename: z.string().max(300).nullable().optional(),
    caption: z.string().max(2000).nullable().optional(),
  })
  .nullable()
  .optional();

const buttonSchema = z
  .array(
    z.object({
      id: z.string().max(64).optional(),
      // WhatsApp Cloud caps interactive button titles at 20 chars.
      title: z.string().trim().min(1).max(20),
      next_workflow_id: z.string().uuid().nullable().optional(),
    }),
  )
  .max(3)
  .optional();

const campaignInput = z.object({
  name: z.string().trim().min(1).max(120),
  channel: z.enum(["whatsapp", "sms", "email", "other"]).default("whatsapp"),
  workspace_id: z.string().uuid().nullable().optional(),
  message_template: z.string().max(8000).default(""),
  message_variations: z.array(z.string().max(8000)).max(10).default([]),
  batch_size: z.number().int().min(1).max(100).default(25),
  delay_seconds: z.number().int().min(0).max(5).default(2),
  batch_break_seconds: z.number().int().min(0).max(86400).default(60),
  send_rate_per_min: z.number().int().min(1).max(600).default(60),
  send_days: z.array(z.number().int().min(0).max(6)).max(7).default([0, 1, 2, 3, 4, 5, 6]),
  send_window_start: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  send_window_end: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  send_timezone: z.string().max(64).default("UTC"),
  start_at: z.string().nullable().optional(),
  end_at: z.string().nullable().optional(),
  media: mediaSchema,
  buttons: buttonSchema,
});

export const createCampaign = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => campaignInput.parse(d))
  .handler(async ({ data }) => {
    let me;
    try {
      me = await guard(MANAGE_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { data: created, error } = await db
      .from("campaigns")
      .insert({
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
        media: data.media ?? null,
        buttons: data.buttons ?? [],
        created_by: (me as any)?.userId ?? null,
      } as any)
      .select("id")
      .single();
    if (error || !created) return { ok: false, error: error?.message ?? "Could not create campaign" };
    return { ok: true, error: null, id: (created as any).id as string };
  });

export const updateCampaign = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => campaignInput.partial().extend({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(MANAGE_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const patch: Record<string, unknown> = {};
    for (const k of [
      "name",
      "channel",
      "workspace_id",
      "message_template",
      "message_variations",
      "batch_size",
      "delay_seconds",
      "batch_break_seconds",
      "send_rate_per_min",
      "send_days",
      "send_timezone",
      "buttons",
    ] as const) {
      if (data[k] !== undefined) patch[k] = data[k];
    }
    if (data.media !== undefined) patch.media = data.media ?? null;
    if (data.start_at !== undefined) patch.start_at = data.start_at || null;
    if (data.end_at !== undefined) patch.end_at = data.end_at || null;
    if (data.send_window_start !== undefined) patch.send_window_start = data.send_window_start || null;
    if (data.send_window_end !== undefined) patch.send_window_end = data.send_window_end || null;
    if (Object.keys(patch).length === 0) return { ok: false, error: "Nothing to update." };
    const { error } = await db.from("campaigns").update(patch as any).eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

// Schedule (start), pause, resume, or cancel a campaign.
export const setCampaignStatus = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), action: z.enum(["start", "pause", "resume", "cancel"]) }).parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(MANAGE_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { data: camp } = await db
      .from("campaigns")
      .select("id, status, message_template, workspace_id, start_at")
      .eq("id", data.id)
      .maybeSingle();
    const c = camp as any;
    if (!c) return { ok: false, error: "Campaign not found." };

    if (data.action === "start") {
      if (!c.workspace_id) return { ok: false, error: "Choose a sending workspace before starting." };
      if (!String(c.message_template ?? "").trim())
        return { ok: false, error: "Add a message template before starting." };
      const { count } = await db
        .from("campaign_recipients")
        .select("id", { count: "exact", head: true })
        .eq("campaign_id", data.id)
        .eq("status", "pending");
      if ((count ?? 0) === 0) return { ok: false, error: "Add at least one pending recipient before starting." };
      // If start_at is in the future, keep it scheduled; otherwise run now.
      const future = c.start_at && new Date(String(c.start_at)).getTime() > Date.now();
      const { error } = await db
        .from("campaigns")
        .update({ status: future ? "scheduled" : "running" } as any)
        .eq("id", data.id);
      return { ok: !error, error: error?.message ?? null };
    }
    if (data.action === "pause") {
      const { error } = await db.from("campaigns").update({ status: "paused" } as any).eq("id", data.id);
      return { ok: !error, error: error?.message ?? null };
    }
    if (data.action === "resume") {
      const { error } = await db.from("campaigns").update({ status: "running" } as any).eq("id", data.id);
      return { ok: !error, error: error?.message ?? null };
    }
    // cancel
    const { error } = await db.from("campaigns").update({ status: "cancelled" } as any).eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

export const deleteCampaign = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(MANAGE_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { error } = await db.from("campaigns").delete().eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

const PHONE_DIGITS = (p: string | null | undefined) =>
  String(p ?? "").replace(/@.*$/, "").replace(/[^0-9]/g, "");

// Insert recipient rows, skipping ones already present in the campaign and any
// with an invalid/empty phone. Returns how many were added vs skipped.
async function insertRecipients(
  db: any,
  campaignId: string,
  rows: Array<{ phone_number: string; name: string | null; lead_id: string | null; merge_data: Record<string, unknown> }>,
): Promise<{ added: number; skipped: number }> {
  // De-dupe within this batch by normalized phone.
  const seen = new Set<string>();
  const cleaned = rows.filter((r) => {
    const d = PHONE_DIGITS(r.phone_number);
    if (!d || d.length < 6 || seen.has(d)) return false;
    seen.add(d);
    return true;
  });
  if (cleaned.length === 0) return { added: 0, skipped: rows.length };

  // Skip phones already present in this campaign.
  const { data: existing } = await db
    .from("campaign_recipients")
    .select("phone_number")
    .eq("campaign_id", campaignId)
    .limit(100000);
  const existingSet = new Set(((existing as any[]) ?? []).map((e) => PHONE_DIGITS(e.phone_number)));
  const toInsert = cleaned.filter((r) => !existingSet.has(PHONE_DIGITS(r.phone_number)));
  if (toInsert.length === 0) return { added: 0, skipped: rows.length };

  const payload = toInsert.map((r) => ({
    campaign_id: campaignId,
    lead_id: r.lead_id,
    phone_number: r.phone_number,
    name: r.name,
    merge_data: r.merge_data,
    status: "pending",
  }));
  const { error } = await db.from("campaign_recipients").insert(payload as any);
  if (error) return { added: 0, skipped: rows.length };
  return { added: toInsert.length, skipped: rows.length - toInsert.length };
}

function leadToMerge(l: any): Record<string, unknown> {
  return {
    course_interest: l.course_interest ?? "",
    country_interest: l.country_interest ?? "",
    student_or_parent: l.student_or_parent ?? "",
  };
}

// Add recipients from existing leads, by source: all leads, by assigned offer,
// or by pipeline-stage qualification keys.
export const addRecipientsFromLeads = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        campaignId: z.string().uuid(),
        source: z.enum(["all", "offer", "stage", "ids"]),
        offerId: z.string().uuid().optional(),
        stageKeys: z.array(z.string().max(80)).max(100).optional(),
        leadIds: z.array(z.string().uuid()).max(5000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(MANAGE_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();

    let leadIds: string[] | null = null;
    if (data.source === "offer") {
      if (!data.offerId) return { ok: false, error: "Choose an offer." };
      const { data: opps } = await db
        .from("lead_opportunities")
        .select("lead_id")
        .eq("offer_id", data.offerId)
        .limit(10000);
      leadIds = Array.from(new Set(((opps as any[]) ?? []).map((o) => o.lead_id).filter(Boolean)));
      if (leadIds.length === 0) return { ok: true, error: null, added: 0, skipped: 0 };
    } else if (data.source === "ids") {
      leadIds = data.leadIds ?? [];
      if (leadIds.length === 0) return { ok: false, error: "No contacts selected." };
    }

    let q = db
      .from("leads")
      .select("id, phone_number, lead_name, course_interest, country_interest, student_or_parent")
      .limit(20000);
    if (leadIds) q = q.in("id", leadIds);
    if (data.source === "stage") {
      const keys = data.stageKeys ?? [];
      if (keys.length === 0) return { ok: false, error: "Choose at least one stage." };
      q = q.in("qualification_status", keys);
    }
    const { data: leads, error } = await q;
    if (error) return { ok: false, error: error.message };

    const rows = ((leads as any[]) ?? [])
      .filter((l) => l.phone_number)
      .map((l) => ({
        phone_number: String(l.phone_number),
        name: (l.lead_name as string | null) ?? null,
        lead_id: l.id as string,
        merge_data: leadToMerge(l),
      }));
    if (rows.length === 0) return { ok: true, error: null, added: 0, skipped: 0 };

    const res = await insertRecipients(db, data.campaignId, rows);
    return { ok: true, error: null, ...res };
  });

// Add recipients from an uploaded CSV. Each row must include a phone; any other
// columns become merge fields. `name` (or first_name) maps to the display name.
export const addRecipientsFromCsv = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        campaignId: z.string().uuid(),
        rows: z
          .array(z.record(z.string(), z.string().max(2000)))
          .min(1)
          .max(10000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(MANAGE_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();

    const findKey = (obj: Record<string, string>, candidates: string[]): string | null => {
      const keys = Object.keys(obj);
      for (const c of candidates) {
        const hit = keys.find((k) => k.trim().toLowerCase() === c);
        if (hit) return hit;
      }
      return null;
    };

    const rows: Array<{
      phone_number: string;
      name: string | null;
      lead_id: string | null;
      merge_data: Record<string, unknown>;
    }> = [];
    for (const raw of data.rows) {
      const phoneKey = findKey(raw, ["phone", "phone_number", "telephone", "mobile", "whatsapp", "number"]);
      if (!phoneKey) continue;
      const phone = String(raw[phoneKey] ?? "").trim();
      if (!phone) continue;
      const nameKey = findKey(raw, ["name", "full_name", "first_name", "contact"]);
      const name = nameKey ? String(raw[nameKey] ?? "").trim() || null : null;
      const merge: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(raw)) {
        if (k === phoneKey) continue;
        merge[k.trim().toLowerCase().replace(/\s+/g, "_")] = v;
      }
      rows.push({ phone_number: phone, name, lead_id: null, merge_data: merge });
    }
    if (rows.length === 0) return { ok: false, error: "No valid rows with a phone column were found." };

    const res = await insertRecipients(db, data.campaignId, rows);
    return { ok: true, error: null, ...res };
  });

// Remove all pending recipients from a campaign (does not touch sent/replied).
export const clearPendingRecipients = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ campaignId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(MANAGE_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { error } = await db
      .from("campaign_recipients")
      .delete()
      .eq("campaign_id", data.campaignId)
      .eq("status", "pending");
    return { ok: !error, error: error?.message ?? null };
  });

/* ----------------------------- Export ----------------------------- */

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// Export the active space's contacts (leads) as a CSV string for download.
export const exportContactsCsv = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { csv: "", error: "Unauthorized" };
  const db = await scopedDb();
  const { data, error } = await db
    .from("leads")
    .select("lead_name, phone_number, student_or_parent, course_interest, country_interest, qualification_status, created_at")
    .order("created_at", { ascending: false })
    .limit(20000);
  if (error) return { csv: "", error: error.message };

  const headers = [
    "name",
    "phone",
    "type",
    "course_interest",
    "country_interest",
    "stage",
    "created_at",
  ];
  const lines = [headers.join(",")];
  for (const l of (data as any[]) ?? []) {
    lines.push(
      [
        csvCell(l.lead_name),
        csvCell(l.phone_number),
        csvCell(l.student_or_parent),
        csvCell(l.course_interest),
        csvCell(l.country_interest),
        csvCell(l.qualification_status),
        csvCell(l.created_at),
      ].join(","),
    );
  }
  return { csv: lines.join("\n"), error: null };
});

/* eslint-enable @typescript-eslint/no-explicit-any */
