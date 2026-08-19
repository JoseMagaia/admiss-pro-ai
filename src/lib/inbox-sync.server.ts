// Server-only inbox synchronisation.
//
// Pulls message history from connected inboxes into the app's own timeline so
// the Messages tab shows the same conversations agents see in Chatwoot (and,
// for WhatsApp Cloud, everything Meta has delivered through the webhook).
//
// Design notes:
//  - Chatwoot exposes a REST history API, so we backfill conversations and
//    their messages, de-duplicated by a stable external id stored in `wamid`
//    (`cw:<accountId>:<messageId>`).
//  - Meta (WhatsApp Cloud) has NO history endpoint: inbound traffic only ever
//    arrives through the webhook. For those inboxes we report status instead
//    of pretending to fetch.
//  - Imported messages are recorded as history only; they never re-trigger the
//    AI pipeline, so a sync can be run repeatedly without side effects.

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface InboxSyncReport {
  workspaceId: string;
  workspace: string;
  provider: string;
  imported: number;
  conversations: number;
  skipped?: string;
  error?: string;
}

interface ChatwootCredsLite {
  url: string;
  accountId: string;
  apiToken: string;
}

const MAX_CONVERSATION_PAGES = 3;
const MAX_MESSAGES_PER_CONVERSATION = 100;

function cleanUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

async function chatwootGet(creds: ChatwootCredsLite, path: string): Promise<any | null> {
  try {
    const res = await fetch(`${cleanUrl(creds.url)}${path}`, {
      headers: { api_access_token: creds.apiToken, "Content-Type": "application/json" },
    });
    if (!res.ok) {
      console.error("Chatwoot sync request failed", { path, status: res.status });
      return null;
    }
    return (await res.json()) as any;
  } catch (e) {
    console.error("Chatwoot sync request error", { path, error: String(e) });
    return null;
  }
}

function normalisePhone(raw: unknown): string | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const digits = s.replace(/[^0-9]/g, "");
  if (!digits) return null;
  return `+${digits}`;
}

function attachmentKind(fileType: unknown): string | null {
  const t = String(fileType ?? "").toLowerCase();
  if (!t) return null;
  if (t.includes("image")) return "image";
  if (t.includes("audio")) return "audio";
  if (t.includes("video")) return "video";
  return "document";
}

/** Pull recent conversations + messages from one Chatwoot account. */
async function syncChatwootWorkspace(db: any, workspace: any, creds: ChatwootCredsLite): Promise<InboxSyncReport> {
  const report: InboxSyncReport = {
    workspaceId: String(workspace.id),
    workspace: String(workspace.name ?? "Inbox"),
    provider: "chatwoot",
    imported: 0,
    conversations: 0,
  };

  const inboxId = workspace.chatwoot_inbox_id ? String(workspace.chatwoot_inbox_id) : null;
  const conversations: any[] = [];

  for (let page = 1; page <= MAX_CONVERSATION_PAGES; page++) {
    const json = await chatwootGet(creds, `/api/v1/accounts/${creds.accountId}/conversations?status=all&page=${page}`);
    const payload: any[] = json?.data?.payload ?? json?.payload ?? [];
    if (!Array.isArray(payload) || payload.length === 0) break;
    conversations.push(...payload);
    if (payload.length < 20) break;
  }

  for (const conv of conversations) {
    // When the workspace is bound to a specific inbox, ignore other inboxes in
    // the same Chatwoot account so tenants don't cross-pollinate.
    if (inboxId && conv.inbox_id !== undefined && String(conv.inbox_id) !== inboxId) continue;

    const sender = conv?.meta?.sender ?? {};
    const phone = normalisePhone(sender.phone_number ?? sender.identifier ?? conv?.meta?.sender?.name);
    if (!phone) continue;

    const conversationId = conv.id !== undefined ? String(conv.id) : null;
    const contactId = sender.id !== undefined ? String(sender.id) : null;
    const contactName = (sender.name as string | undefined) ?? null;

    // --- Lead + conversation records (space_id injected by the scoped client) ---
    const { data: lead } = await db.from("leads").select("id, lead_name").eq("phone_number", phone).maybeSingle();
    let leadId = (lead as any)?.id ?? null;
    if (!leadId) {
      const { data: createdLead } = await db
        .from("leads")
        .insert({
          phone_number: phone,
          lead_name: contactName,
          chatwoot_conversation_id: conversationId,
          chatwoot_contact_id: contactId,
          workspace_id: workspace.id,
          qualification_status: "NEW_LEAD",
        })
        .select("id")
        .single();
      leadId = (createdLead as any)?.id ?? null;
    } else {
      await db
        .from("leads")
        .update({
          chatwoot_conversation_id: conversationId,
          chatwoot_contact_id: contactId,
          workspace_id: workspace.id,
          ...((lead as any)?.lead_name ? {} : { lead_name: contactName }),
        })
        .eq("id", leadId);
    }

    const { data: existingConv } = await db
      .from("conversations")
      .select("id")
      .eq("phone_number", phone)
      .maybeSingle();
    if (!existingConv) {
      await db.from("conversations").insert({
        phone_number: phone,
        lead_id: leadId,
        chatwoot_conversation_id: conversationId,
        workspace_id: workspace.id,
        status: String(conv.status ?? "open") === "resolved" ? "resolved" : "open",
      });
    } else {
      await db
        .from("conversations")
        .update({ chatwoot_conversation_id: conversationId, workspace_id: workspace.id })
        .eq("id", (existingConv as any).id);
    }
    report.conversations += 1;

    // --- Messages ---
    if (!conversationId) continue;
    const msgJson = await chatwootGet(
      creds,
      `/api/v1/accounts/${creds.accountId}/conversations/${conversationId}/messages`,
    );
    const messages: any[] = (msgJson?.payload ?? msgJson?.data?.payload ?? []) as any[];
    if (!Array.isArray(messages) || messages.length === 0) continue;

    const recent = messages.slice(-MAX_MESSAGES_PER_CONVERSATION);
    const externalIds = recent
      .filter((m) => m?.id !== undefined)
      .map((m) => `cw:${creds.accountId}:${m.id}`);
    const known = new Set<string>();
    // Chunk the de-dupe lookup so long threads stay within URL limits.
    for (let i = 0; i < externalIds.length; i += 100) {
      const chunk = externalIds.slice(i, i + 100);
      const { data: existingRows } = await db.from("whatsapp_messages").select("wamid").in("wamid", chunk);
      for (const row of ((existingRows as Array<{ wamid: string | null }> | null) ?? [])) {
        if (row.wamid) known.add(row.wamid);
      }
    }

    const toInsert: Array<Record<string, unknown>> = [];
    for (const m of recent) {
      if (m?.id === undefined) continue;
      const externalId = `cw:${creds.accountId}:${m.id}`;
      if (known.has(externalId)) continue;

      const messageType = Number(m.message_type ?? 0);
      // 0 = incoming (contact), 1 = outgoing (agent/bot), 2 = activity, 3 = template
      if (messageType === 2) continue;

      const attachments: any[] = Array.isArray(m.attachments) ? m.attachments : [];
      const firstAttachment = attachments[0] ?? null;
      const content = String(m.content ?? "").trim();
      if (!content && !firstAttachment) continue;

      const createdAt = Number(m.created_at ?? 0);
      toInsert.push({
        phone_number: phone,
        message_content: content || `[${attachmentKind(firstAttachment?.file_type) ?? "attachment"}]`,
        sender: messageType === 0 ? "lead" : "human",
        message_type: firstAttachment ? "media" : "text",
        processed: true,
        received_at: createdAt > 0 ? new Date(createdAt * 1000).toISOString() : new Date().toISOString(),
        wamid: externalId,
        attachment_url: firstAttachment?.data_url ?? null,
        attachment_mime: firstAttachment?.file_type ? String(firstAttachment.file_type) : null,
        attachment_kind: attachmentKind(firstAttachment?.file_type),
        delivery_status: messageType === 0 ? null : "sent",
      });
      known.add(externalId);
    }

    if (toInsert.length > 0) {
      const { error } = await db.from("whatsapp_messages").insert(toInsert);
      if (error) {
        console.error("Chatwoot sync insert failed", { conversationId, error: error.message });
      } else {
        report.imported += toInsert.length;
      }
    }
  }

  return report;
}

/**
 * Sync every connected inbox in the caller's active Space.
 * `db` must be a Space-scoped service-role client.
 */
export async function syncInboxes(db: any): Promise<{ reports: InboxSyncReport[]; imported: number }> {
  const { data: workspaces } = await db.from("chatwoot_workspaces").select("*").eq("enabled", true);
  const rows = (workspaces as any[]) ?? [];
  const reports: InboxSyncReport[] = [];

  // Company-wide Chatwoot credentials act as a fallback for legacy workspaces.
  const { data: settings } = await db
    .from("education_settings")
    .select("chatwoot_url, chatwoot_account_id, chatwoot_api_token")
    .limit(1)
    .maybeSingle();

  for (const ws of rows) {
    const provider = String(ws.provider_type ?? "chatwoot");

    if (provider === "whatsapp_cloud") {
      reports.push({
        workspaceId: String(ws.id),
        workspace: String(ws.name ?? "WhatsApp"),
        provider,
        imported: 0,
        conversations: 0,
        skipped:
          "WhatsApp Cloud has no history API — messages arrive live through the Meta webhook and are already in the timeline.",
      });
      continue;
    }

    if (provider === "evolution") {
      reports.push({
        workspaceId: String(ws.id),
        workspace: String(ws.name ?? "Evolution"),
        provider,
        imported: 0,
        conversations: 0,
        skipped: "Evolution API delivers messages through its webhook; nothing to backfill.",
      });
      continue;
    }

    const creds: ChatwootCredsLite | null =
      ws.chatwoot_url && ws.chatwoot_account_id && ws.chatwoot_api_token
        ? {
            url: String(ws.chatwoot_url),
            accountId: String(ws.chatwoot_account_id),
            apiToken: String(ws.chatwoot_api_token),
          }
        : settings?.chatwoot_url && settings?.chatwoot_account_id && settings?.chatwoot_api_token
          ? {
              url: String(settings.chatwoot_url),
              accountId: String(settings.chatwoot_account_id),
              apiToken: String(settings.chatwoot_api_token),
            }
          : null;

    if (!creds) {
      reports.push({
        workspaceId: String(ws.id),
        workspace: String(ws.name ?? "Inbox"),
        provider,
        imported: 0,
        conversations: 0,
        error: "Missing Chatwoot URL, account id or API token.",
      });
      continue;
    }

    try {
      reports.push(await syncChatwootWorkspace(db, ws, creds));
    } catch (e) {
      console.error("Inbox sync failed", { workspaceId: ws.id, error: String(e) });
      reports.push({
        workspaceId: String(ws.id),
        workspace: String(ws.name ?? "Inbox"),
        provider,
        imported: 0,
        conversations: 0,
        error: "Sync failed — check the inbox credentials.",
      });
    }
  }

  return { reports, imported: reports.reduce((sum, r) => sum + r.imported, 0) };
}
