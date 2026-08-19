import { createFileRoute } from "@tanstack/react-router";

// Chatwoot sends webhook events here. Configure this URL as the webhook in Chatwoot.
// Supported events: message_created, conversation_created, conversation_updated.
export const Route = createFileRoute("/api/public/chatwoot-webhook")({
  server: {
    handlers: {
      GET: async () =>
        new Response("Chatwoot webhook endpoint. Send POST requests only.", {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        }),
      POST: async ({ request }) => {
        let payload: Record<string, unknown>;
        try {
          payload = (await request.json()) as Record<string, unknown>;
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const event = String(payload.event ?? "");
        const conversation = (payload.conversation as Record<string, unknown>) ?? {};
        const sender = (payload.sender as Record<string, unknown>) ?? {};
        const messageType = String(payload.message_type ?? "");

        // Only act on inbound messages created by the contact.
        if (event !== "message_created") {
          return new Response(JSON.stringify({ ok: true, ignored: event }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        const content = String(payload.content ?? "").trim();
        const conversationId =
          conversation.id !== undefined ? String(conversation.id) : payload.conversation_id ? String(payload.conversation_id) : null;

        const inboxObj = (payload.inbox as Record<string, unknown>) ?? {};
        const accountObj = (payload.account as Record<string, unknown>) ?? {};
        const inboxId =
          inboxObj.id !== undefined
            ? String(inboxObj.id)
            : conversation.inbox_id !== undefined
              ? String(conversation.inbox_id)
              : null;
        const accountId =
          accountObj.id !== undefined
            ? String(accountObj.id)
            : payload.account_id !== undefined
              ? String(payload.account_id)
              : null;

        // Attachments (images, voice notes, documents) sent through Chatwoot.
        const attachments = Array.isArray(payload.attachments)
          ? (payload.attachments as Array<Record<string, unknown>>)
          : [];
        const firstAttachment = attachments[0] ?? null;
        const fileType = firstAttachment ? String(firstAttachment.file_type ?? "") : "";
        const kind = !fileType
          ? null
          : fileType.includes("image")
            ? "image"
            : fileType.includes("audio")
              ? "audio"
              : fileType.includes("video")
                ? "video"
                : "document";
        const attachment = firstAttachment
          ? {
              url: (firstAttachment.data_url as string | undefined) ?? null,
              mime: fileType || null,
              kind,
            }
          : null;

        // Stable id so webhook retries and manual inbox syncs never duplicate.
        const externalId =
          payload.id !== undefined && accountId ? `cw:${accountId}:${payload.id}` : null;

        // The contact identity can live in several places depending on the
        // Chatwoot channel; for outgoing (agent) messages `sender` is the agent,
        // so fall back to the conversation's contact.
        const contact = (conversation.meta as Record<string, unknown> | undefined)?.sender as
          | Record<string, unknown>
          | undefined;
        const contactInboxSource = (conversation.contact_inbox as Record<string, unknown> | undefined)
          ?.source_id as string | undefined;
        const isIncoming = !messageType || messageType === "incoming";
        const identitySource = isIncoming ? sender : (contact ?? sender);

        const phone =
          (identitySource?.phone_number as string) ||
          (identitySource?.identifier as string) ||
          contactInboxSource ||
          (contact?.phone_number as string) ||
          (identitySource?.id !== undefined ? `chatwoot-${identitySource.id}` : null);

        const contactId =
          (isIncoming ? sender.id : contact?.id) !== undefined
            ? String(isIncoming ? sender.id : contact?.id)
            : null;

        if (!phone || (!content && !attachment)) {
          return new Response(JSON.stringify({ ok: true, ignored: "missing phone or content" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          // Outgoing messages (an agent replying from the Chatwoot UI, bot or
          // template) are mirrored into the app timeline as history — they must
          // not re-enter the AI pipeline.
          if (!isIncoming) {
            if (messageType === "activity") {
              return new Response(JSON.stringify({ ok: true, ignored: "activity" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              });
            }
            const { recordOutboundEcho } = await import("@/lib/admissions.server");
            const echo = await recordOutboundEcho({
              phone: String(phone),
              message: content || `[${kind ?? "attachment"}]`,
              externalId,
              chatwootConversationId: conversationId,
              chatwootContactId: contactId,
              chatwootInboxId: inboxId,
              chatwootAccountId: accountId,
              sender: payload.private === true ? "note" : "human",
              attachment,
            });
            return new Response(JSON.stringify({ ok: true, mirrored: true, ...echo }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          const { processInboundMessage } = await import("@/lib/admissions.server");
          const result = await processInboundMessage({
            phone: String(phone),
            message: content || `[${kind ?? "attachment"}]`,
            chatwootConversationId: conversationId,
            chatwootContactId: contactId,
            chatwootInboxId: inboxId,
            chatwootAccountId: accountId,
            externalId,
            attachment,
          });
          return new Response(JSON.stringify({ ok: true, ...result }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          console.error("Webhook processing error:", e);
          return new Response(JSON.stringify({ ok: false, error: "processing_failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },

    },
  },
});
