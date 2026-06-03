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
  if (!(await isAuthed())) return { leads: 0, qualified: 0, bookings: 0, messages: 0 };
  const db = await admin();
  const [{ count: leadsCount }, { count: qualifiedCount }, { count: bookingsCount }, { count: msgCount }] =
    await Promise.all([
      db.from("leads").select("*", { count: "exact", head: true }),
      db.from("leads").select("*", { count: "exact", head: true }).in("qualification_status", ["QUALIFIED", "BOOKING_REQUEST_CREATED"]),
      db.from("appointments").select("*", { count: "exact", head: true }),
      db.from("whatsapp_messages").select("*", { count: "exact", head: true }),
    ]);
  return {
    leads: leadsCount ?? 0,
    qualified: qualifiedCount ?? 0,
    bookings: bookingsCount ?? 0,
    messages: msgCount ?? 0,
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
      .update({ human_takeover: true, status: "pending", assigned_agent: me.email ?? "Agent" } as never)
      .eq("phone_number", data.phone);
    const result = await deliverHumanMessage({ phone: data.phone, message: data.message });
    return { ok: result.ok, error: result.error ?? null };
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
