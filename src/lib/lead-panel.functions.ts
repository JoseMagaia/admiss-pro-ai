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
