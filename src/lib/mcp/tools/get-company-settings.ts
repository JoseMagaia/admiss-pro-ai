import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser, unauth, ok } from "./_shared";

// Sensitive columns (chatwoot_*, whatsapp_webhook_url) are stripped before
// returning to the MCP client.
const SAFE = [
  "id",
  "space_id",
  "company_name",
  "company_phone",
  "company_email",
  "office_address",
  "working_hours",
  "active_destinations",
  "active_programs",
  "scholarship_information",
  "brand_name",
  "brand_tagline",
  "logo_light_url",
  "logo_dark_url",
  "logo_scale",
  "updated_at",
].join(", ");

export default defineTool({
  name: "get_company_settings",
  title: "Get company settings",
  description: "Return the caller's education_settings row (company, programs, branding). Credentials are omitted.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const { data } = await supabaseForUser(ctx).from("education_settings").select(SAFE).limit(1).maybeSingle();
    return ok(data ?? null, "settings");
  },
});
