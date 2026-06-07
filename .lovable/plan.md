# Advanced platform upgrades

Three independent features, all additive. Nothing existing is removed; new fields default to current behavior.

## 1. Workflow "time to a goal" (countdown) steps

Today each message step only has a relative "wait" delay. We add a per-step **anchor** so steps can fire relative to a deadline.

**Database** (`workflow_enrollments`): add nullable `goal_at timestamptz`. Backfill not needed.

**Step data model** (stored in workflow `graph` JSON, backward compatible):
- `anchor`: `"wait"` (default, = today's behavior), `"before_goal"`, or `"before_appointment"`.
- existing `delayValue`/`delayUnit` keep meaning "wait" timing.
- new `offsetValue`/`offsetUnit` mean "how long before the goal/appointment".

**Builder UI** (`WorkflowBuilder.tsx`): in the step editor add an anchor selector. For `before_goal`/`before_appointment` show an offset (value + unit) and "send before the date" wording. Message node card shows the anchor. Add an optional **default goal offset** note; the per-lead goal date itself is set at assignment time (feature 2).

**Engine** (`admissions.server.ts`): extend `WorkflowStep` to carry `anchor` + `offsetMs`. `orderedSteps` reads the new fields. In `processWorkflows` advance logic, compute `next_run_at`:
- `wait`: `now + delayMs` (unchanged path).
- `before_goal`: `goal_at − offsetMs` (skip/stop if no `goal_at`).
- `before_appointment`: look up the lead's next appointment date, `apptDate − offsetMs`.
If the computed time is already past, it runs on the next tick (clamped to now). Enrollment insert stores `goal_at` when provided.

## 2. Assign multiple workflows to a lead (chat + pipeline)

Leads can already have multiple enrollments; we add management UI + scoped server functions (admin + super, matching existing `pauseLeadWorkflow`).

**Server functions** (`dashboard.functions.ts`):
- `listLeadWorkflows({ phone })` → that lead's enrollments joined to workflow name/status/step + active workflow list to pick from.
- `assignLeadWorkflow({ phone, workflowId, goalAt? })` → enroll (reuses existing enroll helper), stores `goal_at`, audit-logged.
- `removeLeadWorkflow({ phone, workflowId })` → stop/remove that enrollment, audit-logged.

**Shared component** `LeadWorkflowManager.tsx`: lists assigned workflows with remove buttons, an "add workflow" picker, and an optional goal-date input. Used in:
- **Messages chat window** (`MessagesTab.tsx`): a popover/section in the open conversation.
- **Pipeline kanban lead card** (`PipelineTab.tsx`): a control on the card/its detail.

## 3. AI Insights: bigger snapshot, agentic mode, model choice

**Expanded snapshot** (`advanced.functions.ts buildAnalytics`): add an optional richer block with recent message contents + timestamps (bounded count) and light per-lead detail, so the assistant can answer content/timing questions. Size-capped to protect tokens.

**Agentic mode (confirm each action)**:
- New `generateAgentReply` server fn (guarded by existing `guardAdvanced`) calls the gateway with a tool schema for safe actions: move lead stage, edit lead fields, assign/remove workflow, set opportunity values. It does **not** execute — it returns proposed actions.
- UI renders each proposed action as a card with **Approve / Dismiss**. Approve calls `executeAgentAction({ action, args })` (also `guardAdvanced`) which performs the single DB change and is audit-logged.
- A toggle switches the panel between "Insights" (current chat) and "Agentic" mode.

**Model provider choice**: in the Insights panel add a selector — **Built-in**, **Use AI Settings provider** (reads `ai_configuration` custom provider), or **Custom** (enter provider/base URL/model/key for that session). Passed through to `generateChatReply`/`generateAgentReply`; default stays built-in so current behavior is unchanged.

**Access**: agentic + custom-model gated by the Advanced permission (same as the Advanced tab).

## Technical notes / safety
- All new DB columns are nullable with safe defaults; one migration for `workflow_enrollments.goal_at`.
- Step `anchor` defaults to `wait`, so every existing workflow runs identically.
- Agentic writes go one-at-a-time only after explicit approval; each is validated with Zod and audit-logged.
- No changes to the cron auth, webhook, or existing trigger types.

## Files
- Migration: `workflow_enrollments.goal_at`
- `src/lib/orchestration.ts` (anchor constants/types, offset helper)
- `src/lib/admissions.server.ts` (steps + processing)
- `src/lib/dashboard.functions.ts` (lead-workflow assign/remove/list, enroll goal_at)
- `src/components/dashboard/orchestration/WorkflowBuilder.tsx` (anchor UI)
- `src/components/dashboard/LeadWorkflowManager.tsx` (new, shared)
- `src/components/dashboard/MessagesTab.tsx` + `PipelineTab.tsx` (mount manager)
- `src/lib/advanced.functions.ts` (snapshot, agent reply, execute action, model override)
- `src/components/dashboard/advanced/ReportsTab.tsx` (mode toggle, approvals, model picker)
