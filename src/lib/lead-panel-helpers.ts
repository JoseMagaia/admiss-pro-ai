// Runtime helpers for src/lib/lead-panel.functions.ts. Kept in a sibling module
// so the server-function file stays a thin wrapper (the splitter strips runtime
// siblings from *.functions.ts files).
import { scopedDb } from "./dashboard-helpers";

/** Serializable row shape returned to the client. */
export type Row = Record<string, string | number | boolean | null>;

/** One entry in the lead's activity history. */
export type HistoryEntry = { at: string; kind: string; title: string; detail: string | null };

/** Compare phone numbers by digits only. */
export const digits = (p: string) => (p ?? "").replace(/\D/g, "");

/** Flatten a DB row into primitives so it survives server-fn serialization. */
export function plain(o: unknown): Row {
  const out: Row = {};
  for (const [k, v] of Object.entries((o ?? {}) as Record<string, unknown>)) {
    out[k] =
      v === null || v === undefined
        ? null
        : typeof v === "string" || typeof v === "number" || typeof v === "boolean"
          ? v
          : JSON.stringify(v);
  }
  return out;
}

/** Find the lead matching a phone number, ignoring formatting differences. */
export async function findLead(phone: string): Promise<Record<string, unknown> | null> {
  const db = await scopedDb();
  const { data } = await db.from("leads").select("*").limit(1000);
  const rows = (data ?? []) as Array<Record<string, unknown>>;
  const target = digits(phone);
  return rows.find((l) => digits(String(l.phone_number ?? "")) === target) ?? null;
}

/** Gather lead info, notes and a merged activity timeline for one conversation. */
export async function buildLeadPanel(phone: string) {
  const db = await scopedDb();
  const lead = await findLead(phone);
  const leadId = (lead?.id as string | undefined) ?? null;

  const [notesRes, ticketsRes, apptRes, outcomesRes, enrollRes] = await Promise.all([
    db.from("lead_notes").select("*").order("created_at", { ascending: false }).limit(200),
    db.from("tickets").select("*").eq("phone_number", phone).limit(50),
    db.from("appointments").select("*").eq("phone_number", phone).limit(50),
    db.from("meeting_outcomes").select("*").eq("phone_number", phone).limit(50),
    db.from("workflow_enrollments").select("*").eq("phone_number", phone).limit(50),
  ]);

  const notes = ((notesRes.data ?? []) as Array<Record<string, unknown>>).filter(
    (n) =>
      (leadId && n.lead_id === leadId) || digits(String(n.phone_number ?? "")) === digits(phone),
  );

  const tickets = (ticketsRes.data ?? []) as Array<Record<string, unknown>>;
  const ticketIds = tickets.map((t) => t.id as string);
  const events = ticketIds.length
    ? (((await db.from("ticket_events").select("*").in("ticket_id", ticketIds).limit(200)).data ??
        []) as Array<Record<string, unknown>>)
    : [];

  const history: HistoryEntry[] = [];
  const push = (at: unknown, kind: string, title: string, detail: string | null = null) => {
    if (!at) return;
    history.push({ at: String(at), kind, title, detail });
  };

  if (lead) push(lead.created_at, "lead", "Lead created", String(lead.qualification_status ?? ""));
  for (const t of tickets) {
    push(t.created_at, "ticket", `Ticket opened — ${String(t.subject ?? "Conversation")}`, String(t.status ?? ""));
  }
  for (const e of events) {
    push(
      e.created_at,
      String(e.kind ?? "event"),
      `${String(e.actor_label ?? "System")} · ${String(e.kind ?? "event")}`,
      (e.detail as string | null) ?? null,
    );
  }
  for (const a of (apptRes.data ?? []) as Array<Record<string, unknown>>) {
    push(
      a.created_at,
      "appointment",
      `Appointment ${String(a.status ?? "")}`,
      a.appointment_date ? new Date(String(a.appointment_date)).toLocaleString() : null,
    );
  }
  for (const m of (outcomesRes.data ?? []) as Array<Record<string, unknown>>) {
    push(m.created_at, "outcome", `Meeting outcome — ${String(m.outcome ?? "")}`, (m.next_action as string | null) ?? null);
  }
  for (const w of (enrollRes.data ?? []) as Array<Record<string, unknown>>) {
    push(w.created_at, "workflow", `Workflow ${String(w.status ?? "")}`, `Step ${String(w.current_step ?? 0)}`);
  }

  history.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return {
    lead: lead ? plain(lead) : null,
    notes: notes.map(plain),
    tickets: tickets.map(plain),
    history: history.slice(0, 200),
  };
}
