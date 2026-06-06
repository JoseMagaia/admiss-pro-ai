import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ALL_ROLES, type AppRole } from "@/lib/roles";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

// Throws when the caller lacks an allowed role. Use inside write handlers.
async function guard(allowed: AppRole[]) {
  const { assertRole } = await import("@/integrations/supabase/role-guard.server");
  return assertRole(allowed);
}

// Returns true when the caller is authenticated with any role. Use for reads.
async function isAuthed(): Promise<boolean> {
  const { getRequestUser } = await import("@/integrations/supabase/role-guard.server");
  const u = await getRequestUser();
  return Boolean(u?.role);
}

const ANY_ROLE = ALL_ROLES;

/* ----------------------------- LEADS ----------------------------- */

export const listLeads = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { leads: [], error: "Unauthorized" };
  const db = await admin();
  const { data, error } = await db.from("leads").select("*").order("updated_at", { ascending: false }).limit(1000);
  if (error) return { leads: [], error: error.message };
  return { leads: data ?? [], error: null };
});

export const updateLeadStage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), stage: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(ANY_ROLE);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { error } = await db.from("leads").update({ qualification_status: data.stage } as never).eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

export const toggleHumanTakeover = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ phone: z.string().min(1), enabled: z.boolean() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(ANY_ROLE);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { error } = await db
      .from("conversations")
      .update({
        human_takeover: data.enabled,
        status: data.enabled ? "pending" : "open",
        assigned_agent: data.enabled ? "Admissions Team" : null,
        // When AI is switched back on (enabled=false), mark the conversation
        // as resumed so the AI replies again even after the booking stop.
        ai_resumed: !data.enabled,
      } as never)
      .eq("phone_number", data.phone);
    return { ok: !error, error: error?.message ?? null };
  });

/* Delete a lead and all of its conversation history so the phone number is
   treated as a brand-new lead the next time it messages. Admins only. */
export const deleteLead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(["super_admin", "admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { data: lead } = await db.from("leads").select("phone_number").eq("id", data.id).maybeSingle();
    const phone = (lead as { phone_number?: string } | null)?.phone_number;
    if (!phone) return { ok: false, error: "Lead not found" };

    // Remove all related records so the number starts fresh.
    await Promise.all([
      db.from("conversations").delete().eq("phone_number", phone),
      db.from("whatsapp_messages").delete().eq("phone_number", phone),
      db.from("appointments").delete().eq("phone_number", phone),
      db.from("scheduled_messages").delete().eq("phone_number", phone),
    ]);
    const { error } = await db.from("leads").delete().eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

/* ------------------------- CONVERSATIONS ------------------------- */

type MessageRow = {
  id: string;
  phone_number: string;
  message_content: string;
  sender: string;
  received_at: string;
};

type ConversationRow = {
  phone_number: string;
  human_takeover: boolean;
  status: string;
  updated_at?: string | null;
};

type LeadIdentityRow = {
  phone_number: string;
  lead_name: string | null;
};

type MessageThread = {
  phone_number: string;
  lead_name: string | null;
  human_takeover: boolean | null;
  status: string | null;
  conversation_updated_at: string | null;
  last_message_content: string | null;
  last_message_at: string | null;
  last_sender: string | null;
  match_message_content: string | null;
  match_message_at: string | null;
  match_sender: string | null;
};

function phoneCandidates(phone: string): string[] {
  const raw = phone.trim();
  const digits = raw.replace(/\D/g, "");
  return Array.from(
    new Set(
      [raw, digits, digits ? `+${digits}` : "", digits.startsWith("00") ? `+${digits.slice(2)}` : ""].filter(Boolean),
    ),
  );
}

function mergeThread(
  threads: Map<string, MessageThread>,
  phone: string,
  patch: Partial<MessageThread>,
) {
  const existing = threads.get(phone) ?? {
    phone_number: phone,
    lead_name: null,
    human_takeover: null,
    status: null,
    conversation_updated_at: null,
    last_message_content: null,
    last_message_at: null,
    last_sender: null,
    match_message_content: null,
    match_message_at: null,
    match_sender: null,
  };
  threads.set(phone, { ...existing, ...patch });
}

export const listConversations = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { conversations: [] };
  const db = await admin();
  const { data } = await db.from("conversations").select("*").order("updated_at", { ascending: false }).limit(1000);
  return { conversations: data ?? [] };
});

export const listMessages = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { messages: [] };
  const db = await admin();
  const { data } = await db.from("whatsapp_messages").select("*").order("received_at", { ascending: true }).limit(1000);
  return { messages: data ?? [] };
});

export const listMessageThreads = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        search: z.string().max(200).optional(),
        limit: z.number().int().min(10).max(50).optional(),
        offset: z.number().int().min(0).max(10000).optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    if (!(await isAuthed())) return { threads: [], hasMore: false };
    const db = await admin();
    const search = (data.search ?? "").trim();
    const limit = data.limit ?? 30;
    const offset = data.offset ?? 0;
    const needed = offset + limit + 1;
    const threads = new Map<string, MessageThread>();

    if (search) {
      let start = 0;
      while (threads.size < needed && start < 10000) {
        const { data: matches } = await db
          .from("whatsapp_messages")
          .select("id, phone_number, message_content, sender, received_at")
          .ilike("message_content", `%${search}%`)
          .order("received_at", { ascending: false })
          .range(start, start + 999);
        const rows = ((matches as MessageRow[] | null) ?? []) as MessageRow[];
        for (const msg of rows) {
          const existing = threads.get(msg.phone_number);
          if (!existing) {
            mergeThread(threads, msg.phone_number, {
              last_message_content: msg.message_content,
              last_message_at: msg.received_at,
              last_sender: msg.sender,
              match_message_content: msg.message_content,
              match_message_at: msg.received_at,
              match_sender: msg.sender,
            });
          } else if (msg.sender === "lead" && existing.match_sender !== "lead") {
            // Surface the student's (incoming) matching message instead of an
            // outgoing AI/agent reply so inbound matches are visible in results.
            mergeThread(threads, msg.phone_number, {
              match_message_content: msg.message_content,
              match_message_at: msg.received_at,
              match_sender: "lead",
            });
          }
        }
        if (rows.length < 1000) break;
        start += 1000;
      }

      const [{ data: phoneLeads }, { data: nameLeads }, { data: phoneConvs }] = await Promise.all([
        db.from("leads").select("phone_number, lead_name").ilike("phone_number", `%${search}%`).limit(200),
        db.from("leads").select("phone_number, lead_name").ilike("lead_name", `%${search}%`).limit(200),
        db.from("conversations").select("phone_number, human_takeover, status, updated_at").ilike("phone_number", `%${search}%`).limit(200),
      ]);

      for (const lead of ([...(phoneLeads ?? []), ...(nameLeads ?? [])] as LeadIdentityRow[])) {
        mergeThread(threads, lead.phone_number, { lead_name: lead.lead_name ?? null });
      }
      for (const conv of ((phoneConvs as ConversationRow[] | null) ?? []) as ConversationRow[]) {
        mergeThread(threads, conv.phone_number, {
          human_takeover: conv.human_takeover,
          status: conv.status,
          conversation_updated_at: conv.updated_at ?? null,
        });
      }
    } else {
      let start = 0;
      while (threads.size < needed && start < 20000) {
        const { data: recent } = await db
          .from("whatsapp_messages")
          .select("id, phone_number, message_content, sender, received_at")
          .order("received_at", { ascending: false })
          .range(start, start + 999);
        const rows = ((recent as MessageRow[] | null) ?? []) as MessageRow[];
        for (const msg of rows) {
          if (!threads.has(msg.phone_number)) {
            mergeThread(threads, msg.phone_number, {
              last_message_content: msg.message_content,
              last_message_at: msg.received_at,
              last_sender: msg.sender,
              match_message_content: null,
              match_message_at: null,
            });
          }
        }
        if (rows.length < 1000) break;
        start += 1000;
      }

      const { data: convs } = await db
        .from("conversations")
        .select("phone_number, human_takeover, status, updated_at")
        .order("updated_at", { ascending: false })
        .limit(needed + 200);
      for (const conv of ((convs as ConversationRow[] | null) ?? []) as ConversationRow[]) {
        mergeThread(threads, conv.phone_number, {
          human_takeover: conv.human_takeover,
          status: conv.status,
          conversation_updated_at: conv.updated_at ?? null,
        });
      }
    }

    const phones = Array.from(threads.keys());
    if (phones.length) {
      const [{ data: convRows }, { data: leadRows }] = await Promise.all([
        db.from("conversations").select("phone_number, human_takeover, status, updated_at").in("phone_number", phones),
        db.from("leads").select("phone_number, lead_name").in("phone_number", phones),
      ]);
      for (const conv of ((convRows as ConversationRow[] | null) ?? []) as ConversationRow[]) {
        mergeThread(threads, conv.phone_number, {
          human_takeover: conv.human_takeover,
          status: conv.status,
          conversation_updated_at: conv.updated_at ?? null,
        });
      }
      for (const lead of ((leadRows as LeadIdentityRow[] | null) ?? [])) {
        mergeThread(threads, lead.phone_number, { lead_name: lead.lead_name ?? null });
      }

      const missingLatest = phones.filter((phone) => !threads.get(phone)?.last_message_at);
      await Promise.all(
        missingLatest.map(async (phone) => {
          const { data: latest } = await db
            .from("whatsapp_messages")
            .select("id, phone_number, message_content, sender, received_at")
            .eq("phone_number", phone)
            .order("received_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          const msg = latest as MessageRow | null;
          if (msg) {
            mergeThread(threads, phone, {
              last_message_content: msg.message_content,
              last_message_at: msg.received_at,
              last_sender: msg.sender,
            });
          }
        }),
      );
    }

    const ordered = Array.from(threads.values()).sort((a, b) => {
      const aTime = String(a.last_message_at ?? a.match_message_at ?? a.conversation_updated_at ?? "");
      const bTime = String(b.last_message_at ?? b.match_message_at ?? b.conversation_updated_at ?? "");
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    return {
      threads: ordered.slice(offset, offset + limit),
      hasMore: ordered.length > offset + limit,
    };
  });

export const listConversationMessages = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ phone: z.string().min(1).max(60), limit: z.number().int().min(1).max(1000).optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await isAuthed())) return { phone: data.phone, messages: [], conversation: null };
    const db = await admin();
    const candidates = phoneCandidates(data.phone);
    const { data: conv } = await db
      .from("conversations")
      .select("phone_number, human_takeover, status, updated_at")
      .in("phone_number", candidates)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const canonicalPhone = (conv as ConversationRow | null)?.phone_number ?? data.phone;
    const messagePhones = Array.from(new Set([canonicalPhone, ...candidates]));
    const { data: rows } = await db
      .from("whatsapp_messages")
      .select("*")
      .in("phone_number", messagePhones)
      .order("received_at", { ascending: false })
      .limit(data.limit ?? 1000);
    const messages = (((rows as MessageRow[] | null) ?? []) as MessageRow[]).reverse();
    return {
      phone: messages.at(-1)?.phone_number ?? canonicalPhone,
      messages,
      conversation: conv ?? null,
    };
  });

/* -------------------------- APPOINTMENTS ------------------------- */

export const listAppointments = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { appointments: [] };
  const db = await admin();
  const { data } = await db.from("appointments").select("*").order("created_at", { ascending: false }).limit(1000);
  return { appointments: data ?? [] };
});

export const updateAppointmentStatus = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
        appointment_date: z.string().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(ANY_ROLE);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const update: Record<string, unknown> = { status: data.status };
    if (data.appointment_date !== undefined) update.appointment_date = data.appointment_date;
    const { error } = await db.from("appointments").update(update as never).eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

/* ---------------------------- SETTINGS --------------------------- */

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { settings: null };
  const db = await admin();
  const { data } = await db.from("education_settings").select("*").limit(1).maybeSingle();
  return { settings: data ?? null };
});

const settingsSchema = z.object({
  id: z.string().uuid().optional(),
  company_name: z.string().max(200).optional(),
  company_phone: z.string().max(60).nullable().optional(),
  company_email: z.string().max(200).nullable().optional(),
  office_address: z.string().max(500).nullable().optional(),
  working_hours: z.string().max(200).nullable().optional(),
  active_destinations: z.string().max(2000).nullable().optional(),
  active_programs: z.string().max(2000).nullable().optional(),
  scholarship_information: z.string().max(4000).nullable().optional(),
  whatsapp_webhook_url: z.string().max(500).nullable().optional(),
  chatwoot_url: z.string().max(500).nullable().optional(),
  chatwoot_account_id: z.string().max(100).nullable().optional(),
  chatwoot_inbox_id: z.string().max(100).nullable().optional(),
  chatwoot_api_token: z.string().max(500).nullable().optional(),
});

// Chatwoot fields are super-admin only; company/program fields allow admin too.
const CHATWOOT_FIELDS = ["chatwoot_url", "chatwoot_account_id", "chatwoot_inbox_id", "chatwoot_api_token"];

export const updateSettings = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => settingsSchema.parse(d))
  .handler(async ({ data }) => {
    let me;
    try {
      me = await guard(["super_admin", "admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const { id, ...rest } = data;
    // Admins cannot modify Chatwoot credentials.
    if (me.role !== "super_admin") {
      for (const f of CHATWOOT_FIELDS) delete (rest as Record<string, unknown>)[f];
    }
    const db = await admin();
    if (id) {
      const { error } = await db.from("education_settings").update(rest as never).eq("id", id);
      return { ok: !error, error: error?.message ?? null };
    }
    const { error } = await db.from("education_settings").insert(rest as never);
    return { ok: !error, error: error?.message ?? null };
  });

/* --------------------------- AI CONFIG --------------------------- */

export const getAiConfig = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { config: null };
  const db = await admin();
  const { data } = await db
    .from("ai_configuration")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return { config: data ?? null };
});

export const saveAiConfig = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        system_prompt: z.string().max(50000),
        model: z.string().min(1).max(100),
        temperature: z.number().min(0).max(2),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { id, ...rest } = data;
    if (id) {
      await db.from("ai_configuration").update(rest as never).eq("id", id);
    } else {
      await db.from("ai_configuration").insert(rest as never);
    }
    // Save a prompt version snapshot.
    const { data: versions } = await db
      .from("prompt_versions")
      .select("version_number")
      .order("version_number", { ascending: false })
      .limit(1);
    const nextVersion = (versions?.[0]?.version_number ?? 0) + 1;
    await db.from("prompt_versions").insert({
      version_number: nextVersion,
      system_prompt: data.system_prompt,
      created_by: "admin",
    } as never);
    return { ok: true, version: nextVersion };
  });

/* ------------------------- AI PROVIDER -------------------------- */

export const saveAiProvider = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        provider_mode: z.enum(["built_in", "custom"]),
        custom_provider: z.string().max(100).nullable().optional(),
        custom_base_url: z.string().max(500).nullable().optional(),
        custom_model: z.string().max(200).nullable().optional(),
        custom_api_key: z.string().max(500).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { id, ...rest } = data;
    // Don't overwrite a stored key with an empty value (the UI sends "" when unchanged).
    if (rest.custom_api_key === "" || rest.custom_api_key === undefined) {
      delete (rest as Record<string, unknown>).custom_api_key;
    }
    if (id) {
      const { error } = await db.from("ai_configuration").update(rest as never).eq("id", id);
      return { ok: !error, error: error?.message ?? null };
    }
    const { error } = await db.from("ai_configuration").insert(rest as never);
    return { ok: !error, error: error?.message ?? null };
  });

// Test a custom AI provider connection before saving. When the api key is left
// blank the stored key is used, so an existing connection can be re-verified.
export const testAiProvider = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        provider_mode: z.enum(["built_in", "custom"]),
        custom_provider: z.string().max(100).nullable().optional(),
        custom_base_url: z.string().max(500).nullable().optional(),
        custom_model: z.string().max(200).nullable().optional(),
        custom_api_key: z.string().max(500).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }

    if (data.provider_mode === "built_in") {
      if (!process.env.LOVABLE_API_KEY) return { ok: false, error: "Built-in AI key is not configured." };
      return { ok: true, error: null };
    }

    // Use the saved key when the form leaves it blank.
    let apiKey = (data.custom_api_key ?? "").trim();
    const baseUrl = (data.custom_base_url ?? "").trim();
    const model = (data.custom_model ?? "").trim();
    const provider = (data.custom_provider ?? "").toLowerCase();

    if (!apiKey) {
      const db = await admin();
      const { data: cfg } = await db
        .from("ai_configuration")
        .select("custom_api_key")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      apiKey = String((cfg as { custom_api_key?: string } | null)?.custom_api_key ?? "").trim();
    }

    if (!apiKey) return { ok: false, error: "No API key provided or saved." };
    if (!model) return { ok: false, error: "Select a model first." };

    try {
      if (provider === "anthropic") {
        const url = (baseUrl.replace(/\/+$/, "") || "https://api.anthropic.com") + "/v1/messages";
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({ model, max_tokens: 8, messages: [{ role: "user", content: "ping" }] }),
        });
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          return { ok: false, error: `Provider error ${res.status}: ${t.slice(0, 200)}` };
        }
        return { ok: true, error: null };
      }
      if (!baseUrl) return { ok: false, error: "Base URL is required for this provider." };
      const url = baseUrl.replace(/\/+$/, "") + "/chat/completions";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, max_tokens: 8, messages: [{ role: "user", content: "ping" }] }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        return { ok: false, error: `Provider error ${res.status}: ${t.slice(0, 200)}` };
      }
      return { ok: true, error: null };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Connection failed" };
    }
  });

export const listPromptVersions = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { versions: [] };
  const db = await admin();
  const { data } = await db
    .from("prompt_versions")
    .select("*")
    .order("version_number", { ascending: false })
    .limit(100);
  return { versions: data ?? [] };
});

/* -------------------------- AI VARIABLES ------------------------- */

export const listAiVariables = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { variables: [] };
  const db = await admin();
  const { data } = await db.from("ai_variables").select("*").order("variable_name", { ascending: true });
  return { variables: data ?? [] };
});

export const upsertAiVariable = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        variable_name: z.string().min(1).max(100).regex(/^[A-Z0-9_]+$/),
        variable_value: z.string().max(2000),
        description: z.string().max(500).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { id, ...rest } = data;
    if (id) {
      const { error } = await db.from("ai_variables").update(rest as never).eq("id", id);
      return { ok: !error, error: error?.message ?? null };
    }
    const { error } = await db.from("ai_variables").insert(rest as never);
    return { ok: !error, error: error?.message ?? null };
  });

export const deleteAiVariable = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { error } = await db.from("ai_variables").delete().eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

/* -------------------------- HTTP ACTIONS ------------------------- */

export const listHttpActions = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { actions: [] };
  const db = await admin();
  const { data } = await db.from("http_actions").select("*").order("created_at", { ascending: false });
  return { actions: data ?? [] };
});

export const upsertHttpAction = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().min(1).max(200),
        trigger_stage: z.string().min(1).max(100),
        url: z.string().url().max(1000),
        method: z.enum(["POST", "GET", "PUT", "PATCH"]),
        headers: z.record(z.string(), z.string()).optional(),
        payload_template: z.string().max(10000),
        enabled: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { id, ...rest } = data;
    if (id) {
      const { error } = await db.from("http_actions").update(rest as never).eq("id", id);
      return { ok: !error, error: error?.message ?? null };
    }
    const { error } = await db.from("http_actions").insert(rest as never);
    return { ok: !error, error: error?.message ?? null };
  });

export const deleteHttpAction = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { error } = await db.from("http_actions").delete().eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

/* ------------------------- PROMPT TEST LAB ----------------------- */

export const testPrompt = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ message: z.string().min(1).max(4000), phone: z.string().max(60).optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(["super_admin", "admin"]);
    } catch (e) {
      return { promptUsed: "", modelUsed: "", memory: null, decision: null, error: (e as Error).message };
    }
    const { loadAiContext, recentHistory } = await import("./admissions.server");
    const { runQualification } = await import("./ai-engine.server");

    const ctx = await loadAiContext();
    const phone = data.phone?.trim() || "test-lab";
    const db = await admin();
    const { data: existingLead } = await db.from("leads").select("*").eq("phone_number", phone).maybeSingle();

    const lead = existingLead ?? {
      phone_number: phone,
      qualification_status: "NEW_LEAD",
    };
    const history = phone === "test-lab" ? [] : await recentHistory(phone);

    const { decision, promptUsed, modelUsed, error } = await runQualification({
      lead,
      history,
      userMessage: data.message,
      systemPrompt: ctx.systemPrompt,
      model: ctx.model,
      temperature: ctx.temperature,
      variables: ctx.variables,
      settings: ctx.settings,
      provider: ctx.provider,
    });

    return {
      promptUsed,
      modelUsed,
      memory: lead,
      decision,
      error: error ?? null,
    };
  });

/* --------------------------- DASHBOARD STATS --------------------- */

export const getDashboardStats = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { leads: 0, qualified: 0, bookings: 0, messages: 0, onboarding: 0, disqualified: 0 };
  const db = await admin();
  const [
    { count: leadsCount },
    { count: qualifiedCount },
    { count: bookingsCount },
    { count: msgCount },
    { count: onboardingCount },
    { count: disqualifiedCount },
  ] = await Promise.all([
    db.from("leads").select("*", { count: "exact", head: true }),
    db.from("leads").select("*", { count: "exact", head: true }).in("qualification_status", ["QUALIFIED", "BOOKING_REQUEST_CREATED"]),
    db.from("appointments").select("*", { count: "exact", head: true }),
    db.from("whatsapp_messages").select("*", { count: "exact", head: true }),
    db.from("leads").select("*", { count: "exact", head: true }).eq("qualification_status", "ONBOARDING"),
    db.from("leads").select("*", { count: "exact", head: true }).eq("qualification_status", "DISQUALIFIED"),
  ]);
  return {
    leads: leadsCount ?? 0,
    qualified: qualifiedCount ?? 0,
    bookings: bookingsCount ?? 0,
    messages: msgCount ?? 0,
    onboarding: onboardingCount ?? 0,
    disqualified: disqualifiedCount ?? 0,
  };
});

/* ----------------------- HUMAN MESSAGING ------------------------ */

// Send a manual reply from an agent. Sending pauses the AI (human takeover).
export const sendHumanMessage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ phone: z.string().min(1).max(60), message: z.string().min(1).max(4000) }).parse(d),
  )
  .handler(async ({ data }) => {
    let me;
    try {
      me = await guard(ANY_ROLE);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const { deliverHumanMessage } = await import("./admissions.server");
    const db = await admin();
    // Pause AI for this conversation when an agent steps in.
    await db
      .from("conversations")
      .update({ human_takeover: true, status: "pending", assigned_agent: me.email ?? "Agent", ai_resumed: false } as never)
      .eq("phone_number", data.phone);
    const result = await deliverHumanMessage({ phone: data.phone, message: data.message });
    return { ok: result.ok, error: result.error ?? null };
  });

/* Start a brand-new conversation with an unregistered lead. Creates the lead +
   conversation just like an inbound lead, then sends the first message through
   the selected Chatwoot workspace. AI stays paused (human-started thread). */
export const startConversation = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        phone: z.string().min(3).max(60),
        name: z.string().min(1).max(200).optional(),
        workspaceId: z.string().uuid().optional(),
        message: z.string().min(1).max(4000),
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

    const phone = data.phone.trim();
    const db = await admin();

    // Don't clobber an existing lead/conversation.
    const { data: existing } = await db
      .from("leads")
      .select("id")
      .eq("phone_number", phone)
      .maybeSingle();
    if (existing) {
      return { ok: false, error: "A lead with this number already exists. Open it from the list." };
    }

    const {
      resolveWorkspace,
      resolveCreds,
      createChatwootConversation,
      getOrCreateLead,
      deliverHumanMessage,
    } = await import("./admissions.server");

    const workspace = await resolveWorkspace({ workspaceId: data.workspaceId ?? null });
    const creds = await resolveCreds(workspace);

    // Best-effort: create the Chatwoot contact + conversation so replies thread.
    const conversationId = await createChatwootConversation({
      creds,
      inboxId: workspace?.chatwoot_inbox_id ?? null,
      phone,
      name: data.name ?? null,
    });

    // Create the lead so it shows up across Leads / Pipeline / Contacts.
    const lead = await getOrCreateLead(phone, conversationId, null, workspace?.id ?? null);
    if (data.name) {
      await db.from("leads").update({ lead_name: data.name } as never).eq("id", lead.id!);
    }

    // Create the conversation row with AI paused (agent-started thread).
    const { data: existingConv } = await db
      .from("conversations")
      .select("id")
      .eq("phone_number", phone)
      .maybeSingle();
    if (!existingConv) {
      await db.from("conversations").insert({
        phone_number: phone,
        lead_id: lead.id ?? null,
        chatwoot_conversation_id: conversationId,
        workspace_id: workspace?.id ?? null,
        status: "pending",
        human_takeover: true,
        assigned_agent: me.email ?? "Agent",
        ai_resumed: false,
      } as never);
    }

    // Send + log the first message.
    const result = await deliverHumanMessage({ phone, message: data.message });

    await db.from("audit_logs").insert({
      actor_email: me.email ?? null,
      actor_role: me.role ?? null,
      action: "conversation_started",
      entity_type: "lead",
      entity_id: lead.id ?? null,
      details: { phone, workspace_id: workspace?.id ?? null, delivered: result.ok },
    } as never);

    return { ok: true, error: result.ok ? null : result.error ?? null };
  });



export const listScheduledMessages = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { scheduled: [] };
  const db = await admin();
  const { data } = await db
    .from("scheduled_messages")
    .select("*")
    .order("scheduled_for", { ascending: true })
    .limit(500);
  return { scheduled: data ?? [] };
});

export const scheduleMessage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        phone: z.string().min(1).max(60),
        message: z.string().min(1).max(4000),
        scheduledFor: z.string().min(1),
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
    const when = new Date(data.scheduledFor);
    if (isNaN(when.getTime())) return { ok: false, error: "Invalid date" };
    if (when.getTime() < Date.now() - 60_000) return { ok: false, error: "Scheduled time must be in the future" };
    const db = await admin();
    const { error } = await db.from("scheduled_messages").insert({
      phone_number: data.phone,
      message_content: data.message,
      scheduled_for: when.toISOString(),
      status: "pending",
      created_by: me.email ?? "Agent",
    } as never);
    return { ok: !error, error: error?.message ?? null };
  });

export const cancelScheduledMessage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(ANY_ROLE);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { error } = await db
      .from("scheduled_messages")
      .update({ status: "cancelled" } as never)
      .eq("id", data.id)
      .eq("status", "pending");
    return { ok: !error, error: error?.message ?? null };
  });

/* ----------------------- CHATWOOT WORKSPACES -------------------- */

export const listWorkspaces = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { workspaces: [] };
  const db = await admin();
  const { data } = await db
    .from("chatwoot_workspaces")
    .select("*")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });
  // Never expose API tokens to the browser.
  const workspaces = (data ?? []).map((w: Record<string, unknown>) => ({
    ...w,
    chatwoot_api_token: w.chatwoot_api_token ? "********" : null,
  }));
  return { workspaces };
});

const workspaceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  chatwoot_url: z.string().max(500).nullable().optional(),
  chatwoot_account_id: z.string().max(100).nullable().optional(),
  chatwoot_inbox_id: z.string().max(100).nullable().optional(),
  chatwoot_api_token: z.string().max(500).nullable().optional(),
  enabled: z.boolean().optional(),
  is_default: z.boolean().optional(),
  use_shared_ai: z.boolean().optional(),
});

export const upsertWorkspace = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => workspaceSchema.parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { id, ...rest } = data;
    // Don't overwrite a stored token with the masked placeholder or empty value.
    const token = rest.chatwoot_api_token;
    if (token === "" || token === "********" || token === undefined) {
      delete (rest as Record<string, unknown>).chatwoot_api_token;
    }
    // Ensure only one default workspace.
    if (rest.is_default) {
      await db
        .from("chatwoot_workspaces")
        .update({ is_default: false } as never)
        .neq("id", id ?? "00000000-0000-0000-0000-000000000000");
    }
    if (id) {
      const { error } = await db.from("chatwoot_workspaces").update(rest as never).eq("id", id);
      return { ok: !error, error: error?.message ?? null };
    }
    const { error } = await db.from("chatwoot_workspaces").insert(rest as never);
    return { ok: !error, error: error?.message ?? null };
  });

export const deleteWorkspace = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { error } = await db.from("chatwoot_workspaces").delete().eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

/* ===================== ORCHESTRATION: RESPONDER AGENTS ===================== */

const SUPER = ["super_admin"] as AppRole[];

async function isSuper(): Promise<boolean> {
  const { getRequestUser } = await import("@/integrations/supabase/role-guard.server");
  const u = await getRequestUser();
  return u?.role === "super_admin";
}

export const listResponderAgents = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isSuper())) return { agents: [] };
  const db = await admin();
  const { DEFAULT_AGENT_ID } = await import("./orchestration");

  // Synthesize the built-in default qualification agent so it appears and can be
  // routed alongside custom responder agents. It is managed in AI Settings.
  const { data: cfg } = await db
    .from("ai_configuration")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const c = cfg as Record<string, unknown> | null;
  const defaultAgent = {
    id: DEFAULT_AGENT_ID,
    name: "Default Qualification Agent",
    description: "The main admissions agent configured in AI Settings.",
    workspace_id: null,
    system_prompt: String(c?.system_prompt ?? ""),
    model: String(c?.model ?? "google/gemini-3-flash-preview"),
    temperature: Number(c?.temperature ?? 0.7),
    provider_mode: "inherit",
    custom_provider: null,
    custom_base_url: null,
    custom_model: null,
    custom_api_key: null,
    inherit_variables: true,
    enabled: true,
    is_default: true,
  };

  const { data } = await db.from("responder_agents").select("*").order("created_at", { ascending: true });
  // Never expose stored API keys to the browser.
  const agents = (data ?? []).map((a: Record<string, unknown>) => ({
    ...a,
    is_default: false,
    custom_api_key: a.custom_api_key ? "********" : null,
  }));
  return { agents: [defaultAgent, ...agents] };
});


const responderAgentSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  workspace_id: z.string().uuid().nullable().optional(),
  system_prompt: z.string().max(50000),
  model: z.string().min(1).max(100),
  temperature: z.number().min(0).max(2),
  provider_mode: z.enum(["inherit", "built_in", "custom"]),
  custom_provider: z.string().max(100).nullable().optional(),
  custom_base_url: z.string().max(500).nullable().optional(),
  custom_model: z.string().max(200).nullable().optional(),
  custom_api_key: z.string().max(500).nullable().optional(),
  inherit_variables: z.boolean(),
  enabled: z.boolean(),
});

export const upsertResponderAgent = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => responderAgentSchema.parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(SUPER);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const { DEFAULT_AGENT_ID } = await import("./orchestration");
    if (data.id === DEFAULT_AGENT_ID) {
      return { ok: false, error: "The default agent is managed in AI Settings." };
    }
    const db = await admin();
    const { id, ...rest } = data;
    const key = rest.custom_api_key;
    if (key === "" || key === "********" || key === undefined) {
      delete (rest as Record<string, unknown>).custom_api_key;
    }
    if (id) {
      const { error } = await db.from("responder_agents").update(rest as never).eq("id", id);
      return { ok: !error, error: error?.message ?? null };
    }
    const { data: created, error } = await db.from("responder_agents").insert(rest as never).select("id").single();
    return { ok: !error, error: error?.message ?? null, id: (created as { id?: string } | null)?.id };
  });

export const deleteResponderAgent = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(SUPER);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const { DEFAULT_AGENT_ID } = await import("./orchestration");
    if (data.id === DEFAULT_AGENT_ID) {
      return { ok: false, error: "The default agent cannot be deleted." };
    }
    const db = await admin();
    const { error } = await db.from("responder_agents").delete().eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

/* ----------------- responder agent variables ----------------- */

export const listResponderAgentVariables = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ agentId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await isSuper())) return { variables: [] };
    const db = await admin();
    const { data: rows } = await db
      .from("responder_agent_variables")
      .select("*")
      .eq("agent_id", data.agentId)
      .order("variable_name", { ascending: true });
    return { variables: rows ?? [] };
  });

export const upsertResponderAgentVariable = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        agent_id: z.string().uuid(),
        variable_name: z.string().min(1).max(100).regex(/^[A-Z0-9_]+$/),
        variable_value: z.string().max(2000),
        description: z.string().max(500).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(SUPER);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { id, ...rest } = data;
    if (id) {
      const { error } = await db.from("responder_agent_variables").update(rest as never).eq("id", id);
      return { ok: !error, error: error?.message ?? null };
    }
    const { error } = await db.from("responder_agent_variables").insert(rest as never);
    return { ok: !error, error: error?.message ?? null };
  });

export const deleteResponderAgentVariable = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(SUPER);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { error } = await db.from("responder_agent_variables").delete().eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

/* ===================== ORCHESTRATION: WORKFLOWS ===================== */

export const listWorkflows = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isSuper())) return { workflows: [] };
  const db = await admin();
  const { data } = await db.from("workflows").select("*").order("created_at", { ascending: true });
  return { workflows: data ?? [] };
});

export const listWorkflowEnrollments = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isSuper())) return { enrollments: [] };
  const db = await admin();
  const { data } = await db
    .from("workflow_enrollments")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(500);
  return { enrollments: data ?? [] };
});

const workflowSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  workspace_id: z.string().uuid().nullable().optional(),
  agent_id: z.string().uuid().nullable().optional(),
  trigger_type: z
    .enum([
      "manual",
      "pipeline_stage",
      "time_since_first_message",
      "time_since_last_message",
      "booking_status",
    ])
    .optional(),
  trigger_config: z
    .object({
      segment: z.string().max(100).optional(),
      amount: z.number().min(0).max(100000).optional(),
      unit: z.enum(["seconds", "minutes", "hours", "days"]).optional(),
      status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
    })
    .optional(),
  trigger_segment: z.string().min(1).max(100).optional(),
  enabled: z.boolean(),
  graph: z.any().optional(),
});

export const upsertWorkflow = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => workflowSchema.parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(SUPER);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { id, ...rest } = data;
    const triggerType = rest.trigger_type ?? "manual";
    // Keep the legacy trigger_segment column in sync for backward compatibility.
    rest.trigger_segment =
      triggerType === "pipeline_stage" ? rest.trigger_config?.segment ?? "manual" : "manual";
    if (!rest.trigger_type) rest.trigger_type = triggerType;
    if (!rest.trigger_config) rest.trigger_config = {};
    if (id) {
      const { error } = await db.from("workflows").update(rest as never).eq("id", id);
      return { ok: !error, error: error?.message ?? null };
    }
    const { data: created, error } = await db.from("workflows").insert(rest as never).select("id").single();
    return { ok: !error, error: error?.message ?? null, id: (created as { id?: string } | null)?.id };
  });

export const seedMeetingOutcomeWorkflows = createServerFn({ method: "POST" }).handler(async () => {
  try {
    await guard(["super_admin", "admin"]);
  } catch (e) {
    return { ok: false, error: (e as Error).message, created: 0 };
  }
  const { ensureMeetingOutcomeWorkflows } = await import("./admissions.server");
  const res = await ensureMeetingOutcomeWorkflows();
  return { ok: true, error: null, created: res.created };
});


export const deleteWorkflow = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(SUPER);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { error } = await db.from("workflows").delete().eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

/* Lightweight list of enabled workflows (id + name) usable by any role so
   agents can assign a workflow to a lead from the Bookings tab. */
export const listActiveWorkflows = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { workflows: [] };
  const db = await admin();
  const { data } = await db
    .from("workflows")
    .select("id, name, enabled")
    .eq("enabled", true)
    .order("name", { ascending: true });
  return { workflows: (data ?? []) as Array<{ id: string; name: string }> };
});

/* Assign and immediately trigger a workflow for a lead by phone. Agents, admins
   and super admins may do this from the Bookings tab. Sends the first message now. */
export const triggerLeadWorkflow = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        workflowId: z.string().uuid(),
        phone: z.string().min(1).max(60),
        workspaceId: z.string().uuid().nullable().optional(),
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
    const db = await admin();
    const { data: wf } = await db
      .from("workflows")
      .select("id, name, enabled")
      .eq("id", data.workflowId)
      .maybeSingle();
    const workflow = wf as { id: string; name: string; enabled: boolean } | null;
    if (!workflow) return { ok: false, error: "Workflow not found" };
    if (!workflow.enabled) return { ok: false, error: "This workflow is disabled" };

    const { data: lead } = await db
      .from("leads")
      .select("id")
      .eq("phone_number", data.phone)
      .maybeSingle();

    const { enrollLeadInWorkflowByName } = await import("./admissions.server");
    let status: string;
    try {
      const res = await enrollLeadInWorkflowByName({
        workflowName: workflow.name,
        phone: data.phone,
        leadId: (lead as { id?: string } | null)?.id ?? null,
        workspaceId: data.workspaceId ?? null,
        sendNow: true,
      });
      status = res.status;
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Failed to trigger workflow" };
    }

    if (status === "no_workflow") return { ok: false, error: "Workflow has no message steps configured" };
    if (status === "already_enrolled") return { ok: false, error: "Lead is already enrolled in this workflow" };

    await db.from("audit_logs").insert({
      actor_email: me.email ?? null,
      actor_role: me.role ?? null,
      action: "workflow_triggered",
      entity_type: "lead",
      entity_id: (lead as { id?: string } | null)?.id ?? null,
      details: { phone: data.phone, workflow: workflow.name },
    } as never);

    return { ok: true, error: null, status };
  });

/* ===================== MEETING OUTCOMES ===================== */

const MEETING_ROLES = ["super_admin", "admin"] as AppRole[];

async function isAdminOrSuper(): Promise<boolean> {
  const { getRequestUser } = await import("@/integrations/supabase/role-guard.server");
  const u = await getRequestUser();
  return u?.role === "super_admin" || u?.role === "admin";
}

export const listMeetingOutcomes = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAdminOrSuper())) return { outcomes: [] };
  const db = await admin();
  const { data } = await db
    .from("meeting_outcomes")
    .select("*")
    .order("meeting_date", { ascending: false })
    .limit(500);
  return { outcomes: data ?? [] };
});

const meetingOutcomeSchema = z.object({
  lead_id: z.string().uuid(),
  meeting_date: z.string().min(1).optional(),
  outcome: z.enum([
    "ready_to_pay",
    "parent_discussion",
    "financial_delay",
    "future_applicant",
    "not_qualified",
  ]),
  commitment_level: z.enum(["high", "medium", "low"]).nullable().optional(),
  main_obstacle: z.string().max(100).nullable().optional(),
  next_action: z.string().max(100).nullable().optional(),
  follow_up_date: z.string().max(40).nullable().optional(),
  internal_notes: z.string().max(5000).nullable().optional(),
  workspace_id: z.string().uuid().nullable().optional(),
});

export const saveMeetingOutcome = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => meetingOutcomeSchema.parse(d))
  .handler(async ({ data }) => {
    let me;
    try {
      me = await guard(MEETING_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }

    const { findOutcome } = await import("./meeting-outcomes");
    const mapping = findOutcome(data.outcome);
    if (!mapping) return { ok: false, error: "Unknown outcome" };

    const db = await admin();

    // Look up the lead so name/phone are authoritative (read-only on the client).
    const { data: lead } = await db
      .from("leads")
      .select("id, phone_number, lead_name")
      .eq("id", data.lead_id)
      .maybeSingle();
    const leadRow = lead as { id: string; phone_number: string; lead_name: string | null } | null;
    if (!leadRow) return { ok: false, error: "Lead not found" };

    // 1. Enroll the lead into the corresponding follow-up workflow (best-effort).
    // The first message is deferred until the 1-minute edit window ends so staff
    // can correct the outcome before anything is sent. The pending enrollment is
    // advanced by the workflow processor (triggered client-side at the end of the
    // countdown and by the cron job as a fallback).
    const { enrollLeadInWorkflowByName, ensureMeetingOutcomeWorkflows } = await import("./admissions.server");
    let workflowStatus = "no_workflow";
    try {
      await ensureMeetingOutcomeWorkflows();
      const res = await enrollLeadInWorkflowByName({
        workflowName: mapping.workflow,
        phone: leadRow.phone_number,
        leadId: leadRow.id,
        workspaceId: data.workspace_id ?? null,
        sendNow: false,
        startDelayMs: OUTCOME_EDIT_WINDOW_MS,
      });
      workflowStatus = res.status;
    } catch (e) {
      console.error("Workflow enrollment failed:", e);
    }


    // 2. Store the meeting outcome.
    const meetingDate = data.meeting_date ? new Date(data.meeting_date) : new Date();
    const { data: inserted, error: insertErr } = await db
      .from("meeting_outcomes")
      .insert({
        lead_id: leadRow.id,
        phone_number: leadRow.phone_number,
        lead_name: leadRow.lead_name,
        meeting_date: isNaN(meetingDate.getTime()) ? new Date().toISOString() : meetingDate.toISOString(),
        outcome: data.outcome,
        commitment_level: data.commitment_level ?? null,
        main_obstacle: data.main_obstacle ?? null,
        next_action: data.next_action ?? null,
        follow_up_date: data.follow_up_date || null,
        internal_notes: data.internal_notes ?? null,
        workflow_triggered: mapping.workflow,
        recorded_by: me.email ?? "Admissions Team",
      } as never)
      .select("id")
      .single();
    if (insertErr) return { ok: false, error: insertErr.message };

    // 3. Update the lead's stage automatically.
    await db
      .from("leads")
      .update({ qualification_status: mapping.stage } as never)
      .eq("id", leadRow.id);

    // 4. Log the action in the audit trail.
    await db.from("audit_logs").insert({
      actor_email: me.email ?? null,
      actor_role: me.role ?? null,
      action: "meeting_outcome_recorded",
      entity_type: "lead",
      entity_id: leadRow.id,
      details: {
        outcome: data.outcome,
        outcome_label: mapping.label,
        new_stage: mapping.stage,
        workflow: mapping.workflow,
        workflow_status: workflowStatus,
        commitment_level: data.commitment_level ?? null,
        main_obstacle: data.main_obstacle ?? null,
        next_action: data.next_action ?? null,
        follow_up_date: data.follow_up_date ?? null,
        outcome_id: (inserted as { id?: string } | null)?.id ?? null,
      },
    } as never);

    return { ok: true, error: null, workflowStatus, stage: mapping.stage };
  });

// Window (ms) during which a recorded outcome can still be edited after submission.
const OUTCOME_EDIT_WINDOW_MS = 60_000;

const updateMeetingOutcomeSchema = z.object({
  id: z.string().uuid(),
  outcome: z.enum([
    "ready_to_pay",
    "parent_discussion",
    "financial_delay",
    "future_applicant",
    "not_qualified",
  ]),
  commitment_level: z.enum(["high", "medium", "low"]).nullable().optional(),
  main_obstacle: z.string().max(100).nullable().optional(),
  next_action: z.string().max(100).nullable().optional(),
  follow_up_date: z.string().max(40).nullable().optional(),
  internal_notes: z.string().max(5000).nullable().optional(),
});

export const updateMeetingOutcome = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => updateMeetingOutcomeSchema.parse(d))
  .handler(async ({ data }) => {
    let me;
    try {
      me = await guard(MEETING_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }

    const db = await admin();
    const { data: existing } = await db
      .from("meeting_outcomes")
      .select("id, lead_id, phone_number, outcome, workflow_triggered, created_at")
      .eq("id", data.id)
      .maybeSingle();
    const row = existing as
      | {
          id: string;
          lead_id: string | null;
          phone_number: string;
          outcome: string;
          workflow_triggered: string | null;
          created_at: string;
        }
      | null;
    if (!row) return { ok: false, error: "Outcome not found" };

    // Enforce the 1-minute edit window.
    const age = Date.now() - new Date(row.created_at).getTime();
    if (age > OUTCOME_EDIT_WINDOW_MS) {
      return { ok: false, error: "This outcome can no longer be edited (1 minute window passed)." };
    }

    const { findOutcome } = await import("./meeting-outcomes");
    const mapping = findOutcome(data.outcome);
    if (!mapping) return { ok: false, error: "Unknown outcome" };

    const { error: updErr } = await db
      .from("meeting_outcomes")
      .update({
        outcome: data.outcome,
        commitment_level: data.commitment_level ?? null,
        main_obstacle: data.main_obstacle ?? null,
        next_action: data.next_action ?? null,
        follow_up_date: data.follow_up_date || null,
        internal_notes: data.internal_notes ?? null,
        workflow_triggered: mapping.workflow,
      } as never)
      .eq("id", data.id);
    if (updErr) return { ok: false, error: updErr.message };

    // Keep the lead stage in sync with the (possibly changed) outcome.
    if (row.lead_id) {
      await db
        .from("leads")
        .update({ qualification_status: mapping.stage } as never)
        .eq("id", row.lead_id);
    }

    // If the outcome changed, re-point the still-pending follow-up workflow so the
    // correct sequence fires when the edit window ends. The enrollment is only
    // re-created when the original message has not been sent yet (current_step 0).
    if (row.workflow_triggered !== mapping.workflow && row.phone_number) {
      try {
        const { enrollLeadInWorkflowByName } = await import("./admissions.server");
        await db
          .from("workflow_enrollments")
          .delete()
          .eq("phone_number", row.phone_number)
          .eq("current_step", 0)
          .eq("status", "active");
        const remaining = Math.max(0, OUTCOME_EDIT_WINDOW_MS - age);
        await enrollLeadInWorkflowByName({
          workflowName: mapping.workflow,
          phone: row.phone_number,
          leadId: row.lead_id ?? null,
          sendNow: false,
          startDelayMs: remaining,
        });
      } catch (e) {
        console.error("Re-enrollment after outcome edit failed:", e);
      }
    }

    await db.from("audit_logs").insert({
      actor_email: me.email ?? null,
      actor_role: me.role ?? null,
      action: "meeting_outcome_edited",
      entity_type: "meeting_outcome",
      entity_id: data.id,
      details: {
        previous_outcome: row.outcome,
        outcome: data.outcome,
        new_stage: mapping.stage,
      },
    } as never);

    return { ok: true, error: null };
  });


export const getMeetingOutcomeStats = createServerFn({ method: "GET" }).handler(async () => {
  const empty = {
    meetingsThisWeek: 0,
    readyToPay: 0,
    parentDiscussion: 0,
    financialDelay: 0,
    futureApplicants: 0,
    conversionForecast: 0,
  };
  if (!(await isAdminOrSuper())) return empty;

  const db = await admin();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await db
    .from("meeting_outcomes")
    .select("outcome, commitment_level, meeting_date")
    .gte("meeting_date", weekAgo)
    .limit(2000);

  const rows = (data ?? []) as Array<{ outcome: string; commitment_level: string | null }>;
  const { MEETING_OUTCOMES, COMMITMENT_WEIGHTS } = await import("./meeting-outcomes");

  let forecast = 0;
  const counts: Record<string, number> = {};
  for (const r of rows) {
    counts[r.outcome] = (counts[r.outcome] ?? 0) + 1;
    const base = MEETING_OUTCOMES.find((o) => o.value === r.outcome)?.weight ?? 0;
    const mult = r.commitment_level ? COMMITMENT_WEIGHTS[r.commitment_level] ?? 0.7 : 0.7;
    forecast += base * mult;
  }

  return {
    meetingsThisWeek: rows.length,
    readyToPay: counts["ready_to_pay"] ?? 0,
    parentDiscussion: counts["parent_discussion"] ?? 0,
    financialDelay: counts["financial_delay"] ?? 0,
    futureApplicants: counts["future_applicant"] ?? 0,
    conversionForecast: Math.round(forecast),
  };
});

/* Delete a recorded meeting outcome. Super-admin only. */
export const deleteMeetingOutcome = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    let me;
    try {
      me = await guard(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const { error } = await db.from("meeting_outcomes").delete().eq("id", data.id);
    if (error) return { ok: false, error: error.message };
    await db.from("audit_logs").insert({
      actor_email: me.email ?? null,
      actor_role: me.role ?? null,
      action: "meeting_outcome_deleted",
      entity_type: "meeting_outcome",
      entity_id: data.id,
      details: {},
    } as never);
    return { ok: true, error: null };
  });

/* Run the workflow processor on demand. Used to fire a meeting-outcome follow-up
   the moment the 1-minute edit countdown ends, instead of waiting for the cron. */
export const processDueWorkflows = createServerFn({ method: "POST" }).handler(async () => {
  try {
    await guard(["super_admin", "admin"]);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  try {
    const { processWorkflows } = await import("./admissions.server");
    const res = await processWorkflows();
    return { ok: true, error: null, ...res };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
});

/* Per-phone workflow state used to show pause/resume controls. Returns a list of
   phone numbers that currently have an active or paused workflow enrollment. */
export const listWorkflowStates = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAdminOrSuper())) return { states: [] };
  const db = await admin();
  const { data } = await db
    .from("workflow_enrollments")
    .select("phone_number, status")
    .in("status", ["active", "paused"])
    .limit(2000);
  const byPhone = new Map<string, "active" | "paused">();
  for (const r of (data as Array<{ phone_number: string; status: string }>) ?? []) {
    const cur = byPhone.get(r.phone_number);
    // Active wins over paused so resuming any sequence is reflected.
    if (r.status === "active" || cur !== "active") {
      byPhone.set(r.phone_number, r.status === "active" ? "active" : "paused");
    }
  }
  return { states: Array.from(byPhone.entries()).map(([phone_number, status]) => ({ phone_number, status })) };
});

/* Pause or resume every active/paused workflow enrollment for a lead. Admin + super. */
export const pauseLeadWorkflow = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ phone: z.string().min(1).max(60), paused: z.boolean() }).parse(d),
  )
  .handler(async ({ data }) => {
    let me;
    try {
      me = await guard(["super_admin", "admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await admin();
    const from = data.paused ? "active" : "paused";
    const to = data.paused ? "paused" : "active";
    const { error } = await db
      .from("workflow_enrollments")
      .update({ status: to } as never)
      .eq("phone_number", data.phone)
      .eq("status", from);
    if (error) return { ok: false, error: error.message };
    await db.from("audit_logs").insert({
      actor_email: me.email ?? null,
      actor_role: me.role ?? null,
      action: data.paused ? "workflow_paused" : "workflow_resumed",
      entity_type: "lead",
      details: { phone: data.phone },
    } as never);
    return { ok: true, error: null };
  });

/* Contacts directory — everyone who has been contacted (name + phone). Any role. */
export const listContacts = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { contacts: [] };
  const db = await admin();
  const { data } = await db
    .from("leads")
    .select("id, lead_name, phone_number, course_interest, country_interest, created_at")
    .order("created_at", { ascending: false })
    .limit(2000);
  return { contacts: data ?? [] };
});



