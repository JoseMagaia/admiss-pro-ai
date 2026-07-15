import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauth, ok, err } from "./_shared";

export default defineTool({
  name: "set_lead_status",
  title: "Set lead status",
  description:
    "Change a lead's qualification_status (pipeline stage). Common values: new, contacted, engaged, qualified, unqualified, booked, enrolled, lost. Custom stages may exist — use list_pipeline_stages to discover them.",
  inputSchema: {
    lead_id: z.string().uuid(),
    status: z.string().min(1).describe("New qualification_status value."),
    note: z.string().optional().describe("Optional note appended to the lead explaining the change."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ lead_id, status, note }, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const db = supabaseForUser(ctx);
    const update: Record<string, unknown> = { qualification_status: status };
    if (note) {
      const { data: existing } = await db.from("leads").select("notes").eq("id", lead_id).maybeSingle();
      const prev = (existing?.notes as string | null) ?? "";
      const stamp = new Date().toISOString();
      update.notes = `${prev}${prev ? "\n" : ""}[${stamp}] status → ${status}: ${note}`;
    }
    const { data, error } = await db.from("leads").update(update).eq("id", lead_id).select().single();
    return error ? err(error.message) : ok(data, "lead");
  },
});
