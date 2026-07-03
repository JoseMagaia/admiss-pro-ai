import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ALL_ROLES, CALL_CAMPAIGN_ROLES, type AppRole } from "@/lib/roles";
import { PIPELINE_COLUMNS, type QualificationStage } from "@/lib/pipeline";

/* ----------------------- shared server helpers ----------------------- */

async function spaceCtx() {
  const { resolveSpaceContext } = await import("./space-context.server");
  return resolveSpaceContext();
}

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

async function currentUser() {
  const { getRequestUser } = await import("@/integrations/supabase/role-guard.server");
  return getRequestUser();
}

async function isAuthed(): Promise<boolean> {
  const u = await currentUser();
  return Boolean(u?.role);
}

const ANY_ROLE = ALL_ROLES;

// Fields returned to the browser softphone. SIP passwords / short-lived Twilio
// tokens are only ever handed to an authenticated user.
type SipClientConfig = {
  provider: "sip";
  wsServer: string;
  uri: string;
  authUser: string;
  password: string;
  domain: string;
  displayName: string;
  callerId: string;
};
type TwilioClientConfig = {
  provider: "twilio";
  token: string;
  callerId: string;
};
type DisabledConfig = { provider: "disabled"; reason: string };
type VoipClientConfig = SipClientConfig | TwilioClientConfig | DisabledConfig;

/* ----------------------------- VOIP SETTINGS ----------------------------- */

// Full settings row (includes secrets) — super admin only.
export const getVoipSettings = createServerFn({ method: "GET" }).handler(async () => {
  try {
    await guard(["super_admin"]);
  } catch {
    return { settings: null, error: "Forbidden" };
  }
  const db = await scopedDb();
  const { data } = await db.from("voip_settings").select("*").limit(1).maybeSingle();
  return { settings: data ?? null, error: null };
});

const voipSchema = z.object({
  id: z.string().uuid().optional(),
  provider: z.enum(["disabled", "sip", "twilio"]),
  enabled: z.boolean(),
  sip_ws_server: z.string().max(500).nullable().optional(),
  sip_domain: z.string().max(300).nullable().optional(),
  sip_uri: z.string().max(300).nullable().optional(),
  sip_username: z.string().max(300).nullable().optional(),
  sip_password: z.string().max(500).nullable().optional(),
  sip_display_name: z.string().max(200).nullable().optional(),
  twilio_account_sid: z.string().max(100).nullable().optional(),
  twilio_api_key_sid: z.string().max(100).nullable().optional(),
  twilio_api_key_secret: z.string().max(500).nullable().optional(),
  twilio_twiml_app_sid: z.string().max(100).nullable().optional(),
  twilio_caller_id: z.string().max(60).nullable().optional(),
});

// Secret fields the UI sends as "" when the user left them untouched — never
// overwrite a stored secret with an empty value.
const SECRET_FIELDS = ["sip_password", "twilio_api_key_secret"] as const;

export const saveVoipSettings = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => voipSchema.parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { id, ...rest } = data;
    for (const f of SECRET_FIELDS) {
      if (rest[f] === "" || rest[f] === undefined) delete (rest as Record<string, unknown>)[f];
    }
    if (id) {
      const { error } = await db.from("voip_settings").update(rest as never).eq("id", id);
      return { ok: !error, error: error?.message ?? null };
    }
    const { error } = await db.from("voip_settings").insert(rest as never);
    return { ok: !error, error: error?.message ?? null };
  });

// Mint a short-lived Twilio Voice access token (HS256 JWT) using jose so it
// stays Worker-compatible (no Node-only twilio SDK).
async function mintTwilioToken(opts: {
  accountSid: string;
  apiKeySid: string;
  apiKeySecret: string;
  twimlAppSid: string;
  identity: string;
}): Promise<string> {
  const { SignJWT } = await import("jose");
  const secret = new TextEncoder().encode(opts.apiKeySecret);
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    scope: undefined,
    grants: {
      identity: opts.identity,
      voice: {
        incoming: { allow: true },
        outgoing: { application_sid: opts.twimlAppSid },
      },
    },
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT", cty: "twilio-fpa;v=1" })
    .setIssuer(opts.apiKeySid)
    .setSubject(opts.accountSid)
    .setIssuedAt(now)
    .setNotBefore(now)
    .setExpirationTime(now + 3600)
    .setJti(`${opts.apiKeySid}-${now}`)
    .sign(secret);
}

// Sanitized config the browser needs to place a call (any authed user).
export const getVoipClientConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ config: VoipClientConfig }> => {
    const u = await currentUser();
    if (!u?.role) return { config: { provider: "disabled", reason: "Unauthorized" } };
    const db = await scopedDb();
    const { data } = await db.from("voip_settings").select("*").limit(1).maybeSingle();
    const s = data as Record<string, unknown> | null;
    if (!s || !s.enabled || s.provider === "disabled") {
      return { config: { provider: "disabled", reason: "Calling is not set up yet. Ask a super admin to configure telephony." } };
    }

    if (s.provider === "sip") {
      const wsServer = String(s.sip_ws_server ?? "");
      const uri = String(s.sip_uri ?? "");
      if (!wsServer || !uri) {
        return { config: { provider: "disabled", reason: "SIP settings are incomplete." } };
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
        },
      };
    }

    if (s.provider === "twilio") {
      const accountSid = String(s.twilio_account_sid ?? "");
      const apiKeySid = String(s.twilio_api_key_sid ?? "");
      const apiKeySecret = String(s.twilio_api_key_secret ?? "");
      const twimlAppSid = String(s.twilio_twiml_app_sid ?? "");
      if (!accountSid || !apiKeySid || !apiKeySecret || !twimlAppSid) {
        return { config: { provider: "disabled", reason: "Twilio settings are incomplete." } };
      }
      try {
        const token = await mintTwilioToken({
          accountSid,
          apiKeySid,
          apiKeySecret,
          twimlAppSid,
          identity: `agent_${u.userId.slice(0, 8)}`,
        });
        return { config: { provider: "twilio", token, callerId: String(s.twilio_caller_id ?? "") } };
      } catch {
        return { config: { provider: "disabled", reason: "Could not create a Twilio session." } };
      }
    }

    return { config: { provider: "disabled", reason: "Unknown provider." } };
  },
);

/* -------------------------------- CALLS -------------------------------- */

export const listCalls = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { calls: [] };
  const db = await scopedDb();
  const { data } = await db.from("calls").select("*").order("created_at", { ascending: false }).limit(500);
  return { calls: data ?? [] };
});

const logCallSchema = z.object({
  id: z.string().uuid().optional(),
  lead_id: z.string().uuid().nullable().optional(),
  phone_number: z.string().min(1).max(60),
  direction: z.enum(["outbound", "inbound"]).optional(),
  status: z.enum(["completed", "no_answer", "busy", "failed", "voicemail", "canceled"]).optional(),
  disposition: z.string().max(200).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  provider: z.string().max(20).nullable().optional(),
  provider_call_sid: z.string().max(120).nullable().optional(),
  started_at: z.string().nullable().optional(),
  ended_at: z.string().nullable().optional(),
  duration_seconds: z.number().int().min(0).max(86400).optional(),
});

// Insert a new call record, or update an existing one (by id).
export const logCall = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => logCallSchema.parse(d))
  .handler(async ({ data }) => {
    let me;
    try {
      me = await guard(ANY_ROLE);
    } catch (e) {
      return { ok: false, error: (e as Error).message, id: null };
    }
    const db = await scopedDb();
    const { id, ...rest } = data;
    if (id) {
      const { error } = await db.from("calls").update(rest as never).eq("id", id);
      return { ok: !error, error: error?.message ?? null, id };
    }
    const { data: inserted, error } = await db
      .from("calls")
      .insert({ ...rest, agent_user_id: me.userId } as never)
      .select("id")
      .maybeSingle();
    return { ok: !error, error: error?.message ?? null, id: (inserted as { id?: string } | null)?.id ?? null };
  });

export const updateCallNotes = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), notes: z.string().max(5000).nullable(), disposition: z.string().max(200).nullable().optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(ANY_ROLE);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const patch: Record<string, unknown> = { notes: data.notes };
    if (data.disposition !== undefined) patch.disposition = data.disposition;
    const { error } = await db.from("calls").update(patch as never).eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

/* ------------------------------ CALLBACKS ------------------------------ */

export const scheduleCallback = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        lead_id: z.string().uuid().nullable().optional(),
        phone_number: z.string().min(1).max(60),
        scheduled_at: z.string().min(1),
        reason: z.string().max(500).nullable().optional(),
        notes: z.string().max(5000).nullable().optional(),
        from_call_id: z.string().uuid().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    let me;
    try {
      me = await guard(ANY_ROLE);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { error } = await db.from("call_callbacks").insert({ ...data, agent_user_id: me.userId } as never);
    return { ok: !error, error: error?.message ?? null };
  });

export const listCallbacks = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { callbacks: [] };
  const db = await scopedDb();
  const { data } = await db
    .from("call_callbacks")
    .select("*")
    .eq("status", "pending")
    .order("scheduled_at", { ascending: true })
    .limit(500);
  return { callbacks: data ?? [] };
});

export const completeCallback = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["done", "canceled"]).optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(ANY_ROLE);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { error } = await db.from("call_callbacks").update({ status: data.status ?? "done" } as never).eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

/* --------------------------- DIAL CAMPAIGNS ---------------------------- */

export const listDialCampaigns = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { campaigns: [] };
  const db = await scopedDb();
  const { data } = await db.from("dial_campaigns").select("*").order("created_at", { ascending: false }).limit(200);
  return { campaigns: data ?? [] };
});

const campaignSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  source_type: z.enum(["stage", "filter", "manual", "callbacks"]),
  criteria: z.record(z.string(), z.unknown()).optional(),
  active: z.boolean().optional(),
  // For manual campaigns: the members to (re)set.
  members: z
    .array(z.object({ lead_id: z.string().uuid().nullable().optional(), phone_number: z.string().min(1).max(60) }))
    .max(5000)
    .optional(),
});

export const saveDialCampaign = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => campaignSchema.parse(d))
  .handler(async ({ data }) => {
    let me;
    try {
      me = await guard(CALL_CAMPAIGN_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message, id: null };
    }
    const db = await scopedDb();
    const { id, members, ...rest } = data;
    const row: Record<string, unknown> = {
      name: rest.name,
      source_type: rest.source_type,
      criteria: rest.criteria ?? {},
    };
    if (rest.active !== undefined) row.active = rest.active;

    let campaignId = id ?? null;
    if (id) {
      const { error } = await db.from("dial_campaigns").update(row as never).eq("id", id);
      if (error) return { ok: false, error: error.message, id: null };
    } else {
      const { data: inserted, error } = await db
        .from("dial_campaigns")
        .insert({ ...row, created_by: me.userId } as never)
        .select("id")
        .maybeSingle();
      if (error) return { ok: false, error: error.message, id: null };
      campaignId = (inserted as { id?: string } | null)?.id ?? null;
    }

    // Replace manual members when provided.
    if (campaignId && data.source_type === "manual" && members) {
      await db.from("dial_campaign_members").delete().eq("campaign_id", campaignId);
      if (members.length) {
        const rows = members.map((m, i) => ({
          campaign_id: campaignId,
          lead_id: m.lead_id ?? null,
          phone_number: m.phone_number,
          position: i,
        }));
        await db.from("dial_campaign_members").insert(rows as never);
      }
    }
    return { ok: true, error: null, id: campaignId };
  });

export const deleteDialCampaign = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(CALL_CAMPAIGN_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    await db.from("dial_campaign_members").delete().eq("campaign_id", data.id);
    const { error } = await db.from("dial_campaigns").delete().eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

type QueueEntry = { lead_id: string | null; phone_number: string; lead_name: string | null; stage?: string | null };

function stagesForColumn(columnId: string): QualificationStage[] {
  return PIPELINE_COLUMNS.find((c) => c.id === columnId)?.stages ?? [];
}

// Resolve the ordered list of contacts to dial for a campaign.
export const getDialQueue = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ campaignId: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<{ queue: QueueEntry[]; error: string | null }> => {
    if (!(await isAuthed())) return { queue: [], error: "Unauthorized" };
    const db = await scopedDb();
    const { data: campaign } = await db.from("dial_campaigns").select("*").eq("id", data.campaignId).maybeSingle();
    const c = campaign as { source_type?: string; criteria?: Record<string, unknown> } | null;
    if (!c) return { queue: [], error: "Campaign not found" };

    if (c.source_type === "manual") {
      const { data: members } = await db
        .from("dial_campaign_members")
        .select("lead_id, phone_number")
        .eq("campaign_id", data.campaignId)
        .order("position", { ascending: true });
      const rows = (members as Array<{ lead_id: string | null; phone_number: string }> | null) ?? [];
      // Enrich with lead names.
      const phones = rows.map((r) => r.phone_number);
      const nameMap = new Map<string, string | null>();
      if (phones.length) {
        const { data: leads } = await db.from("leads").select("phone_number, lead_name").in("phone_number", phones);
        for (const l of (leads as Array<{ phone_number: string; lead_name: string | null }> | null) ?? []) {
          nameMap.set(l.phone_number, l.lead_name);
        }
      }
      return {
        queue: rows.map((r) => ({ lead_id: r.lead_id, phone_number: r.phone_number, lead_name: nameMap.get(r.phone_number) ?? null })),
        error: null,
      };
    }

    if (c.source_type === "callbacks") {
      const nowIso = new Date().toISOString();
      const { data: cbs } = await db
        .from("call_callbacks")
        .select("lead_id, phone_number")
        .eq("status", "pending")
        .lte("scheduled_at", nowIso)
        .order("scheduled_at", { ascending: true })
        .limit(1000);
      const rows = (cbs as Array<{ lead_id: string | null; phone_number: string }> | null) ?? [];
      const phones = rows.map((r) => r.phone_number);
      const nameMap = new Map<string, string | null>();
      if (phones.length) {
        const { data: leads } = await db.from("leads").select("phone_number, lead_name").in("phone_number", phones);
        for (const l of (leads as Array<{ phone_number: string; lead_name: string | null }> | null) ?? []) {
          nameMap.set(l.phone_number, l.lead_name);
        }
      }
      return {
        queue: rows.map((r) => ({ lead_id: r.lead_id, phone_number: r.phone_number, lead_name: nameMap.get(r.phone_number) ?? null })),
        error: null,
      };
    }

    // stage / filter: resolve from leads via pipeline column or explicit stage.
    const criteria = c.criteria ?? {};
    const explicitStage = typeof criteria.stage === "string" ? (criteria.stage as string) : null;
    const columnId = typeof criteria.column === "string" ? (criteria.column as string) : null;
    let stages: string[] = [];
    if (explicitStage) stages = [explicitStage];
    else if (columnId && columnId !== "all") stages = stagesForColumn(columnId);

    let query = db.from("leads").select("id, phone_number, lead_name, qualification_status").order("updated_at", { ascending: false }).limit(1000);
    if (stages.length) query = query.in("qualification_status", stages);
    const { data: leads } = await query;
    const rows = (leads as Array<{ id: string; phone_number: string; lead_name: string | null; qualification_status: string }> | null) ?? [];
    return {
      queue: rows.map((l) => ({ lead_id: l.id, phone_number: l.phone_number, lead_name: l.lead_name, stage: l.qualification_status })),
      error: null,
    };
  });

// Search leads by name / phone for the manual dialer & manual campaign builder.
export const searchDialContacts = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ query: z.string().max(200).optional() }).parse(d ?? {}))
  .handler(async ({ data }) => {
    if (!(await isAuthed())) return { contacts: [] };
    const db = await scopedDb();
    const q = (data.query ?? "").trim();
    let query = db.from("leads").select("id, phone_number, lead_name, course_interest, country_interest, qualification_status");
    if (q) {
      query = query.or(`lead_name.ilike.%${q}%,phone_number.ilike.%${q}%`);
    }
    const { data: leads } = await query.order("updated_at", { ascending: false }).limit(50);
    return { contacts: leads ?? [] };
  });
