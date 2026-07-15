import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauth, ok, err } from "./_shared";

// Only safe, non-credential fields are patchable via MCP. AI provider keys,
// Chatwoot/WhatsApp/VoIP creds, spaces & user_roles must be edited in the UI.
const EDITABLE = [
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
] as const;

export default defineTool({
  name: "update_company_settings",
  title: "Update company settings",
  description:
    "Patch company + branding fields on the caller's education_settings row. Only these keys are accepted: company_name, company_phone, company_email, office_address, working_hours, active_destinations, active_programs, scholarship_information, brand_name, brand_tagline, logo_light_url, logo_dark_url, logo_scale. Credentials (AI, Chatwoot, VoIP) must be changed through the UI.",
  inputSchema: {
    patch: z.record(z.string(), z.unknown()),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ patch }, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const clean: Record<string, unknown> = {};
    for (const k of EDITABLE) if (k in patch) clean[k] = (patch as Record<string, unknown>)[k];
    if (Object.keys(clean).length === 0) return err("No editable fields provided.");
    const db = supabaseForUser(ctx);
    const { data: existing } = await db.from("education_settings").select("id").limit(1).maybeSingle();
    if (!existing?.id) return err("No education_settings row exists for this space.");
    const { data, error } = await db
      .from("education_settings")
      .update(clean)
      .eq("id", existing.id)
      .select()
      .single();
    return error ? err(error.message) : ok(data, "settings");
  },
});
