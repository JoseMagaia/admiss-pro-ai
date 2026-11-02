import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Row, HistoryEntry } from "./lead-panel-helpers";

/** Lead side panel: profile, notes and activity history for one conversation. */
export const getLeadPanel = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ phone: z.string().min(3).max(60) }).parse(d))
  .handler(async ({ data }) => {
    const { isAuthed } = await import("./dashboard-helpers");
    const { buildLeadPanel } = await import("./lead-panel-helpers");
    if (!(await isAuthed())) {
      return {
        lead: null as Row | null,
        notes: [] as Row[],
        tickets: [] as Row[],
        history: [] as HistoryEntry[],
      };
    }
    return buildLeadPanel(data.phone);
  });

export const addLeadNote = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ phone: z.string().min(3).max(60), body: z.string().min(1).max(4000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { scopedDb, activeSpaceId, guard, ANY_ROLE } = await import("./dashboard-helpers");
    const { findLead } = await import("./lead-panel-helpers");
    let me;
    try {
      me = await guard(ANY_ROLE);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const sid = await activeSpaceId();
    const lead = await findLead(data.phone);
    const { error } = await db.from("lead_notes").insert({
      space_id: sid,
      lead_id: (lead?.id as string | undefined) ?? null,
      phone_number: data.phone,
      body: data.body,
      author_user_id: me.userId,
      author_label: me.email ?? "Agent",
    } as never);
    return error ? { ok: false, error: error.message } : { ok: true };
  });

export const deleteLeadNote = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { scopedDb, guard, ANY_ROLE } = await import("./dashboard-helpers");
    try {
      await guard(ANY_ROLE);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { error } = await db.from("lead_notes").delete().eq("id", data.id);
    return error ? { ok: false, error: error.message } : { ok: true };
  });

/** Touchpoints are lead_notes whose body starts with this marker. */
const TP = "[Touchpoint]";

/** History (notes + touchpoints) for many phones at once, for the Bookings table. */
export const listLeadHistories = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ phones: z.array(z.string().max(60)).max(1000) }).parse(d))
  .handler(async ({ data }) => {
    const { scopedDb, isAuthed } = await import("./dashboard-helpers");
    type N = { id: string; phone_number: string | null; body: string; author_label: string | null; created_at: string };
    if (!(await isAuthed()) || data.phones.length === 0) return { notes: [] as N[] };
    const db = await scopedDb();
    const { data: rows } = await db
      .from("lead_notes")
      .select("id, phone_number, body, author_label, created_at")
      .in("phone_number", data.phones)
      .order("created_at", { ascending: false })
      .limit(5000);
    return { notes: (rows ?? []) as N[] };
  });

export const logTouchpoint = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        phone: z.string().min(3).max(60),
        outcome: z.string().min(1).max(60),
        body: z.string().max(4000).default(""),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { scopedDb, activeSpaceId, guard, ANY_ROLE } = await import("./dashboard-helpers");
    const { findLead } = await import("./lead-panel-helpers");
    let me;
    try {
      me = await guard(ANY_ROLE);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const sid = await activeSpaceId();
    const lead = await findLead(data.phone);
    const body = `${TP} ${data.outcome}${data.body.trim() ? ` — ${data.body.trim()}` : ""}`;
    const { error } = await db.from("lead_notes").insert({
      space_id: sid,
      lead_id: (lead?.id as string | undefined) ?? null,
      phone_number: data.phone,
      body,
      author_user_id: me.userId,
      author_label: me.email ?? "Agent",
    } as never);
    return error ? { ok: false, error: error.message } : { ok: true };
  });

/** Admin / super admin only: rename a lead. */
export const updateLeadName = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ phone: z.string().min(3).max(60), name: z.string().trim().min(1).max(120) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { scopedDb, guard } = await import("./dashboard-helpers");
    const { findLead } = await import("./lead-panel-helpers");
    try {
      await guard(["super_admin", "admin"]);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const lead = await findLead(data.phone);
    if (!lead?.id) return { ok: false, error: "Lead not found" };
    const db = await scopedDb();
    const { error } = await db.from("leads").update({ lead_name: data.name } as never).eq("id", lead.id as string);
    if (!error) await db.from("appointments").update({ lead_name: data.name } as never).eq("phone_number", data.phone);
    return error ? { ok: false, error: error.message } : { ok: true };
  });
