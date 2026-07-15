# Messages Filters, WhatsApp Cloud API & Media/Voice

## 1. Messages tab — conversation filters

Add a filter bar above the search input in `MessagesTab.tsx`:

- **Sort by**: "Recent activity" (default) | "Unread from lead" | "Oldest waiting reply"
- **Responder**: All | AI active | Human takeover
- **Direction (last message)**: Any | From lead | From AI | From agent
- **Time window**: Any | Last hour | Today | This week

Filters are applied client-side over the existing paginated thread list using fields already returned by `listMessageThreads` (`last_sender`, `last_message_at`, `human_takeover`). For "Oldest waiting reply", sort ascending on `last_message_at` when `last_sender === "lead"`. No backend change needed.

## 2. WhatsApp Cloud API (Meta / Facebook) as a third workspace provider

Extend `chatwoot_workspaces` (already the multi-inbox table) with a new `provider_type = "whatsapp_cloud"` plus columns:

- `wa_phone_number_id` (Meta phone number ID)
- `wa_business_account_id` (WABA id, optional)
- `wa_access_token` (permanent system-user token, stored server-side)
- `wa_verify_token` (per-workspace webhook verify token)
- `wa_app_secret` (for X-Hub-Signature-256 verification, optional but recommended)

### Webhook route (new)
`src/routes/api/public/whatsapp-webhook.ts`
- `GET` → Meta verification handshake (`hub.mode`, `hub.verify_token`, `hub.challenge`). Matches against any workspace's `wa_verify_token`.
- `POST` → validates signature (if `wa_app_secret` set), extracts `entry[].changes[].value.messages[]`, resolves workspace by `metadata.phone_number_id`, and calls the existing `processInboundMessage()` so AI/workflows/campaigns behave identically to Chatwoot & Evolution.
- Supports text, image, audio (voice notes), video, document, and button/interactive replies (extracts the button title/payload as message text).

### Outbound delivery (extend `admissions.server.ts`)
In `deliverToWorkspace`/`deliverHumanMessage`, add a branch for `provider_type === "whatsapp_cloud"` that POSTs to `https://graph.facebook.com/v20.0/{phone_number_id}/messages`:
- Text messages → `type: "text"`.
- Media attachments → upload via `/media` endpoint first to get a media ID, then `type: image|audio|video|document`.
- Interactive buttons → `type: "interactive", interactive: { type: "button", body, action: { buttons: [...] } }` (up to 3 reply buttons; AI/human can trigger via a small helper).

### Settings UI (extend `ChatwootWorkspaces.tsx`)
Add "WhatsApp Cloud API (Meta)" to the provider dropdown and render its fields; add "Copy webhook URL" and "Copy verify token" affordances, plus a "Test connection" call that hits `GET /{phone_number_id}?fields=display_phone_number`.

## 3. File uploads & voice notes in Messages

### Storage
Create a private storage bucket `message-media` with RLS restricting reads/writes to authenticated members of the owning space. Files stored under `{space_id}/{conversation}/{uuid}.{ext}`.

### Composer additions in `MessagesTab.tsx`
- Paperclip button → hidden `<input type="file" accept="image/*,audio/*,video/*,application/pdf">` (multi).
- Mic button → uses `MediaRecorder` (webm/opus) with press-and-hold + tap-to-lock; shows waveform-less timer and Send/Delete.
- Selected attachments render as chips above the textarea before sending.

### New server function `sendHumanMessageWithMedia(phone, message?, attachments[])`
- Uploads each attachment to `message-media` via signed upload, then persists a `whatsapp_messages` row per attachment and reuses provider-specific delivery:
  - **WhatsApp Cloud**: upload to Meta `/media`, then send `type: image|audio|document`.
  - **Chatwoot**: POST `multipart/form-data` to `/conversations/{id}/messages` with `attachments[]`.
  - **Evolution**: POST to `/message/sendMedia/{instance}` or `/message/sendWhatsAppAudio/{instance}` for voice.
- On failure, degrade to sending a signed URL as text so nothing is lost.

### Interactive button sender (optional utility)
A small "Send buttons" popover on the composer (WhatsApp Cloud workspace only) that lets the agent add up to 3 quick-reply buttons before sending.

## 4. Inbound media rendering
`listConversationMessages` already returns `message_content`; extend it to also return `attachment_url`, `attachment_mime` from `whatsapp_messages`. The message bubble renders `<img>`, `<audio controls>`, `<video>`, or a download link depending on MIME.

## Technical

- Migration: add WA columns to `chatwoot_workspaces`; add `attachment_url`, `attachment_mime`, `attachment_type` to `whatsapp_messages`; create `message-media` storage bucket + RLS policies.
- New file: `src/routes/api/public/whatsapp-webhook.ts`.
- Edits: `src/lib/admissions.server.ts` (outbound switch + media helpers), `src/lib/dashboard.functions.ts` (`sendHumanMessageWithMedia`, workspace CRUD accepts WA fields, `listConversationMessages` returns attachment fields), `src/components/dashboard/settings/ChatwootWorkspaces.tsx` (WA form + provider option), `src/components/dashboard/MessagesTab.tsx` (filter bar, attachment/voice composer, media bubble rendering).
- No changes to AI engine, workflows, or campaigns — inbound path funnels through the existing `processInboundMessage`, so all downstream automations keep working.

Confirm and I'll implement.
