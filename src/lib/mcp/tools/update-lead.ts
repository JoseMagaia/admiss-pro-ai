import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauth, ok, err } from "./_shared";

// Only these lead columns are safe to patch through MCP. Server-managed
// columns (id, space_id, workspace_id, timestamps, chatwoot_*) are omitted.
const EDITABLE = [
  "lead_name",
  "phone_number",
  "student_or_parent",
  "course_interest",
  "country_interest",
  "passport_status",
  "academic_status",
  "parent_phone",
  "financial_alignment",
  "parent_confirmation",
  "document_received",
  "qualification_status",
  "notes",
] as const;

export default defineTool({
  name: "update_lead",
  title: "Update lead",
  description:
    "Patch editable fields on a lead. Unknown keys are ignored. Only lead_name, phone_number, student_or_parent, course_interest, country_interest, passport_status, academic_status, parent_phone, financial_alignment, parent_confirmation, document_received, qualification_status, notes are accepted.",
  inputSchema: {
    lead_id: z.string().uuid(),
    patch: z.record(z.string(), z.unknown()).describe("Object of fields to update."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ lead_id, patch }, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const clean: Record<string, unknown> = {};
    for (const k of EDITABLE) if (k in patch) clean[k] = (patch as Record<string, unknown>)[k];
    if (Object.keys(clean).length === 0) return err("No editable fields provided.");
    const { data, error } = await supabaseForUser(ctx)
      .from("leads")
      .update(clean)
      .eq("id", lead_id)
      .select()
      .single();
    return error ? err(error.message) : ok(data, "lead");
  },
});
