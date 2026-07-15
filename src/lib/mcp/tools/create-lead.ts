import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauth, ok, err } from "./_shared";

export default defineTool({
  name: "create_lead",
  title: "Create lead",
  description:
    "Insert a new lead into the caller's active space. RLS enforces tenant scoping; the caller must belong to a space.",
  inputSchema: {
    lead_name: z.string().min(1).describe("Full name of the lead."),
    phone_number: z.string().min(3).describe("WhatsApp-formatted phone (e.g. +2348012345678)."),
    student_or_parent: z.enum(["student", "parent"]).optional(),
    course_interest: z.string().optional(),
    country_interest: z.string().optional(),
    notes: z.string().optional(),
    space_id: z.string().uuid().optional().describe("Target space. Defaults to the caller's first space."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const db = supabaseForUser(ctx);
    let spaceId = input.space_id;
    if (!spaceId) {
      const { data: sp } = await db.from("space_members").select("space_id").limit(1).maybeSingle();
      spaceId = sp?.space_id as string | undefined;
    }
    if (!spaceId) return err("No space available for this user.");
    const { data, error } = await db
      .from("leads")
      .insert({
        lead_name: input.lead_name,
        phone_number: input.phone_number,
        student_or_parent: input.student_or_parent ?? null,
        course_interest: input.course_interest ?? null,
        country_interest: input.country_interest ?? null,
        notes: input.notes ?? null,
        space_id: spaceId,
        qualification_status: "new",
      })
      .select()
      .single();
    return error ? err(error.message) : ok(data, "lead");
  },
});
