import { A as AI_FINAL_STAGE, Q as QUALIFICATION_STAGES, a as APPOINTMENT_STATUSES } from "./pipeline-BHDikEyF.mjs";
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
  "need help"
];
function detectHumanTakeover(message) {
  const m = message.toLowerCase();
  return HUMAN_TAKEOVER_PATTERNS.some((p) => m.includes(p));
}
function applyVariables(text, variables) {
  return text.replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g, (_, name) => variables[name] ?? `{{${name}}}`);
}
function buildSystemPrompt({
  systemPrompt,
  variables,
  settings,
  lead,
  history
}) {
  const resolved = applyVariables(systemPrompt, variables);
  const settingsBlock = settings ? `Company: ${settings.company_name ?? ""}
Email: ${settings.company_email ?? ""}
Phone: ${settings.company_phone ?? ""}
Working hours: ${settings.working_hours ?? ""}
Active destinations: ${settings.active_destinations ?? ""}
Active programs: ${settings.active_programs ?? ""}
Scholarships: ${settings.scholarship_information ?? ""}` : "";
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
      qualification_status: lead.qualification_status ?? "NEW_LEAD"
    },
    null,
    2
  );
  const historyBlock = history.slice(-12).map((h) => `${h.sender === "lead" ? "Student" : "Assistant"}: ${h.message_content}`).join("\n");
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
function safeParseDecision(content, currentStage) {
  let parsed = null;
  try {
    const match = content.match(/\{[\s\S]*\}/);
    parsed = match ? JSON.parse(match[0]) : JSON.parse(content);
  } catch {
    parsed = null;
  }
  if (!parsed || typeof parsed.reply !== "string") {
    return {
      reply: content?.trim() || "Thanks for your message! Could you tell me a bit more so I can help you?",
      qualification_status: currentStage || "NEW_LEAD",
      updates: {},
      create_booking: false
    };
  }
  const stage = QUALIFICATION_STAGES.includes(parsed.qualification_status) ? parsed.qualification_status : currentStage || "NEW_LEAD";
  const rawUpdates = parsed.updates ?? {};
  const updates = {};
  for (const [k, v] of Object.entries(rawUpdates)) {
    if (v === null || v === void 0 || v === "") continue;
    updates[k] = v;
  }
  const apptRaw = typeof parsed.appointment_date === "string" ? parsed.appointment_date.trim() : "";
  const apptDate = apptRaw && !Number.isNaN(Date.parse(apptRaw)) ? new Date(apptRaw).toISOString() : null;
  const apptStatusRaw = typeof parsed.appointment_status === "string" ? parsed.appointment_status.toLowerCase() : "";
  const apptStatus = APPOINTMENT_STATUSES.includes(apptStatusRaw) ? apptStatusRaw : "pending";
  return {
    reply: parsed.reply,
    qualification_status: stage,
    updates,
    create_booking: Boolean(parsed.create_booking),
    booking_notes: typeof parsed.booking_notes === "string" ? parsed.booking_notes : void 0,
    appointment_date: apptDate,
    appointment_status: apptStatus,
    reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : void 0
  };
}
async function callOpenAiCompatible(baseUrl, apiKey, model, temperature, system, user) {
  const url = baseUrl.replace(/\/+$/, "") + "/chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    })
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false,
      content: "",
      error: `Provider error ${res.status}: ${text.slice(0, 300)}`,
      status: res.status,
      rateLimited: res.status === 429 || res.status === 402
    };
  }
  const data = await res.json();
  return { ok: true, content: data?.choices?.[0]?.message?.content ?? "" };
}
async function callAnthropic(baseUrl, apiKey, model, temperature, system, user) {
  const url = (baseUrl?.replace(/\/+$/, "") || "https://api.anthropic.com") + "/v1/messages";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      temperature,
      system,
      messages: [{ role: "user", content: user }]
    })
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false,
      content: "",
      error: `Anthropic error ${res.status}: ${text.slice(0, 300)}`,
      status: res.status,
      rateLimited: res.status === 429 || res.status === 402
    };
  }
  const data = await res.json();
  const content = Array.isArray(data?.content) ? data.content.map((c) => c?.text ?? "").join("") : "";
  return { ok: true, content };
}
async function callTarget(target, model, temperature, system, user) {
  const name = (target.provider ?? "").toLowerCase();
  if (name === "built_in" || name === "lovable") {
    return { ok: false, content: "", error: "Built-in AI is not available. Configure a custom provider." };
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
async function runChatChain(chain, temperature, system, user) {
  let last = { ok: false, content: "", error: "No AI providers configured." };
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
    }
  }
  return { result: last, modelUsed, attempts };
}
async function runQualification(args) {
  const promptUsed = buildSystemPrompt({
    systemPrompt: args.systemPrompt,
    variables: args.variables,
    settings: args.settings,
    lead: args.lead,
    history: args.history
  });
  const fallbackStage = args.lead.qualification_status || "NEW_LEAD";
  const fallback = (error, reply) => ({
    decision: { reply, qualification_status: fallbackStage, updates: {}, create_booking: false },
    promptUsed,
    modelUsed: args.model,
    error
  });
  const temperature = args.temperature ?? 0.7;
  const provider = args.provider;
  const chain = provider?.fallbackChain;
  const useChain = Array.isArray(chain) && chain.length > 0;
  const useCustom = !useChain && provider?.mode === "custom";
  let modelUsed = args.model;
  let result;
  if (useChain) {
    const outcome = await runChatChain(chain, temperature, promptUsed, args.userMessage);
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
      return fallback(
        "No AI provider configured. Add your own provider and API key in Settings → AI Provider.",
        "Our assistant is temporarily unavailable. An advisor will reply shortly."
      );
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
function fillTemplate(template, ctx) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, name) => {
    const v = ctx[name];
    return v === null || v === void 0 ? "" : String(v);
  });
}
function buildResponderPrompt(args) {
  const resolved = applyVariables(args.systemPrompt, args.variables);
  const settingsBlock = args.settings ? `Company: ${args.settings.company_name ?? ""}
Email: ${args.settings.company_email ?? ""}
Phone: ${args.settings.company_phone ?? ""}
Working hours: ${args.settings.working_hours ?? ""}
Active destinations: ${args.settings.active_destinations ?? ""}
Active programs: ${args.settings.active_programs ?? ""}
Scholarships: ${args.settings.scholarship_information ?? ""}` : "";
  const leadBlock = JSON.stringify(
    {
      lead_name: args.lead.lead_name,
      course_interest: args.lead.course_interest,
      country_interest: args.lead.country_interest,
      qualification_status: args.lead.qualification_status ?? "NEW_LEAD"
    },
    null,
    2
  );
  const historyBlock = args.history.slice(-12).map((h) => `${h.sender === "lead" ? "Student" : "Assistant"}: ${h.message_content}`).join("\n");
  return `${resolved}

=== COMPANY SETTINGS ===
${settingsBlock}

=== LEAD MEMORY ===
${leadBlock}

=== RECENT CONVERSATION ===
${historyBlock || "(no prior messages)"}

=== BOOKING CAPABILITY ===
If the lead agrees to a specific date and time for their consultation/booking call, append on a NEW LINE at the very END of your message a directive in EXACTLY this format:
[[BOOKING: <ISO8601 datetime> | <status>]]
where <status> is one of: pending, confirmed (use "pending" unless the lead explicitly confirms). Example: [[BOOKING: 2026-06-20T15:00:00Z | pending]]
This directive is automatically removed before the message is sent — NEVER mention it to the lead. Omit it entirely if no specific date and time was agreed.

=== OUTPUT FORMAT ===
Reply with ONLY the WhatsApp message text to send to the lead (optionally followed by the booking directive above). Do not use JSON, labels, or quotation marks around the message.`;
}
async function runResponderAgent(args) {
  const prompt = buildResponderPrompt({
    systemPrompt: args.systemPrompt,
    variables: args.variables,
    settings: args.settings,
    lead: args.lead,
    history: args.history
  });
  const temperature = args.temperature ?? 0.7;
  const provider = args.provider;
  const chain = provider?.fallbackChain;
  const useChain = Array.isArray(chain) && chain.length > 0;
  const useCustom = !useChain && provider?.mode === "custom";
  let modelUsed = args.model;
  let result;
  if (useChain) {
    const outcome = await runChatChain(chain, temperature, prompt, args.userMessage);
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
      return {
        reply: "",
        modelUsed,
        error: "No AI provider configured. Add your own provider and API key in Settings → AI Provider."
      };
    }
  } catch (e) {
    return { reply: "", modelUsed, error: e instanceof Error ? e.message : "Unknown AI error" };
  }
  if (!result.ok) return { reply: "", modelUsed, error: result.error ?? "AI request failed" };
  return { reply: result.content.trim(), modelUsed };
}
export {
  buildSystemPrompt,
  detectHumanTakeover,
  fillTemplate,
  runQualification,
  runResponderAgent
};
