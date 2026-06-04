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

async function admin(): Promise<AdminClient> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

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
  chatwoot_url: string | null;
  chatwoot_account_id: string | null;
  chatwoot_inbox_id: string | null;
  chatwoot_api_token: string | null;
  enabled: boolean;
  is_default: boolean;
  use_shared_ai: boolean;
}

export interface ChatwootCreds {
  url: string;
  accountId: string;
  apiToken: string;
}

export async function loadAiContext(): Promise<AiContext> {
  const db = await admin();
  const [{ data: config }, { data: vars }, { data: settings }] = await Promise.all([
    db.from("ai_configuration").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    db.from("ai_variables").select("variable_name, variable_value"),
    db.from("education_settings").select("*").limit(1).maybeSingle(),
  ]);

  const variables: Record<string, string> = {};
  for (const v of vars ?? []) variables[v.variable_name] = v.variable_value;

  const cfg = config as Record<string, unknown> | null;
  const provider: ProviderConfig = {
    mode: (cfg?.provider_mode as "built_in" | "custom") ?? "built_in",
    custom_provider: (cfg?.custom_provider as string) ?? null,
    custom_base_url: (cfg?.custom_base_url as string) ?? null,
    custom_model: (cfg?.custom_model as string) ?? null,
    custom_api_key: (cfg?.custom_api_key as string) ?? null,
  };

  return {
    systemPrompt: config?.system_prompt ?? "You are an admissions assistant.",
    model: config?.model ?? "google/gemini-3-flash-preview",
    temperature: Number(config?.temperature ?? 0.7),
    variables,
    settings: settings ?? null,
    provider,
  };
}

/* --------------------------- WORKSPACES -------------------------- */

// Find the workspace handling an incoming message. Priority:
// 1. explicit workspace id (e.g. stored on the lead),
// 2. matching Chatwoot inbox id,
// 3. matching Chatwoot account id,
// 4. the default workspace.
export async function resolveWorkspace(params: {
  workspaceId?: string | null;
  inboxId?: string | null;
  accountId?: string | null;
}): Promise<WorkspaceRow | null> {
  const db = await admin();
  const { data } = await db.from("chatwoot_workspaces").select("*").eq("enabled", true);
  const rows = (data as WorkspaceRow[]) ?? [];
  if (rows.length === 0) return null;

  if (params.workspaceId) {
    const byId = rows.find((w) => w.id === params.workspaceId);
    if (byId) return byId;
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

  // Create booking request when advancing into the booking stage.
  if (decision.create_booking || decision.qualification_status === "BOOKING_REQUEST_CREATED") {
    const { data: existingBooking } = await db
      .from("appointments")
      .select("id")
      .eq("phone_number", lead.phone_number)
      .eq("appointment_type", "booking")
      .maybeSingle();

    if (!existingBooking) {
      await db.from("appointments").insert({
        phone_number: lead.phone_number,
        lead_name: finalLead.lead_name ?? null,
        appointment_type: "booking",
        status: "pending",
        notes: decision.booking_notes ?? "Auto-created by AI after qualification.",
      });
    }
  }

  // Fire HTTP actions only when the stage actually changed.
  if (previousStage !== decision.qualification_status) {
    await runHttpActions(decision.qualification_status, finalLead);
  }

  return finalLead;
}

// Send a message to a WhatsApp contact through Chatwoot using the given
// credentials (workspace-aware, with education_settings fallback).
export async function sendChatwootReply(
  creds: ChatwootCreds | null,
  conversationId: string | null | undefined,
  message: string,
): Promise<boolean> {
  if (!conversationId) return false;
  if (!creds) {
    console.warn("Chatwoot not configured; reply not sent to WhatsApp.");
    return false;
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
    return res.ok;
  } catch (e) {
    console.error("Chatwoot reply failed:", e);
    return false;
  }
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
}): Promise<ProcessResult> {
  const db = await admin();
  const { phone, message, chatwootConversationId, chatwootContactId, chatwootInboxId, chatwootAccountId } = params;

  // Log inbound message.
  await db.from("whatsapp_messages").insert({
    phone_number: phone,
    message_content: message,
    sender: "lead",
    message_type: "text",
    processed: false,
  });

  // Resolve which Chatwoot workspace this conversation belongs to.
  const workspace = await resolveWorkspace({ inboxId: chatwootInboxId, accountId: chatwootAccountId });
  const creds = await resolveCreds(workspace);

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

  // Send reply back through Chatwoot.
  await sendChatwootReply(creds, chatwootConversationId ?? lead.chatwoot_conversation_id, decision.reply);

  return {
    reply: decision.reply,
    stage: updatedLead.qualification_status ?? decision.qualification_status,
    humanTakeover: false,
    error,
  };
}

// Deliver a single manual/scheduled message to a contact and log it.
export async function deliverHumanMessage(params: {
  phone: string;
  message: string;
  scheduled?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const db = await admin();
  const { phone, message } = params;

  const { data: lead } = await db
    .from("leads")
    .select("id, chatwoot_conversation_id, workspace_id")
    .eq("phone_number", phone)
    .maybeSingle();
  const { data: conv } = await db
    .from("conversations")
    .select("chatwoot_conversation_id, workspace_id")
    .eq("phone_number", phone)
    .maybeSingle();

  const workspaceId =
    (conv as Record<string, unknown> | null)?.workspace_id ??
    (lead as Record<string, unknown> | null)?.workspace_id ??
    null;
  const conversationId =
    (conv as Record<string, unknown> | null)?.chatwoot_conversation_id ??
    (lead as Record<string, unknown> | null)?.chatwoot_conversation_id ??
    null;

  const workspace = await resolveWorkspace({ workspaceId: workspaceId as string | null });
  const creds = await resolveCreds(workspace);

  const sent = await sendChatwootReply(creds, conversationId as string | null, message);

  // Log the human message regardless of Chatwoot delivery so the timeline is complete.
  await db.from("whatsapp_messages").insert({
    phone_number: phone,
    message_content: message,
    sender: "human",
    message_type: "text",
    processed: true,
  });

  if (!sent) {
    return { ok: false, error: "Could not deliver via Chatwoot. Message logged to the conversation." };
  }
  return { ok: true };
}

// Process all scheduled messages that are due. Called by the cron route.
export async function processScheduledMessages(): Promise<{ processed: number }> {
  const db = await admin();
  const nowIso = new Date().toISOString();
  const { data: due } = await db
    .from("scheduled_messages")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_for", nowIso)
    .limit(50);

  let processed = 0;
  for (const row of (due as Array<Record<string, unknown>>) ?? []) {
    const result = await deliverHumanMessage({
      phone: String(row.phone_number),
      message: String(row.message_content),
      scheduled: true,
    });
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
