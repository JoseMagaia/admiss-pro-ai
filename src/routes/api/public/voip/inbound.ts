import { createFileRoute } from "@tanstack/react-router";

// Inbound TwiML endpoint for Twilio Programmable Voice. A Twilio number's Voice
// webhook (HTTP POST) points here. When a call arrives Twilio POSTs `To` (the
// dialed DID) and `From`. We look up the inbound route for that number, resolve
// its ring group, and return TwiML that rings every active member's browser
// client simultaneously.
//
// Lives under /api/public/* because Twilio is an external caller. It performs no
// writes and returns only the phone numbers Twilio already holds. There is no
// authenticated session on a webhook, so it uses the unscoped admin client.

function xmlEscape(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function sanitizeNumber(v: string): string {
  const trimmed = v.trim().slice(0, 60);
  if (/^\+?[0-9\s\-().]+$/.test(trimmed)) return trimmed.replace(/[\s\-().]/g, "");
  return "";
}

// Matches agentIdentity() in src/lib/calls.functions.ts.
function agentIdentity(userId: string): string {
  return `agent_${userId.replace(/-/g, "")}`;
}

function say(message: string): Response {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>${xmlEscape(message)}</Say><Hangup/></Response>`;
  return new Response(twiml, { status: 200, headers: { "Content-Type": "text/xml" } });
}

async function buildInboundTwiml(params: URLSearchParams): Promise<Response> {
  const to = sanitizeNumber(params.get("To") ?? "");
  const from = sanitizeNumber(params.get("From") ?? "");
  if (!to) return say("This number is not configured.");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Match the DID with or without a leading "+".
  const candidates = to.startsWith("+") ? [to, to.slice(1)] : [to, `+${to}`];
  const { data: route } = await supabaseAdmin
    .from("inbound_routes")
    .select("ring_group_id, active")
    .in("did", candidates)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  const r = route as { ring_group_id: string | null; active: boolean } | null;
  if (!r || !r.ring_group_id) return say("Sorry, no one is available to take your call right now.");

  const { data: group } = await supabaseAdmin
    .from("ring_groups")
    .select("ring_seconds, active")
    .eq("id", r.ring_group_id)
    .maybeSingle();
  const g = group as { ring_seconds: number; active: boolean } | null;
  if (!g || !g.active) return say("Sorry, no one is available to take your call right now.");

  const { data: members } = await supabaseAdmin
    .from("ring_group_members")
    .select("user_id, position")
    .eq("ring_group_id", r.ring_group_id)
    .order("position", { ascending: true });
  const memberRows = (members as Array<{ user_id: string }> | null) ?? [];
  if (!memberRows.length) return say("Sorry, no one is available to take your call right now.");

  const timeout = Math.max(5, Math.min(120, Number(g.ring_seconds) || 20));
  const callerAttr = from ? ` callerId="${xmlEscape(from)}"` : "";
  const clients = memberRows
    .map((m) => `<Client>${xmlEscape(agentIdentity(m.user_id))}</Client>`)
    .join("");
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Dial${callerAttr} timeout="${timeout}" answerOnBridge="true">${clients}</Dial></Response>`;
  return new Response(twiml, { status: 200, headers: { "Content-Type": "text/xml" } });
}

export const Route = createFileRoute("/api/public/voip/inbound")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData().catch(() => null);
        const params = new URLSearchParams();
        if (form) for (const [k, v] of form.entries()) params.set(k, String(v));
        return buildInboundTwiml(params);
      },
      GET: async ({ request }) => {
        const url = new URL(request.url);
        return buildInboundTwiml(url.searchParams);
      },
    },
  },
});
