import { createFileRoute } from "@tanstack/react-router";

// WhatsApp Business Cloud API webhook (Meta / Facebook).
//
// Setup in Meta:
//   1. Create a WhatsApp Business App in developers.facebook.com.
//   2. Under "WhatsApp → Configuration", set the Callback URL to
//      https://<your-domain>/api/public/whatsapp-webhook and the Verify Token
//      to the same value stored on the workspace (`wa_verify_token`).
//   3. Subscribe to the `messages` webhook field.
//
// This route handles both the GET verification handshake and the POST inbound
// event payloads (messages, statuses, interactive replies). The workspace is
// matched by the incoming `phone_number_id` so multiple WA numbers can be
// connected in parallel.

async function findVerifyToken(): Promise<string | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("chatwoot_workspaces")
    .select("wa_verify_token")
    .eq("provider_type", "whatsapp_cloud")
    .eq("enabled", true);
  const tokens = ((data as Array<{ wa_verify_token: string | null }> | null) ?? [])
    .map((r) => r.wa_verify_token)
    .filter(Boolean) as string[];
  return tokens[0] ?? null;
}

async function downloadMetaMedia(phoneNumberId: string, mediaId: string, filename: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: workspace } = await supabaseAdmin
    .from("chatwoot_workspaces")
    .select("wa_access_token")
    .eq("provider_type", "whatsapp_cloud")
    .eq("wa_phone_number_id", phoneNumberId)
    .eq("enabled", true)
    .maybeSingle();
  const token = String(workspace?.wa_access_token ?? "").trim();
  if (!token) throw new Error("No access token for inbound media workspace.");
  const metadataResponse = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(mediaId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const metadata = (await metadataResponse.json().catch(() => ({}))) as { url?: string; mime_type?: string; error?: { message?: string } };
  if (!metadataResponse.ok || !metadata.url) throw new Error(metadata.error?.message ?? "Meta media metadata was unavailable.");
  const mediaResponse = await fetch(metadata.url, { headers: { Authorization: `Bearer ${token}` } });
  if (!mediaResponse.ok) throw new Error(`Meta media download failed (${mediaResponse.status}).`);
  const mime = metadata.mime_type ?? mediaResponse.headers.get("content-type") ?? "application/octet-stream";
  const { storeMessageMedia } = await import("@/lib/message-media.server");
  return storeMessageMedia({ bytes: await mediaResponse.arrayBuffer(), mime, filename, folder: "inbound" });
}

export const Route = createFileRoute("/api/public/whatsapp-webhook")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");
        if (mode !== "subscribe" || !token) {
          return new Response("Bad Request", { status: 400 });
        }
        // Match against ANY configured WA workspace verify token so operators
        // can add new numbers without touching this route.
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data } = await supabaseAdmin
          .from("chatwoot_workspaces")
          .select("wa_verify_token")
          .eq("provider_type", "whatsapp_cloud")
          .eq("wa_verify_token", token)
          .limit(1);
        if (!data || data.length === 0) {
          return new Response("Forbidden", { status: 403 });
        }
        return new Response(challenge ?? "", { status: 200 });
      },

      POST: async ({ request }) => {
        let payload: Record<string, unknown>;
        try {
          payload = (await request.json()) as Record<string, unknown>;
        } catch {
          return new Response(JSON.stringify({ error: "invalid_json" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Meta payloads look like:
        // { object: "whatsapp_business_account", entry: [{ id, changes: [{ field, value }] }] }
        const entries = Array.isArray(payload.entry) ? (payload.entry as Array<Record<string, unknown>>) : [];
        const results: unknown[] = [];
        let messageCount = 0;
        let statusCount = 0;
        const phoneNumberIds = new Set<string>();

        for (const entry of entries) {
          const changes = Array.isArray(entry.changes) ? (entry.changes as Array<Record<string, unknown>>) : [];
          for (const change of changes) {
            if (change.field !== "messages") continue;
            const value = (change.value as Record<string, unknown>) ?? {};
            const metadata = (value.metadata as Record<string, unknown>) ?? {};
            const phoneNumberId = metadata.phone_number_id !== undefined ? String(metadata.phone_number_id) : null;
            if (phoneNumberId) phoneNumberIds.add(phoneNumberId);

            // ---------- Delivery / Read receipts ----------
            // Meta emits `statuses[]` with { id (wamid), status: sent|delivered|read|failed, timestamp }.
            // We update whatsapp_messages by wamid so the WhatsApp-style ticks in
            // the inbox update in near real time, and update the linked
            // campaign_recipients row so the drip campaign report reflects
            // delivered/opened counts.
            const statuses = Array.isArray(value.statuses) ? (value.statuses as Array<Record<string, unknown>>) : [];
            statusCount += statuses.length;
            if (statuses.length > 0) {
              const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
              const nowIso = new Date().toISOString();
              for (const st of statuses) {
                const wamid = st.id !== undefined ? String(st.id) : "";
                const status = String(st.status ?? "").toLowerCase();
                if (!wamid || !status) continue;

                // Update the message row.
                const patch: Record<string, unknown> = { delivery_status: status };
                if (status === "delivered") patch.delivered_at = nowIso;
                if (status === "read") {
                  patch.read_at = nowIso;
                  // A read implies delivered; backfill if we somehow missed it.
                  patch.delivered_at = nowIso;
                }
                if (status === "failed") {
                  // Surface Meta's own reason (e.g. "re-engagement message")
                  // so the chat can explain why it never arrived.
                  const errs = Array.isArray(st.errors) ? (st.errors as Array<Record<string, unknown>>) : [];
                  const first = errs[0] ?? {};
                  const details =
                    ((first.error_data as Record<string, unknown> | undefined)?.details as string | undefined) ??
                    (first.title as string | undefined) ??
                    (first.message as string | undefined) ??
                    "WhatsApp could not deliver this message.";
                  patch.delivery_error = first.code ? `[${first.code}] ${details}` : details;
                }

                const { data: updatedRows } = await supabaseAdmin
                  .from("whatsapp_messages")
                  .update(patch as never)
                  .eq("wamid", wamid)
                  .select("id, campaign_id, phone_number");

                // Roll the status forward on the linked campaign recipient.
                for (const row of (updatedRows as Array<Record<string, unknown>> | null) ?? []) {
                  const campaignId = row.campaign_id as string | null;
                  const phone = row.phone_number as string | null;
                  if (!campaignId || !phone) continue;
                  const recipientPatch: Record<string, unknown> = {};
                  let allowedFrom: string[] = [];
                  if (status === "delivered") {
                    recipientPatch.status = "delivered";
                    recipientPatch.delivered_at = nowIso;
                    allowedFrom = ["sent", "pending"];
                  } else if (status === "read") {
                    recipientPatch.status = "opened";
                    recipientPatch.opened_at = nowIso;
                    recipientPatch.delivered_at = nowIso;
                    allowedFrom = ["sent", "pending", "delivered"];
                  } else if (status === "failed") {
                    recipientPatch.status = "failed";
                    recipientPatch.error = "Delivery failed on WhatsApp";
                    allowedFrom = ["sent", "pending"];
                  }
                  if (Object.keys(recipientPatch).length === 0) continue;
                  await supabaseAdmin
                    .from("campaign_recipients")
                    .update(recipientPatch as never)
                    .eq("campaign_id", campaignId)
                    .eq("phone_number", phone)
                    .in("status", allowedFrom);
                }
              }
            }

            // ---------- Inbound messages ----------
            const messages = Array.isArray(value.messages) ? (value.messages as Array<Record<string, unknown>>) : [];
            messageCount += messages.length;

            for (const msg of messages) {
              const from = msg.from !== undefined ? String(msg.from) : "";
              const phone = from.replace(/[^0-9]/g, "");
              if (!phone) continue;

              // Extract text or a description of the media/interactive event,
              // plus the button reply id when the user tapped a quick reply.
              let content = "";
              let buttonId: string | null = null;
              let attachment: {
                url: string | null;
                path?: string | null;
                mime: string | null;
                kind: string | null;
              } | null = null;
              const type = String(msg.type ?? "");
              if (type === "text") {
                content = String((msg.text as Record<string, unknown>)?.body ?? "").trim();
              } else if (type === "interactive") {
                const inter = (msg.interactive as Record<string, unknown>) ?? {};
                const btn = (inter.button_reply as Record<string, unknown>) ?? {};
                const list = (inter.list_reply as Record<string, unknown>) ?? {};
                content = String(btn.title ?? list.title ?? "").trim();
                buttonId = String(btn.id ?? list.id ?? "").trim() || null;
              } else if (type === "image" || type === "video" || type === "audio" || type === "document") {
                const media = (msg[type] as Record<string, unknown>) ?? {};
                content = String(media.caption ?? `[${type} attachment]`).trim();
                const mediaId = String(media.id ?? "").trim();
                if (phoneNumberId && mediaId) {
                  try {
                    const extension = type === "image" ? "jpg" : type === "audio" ? "ogg" : type === "video" ? "mp4" : "bin";
                    const stored = await downloadMetaMedia(
                      phoneNumberId,
                      mediaId,
                      String(media.filename ?? `${type}-${mediaId.slice(-12)}.${extension}`),
                    );
                    attachment = {
                      url: stored.url,
                      path: stored.path,
                      mime: media.mime_type ? String(media.mime_type) : null,
                      kind: type,
                    };
                  } catch (error) {
                    console.error("WhatsApp inbound media download failed:", error);
                    attachment = { url: null, path: null, mime: media.mime_type ? String(media.mime_type) : null, kind: type };
                  }
                }
              } else if (type === "button") {
                // Template-button reply. `payload` is the developer-defined id.
                const b = (msg.button as Record<string, unknown>) ?? {};
                content = String(b.text ?? "").trim();
                buttonId = String(b.payload ?? "").trim() || null;
              }
              if (!content && !buttonId) continue;

              try {
                const { processInboundMessage } = await import("@/lib/admissions.server");
                const result = await processInboundMessage({
                  phone,
                  message: content || (buttonId ?? ""),
                  // Reuse the "instance" identifier slot to look up the WA
                  // workspace by its phone_number_id (resolveWorkspace knows both).
                  evolutionInstance: phoneNumberId,
                  buttonId,
                  // Meta re-delivers webhooks on any non-200; the wamid keeps
                  // the timeline free of duplicates.
                  externalId: msg.id !== undefined ? String(msg.id) : null,
                  attachment,
                });
                results.push(result);
              } catch (e) {
                console.error("WhatsApp Cloud webhook processing error:", e);
                return new Response(JSON.stringify({ ok: false, error: "processing_failed" }), {
                  status: 500,
                  headers: { "Content-Type": "application/json" },
                });
              }
            }

          }
        }

        // This trace is intentionally metadata-only: it makes silent Meta
        // delivery/configuration failures diagnosable without logging message
        // bodies, contact phone numbers, tokens, or other private content.
        console.info("WhatsApp Cloud webhook received", {
          object: String(payload.object ?? ""),
          entries: entries.length,
          phoneNumberIds: [...phoneNumberIds],
          messages: messageCount,
          statuses: statusCount,
          processed: results.length,
        });

        return new Response(
          JSON.stringify({
            ok: true,
            processed: results.length,
            received: { messages: messageCount, statuses: statusCount },
          }),
          {
          status: 200,
          headers: { "Content-Type": "application/json" },
          },
        );
      },
    },
  },
});
