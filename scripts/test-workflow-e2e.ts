// E2E: new-format (data.type) workflow graphs execute through processWorkflows,
// and legacy message/workflow nodes resolve in orderedSteps.
import { supabaseAdmin } from "../src/integrations/supabase/client.server";
import { makeScopedClient, getDefaultSpaceId } from "../src/lib/space-context.server";
import { processWorkflows, orderedSteps } from "../src/lib/admissions.server";

const PHONE = "+5511999999999";

async function main() {
  const spaceId = await getDefaultSpaceId();
  if (!spaceId) throw new Error("no default space");
  const db = makeScopedClient(supabaseAdmin, spaceId);

  await db
    .from("leads")
    .upsert(
      {
        phone_number: PHONE,
        lead_name: "Maria",
        qualification_status: "NEW_LEAD",
        space_id: spaceId,
      } as never,
      { onConflict: "phone_number" } as never,
    );

  // --- NEW-format graph: trigger -> text -> condition -> yes: text -> end / no: text -> end ---
  const newGraph = {
    nodes: [
      { id: "trigger", type: "trigger", position: { x: 160, y: 40 }, data: { label: "Trigger" } },
      { id: "n1", type: "flow", position: { x: 160, y: 180 }, data: { type: "text", _t: "text", content: "Hello {{lead_name}}", delayValue: 0, delayUnit: "minutes" } },
      {
        id: "n2",
        type: "flow",
        position: { x: 160, y: 320 },
        data: {
          type: "condition",
          _t: "condition",
          field: "qualification_status",
          operator: "not_equals",
          value: "QUALIFIED",
          trueLabel: "Yes",
          falseLabel: "No",
        },
      },
      { id: "n3", type: "flow", position: { x: 340, y: 320 }, data: { type: "text", _t: "text", content: "You are NOT qualified", delayValue: 0, delayUnit: "minutes" } },
      { id: "n4", type: "flow", position: { x: 60, y: 440 }, data: { type: "text", _t: "text", content: "You ARE qualified", delayValue: 0, delayUnit: "minutes" } },
      { id: "n5", type: "flow", position: { x: 340, y: 460 }, data: { type: "end", _t: "end", note: "done" } },
    ],
    edges: [
      { id: "e1", source: "trigger", target: "n1", sourceHandle: null, targetHandle: null },
      { id: "e2", source: "n1", target: "n2", sourceHandle: null, targetHandle: null },
      { id: "e3", source: "n2", target: "n3", sourceHandle: "yes", targetHandle: null },
      { id: "e4", source: "n2", target: "n4", sourceHandle: "no", targetHandle: null },
      { id: "e5", source: "n3", target: "n5", sourceHandle: null, targetHandle: null },
    ],
  };

  const { data: wf } = await db
    .from("workflows")
    .insert({
      name: "E2E New Format",
      description: null,
      workspace_id: null,
      agent_id: null,
      trigger_segment: "manual",
      trigger_type: "manual",
      trigger_config: {},
      enabled: true,
      space_id: spaceId,
      graph: newGraph as never,
    })
    .select("id")
    .maybeSingle();
  const wfId = (wf as { id: string } | null)?.id;
  if (!wfId) throw new Error("workflow insert failed");

  // Direct enrollment with due next_run_at.
  await db
    .from("workflow_enrollments")
    .insert({
      workflow_id: wfId,
      lead_id: null,
      phone_number: PHONE,
      current_step: 0,
      status: "active",
      reacted: false,
      next_run_at: new Date(Date.now() - 60_000).toISOString(),
      space_id: spaceId,
    } as never);

  // --- legacy graph resolution check ---
  const legacyGraph = {
    nodes: [
      { id: "trigger", type: "trigger", position: { x: 80, y: 20 }, data: { label: "Trigger" } },
      { id: "m1", type: "message", position: { x: 80, y: 140 }, data: { content: "Legacy hi", delayValue: 1, delayUnit: "days", anchor: "wait" } },
      { id: "w1", type: "workflow", position: { x: 80, y: 260 }, data: { targetWorkflowId: wfId, targetWorkflowName: "x" } },
    ],
    edges: [
      { id: "le1", source: "trigger", target: "m1", sourceHandle: null, targetHandle: null },
      { id: "le2", source: "m1", target: "w1", sourceHandle: null, targetHandle: null },
    ],
  };
  const legacySteps = await orderedSteps(legacyGraph as never, PHONE);
  if (legacySteps.length !== 2) throw new Error(`legacy steps expected 2, got ${legacySteps.length}`);
  if (legacySteps[0].kind !== "message" || legacySteps[0].content !== "Legacy hi")
    throw new Error(`legacy step0 wrong: ${JSON.stringify(legacySteps[0])}`);
  if (legacySteps[1].kind !== "call_workflow" || legacySteps[1].targetWorkflowId !== wfId)
    throw new Error(`legacy step1 wrong: ${JSON.stringify(legacySteps[1])}`);
  console.log("legacy graph OK: message + call_workflow resolved");

  // --- run the scheduler ---
  console.log("orderedSteps(newGraph, phone):", JSON.stringify(await orderedSteps(newGraph as never, PHONE)));
  // The scheduler advances one step per tick — loop until the enrollment completes.
  for (let i = 0; i < 8; i++) {
    const res = await processWorkflows();
    const { data: st } = await supabaseAdmin
      .from("workflow_enrollments")
      .select("status, current_step")
      .eq("phone_number", PHONE)
      .maybeSingle();
    console.log(`tick ${i}:`, JSON.stringify(res), "enr:", JSON.stringify(st));
    if ((st as { status?: string } | null)?.status === "completed") break;
  }

  // --- verify sent messages (scoped + raw) ---
  const { data: msgs } = await db
    .from("whatsapp_messages")
    .select("message_content, sender")
    .eq("phone_number", PHONE);
  const rows = (msgs as Array<{ message_content: string; sender: string }>) ?? [];
  const contents = rows.map((r) => r.message_content);
  console.log("scoped messages:", JSON.stringify(contents));
  const { data: rawMsgs } = await supabaseAdmin
    .from("whatsapp_messages")
    .select("message_content, sender, space_id")
    .eq("phone_number", PHONE);
  console.log("RAW messages:", JSON.stringify(rawMsgs));

  if (!contents.some((c) => c === "Hello Maria")) throw new Error("missing first message");
  if (!contents.some((c) => c === "You are NOT qualified")) throw new Error("condition branch (yes) not taken");
  if (contents.some((c) => c === "You ARE qualified")) throw new Error("condition branch (no) wrongly taken");
  console.log("E2E OK: new-format workflow executed with branch resolution");

  const { data: enr } = await db
    .from("workflow_enrollments")
    .select("status, current_step, next_run_at")
    .eq("phone_number", PHONE)
    .maybeSingle();
  console.log("enrollment final:", JSON.stringify(enr));
  if ((enr as { status?: string } | null)?.status !== "completed") throw new Error("enrollment not completed");
  console.log("ALL PASS");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("FAIL:", e);
    process.exit(1);
  });
