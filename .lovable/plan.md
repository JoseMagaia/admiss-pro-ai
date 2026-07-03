# Calls (PBX / VoIP) Tab

Add browser-based calling to the dashboard. Agents can dial contacts manually or run a progressive power dialer through admin-defined dial lists. Calling is powered by a configurable backend (self-hosted SIP over WebRTC, or Twilio Programmable Voice), configured only by super admins. Every call can capture notes and, on no-answer, schedule a callback.

## Scope from your answers
- Backend: configurable per Space — **SIP/WebRTC** or **Twilio**.
- Tab visible to all roles (agent, admin, super admin).
- Power dialer queues from: a pipeline stage/lead filter, a manual queue, or due/no-pickup callbacks — organized as reusable **dial campaigns** created by admins/super admins.
- v1 = calls + notes + reschedule (no recording/transcription).

## Database (new space-scoped tables)
1. `voip_settings` (one row per Space): `provider` (`sip`|`twilio`|`disabled`), SIP fields (`sip_ws_server`, `sip_domain`, `sip_uri`, `sip_username`, `sip_password`, `sip_display_name`), Twilio fields (`twilio_account_sid`, `twilio_api_key_sid`, `twilio_api_key_secret`, `twilio_twiml_app_sid`, `twilio_caller_id`), `enabled`.
2. `calls` (history): `lead_id?`, `phone_number`, `direction`, `agent_user_id`, `status` (`completed`|`no_answer`|`busy`|`failed`|`voicemail`|`canceled`), `started_at`, `ended_at`, `duration_seconds`, `disposition`, `notes`, `provider`, `provider_call_sid`.
3. `call_callbacks`: `lead_id?`, `phone_number`, `agent_user_id`, `scheduled_at`, `status` (`pending`|`done`|`canceled`), `reason`, `notes`, `from_call_id?` — feeds the "due callbacks" dialer queue.
4. `dial_campaigns`: `name`, `source_type` (`stage`|`filter`|`manual`|`callbacks`), `criteria` (jsonb: stage id / lead filter), `active`, `created_by`.
5. `dial_campaign_members` (for manual queues): `campaign_id`, `lead_id`, `phone_number`, `position`, `status` (`pending`|`called`|`skipped`).

All five added to `TENANT_TABLES` in `space-context.server.ts` and follow the existing service-role + `space_id` scoping model. Each `CREATE TABLE` gets GRANTs (`authenticated`, `service_role`), RLS enabled, and default-deny policies (access flows only through server functions, matching the app's existing pattern). `updated_at` triggers via existing `update_updated_at_column`.

## Server functions — `src/lib/calls.functions.ts`
- `getVoipSettings` / `saveVoipSettings` — **super admin only** (`guard(["super_admin"])`).
- `getVoipClientConfig` — any authed user; returns exactly what the browser needs to place calls:
  - SIP: ws server, uri, auth username/password, domain, display name.
  - Twilio: a freshly minted **Voice access token** (HS256 JWT with a Voice grant, signed server-side from the API Key secret using `jose`), plus caller id. Secrets never leave the server except this short-lived token.
- `listCalls`, `logCall` (insert/update a call record + status + notes), `updateCallNotes`.
- `scheduleCallback`, `listCallbacks`, `listDueCallbacks`, `completeCallback`.
- `listDialCampaigns`, `saveDialCampaign`, `deleteDialCampaign` (admin/super admin for writes), `getDialQueue({campaignId})` — resolves the ordered contact list: for `stage`/`filter` computed live from `leads`, for `callbacks` from due `call_callbacks`, for `manual` from `dial_campaign_members`.
- `searchDialContacts({query})` — search `leads` by name/phone for the manual dialer.

## Twilio public route (only when Twilio is the provider)
`src/routes/api/public/voip/twiml.ts` returns TwiML `<Dial callerId="…">{To}</Dial>` for outbound, so a Twilio TwiML App can point its Voice URL at the stable `project--{id}.lovable.app` URL. Validates input; no PII returned.

## Frontend — `src/components/dashboard/CallsTab.tsx`
Sub-navigation (same pattern as `AdvancedTab`/`SettingsTab`):
- **Dialer**: dialpad + number field, contact search box (uses `searchDialContacts`), Call button, live in-call panel (status, timer, mute, hang up). A shared `useSoftphone` hook wraps `sip.js` (`SIP` provider) or `@twilio/voice-sdk` (`twilio` provider) behind one interface (`register/call/hangup/mute/onStatus`), selected from `getVoipClientConfig`. If telephony is disabled/unconfigured, show a friendly "ask your admin to set up calling" state.
- **Power Dialer**: pick a dial campaign → Start session → auto-advances through the resolved queue; after each call a disposition bar captures outcome + notes, and on no-answer offers **Reschedule** (shadcn date-time picker → `scheduleCallback`) before advancing to the next contact.
- **History**: table of `calls` (name, phone, direction, status, duration, time) with a Notes dialog and a "call back" action.
- **Campaigns** (admin/super admin only): create/edit dial campaigns choosing source type and criteria (stage picker reuses pipeline stages; filter reuses `LEAD_FILTERS`).

Call actions log through `logCall`; notes/reschedule reuse the same dialogs across Dialer, Power Dialer, and History.

## Wiring & access
- `src/lib/roles.ts`: add `calls: ["super_admin","admin","agent"]` to `TAB_ACCESS`; add a super-admin-only `telephony` entry to `SETTINGS_ACCESS`; add `CALL_CAMPAIGN` write gating for admins/super admins.
- `dashboard.tsx`: add `Calls` (Phone icon) to `ALL_TABS`, render `<CallsTab />`; optional `calls` feature flag gate mirroring `orchestration`.
- `SettingsTab.tsx`: add a **Telephony** section (Phone icon, super admin only) rendering a new `VoipSettingsForm` (provider dropdown → conditional SIP or Twilio fields) backed by `get/saveVoipSettings`.

## Dependencies
`bun add sip.js @twilio/voice-sdk` (both browser SDKs). `jose` for Worker-safe Twilio token signing (add if not already present). No Node-only packages.

## Technical notes
- SIP registration requires the SIP password to reach the authenticated browser — inherent to any WebRTC softphone; it's returned only to authenticated users via `getVoipClientConfig` and stored server-side otherwise. Twilio secrets stay server-side; only a short-lived Voice token is exposed.
- No recording/transcription in v1.
- Due-callback surfacing is computed on demand in `getDialQueue`/`listDueCallbacks`; no cron needed. A `pg_cron` reminder can be added later if you want proactive alerts.

## Out of scope (v1)
Call recording, transcription, IVR/queues, inbound call routing UI beyond basic inbound answer, and analytics dashboards.