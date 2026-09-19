import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { scopedDb, guard } from "./dashboard-helpers";

/** Cal.com settings for the active space. The API key is never returned. */
export const getCalcomSettings = createServerFn({ method: "GET" }).handler(async () => {
  try {
    await guard(["super_admin"]);
  } catch (e) {
    return { settings: null, error: (e as Error).message };
  }
  const db = await scopedDb();
  const { data } = await db
    .from("education_settings")
    .select("id, calcom_enabled, calcom_api_key, calcom_event_type_id, calcom_timezone, calcom_notify_queue_id")
    .limit(1)
    .maybeSingle();
  const row = (data ?? null) as Record<string, unknown> | null;
  return {
    settings: {
      id: (row?.id as string) ?? null,
      enabled: Boolean(row?.calcom_enabled),
      has_api_key: Boolean(row?.calcom_api_key),
      event_type_id: (row?.calcom_event_type_id as string) ?? "",
      timezone: (row?.calcom_timezone as string) ?? "UTC",
      notify_queue_id: (row?.calcom_notify_queue_id as string) ?? null,
    },
    error: null,
  };
});

export const saveCalcomSettings = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        enabled: z.boolean(),
        /** Omit or leave empty to keep the stored key. */
        api_key: z.string().max(400).optional(),
        event_type_id: z.string().max(40).nullable().optional(),
        timezone: z.string().min(1).max(80).default("UTC"),
        notify_queue_id: z.string().uuid().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { data: existing } = await db.from("education_settings").select("id").limit(1).maybeSingle();

    const row: Record<string, unknown> = {
      calcom_enabled: data.enabled,
      calcom_event_type_id: data.event_type_id || null,
      calcom_timezone: data.timezone,
      calcom_notify_queue_id: data.notify_queue_id ?? null,
    };
    if (data.api_key && data.api_key.trim()) row.calcom_api_key = data.api_key.trim();

    const id = (existing as { id?: string } | null)?.id;
    const { error } = id
      ? await db.from("education_settings").update(row as never).eq("id", id)
      : await db.from("education_settings").insert(row as never);
    return { ok: !error, error: error?.message ?? null };
  });

/** Validate the stored (or supplied) credentials against Cal.com. */
export const testCalcomConnection = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        api_key: z.string().max(400).optional(),
        event_type_id: z.string().max(40),
        timezone: z.string().min(1).max(80).default("UTC"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(["super_admin"]);
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
    const db = await scopedDb();
    let key = data.api_key?.trim() ?? "";
    if (!key) {
      const { data: row } = await db.from("education_settings").select("calcom_api_key").limit(1).maybeSingle();
      key = String((row as { calcom_api_key?: string } | null)?.calcom_api_key ?? "");
    }
    if (!key) return { ok: false, message: "Add a Cal.com API key first." };
    const eventTypeId = Number(data.event_type_id);
    if (!eventTypeId) return { ok: false, message: "Add the Cal.com event type ID (a number)." };

    const { checkCalcomConnection } = await import("./calcom.server");
    return checkCalcomConnection(key, eventTypeId, data.timezone);
  });

/** Free Cal.com times, for the bookings UI preview. */
export const listCalcomSlots = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ days: z.number().int().min(1).max(60).default(14) }).parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(["super_admin", "admin"]);
    } catch (e) {
      return { slots: [], error: (e as Error).message };
    }
    const db = await scopedDb();
    const { loadCalcomConfig, fetchCalcomSlots } = await import("./calcom.server");
    const cfg = await loadCalcomConfig(db);
    if (!cfg) return { slots: [], error: "Cal.com is not set up yet." };
    const today = new Date().toISOString().slice(0, 10);
    const end = new Date(Date.now() + data.days * 86400000).toISOString().slice(0, 10);
    const slots = await fetchCalcomSlots(cfg, today, end, 40);
    return { slots, error: null };
  });
