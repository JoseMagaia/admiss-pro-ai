// Server-only admissions processing pipeline. Uses the admin Supabase client.
import {
  detectHumanTakeover,
  fillTemplate,
  runQualification,
  type EngineMessage,
  type LeadRecord,
  type QualificationDecision,
} from "./ai-engine.server";

type AdminClient = Awaited<
  typeof import("@/integrations/supabase/client.server")
>["supabaseAdmin"];

// Raw service-role client (NOT space-scoped). Use for cross-space discovery
// such as matching an inbound workspace/inbox or sweeping due cron rows.
async function rawAdmin(): Promise<AdminClient> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

// Space-aware client. When the current async context is bound to a space (via
// runInSpace) tenant tables are filtered/tagged by that space; otherwise it
// falls back to the Default Space so legacy single-tenant behaviour is preserved.
async function admin(): Promise<AdminClient> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { currentSpaceId, makeScopedClient, getDefaultSpaceId } = await import("./space-context.server");
  const sid = currentSpaceId() ?? (await getDefaultSpaceId());
  return makeScopedClient(supabaseAdmin, sid) as AdminClient;
}

// Re-export so dashboard/advanced server functions can run admissions helpers
// inside a resolved space.
import { runInSpace } from "./space-context.server";
export { runInSpace };

import type { ProviderConfig } from "./ai-engine.server";

export interface AiContext {
  systemPrompt: string;
  model: string;
  temperature: number;
  variables: Record<string, string>;
  settings: Record<string, unknown> | null;
  provider: ProviderConfig | null;
}

export interface WorkspaceRow {
  id: string;
  name: string;
  /** Connection provider: "chatwoot" (default), "evolution" or "waba" (Meta WhatsApp Business Platform). */
  provider_type: string;
  chatwoot_url: string | null;
  chatwoot_account_id: string | null;
  chatwoot_inbox_id: string | null;
  chatwoot_api_token: string | null;
  evolution_url: string | null;
  evolution_api_key: string | null;
  evolution_instance: string | null;
  waba_phone_number_id: string | null;
  waba_business_account_id: string | null;
  waba_access_token: string | null;
  waba_api_version: string | null;
  waba_verify_token: string | null;
  waba_app_secret: string | null;
  waba_display_name: string | null;
  enabled: boolean;
  is_default: boolean;
  use_shared_ai: boolean;
  space_id?: string | null;
}

export interface ChatwootCreds {
  url: string;
  accountId: string;
  apiToken: string;
}

export async function loadAiContext(): Promise<AiContext> {
  const db = await admin();
  const [{ data: config }, { data: vars }, { data: settings }, { data: pool }] = await Promise.all([
    db.from("ai_configuration").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    db.from("ai_variables").select("variable_name, variable_value"),
    db.from("education_settings").select("*").limit(1).maybeSingle(),
    db.from("ai_provider_pool").select("*").eq("enabled", true).order("priority", { ascending: true }),
  ]);

  const variables: Record<string, string> = {};
  for (const v of vars ?? []) variables[v.variable_name] = v.variable_value;

  const cfg = config as Record<string, unknown> | null;
  const builtInModel = (config?.model as string) ?? "google/gemini-3-flash-preview";

  // Build the prioritized fallback chain when rotation is enabled and at least
  // one user-configured provider exists. The old built-in Lovable gateway is
  // intentionally excluded — a custom provider is required.
  let fallbackChain: import("./ai-engine.server").AiFallbackTarget[] | null = null;
  if (cfg?.fallback_enabled && Array.isArray(pool) && pool.length > 0) {
    const chain: import("./ai-engine.server").AiFallbackTarget[] = (pool as Array<Record<string, unknown>>)
      .map((row) => ({
        provider: String(row.provider ?? ""),
        baseUrl: (row.base_url as string | null) ?? null,
        apiKey: (row.api_key as string | null) ?? null,
        models: Array.isArray(row.models) ? (row.models as string[]).filter(Boolean) : [],
      }))
      .filter((t) => t.provider && t.provider.toLowerCase() !== "built_in" && (t.apiKey && t.models.length > 0));
    fallbackChain = chain;
  }

  const provider: ProviderConfig = {
    mode: (cfg?.provider_mode as "built_in" | "custom") ?? "built_in",
    custom_provider: (cfg?.custom_provider as string) ?? null,
    custom_base_url: (cfg?.custom_base_url as string) ?? null,
    custom_model: (cfg?.custom_model as string) ?? null,
    custom_api_key: (cfg?.custom_api_key as string) ?? null,
    fallbackChain,
  };

  return {
    systemPrompt: config?.system_prompt ?? "You are an admissions assistant.",
    model: builtInModel,
    temperature: Number(config?.temperature ?? 0.7),
    variables,
    settings: settings ?? null,
    provider,
  };
}

/* --------------------------- WORKSPACES -------------------------- */

// Find the workspace handling an incoming message. Priority:
// 1. explicit workspace id (e.g. stored on the lead),
// 2. matching Evolution API instance name,
// 3. matching Chatwoot inbox id,
// 4. matching Chatwoot account id,
// 5. the default workspace.
export async function resolveWorkspace(params: {
  workspaceId?: string | null;
  inboxId?: string | null;
  accountId?: string | null;
  instance?: string | null;
  phoneNumberId?: string | null;
}): Promise<WorkspaceRow | null> {
  // Discovery must search across all spaces to find the owning workspace.
  const db = await rawAdmin();
  const { data } = await db.from("chatwoot_workspaces").select("*").eq("enabled", true);
  const rows = (data as WorkspaceRow[]) ?? [];
  if (rows.length === 0) return null;

  if (params.workspaceId) {
    const byId = rows.find((w) => w.id === params.workspaceId);
    if (byId) return byId;
  }
  if (params.phoneNumberId) {
    const wanted = String(params.phoneNumberId).trim();
    const byWaba = rows.find(
      (w) =>
        w.provider_type === "waba" &&
        w.waba_phone_number_id &&
        String(w.waba_phone_number_id).trim() === wanted,
    );
    if (byWaba) return byWaba;
  }
  if (params.instance) {
    const wanted = String(params.instance).trim();
    const byInstance = rows.find(
      (w) =>
        w.provider_type === "evolution" &&
        w.evolution_instance &&
        String(w.evolution_instance).trim() === wanted,
    );
    if (byInstance) return byInstance;
  }
  if (params.inboxId) {
    const byInbox = rows.find((w) => w.chatwoot_inbox_id && String(w.chatwoot_inbox_id) === String(params.inboxId));
    if (byInbox) return byInbox;
  }
  if (params.accountId) {
    const byAccount = rows.find(
      (w) => w.chatwoot_account_id && String(w.chatwoot_account_id) === String(params.accountId),
    );
    if (byAccount) return byAccount;
  }
  return rows.find((w) => w.is_default) ?? rows[0];
}

// Resolve usable Chatwoot credentials from a workspace, falling back to the
// company-wide education_settings for backward compatibility.
export async function resolveCreds(workspace: WorkspaceRow | null): Promise<ChatwootCreds | null> {
  if (workspace?.chatwoot_url && workspace.chatwoot_account_id && workspace.chatwoot_api_token) {
    return {
      url: workspace.chatwoot_url,
      accountId: workspace.chatwoot_account_id,
      apiToken: workspace.chatwoot_api_token,
    };
  }
  const db = await admin();
  const { data: settings } = await db
    .from("education_settings")
    .select("chatwoot_url, chatwoot_account_id, chatwoot_api_token")
    .limit(1)
    .maybeSingle();
  if (settings?.chatwoot_url && settings?.chatwoot_account_id && settings?.chatwoot_api_token) {
    return {
      url: String(settings.chatwoot_url),
      accountId: String(settings.chatwoot_account_id),
      apiToken: String(settings.chatwoot_api_token),
    };
  }
  return null;
}

export async function getOrCreateLead(
  phone: string,
  chatwootConversationId?: string | null,
  chatwootContactId?: string | null,
  workspaceId?: string | null,
): Promise<LeadRecord> {
  const db = await admin();
  const { data: existing } = await db.from("leads").select("*").eq("phone_number", phone).maybeSingle();
  if (existing) {
    if (workspaceId && !(existing as Record<string, unknown>).workspace_id) {
      await db.from("leads").update({ workspace_id: workspaceId } as never).eq("id", (existing as LeadRecord).id!);
    }
    return existing as LeadRecord;
  }

  const { data: created } = await db
    .from("leads")
    .insert({
      phone_number: phone,
      chatwoot_conversation_id: chatwootConversationId ?? null,
      chatwoot_contact_id: chatwootContactId ?? null,
      workspace_id: workspaceId ?? null,
      qualification_status: "NEW_LEAD",
    } as never)
    .select("*")
    .single();

  return created as LeadRecord;
}

export async function recentHistory(phone: string): Promise<EngineMessage[]> {
  const db = await admin();
  const { data } = await db
    .from("whatsapp_messages")
    .select("sender, message_content")
    .eq("phone_number", phone)
    .order("received_at", { ascending: true })
    .limit(30);
  return (data as EngineMessage[]) ?? [];
}

async function runHttpActions(stage: string, lead: LeadRecord) {
  const db = await admin();
  const { data: actions } = await db
    .from("http_actions")
    .select("*")
    .eq("enabled", true)
    .eq("trigger_stage", stage);

  for (const action of actions ?? []) {
    try {
      const ctx = {
        lead_name: lead.lead_name ?? "",
        phone_number: lead.phone_number,
        course_interest: lead.course_interest ?? "",
        country_interest: lead.country_interest ?? "",
        qualification_status: lead.qualification_status ?? "",
        parent_phone: lead.parent_phone ?? "",
      };
      const body = fillTemplate(action.payload_template ?? "{}", ctx);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (action.headers && typeof action.headers === "object") {
        for (const [k, v] of Object.entries(action.headers as Record<string, unknown>)) {
          headers[k] = String(v);
        }
      }
      await fetch(action.url, {
        method: (action.method as string) || "POST",
        headers,
        body: action.method === "GET" ? undefined : body,
      });
    } catch (e) {
      console.error("HTTP action failed:", action.name, e);
    }
  }
}

const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

// Create or update a lead's "booking" appointment, writing the agreed time and
// preserving its status (defaults to pending/confirmation).
/* eslint-disable @typescript-eslint/no-explicit-any */
async function upsertLeadBooking(
  db: any,
  params: { phone: string; leadName: string | null; date: string | null; status: string; notes?: string },
): Promise<void> {
  const status = BOOKING_STATUSES.includes((params.status ?? "").toLowerCase())
    ? params.status.toLowerCase()
    : "pending";
  const { data: existing } = await db
    .from("appointments")
    .select("id")
    .eq("phone_number", params.phone)
    .eq("appointment_type", "booking")
    .maybeSingle();

  if (!existing) {
    await db.from("appointments").insert({
      phone_number: params.phone,
      lead_name: params.leadName,
      appointment_type: "booking",
      status,
      appointment_date: params.date,
      notes: params.notes ?? "Set by AI.",
    });
  } else {
    const update: Record<string, unknown> = { status };
    // Only overwrite the date when the AI actually captured one.
    if (params.date) update.appointment_date = params.date;
    await db.from("appointments").update(update as never).eq("id", existing.id);
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Parse an optional [[BOOKING: <iso> | <status>]] directive out of a responder
// agent's reply. Returns the cleaned message plus any captured booking details.
function extractBookingDirective(text: string): { date: string | null; status: string; clean: string } {
  const re = /\[\[\s*BOOKING:\s*([^\]|]+?)\s*(?:\|\s*([a-zA-Z]+)\s*)?\]\]/i;
  const m = text.match(re);
  if (!m) return { date: null, status: "pending", clean: text };
  const parsed = Date.parse(m[1].trim());
  const date = Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
  const status = (m[2] || "pending").toLowerCase();
  const clean = text.replace(re, "").trim();
  return { date, status, clean };
}

export async function applyDecision(lead: LeadRecord, decision: QualificationDecision): Promise<LeadRecord> {
  const db = await admin();
  const previousStage = lead.qualification_status;

  const update: Record<string, unknown> = {
    ...decision.updates,
    qualification_status: decision.qualification_status,
  };

  const { data: updated } = await db
    .from("leads")
    .update(update as never)
    .eq("id", lead.id!)
    .select("*")
    .single();

  const finalLead = (updated as LeadRecord) ?? { ...lead, ...update };

  // Create / update the booking request when advancing into the booking stage
  // or when the AI captured a specific appointment time for this lead.
  if (
    decision.create_booking ||
    decision.qualification_status === "BOOKING_REQUEST_CREATED" ||
    decision.appointment_date
  ) {
    await upsertLeadBooking(db, {
      phone: lead.phone_number,
      leadName: finalLead.lead_name ?? null,
      date: decision.appointment_date ?? null,
      status: decision.appointment_status ?? "pending",
      notes: decision.booking_notes ?? "Auto-created by AI after qualification.",
    });
  }

  // Fire HTTP actions only when the stage actually changed.
  if (previousStage !== decision.qualification_status) {
    await runHttpActions(decision.qualification_status, finalLead);
  }

  return finalLead;
}

// Send a message to a WhatsApp contact through Chatwoot using the given
// credentials (workspace-aware, with education_settings fallback).
export interface SendResult {
  ok: boolean;
  error?: string;
}

export async function sendChatwootReply(
  creds: ChatwootCreds | null,
  conversationId: string | null | undefined,
  message: string,
): Promise<SendResult> {
  if (!creds) {
    console.warn("Chatwoot not configured; reply not sent to WhatsApp.");
    return { ok: false, error: "Chatwoot isn't set up for this inbox yet." };
  }
  if (!conversationId) {
    return { ok: false, error: "No active Chatwoot conversation for this contact yet." };
  }
  const base = String(creds.url).replace(/\/$/, "");
  const url = `${base}/api/v1/accounts/${creds.accountId}/conversations/${conversationId}/messages`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_access_token: creds.apiToken,
      },
      body: JSON.stringify({ content: message, message_type: "outgoing" }),
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: "Chatwoot rejected the API token (check it in settings)." };
      }
      if (res.status === 404) {
        return { ok: false, error: "Chatwoot couldn't find this conversation or inbox." };
      }
      return { ok: false, error: `Chatwoot returned an error (${res.status}).` };
    }
    return { ok: true };
  } catch (e) {
    console.error("Chatwoot reply failed:", e);
    return { ok: false, error: "Couldn't reach the Chatwoot server." };
  }
}

// Create a brand-new Chatwoot contact + conversation for an agent-initiated
// outbound message. Best-effort: returns the new conversation id, or null when
// Chatwoot isn't configured or the inbox id is missing.
export async function createChatwootConversation(params: {
  creds: ChatwootCreds | null;
  inboxId: string | null | undefined;
  phone: string;
  name?: string | null;
}): Promise<string | null> {
  const { creds, inboxId, phone, name } = params;
  if (!creds || !inboxId) return null;
  const base = String(creds.url).replace(/\/$/, "");
  const headers = {
    "Content-Type": "application/json",
    api_access_token: creds.apiToken,
  };
  try {
    // 1. Create (or get) the contact.
    const contactRes = await fetch(
      `${base}/api/v1/accounts/${creds.accountId}/contacts`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          inbox_id: Number(inboxId),
          name: name || phone,
          phone_number: phone.startsWith("+") ? phone : `+${phone}`,
        }),
      },
    );
    const contactJson = (await contactRes.json().catch(() => null)) as
      | { payload?: { contact?: { id?: number }; contact_inbox?: { source_id?: string } } }
      | null;
    const contact = contactJson?.payload?.contact;
    const sourceId = contactJson?.payload?.contact_inbox?.source_id;
    if (!contact?.id) return null;

    // 2. Create the conversation in the inbox for that contact.
    const convRes = await fetch(
      `${base}/api/v1/accounts/${creds.accountId}/conversations`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          inbox_id: Number(inboxId),
          contact_id: contact.id,
          source_id: sourceId,
        }),
      },
    );
    const convJson = (await convRes.json().catch(() => null)) as { id?: number } | null;
    return convJson?.id ? String(convJson.id) : null;
  } catch (e) {
    console.error("Chatwoot conversation creation failed:", e);
    return null;
  }
}

// Normalize a phone identifier into the digits Evolution API expects (country
// code + number, no "+" or WhatsApp JID suffix).
export function toEvolutionNumber(phone: string): string {
  return String(phone).replace(/@.*$/, "").replace(/[^0-9]/g, "");
}

// Send a WhatsApp message through an Evolution API instance. Outbound targets
// the contact's phone number directly (Evolution has no Chatwoot-style
// conversation id). Best-effort: returns whether the send succeeded.
export async function sendEvolutionReply(
  workspace: WorkspaceRow | null,
  phone: string,
  message: string,
): Promise<SendResult> {
  // Trim stored values: trailing spaces in the instance name or URL are a common
  // cause of spurious "instance not found" (404) errors from Evolution.
  const baseRaw = String(workspace?.evolution_url ?? "").trim();
  const instance = String(workspace?.evolution_instance ?? "").trim();
  const apiKey = String(workspace?.evolution_api_key ?? "").trim();
  if (!baseRaw || !apiKey || !instance) {
    console.warn("Evolution API not configured; reply not sent to WhatsApp.");
    return { ok: false, error: "Evolution API isn't fully set up for this inbox yet." };
  }
  const base = baseRaw.replace(/\/+$/, "");
  const url = `${base}/message/sendText/${encodeURIComponent(instance)}`;
  const number = toEvolutionNumber(phone);
  if (!number) return { ok: false, error: "The contact's phone number is invalid." };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({ number, text: message }),
    });
    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      let detail = "";
      try {
        const parsed = JSON.parse(bodyText) as { message?: unknown; response?: { message?: unknown } };
        const m = parsed?.response?.message ?? parsed?.message;
        detail = Array.isArray(m) ? m.join(" ") : typeof m === "string" ? m : "";
      } catch {
        detail = bodyText.slice(0, 160);
      }
      console.error("Evolution send failed:", res.status, bodyText.slice(0, 300));
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: "Evolution rejected the API key (check it in settings)." };
      }
      if (res.status === 404) {
        return {
          ok: false,
          error: `Evolution instance "${instance}" not found. Check the exact instance name and base URL.`,
        };
      }
      if (res.status === 400) {
        return {
          ok: false,
          error: detail
            ? `Evolution rejected the message: ${detail}`
            : "Evolution rejected the message (check the recipient number).",
        };
      }
      return { ok: false, error: `Evolution returned an error (${res.status}).${detail ? ` ${detail}` : ""}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("Evolution reply failed:", e);
    return { ok: false, error: "Couldn't reach the Evolution API server (check the base URL)." };
  }
}

// Send a WhatsApp message through the official Meta WhatsApp Business Platform
// (WABA / Cloud API). Uses the Phone Number ID + system-user access token stored
// on the connection, and the graph API version chosen in settings.
export async function sendWabaReply(
  workspace: WorkspaceRow | null,
  phone: string,
  message: string,
): Promise<SendResult> {
  const phoneNumberId = String(workspace?.waba_phone_number_id ?? "").trim();
  const token = String(workspace?.waba_access_token ?? "").trim();
  const apiVersion = String(workspace?.waba_api_version ?? "v21.0").trim() || "v21.0";
  if (!phoneNumberId || !token) {
    return { ok: false, error: "WABA isn't fully set up for this connection yet (phone number ID + token)." };
  }
  const number = toEvolutionNumber(phone);
  if (!number) return { ok: false, error: "The contact's phone number is invalid." };
  const url = `https://graph.facebook.com/${encodeURIComponent(apiVersion)}/${encodeURIComponent(phoneNumberId)}/messages`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: number,
        type: "text",
        text: { body: message, preview_url: false },
      }),
    });
    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      let detail = "";
      try {
        const parsed = JSON.parse(bodyText) as { error?: { message?: string; code?: number } };
        detail = parsed?.error?.message ?? "";
      } catch {
        detail = bodyText.slice(0, 200);
      }
      console.error("WABA send failed:", res.status, bodyText.slice(0, 300));
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: "Meta rejected the access token (check it in Settings → Connections)." };
      }
      if (res.status === 404) {
        return { ok: false, error: "Phone number ID not found on Meta (check the connection)." };
      }
      return {
        ok: false,
        error: detail ? `WhatsApp rejected the message: ${detail}` : `Meta returned an error (${res.status}).`,
      };
    }
    return { ok: true };
  } catch (e) {
    console.error("WABA reply failed:", e);
    return { ok: false, error: "Couldn't reach the Meta Graph API." };
  }
}

// Provider-agnostic outbound delivery. Routes to Evolution API or the official
// WhatsApp Business Platform (WABA) when the connection uses those providers,
// otherwise falls back to Chatwoot. This is the single send path used by the AI
// engine, responder agents, workflows, manual replies and scheduled messages so
// behavior stays identical across providers.
export async function sendWorkspaceMessage(params: {
  workspace: WorkspaceRow | null;
  creds: ChatwootCreds | null;
  phone: string;
  conversationId: string | null | undefined;
  message: string;
}): Promise<SendResult> {
  const { workspace, creds, phone, conversationId, message } = params;
  if (!workspace) {
    return { ok: false, error: "No inbox is connected to send from." };
  }
  if (workspace.provider_type === "evolution") {
    return sendEvolutionReply(workspace, phone, message);
  }
  if (workspace.provider_type === "waba") {
    return sendWabaReply(workspace, phone, message);
  }
  return sendChatwootReply(creds, conversationId, message);
}



export interface ProcessResult {
  reply: string;
  stage: string;
  humanTakeover: boolean;
  error?: string;
}

export async function processInboundMessage(params: {
  phone: string;
  message: string;
  chatwootConversationId?: string | null;
  chatwootContactId?: string | null;
  chatwootInboxId?: string | null;
  chatwootAccountId?: string | null;
  /** Evolution API instance name (when the message arrived via Evolution webhook). */
  evolutionInstance?: string | null;
  /** WABA Phone Number ID (when the message arrived via the Meta WhatsApp webhook). */
  wabaPhoneNumberId?: string | null;
}): Promise<ProcessResult> {
  const {
    phone,
    message,
    chatwootConversationId,
    chatwootContactId,
    chatwootInboxId,
    chatwootAccountId,
    evolutionInstance,
    wabaPhoneNumberId,
  } = params;

  // Resolve which workspace (Chatwoot inbox, Evolution instance or WABA number)
  // handles this conversation FIRST so the rest of the pipeline runs inside the
  // owning Space.
  const workspace = await resolveWorkspace({
    inboxId: chatwootInboxId,
    accountId: chatwootAccountId,
    instance: evolutionInstance,
    phoneNumberId: wabaPhoneNumberId,
  });
  const { getDefaultSpaceId } = await import("./space-context.server");
  const spaceId = (workspace?.space_id as string | null) ?? (await getDefaultSpaceId());

  return runInSpace(spaceId, async () => {
  const db = await admin();
  const creds = await resolveCreds(workspace);

  // Log inbound message.
  await db.from("whatsapp_messages").insert({
    phone_number: phone,
    message_content: message,
    sender: "lead",
    message_type: "text",
    processed: false,
  });

  // Drip Campaigns: a reply from this contact stops any further campaign
  // messages to them and records the reply for campaign reporting. The reply
  // itself continues through the normal inbound pipeline below (inbox,
  // AI agents, workflows, CRM), so all existing automations still fire.
  await stopCampaignsForPhone(phone);


  const lead = await getOrCreateLead(phone, chatwootConversationId, chatwootContactId, workspace?.id ?? null);

  // Track / upsert conversation.
  const { data: conv } = await db
    .from("conversations")
    .select("*")
    .eq("phone_number", phone)
    .maybeSingle();

  let humanTakeover = conv?.human_takeover ?? false;

  if (!conv) {
    await db.from("conversations").insert({
      phone_number: phone,
      lead_id: lead.id,
      chatwoot_conversation_id: chatwootConversationId ?? null,
      workspace_id: workspace?.id ?? null,
      status: "open",
    } as never);
  } else if (workspace?.id && !(conv as Record<string, unknown>).workspace_id) {
    await db.from("conversations").update({ workspace_id: workspace.id } as never).eq("phone_number", phone);
  }

  // Human takeover detection.
  if (!humanTakeover && detectHumanTakeover(message)) {
    humanTakeover = true;
    await db
      .from("conversations")
      .update({ human_takeover: true, status: "pending", assigned_agent: "Admissions Team" })
      .eq("phone_number", phone);
  }

  if (humanTakeover) {
    return {
      reply: "",
      stage: lead.qualification_status ?? "NEW_LEAD",
      humanTakeover: true,
    };
  }

  // Workflow reaction routing: if the lead is enrolled in an active orchestration
  // workflow that has a responder agent, the lead reacting hands the conversation
  // to that responder agent and stops the outbound sequence.
  const responderReply = await tryWorkflowResponder({
    phone,
    message,
    lead,
    conversationId: chatwootConversationId ?? lead.chatwoot_conversation_id ?? null,
    creds,
    workspace,
  });
  if (responderReply !== null) {
    return { reply: responderReply, stage: lead.qualification_status ?? "NEW_LEAD", humanTakeover: false };
  }


  // agent has switched the AI back on (ai_resumed), it resumes replying to the
  // next message in context per its defined role.
  const aiResumed = (conv as Record<string, unknown> | null)?.ai_resumed === true;
  const stageStop =
    lead.qualification_status === "BOOKING_REQUEST_CREATED" || stageBeyondAi(lead.qualification_status);
  if (stageStop && !aiResumed) {
    return {
      reply: "",
      stage: lead.qualification_status ?? "NEW_LEAD",
      humanTakeover: false,
    };
  }

  const ctx = await loadAiContext();
  const history = await recentHistory(phone);

  const { decision, error } = await runQualification({
    lead,
    history,
    userMessage: message,
    systemPrompt: ctx.systemPrompt,
    model: ctx.model,
    temperature: ctx.temperature,
    variables: ctx.variables,
    settings: ctx.settings,
    provider: ctx.provider,
  });

  const updatedLead = await applyDecision(lead, decision);

  // Log AI response.
  await db.from("whatsapp_messages").insert({
    phone_number: phone,
    message_content: decision.reply,
    sender: "ai",
    message_type: "text",
    ai_response: decision.reply,
    processed: true,
  });

  // Mark inbound message processed.
  await db
    .from("whatsapp_messages")
    .update({ processed: true })
    .eq("phone_number", phone)
    .eq("sender", "lead")
    .eq("processed", false);

  // Send reply back through the lead's connection provider (Chatwoot or Evolution).
  await sendWorkspaceMessage({
    workspace,
    creds,
    phone,
    conversationId: chatwootConversationId ?? lead.chatwoot_conversation_id,
    message: decision.reply,
  });

  return {
    reply: decision.reply,
    stage: updatedLead.qualification_status ?? decision.qualification_status,
    humanTakeover: false,
    error,
  };
  });
}

// Deliver a single manual/scheduled message to a contact and log it.
export async function deliverHumanMessage(params: {
  phone: string;
  message: string;
  scheduled?: boolean;
  /** When set, the agent chose to deliver through this specific workspace. */
  workspaceId?: string | null;
  /** Label of the agent acting, recorded in the internal switch note. */
  actor?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const db = await admin();
  const { phone, message } = params;

  let { data: lead } = await db
    .from("leads")
    .select("id, chatwoot_conversation_id, workspace_id")
    .eq("phone_number", phone)
    .maybeSingle();
  let { data: conv } = await db
    .from("conversations")
    .select("id, chatwoot_conversation_id, workspace_id")
    .eq("phone_number", phone)
    .maybeSingle();

  if (!lead) {
    lead = (await getOrCreateLead(phone, null, null, null)) as unknown as NonNullable<typeof lead>;
  }
  if (!conv) {
    const { data: createdConv } = await db
      .from("conversations")
      .insert({
        phone_number: phone,
        lead_id: (lead as Record<string, unknown> | null)?.id ?? null,
        workspace_id:
          (params.workspaceId ?? (lead as Record<string, unknown> | null)?.workspace_id) ?? null,
        chatwoot_conversation_id: (lead as Record<string, unknown> | null)?.chatwoot_conversation_id ?? null,
        status: "pending",
        human_takeover: true,
        assigned_agent: params.actor ?? "Admissions Team",
        ai_resumed: false,
      } as never)
      .select("id, chatwoot_conversation_id, workspace_id")
      .single();
    conv = createdConv;
  }

  const currentWorkspaceId =
    ((conv as Record<string, unknown> | null)?.workspace_id as string | null) ??
    ((lead as Record<string, unknown> | null)?.workspace_id as string | null) ??
    null;
  let conversationId =
    ((conv as Record<string, unknown> | null)?.chatwoot_conversation_id as string | null) ??
    ((lead as Record<string, unknown> | null)?.chatwoot_conversation_id as string | null) ??
    null;

  // Decide which workspace this message is delivered through.
  const requested = params.workspaceId ?? null;
  const switching = Boolean(requested) && requested !== currentWorkspaceId;
  const effectiveWorkspaceId = requested ?? currentWorkspaceId;

  const workspace = await resolveWorkspace({ workspaceId: effectiveWorkspaceId });
  const creds = await resolveCreds(workspace);

  // When the agent switches the delivery workspace, the stored Chatwoot
  // conversation id belongs to the previous account, so reissue one in the new
  // workspace and drop an internal note into the same chat window.
  if (switching) {
    const prevWorkspace = currentWorkspaceId
      ? await resolveWorkspace({ workspaceId: currentWorkspaceId })
      : null;

    if (workspace?.provider_type === "evolution") {
      conversationId = null;
    } else {
      conversationId = await createChatwootConversation({
        creds,
        inboxId: workspace?.chatwoot_inbox_id ?? null,
        phone,
        name: null,
      });
    }

    const fromLabel = prevWorkspace?.name ?? "previous workspace";
    const toLabel = workspace?.name ?? "default workspace";
    const actorLabel = params.actor ? ` by ${params.actor}` : "";
    await db.from("whatsapp_messages").insert({
      phone_number: phone,
      message_content: `Delivery workspace switched from "${fromLabel}" to "${toLabel}"${actorLabel}.`,
      sender: "note",
      message_type: "text",
      processed: true,
    });

    await db
      .from("conversations")
      .update({ workspace_id: workspace?.id ?? null, chatwoot_conversation_id: conversationId } as never)
      .eq("phone_number", phone);
    if ((lead as Record<string, unknown> | null)?.id) {
      await db
        .from("leads")
        .update({ workspace_id: workspace?.id ?? null } as never)
        .eq("id", (lead as Record<string, unknown>).id as string);
    }
  }

  // Not switching, but the lead's own workspace is a Chatwoot inbox with no
  // recorded conversation id yet (e.g. evolution-origin lead, or a partial
  // record). Create one on the lead's workspace so the human reply actually
  // delivers there instead of failing with "no active conversation".
  if (
    !switching &&
    workspace &&
    workspace.provider_type !== "evolution" &&
    !conversationId
  ) {
    conversationId = await createChatwootConversation({
      creds,
      inboxId: workspace.chatwoot_inbox_id ?? null,
      phone,
      name: null,
    });
    if (conversationId) {
      await db
        .from("conversations")
        .update({
          workspace_id: workspace.id,
          chatwoot_conversation_id: conversationId,
        } as never)
        .eq("phone_number", phone);
      if ((lead as Record<string, unknown> | null)?.id) {
        await db
          .from("leads")
          .update({
            workspace_id: workspace.id,
            chatwoot_conversation_id: conversationId,
          } as never)
          .eq("id", (lead as Record<string, unknown>).id as string);
      }
    }
  } else if (
    !switching &&
    workspace?.id &&
    workspace.id !== currentWorkspaceId
  ) {
    // Persist the resolved workspace so future replies stay on the lead's inbox.
    await db
      .from("conversations")
      .update({ workspace_id: workspace.id } as never)
      .eq("phone_number", phone);
  }

  const sent = await sendWorkspaceMessage({
    workspace,
    creds,
    phone,
    conversationId,
    message,
  });

  // Log the human message regardless of delivery success so the timeline is complete.
  await db.from("whatsapp_messages").insert({
    phone_number: phone,
    message_content: message,
    sender: "human",
    message_type: "text",
    processed: true,
  });

  await db
    .from("conversations")
    .update({ human_takeover: true, status: "pending", updated_at: new Date().toISOString() } as never)
    .eq("phone_number", phone);

  if (!sent.ok) {
    const reason = sent.error ?? "the connection could not be reached";
    return {
      ok: false,
      error: `Message saved but not delivered: ${reason}`,
    };
  }
  return { ok: true };
}

// Process all scheduled messages that are due. Called by the cron route.
export async function processScheduledMessages(): Promise<{ processed: number }> {
  const db = await rawAdmin();
  const { getDefaultSpaceId } = await import("./space-context.server");
  const fallbackSpace = await getDefaultSpaceId();
  const nowIso = new Date().toISOString();
  const { data: due } = await db
    .from("scheduled_messages")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_for", nowIso)
    .limit(50);

  let processed = 0;
  for (const row of (due as Array<Record<string, unknown>>) ?? []) {
    const spaceId = (row.space_id as string | null) ?? fallbackSpace;
    const result = await runInSpace(spaceId, () =>
      deliverHumanMessage({
        phone: String(row.phone_number),
        message: String(row.message_content),
        scheduled: true,
      }),
    );
    await db
      .from("scheduled_messages")
      .update({
        status: result.ok ? "sent" : "failed",
        sent_at: new Date().toISOString(),
        error: result.ok ? null : result.error ?? "delivery failed",
      } as never)
      .eq("id", row.id as string);
    processed += 1;
  }
  return { processed };
}

function stageBeyondAi(stage?: string | null): boolean {
  const beyond = [
    "BOOKING_CONFIRMATION_CALL",
    "SPECIALIST_CONSULTATION",
    "PAYMENT_ACTIVATION",
    "ONBOARDING",
  ];
  return beyond.includes(stage ?? "");
}

/* ===================== ORCHESTRATION WORKFLOWS ===================== */

import { PIPELINE_COLUMNS } from "./pipeline";
import { DEFAULT_AGENT_ID, delayToMs, type StepAnchor } from "./orchestration";
import { runResponderAgent } from "./ai-engine.server";

export type WorkflowStepKind =
  | "message"
  | "image"
  | "buttons"
  | "wait"
  | "condition"
  | "setvar"
  | "ai"
  | "http"
  | "booking"
  | "handoff"
  | "end"
  | "call_workflow";

export interface WorkflowStep {
  /** Block kind executed by the engine. */
  kind: WorkflowStepKind;
  content: string;
  /** For call_workflow steps: the workflow to enroll the lead into. */
  targetWorkflowId?: string | null;
  /** Delay before sending this step, in milliseconds (used by the "wait" anchor). */
  delayMs: number;
  /** How this step is scheduled: relative wait, or countdown to a target date. */
  anchor: StepAnchor;
  /** For countdown anchors: how long before the target date to send, in ms. */
  offsetMs: number;
  // --- block-specific payload ---
  imageUrl?: string | null;
  caption?: string | null;
  options?: Array<{ id: string; label: string }>;
  instruction?: string | null;
  agentId?: string | null;
  agentName?: string | null;
  actionId?: string | null;
  actionName?: string | null;
  appointmentType?: string | null;
  daysAhead?: number;
  notes?: string | null;
  note?: string | null;
  varName?: string | null;
  varValue?: string | null;
  field?: string | null;
  operator?: string | null;
  value?: string | null;
  trueLabel?: string | null;
  falseLabel?: string | null;
}

interface GraphNode {
  id: string;
  type?: string;
  data?: Record<string, unknown>;
}
interface GraphEdge {
  source: string;
  target: string;
  sourceHandle?: string | null;
  label?: string | null;
}
interface WorkflowGraph {
  nodes?: GraphNode[];
  edges?: GraphEdge[];
}

// Resolve the delay (ms) of a message node, supporting selectable time units
// (days/hours/minutes/seconds) with backward-compatible delayMinutes fallback.
function nodeDelayMs(data?: GraphNode["data"]): number {
  if (data && data.delayValue !== undefined && data.delayUnit) {
    return delayToMs(Number(data.delayValue), String(data.delayUnit));
  }
  return Math.max(0, Number(data?.delayMinutes ?? 0)) * 60_000;
}

// Resolve the countdown offset (ms) for goal/appointment anchored steps.
function nodeOffsetMs(data?: GraphNode["data"]): number {
  if (data && data.offsetValue !== undefined && data.offsetUnit) {
    return delayToMs(Number(data.offsetValue), String(data.offsetUnit));
  }
  return 0;
}

// Compute when a step should next run, honoring its scheduling anchor.
// Falls back to a relative delay when an anchored target date is unavailable,
// and never schedules in the past.
export function stepNextRunAt(
  step: WorkflowStep | undefined,
  goalAtIso: string | null,
  apptAtIso: string | null,
): Date {
  const now = Date.now();
  if (!step) return new Date(now);
  if (step.anchor === "before_goal" && goalAtIso) {
    const t = new Date(goalAtIso).getTime();
    if (!Number.isNaN(t)) return new Date(Math.max(now, t - step.offsetMs));
  }
  if (step.anchor === "before_appointment" && apptAtIso) {
    const t = new Date(apptAtIso).getTime();
    if (!Number.isNaN(t)) return new Date(Math.max(now, t - step.offsetMs));
  }
  const rel = step.anchor === "wait" ? step.delayMs : step.offsetMs;
  return new Date(now + Math.max(0, rel));
}

// Find the most relevant appointment date for a lead: the soonest upcoming one,
// otherwise the most recent past appointment. Returns null when none exist.
async function getLeadAppointmentAt(phone: string): Promise<string | null> {
  const db = await admin();
  const nowIso = new Date().toISOString();
  const { data: future } = await db
    .from("appointments")
    .select("appointment_date")
    .eq("phone_number", phone)
    .not("appointment_date", "is", null)
    .gte("appointment_date", nowIso)
    .order("appointment_date", { ascending: true })
    .limit(1);
  const f = (future as Array<{ appointment_date: string }> | null)?.[0]?.appointment_date;
  if (f) return f;
  const { data: past } = await db
    .from("appointments")
    .select("appointment_date")
    .eq("phone_number", phone)
    .not("appointment_date", "is", null)
    .order("appointment_date", { ascending: false })
    .limit(1);
  return (past as Array<{ appointment_date: string }> | null)?.[0]?.appointment_date ?? null;
}

// Resolve the ordered steps from a saved visual graph. Walks the edges starting
// from the trigger node; falls back to node array order. Supports the full set of
// Typebot-style blocks. Branch nodes (condition / buttons) resolve their outgoing
// edge NOW against the lead's current data, so the same graph can take different
// paths on different cron ticks.
export async function orderedSteps(graph: unknown, phone?: string | null): Promise<WorkflowStep[]> {
  const g = (graph ?? {}) as WorkflowGraph;
  const nodes = g.nodes ?? [];
  const edges = g.edges ?? [];
  const STEP_KINDS = new Set([
    "text",
    "message",
    "image",
    "buttons",
    "wait",
    "condition",
    "setvar",
    "ai",
    "http",
    "booking",
    "handoff",
    "end",
    "workflow",
    "redirect",
  ]);
  // Block kind of a graph node. The current builder stores the kind in
  // data.type / data._t while node.type is always "flow"; legacy graphs used
  // node.type directly ("message", "workflow", ...). Resolve both.
  const stepKindOf = (n: GraphNode): string => {
    const d = (n.data ?? {}) as Record<string, unknown>;
    return String(d.type ?? d._t ?? n.type ?? "text");
  };
  const isStepNode = (n: GraphNode) => STEP_KINDS.has(stepKindOf(n));
  const stepNodes = nodes.filter(isStepNode);
  if (stepNodes.length === 0) return [];

  // Context for branching evaluated against the lead (fields + enrollment vars + last reply).
  let leadRow: Record<string, unknown> | null = null;
  let enrCtx: Record<string, string> = {};
  let lastReply: string | null = null;
  if (phone) {
    try {
      const db = await admin();
      const { data: lead } = await db.from("leads").select("*").eq("phone_number", phone).maybeSingle();
      leadRow = (lead as Record<string, unknown> | null) ?? null;
      const { data: enr } = await db
        .from("workflow_enrollments")
        .select("context")
        .eq("phone_number", phone)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      enrCtx = ((enr as { context?: Record<string, string> } | null)?.context ?? {}) as Record<string, string>;
      const hist = await recentHistory(phone);
      const lastUser = [...hist].reverse().find((h) => h.sender === "lead" || h.sender === "user");
      lastReply = lastUser ? String(lastUser.message_content ?? "") : null;
    } catch {
      // Branch to defaults on lookup failure.
    }
  }

  const toStep = (n: GraphNode): WorkflowStep => {
    const d = (n.data ?? {}) as Record<string, unknown>;
    const base = {
      content: String(d.content ?? "").trim(),
      delayMs: nodeDelayMs(d),
      anchor: (d.anchor as StepAnchor) ?? "wait",
      offsetMs: nodeOffsetMs(d),
    };
    switch (stepKindOf(n)) {
      case "workflow":
      case "redirect":
        return {
          ...base,
          kind: "call_workflow",
          content: "",
          targetWorkflowId: (d.targetWorkflowId as string | null) ?? null,
        };
      case "image":
        return { ...base, kind: "image", imageUrl: (d.imageUrl as string | null) ?? null, caption: (d.caption as string | null) ?? null };
      case "buttons":
        return { ...base, kind: "buttons", options: (d.options as Array<{ id: string; label: string }>) ?? [] };
      case "wait":
        return { ...base, kind: "wait" };
      case "condition":
        return {
          ...base,
          kind: "condition",
          field: (d.field as string | null) ?? null,
          operator: (d.operator as string | null) ?? "equals",
          value: (d.value as string | null) ?? "",
          trueLabel: (d.trueLabel as string | null) ?? "Yes",
          falseLabel: (d.falseLabel as string | null) ?? "No",
        };
      case "setvar":
        return { ...base, kind: "setvar", varName: (d.varName as string | null) ?? null, varValue: (d.varValue as string | null) ?? null };
      case "ai":
        return {
          ...base,
          kind: "ai",
          agentId: (d.agentId as string | null) ?? null,
          agentName: (d.agentName as string | null) ?? null,
          instruction: (d.instruction as string | null) ?? null,
        };
      case "http":
        return { ...base, kind: "http", actionId: (d.actionId as string | null) ?? null, actionName: (d.actionName as string | null) ?? null };
      case "booking":
        return {
          ...base,
          kind: "booking",
          appointmentType: (d.appointmentType as string | null) ?? "booking",
          daysAhead: Number(d.daysAhead) || 3,
          notes: (d.notes as string | null) ?? null,
        };
      case "handoff":
        return { ...base, kind: "handoff", note: (d.note as string | null) ?? null };
      case "end":
        return { ...base, kind: "end", note: (d.note as string | null) ?? null };
      default:
        return { ...base, kind: "message" };
    }
  };

  // A step is valid if it carries the payload its kind needs.
  const isValid = (s: WorkflowStep): boolean => {
    switch (s.kind) {
      case "call_workflow":
        return Boolean(s.targetWorkflowId);
      case "message":
        return s.content.length > 0;
      case "image":
        return Boolean(s.imageUrl);
      case "buttons":
        return s.content.length > 0 || (s.options ?? []).length > 0;
      case "setvar":
        return Boolean(s.varName);
      case "http":
        return Boolean(s.actionId);
      default:
        return true;
    }
  };

  const evaluate = (s: WorkflowStep): boolean => {
    const field = s.field ?? "";
    const raw = enrCtx[field] ?? leadRow?.[field] ?? "";
    const expected = fillTemplate(String(s.value ?? ""), { ...enrCtx, ...(leadRow ?? {}) });
    const operator = s.operator ?? "equals";
    const numA = Number(raw);
    const numB = Number(expected);
    switch (operator) {
      case "is_set":
        return raw !== undefined && raw !== null && String(raw).trim() !== "";
      case "is_empty":
        return raw === undefined || raw === null || String(raw).trim() === "";
      case "contains":
        return String(raw).toLowerCase().includes(String(expected).toLowerCase());
      case "gt":
        return !Number.isNaN(numA) && !Number.isNaN(numB) && numA > numB;
      case "lt":
        return !Number.isNaN(numA) && !Number.isNaN(numB) && numA < numB;
      case "not_equals":
        return String(raw) !== String(expected);
      default:
        return String(raw) === String(expected);
    }
  };

  const trigger = nodes.find((n) => n.type === "trigger");
  if (trigger && edges.length > 0) {
    const ordered: WorkflowStep[] = [];
    const seen = new Set<string>();
    let currentId: string | undefined = trigger.id;
    let guard = 0;
    while (currentId && !seen.has(currentId) && guard++ < 200) {
      seen.add(currentId);
      const node = nodes.find((n) => n.id === currentId);
      if (!node) break;
      if (isStepNode(node) && stepKindOf(node) !== "trigger") {
        const step = toStep(node);
        ordered.push(step);
        // Terminal kinds stop the walk.
        if (step.kind === "end" || step.kind === "handoff") break;
      }
      const outs = edges.filter((e) => e.source === currentId);
      if (node && stepKindOf(node) === "condition") {
        const step = ordered[ordered.length - 1];
        const matches = step ? evaluate(step) : true;
        const want = matches ? "yes" : "no";
        currentId = outs.find((e) => e.sourceHandle === want)?.target ?? outs[0]?.target ?? "";
        continue;
      }
      if (node && stepKindOf(node) === "buttons") {
        const step = ordered[ordered.length - 1];
        const labels = (step?.options ?? []).map((o) => o.label.trim().toLowerCase());
        const hit = lastReply ? labels.indexOf(lastReply.trim().toLowerCase()) : -1;
        const hitOpt = hit >= 0 ? (step?.options ?? [])[hit] : undefined;
        currentId =
          (hitOpt ? outs.find((e) => e.sourceHandle === `opt_${hitOpt.id}`) : undefined)?.target ??
          outs.find((e) => !e.sourceHandle)?.target ??
          outs[0]?.target ??
          "";
        continue;
      }
      const nextEdge = edges.find((e) => e.source === currentId);
      currentId = nextEdge?.target ?? "";
    }
    const filtered = ordered.filter(isValid);
    if (filtered.length > 0) return filtered;
  }

  return stepNodes.map(toStep).filter(isValid);
}


// Send an outbound workflow message on the lead's conversation. The message
// content may contain {{lead_name}} / {{course_interest}} / {{country_interest}}
// / {{phone_number}} placeholders, filled from the lead record before sending.
async function sendWorkflowMessage(phone: string, message: string, workflowWorkspaceId: string | null) {
  const db = await admin();
  const { data: conv } = await db
    .from("conversations")
    .select("chatwoot_conversation_id, workspace_id")
    .eq("phone_number", phone)
    .maybeSingle();
  const { data: lead } = await db
    .from("leads")
    .select("chatwoot_conversation_id, workspace_id, lead_name, course_interest, country_interest")
    .eq("phone_number", phone)
    .maybeSingle();

  const leadRow = (lead as Record<string, unknown> | null) ?? {};

  // Merge custom AI variables so workflow messages can use any {{VARIABLE}}
  // defined in AI Settings, in addition to the built-in lead fields.
  const { data: customVars } = await db.from("ai_variables").select("variable_name, variable_value");
  const ctx: Record<string, unknown> = {};
  for (const v of (customVars as Array<{ variable_name: string; variable_value: string }> | null) ?? []) {
    ctx[v.variable_name] = v.variable_value;
  }
  ctx.lead_name = leadRow.lead_name ?? "";
  ctx.course_interest = leadRow.course_interest ?? "";
  ctx.country_interest = leadRow.country_interest ?? "";
  ctx.phone_number = phone;
  const filled = fillTemplate(message, ctx);

  const workspaceId =
    (conv as Record<string, unknown> | null)?.workspace_id ??
    leadRow.workspace_id ??
    workflowWorkspaceId ??
    null;
  const conversationId =
    (conv as Record<string, unknown> | null)?.chatwoot_conversation_id ??
    leadRow.chatwoot_conversation_id ??
    null;

  const workspace = await resolveWorkspace({ workspaceId: workspaceId as string | null });
  const creds = await resolveCreds(workspace);
  const sent = await sendWorkspaceMessage({
    workspace,
    creds,
    phone,
    conversationId: conversationId as string | null,
    message: filled,
  });

  await db.from("whatsapp_messages").insert({
    phone_number: phone,
    message_content: filled,
    sender: "workflow",
    message_type: "text",
    processed: true,
  });
  return sent;
}

// Execute a single workflow step: send its message, or (for a "call workflow"
// step) enroll the lead into the target workflow. Enrolling without sendNow lets
// the cron advance the called workflow on its next tick, which also prevents
// infinite recursion between workflows that reference each other (the dedup in
// enrollLeadInWorkflowById stops a lead being enrolled twice in the same flow).
// Execute an AI block: resolve the responder context (default qualification
// agent unless another agent is picked), generate a message and send it.
async function runAiWorkflowStep(
  step: WorkflowStep,
  phone: string,
  workspaceId: string | null,
  leadId: string | null,
): Promise<void> {
  void leadId;
  const db = await admin();
  const { data: lead } = await db.from("leads").select("*").eq("phone_number", phone).maybeSingle();
  const leadRow = (lead as Record<string, unknown> | null) ?? null;
  let ctx: AiContext;
  if (step.agentId && step.agentId !== DEFAULT_AGENT_ID) {
    const { data: ag } = await db.from("responder_agents").select("*").eq("id", step.agentId).maybeSingle();
    const agent = ag as Record<string, unknown> | null;
    ctx = agent ? await loadResponderContext(agent) : await loadAiContext();
  } else {
    ctx = await loadAiContext();
  }
  const history = await recentHistory(phone);
  const { reply, error } = await runResponderAgent({
    systemPrompt: ctx.systemPrompt,
    model: ctx.model,
    temperature: ctx.temperature,
    variables: ctx.variables,
    settings: ctx.settings,
    lead: leadRow as unknown as LeadRecord,
    history,
    userMessage: String(step.instruction ?? "").trim() || "Continue the conversation with the lead.",
    provider: ctx.provider,
  });
  const text = error || !reply ? null : reply.trim();
  if (text) await sendWorkflowMessage(phone, text, workspaceId);
}

// Execute an HTTP block: load the stored action, merge variables into URL,
// headers and body, then fire the request. Failures are logged, never fatal.
async function runHttpWorkflowStep(step: WorkflowStep, phone: string): Promise<void> {
  if (!step.actionId) return;
  const db = await admin();
  const { data: ac } = await db.from("http_actions").select("*").eq("id", step.actionId).maybeSingle();
  const action = ac as Record<string, unknown> | null;
  if (!action || action.enabled === false) return;

  const ctx: Record<string, unknown> = {};
  const { data: customVars } = await db.from("ai_variables").select("variable_name, variable_value");
  for (const v of (customVars as Array<{ variable_name: string; variable_value: string }> | null) ?? []) {
    ctx[v.variable_name] = v.variable_value;
  }
  const { data: lead } = await db.from("leads").select("*").eq("phone_number", phone).maybeSingle();
  const leadRow = (lead as Record<string, unknown> | null) ?? {};
  ctx.lead_name = leadRow.lead_name ?? "";
  ctx.phone_number = phone;
  const fill = (s: string) => fillTemplate(s, ctx);
  const fillJson = (v: unknown): unknown => {
    if (typeof v === "string") return fill(v);
    if (Array.isArray(v)) return v.map(fillJson);
    if (v && typeof v === "object") {
      return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, val]) => [k, fillJson(val)]));
    }
    return v;
  };

  const url = fill(String(action.url ?? ""));
  const headers = fillJson(action.headers ?? {}) as Record<string, string>;
  const method = String(action.method ?? "POST").toUpperCase();
  let body: string | undefined;
  const rawTemplate = String(action.payload_template ?? "");
  if (rawTemplate.trim()) {
    try {
      body = JSON.stringify(JSON.parse(fill(rawTemplate)));
    } catch {
      body = fill(rawTemplate);
    }
  }
  try {
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: body && !["GET", "HEAD"].includes(method) ? body : undefined,
    });
  } catch (e) {
    console.error("Workflow HTTP step failed:", e);
  }
}

// Execute a booking block: create an appointment a few days out and confirm it
// to the lead in the conversation.
async function runBookingWorkflowStep(
  step: WorkflowStep,
  phone: string,
  workspaceId: string | null,
): Promise<void> {
  const db = await admin();
  const { data: lead } = await db.from("leads").select("lead_name").eq("phone_number", phone).maybeSingle();
  const days = Math.max(1, Math.min(90, Number(step.daysAhead) || 3));
  const when = new Date(Date.now() + days * 86400000);
  await upsertLeadBooking(db, {
    phone,
    leadName: (lead as { lead_name?: string | null } | null)?.lead_name ?? null,
    date: when.toISOString(),
    status: "pending",
    notes: String(step.notes ?? "") || "Booked automatically by workflow.",
  });
  const label = when.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  await sendWorkflowMessage(
    phone,
    `Great news! I've booked your ${String(step.appointmentType ?? "consultation")} for ${label}. 🎉`,
    workspaceId,
  );
}

// Execute a single workflow step, dispatching on the block kind .
async function executeWorkflowStep(
  step: WorkflowStep | undefined,
  phone: string,
  workspaceId: string | null,
  leadId: string | null,
  enrId?: string | null,
): Promise<void> {
  if (!step) return;
  switch (step.kind) {
    case "call_workflow": {
      if (step.targetWorkflowId) {
        await enrollLeadInWorkflowById({ workflowId: step.targetWorkflowId, phone, leadId, workspaceId });
      }
      return;
    }
    case "image": {
      const body = [String(step.caption ?? ""), String(step.imageUrl ?? "")].filter(Boolean).join("\n");
      if (body) await sendWorkflowMessage(phone, body, workspaceId);
      return;
    }
    case "buttons": {
      if (step.content) await sendWorkflowMessage(phone, step.content, workspaceId);
      return;
    }
    case "ai": {
      await runAiWorkflowStep(step, phone, workspaceId, leadId);
      return;
    }
    case "http": {
      await runHttpWorkflowStep(step, phone);
      return;
    }
    case "booking": {
      await runBookingWorkflowStep(step, phone, workspaceId);
      return;
    }
    case "handoff": {
      const db = await admin();
      await db.from("conversations").update({ human_takeover: true } as never).eq("phone_number", phone);
      return;
    }
    case "setvar": {
      if (step.varName && enrId) {
        const db = await admin();
        const { data: enr } = await db.from("workflow_enrollments").select("context").eq("id", enrId).maybeSingle();
        const ctx = ((enr as { context?: Record<string, string> } | null)?.context ?? {}) as Record<string, string>;
        const merged = fillTemplate(String(step.varValue ?? ""), {
          ...ctx,
          phone_number: phone,
        });
        ctx[String(step.varName)] = merged;
        await db.from("workflow_enrollments").update({ context: ctx } as never).eq("id", enrId);
      }
      return;
    }
    case "condition":
    case "wait":
    case "end": {
      // Branching was resolved when the step list was built; wait delays the
      // next tick via next_run_at; end simply lets the sequence complete.
      return;
    }
    default: {
      if (step.content) await sendWorkflowMessage(phone, step.content, workspaceId);
    }
  }
}


// Build the effective AI context for a responder agent (provider, variables, model).
async function loadResponderContext(agent: Record<string, unknown>): Promise<AiContext> {
  const base = await loadAiContext();
  const db = await admin();

  // Variables: optionally inherit qualification variables, then apply overrides.
  const variables: Record<string, string> = agent.inherit_variables ? { ...base.variables } : {};
  const { data: overrides } = await db
    .from("responder_agent_variables")
    .select("variable_name, variable_value")
    .eq("agent_id", agent.id as string);
  for (const v of (overrides as Array<{ variable_name: string; variable_value: string }>) ?? []) {
    variables[v.variable_name] = v.variable_value;
  }

  const mode = String(agent.provider_mode ?? "inherit");
  let provider: ProviderConfig;
  let model = String(agent.model ?? base.model);
  if (mode === "inherit") {
    provider = base.provider ?? { mode: "built_in" };
    if (provider.mode === "built_in") model = base.model;
  } else if (mode === "custom") {
    provider = {
      mode: "custom",
      custom_provider: (agent.custom_provider as string) ?? null,
      custom_base_url: (agent.custom_base_url as string) ?? null,
      custom_model: (agent.custom_model as string) ?? null,
      custom_api_key: (agent.custom_api_key as string) ?? null,
    };
  } else {
    provider = { mode: "built_in" };
  }

  return {
    systemPrompt: String(agent.system_prompt ?? "You are a helpful follow-up assistant."),
    model,
    temperature: Number(agent.temperature ?? 0.7),
    variables,
    settings: base.settings,
    provider,
  };
}

// If the lead has an active workflow enrollment with a responder agent, handle
// the reaction with that agent and return its reply. Returns null if there is no
// applicable workflow (so the caller falls back to the qualification engine).
async function tryWorkflowResponder(params: {
  phone: string;
  message: string;
  lead: LeadRecord;
  conversationId: string | null;
  creds: ChatwootCreds | null;
  workspace: WorkspaceRow | null;
}): Promise<string | null> {
  const db = await admin();
  const { data: enrollments } = await db
    .from("workflow_enrollments")
    .select("id, workflow_id, status")
    .eq("phone_number", params.phone)
    .in("status", ["active", "reacted"])
    .order("updated_at", { ascending: false });

  const rows = (enrollments as Array<Record<string, unknown>>) ?? [];
  if (rows.length === 0) return null;

  for (const enr of rows) {
    const { data: wf } = await db
      .from("workflows")
      .select("id, agent_id, enabled")
      .eq("id", enr.workflow_id as string)
      .maybeSingle();
    const workflow = wf as Record<string, unknown> | null;
    if (!workflow || !workflow.enabled || !workflow.agent_id) continue;

    const agentId = String(workflow.agent_id);

    // Resolve the responder context. The built-in default agent uses the
    // qualification agent's prompt/model/variables/provider from AI Settings.
    let ctx: AiContext;
    if (agentId === DEFAULT_AGENT_ID) {
      ctx = await loadAiContext();
    } else {
      const { data: ag } = await db
        .from("responder_agents")
        .select("*")
        .eq("id", agentId)
        .maybeSingle();
      const agent = ag as Record<string, unknown> | null;
      if (!agent || !agent.enabled) continue;
      ctx = await loadResponderContext(agent);
    }

    // Mark the enrollment as reacted so the outbound sequence stops.
    await db
      .from("workflow_enrollments")
      .update({ reacted: true, status: "reacted", next_run_at: null } as never)
      .eq("id", enr.id as string);


    const history = await recentHistory(params.phone);
    const { reply, error } = await runResponderAgent({
      systemPrompt: ctx.systemPrompt,
      model: ctx.model,
      temperature: ctx.temperature,
      variables: ctx.variables,
      settings: ctx.settings,
      lead: params.lead,
      history,
      userMessage: params.message,
      provider: ctx.provider,
    });

    if (error || !reply) {
      // Let the qualification engine handle it rather than going silent.
      return null;
    }

    // Responder agents may capture a booking time via a hidden directive.
    const booking = extractBookingDirective(reply);
    const cleanReply = booking.clean || reply;
    if (booking.date) {
      await upsertLeadBooking(db, {
        phone: params.phone,
        leadName: params.lead.lead_name ?? null,
        date: booking.date,
        status: booking.status,
        notes: "Set by AI responder agent.",
      });
    }

    await db.from("whatsapp_messages").insert({
      phone_number: params.phone,
      message_content: cleanReply,
      sender: "ai",
      message_type: "text",
      ai_response: cleanReply,
      processed: true,
    });
    await sendWorkspaceMessage({
      workspace: params.workspace,
      creds: params.creds,
      phone: params.phone,
      conversationId: params.conversationId,
      message: cleanReply,
    });
    return cleanReply;
  }

  return null;
}

// Enroll matching leads into enabled workflows and advance due sequences.
// Called every minute by the process-workflows cron route.
export async function processWorkflows(): Promise<{ enrolled: number; sent: number }> {
  const raw = await rawAdmin();
  const { getDefaultSpaceId } = await import("./space-context.server");
  const fallbackSpace = await getDefaultSpaceId();
  const nowIso = new Date().toISOString();
  let enrolled = 0;
  let sent = 0;

  const { data: workflowsData } = await raw.from("workflows").select("*").eq("enabled", true);
  const workflows = (workflowsData as Array<Record<string, unknown>>) ?? [];

  // --- Enrollment (scoped to each workflow's space) ---
  for (const wf of workflows) {
    const wfSpace = (wf.space_id as string | null) ?? fallbackSpace;
    enrolled += await runInSpace(wfSpace, async () => {
      const db = await admin();
      let count = 0;
      const triggerType = String(
        wf.trigger_type ?? (String(wf.trigger_segment ?? "manual") === "manual" ? "manual" : "pipeline_stage"),
      );
      if (triggerType === "manual") return 0;

      const steps = await orderedSteps(wf.graph, null);
      if (steps.length === 0) return 0;
      const cfg = (wf.trigger_config ?? {}) as {
        segment?: string;
        amount?: number;
        unit?: string;
        status?: string;
      };

      const { data: enrolledRows } = await db
        .from("workflow_enrollments")
        .select("phone_number")
        .eq("workflow_id", wf.id as string);
      const enrolledSet = new Set(
        ((enrolledRows as Array<{ phone_number: string }>) ?? []).map((r) => r.phone_number),
      );

      const candidates: Array<{ id: string | null; phone_number: string }> = [];

      if (triggerType === "pipeline_stage") {
        const segment = String(cfg.segment ?? wf.trigger_segment ?? "");
        const column = PIPELINE_COLUMNS.find((c) => c.id === segment);
        if (!column) return 0;
        const { data: leadsData } = await db
          .from("leads")
          .select("id, phone_number")
          .in("qualification_status", column.stages as unknown as string[])
          .limit(500);
        for (const l of (leadsData as Array<{ id: string; phone_number: string }>) ?? []) candidates.push(l);
      } else if (triggerType === "booking_status") {
        const status = String(cfg.status ?? "pending");
        const { data: appts } = await db
          .from("appointments")
          .select("phone_number")
          .eq("status", status)
          .limit(500);
        const phones = [
          ...new Set(
            ((appts as Array<{ phone_number: string | null }>) ?? [])
              .map((a) => a.phone_number)
              .filter((p): p is string => Boolean(p)),
          ),
        ];
        if (phones.length === 0) return 0;
        const { data: leadsData } = await db.from("leads").select("id, phone_number").in("phone_number", phones);
        for (const l of (leadsData as Array<{ id: string; phone_number: string }>) ?? []) candidates.push(l);
      } else if (triggerType === "time_since_first_message" || triggerType === "time_since_last_message") {
        const thresholdMs = delayToMs(Number(cfg.amount ?? 0), String(cfg.unit ?? "hours"));
        if (thresholdMs <= 0) return 0;
        const cutoff = Date.now() - thresholdMs;
        const earliest = triggerType === "time_since_first_message";
        const { data: leadsData } = await db.from("leads").select("id, phone_number").limit(500);
        for (const l of (leadsData as Array<{ id: string; phone_number: string }>) ?? []) {
          if (enrolledSet.has(l.phone_number)) continue;
          const { data: msgs } = await db
            .from("whatsapp_messages")
            .select("received_at")
            .eq("phone_number", l.phone_number)
            .order("received_at", { ascending: earliest })
            .limit(1);
          const ts = (msgs as Array<{ received_at: string }> | null)?.[0]?.received_at;
          if (!ts) continue;
          if (new Date(ts).getTime() <= cutoff) candidates.push(l);
        }
      } else {
        return 0;
      }

      const step0 = steps[0];
      for (const lead of candidates) {
        if (enrolledSet.has(lead.phone_number)) continue;
        enrolledSet.add(lead.phone_number);
        const apptAt =
          step0?.anchor === "before_appointment" ? await getLeadAppointmentAt(lead.phone_number) : null;
        const runAt = stepNextRunAt(step0, null, apptAt);
        await db.from("workflow_enrollments").insert({
          workflow_id: wf.id,
          lead_id: lead.id,
          phone_number: lead.phone_number,
          current_step: 0,
          status: "active",
          next_run_at: runAt.toISOString(),
        } as never);
        count += 1;
      }
      return count;
    });
  }

  // --- Advance due enrollments (scoped to each enrollment's space) ---
  const { data: dueData } = await raw
    .from("workflow_enrollments")
    .select("*")
    .eq("status", "active")
    .eq("reacted", false)
    .lte("next_run_at", nowIso)
    .limit(100);
  const due = (dueData as Array<Record<string, unknown>>) ?? [];

  for (const enr of due) {
    const wf = workflows.find((w) => w.id === enr.workflow_id);
    const enrSpace = (enr.space_id as string | null) ?? fallbackSpace;
    sent += await runInSpace(enrSpace, async () => {
      const db = await admin();
      if (!wf) {
        await db.from("workflow_enrollments").update({ status: "stopped" } as never).eq("id", enr.id as string);
        return 0;
      }
      const steps = await orderedSteps(wf.graph, String(enr.phone_number));
      const step = Number(enr.current_step ?? 0);
      if (step >= steps.length) {
        await db
          .from("workflow_enrollments")
          .update({ status: "completed", next_run_at: null } as never)
          .eq("id", enr.id as string);
        return 0;
      }

      await executeWorkflowStep(
        steps[step],
        String(enr.phone_number),
        (wf.workspace_id as string) ?? null,
        (enr.lead_id as string | null) ?? null,
        (enr.id as string) ?? null,
      );

      const nextStep = step + 1;
      if (nextStep >= steps.length) {
        await db
          .from("workflow_enrollments")
          .update({ current_step: nextStep, status: "completed", next_run_at: null, last_step_at: new Date().toISOString() } as never)
          .eq("id", enr.id as string);
      } else {
        const nextStepObj = steps[nextStep];
        const goalAt = (enr.goal_at as string | null) ?? null;
        const apptAt =
          nextStepObj?.anchor === "before_appointment"
            ? await getLeadAppointmentAt(String(enr.phone_number))
            : null;
        const runAt = stepNextRunAt(nextStepObj, goalAt, apptAt);
        await db
          .from("workflow_enrollments")
          .update({
            current_step: nextStep,
            next_run_at: runAt.toISOString(),
            last_step_at: new Date().toISOString(),
          } as never)
          .eq("id", enr.id as string);
      }
      return 1;
    });
  }

  return { enrolled, sent };
}

interface EnrollLeadParams {
  phone: string;
  leadId?: string | null;
  /** Workspace (connection) to send the messages through. */
  workspaceId?: string | null;
  /** When true, the first step runs right away instead of waiting for the cron. */
  sendNow?: boolean;
  /** Extra delay (ms) before the first message becomes due. */
  startDelayMs?: number;
  /** Optional per-lead goal/deadline date for countdown-anchored steps. */
  goalAt?: string | null;
}

type EnrollStatus = "enrolled" | "already_enrolled" | "no_workflow" | "no_steps";

// Shared enrollment core: given a resolved workflow row, enroll the lead and
// optionally fire the first step immediately. Used by both the by-name and
// by-id helpers.
async function enrollLeadInWorkflowRow(
  target: Record<string, unknown>,
  params: EnrollLeadParams,
): Promise<{ status: EnrollStatus; workflowId?: string }> {
  const db = await admin();
  const steps = await orderedSteps(target.graph, params.phone);
  if (steps.length === 0) return { status: "no_steps", workflowId: target.id as string };

  // Route messages through the selected workspace for this lead going forward.
  if (params.workspaceId) {
    await db
      .from("leads")
      .update({ workspace_id: params.workspaceId } as never)
      .eq("phone_number", params.phone);
    await db
      .from("conversations")
      .update({ workspace_id: params.workspaceId } as never)
      .eq("phone_number", params.phone);
  }
  const workspaceId = params.workspaceId ?? (target.workspace_id as string) ?? null;

  const { data: existing } = await db
    .from("workflow_enrollments")
    .select("id")
    .eq("workflow_id", target.id as string)
    .eq("phone_number", params.phone)
    .maybeSingle();
  if (existing) return { status: "already_enrolled", workflowId: target.id as string };

  const goalAt = params.goalAt ?? null;

  // Immediate activation: run the first step now and advance the sequence so the
  // lead starts receiving the follow-up the moment the outcome is recorded.
  if (params.sendNow) {
    await executeWorkflowStep(steps[0], params.phone, workspaceId, params.leadId ?? null);
    const nextStep = 1;
    if (nextStep >= steps.length) {
      await db.from("workflow_enrollments").insert({
        workflow_id: target.id,
        lead_id: params.leadId ?? null,
        phone_number: params.phone,
        current_step: nextStep,
        status: "completed",
        reacted: false,
        goal_at: goalAt,
        next_run_at: null,
        last_step_at: new Date().toISOString(),
      } as never);
    } else {
      const nextStepObj = steps[nextStep];
      const apptAt =
        nextStepObj?.anchor === "before_appointment" ? await getLeadAppointmentAt(params.phone) : null;
      const runAt = stepNextRunAt(nextStepObj, goalAt, apptAt);
      await db.from("workflow_enrollments").insert({
        workflow_id: target.id,
        lead_id: params.leadId ?? null,
        phone_number: params.phone,
        current_step: nextStep,
        status: "active",
        reacted: false,
        goal_at: goalAt,
        next_run_at: runAt.toISOString(),
        last_step_at: new Date().toISOString(),
      } as never);
    }
    return { status: "enrolled", workflowId: target.id as string };
  }

  const startDelayMs = Math.max(0, params.startDelayMs ?? 0);
  const step0 = steps[0];
  const apptAt = step0?.anchor === "before_appointment" ? await getLeadAppointmentAt(params.phone) : null;
  let runAtMs = stepNextRunAt(step0, goalAt, apptAt).getTime();
  // The meeting-outcome edit window only applies to plain relative-wait steps.
  if (step0?.anchor === "wait") runAtMs += startDelayMs;
  await db.from("workflow_enrollments").insert({
    workflow_id: target.id,
    lead_id: params.leadId ?? null,
    phone_number: params.phone,
    current_step: 0,
    status: "active",
    reacted: false,
    goal_at: goalAt,
    next_run_at: new Date(runAtMs).toISOString(),
  } as never);
  return { status: "enrolled", workflowId: target.id as string };
}

// Manually enroll a single lead into a workflow identified by name (case
// insensitive). Used by the Meeting Outcomes flow to route a lead into the
// follow-up sequence that matches the recorded outcome.
export async function enrollLeadInWorkflowByName(
  params: EnrollLeadParams & { workflowName: string },
): Promise<{ status: EnrollStatus; workflowId?: string }> {
  const db = await admin();
  const { data: rows } = await db.from("workflows").select("*").eq("enabled", true);
  const workflows = (rows as Array<Record<string, unknown>>) ?? [];
  const target = workflows.find(
    (w) => String(w.name ?? "").trim().toLowerCase() === params.workflowName.trim().toLowerCase(),
  );
  if (!target) return { status: "no_workflow" };
  return enrollLeadInWorkflowRow(target, params);
}

// Enroll a lead into a workflow by id. Used by "call workflow" steps so renaming
// the target workflow doesn't break the reference.
export async function enrollLeadInWorkflowById(
  params: EnrollLeadParams & { workflowId: string },
): Promise<{ status: EnrollStatus; workflowId?: string }> {
  const db = await admin();
  const { data: row } = await db
    .from("workflows")
    .select("*")
    .eq("id", params.workflowId)
    .eq("enabled", true)
    .maybeSingle();
  const target = row as Record<string, unknown> | null;
  if (!target) return { status: "no_workflow" };
  return enrollLeadInWorkflowRow(target, params);
}

/* ===================== MEETING OUTCOME WORKFLOW TEMPLATES ===================== */

import { UNIT_SECONDS } from "./orchestration";
import { MEETING_OUTCOME_TEMPLATES, type TemplateStep } from "./meeting-outcomes";

// Build a visual-builder-compatible graph from a list of template steps.
function buildTemplateGraph(steps: TemplateStep[]) {
  const nodes: Array<Record<string, unknown>> = [
    { id: "trigger", type: "trigger", position: { x: 80, y: 20 }, data: { label: "Trigger" } },
  ];
  const edges: Array<Record<string, unknown>> = [];
  let prev = "trigger";
  steps.forEach((s, i) => {
    const id = `m${i + 1}`;
    nodes.push({
      id,
      type: "message",
      position: { x: 80, y: 140 + i * 130 },
      data: {
        content: s.content,
        delayValue: s.delayValue,
        delayUnit: s.delayUnit,
        // keep delayMinutes for backward-compatible readers
        delayMinutes: Math.round((s.delayValue * (UNIT_SECONDS[s.delayUnit] ?? 60)) / 60),
        index: i,
      },
    });
    edges.push({ id: `e-${prev}-${id}`, source: prev, target: id });
    prev = id;
  });
  return { nodes, edges };
}

// Create any missing Meeting Outcome follow-up workflow templates (idempotent).
// Existing workflows with the same name are left untouched so user edits persist.
export async function ensureMeetingOutcomeWorkflows(): Promise<{ created: number }> {
  const db = await admin();
  const { data: rows } = await db.from("workflows").select("name");
  const existing = new Set(
    ((rows as Array<{ name: string }>) ?? []).map((r) => String(r.name ?? "").trim().toLowerCase()),
  );

  let created = 0;
  for (const tpl of MEETING_OUTCOME_TEMPLATES) {
    if (existing.has(tpl.name.trim().toLowerCase())) continue;
    await db.from("workflows").insert({
      name: tpl.name,
      description: tpl.description,
      workspace_id: null,
      agent_id: DEFAULT_AGENT_ID,
      trigger_type: "manual",
      trigger_segment: "manual",
      trigger_config: {},
      enabled: true,
      graph: buildTemplateGraph(tpl.steps),
    } as never);
    created += 1;
  }
  return { created };
}

/* ===================== DRIP CAMPAIGNS ===================== */

const PHONE_DIGITS = (p: string | null | undefined): string =>
  String(p ?? "").replace(/@.*$/, "").replace(/[^0-9]/g, "");

// Render a campaign template, replacing {{merge_field}} tokens with the
// recipient's merge data (with sensible defaults derived from name/phone).
export function renderCampaignTemplate(
  template: string,
  recipient: { name?: string | null; phone_number: string; merge_data?: Record<string, unknown> | null },
): string {
  const name = (recipient.name ?? "").trim();
  const firstName = name ? name.split(/\s+/)[0] : "";
  const data: Record<string, unknown> = {
    name,
    full_name: name,
    first_name: firstName,
    phone: recipient.phone_number,
    phone_number: recipient.phone_number,
    ...(recipient.merge_data ?? {}),
  };
  return String(template ?? "").replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, key: string) => {
    const v = data[key];
    return v === undefined || v === null ? "" : String(v);
  });
}

// When a contact replies, stop further campaign sends to that contact and
// record the reply for campaign reporting. Runs inside the current space.
export async function stopCampaignsForPhone(phone: string): Promise<void> {
  try {
    const db = await admin();
    const digits = PHONE_DIGITS(phone);
    const { data: rows } = await db
      .from("campaign_recipients")
      .select("id, phone_number, status")
      .in("status", ["pending", "sent", "delivered", "opened"]);
    const matches = ((rows as Array<{ id: string; phone_number: string; status: string }>) ?? []).filter((r) => {
      const d = PHONE_DIGITS(r.phone_number);
      return d && (d === digits || d.endsWith(digits) || digits.endsWith(d));
    });
    if (matches.length === 0) return;
    const nowIso = new Date().toISOString();
    await db
      .from("campaign_recipients")
      .update({ status: "replied", replied_at: nowIso } as never)
      .in(
        "id",
        matches.map((m) => m.id),
      );
  } catch (e) {
    console.error("stopCampaignsForPhone failed:", e);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Deliver a single campaign message to a contact through the unified messaging
// layer (Chatwoot or Evolution), WITHOUT flagging human takeover — so the AI
// agents, workflows and CRM automations remain free to handle any reply. Creates
// the lead/conversation (and a Chatwoot conversation when needed) on demand.
export async function deliverCampaignMessage(params: {
  phone: string;
  message: string;
  workspaceId?: string | null;
  name?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const db = await admin();
  const { phone, message } = params;

  let { data: lead } = await db
    .from("leads")
    .select("id, chatwoot_conversation_id, workspace_id")
    .eq("phone_number", phone)
    .maybeSingle();
  if (!lead) {
    lead = (await getOrCreateLead(phone, null, null, params.workspaceId ?? null)) as unknown as typeof lead;
  }
  const { data: conv } = await db
    .from("conversations")
    .select("id, chatwoot_conversation_id, workspace_id")
    .eq("phone_number", phone)
    .maybeSingle();

  const leadRow = (lead as Record<string, unknown> | null) ?? {};
  const convRow = (conv as Record<string, unknown> | null) ?? null;

  const effectiveWorkspaceId =
    params.workspaceId ??
    (convRow?.workspace_id as string | null) ??
    (leadRow.workspace_id as string | null) ??
    null;

  const workspace = await resolveWorkspace({ workspaceId: effectiveWorkspaceId });
  const creds = await resolveCreds(workspace);

  let conversationId =
    (convRow?.chatwoot_conversation_id as string | null) ??
    (leadRow.chatwoot_conversation_id as string | null) ??
    null;

  // Chatwoot needs an existing conversation to post into; create one on demand.
  if (workspace && workspace.provider_type !== "evolution" && !conversationId) {
    conversationId = await createChatwootConversation({
      creds,
      inboxId: workspace.chatwoot_inbox_id ?? null,
      phone,
      name: params.name ?? null,
    });
  }

  if (!convRow) {
    await db.from("conversations").insert({
      phone_number: phone,
      lead_id: (leadRow.id as string | null) ?? null,
      workspace_id: workspace?.id ?? null,
      chatwoot_conversation_id: conversationId,
      status: "open",
      human_takeover: false,
    } as never);
  } else if (workspace?.id && (!convRow.workspace_id || (conversationId && !convRow.chatwoot_conversation_id))) {
    await db
      .from("conversations")
      .update({ workspace_id: workspace.id, chatwoot_conversation_id: conversationId } as never)
      .eq("phone_number", phone);
  }

  const sent = await sendWorkspaceMessage({ workspace, creds, phone, conversationId, message });

  // Log the campaign message so it appears in the conversation timeline.
  await db.from("whatsapp_messages").insert({
    phone_number: phone,
    message_content: message,
    sender: "campaign",
    message_type: "text",
    processed: true,
  });

  if (!sent.ok) {
    return { ok: false, error: sent.error ?? "delivery failed" };
  }
  return { ok: true };
}

// Returns the current weekday (0-6) and minutes-since-midnight for a timezone.
function nowInTimezone(tz: string): { day: number; minutes: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz || "UTC",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const map: Record<string, string> = {};
    for (const p of parts) map[p.type] = p.value;
    const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const day = dayMap[map.weekday] ?? new Date().getUTCDay();
    let hour = Number(map.hour);
    if (hour === 24) hour = 0; // some runtimes emit "24" for midnight
    const minutes = hour * 60 + Number(map.minute);
    return { day, minutes };
  } catch {
    const d = new Date();
    return { day: d.getUTCDay(), minutes: d.getUTCHours() * 60 + d.getUTCMinutes() };
  }
}

const hhmmToMinutes = (s: string | null | undefined): number | null => {
  if (!s) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s));
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
};

// True when the campaign is allowed to send right now given its weekday +
// time-of-day window (interpreted in the campaign's timezone).
function withinSendSchedule(c: Record<string, unknown>): boolean {
  const days = (c.send_days as number[] | null) ?? [0, 1, 2, 3, 4, 5, 6];
  const tz = String(c.send_timezone ?? "UTC");
  const { day, minutes } = nowInTimezone(tz);
  if (Array.isArray(days) && days.length > 0 && !days.includes(day)) return false;

  const start = hhmmToMinutes(c.send_window_start as string | null);
  const end = hhmmToMinutes(c.send_window_end as string | null);
  if (start === null || end === null) return true; // no time window → any hour
  if (start === end) return true;
  if (start < end) return minutes >= start && minutes < end;
  // Overnight window (e.g. 22:00 → 06:00)
  return minutes >= start || minutes < end;
}


// Process due drip campaigns: advances scheduled campaigns into running, sends
// the next batch of pending recipients for each running campaign (respecting
// batch size, inter-message delay, and start/end windows), and marks campaigns
// completed when no recipients remain. Called every minute by the cron route.
export async function processCampaigns(): Promise<{ campaigns: number; sent: number }> {
  const db = await rawAdmin();
  const { getDefaultSpaceId } = await import("./space-context.server");
  const fallbackSpace = await getDefaultSpaceId();
  const now = Date.now();
  const nowIso = new Date().toISOString();
  const startBudget = Date.now();
  const TIME_BUDGET_MS = 50_000;

  const { data: camps } = await db
    .from("campaigns")
    .select("*")
    .in("status", ["scheduled", "running"])
    .order("last_batch_at", { ascending: true, nullsFirst: true })
    .limit(20);

  let campaignsTouched = 0;
  let totalSent = 0;

  for (const c of (camps as Array<Record<string, unknown>>) ?? []) {
    if (Date.now() - startBudget > TIME_BUDGET_MS) break;

    const id = String(c.id);
    const spaceId = (c.space_id as string | null) ?? fallbackSpace;
    const startAt = c.start_at ? new Date(String(c.start_at)).getTime() : null;
    const endAt = c.end_at ? new Date(String(c.end_at)).getTime() : null;

    // End window passed → finish the campaign.
    if (endAt !== null && now > endAt) {
      await db.from("campaigns").update({ status: "completed" } as never).eq("id", id);
      continue;
    }
    // Not yet started.
    if (startAt !== null && now < startAt) continue;
    // Outside the allowed weekday / time-of-day window → wait for next slot.
    if (!withinSendSchedule(c)) continue;

    // Respect the configured break between batches (drip pacing).
    const batchBreakSeconds = Math.min(Math.max(0, Number(c.batch_break_seconds) || 0), 86400);
    const lastBatchAt = c.last_batch_at ? new Date(String(c.last_batch_at)).getTime() : null;
    if (batchBreakSeconds > 0 && lastBatchAt !== null && now - lastBatchAt < batchBreakSeconds * 1000) {
      continue;
    }

    // Flip scheduled → running once the window opens.
    if (c.status === "scheduled") {
      await db.from("campaigns").update({ status: "running" } as never).eq("id", id);
    }

    const batchSize = Math.min(Math.max(1, Number(c.batch_size) || 25), 100);
    const delaySeconds = Math.min(Math.max(0, Number(c.delay_seconds) || 0), 5);
    const workspaceId = (c.workspace_id as string | null) ?? null;
    const template = String(c.message_template ?? "");
    // Rotate evenly between the main template and any variations to reduce spam flags.
    const variations = ((c.message_variations as string[] | null) ?? []).filter((v) => String(v ?? "").trim());
    const templatePool = [template, ...variations].filter((t) => String(t ?? "").trim());
    const pool = templatePool.length > 0 ? templatePool : [template];

    const { data: pending } = await db
      .from("campaign_recipients")
      .select("id, phone_number, name, merge_data")
      .eq("campaign_id", id)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(batchSize);

    const batch = (pending as Array<Record<string, unknown>>) ?? [];

    if (batch.length === 0) {
      // No pending left → mark completed.
      await db.from("campaigns").update({ status: "completed" } as never).eq("id", id);
      continue;
    }

    campaignsTouched += 1;

    for (let bi = 0; bi < batch.length; bi++) {
      const r = batch[bi];
      if (Date.now() - startBudget > TIME_BUDGET_MS) break;
      const rid = String(r.id);
      const phone = String(r.phone_number);
      const chosenTemplate = pool[(totalSent + bi) % pool.length];
      const message = renderCampaignTemplate(chosenTemplate, {
        name: (r.name as string | null) ?? null,
        phone_number: phone,
        merge_data: (r.merge_data as Record<string, unknown> | null) ?? null,
      });
      const result = await runInSpace(spaceId, () =>
        deliverCampaignMessage({
          phone,
          message,
          workspaceId,
          name: (r.name as string | null) ?? null,
        }),
      );

      await db
        .from("campaign_recipients")
        .update({
          status: result.ok ? "sent" : "failed",
          sent_at: new Date().toISOString(),
          error: result.ok ? null : result.error ?? "delivery failed",
          attempts: (Number(r.attempts) || 0) + 1,
        } as never)
        .eq("id", rid);
      if (result.ok) totalSent += 1;
      if (delaySeconds > 0) await sleep(delaySeconds * 1000);
    }

    await db.from("campaigns").update({ last_batch_at: new Date().toISOString() } as never).eq("id", id);

    // If nothing pending remains after this batch, complete the campaign.
    const { count } = await db
      .from("campaign_recipients")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", id)
      .eq("status", "pending");
    if ((count ?? 0) === 0) {
      await db.from("campaigns").update({ status: "completed" } as never).eq("id", id);
    }
  }

  void nowIso;
  return { campaigns: campaignsTouched, sent: totalSent };
}

