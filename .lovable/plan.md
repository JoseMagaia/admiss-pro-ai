
## Scope

1. Simplify the **Twilio** section of Settings → Telephony to the minimum required to place browser calls.
2. Do **not** add a WhatsApp/Baileys calling provider (per your answer).

## Twilio – what stays vs. what goes

Browser calling with the Twilio Voice SDK cannot work without these 5 values, so all 5 stay as inputs:

- Account SID
- API Key SID
- API Key Secret
- TwiML App SID
- Caller ID (outbound from-number)

Everything else in the current Twilio panel is presentational noise and gets removed or hidden:

- Remove the always-visible **TwiML App Voice URL** callout box and the **Inbound number Voice URL** callout box from the main view. Move both into a single collapsible **"Setup guide"** disclosure at the bottom of the Twilio section so the form is short by default.
- Drop the sample-value placeholders (`ACxxxxxxxx`, `SKxxxxxxxx`, `APxxxxxxxx`, `+15551234567`) and the caller‑ID hint text.
- Group the 5 fields into a tighter 2‑column grid on desktop (Account SID / API Key SID on row 1, API Key Secret full‑width, TwiML App SID / Caller ID on row 3).
- Keep the "leave blank to keep current" behavior for API Key Secret but shorten the placeholder to `••••••••`.

The top‑level **Enable calling** and **Enable incoming calls** switches and the Provider select stay as‑is (they're not Twilio‑specific and are already minimal).

No backend changes: `voip_settings` columns, `saveVoipSettings`, `getVoipClientConfig`, and the TwiML route already accept exactly these fields.

## WhatsApp calling

No code changes. (Explanation for context, not part of the plan: Baileys is a Node.js library that needs a persistent WebSocket and disk state, so it can't run on this app's Cloudflare Workers backend, and even where it does run it only signals calls — it has no audio pipeline. So there's no viable in‑app implementation, and per your answer we're dropping it.)

## Files touched

- `src/components/dashboard/settings/VoipSettingsForm.tsx` — restructure the Twilio card only; SIP card and top switches untouched.

## Out of scope

- SIP section
- `useSoftphone`, calls table, dialer, ring groups, inbound routes
- Any DB migration
