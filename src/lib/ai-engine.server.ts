// Server-only AI qualification engine for Linkmoore Education.
// Imported only from server functions / server routes.
import {
  AI_FINAL_STAGE,
  APPOINTMENT_STATUSES,
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
  /** ISO 8601 datetime the lead agreed to for the booking/consultation call. */
  appointment_date?: string | null;
  /** Booking status: pending (confirmation), confirmed, completed, cancelled. */
  appointment_status?: string;
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

=== DISQUALIFICATION RULES ===
Set "qualification_status" to "DISQUALIFIED" when the lead clearly does not meet the
financial conditions to proceed, specifically when ANY of these are true:
- The lead states they can only proceed with a FULL scholarship / 100% funding / "bolsa integral".
- The lead says they cannot afford the program and has no financial support available.
- The lead explicitly declines the financial terms / fees required to enroll.
When disqualifying, set "financial_alignment" in updates to a short reason
(e.g. "Disqualified - Seeking full scholarship only") and keep the reply polite.
Do NOT disqualify for a temporary delay, needing a payment plan, or wanting to
discuss with family — those go to FINANCIAL_ALIGNMENT or PARENT_CONTACT_RECEIVED instead.

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
  "appointment_date": null,
  "appointment_status": "pending",
  "reasoning": "1 short sentence"
}
Only include fields in "updates" that you learned in THIS turn (use null otherwise). Set create_booking to true ONLY when the lead reaches QUALIFIED and you are advancing to BOOKING_REQUEST_CREATED.
Set "appointment_date" to an ISO 8601 datetime (e.g. "2026-06-20T15:00:00Z") ONLY when the lead has agreed to a specific date and time for their booking/consultation call; otherwise keep it null. Keep "appointment_status" as "pending" until the lead explicitly confirms the slot, then you may use "confirmed". This writes the time onto the Booking tab while preserving the booking status.`;
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

  const apptRaw = typeof parsed.appointment_date === "string" ? parsed.appointment_date.trim() : "";
  const apptDate = apptRaw && !Number.isNaN(Date.parse(apptRaw)) ? new Date(apptRaw).toISOString() : null;
  const apptStatusRaw = typeof parsed.appointment_status === "string" ? parsed.appointment_status.toLowerCase() : "";
  const apptStatus = (APPOINTMENT_STATUSES as readonly string[]).includes(apptStatusRaw) ? apptStatusRaw : "pending";

  return {
    reply: parsed.reply,
    qualification_status: stage,
    updates,
    create_booking: Boolean(parsed.create_booking),
    booking_notes: typeof parsed.booking_notes === "string" ? parsed.booking_notes : undefined,
    appointment_date: apptDate,
    appointment_status: apptStatus,
    reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : undefined,
  };
}

export interface ProviderConfig {
  mode: "built_in" | "custom";
  custom_provider?: string | null;
  custom_base_url?: string | null;
  custom_model?: string | null;
  custom_api_key?: string | null;
  // When set & non-empty, the engine rotates through this prioritized chain of
  // providers/models on rate limits or failures instead of using the single
  // provider above. The built-in Lovable AI should be appended as the last entry.
  fallbackChain?: AiFallbackTarget[] | null;
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
  status?: number;
  rateLimited?: boolean;
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
    return { ok: false, content: "", error: msg, status: res.status, rateLimited: res.status === 429 || res.status === 402 };
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
    return {
      ok: false,
      content: "",
      error: `Provider error ${res.status}: ${text.slice(0, 300)}`,
      status: res.status,
      rateLimited: res.status === 429 || res.status === 402,
    };
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
    return {
      ok: false,
      content: "",
      error: `Anthropic error ${res.status}: ${text.slice(0, 300)}`,
      status: res.status,
      rateLimited: res.status === 429 || res.status === 402,
    };
  }
  const data = await res.json();
  const content = Array.isArray(data?.content)
    ? data.content.map((c: { text?: string }) => c?.text ?? "").join("")
    : "";
  return { ok: true, content };
}

/* ===================== PROVIDER FALLBACK ROTATION =====================
   A prioritized chain of providers. Each entry can list several models to
   try in order. When a provider/model hits a rate limit (or any failure)
   the engine rotates to the next model, then the next provider, and finally
   to the built-in Lovable AI as the last resort. */
export interface AiFallbackTarget {
  provider: string; // "built_in" | "anthropic" | preset id (openai-compatible)
  baseUrl?: string | null;
  apiKey?: string | null;
  models: string[]; // free models to rotate through, in order
}

async function callTarget(
  target: AiFallbackTarget,
  model: string,
  temperature: number,
  system: string,
  user: string,
): Promise<ChatResult> {
  const name = (target.provider ?? "").toLowerCase();
  if (name === "built_in" || name === "lovable") {
    return callBuiltIn(model, temperature, system, user);
  }
  const key = (target.apiKey ?? "").trim();
  const baseUrl = (target.baseUrl ?? "").trim();
  if (!key) return { ok: false, content: "", error: "Missing API key" };
  if (name === "anthropic") {
    return callAnthropic(baseUrl || "https://api.anthropic.com", key, model, temperature, system, user);
  }
  if (!baseUrl) return { ok: false, content: "", error: "Missing base URL" };
  return callOpenAiCompatible(baseUrl, key, model, temperature, system, user);
}

interface ChainOutcome {
  result: ChatResult;
  modelUsed: string;
  attempts: number;
}

// Walk the chain trying each model of each provider until one succeeds.
async function runChatChain(
  chain: AiFallbackTarget[],
  temperature: number,
  system: string,
  user: string,
): Promise<ChainOutcome> {
  let last: ChatResult = { ok: false, content: "", error: "No AI providers configured." };
  let modelUsed = "";
  let attempts = 0;
  for (const target of chain) {
    const models = target.models.length ? target.models : [""];
    for (const m of models) {
      attempts += 1;
      modelUsed = m || target.provider;
      try {
        last = await callTarget(target, m, temperature, system, user);
      } catch (e) {
        last = { ok: false, content: "", error: e instanceof Error ? e.message : "AI request failed" };
      }
      if (last.ok) return { result: last, modelUsed, attempts };
      // Not ok → rotate to the next model / provider (rate limits or hard failures).
    }
  }
  return { result: last, modelUsed, attempts };
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
  const chain = provider?.fallbackChain;
  const useChain = Array.isArray(chain) && chain.length > 0;
  const useCustom = !useChain && provider?.mode === "custom";

  let modelUsed = args.model;
  let result: ChatResult;

  // Prioritized provider fallback rotation.
  if (useChain) {
    const outcome = await runChatChain(chain!, temperature, promptUsed, args.userMessage);
    if (!outcome.result.ok) {
      return fallback(outcome.result.error ?? "All AI providers failed", "Thanks for reaching out! An advisor will get back to you shortly.");
    }
    const decisionFromChain = safeParseDecision(outcome.result.content, fallbackStage);
    return { decision: decisionFromChain, promptUsed, modelUsed: outcome.modelUsed };
  }


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
  const chain = provider?.fallbackChain;
  const useChain = Array.isArray(chain) && chain.length > 0;
  const useCustom = !useChain && provider?.mode === "custom";
  let modelUsed = args.model;
  let result: ChatResult;

  // Prioritized provider fallback rotation.
  if (useChain) {
    const outcome = await runChatChain(chain!, temperature, prompt, args.userMessage);
    if (!outcome.result.ok) return { reply: "", modelUsed: outcome.modelUsed, error: outcome.result.error ?? "All AI providers failed" };
    return { reply: outcome.result.content.trim(), modelUsed: outcome.modelUsed };
  }


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
