import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauth, ok } from "./_shared";

export default defineTool({
  name: "list_pipeline_stages",
  title: "List pipeline stages",
  description: "List pipelines and their stages available to the caller. Use the stage_keys as valid values for set_lead_status.",
  inputSchema: {
    pipeline_id: z.string().uuid().optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ pipeline_id }, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const db = supabaseForUser(ctx);
    const [pipelines, stages] = await Promise.all([
      db.from("pipelines").select("*").order("position"),
      pipeline_id
        ? db.from("pipeline_stages").select("*").eq("pipeline_id", pipeline_id).order("position")
        : db.from("pipeline_stages").select("*").order("position"),
    ]);
    return ok({ pipelines: pipelines.data ?? [], stages: stages.data ?? [] }, "pipeline");
  },
});
