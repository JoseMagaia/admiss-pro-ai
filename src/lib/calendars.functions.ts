import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { scopedDb, guard, isAuthed, ANY_ROLE } from "./dashboard-helpers";
import {
  computeSlots,
  type AvailabilityRule,
  type CalendarConfig,
  type CalendarException,
} from "./calendar-slots";
import type { AppRole } from "@/lib/roles";

const ADMIN_ROLES: AppRole[] = ["super_admin", "admin"];

/* ------------------------------ CALENDARS ------------------------------ */

export const listCalendars = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { calendars: [], availability: [], exceptions: [] };
  const db = await scopedDb();
  const [{ data: calendars }, { data: availability }, { data: exceptions }] = await Promise.all([
    db.from("calendars").select("*").order("created_at", { ascending: true }),
    db.from("calendar_availability").select("*").order("weekday", { ascending: true }),
    db.from("calendar_exceptions").select("*").order("exception_date", { ascending: true }),
  ]);
  return {
    calendars: calendars ?? [],
    availability: availability ?? [],
    exceptions: exceptions ?? [],
  };
});

export const upsertCalendar = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().min(1).max(120),
        description: z.string().max(500).nullable().optional(),
        color: z.string().max(20).optional().default("#6366f1"),
        timezone: z.string().min(1).max(80).optional().default("UTC"),
        slot_duration_minutes: z.number().int().min(5).max(480).optional().default(30),
        buffer_minutes: z.number().int().min(0).max(240).optional().default(0),
        min_notice_minutes: z.number().int().min(0).max(20160).optional().default(60),
        max_days_ahead: z.number().int().min(1).max(365).optional().default(60),
        is_default: z.boolean().optional().default(false),
        active: z.boolean().optional().default(true),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(ADMIN_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { id, ...row } = data;
    if (row.is_default) {
      await db.from("calendars").update({ is_default: false } as never).neq("id", id ?? crypto.randomUUID());
    }
    const { error } = id
      ? await db.from("calendars").update(row as never).eq("id", id)
      : await db.from("calendars").insert(row as never);
    return error ? { ok: false, error: error.message } : { ok: true };
  });

export const deleteCalendar = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(ADMIN_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { error } = await db.from("calendars").delete().eq("id", data.id);
    return error ? { ok: false, error: error.message } : { ok: true };
  });

/* ----------------------------- AVAILABILITY ---------------------------- */

/** Replace the whole weekly schedule for a calendar in one shot. */
export const saveAvailability = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        calendar_id: z.string().uuid(),
        rules: z
          .array(
            z.object({
              weekday: z.number().int().min(0).max(6),
              start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
              end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
            }),
          )
          .max(60),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(ADMIN_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    await db.from("calendar_availability").delete().eq("calendar_id", data.calendar_id);
    if (data.rules.length > 0) {
      const { error } = await db
        .from("calendar_availability")
        .insert(data.rules.map((r) => ({ ...r, calendar_id: data.calendar_id })) as never);
      if (error) return { ok: false, error: error.message };
    }
    return { ok: true };
  });

export const upsertException = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        calendar_id: z.string().uuid(),
        exception_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        closed: z.boolean().optional().default(true),
        start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable().optional(),
        end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable().optional(),
        note: z.string().max(200).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(ADMIN_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { id, ...row } = data;
    const { error } = id
      ? await db.from("calendar_exceptions").update(row as never).eq("id", id)
      : await db.from("calendar_exceptions").insert(row as never);
    return error ? { ok: false, error: error.message } : { ok: true };
  });

export const deleteException = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(ADMIN_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { error } = await db.from("calendar_exceptions").delete().eq("id", data.id);
    return error ? { ok: false, error: error.message } : { ok: true };
  });

/* -------------------------------- SLOTS -------------------------------- */

export const listSlots = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        calendar_id: z.string().uuid(),
        from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (!(await isAuthed())) return { slots: [] };
    const db = await scopedDb();
    const [{ data: cal }, { data: rules }, { data: exceptions }, { data: booked }] = await Promise.all([
      db.from("calendars").select("*").eq("id", data.calendar_id).maybeSingle(),
      db.from("calendar_availability").select("*").eq("calendar_id", data.calendar_id),
      db.from("calendar_exceptions").select("*").eq("calendar_id", data.calendar_id),
      db
        .from("appointments")
        .select("appointment_date, duration_minutes, status")
        .eq("calendar_id", data.calendar_id)
        .not("appointment_date", "is", null),
    ]);
    if (!cal) return { slots: [] };
    const busy = ((booked ?? []) as Array<{ appointment_date: string; duration_minutes: number | null; status: string }>)
      .filter((b) => b.status !== "cancelled")
      .map((b) => ({ start: b.appointment_date, durationMinutes: b.duration_minutes ?? 30 }));
    return {
      slots: computeSlots({
        calendar: cal as unknown as CalendarConfig,
        rules: (rules ?? []) as unknown as AvailabilityRule[],
        exceptions: (exceptions ?? []) as unknown as CalendarException[],
        busy,
        fromDate: data.from,
        toDate: data.to,
      }),
    };
  });

/** Book a slot into the bookings/appointments list. */
export const bookSlot = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        calendar_id: z.string().uuid(),
        start: z.string().min(1),
        phone_number: z.string().max(40).nullable().optional(),
        lead_name: z.string().max(160).nullable().optional(),
        appointment_type: z.string().max(40).optional().default("booking"),
        notes: z.string().max(1000).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(ANY_ROLE);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { data: cal } = await db
      .from("calendars")
      .select("slot_duration_minutes")
      .eq("id", data.calendar_id)
      .maybeSingle();
    const { error } = await db.from("appointments").insert({
      calendar_id: data.calendar_id,
      appointment_date: new Date(data.start).toISOString(),
      duration_minutes: (cal as { slot_duration_minutes?: number } | null)?.slot_duration_minutes ?? 30,
      phone_number: data.phone_number ?? null,
      lead_name: data.lead_name ?? null,
      appointment_type: data.appointment_type,
      status: "confirmed",
      notes: data.notes ?? null,
    } as never);
    return error ? { ok: false, error: error.message } : { ok: true };
  });
