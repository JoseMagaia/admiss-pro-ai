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

        for (const entry of entries) {
          const changes = Array.isArray(entry.changes) ? (entry.changes as Array<Record<string, unknown>>) : [];
          for (const change of changes) {
            if (change.field !== "messages") continue;
            const value = (change.value as Record<string, unknown>) ?? {};
            const metadata = (value.metadata as Record<string, unknown>) ?? {};
            const phoneNumberId = metadata.phone_number_id !== undefined ? String(metadata.phone_number_id) : null;
            const messages = Array.isArray(value.messages) ? (value.messages as Array<Record<string, unknown>>) : [];

            for (const msg of messages) {
              const from = msg.from !== undefined ? String(msg.from) : "";
              const phone = from.replace(/[^0-9]/g, "");
              if (!phone) continue;

              // Extract text or a description of the media/interactive event.
              let content = "";
              const type = String(msg.type ?? "");
              if (type === "text") {
                content = String((msg.text as Record<string, unknown>)?.body ?? "").trim();
              } else if (type === "interactive") {
                const inter = (msg.interactive as Record<string, unknown>) ?? {};
                const btn = (inter.button_reply as Record<string, unknown>) ?? {};
                const list = (inter.list_reply as Record<string, unknown>) ?? {};
                content = String(btn.title ?? list.title ?? "").trim();
              } else if (type === "image" || type === "video" || type === "audio" || type === "document") {
                const media = (msg[type] as Record<string, unknown>) ?? {};
                content = String(media.caption ?? `[${type} attachment]`).trim();
              } else if (type === "button") {
                content = String((msg.button as Record<string, unknown>)?.text ?? "").trim();
              }
              if (!content) continue;

              try {
                const { processInboundMessage } = await import("@/lib/admissions.server");
                const result = await processInboundMessage({
                  phone,
                  message: content,
                  // Reuse the "instance" identifier slot to look up the WA
                  // workspace by its phone_number_id (resolveWorkspace knows both).
                  evolutionInstance: phoneNumberId,
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

        return new Response(JSON.stringify({ ok: true, processed: results.length }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
