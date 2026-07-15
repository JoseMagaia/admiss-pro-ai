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

// Deterministic, collision-free Twilio client identity for a user. Used both
// when minting the browser token and when building inbound TwiML so an incoming
// call can ring the exact browser clients in a ring group.
export function agentIdentity(userId: string): string {
  return `agent_${userId.replace(/-/g, "")}`;
}

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
  identity: string;
  inbound: boolean;
};
type TwilioClientConfig = {
  provider: "twilio";
  token: string;
  callerId: string;
  identity: string;
  inbound: boolean;
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
  inbound_enabled: z.boolean().optional(),
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

/* ------------------------- TWILIO CONNECTION TEST ------------------------ */

type TwilioCheck = { ok: boolean; message: string };
type TwilioTestResult = {
  ok: boolean;
  provider: "twilio";
  checks: {
    credentials: TwilioCheck;
    twiml_app: TwilioCheck;
    outbound: TwilioCheck;
    inbound: TwilioCheck;
  };
};

async function twilioGet(accountSid: string, keySid: string, keySecret: string, path: string) {
  const auth = btoa(`${keySid}:${keySecret}`);
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}${path}`;
  const res = await fetch(url, { headers: { Authorization: `Basic ${auth}`, Accept: "application/json" } });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, body: body as Record<string, unknown> };
}

export const testTwilioConnection = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ expected_twiml_url: z.string().url().optional(), expected_inbound_url: z.string().url().optional() }).parse(d),
  )
  .handler(async ({ data }): Promise<TwilioTestResult | { ok: false; error: string }> => {
    try {
      await guard(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { data: row } = await db.from("voip_settings").select("*").limit(1).maybeSingle();
    const s = row as Record<string, unknown> | null;
    if (!s || s.provider !== "twilio") {
      return { ok: false, error: "Twilio is not the selected provider." };
    }
    const accountSid = String(s.twilio_account_sid ?? "");
    const keySid = String(s.twilio_api_key_sid ?? "");
    const keySecret = String(s.twilio_api_key_secret ?? "");
    const appSid = String(s.twilio_twiml_app_sid ?? "");
    const callerId = String(s.twilio_caller_id ?? "");
    const inboundEnabled = Boolean(s.inbound_enabled);

    const result: TwilioTestResult = {
      ok: false,
      provider: "twilio",
      checks: {
        credentials: { ok: false, message: "Not checked" },
        twiml_app: { ok: false, message: "Not checked" },
        outbound: { ok: false, message: "Not checked" },
        inbound: { ok: false, message: "Not checked" },
      },
    };

    if (!accountSid || !keySid || !keySecret) {
      result.checks.credentials = { ok: false, message: "Missing Account SID, API Key SID, or Secret." };
      return result;
    }

    // 1) Credentials — fetch account
    try {
      const r = await twilioGet(accountSid, keySid, keySecret, ".json");
      if (r.ok) {
        result.checks.credentials = { ok: true, message: `Authenticated as "${String(r.body.friendly_name ?? accountSid)}" (${String(r.body.status ?? "active")}).` };
      } else {
        const msg = String(r.body.message ?? `HTTP ${r.status}`);
        result.checks.credentials = { ok: false, message: `Auth failed: ${msg}` };
        return result;
      }
    } catch (e) {
      result.checks.credentials = { ok: false, message: `Network error: ${(e as Error).message}` };
      return result;
    }

    // 2) TwiML App exists + voice URL matches expected
    if (!appSid) {
      result.checks.twiml_app = { ok: false, message: "TwiML App SID is not set." };
    } else {
      const r = await twilioGet(accountSid, keySid, keySecret, `/Applications/${appSid}.json`);
      if (!r.ok) {
        result.checks.twiml_app = { ok: false, message: `TwiML App not found: ${String(r.body.message ?? `HTTP ${r.status}`)}` };
      } else {
        const voiceUrl = String(r.body.voice_url ?? "");
        if (data.expected_twiml_url && voiceUrl !== data.expected_twiml_url) {
          result.checks.twiml_app = {
            ok: false,
            message: `App found but Voice URL is "${voiceUrl || "(empty)"}". Set it to ${data.expected_twiml_url}.`,
          };
        } else {
          result.checks.twiml_app = { ok: true, message: `App "${String(r.body.friendly_name ?? appSid)}" is configured.` };
        }
      }
    }

    // 3) Outbound — caller id must be an owned incoming number or verified outbound caller id
    if (!callerId) {
      result.checks.outbound = { ok: false, message: "Caller ID is not set." };
    } else {
      const enc = encodeURIComponent(callerId);
      const [nums, verified] = await Promise.all([
        twilioGet(accountSid, keySid, keySecret, `/IncomingPhoneNumbers.json?PhoneNumber=${enc}`),
        twilioGet(accountSid, keySid, keySecret, `/OutgoingCallerIds.json?PhoneNumber=${enc}`),
      ]);
      const ownedCount = Array.isArray(nums.body.incoming_phone_numbers) ? (nums.body.incoming_phone_numbers as unknown[]).length : 0;
      const verifiedCount = Array.isArray(verified.body.outgoing_caller_ids) ? (verified.body.outgoing_caller_ids as unknown[]).length : 0;
      if (ownedCount > 0) {
        result.checks.outbound = { ok: true, message: `Caller ID ${callerId} is a Twilio number on this account.` };
      } else if (verifiedCount > 0) {
        result.checks.outbound = { ok: true, message: `Caller ID ${callerId} is a verified outbound caller id.` };
      } else {
        result.checks.outbound = { ok: false, message: `Caller ID ${callerId} is not owned by this account and not a verified caller id.` };
      }
    }

    // 4) Inbound — needs at least one number whose Voice URL points at our inbound endpoint
    if (!inboundEnabled) {
      result.checks.inbound = { ok: true, message: "Inbound calling is disabled — skipped." };
    } else if (!data.expected_inbound_url) {
      result.checks.inbound = { ok: false, message: "Could not determine expected inbound URL." };
    } else {
      const r = await twilioGet(accountSid, keySid, keySecret, `/IncomingPhoneNumbers.json?PageSize=100`);
      const list = (r.body.incoming_phone_numbers as Array<Record<string, unknown>> | undefined) ?? [];
      const matches = list.filter((n) => String(n.voice_url ?? "") === data.expected_inbound_url);
      if (list.length === 0) {
        result.checks.inbound = { ok: false, message: "No incoming numbers on this account." };
      } else if (matches.length === 0) {
        result.checks.inbound = {
          ok: false,
          message: `None of your ${list.length} number(s) have Voice URL set to ${data.expected_inbound_url}.`,
        };
      } else {
        result.checks.inbound = {
          ok: true,
          message: `${matches.length}/${list.length} number(s) route to this app.`,
        };
      }
    }

    result.ok = Object.values(result.checks).every((c) => c.ok);
    return result;
  });



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

    const inbound = Boolean(s.inbound_enabled);

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
          identity: agentIdentity(u.userId),
          inbound,
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
          identity: agentIdentity(u.userId),
        });
        return {
          config: { provider: "twilio", token, callerId: String(s.twilio_caller_id ?? ""), identity: agentIdentity(u.userId), inbound },
        };
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

/* ----------------------- RING GROUPS / INBOUND ----------------------- */

// Users that can be added to a ring group (any authed user with a profile).
// Super admin only — used by the telephony settings screens.
export const listSpaceAgents = createServerFn({ method: "GET" }).handler(async () => {
  try {
    await guard(["super_admin"]);
  } catch {
    return { agents: [] as Array<{ user_id: string; full_name: string | null; email: string | null; role: string | null }> };
  }
  const db = await scopedDb();
  const [{ data: profiles }, { data: roles }] = await Promise.all([
    db.from("profiles").select("user_id, email, full_name").order("full_name", { ascending: true }),
    db.from("user_roles").select("user_id, role"),
  ]);
  const roleMap = new Map<string, string>();
  for (const r of (roles as Array<{ user_id: string; role: string }> | null) ?? []) roleMap.set(r.user_id, r.role);
  const agents = ((profiles as Array<{ user_id: string; email: string | null; full_name: string | null }> | null) ?? []).map(
    (p) => ({ user_id: p.user_id, full_name: p.full_name, email: p.email, role: roleMap.get(p.user_id) ?? null }),
  );
  return { agents };
});

export type RingGroupRow = {
  id: string;
  name: string;
  ring_seconds: number;
  active: boolean;
  member_ids: string[];
};

export const listRingGroups = createServerFn({ method: "GET" }).handler(async (): Promise<{ groups: RingGroupRow[] }> => {
  try {
    await guard(["super_admin"]);
  } catch {
    return { groups: [] };
  }
  const db = await scopedDb();
  const { data: groups } = await db.from("ring_groups").select("*").order("created_at", { ascending: false }).limit(200);
  const rows = (groups as Array<{ id: string; name: string; ring_seconds: number; active: boolean }> | null) ?? [];
  const { data: members } = await db
    .from("ring_group_members")
    .select("ring_group_id, user_id, position")
    .order("position", { ascending: true });
  const memberMap = new Map<string, string[]>();
  for (const m of (members as Array<{ ring_group_id: string; user_id: string }> | null) ?? []) {
    memberMap.set(m.ring_group_id, [...(memberMap.get(m.ring_group_id) ?? []), m.user_id]);
  }
  return {
    groups: rows.map((g) => ({
      id: g.id,
      name: g.name,
      ring_seconds: g.ring_seconds,
      active: g.active,
      member_ids: memberMap.get(g.id) ?? [],
    })),
  };
});

const ringGroupSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  ring_seconds: z.number().int().min(5).max(120).optional(),
  active: z.boolean().optional(),
  member_ids: z.array(z.string().uuid()).max(50).optional(),
});

export const saveRingGroup = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ringGroupSchema.parse(d))
  .handler(async ({ data }) => {
    let me;
    try {
      me = await guard(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message, id: null };
    }
    const db = await scopedDb();
    const { id, member_ids, ...rest } = data;
    const row: Record<string, unknown> = { name: rest.name };
    if (rest.ring_seconds !== undefined) row.ring_seconds = rest.ring_seconds;
    if (rest.active !== undefined) row.active = rest.active;

    let groupId = id ?? null;
    if (id) {
      const { error } = await db.from("ring_groups").update(row as never).eq("id", id);
      if (error) return { ok: false, error: error.message, id: null };
    } else {
      const { data: inserted, error } = await db
        .from("ring_groups")
        .insert({ ...row, created_by: me.userId } as never)
        .select("id")
        .maybeSingle();
      if (error) return { ok: false, error: error.message, id: null };
      groupId = (inserted as { id?: string } | null)?.id ?? null;
    }

    if (groupId && member_ids) {
      await db.from("ring_group_members").delete().eq("ring_group_id", groupId);
      if (member_ids.length) {
        const rows = member_ids.map((uid, i) => ({ ring_group_id: groupId, user_id: uid, position: i }));
        await db.from("ring_group_members").insert(rows as never);
      }
    }
    return { ok: true, error: null, id: groupId };
  });

export const deleteRingGroup = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    await db.from("ring_group_members").delete().eq("ring_group_id", data.id);
    await db.from("inbound_routes").update({ ring_group_id: null } as never).eq("ring_group_id", data.id);
    const { error } = await db.from("ring_groups").delete().eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

export type InboundRouteRow = {
  id: string;
  did: string;
  ring_group_id: string | null;
  no_answer_action: string;
  active: boolean;
};

export const listInboundRoutes = createServerFn({ method: "GET" }).handler(async (): Promise<{ routes: InboundRouteRow[] }> => {
  try {
    await guard(["super_admin"]);
  } catch {
    return { routes: [] };
  }
  const db = await scopedDb();
  const { data } = await db.from("inbound_routes").select("*").order("created_at", { ascending: false }).limit(200);
  const rows = (data as Array<InboundRouteRow> | null) ?? [];
  return {
    routes: rows.map((r) => ({
      id: r.id,
      did: r.did,
      ring_group_id: r.ring_group_id ?? null,
      no_answer_action: r.no_answer_action,
      active: r.active,
    })),
  };
});

const inboundRouteSchema = z.object({
  id: z.string().uuid().optional(),
  did: z.string().min(3).max(60),
  ring_group_id: z.string().uuid().nullable().optional(),
  no_answer_action: z.enum(["hangup", "voicemail"]).optional(),
  active: z.boolean().optional(),
});

export const saveInboundRoute = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => inboundRouteSchema.parse(d))
  .handler(async ({ data }) => {
    let me;
    try {
      me = await guard(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message, id: null };
    }
    const db = await scopedDb();
    const { id, ...rest } = data;
    const row: Record<string, unknown> = { did: rest.did.replace(/[\s\-().]/g, ""), ring_group_id: rest.ring_group_id ?? null };
    if (rest.no_answer_action !== undefined) row.no_answer_action = rest.no_answer_action;
    if (rest.active !== undefined) row.active = rest.active;
    if (id) {
      const { error } = await db.from("inbound_routes").update(row as never).eq("id", id);
      return { ok: !error, error: error?.message ?? null, id };
    }
    const { data: inserted, error } = await db
      .from("inbound_routes")
      .insert({ ...row, created_by: me.userId } as never)
      .select("id")
      .maybeSingle();
    return { ok: !error, error: error?.message ?? null, id: (inserted as { id?: string } | null)?.id ?? null };
  });

export const deleteInboundRoute = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { error } = await db.from("inbound_routes").delete().eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });
