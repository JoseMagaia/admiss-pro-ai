import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/* ----------------------------- LEADS ----------------------------- */

export const listLeads = createServerFn({ method: "GET" }).handler(async () => {
  const db = await admin();
  const { data, error } = await db.from("leads").select("*").order("updated_at", { ascending: false }).limit(1000);
  if (error) return { leads: [], error: error.message };
  return { leads: data ?? [], error: null };
});

export const updateLeadStage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), stage: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.from("leads").update({ qualification_status: data.stage } as never).eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

export const toggleHumanTakeover = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ phone: z.string().min(1), enabled: z.boolean() }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db
      .from("conversations")
      .update({
        human_takeover: data.enabled,
        status: data.enabled ? "pending" : "open",
        assigned_agent: data.enabled ? "Admissions Team" : null,
      } as never)
      .eq("phone_number", data.phone);
    return { ok: !error, error: error?.message ?? null };
  });

/* ------------------------- CONVERSATIONS ------------------------- */

export const listConversations = createServerFn({ method: "GET" }).handler(async () => {
  const db = await admin();
  const { data } = await db.from("conversations").select("*").order("updated_at", { ascending: false }).limit(1000);
  return { conversations: data ?? [] };
});

export const listMessages = createServerFn({ method: "GET" }).handler(async () => {
  const db = await admin();
  const { data } = await db.from("whatsapp_messages").select("*").order("received_at", { ascending: true }).limit(1000);
  return { messages: data ?? [] };
});

/* -------------------------- APPOINTMENTS ------------------------- */

export const listAppointments = createServerFn({ method: "GET" }).handler(async () => {
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
    const db = await admin();
    const update: Record<string, unknown> = { status: data.status };
    if (data.appointment_date !== undefined) update.appointment_date = data.appointment_date;
    const { error } = await db.from("appointments").update(update as never).eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

/* ---------------------------- SETTINGS --------------------------- */

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
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

export const updateSettings = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => settingsSchema.parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { id, ...rest } = data;
    if (id) {
      const { error } = await db.from("education_settings").update(rest as never).eq("id", id);
      return { ok: !error, error: error?.message ?? null };
    }
    const { error } = await db.from("education_settings").insert(rest as never);
    return { ok: !error, error: error?.message ?? null };
  });

/* --------------------------- AI CONFIG --------------------------- */

export const getAiConfig = createServerFn({ method: "GET" }).handler(async () => {
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

export const listPromptVersions = createServerFn({ method: "GET" }).handler(async () => {
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
    const db = await admin();
    const { error } = await db.from("ai_variables").delete().eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

/* -------------------------- HTTP ACTIONS ------------------------- */

export const listHttpActions = createServerFn({ method: "GET" }).handler(async () => {
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
