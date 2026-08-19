import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { scopedDb, activeSpaceId, guard, isAuthed, ANY_ROLE } from "./dashboard-helpers";
import { ALL_ROLES, type AppRole } from "@/lib/roles";

const ADMIN_ROLES: AppRole[] = ["super_admin", "admin"];

/* ------------------------------- QUEUES ------------------------------- */

export const listQueues = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { queues: [] };
  const db = await scopedDb();
  const { data } = await db.from("ticket_queues").select("*").order("position", { ascending: true });
  return { queues: data ?? [] };
});

export const upsertQueue = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().min(1).max(120),
        description: z.string().max(500).nullable().optional(),
        color: z.string().max(20).optional().default("#6366f1"),
        position: z.number().int().min(0).max(999).optional().default(0),
        ai_handoff_stages: z.array(z.string().max(80)).max(40).optional().default([]),
        is_ai_default: z.boolean().optional().default(false),
        member_ids: z.array(z.string().uuid()).max(100).optional(),
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
    const sid = await activeSpaceId();
    const row = {
      name: data.name,
      description: data.description ?? null,
      color: data.color,
      position: data.position,
      ai_handoff_stages: data.ai_handoff_stages,
      is_ai_default: data.is_ai_default,
    };

    let queueId = data.id ?? null;
    if (data.id) {
      const { error } = await db.from("ticket_queues").update(row as never).eq("id", data.id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { data: created, error } = await db
        .from("ticket_queues")
        .insert(row as never)
        .select("id")
        .maybeSingle();
      if (error) return { ok: false, error: error.message };
      queueId = (created as { id?: string } | null)?.id ?? null;
    }
    if (!queueId) return { ok: false, error: "Queue could not be saved." };

    // Only one queue can be the AI's default handoff target.
    if (data.is_ai_default) {
      await db.from("ticket_queues").update({ is_ai_default: false } as never).neq("id", queueId);
      await db.from("ticket_queues").update({ is_ai_default: true } as never).eq("id", queueId);
    }

    // Replace queue staffing when the caller supplied a member list.
    if (data.member_ids) {
      await db.from("ticket_queue_members").delete().eq("queue_id", queueId);
      if (data.member_ids.length > 0) {
        await db.from("ticket_queue_members").insert(
          data.member_ids.map((user_id) => ({ space_id: sid, queue_id: queueId, user_id })) as never,
        );
      }
    }
    return { ok: true, id: queueId };
  });

export const deleteQueue = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(ADMIN_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { error } = await db.from("ticket_queues").delete().eq("id", data.id);
    return error ? { ok: false, error: error.message } : { ok: true };
  });

/** Queue staffing: which users belong to which queue. */
export const listQueueMembers = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { members: [] };
  const db = await scopedDb();
  const { data } = await db.from("ticket_queue_members").select("queue_id, user_id");
  return { members: (data ?? []) as Array<{ queue_id: string; user_id: string }> };
});

/* --------------------------------- TAGS -------------------------------- */

export const listTags = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { tags: [] };
  const db = await scopedDb();
  const { data } = await db.from("tags").select("*").order("name", { ascending: true });
  return { tags: data ?? [] };
});

export const upsertTag = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().min(1).max(60),
        color: z.string().max(20).optional().default("#0ea5e9"),
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
    const row = { name: data.name, color: data.color };
    const { error } = data.id
      ? await db.from("tags").update(row as never).eq("id", data.id)
      : await db.from("tags").insert(row as never);
    return error ? { ok: false, error: error.message } : { ok: true };
  });

export const deleteTag = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(ADMIN_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { error } = await db.from("tags").delete().eq("id", data.id);
    return error ? { ok: false, error: error.message } : { ok: true };
  });

/* ------------------------------- TICKETS ------------------------------- */

export const listTickets = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        status: z.enum(["all", "open", "pending", "closed"]).optional().default("open"),
        queueId: z.string().uuid().nullable().optional(),
        assignedTo: z.string().uuid().nullable().optional(),
        phone: z.string().max(60).nullable().optional(),
        mineOnly: z.boolean().optional().default(false),
        limit: z.number().int().min(1).max(200).optional().default(100),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    let me;
    try {
      me = await guard(ANY_ROLE);
    } catch {
      return { tickets: [] };
    }
    const db = await scopedDb();
    let q = db.from("tickets").select("*").order("created_at", { ascending: false }).limit(data.limit);
    if (data.status !== "all") q = q.eq("status", data.status);
    if (data.queueId) q = q.eq("queue_id", data.queueId);
    if (data.phone) q = q.eq("phone_number", data.phone);
    if (data.mineOnly) q = q.eq("assigned_user_id", me.userId);
    else if (data.assignedTo) q = q.eq("assigned_user_id", data.assignedTo);
    const { data: tickets } = await q;
    return { tickets: tickets ?? [] };
  });

export const listTicketEvents = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ ticketId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    if (!(await isAuthed())) return { events: [] };
    const db = await scopedDb();
    const { data: events } = await db
      .from("ticket_events")
      .select("*")
      .eq("ticket_id", data.ticketId)
      .order("created_at", { ascending: true });
    return { events: events ?? [] };
  });

const ticketInput = z.object({
  id: z.string().uuid().optional(),
  subject: z.string().min(1).max(200),
  phone_number: z.string().max(60).nullable().optional(),
  status: z.enum(["open", "pending", "closed"]).optional().default("open"),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional().default("normal"),
  queue_id: z.string().uuid().nullable().optional(),
  assigned_user_id: z.string().uuid().nullable().optional(),
  tags: z.array(z.string().max(60)).max(20).optional().default([]),
  notes: z.string().max(4000).nullable().optional(),
});

export const upsertTicket = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ticketInput.parse(d))
  .handler(async ({ data }) => {
    let me;
    try {
      me = await guard(ANY_ROLE);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const sid = await activeSpaceId();
    const row = {
      subject: data.subject,
      phone_number: data.phone_number ?? null,
      status: data.status,
      priority: data.priority,
      queue_id: data.queue_id ?? null,
      assigned_user_id: data.assigned_user_id ?? null,
      tags: data.tags,
      notes: data.notes ?? null,
      closed_at: data.status === "closed" ? new Date().toISOString() : null,
    };

    let ticketId = data.id ?? null;
    if (data.id) {
      const { error } = await db.from("tickets").update(row as never).eq("id", data.id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { data: created, error } = await db
        .from("tickets")
        .insert({ ...row, created_by: me.userId, created_by_kind: "human" } as never)
        .select("id")
        .maybeSingle();
      if (error) return { ok: false, error: error.message };
      ticketId = (created as { id?: string } | null)?.id ?? null;
    }
    if (!ticketId) return { ok: false, error: "Ticket could not be saved." };

    await db.from("ticket_events").insert({
      ticket_id: ticketId,
      actor_user_id: me.userId,
      actor_label: me.email ?? "Agent",
      kind: data.id ? "updated" : "created",
      detail: data.id ? `Status ${data.status}` : data.subject,
    } as never);

    // Notify the assignee (skip self-assignment noise).
    if (data.assigned_user_id && data.assigned_user_id !== me.userId) {
      await db.from("notifications").insert({
        space_id: sid,
        user_id: data.assigned_user_id,
        title: `Ticket assigned: ${data.subject}`,
        body: data.notes ?? null,
        kind: "ticket",
        ticket_id: ticketId,
        link_phone: data.phone_number ?? null,
        created_by: me.userId,
      } as never);
    }
    return { ok: true, id: ticketId };
  });

export const transferTicket = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        queue_id: z.string().uuid().nullable().optional(),
        assigned_user_id: z.string().uuid().nullable().optional(),
        note: z.string().max(500).optional(),
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
    const db = await scopedDb();
    const sid = await activeSpaceId();
    const { data: ticket } = await db.from("tickets").select("*").eq("id", data.id).maybeSingle();
    if (!ticket) return { ok: false, error: "Ticket not found." };
    const { error } = await db
      .from("tickets")
      .update({
        queue_id: data.queue_id ?? null,
        assigned_user_id: data.assigned_user_id ?? null,
        status: "open",
      } as never)
      .eq("id", data.id);
    if (error) return { ok: false, error: error.message };

    await db.from("ticket_events").insert({
      ticket_id: data.id,
      actor_user_id: me.userId,
      actor_label: me.email ?? "Agent",
      kind: "transferred",
      detail: data.note ?? null,
    } as never);

    if (data.assigned_user_id && data.assigned_user_id !== me.userId) {
      await db.from("notifications").insert({
        space_id: sid,
        user_id: data.assigned_user_id,
        title: `Ticket transferred to you: ${(ticket as { subject?: string }).subject ?? "Ticket"}`,
        body: data.note ?? null,
        kind: "ticket",
        ticket_id: data.id,
        link_phone: (ticket as { phone_number?: string | null }).phone_number ?? null,
        created_by: me.userId,
      } as never);
    }
    return { ok: true };
  });

export const setTicketStatus = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["open", "pending", "closed"]) }).parse(d),
  )
  .handler(async ({ data }) => {
    let me;
    try {
      me = await guard(ANY_ROLE);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { error } = await db
      .from("tickets")
      .update({
        status: data.status,
        closed_at: data.status === "closed" ? new Date().toISOString() : null,
      } as never)
      .eq("id", data.id);
    if (error) return { ok: false, error: error.message };
    await db.from("ticket_events").insert({
      ticket_id: data.id,
      actor_user_id: me.userId,
      actor_label: me.email ?? "Agent",
      kind: data.status === "closed" ? "closed" : "status",
      detail: data.status,
    } as never);
    return { ok: true };
  });

/* ---------------------------- NOTIFICATIONS ---------------------------- */

export const listNotifications = createServerFn({ method: "GET" }).handler(async () => {
  let me;
  try {
    me = await guard(ANY_ROLE);
  } catch {
    return { notifications: [], unread: 0 };
  }
  const db = await scopedDb();
  const { data } = await db
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(60);
  const rows = (data ?? []) as Array<{
    id: string;
    user_id: string | null;
    target_role: string | null;
    read_at: string | null;
  }>;
  // Direct notifications for me, plus broadcasts targeted at my role / space.
  const mine = rows.filter(
    (n) => n.user_id === me.userId || (!n.user_id && (!n.target_role || n.target_role === me.role)),
  );
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: reads } = await supabaseAdmin
    .from("notification_reads")
    .select("notification_id")
    .eq("user_id", me.userId);
  const readSet = new Set(((reads ?? []) as { notification_id: string }[]).map((r) => r.notification_id));
  const notifications = mine.map((n) => ({ ...n, read: Boolean(n.read_at) || readSet.has(n.id) }));
  return { notifications, unread: notifications.filter((n) => !n.read).length };
});

export const markNotificationRead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid().optional(), all: z.boolean().optional() }).parse(d))
  .handler(async ({ data }) => {
    let me;
    try {
      me = await guard(ANY_ROLE);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ids: string[] = [];
    if (data.id) ids.push(data.id);
    if (data.all) {
      const { data: rows } = await db.from("notifications").select("id, user_id, target_role").limit(200);
      for (const n of (rows ?? []) as Array<{ id: string; user_id: string | null; target_role: string | null }>) {
        if (n.user_id === me.userId || (!n.user_id && (!n.target_role || n.target_role === me.role))) ids.push(n.id);
      }
    }
    if (ids.length === 0) return { ok: true };
    await supabaseAdmin
      .from("notification_reads")
      .upsert(
        ids.map((notification_id) => ({ notification_id, user_id: me.userId })) as never,
        { onConflict: "notification_id,user_id" },
      );
    return { ok: true };
  });

export const broadcastNotification = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        title: z.string().min(1).max(200),
        body: z.string().max(2000).optional(),
        target: z.enum(["all", ...ALL_ROLES] as [string, ...string[]]).default("all"),
        userId: z.string().uuid().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    let me;
    try {
      me = await guard(ADMIN_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const sid = await activeSpaceId();
    const { error } = await db.from("notifications").insert({
      space_id: sid,
      user_id: data.userId ?? null,
      target_role: data.userId ? null : data.target === "all" ? null : (data.target as AppRole),
      title: data.title,
      body: data.body ?? null,
      kind: "announcement",
      created_by: me.userId,
    } as never);
    return error ? { ok: false, error: error.message } : { ok: true };
  });

/** Members of the active space (for assignment pickers). */
export const listAssignableUsers = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { users: [] };
  const sid = await activeSpaceId();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: members } = await supabaseAdmin
    .from("space_members")
    .select("user_id, role")
    .eq("space_id", sid ?? "");
  const ids = ((members ?? []) as { user_id: string; role: string }[]).map((m) => m.user_id);
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("user_id, email, full_name")
    .in("user_id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);
  const byId = new Map(
    ((profiles ?? []) as { user_id: string; email: string | null; full_name: string | null }[]).map((p) => [
      p.user_id,
      p,
    ]),
  );
  const users = ((members ?? []) as { user_id: string; role: string }[]).map((m) => ({
    user_id: m.user_id,
    role: m.role,
    email: byId.get(m.user_id)?.email ?? null,
    full_name: byId.get(m.user_id)?.full_name ?? null,
  }));
  return { users };
});
