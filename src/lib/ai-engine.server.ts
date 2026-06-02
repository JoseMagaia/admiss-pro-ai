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

export interface RunQualificationArgs {
  lead: LeadRecord;
  history: EngineMessage[];
  userMessage: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  variables: Record<string, string>;
  settings: Record<string, unknown> | null;
}

export interface RunQualificationResult {
  decision: QualificationDecision;
  promptUsed: string;
  modelUsed: string;
  error?: string;
}

export async function runQualification(args: RunQualificationArgs): Promise<RunQualificationResult> {
  const apiKey = process.env.LOVABLE_API_KEY;
  const promptUsed = buildSystemPrompt({
    systemPrompt: args.systemPrompt,
    variables: args.variables,
    settings: args.settings,
    lead: args.lead,
    history: args.history,
  });

  if (!apiKey) {
    return {
      decision: {
        reply: "Our assistant is temporarily unavailable. An admissions advisor will reply shortly.",
        qualification_status: (args.lead.qualification_status as QualificationStage) || "NEW_LEAD",
        updates: {},
        create_booking: false,
      },
      promptUsed,
      modelUsed: args.model,
      error: "Missing LOVABLE_API_KEY",
    };
  }

  try {
    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: args.model || "google/gemini-3-flash-preview",
        temperature: args.temperature ?? 0.7,
        messages: [
          { role: "system", content: promptUsed },
          { role: "user", content: args.userMessage },
        ],
      }),
    });

    if (!res.ok) {
      const status = res.status;
      let msg = `AI gateway error ${status}`;
      if (status === 429) msg = "Rate limit reached. Please retry shortly.";
      if (status === 402) msg = "AI credits exhausted. Add credits in workspace settings.";
      return {
        decision: {
          reply: "Thanks for reaching out! An advisor will get back to you shortly.",
          qualification_status: (args.lead.qualification_status as QualificationStage) || "NEW_LEAD",
          updates: {},
          create_booking: false,
        },
        promptUsed,
        modelUsed: args.model,
        error: msg,
      };
    }

    const data = await res.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    const decision = safeParseDecision(content, args.lead.qualification_status || "NEW_LEAD");
    return { decision, promptUsed, modelUsed: args.model };
  } catch (e) {
    return {
      decision: {
        reply: "Thanks for reaching out! An advisor will get back to you shortly.",
        qualification_status: (args.lead.qualification_status as QualificationStage) || "NEW_LEAD",
        updates: {},
        create_booking: false,
      },
      promptUsed,
      modelUsed: args.model,
      error: e instanceof Error ? e.message : "Unknown AI error",
    };
  }
}

export function fillTemplate(template: string, ctx: Record<string, unknown>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, name) => {
    const v = ctx[name];
    return v === null || v === undefined ? "" : String(v);
  });
}
