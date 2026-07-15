import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listLeads from "./tools/list-leads";
import getLead from "./tools/get-lead";
import listConversations from "./tools/list-conversations";
import listCampaigns from "./tools/list-campaigns";
import whoami from "./tools/whoami";

// The OAuth issuer MUST be the direct Supabase host (SUPABASE_URL is rewritten
// to a proxy on publish, which mcp-js rejects). Only the project ref survives.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "admissions-pro-mcp",
  title: "Admissions Pro MCP",
  version: "0.1.0",
  instructions:
    "Remote tools for the Admissions Pro admissions platform. Use whoami to verify auth, list_leads / get_lead / list_conversations to read CRM data, and list_campaigns for drip performance. All calls run as the signed-in user with RLS enforced.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoami, listLeads, getLead, listConversations, listCampaigns],
});
