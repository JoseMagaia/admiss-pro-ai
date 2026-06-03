import { createFileRoute } from "@tanstack/react-router";

// Chatwoot sends webhook events here. Configure this URL as the webhook in Chatwoot.
// Supported events: message_created, conversation_created, conversation_updated.
export const Route = createFileRoute("/api/public/chatwoot-webhook")({
  server: {
    handlers: {
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

        if (messageType && messageType !== "incoming") {
          return new Response(JSON.stringify({ ok: true, ignored: "non-incoming" }), {
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

        const phone =
          (sender.phone_number as string) ||
          (sender.identifier as string) ||
          (conversation.contact_inbox &&
            ((conversation.contact_inbox as Record<string, unknown>).source_id as string)) ||
          (sender.id !== undefined ? `chatwoot-${sender.id}` : null);

        const contactId = sender.id !== undefined ? String(sender.id) : null;

        if (!phone || !content) {
          return new Response(JSON.stringify({ ok: true, ignored: "missing phone or content" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const { processInboundMessage } = await import("@/lib/admissions.server");
          const result = await processInboundMessage({
            phone: String(phone),
            message: content,
            chatwootConversationId: conversationId,
            chatwootContactId: contactId,
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
