# Incoming Calls, Inbound Routes & Ring Groups

Extend the Calls (PBX) feature so agents can **receive** calls, not just place them. Super admins define **ring groups** (a set of agents) and **inbound routes** that map each inbound phone number (DID) to a ring group. When a call arrives at a Twilio number, every online agent in the mapped group rings at once; the first to answer takes the call. For SIP/WebRTC, agents simply answer incoming calls — ring-group fan-out stays configured on your PBX.

## Decisions (from your answers)
- **Ring strategy:** ring all group members simultaneously.
- **Routing:** per-number (DID → ring group).
- **SIP:** app only answers incoming SIP calls; ring groups for SIP live on the PBX.

## Database (new space-scoped tables)
1. `ring_groups` — `name`, `ring_seconds` (default 20), `active`, `created_by`.
2. `ring_group_members` — `ring_group_id`, `user_id`, `position`.
3. `inbound_routes` — `did` (the inbound number, E.164), `ring_group_id`, `active`, `UNIQUE(space_id, did)`; optional `no_answer_action` (`hangup`|`voicemail`, v1 = hangup).

Each table: `CREATE TABLE` → `GRANT ALL … TO service_role` → `ENABLE ROW LEVEL SECURITY` (default-deny; access flows through server functions like the existing calls tables) → `updated_at` trigger. All three added to `TENANT_TABLES` in `space-context.server.ts`. A `voip_settings.inbound_enabled` boolean is added so super admins can turn incoming on/off per Space.

## Stable agent identity
Inbound TwiML must ring specific browser clients, so agent identities become deterministic and collision-free. A shared `agentIdentity(userId)` helper (full UUID, no dashes) replaces the current `agent_${userId.slice(0,8)}`, used both when minting the Twilio token and when building inbound TwiML.

## Server functions — `src/lib/calls.functions.ts`
- Ring groups (super admin): `listRingGroups`, `saveRingGroup` (name, ring_seconds, active + member user_ids), `deleteRingGroup`.
- Inbound routes (super admin): `listInboundRoutes`, `saveInboundRoute` (did → ring_group_id), `deleteInboundRoute`.
- `listSpaceAgents` — returns the Space's users (id + display name) to populate the ring-group member picker (reusing the existing user-listing logic).
- `getVoipClientConfig` — already sets Twilio `incoming.allow = true`; also return the agent's client `identity` and honor `inbound_enabled`.

## Twilio inbound route — `src/routes/api/public/voip/inbound.ts`
New public endpoint (Twilio is an external caller). On an inbound call Twilio POSTs `To` (the called DID) and `From`. The handler, using the unscoped admin client (no session on webhooks):
1. Looks up `inbound_routes` by `did = To` → its `ring_group` and members.
2. Returns TwiML `<Dial timeout={ring_seconds} callerId={From}><Client>{identity}</Client>…</Dial>` for each active member so all ring simultaneously.
3. No match / empty group → polite `<Say>` + hang up. Input is validated; no PII beyond the phone numbers Twilio already holds.

Super admins point each Twilio number's **Voice webhook** at the stable `project--{id}.lovable.app/api/public/voip/inbound` URL (surfaced in the settings UI like the existing TwiML URL).

## Softphone — `src/hooks/useSoftphone.ts`
- **Register on mount** for authenticated users when calling is enabled + `inbound_enabled`, so agents can receive calls without first dialing out.
  - Twilio: create the `Device` up front and handle `device.on("incoming", …)`.
  - SIP: connect + register the `SimpleUser` and handle the `onCallReceived` delegate.
- New state: `incoming`, `incomingFrom`, plus `accept()` and `reject()`; `direction` (`inbound`/`outbound`) tracked through the call lifecycle. Existing outbound flow is unchanged.

## Frontend
- `CallsTab.tsx`: an **incoming-call banner/modal** (caller number, Accept / Reject). Accept transitions into the existing live-call bar; inbound calls are logged via `logCall({ direction: "inbound" })` and flow through the same outcome/notes/reschedule dialog. History already shows a `direction` column.
- Telephony settings (super admin, under the existing `telephony` section): new `RingGroupsManager` (create groups, pick member agents, set ring seconds) and `InboundRoutesManager` (map a number to a ring group), plus an "Enable incoming calls" switch and the inbound webhook URL, added to `VoipSettingsForm`.

## Wiring
- `roles.ts`: ring groups & inbound routes live under the existing super-admin `telephony` settings section — no new role entries.
- `src/integrations/supabase/types.ts` regenerates after the migration is approved; server functions and UI that reference the new tables come after.

## Out of scope (v1)
Voicemail recording/boxes, IVR menus, sequential/round-robin ring, call transfer, and inbound analytics.
