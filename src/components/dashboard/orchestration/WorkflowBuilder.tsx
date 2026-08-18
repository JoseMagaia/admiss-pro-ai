import { useCallback, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Save, Plus, MessageSquare, Zap, Trash2, X, Workflow as WorkflowIcon, Paperclip, Image as ImageIcon, Loader2, GitBranch, Tag } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PIPELINE_COLUMNS } from "@/lib/pipeline";
import {
  TRIGGER_TYPES,
  TIME_UNITS,
  BOOKING_STATUSES,
  STEP_ANCHORS,
  type TriggerType,
  type TriggerConfig,
} from "@/lib/orchestration";
import {
  MEETING_OUTCOME_TEMPLATES,
  type OutcomeWorkflowTemplate,
  type TemplateStep,
} from "@/lib/meeting-outcomes";
import { upsertWorkflow, uploadMessageAttachment } from "@/lib/dashboard.functions";

// Media attached to a workflow message step.
export type StepMedia = {
  url: string;
  mime: string;
  kind: "image" | "audio" | "video" | "document";
  filename?: string | null;
  caption?: string | null;
} | null;

// Quick-reply button on a workflow message step. `next_workflow_id` links to
// another workflow; when the recipient taps the button, the lead is enrolled.
export type StepButton = { id?: string; title: string; next_workflow_id?: string | null };

export interface WorkflowRow {
  id?: string;
  name: string;
  description: string | null;
  workspace_id: string | null;
  agent_id: string | null;
  trigger_segment: string;
  trigger_type?: TriggerType | null;
  trigger_config?: TriggerConfig | null;
  enabled: boolean;
  graph: unknown;
}

// Built-in lead variables always available in message steps.
const BUILTIN_VARS = ["lead_name", "course_interest", "country_interest", "phone_number"];



interface MiniAgent {
  id: string;
  name: string;
}
interface MiniWorkspace {
  id: string;
  name: string;
}

function TriggerNode({ data }: NodeProps) {
  const d = data as { label?: string };
  return (
    <div className="rounded-xl border-2 border-accent bg-card px-4 py-2 shadow-card">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Zap className="h-4 w-4 text-accent-foreground" /> {d.label ?? "Trigger"}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function unitShort(unit: string): string {
  return TIME_UNITS.find((u) => u.id === unit)?.label.toLowerCase() ?? unit;
}

function stepTiming(d: {
  anchor?: string;
  delayValue?: number;
  delayUnit?: string;
  offsetValue?: number;
  offsetUnit?: string;
}): string {
  const anchor = d.anchor ?? "wait";
  if (anchor === "before_goal")
    return `${d.offsetValue ?? 0} ${unitShort(d.offsetUnit ?? "days")} before goal date`;
  if (anchor === "before_appointment")
    return `${d.offsetValue ?? 0} ${unitShort(d.offsetUnit ?? "days")} before appointment`;
  return `wait ${d.delayValue ?? 0} ${unitShort(d.delayUnit ?? "minutes")} before sending`;
}

function MessageNode({ data, selected }: NodeProps) {
  const d = data as {
    content?: string;
    delayValue?: number;
    delayUnit?: string;
    anchor?: string;
    offsetValue?: number;
    offsetUnit?: string;
    index?: number;
  };
  const countdown = (d.anchor ?? "wait") !== "wait";
  return (
    <div
      className={`w-52 rounded-xl border-2 bg-card px-4 py-2 shadow-card ${selected ? "border-primary" : "border-border"}`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-xs font-semibold text-primary">
        <MessageSquare className="h-3.5 w-3.5" /> Message {(d.index ?? 0) + 1}
      </div>
      <p className="mt-1 line-clamp-2 text-xs text-foreground/80">{d.content || "(empty message)"}</p>
      <p
        className={`mt-1 text-[10px] ${countdown ? "font-semibold text-accent-foreground" : "text-muted-foreground"}`}
      >
        {countdown ? "⏳ " : ""}
        {stepTiming(d)}
      </p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function WorkflowStepNode({ data, selected }: NodeProps) {
  const d = data as { targetWorkflowName?: string; index?: number } & Parameters<typeof stepTiming>[0];
  return (
    <div
      className={`w-52 rounded-xl border-2 bg-card px-4 py-2 shadow-card ${selected ? "border-primary" : "border-border"}`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-xs font-semibold text-accent-foreground">
        <WorkflowIcon className="h-3.5 w-3.5" /> Call workflow
      </div>
      <p className="mt-1 line-clamp-2 text-xs text-foreground/80">
        {d.targetWorkflowName || "(no workflow selected)"}
      </p>
      <p className="mt-1 text-[10px] text-muted-foreground">{stepTiming(d)}</p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Typebot-style logic operators available on a condition node.
export const CONDITION_FIELDS = [
  { id: "qualification_status", label: "Lead status" },
  { id: "tags", label: "Tag" },
  { id: "last_reply", label: "Last reply text" },
  { id: "has_replied", label: "Has replied" },
  { id: "course_interest", label: "Course interest" },
  { id: "country_interest", label: "Country interest" },
  { id: "lead_name", label: "Lead name" },
  { id: "email", label: "Email" },
  { id: "assigned_to", label: "Assigned to" },
];

export const CONDITION_OPERATORS = [
  { id: "equals", label: "equals" },
  { id: "not_equals", label: "does not equal" },
  { id: "contains", label: "contains" },
  { id: "not_contains", label: "does not contain" },
  { id: "is_empty", label: "is empty" },
  { id: "is_not_empty", label: "is not empty" },
  { id: "gt", label: "greater than" },
  { id: "lt", label: "less than" },
];

export const ACTION_TYPES = [
  { id: "add_tag", label: "Add tag" },
  { id: "remove_tag", label: "Remove tag" },
  { id: "set_status", label: "Set lead status" },
  { id: "set_field", label: "Set lead field" },
  { id: "enroll_workflow", label: "Assign to workflow" },
  { id: "remove_workflow", label: "Remove from workflow" },
  { id: "human_takeover", label: "Hand over to a human" },
  { id: "stop_flow", label: "Stop this flow" },
];

export const SETTABLE_FIELDS = [
  "lead_name",
  "course_interest",
  "country_interest",
  "email",
  "notes",
  "assigned_to",
  "qualification_status",
];

function ConditionNode({ data, selected }: NodeProps) {
  const d = data as { conditionField?: string; conditionOperator?: string; conditionValue?: string };
  const field = CONDITION_FIELDS.find((f) => f.id === d.conditionField)?.label ?? "Lead status";
  const op = CONDITION_OPERATORS.find((o) => o.id === d.conditionOperator)?.label ?? "equals";
  return (
    <div
      className={`w-56 rounded-xl border-2 bg-card px-4 py-2 shadow-card ${selected ? "border-primary" : "border-border"}`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-xs font-semibold text-accent-foreground">
        <GitBranch className="h-3.5 w-3.5" /> Condition
      </div>
      <p className="mt-1 line-clamp-2 text-xs text-foreground/80">
        {field} {op} {d.conditionValue ? `"${d.conditionValue}"` : ""}
      </p>
      <div className="mt-1 flex justify-between text-[10px] font-medium">
        <span className="text-emerald-600">yes</span>
        <span className="text-destructive">no</span>
      </div>
      <Handle id="true" type="source" position={Position.Bottom} style={{ left: "25%" }} />
      <Handle id="false" type="source" position={Position.Bottom} style={{ left: "75%" }} />
    </div>
  );
}

function ActionNode({ data, selected }: NodeProps) {
  const d = data as { actionType?: string; actionValue?: string; actionField?: string };
  const label = ACTION_TYPES.find((a) => a.id === d.actionType)?.label ?? "Action";
  return (
    <div
      className={`w-52 rounded-xl border-2 bg-card px-4 py-2 shadow-card ${selected ? "border-primary" : "border-border"}`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-xs font-semibold text-primary">
        <Tag className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="mt-1 line-clamp-2 text-xs text-foreground/80">
        {d.actionField ? `${d.actionField}: ` : ""}
        {d.actionValue || "—"}
      </p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = {
  trigger: TriggerNode,
  message: MessageNode,
  workflow: WorkflowStepNode,
  condition: ConditionNode,
  action: ActionNode,
};

function defaultGraph(): { nodes: Node[]; edges: Edge[] } {
  return {
    nodes: [
      {
        id: "trigger",
        type: "trigger",
        position: { x: 80, y: 20 },
        data: { label: "Trigger" },
      },
    ],
    edges: [],
  };
}

function graphFromTemplate(steps: TemplateStep[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [
    { id: "trigger", type: "trigger", position: { x: 80, y: 20 }, data: { label: "Trigger" } },
  ];
  const edges: Edge[] = [];
  let prevId = "trigger";
  steps.forEach((step, i) => {
    const id = `m${i}_${Date.now()}`;
    nodes.push({
      id,
      type: "message",
      position: { x: 80, y: 20 + (i + 1) * 120 },
      data: {
        content: step.content,
        delayValue: step.delayValue,
        delayUnit: step.delayUnit,
        index: i,
      },
    });
    edges.push({
      id: `e_${prevId}_${id}`,
      source: prevId,
      target: id,
      sourceHandle: null,
      targetHandle: null,
    });
    prevId = id;
  });
  return { nodes, edges };
}

export function WorkflowBuilder({
  initial,
  agents,
  workspaces,
  workflows,
  variables,
  onDone,
}: {
  initial: WorkflowRow;
  agents: MiniAgent[];
  workspaces: MiniWorkspace[];
  /** Other workflows that a "call workflow" step can enroll the lead into. */
  workflows?: Array<{ id: string; name: string }>;
  /** Available variable names for quick insertion into a message step. */
  variables?: string[];
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const saveFn = useServerFn(upsertWorkflow);
  const uploadFn = useServerFn(uploadMessageAttachment);
  const stepMediaInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingStepMedia, setUploadingStepMedia] = useState(false);

  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description ?? "");
  const [workspaceId, setWorkspaceId] = useState(initial.workspace_id ?? "");
  const [agentId, setAgentId] = useState(initial.agent_id ?? "");
  const [enabled, setEnabled] = useState(initial.enabled);

  // Resolve initial trigger type/config with backward compatibility.
  const initialType: TriggerType =
    (initial.trigger_type as TriggerType) ??
    (initial.trigger_segment && initial.trigger_segment !== "manual" ? "pipeline_stage" : "manual");
  const initialConfig: TriggerConfig =
    initial.trigger_config ??
    (initial.trigger_segment && initial.trigger_segment !== "manual"
      ? { segment: initial.trigger_segment }
      : {});

  const [triggerType, setTriggerType] = useState<TriggerType>(initialType);
  const [segment, setSegment] = useState(initialConfig.segment ?? PIPELINE_COLUMNS[0].id);
  const [amount, setAmount] = useState<number>(initialConfig.amount ?? 1);
  const [unit, setUnit] = useState<string>(initialConfig.unit ?? "days");
  const [bookingStatus, setBookingStatus] = useState<string>(initialConfig.status ?? "pending");

  const initialGraph = useMemo(() => {
    const g = (initial.graph ?? {}) as { nodes?: Node[]; edges?: Edge[] };
    if (g.nodes && g.nodes.length > 0) return { nodes: g.nodes, edges: g.edges ?? [] };
    return defaultGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraph.edges);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const onConnect = useCallback((c: Connection) => setEdges((eds) => addEdge(c, eds)), [setEdges]);

  const [templateChoice, setTemplateChoice] = useState("");

  const applyTemplate = (tmpl: OutcomeWorkflowTemplate) => {
    setName(tmpl.name);
    setDescription(tmpl.description);
    // Meeting-outcome templates are enrolled manually on form submission.
    setTriggerType("manual");
    const { nodes: tn, edges: te } = graphFromTemplate(tmpl.steps);
    setNodes(tn);
    setEdges(te);
    setSelectedId(null);
    toast.success(`Loaded "${tmpl.name}" template`);
  };

  const messageCount = nodes.filter((n) => n.type === "message").length;

  const messageRef = useRef<HTMLTextAreaElement | null>(null);

  // Built-in lead variables always available, plus any custom AI variables.
  const allVariables = useMemo(
    () => [...BUILTIN_VARS, ...((variables ?? []).filter((v) => !BUILTIN_VARS.includes(v)))],
    [variables],
  );

  // Workflows selectable in a "call workflow" step (excludes the current one).
  const callableWorkflows = (workflows ?? []).filter((w) => w.id !== initial.id);

  const addStepNode = (type: "message" | "workflow" | "condition" | "action") => {
    const prefix = { message: "m", workflow: "w", condition: "c", action: "a" }[type];
    const id = `${prefix}${Date.now()}`;
    const sources = new Set(edges.map((e) => e.source));
    const tail = nodes.find((n) => !sources.has(n.id)) ?? nodes[nodes.length - 1];
    const y = (tail?.position.y ?? 20) + 120;
    const instant = type === "condition" || type === "action";
    const baseData = {
      anchor: "wait",
      delayValue: instant || (messageCount === 0 && type === "message") ? 0 : 1,
      delayUnit: instant || (messageCount === 0 && type === "message") ? "minutes" : "days",
      offsetValue: 1,
      offsetUnit: "days",
    };
    const dataByType: Record<string, Record<string, unknown>> = {
      workflow: { targetWorkflowId: "", targetWorkflowName: "" },
      condition: { conditionField: "qualification_status", conditionOperator: "equals", conditionValue: "" },
      action: { actionType: "add_tag", actionValue: "", actionField: "", actionWorkflowId: null },
      message: { content: "", index: messageCount },
    };
    const newNode: Node = {
      id,
      type,
      position: { x: 80, y },
      data: { ...baseData, ...dataByType[type] },
    };
    setNodes((nds) => [...nds, newNode]);
    if (tail) setEdges((eds) => addEdge({ source: tail.id, target: id, sourceHandle: null, targetHandle: null }, eds));
    setSelectedId(id);
  };

  const addMessage = () => addStepNode("message");
  const addWorkflowStep = () => addStepNode("workflow");
  const addCondition = () => addStepNode("condition");
  const addAction = () => addStepNode("action");

  const selected = nodes.find(
    (n) =>
      n.id === selectedId &&
      (n.type === "message" || n.type === "workflow" || n.type === "condition" || n.type === "action"),
  );
  const selectedIsWorkflow = selected?.type === "workflow";
  const selectedIsCondition = selected?.type === "condition";
  const selectedIsAction = selected?.type === "action";
  const selectedIsMessage = selected?.type === "message" || selected?.type === undefined;

  const updateSelected = (patch: Record<string, unknown>) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n)),
    );
  };

  const insertVariable = (name: string) => {
    const token = `{{${name}}}`;
    const el = messageRef.current;
    const current = String((selected?.data as { content?: string })?.content ?? "");
    if (!el) {
      updateSelected({ content: current + token });
      return;
    }
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const next = current.slice(0, start) + token + current.slice(end);
    updateSelected({ content: next });
    // Restore focus and caret position after the inserted token.
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedId && e.target !== selectedId));
    setSelectedId(null);
  };

  const buildTriggerConfig = (): TriggerConfig => {
    if (triggerType === "pipeline_stage") return { segment };
    if (triggerType === "time_since_first_message" || triggerType === "time_since_last_message")
      return { amount, unit: unit as TriggerConfig["unit"] };
    if (triggerType === "booking_status") return { status: bookingStatus as TriggerConfig["status"] };
    return {};
  };

  const save = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          id: initial.id,
          name,
          description: description || null,
          workspace_id: workspaceId || null,
          agent_id: agentId || null,
          trigger_type: triggerType,
          trigger_config: buildTriggerConfig(),
          trigger_segment: triggerType === "pipeline_stage" ? segment : "manual",
          enabled,
          graph: { nodes, edges } as never,
        },
      }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error?: string };
      if (!res.ok) {
        toast.error(res.error ?? "Failed to save");
        return;
      }
      toast.success("Workflow saved");
      qc.invalidateQueries({ queryKey: ["workflows"] });
      onDone();
    },
    onError: () => toast.error("Failed to save"),
  });

  const isTimeTrigger =
    triggerType === "time_since_first_message" || triggerType === "time_since_last_message";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed bg-muted/30 p-3">
        <Label className="text-xs">Start from a Meeting Outcome template</Label>
        <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={templateChoice}
            onChange={(e) => {
              const val = e.target.value;
              setTemplateChoice(val);
              const tmpl = MEETING_OUTCOME_TEMPLATES.find((t) => t.name === val);
              if (tmpl) applyTemplate(tmpl);
            }}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm sm:max-w-sm"
          >
            <option value="">Select a template…</option>
            {MEETING_OUTCOME_TEMPLATES.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground">
            Auto-fills the name, description and message sequence with ideal intervals. You can edit everything before
            saving.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Workflow Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Cold lead re-engagement" />
        </div>
        <div className="space-y-1.5">
          <Label>Trigger type</Label>
          <select
            value={triggerType}
            onChange={(e) => setTriggerType(e.target.value as TriggerType)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {TRIGGER_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground">
            {TRIGGER_TYPES.find((t) => t.id === triggerType)?.help}
          </p>
        </div>

        {triggerType === "pipeline_stage" && (
          <div className="space-y-1.5">
            <Label>Pipeline segment</Label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {PIPELINE_COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {isTimeTrigger && (
          <div className="space-y-1.5">
            <Label>Threshold</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="w-24"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
              >
                {TIME_UNITS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {triggerType === "booking_status" && (
          <div className="space-y-1.5">
            <Label>Booking status</Label>
            <select
              value={bookingStatus}
              onChange={(e) => setBookingStatus(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm capitalize"
            >
              {BOOKING_STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Workspace / Inbox</Label>
          <select
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Use lead&apos;s inbox / default</option>
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Responder agent (on reaction)</Label>
          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">None</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional notes" />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={enabled} onCheckedChange={setEnabled} /> Workflow enabled
        </label>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={addMessage}>
            <Plus className="mr-1 h-4 w-4" /> Add message step
          </Button>
          <Button variant="outline" size="sm" onClick={addWorkflowStep}>
            <WorkflowIcon className="mr-1 h-4 w-4" /> Call workflow step
          </Button>
          <Button variant="outline" size="sm" onClick={addCondition}>
            <GitBranch className="mr-1 h-4 w-4" /> Add condition
          </Button>
          <Button variant="outline" size="sm" onClick={addAction}>
            <Tag className="mr-1 h-4 w-4" /> Add action
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="h-[420px] overflow-hidden rounded-2xl border bg-muted/20">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, n) => setSelectedId(n.id)}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-card">
          {selected ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  {selectedIsWorkflow
                    ? "Edit call workflow"
                    : selectedIsCondition
                      ? "Edit condition"
                      : selectedIsAction
                        ? "Edit action"
                        : "Edit message"}
                </span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedId(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {selectedIsCondition ? (
                <div className="space-y-2">
                  <div className="space-y-1.5">
                    <Label>Test field</Label>
                    <select
                      value={String((selected.data as { conditionField?: string }).conditionField ?? "qualification_status")}
                      onChange={(e) => updateSelected({ conditionField: e.target.value })}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {CONDITION_FIELDS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Operator</Label>
                    <select
                      value={String((selected.data as { conditionOperator?: string }).conditionOperator ?? "equals")}
                      onChange={(e) => updateSelected({ conditionOperator: e.target.value })}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {CONDITION_OPERATORS.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Value</Label>
                    <Input
                      value={String((selected.data as { conditionValue?: string }).conditionValue ?? "")}
                      onChange={(e) => updateSelected({ conditionValue: e.target.value })}
                      placeholder="e.g. hot, interested, yes"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Wire the left handle (yes) and the right handle (no) to different steps to branch the flow.
                  </p>
                </div>
              ) : null}

              {selectedIsAction ? (
                <div className="space-y-2">
                  <div className="space-y-1.5">
                    <Label>Action</Label>
                    <select
                      value={String((selected.data as { actionType?: string }).actionType ?? "add_tag")}
                      onChange={(e) => updateSelected({ actionType: e.target.value })}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {ACTION_TYPES.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {["enroll_workflow", "remove_workflow"].includes(
                    String((selected.data as { actionType?: string }).actionType ?? "add_tag"),
                  ) ? (
                    <div className="space-y-1.5">
                      <Label>Workflow</Label>
                      <select
                        value={String((selected.data as { actionWorkflowId?: string | null }).actionWorkflowId ?? "")}
                        onChange={(e) => updateSelected({ actionWorkflowId: e.target.value || null })}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">
                          {String((selected.data as { actionType?: string }).actionType) === "remove_workflow"
                            ? "All active workflows"
                            : "Select a workflow…"}
                        </option>
                        {callableWorkflows.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  {String((selected.data as { actionType?: string }).actionType ?? "add_tag") === "set_field" ? (
                    <div className="space-y-1.5">
                      <Label>Field</Label>
                      <select
                        value={String((selected.data as { actionField?: string }).actionField ?? "")}
                        onChange={(e) => updateSelected({ actionField: e.target.value })}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Select a field…</option>
                        {SETTABLE_FIELDS.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  {!["human_takeover", "stop_flow", "enroll_workflow", "remove_workflow"].includes(
                    String((selected.data as { actionType?: string }).actionType ?? "add_tag"),
                  ) ? (
                    <div className="space-y-1.5">
                      <Label>Value</Label>
                      <Input
                        value={String((selected.data as { actionValue?: string }).actionValue ?? "")}
                        onChange={(e) => updateSelected({ actionValue: e.target.value })}
                        placeholder="e.g. vip"
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {selectedIsWorkflow ? (
                <div className="space-y-1.5">
                  <Label>Workflow to call</Label>
                  <select
                    value={String((selected.data as { targetWorkflowId?: string }).targetWorkflowId ?? "")}
                    onChange={(e) => {
                      const id = e.target.value;
                      const wf = callableWorkflows.find((w) => w.id === id);
                      updateSelected({ targetWorkflowId: id, targetWorkflowName: wf?.name ?? "" });
                    }}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select a workflow…</option>
                    {callableWorkflows.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-muted-foreground">
                    When this step runs, the lead is enrolled into the selected workflow. Save this workflow first
                    if the target list looks empty.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label>Message content</Label>
                  <Textarea
                    ref={messageRef}
                    value={String((selected.data as { content?: string }).content ?? "")}
                    onChange={(e) => updateSelected({ content: e.target.value })}
                    rows={6}
                    placeholder="The WhatsApp message to send… click a variable below to insert it"
                  />
                  <div className="flex flex-wrap gap-1 pt-1">
                    {allVariables.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertVariable(v)}
                        className="rounded-md border border-input bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        {`{{${v}}}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!selectedIsWorkflow ? (
                <>
                  {/* Media attachment for this message step */}
                  <div className="space-y-1.5 rounded-md border bg-muted/20 p-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-1.5 text-xs">
                        <ImageIcon className="h-3.5 w-3.5" /> Media (optional)
                      </Label>
                      <div className="flex gap-1">
                        <input
                          ref={stepMediaInputRef}
                          type="file"
                          accept="image/*,audio/*,video/*,application/pdf"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 12 * 1024 * 1024) {
                              toast.error("File too large (max 12 MB)");
                              return;
                            }
                            setUploadingStepMedia(true);
                            try {
                              const buf = await file.arrayBuffer();
                              const bytes = new Uint8Array(buf);
                              let binary = "";
                              const chunk = 0x8000;
                              for (let i = 0; i < bytes.length; i += chunk) {
                                binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
                              }
                              const base64 = typeof btoa === "function" ? btoa(binary) : "";
                              const res = (await uploadFn({
                                data: { filename: file.name, mime: file.type || "application/octet-stream", base64 },
                              })) as { ok: boolean; url?: string; mime?: string; filename?: string; error?: string };
                              if (!res.ok || !res.url) {
                                toast.error(res.error ?? "Upload failed");
                                return;
                              }
                              const mime = res.mime ?? file.type;
                              const kind: "image" | "audio" | "video" | "document" = mime.startsWith("image/")
                                ? "image"
                                : mime.startsWith("audio/")
                                  ? "audio"
                                  : mime.startsWith("video/")
                                    ? "video"
                                    : "document";
                              updateSelected({
                                media: { url: res.url, mime, kind, filename: res.filename ?? file.name, caption: null },
                              });
                              toast.success("Media attached");
                            } catch {
                              toast.error("Upload failed");
                            } finally {
                              setUploadingStepMedia(false);
                              if (stepMediaInputRef.current) stepMediaInputRef.current.value = "";
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => stepMediaInputRef.current?.click()}
                          disabled={uploadingStepMedia}
                        >
                          {uploadingStepMedia ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <Paperclip className="mr-1 h-3 w-3" />
                          )}
                          {(selected.data as { media?: StepMedia }).media ? "Replace" : "Upload"}
                        </Button>
                        {(selected.data as { media?: StepMedia }).media ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => updateSelected({ media: null })}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    {(selected.data as { media?: StepMedia }).media ? (
                      <div className="flex items-start gap-2">
                        {((selected.data as { media?: StepMedia }).media as NonNullable<StepMedia>).kind === "image" ? (
                          <img
                            src={((selected.data as { media?: StepMedia }).media as NonNullable<StepMedia>).url}
                            alt="preview"
                            className="h-14 w-14 rounded border object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded border bg-background text-[10px] uppercase text-muted-foreground">
                            {((selected.data as { media?: StepMedia }).media as NonNullable<StepMedia>).kind}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs">
                            {((selected.data as { media?: StepMedia }).media as NonNullable<StepMedia>).filename}
                          </p>
                          <Input
                            className="mt-1 h-7 text-xs"
                            value={((selected.data as { media?: StepMedia }).media as NonNullable<StepMedia>).caption ?? ""}
                            onChange={(e) => {
                              const cur = (selected.data as { media?: StepMedia }).media as NonNullable<StepMedia>;
                              updateSelected({ media: { ...cur, caption: e.target.value || null } });
                            }}
                            placeholder="Optional caption"
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Quick-reply buttons */}
                  <div className="space-y-1.5 rounded-md border bg-muted/20 p-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Quick-reply buttons</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={(((selected.data as { buttons?: StepButton[] }).buttons ?? []).length) >= 3}
                        onClick={() => {
                          const cur = ((selected.data as { buttons?: StepButton[] }).buttons ?? []) as StepButton[];
                          updateSelected({ buttons: [...cur, { title: "", next_workflow_id: null }] });
                        }}
                      >
                        <Plus className="mr-1 h-3 w-3" /> Add
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Up to 3 tappable buttons (WhatsApp Cloud only — other channels get a numbered list). Link each
                      button to a follow-up workflow to branch the sequence when the recipient taps it.
                    </p>
                    {(((selected.data as { buttons?: StepButton[] }).buttons ?? []) as StepButton[]).map((b, i) => (
                      <div key={i} className="grid gap-1.5 sm:grid-cols-[1fr_1fr_auto]">
                        <Input
                          className="h-8 text-xs"
                          maxLength={20}
                          value={b.title}
                          onChange={(e) => {
                            const arr = [...(((selected.data as { buttons?: StepButton[] }).buttons ?? []) as StepButton[])];
                            arr[i] = { ...arr[i], title: e.target.value };
                            updateSelected({ buttons: arr });
                          }}
                          placeholder={`Button ${i + 1}`}
                        />
                        <select
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                          value={b.next_workflow_id ?? ""}
                          onChange={(e) => {
                            const arr = [...(((selected.data as { buttons?: StepButton[] }).buttons ?? []) as StepButton[])];
                            arr[i] = { ...arr[i], next_workflow_id: e.target.value || null };
                            updateSelected({ buttons: arr });
                          }}
                        >
                          <option value="">No workflow (just a reply)</option>
                          {callableWorkflows.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            const arr = (((selected.data as { buttons?: StepButton[] }).buttons ?? []) as StepButton[]).filter(
                              (_, idx) => idx !== i,
                            );
                            updateSelected({ buttons: arr });
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}

              <div className="space-y-1.5">
                <Label>Scheduling</Label>
                <select
                  value={String((selected.data as { anchor?: string }).anchor ?? "wait")}
                  onChange={(e) => updateSelected({ anchor: e.target.value })}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {STEP_ANCHORS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  {STEP_ANCHORS.find(
                    (a) => a.id === ((selected.data as { anchor?: string }).anchor ?? "wait"),
                  )?.help}
                </p>
              </div>
              {((selected.data as { anchor?: string }).anchor ?? "wait") === "wait" ? (
                <div className="space-y-1.5">
                  <Label>Wait before sending</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={Number((selected.data as { delayValue?: number }).delayValue ?? 0)}
                      onChange={(e) => updateSelected({ delayValue: Math.max(0, Number(e.target.value)) })}
                      className="w-24"
                    />
                    <select
                      value={String((selected.data as { delayUnit?: string }).delayUnit ?? "minutes")}
                      onChange={(e) => updateSelected({ delayUnit: e.target.value })}
                      className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {TIME_UNITS.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label>Send before the target date</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={Number((selected.data as { offsetValue?: number }).offsetValue ?? 0)}
                      onChange={(e) => updateSelected({ offsetValue: Math.max(0, Number(e.target.value)) })}
                      className="w-24"
                    />
                    <select
                      value={String((selected.data as { offsetUnit?: string }).offsetUnit ?? "days")}
                      onChange={(e) => updateSelected({ offsetUnit: e.target.value })}
                      className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {TIME_UNITS.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    The goal date is set per lead when you assign this workflow. Appointment dates come from
                    the lead&apos;s bookings.
                  </p>
                </div>
              )}
              <Button variant="ghost" size="sm" className="text-destructive" onClick={deleteSelected}>
                <Trash2 className="mr-1 h-4 w-4" /> Delete step
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Click a message node to edit its content and delay. Connect nodes by dragging from one handle to the next
              to define the send order.
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => save.mutate()} disabled={save.isPending || !name}>
          <Save className="mr-1 h-4 w-4" /> Save Workflow
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Close
        </Button>
      </div>
    </div>
  );
}
