import { createFileRoute } from "@tanstack/react-router";

// Evolution API sends webhook events here. Configure this URL as the webhook on
// your Evolution instance (POST {evolution_url}/webhook/set/{instance}) with the
// MESSAGES_UPSERT event enabled. The workspace is matched by the `instance` name.
// Supported event: messages.upsert (incoming WhatsApp text messages).
export const Route = createFileRoute("/api/public/evolution-webhook")({
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

        // Normalize the event name ("messages.upsert" or "MESSAGES_UPSERT").
        const event = String(payload.event ?? "").toLowerCase().replace(/_/g, ".");
        if (event && event !== "messages.upsert") {
          return new Response(JSON.stringify({ ok: true, ignored: event }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        const instance = payload.instance !== undefined ? String(payload.instance) : null;

        // `data` may be a single message object or an array of them.
        const rawData = payload.data;
        const items = Array.isArray(rawData)
          ? (rawData as Array<Record<string, unknown>>)
          : rawData
            ? [rawData as Record<string, unknown>]
            : [];

        const results: unknown[] = [];

        for (const item of items) {
          const key = (item.key as Record<string, unknown>) ?? {};
          const remoteJid = key.remoteJid !== undefined ? String(key.remoteJid) : "";
          const fromMe = key.fromMe === true;

          // Skip our own outbound messages and group chats.
          if (fromMe || !remoteJid || remoteJid.endsWith("@g.us")) continue;

          const messageObj = (item.message as Record<string, unknown>) ?? {};
          const extended = (messageObj.extendedTextMessage as Record<string, unknown>) ?? {};
          const image = (messageObj.imageMessage as Record<string, unknown>) ?? {};
          const video = (messageObj.videoMessage as Record<string, unknown>) ?? {};
          const content = String(
            (messageObj.conversation as string) ||
              (extended.text as string) ||
              (image.caption as string) ||
              (video.caption as string) ||
              "",
          ).trim();

          const phone = remoteJid.replace(/@.*$/, "").replace(/[^0-9]/g, "");
          if (!phone || !content) continue;

          try {
            const { processInboundMessage } = await import("@/lib/admissions.server");
            const result = await processInboundMessage({
              phone,
              message: content,
              evolutionInstance: instance,
            });
            results.push(result);
          } catch (e) {
            console.error("Evolution webhook processing error:", e);
            return new Response(JSON.stringify({ ok: false, error: "processing_failed" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }
        }

        return new Response(JSON.stringify({ ok: true, processed: results.length }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
