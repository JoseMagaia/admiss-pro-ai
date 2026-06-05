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

/* ===================== ORCHESTRATION WORKFLOWS ===================== */

import { PIPELINE_COLUMNS } from "./pipeline";
import { DEFAULT_AGENT_ID, delayToMs } from "./orchestration";
import { runResponderAgent } from "./ai-engine.server";

export interface WorkflowStep {
  content: string;
  /** Delay before sending this step, in milliseconds. */
  delayMs: number;
}

interface GraphNode {
  id: string;
  type?: string;
  data?: { content?: string; delayMinutes?: number; delayValue?: number; delayUnit?: string };
}
interface GraphEdge {
  source: string;
  target: string;
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

// Resolve the ordered message steps from a saved visual graph. Walks the edges
// starting from the trigger node; falls back to node array order.
export function orderedSteps(graph: unknown): WorkflowStep[] {
  const g = (graph ?? {}) as WorkflowGraph;
  const nodes = g.nodes ?? [];
  const edges = g.edges ?? [];
  const messageNodes = nodes.filter((n) => n.type === "message" || n.type === undefined);
  if (messageNodes.length === 0) return [];

  const trigger = nodes.find((n) => n.type === "trigger");
  const toStep = (n: GraphNode): WorkflowStep => ({
    content: String(n.data?.content ?? "").trim(),
    delayMs: nodeDelayMs(n.data),
  });

  if (trigger && edges.length > 0) {
    const ordered: WorkflowStep[] = [];
    const seen = new Set<string>();
    let currentId: string | undefined = trigger.id;
    while (currentId) {
      const edge = edges.find((e) => e.source === currentId);
      if (!edge || seen.has(edge.target)) break;
      seen.add(edge.target);
      const node = nodes.find((n) => n.id === edge.target);
      if (node && (node.type === "message" || node.type === undefined)) ordered.push(toStep(node));
      currentId = edge.target;
    }
    if (ordered.length > 0) return ordered.filter((s) => s.content.length > 0);
  }

  return messageNodes.map(toStep).filter((s) => s.content.length > 0);
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
  const filled = fillTemplate(message, {
    lead_name: leadRow.lead_name ?? "",
    course_interest: leadRow.course_interest ?? "",
    country_interest: leadRow.country_interest ?? "",
    phone_number: phone,
  });

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
  const sent = await sendChatwootReply(creds, conversationId as string | null, filled);

  await db.from("whatsapp_messages").insert({
    phone_number: phone,
    message_content: filled,
    sender: "workflow",
    message_type: "text",
    processed: true,
  });
  return sent;
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

    await db.from("whatsapp_messages").insert({
      phone_number: params.phone,
      message_content: reply,
      sender: "ai",
      message_type: "text",
      ai_response: reply,
      processed: true,
    });
    await sendChatwootReply(params.creds, params.conversationId, reply);
    return reply;
  }

  return null;
}

// Enroll matching leads into enabled workflows and advance due sequences.
// Called every minute by the process-workflows cron route.
export async function processWorkflows(): Promise<{ enrolled: number; sent: number }> {
  const db = await admin();
  const nowIso = new Date().toISOString();
  let enrolled = 0;
  let sent = 0;

  const { data: workflowsData } = await db.from("workflows").select("*").eq("enabled", true);
  const workflows = (workflowsData as Array<Record<string, unknown>>) ?? [];

  // --- Enrollment ---
  for (const wf of workflows) {
    // Backward-compatible trigger resolution.
    const triggerType = String(
      wf.trigger_type ?? (String(wf.trigger_segment ?? "manual") === "manual" ? "manual" : "pipeline_stage"),
    );
    if (triggerType === "manual") continue;

    const steps = orderedSteps(wf.graph);
    if (steps.length === 0) continue;
    const cfg = (wf.trigger_config ?? {}) as {
      segment?: string;
      amount?: number;
      unit?: string;
      status?: string;
    };

    // Phones already enrolled in this workflow are skipped.
    const { data: enrolledRows } = await db
      .from("workflow_enrollments")
      .select("phone_number")
      .eq("workflow_id", wf.id as string);
    const enrolledSet = new Set(
      ((enrolledRows as Array<{ phone_number: string }>) ?? []).map((r) => r.phone_number),
    );

    // Build the list of candidate leads for this trigger type.
    const candidates: Array<{ id: string | null; phone_number: string }> = [];

    if (triggerType === "pipeline_stage") {
      const segment = String(cfg.segment ?? wf.trigger_segment ?? "");
      const column = PIPELINE_COLUMNS.find((c) => c.id === segment);
      if (!column) continue;
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
      if (phones.length === 0) continue;
      const { data: leadsData } = await db.from("leads").select("id, phone_number").in("phone_number", phones);
      for (const l of (leadsData as Array<{ id: string; phone_number: string }>) ?? []) candidates.push(l);
    } else if (triggerType === "time_since_first_message" || triggerType === "time_since_last_message") {
      const thresholdMs = delayToMs(Number(cfg.amount ?? 0), String(cfg.unit ?? "hours"));
      if (thresholdMs <= 0) continue;
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
      continue;
    }

    const firstDelayMs = steps[0]?.delayMs ?? 0;
    for (const lead of candidates) {
      if (enrolledSet.has(lead.phone_number)) continue;
      enrolledSet.add(lead.phone_number);
      await db.from("workflow_enrollments").insert({
        workflow_id: wf.id,
        lead_id: lead.id,
        phone_number: lead.phone_number,
        current_step: 0,
        status: "active",
        next_run_at: new Date(Date.now() + firstDelayMs).toISOString(),
      } as never);
      enrolled += 1;
    }
  }


  // --- Advance due enrollments ---
  const { data: dueData } = await db
    .from("workflow_enrollments")
    .select("*")
    .eq("status", "active")
    .eq("reacted", false)
    .lte("next_run_at", nowIso)
    .limit(100);
  const due = (dueData as Array<Record<string, unknown>>) ?? [];

  for (const enr of due) {
    const wf = workflows.find((w) => w.id === enr.workflow_id);
    if (!wf) {
      await db.from("workflow_enrollments").update({ status: "stopped" } as never).eq("id", enr.id as string);
      continue;
    }
    const steps = orderedSteps(wf.graph);
    const step = Number(enr.current_step ?? 0);
    if (step >= steps.length) {
      await db.from("workflow_enrollments").update({ status: "completed", next_run_at: null } as never).eq("id", enr.id as string);
      continue;
    }

    await sendWorkflowMessage(String(enr.phone_number), steps[step].content, (wf.workspace_id as string) ?? null);
    sent += 1;

    const nextStep = step + 1;
    if (nextStep >= steps.length) {
      await db
        .from("workflow_enrollments")
        .update({ current_step: nextStep, status: "completed", next_run_at: null, last_step_at: new Date().toISOString() } as never)
        .eq("id", enr.id as string);
    } else {
      const nextDelayMs = steps[nextStep]?.delayMs ?? 0;
      await db
        .from("workflow_enrollments")
        .update({
          current_step: nextStep,
          next_run_at: new Date(Date.now() + nextDelayMs).toISOString(),
          last_step_at: new Date().toISOString(),
        } as never)
        .eq("id", enr.id as string);
    }
  }

  return { enrolled, sent };
}

// Manually enroll a single lead into a workflow identified by name (case
// insensitive). Used by the Meeting Outcomes flow to route a lead into the
// follow-up sequence that matches the recorded outcome. Best-effort: returns a
// status string describing what happened so the caller can surface it / audit it.
export async function enrollLeadInWorkflowByName(params: {
  workflowName: string;
  phone: string;
  leadId?: string | null;
  /** Workspace (Chatwoot connection) to send the messages through. */
  workspaceId?: string | null;
  /** When true, the first message is sent right away instead of waiting for the cron. */
  sendNow?: boolean;
  /** Extra delay (ms) before the first message becomes due. Used to honour the
   *  meeting-outcome edit window so the sequence only fires once the countdown ends. */
  startDelayMs?: number;
}): Promise<{ status: "enrolled" | "already_enrolled" | "no_workflow" | "no_steps"; workflowId?: string }> {
  const db = await admin();
  const { data: rows } = await db.from("workflows").select("*").eq("enabled", true);
  const workflows = (rows as Array<Record<string, unknown>>) ?? [];
  const target = workflows.find(
    (w) => String(w.name ?? "").trim().toLowerCase() === params.workflowName.trim().toLowerCase(),
  );
  if (!target) return { status: "no_workflow" };

  const steps = orderedSteps(target.graph);
  if (steps.length === 0) return { status: "no_workflow", workflowId: target.id as string };

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

  const firstDelayMs = steps[0]?.delayMs ?? 0;

  // Immediate activation: send the first message now and advance the sequence so
  // the lead starts receiving the follow-up the moment the outcome is recorded.
  if (params.sendNow) {
    await sendWorkflowMessage(params.phone, steps[0].content, workspaceId);
    const nextStep = 1;
    if (nextStep >= steps.length) {
      await db.from("workflow_enrollments").insert({
        workflow_id: target.id,
        lead_id: params.leadId ?? null,
        phone_number: params.phone,
        current_step: nextStep,
        status: "completed",
        reacted: false,
        next_run_at: null,
        last_step_at: new Date().toISOString(),
      } as never);
    } else {
      const nextDelayMs = steps[nextStep]?.delayMs ?? 0;
      await db.from("workflow_enrollments").insert({
        workflow_id: target.id,
        lead_id: params.leadId ?? null,
        phone_number: params.phone,
        current_step: nextStep,
        status: "active",
        reacted: false,
        next_run_at: new Date(Date.now() + nextDelayMs).toISOString(),
        last_step_at: new Date().toISOString(),
      } as never);
    }
    return { status: "enrolled", workflowId: target.id as string };
  }

  const startDelayMs = Math.max(0, params.startDelayMs ?? 0);
  await db.from("workflow_enrollments").insert({
    workflow_id: target.id,
    lead_id: params.leadId ?? null,
    phone_number: params.phone,
    current_step: 0,
    status: "active",
    reacted: false,
    next_run_at: new Date(Date.now() + startDelayMs + firstDelayMs).toISOString(),
  } as never);
  return { status: "enrolled", workflowId: target.id as string };
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

