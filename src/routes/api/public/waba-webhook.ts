import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";

// Official WhatsApp Business Platform (WABA / Cloud API) webhook.
//
// 1. In Meta's app dashboard, add this URL as a webhook callback for the
//    "messages" field: {origin}/api/public/waba-webhook
// 2. Use the Verify Token stored on the connection as the verify token.
// 3. Meta sends a GET challenge (verified below), then delivers inbound
//    messages via signed POSTs (X-Hub-Signature-256, verified with the app
//    secret stored on the connection).

function sha256Signature(secret: string, rawBody: string): string {
  return "sha256=" + createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  try {
    const ab = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    return ab.length === bb.length && timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

// Find the WABA connection that owns a phone number id and use its stored
// verify token / app secret for the handshake and signature checks.
async function wabaWorkspace(phoneNumberId?: string | null) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("chatwoot_workspaces")
    .select("id, waba_verify_token, waba_app_secret, waba_phone_number_id")
    .eq("provider_type", "waba");
  const rows = (data as Array<Record<string, unknown>>) ?? [];
  if (phoneNumberId) {
    const byNumber = rows.find(
      (w) => String(w.waba_phone_number_id ?? "").trim() === String(phoneNumberId).trim(),
    );
    if (byNumber) return byNumber;
  }
  return rows[0] ?? null;
}

export const Route = createFileRoute("/api/public/waba-webhook")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");
        if (mode === "subscribe" && token) {
          const ws = await wabaWorkspace(null);
          const expected = String((ws as Record<string, unknown> | null)?.waba_verify_token ?? "");
          if (expected && safeEqual(token, expected)) {
            return new Response(challenge ?? "ok", {
              status: 200,
              headers: { "Content-Type": "text/plain" },
            });
          }
          // Fall back to the env-provided verify token so local/dev setups work
          // before any connection is saved.
          if (process.env.WABA_VERIFY_TOKEN && safeEqual(token, process.env.WABA_VERIFY_TOKEN)) {
            return new Response(challenge ?? "ok", {
              status: 200,
              headers: { "Content-Type": "text/plain" },
            });
          }
        }
        return new Response("Forbidden", { status: 403 });
      },
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("x-hub-signature-256") ?? "";

        // Resolve the owning connection from the payload's phone number id so we
        // verify with the right app secret.
        let phoneNumberId: string | null = null;
        let payload: Record<string, unknown>;
        try {
          payload = JSON.parse(rawBody) as Record<string, unknown>;
          const entry = (payload.entry as Array<Record<string, unknown>>) ?? [];
          const change = (entry[0]?.changes as Array<Record<string, unknown>>) ?? [];
          const value = (change[0]?.value as Record<string, unknown>) ?? {};
          phoneNumberId =
            ((value.metadata as Record<string, unknown> | null | undefined)?.phone_number_id as string | null) ??
            null;
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const ws = await wabaWorkspace(phoneNumberId);
        const appSecret = String((ws as Record<string, unknown> | null)?.waba_app_secret ?? "").trim();

        if (appSecret) {
          const expected = sha256Signature(appSecret, rawBody);
          if (!signature || !safeEqual(signature, expected)) {
            return new Response(JSON.stringify({ error: "Invalid signature" }), {
              status: 403,
              headers: { "Content-Type": "application/json" },
            });
          }
        } else {
          // No app secret stored on the connection yet — accept but warn loudly.
          console.warn("[waba-webhook] No app secret configured on the connection; signature not verified.");
        }

        // Meta "statuses" updates are delivery receipts — acknowledge and ignore.
        const entry = (payload.entry as Array<Record<string, unknown>>) ?? [];
        const value = ((entry[0]?.changes as Array<Record<string, unknown>>) ?? [0])[0]?.value as
          | Record<string, unknown>
          | undefined;
        const messages = (value?.messages as Array<Record<string, unknown>>) ?? [];
        const statuses = (value?.statuses as Array<Record<string, unknown>>) ?? [];

        const results: unknown[] = [];
        for (const msg of messages) {
          // Skip messages we sent ourselves.
          if (msg.from === undefined) continue;
          const textObj = (msg.text as Record<string, unknown> | null | undefined) ?? {};
          const content = String(textObj.body ?? "").trim();
          const from = String(msg.from ?? "").replace(/[^0-9]/g, "");
          if (!from || !content) continue;
          try {
            const { processInboundMessage } = await import("@/lib/admissions.server");
            const result = await processInboundMessage({
              phone: from,
              message: content,
              wabaPhoneNumberId: phoneNumberId,
            });
            results.push(result);
          } catch (e) {
            console.error("WABA webhook processing error:", e);
            return new Response(JSON.stringify({ ok: false, error: "processing_failed" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }
        }

        return new Response(
          JSON.stringify({ ok: true, messages: messages.length, statuses: statuses.length, processed: results.length }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
