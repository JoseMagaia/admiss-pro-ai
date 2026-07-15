import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_lead",
  title: "Get lead",
  description: "Fetch a single lead by id, including recent conversation snippets.",
  inputSchema: { id: z.string().uuid().describe("Lead UUID.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const sb = supabaseForUser(ctx);
    const { data: lead, error } = await sb.from("leads").select("*").eq("id", id).maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!lead) return { content: [{ type: "text", text: "Lead not found" }], isError: true };
    const { data: convs } = await sb
      .from("conversations")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false })
      .limit(20);
    return {
      content: [{ type: "text", text: JSON.stringify({ lead, conversations: convs ?? [] }) }],
      structuredContent: { lead, conversations: convs ?? [] },
    };
  },
});
