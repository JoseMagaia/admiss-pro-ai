Goal: ship five improvements without breaking existing behavior or losing data. No destructive schema changes — the Disqualified stage and new conversations reuse existing tables/columns.

## 1. Click-to-message from every lead-info surface

Add a shared way to jump to the Messages tab with a specific conversation open.

- In `src/routes/_authenticated/dashboard.tsx`: create a small React context (`DashboardNavContext`) providing `openConversation(phone: string)`. It sets the active tab to `messages` and stores a `pendingConversation` phone in state. Wrap the main content with the provider.
- In `MessagesTab.tsx`: read the context, and on mount / when `pendingConversation` changes, set `active` to that phone (and clear the pending value). This works even on mobile (opens the thread directly).
- Wire click handlers (cursor-pointer + a small message icon) into:
  - `PipelineTab.tsx` — each kanban card calls `openConversation(l.phone_number)` (kept separate from the drag handle so dragging still works).
  - `ContactsTab.tsx` — each row / a message button per contact.
  - `LeadsTab.tsx` — make the phone/name cell or a new action button open the conversation.
- If the phone has no message history yet, Messages still opens that thread (empty timeline) so the agent can send the first message.

## 2. Full-text search inside Messages

In `MessagesTab.tsx`, change `filteredConvs` so a search term matches when the phone number OR any message body in that conversation contains the term. Keep the existing phone match. (Search stays client-side over the already-loaded messages — no backend change.)

## 3. Disqualified pipeline stage + summary card

- `src/lib/pipeline.ts`: add `DISQUALIFIED` to `QUALIFICATION_STAGES`, a `STAGE_LABELS` entry ("Disqualified"), a new `PIPELINE_COLUMNS` entry `{ id: "disqualified", label: "Disqualified", stages: ["DISQUALIFIED"] }`, and a `LEAD_FILTERS` entry.
- `src/components/dashboard/StageBadge.tsx`: add a `disqualified` color style (muted/destructive tone).
- `src/lib/meeting-outcomes.ts`: change the `not_qualified` outcome `stage` from `NEW_LEAD` to `DISQUALIFIED` so recording "Not Qualified" moves the lead into the new column (existing leads already at NEW_LEAD are untouched).
- Summary cards: extend `getDashboardStats` in `dashboard.functions.ts` to also return `disqualified` (count of leads with `qualification_status = 'DISQUALIFIED'`). In `DashboardStats.tsx` add a "Disqualified" card and adjust the grid to fit 5 cards responsively.

## 4. Agent-initiated new conversation for an unregistered lead

Let an agent start a brand-new conversation that creates full lead data just like an inbound lead, sending through a chosen Chatwoot workspace.

- New server helper in `admissions.server.ts`: `createChatwootConversation({ creds, inboxId, phone, name })` — best-effort POST to Chatwoot to create a contact + conversation, returning the new `conversation_id` (or null if Chatwoot isn't configured). Reuses existing `resolveWorkspace` / `resolveCreds`; reads the workspace `chatwoot_inbox_id`.
- New server fn `startConversation` in `dashboard.functions.ts` (role: any authenticated): validates `{ phone, name?, workspaceId?, message }`. It:
  1. Rejects if a lead with that phone already exists (tells the agent to use the existing conversation).
  2. Calls `getOrCreateLead(phone, conversationId, null, workspaceId)` so the lead appears in Leads, Pipeline, Contacts exactly like a normal lead.
  3. Inserts a `conversations` row (workspace_id, chatwoot_conversation_id, `human_takeover: true`, assigned_agent) so AI doesn't auto-reply to an agent-started thread.
  4. Logs the first outbound message via `whatsapp_messages` and delivers it through Chatwoot (`deliverHumanMessage` / `sendChatwootReply`).
  5. Writes an `audit_logs` entry.
- UI in `MessagesTab.tsx`: add a "New conversation" button above the conversation list opening a dialog with phone, optional name, workspace `Select` (from `listWorkspaces`), and first message. On success, invalidate `leads`/`conversations`/`messages` and open the new thread.

## 5. Recent meeting outcomes visibility / edit button

In `MeetingOutcomesTab.tsx`, the recent-outcomes table currently sits in the right cell of a `lg:grid-cols-[420px_1fr]` grid and gets clipped, hiding the Edit countdown/Delete columns. Restructure so the "Record Meeting Outcome" form and the "Recent Outcomes" table stack vertically (form on top, full-width table below) — or at minimum give the table its own full-width row under the grid. This guarantees the Edit (countdown) and Delete actions are always visible. Keep all existing columns, the 1-minute edit window logic, and delete behavior intact.

## Technical notes

- No schema/migration needed: `DISQUALIFIED` is just a new `qualification_status` string value; new conversations reuse `leads`/`conversations`/`whatsapp_messages`.
- Click-to-message uses a context rather than URL params to avoid touching routing; tab + active-thread state stays in React.
- `startConversation` is guarded so AI stays paused on agent-started threads (human_takeover true), matching how `sendHumanMessage` behaves.
- All new server reads/writes go through the existing `admin()` + `guard()`/`isAuthed()` helpers; tokens are never exposed to the browser.

## Verification

- Build passes (run automatically).
- Click a Pipeline card / Contact / Lead → Messages opens that thread.
- Search "scholarship" in Messages → conversations containing that word in any message appear.
- Pipeline shows a Disqualified column; recording "Not Qualified" moves a lead there; summary cards show the Disqualified count.
- "New conversation" with a fresh number creates a lead (visible in Leads/Pipeline/Contacts) and sends the first message via the chosen workspace.
- Meeting Outcomes: recent list and its Edit countdown + Delete are fully visible without horizontal clipping.