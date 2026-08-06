import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ALL_ROLES, type AppRole } from "@/lib/roles";

/* ----------------------- shared server helpers ----------------------- */

async function spaceCtx() {
  const { resolveSpaceContext } = await import("./space-context.server");
  return resolveSpaceContext();
}

async function scopedDb() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { makeScopedClient, NO_SPACE } = await import("./space-context.server");
  const ctx = await spaceCtx();
  const sid = ctx && (ctx.isSuperAdmin || ctx.status === "active") ? ctx.spaceId : NO_SPACE;
  return makeScopedClient(supabaseAdmin, sid);
}

async function guard(allowed: AppRole[]) {
  const { assertRole } = await import("@/integrations/supabase/role-guard.server");
  return assertRole(allowed);
}

async function currentUser() {
  const { getRequestUser } = await import("@/integrations/supabase/role-guard.server");
  return getRequestUser();
}

async function activeSpaceId(): Promise<string | null> {
  const ctx = await spaceCtx();
  if (!ctx) return null;
  if (ctx.status === "suspended" && !ctx.isSuperAdmin) return null;
  return ctx.spaceId;
}

async function isAuthed(): Promise<boolean> {
  const u = await currentUser();
  return Boolean(u?.role);
}

const ANY_ROLE = ALL_ROLES;

/* ============================ CALENDAR SETTINGS ============================ */

export interface CalendarSettings {
  id?: string;
  provider: "manual" | "calcom" | "google";
  slot_duration_minutes: number;
  buffer_minutes: number;
  working_days: number[]; // JS getDay(): 0 = Sunday … 6 = Saturday
  working_start: string; // "HH:MM" 24h
  working_end: string;
  timezone: string;
  calcom_username?: string | null;
  calcom_event_slug?: string | null;
  calcom_api_key?: string | null;
  google_calendar_id?: string | null;
  google_api_key?: string | null;
}

const DEFAULTS: CalendarSettings = {
  provider: "manual",
  slot_duration_minutes: 30,
  buffer_minutes: 0,
  working_days: [1, 2, 3, 4, 5],
  working_start: "09:00",
  working_end: "18:00",
  timezone: "UTC",
  calcom_username: null,
  calcom_event_slug: null,
  calcom_api_key: null,
  google_calendar_id: null,
  google_api_key: null,
};

export const getCalendarSettings = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { settings: DEFAULTS };
  const db = await scopedDb();
  const { data } = await db.from("calendar_settings").select("*").limit(1).maybeSingle();
  return { settings: (data as CalendarSettings | null) ?? DEFAULTS };
});

const calendarSchema = z.object({
  id: z.string().uuid().optional(),
  provider: z.enum(["manual", "calcom", "google"]),
  slot_duration_minutes: z.number().int().min(10).max(240),
  buffer_minutes: z.number().int().min(0).max(240),
  working_days: z.array(z.number().int().min(0).max(6)),
  working_start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  working_end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  timezone: z.string().max(100),
  calcom_username: z.string().max(200).nullable().optional(),
  calcom_event_slug: z.string().max(200).nullable().optional(),
  calcom_api_key: z.string().max(500).nullable().optional(),
  google_calendar_id: z.string().max(300).nullable().optional(),
  google_api_key: z.string().max(500).nullable().optional(),
});

export const saveCalendarSettings = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => calendarSchema.parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(["super_admin", "admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { id, ...rest } = data;
    // Never overwrite stored secrets with empty strings.
    for (const f of ["calcom_api_key", "google_api_key"] as const) {
      if (rest[f] === "" || rest[f] === undefined) delete (rest as Record<string, unknown>)[f];
    }
    if (id) {
      const { error } = await db.from("calendar_settings").update(rest as never).eq("id", id);
      return { ok: !error, error: error?.message ?? null };
    }
    const { error } = await db.from("calendar_settings").insert(rest as never);
    return { ok: !error, error: error?.message ?? null };
  });

/* ============================ AVAILABILITY SLOTS ============================ */

interface Slot {
  start: string; // ISO 8601
  end: string; // ISO 8601
}

// Minutes offset of `dateStr` (YYYY-MM-DD) at noon relative to UTC.
function tzOffsetMinutes(dateStr: string, tz: string): number {
  try {
    const dt = new Date(`${dateStr}T12:00:00Z`);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(dt);
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
    const h = get("hour") % 24;
    const local = Date.UTC(get("year"), get("month") - 1, get("day"), h, get("minute"));
    return Math.round((local - dt.getTime()) / 60000);
  } catch {
    return 0;
  }
}

function parseHM(s: string): number {
  const [h, m] = s.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function fmtHM(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function buildSlots(dateStr: string, s: CalendarSettings): { startMs: number }[] {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const dow = new Date(Date.UTC(y, mo - 1, d, 12)).getUTCDay();
  if (!(s.working_days ?? []).includes(dow)) return [];
  const offset = tzOffsetMinutes(dateStr, s.timezone || "UTC");
  const start = parseHM(s.working_start || "09:00");
  const end = parseHM(s.working_end || "18:00");
  const duration = Math.max(10, s.slot_duration_minutes || 30);
  const buffer = Math.max(0, s.buffer_minutes || 0);
  const dayStartUtc = Date.UTC(y, mo - 1, d, 0, 0) - offset * 60000;
  const wallStart = dayStartUtc + start * 60000;
  const wallEnd = dayStartUtc + end * 60000;
  const slots: { startMs: number }[] = [];
  let t = wallStart;
  while (t + duration * 60000 <= wallEnd) {
    slots.push({ startMs: t });
    t += (duration + buffer) * 60000;
  }
  return slots;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

async function googleBusyRanges(
  calId: string,
  apiKey: string,
  fromMs: number,
  toMs: number,
): Promise<Array<{ start: number; end: number }>> {
  try {
    const url =
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events` +
      `?key=${encodeURIComponent(apiKey)}&singleEvents=true&timeMin=${new Date(fromMs).toISOString()}` +
      `&timeMax=${new Date(toMs).toISOString()}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      items?: Array<{
        status?: string;
        start?: { dateTime?: string; date?: string };
        end?: { dateTime?: string; date?: string };
      }>;
    };
    return ((data.items ?? [])
      .filter((i) => i.status !== "cancelled")
      .map((i) => {
        const s = i.start?.dateTime ?? i.start?.date;
        const e = i.end?.dateTime;
        if (!s || !e) return null;
        const sMs = Date.parse(s);
        const eMs = Date.parse(e);
        if (isNaN(sMs) || isNaN(eMs)) return null;
        return { start: sMs, end: eMs };
      })
      .filter((x): x is { start: number; end: number } => x !== null));
  } catch {
    return [];
  }
}

export const getAvailableSlots = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), timezone: z.string().max(100).optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await isAuthed())) return { slots: [], error: "Unauthorized" };
    const db = await scopedDb();
    const { data: row } = await db.from("calendar_settings").select("*").limit(1).maybeSingle();
    const settings: CalendarSettings = (row as CalendarSettings | null) ?? DEFAULTS;

    const [y, mo, d] = data.date.split("-").map(Number);
    const offset = tzOffsetMinutes(data.date, settings.timezone || "UTC");
    const dayStartUtc = Date.UTC(y, mo - 1, d, 0, 0) - offset * 60000;
    const dayEndUtc = dayStartUtc + 24 * 60 * 60 * 1000;

    const duration = Math.max(10, settings.slot_duration_minutes || 30);

    // Exclude slots already booked in this app.
    const { data: appts } = await db
      .from("appointments")
      .select("appointment_date, status")
      .gte("appointment_date", new Date(dayStartUtc).toISOString())
      .lt("appointment_date", new Date(dayEndUtc).toISOString());
    const booked = ((appts ?? []) as Array<{ appointment_date: string; status: string }>)
      .filter((a) => a.status !== "cancelled" && a.status !== "canceled")
      .map((a) => {
        const s = Date.parse(a.appointment_date);
        return { start: s, end: s + duration * 60000 };
      });

    // Exclude busy events from Google Calendar (public calendars via API key).
    let busy: Array<{ start: number; end: number }> = [];
    if (
      settings.provider === "google" &&
      settings.google_calendar_id &&
      settings.google_api_key
    ) {
      busy = await googleBusyRanges(settings.google_calendar_id, settings.google_api_key, dayStartUtc, dayEndUtc);
    }

    const now = Date.now();
    const slots: Slot[] = buildSlots(data.date, settings)
      .filter((s) => s.startMs + duration * 60000 > now) // drop past slots (today)
      .filter((s) => {
        const end = s.startMs + duration * 60000;
        if (busy.some((b) => overlaps(s.startMs, end, b.start, b.end))) return false;
        if (booked.some((b) => overlaps(s.startMs, end, b.start, b.end))) return false;
        return true;
      })
      .map((s) => ({
        start: new Date(s.startMs).toISOString(),
        end: new Date(s.startMs + duration * 60000).toISOString(),
      }));

    return {
      slots,
      provider: settings.provider,
      calcomLink:
        settings.provider === "calcom" && settings.calcom_username && settings.calcom_event_slug
          ? `https://cal.com/${encodeURIComponent(settings.calcom_username)}/${encodeURIComponent(settings.calcom_event_slug)}`
          : null,
    };
  });

/* ============================ APPOINTMENTS ============================ */

/** Creates an appointment record (no message is sent). */
export const createAppointment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        phone: z.string().min(3).max(60),
        lead_name: z.string().max(200).nullable().optional(),
        appointment_date: z.string(),
        appointment_type: z.string().max(100).optional(),
        notes: z.string().max(2000).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(ANY_ROLE);
    } catch (e) {
      return { ok: false, error: (e as Error).message, id: null };
    }
    const db = await scopedDb();
    const { data: inserted, error } = await db
      .from("appointments")
      .insert({
        phone_number: data.phone,
        lead_name: data.lead_name ?? null,
        appointment_date: new Date(data.appointment_date).toISOString(),
        appointment_type: data.appointment_type ?? "booking",
        status: "pending",
        notes: data.notes ?? null,
      } as never)
      .select("id")
      .maybeSingle();
    return {
      ok: !error,
      error: error?.message ?? null,
      id: (inserted as { id?: string } | null)?.id ?? null,
    };
  });

/** Books an appointment from the chat AND sends the lead a confirmation message. */
export const bookAppointmentFromChat = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        phone: z.string().min(3).max(60),
        lead_name: z.string().max(200).nullable().optional(),
        appointment_date: z.string(),
        appointment_type: z.string().max(100).optional(),
        notes: z.string().max(2000).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    let me;
    try {
      me = await guard(ANY_ROLE);
    } catch (e) {
      return { ok: false, error: (e as Error).message, id: null };
    }
    const { runInSpace } = await import("./space-context.server");
    const sid = await activeSpaceId();
    if (!sid) return { ok: false, error: "No active space.", id: null };

    const { deliverHumanMessage } = await import("./admissions.server");
    const appointmentDate = new Date(data.appointment_date).toISOString();

    let bookingOk = true;
    let bookingId: string | null = null;
    await runInSpace(sid, async () => {
      const db = await scopedDb();
      const { data: inserted, error } = await db
        .from("appointments")
        .insert({
          phone_number: data.phone,
          lead_name: data.lead_name ?? null,
          appointment_date: appointmentDate,
          appointment_type: data.appointment_type ?? "booking",
          status: "pending",
          notes: data.notes ?? null,
        } as never)
        .select("id")
        .maybeSingle();
      bookingOk = !error;
      bookingId = (inserted as { id?: string } | null)?.id ?? null;

      if (bookingOk) {
        // Friendly confirmation sent straight into the conversation.
        const { data: calRow } = await db.from("calendar_settings").select("timezone").limit(1).maybeSingle();
        const tz = ((calRow as { timezone?: string } | null)?.timezone ?? "UTC") || "UTC";
        const label = new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          dateStyle: "full",
          timeStyle: "short",
        }).format(new Date(appointmentDate));
        const msg =
          `📅 *Your call is booked!*\n\n` +
          `Hi ${data.lead_name || "there"}, your consultation is scheduled for:\n` +
          `🗓️ ${label}\n\n` +
          `We'll reach out to confirm the details. See you then!`;
        await deliverHumanMessage({
          phone: data.phone,
          message: msg,
          workspaceId: null,
          actor: me.email ?? "Agent",
        });
      }
    });
    return { ok: bookingOk, error: bookingOk ? null : "Failed to book the appointment.", id: bookingId };
  });

/* ============================ JITSI VIDEO SETTINGS ============================ */

export interface JitsiSettings {
  id?: string;
  enabled: boolean;
  server_url: string;
  display_name: string;
  room_prefix: string;
}

const JITSI_DEFAULTS: JitsiSettings = {
  enabled: true,
  server_url: "https://meet.jit.si",
  display_name: "Admissions",
  room_prefix: "admissions",
};

export const getJitsiSettings = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { settings: JITSI_DEFAULTS };
  const db = await scopedDb();
  const { data } = await db.from("jitsi_settings").select("*").limit(1).maybeSingle();
  return { settings: (data as JitsiSettings | null) ?? JITSI_DEFAULTS };
});

const jitsiSchema = z.object({
  id: z.string().uuid().optional(),
  enabled: z.boolean(),
  server_url: z.string().min(3).max(300),
  display_name: z.string().min(1).max(100),
  room_prefix: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only"),
});

export const saveJitsiSettings = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => jitsiSchema.parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(["super_admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { id, ...rest } = data;
    const cleanServer = String(rest.server_url ?? "").replace(/\/+$/, "");
    const payload = { ...rest, server_url: cleanServer } as never;
    if (id) {
      const { error } = await db.from("jitsi_settings").update(payload).eq("id", id);
      return { ok: !error, error: error?.message ?? null };
    }
    const { error } = await db.from("jitsi_settings").insert(payload);
    return { ok: !error, error: error?.message ?? null };
  });
