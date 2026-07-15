import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { ok } from "./_shared";

// Static, versioned description of the app surface exposed over MCP. Any
// MCP-compatible client (Hermes, Claude, ChatGPT, Cursor, custom agents)
// should call this first to understand the domain model, available tools,
// enums, and safe editing patterns before mutating data.
const APP_DOC = `# Admissions Pro — App Overview (for MCP clients)

## Purpose
Admissions Pro is a multi-tenant CRM for education admissions teams.
It manages leads, WhatsApp / SMS / email conversations, drip campaigns,
a call center (PBX), pipelines, and orchestration workflows powered by AI
responder agents.

## Authorization model
- Every call runs as the OAuth-authenticated user.
- Roles: \`super_admin\` (full), \`admin\` (tenant management, no infra),
  \`agent\` (day-to-day CRM only).
- Row-Level Security scopes ALL data by \`space_id\` (tenant). Users never
  see or mutate rows outside their spaces. Super admins bypass space scoping.
- Sensitive tables (\`ai_configuration\`, \`chatwoot_workspaces\`, \`voip_settings\`,
  \`user_roles\`, \`user_permissions\`) are locked to super admins.

## Core entities
- **leads** — prospective students / parents. Key fields: \`lead_name\`,
  \`phone_number\`, \`student_or_parent\`, \`course_interest\`, \`country_interest\`,
  \`passport_status\`, \`academic_status\`, \`financial_alignment\`,
  \`qualification_status\`, \`notes\`, \`workspace_id\`, \`space_id\`.
- **conversations** — one thread per lead per channel (WhatsApp/SMS/Email).
- **campaigns** — drip sequences with media, buttons, weekday/time windows.
- **pipelines / pipeline_stages** — deal flow visualization.
- **appointments / meeting_outcomes** — booked calls with specialists.
- **workflows / workflow_enrollments** — automated multi-step sequences.
- **calls / call_callbacks / dial_campaigns** — PBX activity.
- **education_settings** — per-space company & branding config.

## Lead status vocabulary (\`qualification_status\`)
Common values used across the platform:
- \`new\` — freshly captured, no qualification yet
- \`contacted\` — first outbound reply sent
- \`engaged\` — lead is actively replying
- \`qualified\` — meets financial + academic criteria
- \`unqualified\` — does not meet criteria
- \`booked\` — appointment scheduled
- \`enrolled\` — converted (won)
- \`lost\` — closed lost

Custom pipeline stages may add more; use \`list_pipeline_stages\` to discover them.

## Editable settings surface
Settings live in the \`education_settings\` table (one row per space). Editable
via \`update_company_settings\`:
- Company: \`company_name\`, \`company_phone\`, \`company_email\`,
  \`office_address\`, \`working_hours\`
- Programs: \`active_destinations\`, \`active_programs\`, \`scholarship_information\`
- Branding: \`brand_name\`, \`brand_tagline\`, \`logo_light_url\`,
  \`logo_dark_url\`, \`logo_scale\` (50-300)

Super-admin-only surfaces (NOT editable via MCP for safety): AI provider
keys, Chatwoot / WhatsApp Cloud / Evolution workspaces, VoIP credentials,
user roles, spaces. These require the settings UI.

## Available MCP tools
| Tool | Kind | Purpose |
|---|---|---|
| \`describe_app\` | read | This document. Call first. |
| \`whoami\` | read | Identity + role of the caller. |
| \`list_leads\` | read | List leads (space-scoped). |
| \`get_lead\` | read | Lead detail + recent conversation. |
| \`list_conversations\` | read | Recent conversations. |
| \`list_campaigns\` | read | Drip campaigns + stats. |
| \`list_pipeline_stages\` | read | Available stages per pipeline. |
| \`get_company_settings\` | read | Current \`education_settings\` row. |
| \`create_lead\` | write | Insert a new lead in the caller's space. |
| \`update_lead\` | write | Patch any editable lead field. |
| \`set_lead_status\` | write | Shortcut to change qualification/pipeline status. |
| \`add_lead_note\` | write | Append a timestamped note to a lead. |
| \`update_company_settings\` | write | Patch company & branding fields. |

## Editing rules (MUST follow)
1. Always call \`whoami\` + \`describe_app\` before writing.
2. When changing a lead's status, use \`set_lead_status\` — it validates
   against the pipeline stage vocabulary.
3. \`update_lead\` accepts only whitelisted fields. Unknown keys are ignored.
4. Never attempt to write \`id\`, \`space_id\`, \`workspace_id\`,
   \`created_at\`, \`updated_at\` — they are managed by the server.
5. All mutations are RLS-checked; a "permission denied" error means the
   caller does not own the row or lacks the required role.

## Client identity (Hermes / any MCP agent)
This server is a standard MCP Streamable-HTTP resource server with OAuth 2.1
+ Dynamic Client Registration. Any spec-compliant client works —
including the Hermes agent runtime. Use \`Accept: application/json,
text/event-stream\` on POST as required by the MCP spec.
`;

export default defineTool({
  name: "describe_app",
  title: "Describe app",
  description:
    "Return a machine-readable overview of Admissions Pro: entities, roles, lead-status vocabulary, editable settings, and tool catalog. Call this first so the agent understands the app before reading or mutating data.",
  inputSchema: {
    include_tools: z.boolean().default(true).describe("Include the tool catalog section."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => ok({ format: "markdown", version: 1, document: APP_DOC }, "app"),
});
