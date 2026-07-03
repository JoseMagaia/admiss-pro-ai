import { createFileRoute } from "@tanstack/react-router";

// TwiML endpoint for Twilio Programmable Voice. A Twilio "TwiML App" points its
// Voice Request URL here; when a browser softphone (Twilio Voice SDK) places an
// outbound call, Twilio POSTs the `To` (and `CallerId`) params it received from
// the client and expects TwiML describing what to do. We simply bridge the call
// to the dialed number using the provided caller id.
//
// This lives under /api/public/* because Twilio is an external caller. It returns
// no PII and performs no writes.
function xmlEscape(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function sanitizeNumber(v: string): string {
  // Allow a leading + and digits only (E.164-ish), plus SIP/client identifiers.
  const trimmed = v.trim().slice(0, 60);
  if (/^\+?[0-9\s\-().]+$/.test(trimmed)) return trimmed.replace(/[\s\-().]/g, "");
  return "";
}

async function buildTwiml(params: URLSearchParams): Promise<Response> {
  const to = sanitizeNumber(params.get("To") ?? "");
  const callerId = sanitizeNumber(params.get("CallerId") ?? params.get("callerId") ?? "");

  let twiml: string;
  if (!to) {
    twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>No destination number was provided.</Say></Response>`;
  } else {
    const dialAttrs = callerId ? ` callerId="${xmlEscape(callerId)}"` : "";
    twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Dial${dialAttrs} answerOnBridge="true"><Number>${xmlEscape(to)}</Number></Dial></Response>`;
  }
  return new Response(twiml, { status: 200, headers: { "Content-Type": "text/xml" } });
}

export const Route = createFileRoute("/api/public/voip/twiml")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData().catch(() => null);
        const params = new URLSearchParams();
        if (form) for (const [k, v] of form.entries()) params.set(k, String(v));
        return buildTwiml(params);
      },
      GET: async ({ request }) => {
        const url = new URL(request.url);
        return buildTwiml(url.searchParams);
      },
    },
  },
});
