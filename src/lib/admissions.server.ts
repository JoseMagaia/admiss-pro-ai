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

export async function getOrCreateLead(
  phone: string,
  chatwootConversationId?: string | null,
  chatwootContactId?: string | null,
): Promise<LeadRecord> {
  const db = await admin();
  const { data: existing } = await db.from("leads").select("*").eq("phone_number", phone).maybeSingle();
  if (existing) return existing as LeadRecord;

  const { data: created } = await db
    .from("leads")
    .insert({
      phone_number: phone,
      chatwoot_conversation_id: chatwootConversationId ?? null,
      chatwoot_contact_id: chatwootContactId ?? null,
      qualification_status: "NEW_LEAD",
    })
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

export async function sendChatwootReply(conversationId: string | null | undefined, message: string) {
  if (!conversationId) return;
  const db = await admin();
  const { data: settings } = await db
    .from("education_settings")
    .select("chatwoot_url, chatwoot_account_id, chatwoot_api_token")
    .limit(1)
    .maybeSingle();

  if (!settings?.chatwoot_url || !settings?.chatwoot_account_id || !settings?.chatwoot_api_token) {
    console.warn("Chatwoot not configured; reply not sent to WhatsApp.");
    return;
  }

  const base = String(settings.chatwoot_url).replace(/\/$/, "");
  const url = `${base}/api/v1/accounts/${settings.chatwoot_account_id}/conversations/${conversationId}/messages`;
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_access_token: String(settings.chatwoot_api_token),
      },
      body: JSON.stringify({ content: message, message_type: "outgoing" }),
    });
  } catch (e) {
    console.error("Chatwoot reply failed:", e);
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
}): Promise<ProcessResult> {
  const db = await admin();
  const { phone, message, chatwootConversationId, chatwootContactId } = params;

  // Log inbound message.
  await db.from("whatsapp_messages").insert({
    phone_number: phone,
    message_content: message,
    sender: "lead",
    message_type: "text",
    processed: false,
  });

  const lead = await getOrCreateLead(phone, chatwootConversationId, chatwootContactId);

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
      status: "open",
    });
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

  // AI agent stops once the booking request is created.
  if (lead.qualification_status === "BOOKING_REQUEST_CREATED" || stageBeyondAi(lead.qualification_status)) {
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
  await sendChatwootReply(chatwootConversationId ?? lead.chatwoot_conversation_id, decision.reply);

  return {
    reply: decision.reply,
    stage: updatedLead.qualification_status ?? decision.qualification_status,
    humanTakeover: false,
    error,
  };
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
