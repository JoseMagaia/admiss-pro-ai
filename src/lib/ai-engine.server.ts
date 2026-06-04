// Server-only AI qualification engine for Linkmoore Education.
// Imported only from server functions / server routes.
import {
  AI_FINAL_STAGE,
  QUALIFICATION_STAGES,
  type QualificationStage,
} from "./pipeline";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const HUMAN_TAKEOVER_PATTERNS = [
  "falar com uma pessoa",
  "falar com alguem",
  "falar com alguém",
  "atendente",
  "preciso de ajuda",
  "quero ajuda",
  "nao entendi",
  "não entendi",
  "talk to a human",
  "speak to a person",
  "speak to someone",
  "real person",
  "human agent",
  "need help",
];

export function detectHumanTakeover(message: string): boolean {
  const m = message.toLowerCase();
  return HUMAN_TAKEOVER_PATTERNS.some((p) => m.includes(p));
}

export interface LeadRecord {
  id?: string;
  phone_number: string;
  chatwoot_conversation_id?: string | null;
  chatwoot_contact_id?: string | null;
  lead_name?: string | null;
  student_or_parent?: string | null;
  course_interest?: string | null;
  country_interest?: string | null;
  passport_status?: string | null;
  academic_status?: string | null;
  parent_phone?: string | null;
  financial_alignment?: string | null;
  parent_confirmation?: string | null;
  document_received?: boolean | null;
  qualification_status?: string | null;
  notes?: string | null;
}

export interface EngineMessage {
  sender: string;
  message_content: string;
}

export interface QualificationDecision {
  reply: string;
  qualification_status: QualificationStage;
  updates: Partial<LeadRecord>;
  create_booking: boolean;
  booking_notes?: string;
  reasoning?: string;
}

function applyVariables(text: string, variables: Record<string, string>): string {
  return text.replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g, (_, name) => variables[name] ?? `{{${name}}}`);
}

interface BuildPromptArgs {
  systemPrompt: string;
  variables: Record<string, string>;
  settings: Record<string, unknown> | null;
  lead: LeadRecord;
  history: EngineMessage[];
}

export function buildSystemPrompt({
  systemPrompt,
  variables,
  settings,
  lead,
  history,
}: BuildPromptArgs): string {
  const resolved = applyVariables(systemPrompt, variables);

  const settingsBlock = settings
    ? `Company: ${settings.company_name ?? ""}
Email: ${settings.company_email ?? ""}
Phone: ${settings.company_phone ?? ""}
Working hours: ${settings.working_hours ?? ""}
Active destinations: ${settings.active_destinations ?? ""}
Active programs: ${settings.active_programs ?? ""}
Scholarships: ${settings.scholarship_information ?? ""}`
    : "";

  const leadBlock = JSON.stringify(
    {
      lead_name: lead.lead_name,
      student_or_parent: lead.student_or_parent,
      course_interest: lead.course_interest,
      country_interest: lead.country_interest,
      passport_status: lead.passport_status,
      academic_status: lead.academic_status,
      parent_phone: lead.parent_phone,
      financial_alignment: lead.financial_alignment,
      parent_confirmation: lead.parent_confirmation,
      document_received: lead.document_received,
      qualification_status: lead.qualification_status ?? "NEW_LEAD",
    },
    null,
    2,
  );

  const historyBlock = history
    .slice(-12)
    .map((h) => `${h.sender === "lead" ? "Student" : "Assistant"}: ${h.message_content}`)
    .join("\n");

  return `${resolved}

=== COMPANY SETTINGS ===
${settingsBlock}

=== CURRENT LEAD MEMORY (known so far) ===
${leadBlock}

=== RECENT CONVERSATION ===
${historyBlock || "(no prior messages)"}

=== PIPELINE STAGES (in order) ===
${QUALIFICATION_STAGES.join(" -> ")}

The AI agent's responsibility ends at ${AI_FINAL_STAGE}. Never move the lead past ${AI_FINAL_STAGE}.

=== OUTPUT FORMAT ===
Reply with a SINGLE valid JSON object and nothing else:
{
  "reply": "the WhatsApp message to send to the student",
  "qualification_status": "one of the pipeline stages",
  "updates": {
    "lead_name": null,
    "student_or_parent": null,
    "course_interest": null,
    "country_interest": null,
    "passport_status": null,
    "academic_status": null,
    "parent_phone": null,
    "financial_alignment": null,
    "parent_confirmation": null,
    "document_received": null,
    "notes": null
  },
  "create_booking": false,
  "booking_notes": "",
  "reasoning": "1 short sentence"
}
Only include fields in "updates" that you learned in THIS turn (use null otherwise). Set create_booking to true ONLY when the lead reaches QUALIFIED and you are advancing to BOOKING_REQUEST_CREATED.`;
}

function safeParseDecision(content: string, currentStage: string): QualificationDecision {
  let parsed: Record<string, unknown> | null = null;
  try {
    const match = content.match(/\{[\s\S]*\}/);
    parsed = match ? JSON.parse(match[0]) : JSON.parse(content);
  } catch {
    parsed = null;
  }

  if (!parsed || typeof parsed.reply !== "string") {
    return {
      reply: content?.trim() || "Thanks for your message! Could you tell me a bit more so I can help you?",
      qualification_status: (currentStage as QualificationStage) || "NEW_LEAD",
      updates: {},
      create_booking: false,
    };
  }

  const stage = QUALIFICATION_STAGES.includes(parsed.qualification_status as QualificationStage)
    ? (parsed.qualification_status as QualificationStage)
    : ((currentStage as QualificationStage) || "NEW_LEAD");

  const rawUpdates = (parsed.updates as Record<string, unknown>) ?? {};
  const updates: Partial<LeadRecord> = {};
  for (const [k, v] of Object.entries(rawUpdates)) {
    if (v === null || v === undefined || v === "") continue;
    (updates as Record<string, unknown>)[k] = v;
  }

  return {
    reply: parsed.reply,
    qualification_status: stage,
    updates,
    create_booking: Boolean(parsed.create_booking),
    booking_notes: typeof parsed.booking_notes === "string" ? parsed.booking_notes : undefined,
    reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : undefined,
  };
}

export interface ProviderConfig {
  mode: "built_in" | "custom";
  custom_provider?: string | null;
  custom_base_url?: string | null;
  custom_model?: string | null;
  custom_api_key?: string | null;
}

export interface RunQualificationArgs {
  lead: LeadRecord;
  history: EngineMessage[];
  userMessage: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  variables: Record<string, string>;
  settings: Record<string, unknown> | null;
  provider?: ProviderConfig | null;
}

export interface RunQualificationResult {
  decision: QualificationDecision;
  promptUsed: string;
  modelUsed: string;
  error?: string;
}

interface ChatResult {
  ok: boolean;
  content: string;
  error?: string;
}

// Built-in Lovable AI gateway (no user key required).
async function callBuiltIn(model: string, temperature: number, system: string, user: string): Promise<ChatResult> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return { ok: false, content: "", error: "Missing LOVABLE_API_KEY" };
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
    body: JSON.stringify({
      model: model || "google/gemini-3-flash-preview",
      temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    let msg = `AI gateway error ${res.status}`;
    if (res.status === 429) msg = "Rate limit reached. Please retry shortly.";
    if (res.status === 402) msg = "AI credits exhausted. Add credits in workspace settings.";
    return { ok: false, content: "", error: msg };
  }
  const data = await res.json();
  return { ok: true, content: data?.choices?.[0]?.message?.content ?? "" };
}

// OpenAI-compatible providers (OpenAI, OpenRouter, Groq, DeepSeek, Mistral, Together, custom…).
async function callOpenAiCompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  temperature: number,
  system: string,
  user: string,
): Promise<ChatResult> {
  const url = baseUrl.replace(/\/+$/, "") + "/chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, content: "", error: `Provider error ${res.status}: ${text.slice(0, 300)}` };
  }
  const data = await res.json();
  return { ok: true, content: data?.choices?.[0]?.message?.content ?? "" };
}

// Anthropic native messages API.
async function callAnthropic(
  baseUrl: string,
  apiKey: string,
  model: string,
  temperature: number,
  system: string,
  user: string,
): Promise<ChatResult> {
  const url = (baseUrl?.replace(/\/+$/, "") || "https://api.anthropic.com") + "/v1/messages";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      temperature,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, content: "", error: `Anthropic error ${res.status}: ${text.slice(0, 300)}` };
  }
  const data = await res.json();
  const content = Array.isArray(data?.content)
    ? data.content.map((c: { text?: string }) => c?.text ?? "").join("")
    : "";
  return { ok: true, content };
}

export async function runQualification(args: RunQualificationArgs): Promise<RunQualificationResult> {
  const promptUsed = buildSystemPrompt({
    systemPrompt: args.systemPrompt,
    variables: args.variables,
    settings: args.settings,
    lead: args.lead,
    history: args.history,
  });

  const fallbackStage = (args.lead.qualification_status as QualificationStage) || "NEW_LEAD";
  const fallback = (error: string, reply: string): RunQualificationResult => ({
    decision: { reply, qualification_status: fallbackStage, updates: {}, create_booking: false },
    promptUsed,
    modelUsed: args.model,
    error,
  });

  const temperature = args.temperature ?? 0.7;
  const provider = args.provider;
  const useCustom = provider?.mode === "custom";

  let modelUsed = args.model;
  let result: ChatResult;

  try {
    if (useCustom) {
      const key = provider?.custom_api_key?.trim();
      const customModel = provider?.custom_model?.trim();
      const baseUrl = provider?.custom_base_url?.trim();
      const providerName = (provider?.custom_provider ?? "").toLowerCase();
      if (!key) return fallback("Custom AI provider is missing an API key.", "Our assistant is temporarily unavailable. An advisor will reply shortly.");
      if (!customModel) return fallback("Custom AI provider is missing a model.", "Our assistant is temporarily unavailable. An advisor will reply shortly.");
      modelUsed = customModel;

      if (providerName === "anthropic") {
        result = await callAnthropic(baseUrl || "https://api.anthropic.com", key, customModel, temperature, promptUsed, args.userMessage);
      } else {
        if (!baseUrl) return fallback("Custom AI provider is missing a base URL.", "Our assistant is temporarily unavailable. An advisor will reply shortly.");
        result = await callOpenAiCompatible(baseUrl, key, customModel, temperature, promptUsed, args.userMessage);
      }
    } else {
      result = await callBuiltIn(args.model, temperature, promptUsed, args.userMessage);
    }
  } catch (e) {
    return fallback(e instanceof Error ? e.message : "Unknown AI error", "Thanks for reaching out! An advisor will get back to you shortly.");
  }

  if (!result.ok) {
    return fallback(result.error ?? "AI request failed", "Thanks for reaching out! An advisor will get back to you shortly.");
  }

  const decision = safeParseDecision(result.content, fallbackStage);
  return { decision, promptUsed, modelUsed };
}

export function fillTemplate(template: string, ctx: Record<string, unknown>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, name) => {
    const v = ctx[name];
    return v === null || v === undefined ? "" : String(v);
  });
}

/* ===================== RESPONDER AGENT (orchestration) =====================
   A responder agent replies to leads who react to an outbound message
   sequence. Unlike the qualification engine it produces a plain conversational
   reply (no pipeline JSON) and never advances the qualification stage. */

export interface RunResponderArgs {
  systemPrompt: string;
  model: string;
  temperature: number;
  variables: Record<string, string>;
  settings: Record<string, unknown> | null;
  lead: LeadRecord;
  history: EngineMessage[];
  userMessage: string;
  provider?: ProviderConfig | null;
}

export interface RunResponderResult {
  reply: string;
  modelUsed: string;
  error?: string;
}

function buildResponderPrompt(args: {
  systemPrompt: string;
  variables: Record<string, string>;
  settings: Record<string, unknown> | null;
  lead: LeadRecord;
  history: EngineMessage[];
}): string {
  const resolved = applyVariables(args.systemPrompt, args.variables);

  const settingsBlock = args.settings
    ? `Company: ${args.settings.company_name ?? ""}
Email: ${args.settings.company_email ?? ""}
Phone: ${args.settings.company_phone ?? ""}
Working hours: ${args.settings.working_hours ?? ""}
Active destinations: ${args.settings.active_destinations ?? ""}
Active programs: ${args.settings.active_programs ?? ""}
Scholarships: ${args.settings.scholarship_information ?? ""}`
    : "";

  const leadBlock = JSON.stringify(
    {
      lead_name: args.lead.lead_name,
      course_interest: args.lead.course_interest,
      country_interest: args.lead.country_interest,
      qualification_status: args.lead.qualification_status ?? "NEW_LEAD",
    },
    null,
    2,
  );

  const historyBlock = args.history
    .slice(-12)
    .map((h) => `${h.sender === "lead" ? "Student" : "Assistant"}: ${h.message_content}`)
    .join("\n");

  return `${resolved}

=== COMPANY SETTINGS ===
${settingsBlock}

=== LEAD MEMORY ===
${leadBlock}

=== RECENT CONVERSATION ===
${historyBlock || "(no prior messages)"}

=== OUTPUT FORMAT ===
Reply with ONLY the WhatsApp message text to send to the lead. Do not use JSON, labels, or quotation marks around the message.`;
}

export async function runResponderAgent(args: RunResponderArgs): Promise<RunResponderResult> {
  const prompt = buildResponderPrompt({
    systemPrompt: args.systemPrompt,
    variables: args.variables,
    settings: args.settings,
    lead: args.lead,
    history: args.history,
  });

  const temperature = args.temperature ?? 0.7;
  const provider = args.provider;
  const useCustom = provider?.mode === "custom";
  let modelUsed = args.model;
  let result: ChatResult;

  try {
    if (useCustom) {
      const key = provider?.custom_api_key?.trim();
      const customModel = provider?.custom_model?.trim();
      const baseUrl = provider?.custom_base_url?.trim();
      const providerName = (provider?.custom_provider ?? "").toLowerCase();
      if (!key) return { reply: "", modelUsed, error: "Responder agent is missing an API key." };
      if (!customModel) return { reply: "", modelUsed, error: "Responder agent is missing a model." };
      modelUsed = customModel;
      if (providerName === "anthropic") {
        result = await callAnthropic(baseUrl || "https://api.anthropic.com", key, customModel, temperature, prompt, args.userMessage);
      } else {
        if (!baseUrl) return { reply: "", modelUsed, error: "Responder agent is missing a base URL." };
        result = await callOpenAiCompatible(baseUrl, key, customModel, temperature, prompt, args.userMessage);
      }
    } else {
      result = await callBuiltIn(args.model, temperature, prompt, args.userMessage);
    }
  } catch (e) {
    return { reply: "", modelUsed, error: e instanceof Error ? e.message : "Unknown AI error" };
  }

  if (!result.ok) return { reply: "", modelUsed, error: result.error ?? "AI request failed" };
  return { reply: result.content.trim(), modelUsed };
}
