import { auth, defineMcp } from "@lovable.dev/mcp-js";
import describeApp from "./tools/describe-app";
import whoami from "./tools/whoami";
import listLeads from "./tools/list-leads";
import getLead from "./tools/get-lead";
import listConversations from "./tools/list-conversations";
import listCampaigns from "./tools/list-campaigns";
import listPipelineStages from "./tools/list-pipeline-stages";
import getCompanySettings from "./tools/get-company-settings";
import createLead from "./tools/create-lead";
import updateLead from "./tools/update-lead";
import setLeadStatus from "./tools/set-lead-status";
import addLeadNote from "./tools/add-lead-note";
import updateCompanySettings from "./tools/update-company-settings";

// The OAuth issuer MUST be the direct Supabase host (SUPABASE_URL is rewritten
// to a proxy on publish, which mcp-js rejects). Only the project ref survives.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "admissions-pro-mcp",
  title: "Admissions Pro MCP",
  version: "0.2.0",
  instructions: [
    "Admissions Pro is a multi-tenant admissions CRM (leads, conversations, drip",
    "campaigns, pipelines, PBX calls, AI workflows).",
    "",
    "FIRST STEPS for any new session:",
    "  1. Call `whoami` to confirm identity and role.",
    "  2. Call `describe_app` to load the domain model, lead-status vocabulary,",
    "     editable settings, and tool catalog. All write tools reference concepts",
    "     defined there.",
    "",
    "READ tools: list_leads, get_lead, list_conversations, list_campaigns,",
    "list_pipeline_stages, get_company_settings.",
    "",
    "WRITE tools: create_lead, update_lead, set_lead_status, add_lead_note,",
    "update_company_settings. All writes are RLS-scoped to the caller's space",
    "and role — permission errors mean the caller does not own the row or lacks",
    "the required role.",
    "",
    "This server is a standard MCP Streamable-HTTP resource server (OAuth 2.1 +",
    "DCR) and works with any spec-compliant client, including the Hermes agent",
    "runtime, Claude, ChatGPT, Cursor, and Codex.",
  ].join("\n"),
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    describeApp,
    whoami,
    listLeads,
    getLead,
    listConversations,
    listCampaigns,
    listPipelineStages,
    getCompanySettings,
    createLead,
    updateLead,
    setLeadStatus,
    addLeadNote,
    updateCompanySettings,
  ],
});
