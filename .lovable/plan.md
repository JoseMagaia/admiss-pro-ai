# Spaces (multi-tenant SaaS) + expanded Agentic AI

Two features. Everything is additive and backfilled so current behavior is identical after migration.

## How tenancy is enforced here

All data access already goes through server functions using the service-role client, with role checks (`getRequestUser`/`assertRole`). RLS is "no policies / service-role only". So the tenant boundary is enforced **in the server functions** by filtering every query on `space_id` — not via RLS. This is the key design constraint.

---

## Part A — Spaces

### A1. Database (one migration, approved before any code)

New types/tables:
- enum `space_status` = `active | suspended`
- `spaces`: `name`, `slug`, `status`, `plan` (text label), `feature_flags` jsonb, `limits` jsonb (`max_users`, `max_leads`, `max_workflows`, `max_inboxes`), timestamps
- `space_members`: `space_id`, `user_id`, `role` (`admin | agent`), unique(`space_id`,`user_id`) — supports users in multiple Spaces

Add nullable `space_id uuid REFERENCES public.spaces(id)` to every tenant table:
`leads, conversations, whatsapp_messages, appointments, education_settings, ai_configuration, ai_variables, prompt_versions, http_actions, chatwoot_workspaces, scheduled_messages, responder_agents, workflows, workflow_enrollments, lead_opportunities, meeting_outcomes, offers, stage_opportunity_settings, report_conversations, ai_provider_pool, user_permissions, audit_logs` (`responder_agent_variables` inherits via its agent).

Backfill (no data loss):
- Create one **Default Space** (active, all flags on, generous limits)
- Set `space_id = Default Space` on all existing rows in every table
- Insert all current `admin`/`agent` users into `space_members` for the Default Space (super_admins are not space members; they manage from the console)

Helpers (security-definer): `is_space_member(_space, _user)`, `space_is_active(_space)`.

### A2. Active-space resolution (server)

New `src/lib/space-context.server.ts`:
- Reads requested space from an `x-space-id` header (falls back to the user's default/first membership)
- `super_admin` may act in any space; others must be a member
- Rejects requests to a `suspended` space (except super_admin)
- Returns `{ spaceId, roleInSpace, flags, limits }`

Client: extend `auth-attacher` flow with a tiny store that adds the `x-space-id` header from `localStorage.activeSpaceId`.

### A3. Scope every server function

Thread the resolved `spaceId` through `dashboard.functions.ts`, `admissions.server.ts`, `advanced.functions.ts`:
- add `.eq("space_id", spaceId)` to all tenant reads
- set `space_id: spaceId` on all inserts/upserts
- Webhooks (`chatwoot-webhook`, `evolution-webhook`) resolve the space from the matched workspace's `space_id`
- Cron processors (`process-workflows`, `process-scheduled-messages`) run per-space (rows already carry `space_id`; they just stop being globally mixed)

### A4. Super Admin "Spaces" console

New settings section **Spaces** (super_admin only), plus server fns (all guarded by super_admin):
- `listSpaces`, `createSpace`, `updateSpace` (name/plan/flags/limits), `setSpaceStatus` (suspend/activate), `deleteSpace`
- `listSpaceMembers`, `addSpaceMember`, `removeSpaceMember` (assign existing users + role)

UI: card list of Spaces with status badge, create dialog, edit dialog (plan label, feature-flag toggles, usage limits), suspend/activate, delete (with confirm), and a member manager.

### A5. Access-plan enforcement
- `feature_flags` gate tabs/sections inside a Space (e.g. orchestration, advanced/agentic, HTTP actions)
- `limits` checked on create paths (new lead/user/workflow/inbox) with a friendly "plan limit reached" message
- `suspended` Spaces: members blocked with a clear notice; super_admin still has access

### A6. Space selector + roles
- Header selector for users who belong to >1 Space (sets `localStorage.activeSpaceId`, refetches)
- Within a Space only `admin`/`agent` exist; super_admin role/privileges never exist inside a Space

---

## Part B — Expand Agentic AI scope

Extend `AGENT_TOOLS`, `generateAgentReply` context, and `executeAgentAction` (still propose → approve, Zod-validated, audit-logged, space-scoped):
- **AI variables**: `upsert_ai_variable`, `delete_ai_variable`
- **Workflows**: `create_workflow`, `update_workflow` (name/description/enabled/trigger + graph steps), `set_workflow_enabled`
- **Responder agents**: `create_responder_agent`, `update_responder_agent`
- **HTTP actions**: `create_http_action`, `update_http_action`

The analytics snapshot passed to the agent gains a compact catalogue of current variables, workflows, responder agents, and HTTP actions (names/ids) so it can reference and edit them accurately.

---

## Safety / rollout order
1. Migration (additive, nullable, fully backfilled) — approved first; existing app keeps working unchanged.
2. `space-context.server.ts` + scope server functions + webhooks/cron.
3. Super Admin console + space selector + plan enforcement.
4. Agentic tool expansion.

No columns are dropped; no rows are deleted; every existing row joins the Default Space, so current users see exactly what they see today.

## Key files
- Migration: spaces, space_members, `space_id` columns, backfill, helpers
- New: `src/lib/space-context.server.ts`, `src/lib/spaces.functions.ts`, `src/components/dashboard/settings/SpacesManager.tsx`, space selector component
- Edited: `dashboard.functions.ts`, `admissions.server.ts`, `advanced.functions.ts`, both webhook routes, both cron routes, `SettingsTab.tsx`, `roles.ts`, `auth-attacher`/client store, `advanced/ReportsTab.tsx` (agent UI), `types.ts`
