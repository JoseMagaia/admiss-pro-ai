import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauth, ok, err } from "./_shared";

export default defineTool({
  name: "add_lead_note",
  title: "Add lead note",
  description: "Append a timestamped note to a lead's notes field.",
  inputSchema: {
    lead_id: z.string().uuid(),
    note: z.string().min(1),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ lead_id, note }, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const db = supabaseForUser(ctx);
    const { data: existing, error: getErr } = await db
      .from("leads")
      .select("notes")
      .eq("id", lead_id)
      .maybeSingle();
    if (getErr) return err(getErr.message);
    const prev = (existing?.notes as string | null) ?? "";
    const stamp = new Date().toISOString();
    const merged = `${prev}${prev ? "\n" : ""}[${stamp}] ${note}`;
    const { data, error } = await db
      .from("leads")
      .update({ notes: merged })
      .eq("id", lead_id)
      .select("id, notes")
      .single();
    return error ? err(error.message) : ok(data, "lead");
  },
});
