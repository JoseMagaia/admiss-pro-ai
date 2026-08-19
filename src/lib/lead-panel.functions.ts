import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { scopedDb, activeSpaceId, guard, isAuthed, ANY_ROLE } from "./dashboard-helpers";

/** Digits-only comparison helper for phone matching. */
const digits = (p: string) => (p ?? "").replace(/\D/g, "");

async function findLead(phone: string) {
  const db = await scopedDb();
  const { data } = await db.from("leads").select("*").limit(500);
  const rows = (data ?? []) as Array<Record<string, unknown>>;
  const target = digits(phone);
  return rows.find((l) => digits(String(l.phone_number ?? "")) === target) ?? null;
}

/** Full side-panel payload for a conversation: lead info, notes and history. */
export const getLeadPanel = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ phone: z.string().min(3).max(60) }).parse(d))
  .handler(async ({ data }) => {
    if (!(await isAuthed())) return { lead: null, notes: [], history: [] };
    const db = await scopedDb();
    const lead = await findLead(data.phone);
    const leadId = (lead?.id as string | undefined) ?? null;

    const [notesRes, ticketsRes, apptRes, outcomesRes, enrollRes] = await Promise.all([
      db
        .from("lead_notes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      db.from("tickets").select("*").eq("phone_number", data.phone).limit(50),
      db.from("appointments").select("*").eq("phone_number", data.phone).limit(50),
      db.from("meeting_outcomes").select("*").eq("phone_number", data.phone).limit(50),
      db.from("workflow_enrollments").select("*").eq("phone_number", data.phone).limit(50),
    ]);

    const notes = ((notesRes.data ?? []) as Array<Record<string, unknown>>).filter((n) =>
      leadId ? n.lead_id === leadId || digits(String(n.phone_number ?? "")) === digits(data.phone)
             : digits(String(n.phone_number ?? "")) === digits(data.phone),
    );

    const tickets = (ticketsRes.data ?? []) as Array<Record<string, unknown>>;
    const ticketIds = tickets.map((t) => t.id as string);
    const { data: events } = ticketIds.length
      ? await db.from("ticket_events").select("*").in("ticket_id", ticketIds).limit(200)
      : { data: [] as Array<Record<string, unknown>> };

    type Entry = { at: string; kind: string; title: string; detail?: string | null };
    const history: Entry[] = [];

    if (lead?.created_at) {
      history.push({ at: String(lead.created_at), kind: "lead", title: "Lead created" });
    }
    for (const t of tickets) {
      history.push({
        at: String(t.created_at),
        kind: "ticket",
        title: `Ticket opened — ${String(t.subject ?? "Conversation")}`,
        detail: String(t.status ?? ""),
      });
    }
    for (const e of (events ?? []) as Array<Record<string, unknown>>) {
      history.push({
        at: String(e.created_at),
        kind: String(e.kind ?? "event"),
        title: `${String(e.actor_label ?? "System")} · ${String(e.kind ?? "event")}`,
        detail: (e.detail as string | null) ?? null,
      });
    }
    for (const a of (apptRes.data ?? []) as Array<Record<string, unknown>>) {
      history.push({
        at: String(a.created_at),
        kind: "appointment",
        title: `Appointment ${String(a.status ?? "")}`,
        detail: a.appointment_date ? new Date(String(a.appointment_date)).toLocaleString() : null,
      });
    }
    for (const m of (outcomesRes.data ?? []) as Array<Record<string, unknown>>) {
      history.push({
        at: String(m.created_at),
        kind: "outcome",
        title: `Meeting outcome — ${String(m.outcome ?? "")}`,
        detail: (m.next_action as string | null) ?? null,
      });
    }
    for (const w of (enrollRes.data ?? []) as Array<Record<string, unknown>>) {
      history.push({
        at: String(w.created_at),
        kind: "workflow",
        title: `Workflow ${String(w.status ?? "")}`,
        detail: `Step ${String(w.current_step ?? 0)}`,
      });
    }

    history.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

    return { lead: lead ?? null, notes, history: history.slice(0, 200), tickets };
  });

export const addLeadNote = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ phone: z.string().min(3).max(60), body: z.string().min(1).max(4000) }).parse(d),
  )
  .handler(async ({ data }) => {
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
    try {
      await guard(ANY_ROLE);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { error } = await db.from("lead_notes").delete().eq("id", data.id);
    return error ? { ok: false, error: error.message } : { ok: true };
  });
