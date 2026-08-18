import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Handle,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
  type NodeProps,
  type OnNodesChange,
  type OnEdgesChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Save,
  Undo2,
  Redo2,
  Play,
  Settings2,
  ChevronDown,
  ChevronUp,
  Wand2,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PIPELINE_COLUMNS } from "@/lib/pipeline";
import {
  TRIGGER_TYPES,
  TIME_UNITS,
  BOOKING_STATUSES,
  type TriggerType,
  type TriggerConfig,
} from "@/lib/orchestration";
import { MEETING_OUTCOME_TEMPLATES } from "@/lib/meeting-outcomes";
import { upsertWorkflow, listHttpActions } from "@/lib/dashboard.functions";
import { FLOW_BLOCKS, FLOW_CATEGORIES, FLOW_BLOCK_MAP, blockStyle, type FlowBlockType } from "./flowblocks";
import { NodeInspector } from "./NodeInspector";
import { WorkflowPreview } from "./WorkflowPreview";

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

const BUILTIN_VARS = ["lead_name", "course_interest", "country_interest", "phone_number"];

interface MiniAgent {
  id: string;
  name: string;
}
interface MiniWorkspace {
  id: string;
  name: string;
}

function unitShort(unit: string): string {
  return TIME_UNITS.find((u) => u.id === unit)?.label.toLowerCase() ?? unit;
}

/** Block kind of a node: lives in data.type / data._t; legacy graphs used node.type. */
function blockKindOf(n: { type?: string; data?: unknown }): string {
  const d = (n.data ?? {}) as Record<string, unknown>;
  return String(d.type ?? d._t ?? n.type ?? "text");
}

/** structuredClone is unavailable in some sandboxed/older engines; fall back to JSON. */
function clone<T>(v: T): T {
  if (typeof structuredClone === "function") return structuredClone(v);
  return JSON.parse(JSON.stringify(v));
}

function nodeSummary(type: string, d: Record<string, unknown>): { main: string; sub?: string } {
  switch (type) {
    case "text":
      return { main: String(d.content ?? "") || "(empty message)" };
    case "image":
      return { main: String(d.imageUrl ?? "") || "(no image URL)", sub: String(d.caption ?? "") || undefined };
    case "buttons":
      return {
        main: String(d.message ?? "") || "(no message)",
        sub: (Array.isArray(d.options) ? d.options : []).map((o) => (o as { label: string }).label).join(" · "),
      };
    case "wait":
      return { main: `Wait ${d.delayValue ?? 1} ${unitShort(String(d.delayUnit ?? "days"))}` };
    case "condition":
      return {
        main: `${String(d.field ?? "field")} ${String(d.operator ?? "equals")} ${String(d.value ?? "")}`,
        sub: `✓ ${String(d.trueLabel ?? "Yes")}  ·  ✗ ${String(d.falseLabel ?? "No")}`,
      };
    case "setvar":
      return { main: `${String(d.varName ?? "")} = ${String(d.varValue ?? "")}` };
    case "ai":
      return { main: String(d.agentName ?? "Default agent"), sub: String(d.instruction ?? "") || undefined };
    case "http":
      return { main: String(d.actionName ?? "HTTP action") };
    case "booking":
      return { main: `${String(d.appointmentType ?? "booking")} · in ${d.daysAhead ?? 3} days` };
    case "handoff":
      return { main: "Hand off to a human agent", sub: String(d.note ?? "") || undefined };
    case "end":
      return { main: String(d.note ?? "Flow ended") };
    case "redirect":
      return { main: String(d.targetWorkflowName ?? "Select a workflow…") };
    default:
      return { main: String(d.label ?? type) };
  }
}

function TriggerNode({ data }: NodeProps) {
  const d = data as { label?: string };
  return (
    <div className="w-44 rounded-xl border-2 border-amber-400/70 bg-card px-3 py-2 shadow-card">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
        <ZapMini /> {d.label ?? "Trigger"}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function ZapMini() {
  return <span className="text-amber-500">⚡</span>;
}

function FlowNode({ data, selected, id }: NodeProps) {
  const type = String((data as { type?: string }).type ?? (data as { _t?: string })._t ?? "text");
  const d = (data ?? {}) as Record<string, unknown>;
  const def = FLOW_BLOCK_MAP[type] ?? FLOW_BLOCK_MAP.text;
  const style = blockStyle(type);
  const summary = nodeSummary(type, d);
  const Icon = def.icon;
  const options = Array.isArray(d.options) ? (d.options as Array<{ id: string; label: string }>) : [];
  const hasBranch = type === "condition" || (type === "buttons" && options.length > 0);

  return (
    <div
      className={`w-52 rounded-xl border-2 bg-card px-3 py-2 shadow-card transition-shadow ${
        selected ? "border-primary shadow-glow" : "border-border"
      }`}
    >
      {type !== "trigger" && <Handle type="target" position={Position.Top} />}
      <div className="flex items-center gap-1.5">
        <span className={`flex h-5 w-5 items-center justify-center rounded-md ${style.chip}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className={`text-xs font-semibold ${style.text}`}>{def.label}</span>
      </div>
      <p className="mt-1 line-clamp-2 text-xs text-foreground/80">{summary.main}</p>
      {summary.sub && <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">{summary.sub}</p>}

      {type === "condition" && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="yes"
            style={{ top: "30%", right: -6, background: "#10b981", width: 12, height: 12 }}
            className="!border-2 !border-card"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="no"
            style={{ top: "70%", right: -6, background: "#f43f5e", width: 12, height: 12 }}
            className="!border-2 !border-card"
          />
          <span className="pointer-events-none absolute right-3 top-4 text-[9px] font-bold text-success">✓</span>
          <span className="pointer-events-none absolute right-3 bottom-2 text-[9px] font-bold text-destructive">✗</span>
        </>
      )}

      {type === "buttons" &&
        options.map((o, i) => (
          <Handle
            key={o.id}
            type="source"
            position={Position.Right}
            id={`opt_${o.id}`}
            style={{ top: `${((i + 1) / (options.length + 1)) * 100}%`, right: -6, background: "#8b5cf6", width: 12, height: 12 }}
            className="!border-2 !border-card"
          />
        ))}

      {!hasBranch && type !== "trigger" && <Handle type="source" position={Position.Bottom} />}
    </div>
  );
}

const nodeTypes = { trigger: TriggerNode, flow: FlowNode };

function defaultGraph(): { nodes: Node[]; edges: Edge[] } {
  return {
    nodes: [{ id: "trigger", type: "trigger", position: { x: 160, y: 40 }, data: { label: "Trigger" } }],
    edges: [],
  };
}

function uid(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Normalizes a saved graph for React Flow. Migrates legacy builder graphs
 * (nodes with type "message" / "workflow") to the current block format where
 * node.type is always "flow" and the block kind lives in data.type / data._t.
 * Also drops malformed nodes/edges so the canvas never crashes on old data.
 */
function normalizeGraph(g: unknown): { nodes: Node[]; edges: Edge[] } {
  const raw = (g ?? {}) as { nodes?: unknown; edges?: unknown };
  const nodeArr = Array.isArray(raw.nodes) ? raw.nodes : [];
  const nodes: Node[] = nodeArr
    .map((n) => {
      const src = (n ?? {}) as Record<string, unknown>;
      const id = String(src.id ?? "");
      if (!id) return null;
      let type = String(src.type ?? "");
      const data = (src.data && typeof src.data === "object" ? src.data : {}) as Record<string, unknown>;
      if (type === "message") {
        // Legacy text-message step.
        type = "flow";
        data.type = "text";
        data._t = "text";
      } else if (type === "workflow") {
        // Legacy call-workflow step.
        type = "flow";
        data.type = "redirect";
        data._t = "redirect";
      } else if (type !== "flow" && type !== "trigger") {
        // Unknown type — default to a text block rather than crash React Flow.
        type = "flow";
        data.type = "text";
        data._t = "text";
      }
      const pos = src.position as { x?: number; y?: number } | undefined;
      return {
        id,
        type,
        position:
          pos && typeof pos.x === "number" && typeof pos.y === "number"
            ? { x: pos.x, y: pos.y }
            : { x: 160, y: 40 },
        data,
      } as Node;
    })
    .filter((n): n is Node => Boolean(n));

  const ids = new Set(nodes.map((n) => n.id));
  const edges: Edge[] = (Array.isArray(raw.edges) ? raw.edges : [])
    .map((e) => {
      const src = (e ?? {}) as Record<string, unknown>;
      const source = String(src.source ?? "");
      const target = String(src.target ?? "");
      if (!source || !target || !ids.has(source) || !ids.has(target)) return null;
      return {
        id: String(src.id ?? `e_${source}_${target}_${uid("")}`),
        source,
        target,
        sourceHandle: src.sourceHandle ?? null,
        targetHandle: src.targetHandle ?? null,
      } as Edge;
    })
    .filter((e): e is Edge => Boolean(e));

  if (nodes.length === 0) return defaultGraph();
  if (!ids.has("trigger")) {
    nodes.unshift({ id: "trigger", type: "trigger", position: { x: 160, y: 40 }, data: { label: "Trigger" } });
  }
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
  workflows?: Array<{ id: string; name: string }>;
  variables?: string[];
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const saveFn = useServerFn(upsertWorkflow);
  const httpFn = useServerFn(listHttpActions);
  const { data: httpData } = useQuery({ queryKey: ["http-actions"], queryFn: () => httpFn() });
  const httpActions = (httpData?.actions ?? []) as Array<{ id: string; name: string; method?: string | null }>;

  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description ?? "");
  const [workspaceId, setWorkspaceId] = useState(initial.workspace_id ?? "");
  const [agentId, setAgentId] = useState(initial.agent_id ?? "");
  const [enabled, setEnabled] = useState(initial.enabled);
  const [showSettings, setShowSettings] = useState(false);

  const initialType: TriggerType =
    (initial.trigger_type as TriggerType) ??
    (initial.trigger_segment && initial.trigger_segment !== "manual" ? "pipeline_stage" : "manual");
  const initialConfig: TriggerConfig =
    initial.trigger_config ?? (initial.trigger_segment && initial.trigger_segment !== "manual" ? { segment: initial.trigger_segment } : {});
  const [triggerType, setTriggerType] = useState<TriggerType>(initialType);
  const [segment, setSegment] = useState(initialConfig.segment ?? PIPELINE_COLUMNS[0].id);
  const [amount, setAmount] = useState<number>(initialConfig.amount ?? 1);
  const [unit, setUnit] = useState<string>(initialConfig.unit ?? "days");
  const [bookingStatus, setBookingStatus] = useState<string>(initialConfig.status ?? "pending");

  const initialGraph = useMemo(() => normalizeGraph(initial.graph), []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraph.edges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [templateChoice, setTemplateChoice] = useState("");

  // Undo / redo history.
  const historyRef = useRef<Array<{ nodes: Node[]; edges: Edge[] }>>([]);
  const futureRef = useRef<Array<{ nodes: Node[]; edges: Edge[] }>>([]);
  const pushHistory = useCallback((nds: Node[], eds: Edge[]) => {
    historyRef.current.push({ nodes: clone(nds), edges: clone(eds) });
    if (historyRef.current.length > 60) historyRef.current.shift();
    futureRef.current = [];
  }, []);
  const undo = useCallback(() => {
    const prev = historyRef.current.pop();
    if (!prev) return;
    futureRef.current.push({ nodes: clone(nodes), edges: clone(edges) });
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setSelectedId(null);
  }, [nodes, edges, setNodes, setEdges]);
  const redo = useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) return;
    historyRef.current.push({ nodes: clone(nodes), edges: clone(edges) });
    setNodes(next.nodes);
    setEdges(next.edges);
    setSelectedId(null);
  }, [nodes, edges, setNodes, setEdges]);

  const allVariables = useMemo(
    () => [...BUILTIN_VARS, ...(variables ?? []).filter((v) => !BUILTIN_VARS.includes(v))],
    [variables],
  );
  const callableWorkflows = (workflows ?? []).filter((w) => w.id !== initial.id);

  const branchEdgeLabel = (node: Node, handleId: string | null | undefined): string | undefined => {
    if (!handleId || !node) return undefined;
    const d = (node.data ?? {}) as Record<string, unknown>;
    const kind = blockKindOf(node);
    if (kind === "condition") {
      return handleId === "yes" ? String(d.trueLabel ?? "Yes") : String(d.falseLabel ?? "No");
    }
    if (kind === "buttons" && handleId.startsWith("opt_")) {
      const options = Array.isArray(d.options) ? (d.options as Array<{ id: string; label: string }>) : [];
      return options.find((o) => `opt_${o.id}` === handleId)?.label;
    }
    return undefined;
  };

  const onConnect = useCallback(
    (c: Connection) => {
      pushHistory(nodes, edges);
      const sourceNode = nodes.find((n) => n.id === c.source);
      const label = branchEdgeLabel(sourceNode as Node, c.sourceHandle);
      const color = sourceNode ? blockStyle(blockKindOf(sourceNode)).edge : "#94a3b8";
      const newEdge: Edge = {
        ...c,
        id: `e_${c.source}_${c.target}_${uid("")}`,
        label,
        data: { branch: label },
        style: label ? { stroke: color, strokeWidth: 2 } : undefined,
        labelStyle: { fontSize: 10, fill: "#fff", fontWeight: 700 },
        labelBgStyle: { fill: color, fillOpacity: 0.9 },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 6,
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [nodes, edges, pushHistory, setEdges],
  );

  // ---- adding blocks (drag & drop + click) ----
  const tailNode = useMemo(() => {
    const sourceIds = new Set(edges.map((e) => e.source));
    const free = nodes.filter((n) => !sourceIds.has(n.id) && String(n.type) !== "trigger");
    if (free.length > 0) return free[free.length - 1];
    return nodes.find((n) => n.id === selectedId) ?? nodes[nodes.length - 1];
  }, [nodes, edges, selectedId]);

  const canAutoConnect = (n: Node | undefined) => {
    if (!n) return false;
    const kind = blockKindOf(n);
    return kind !== "condition" && kind !== "buttons";
  };

  const createNode = useCallback(
    (type: FlowBlockType, position: { x: number; y: number }): Node => {
      const def = FLOW_BLOCK_MAP[type];
      const data = { ...def.defaultData() };
      if (type === "redirect") {
        data.targetWorkflowId = "";
        data.targetWorkflowName = "";
      }
      return {
        id: uid("n_"),
        type: "flow",
        position,
        data: { ...data, type, _t: type },
      };
    },
    [],
  );

  const addBlock = useCallback(
    (type: FlowBlockType, at?: { x: number; y: number }) => {
      if (type === "trigger") {
        toast.info("The trigger block is already on the canvas.");
        return;
      }
      pushHistory(nodes, edges);
      const tail = tailNode;
      const base = at ?? { x: 160, y: (tail?.position.y ?? 40) + (canAutoConnect(tail) ? 140 : 220) };
      const newNode = createNode(type, base);
      setNodes((nds) => [...nds, newNode]);
      if (at && canAutoConnect(tail)) {
        setEdges((eds) =>
          addEdge(
            {
              id: `e_${tail!.id}_${newNode.id}_${uid("")}`,
              source: tail!.id,
              target: newNode.id,
              sourceHandle: null,
              targetHandle: null,
            } as Connection,
            eds,
          ),
        );
      }
      setSelectedId(newNode.id);
    },
    [nodes, edges, pushHistory, tailNode, createNode, setNodes, setEdges],
  );

  const onDrop = useCallback(
    (e: React.DragEvent, screenToFlowPosition: (p: { x: number; y: number }) => { x: number; y: number }) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/flowblock");
      if (!raw || !FLOW_BLOCK_MAP[raw]) return;
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      if (!Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return;
      addBlock(raw as FlowBlockType, { x: Math.max(0, pos.x - 100), y: Math.max(0, pos.y - 30) });
    },
    [addBlock],
  );

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    pushHistory(nodes, edges);
    setNodes((nds) => nds.filter((n) => n.id !== selectedId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedId && e.target !== selectedId));
    setSelectedId(null);
  }, [selectedId, nodes, edges, pushHistory, setNodes, setEdges]);

  const duplicateSelected = useCallback(() => {
    if (!selectedId) return;
    const src = nodes.find((n) => n.id === selectedId);
    if (!src) return;
    pushHistory(nodes, edges);
    const copy: Node = {
      ...src,
      id: uid("dup_"),
      position: { x: src.position.x + 36, y: src.position.y + 36 },
      selected: false,
      data: clone(src.data),
    };
    setNodes((nds) => [...nds, copy]);
    setSelectedId(copy.id);
  }, [selectedId, nodes, edges, pushHistory, setNodes]);

  const updateSelected = useCallback(
    (patch: Record<string, unknown>) => {
      setNodes((nds) => nds.map((n) => (n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n)));
    },
    [selectedId, setNodes],
  );

  const selected = nodes.find((n) => n.id === selectedId && n.type !== "trigger");

  const applyTemplate = (tmpl: (typeof MEETING_OUTCOME_TEMPLATES)[number]) => {
    setName(tmpl.name);
    setDescription(tmpl.description);
    setTriggerType("manual");
    pushHistory(nodes, edges);
    const tn: Node[] = [
      { id: "trigger", type: "trigger", position: { x: 160, y: 40 }, data: { label: "Trigger" } },
    ];
    const te: Edge[] = [];
    let prevId = "trigger";
    tmpl.steps.forEach((step, i) => {
      const id = uid("m_");
      tn.push({
        id,
        type: "flow",
        position: { x: 160, y: 40 + (i + 1) * 130 },
        data: { type: "text", _t: "text", content: step.content, delayValue: step.delayValue, delayUnit: step.delayUnit, anchor: "wait", offsetValue: 1, offsetUnit: "days" },
      });
      te.push({ id: uid("e_"), source: prevId, target: id } as Edge);
      prevId = id;
    });
    setNodes(tn);
    setEdges(te);
    setSelectedId(null);
    toast.success(`Loaded "${tmpl.name}" template`);
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

  function buildTriggerConfig(): TriggerConfig {
    if (triggerType === "pipeline_stage") return { segment };
    if (triggerType === "time_since_first_message" || triggerType === "time_since_last_message")
      return { amount, unit: unit as TriggerConfig["unit"] };
    if (triggerType === "booking_status") return { status: bookingStatus as TriggerConfig["status"] };
    return {};
  }

  const isTimeTrigger = triggerType === "time_since_first_message" || triggerType === "time_since_last_message";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3 shadow-card">
        <div className="min-w-0 flex-1">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Workflow name…" className="font-semibold" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" onClick={undo} disabled={historyRef.current.length === 0} title="Undo">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={redo} disabled={futureRef.current.length === 0} title="Redo">
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Play className="mr-1 h-4 w-4" /> Test
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !name.trim()}>
            <Save className="mr-1 h-4 w-4" /> Save
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowSettings((v) => !v)}>
            <Settings2 className="mr-1 h-4 w-4" /> Settings {showSettings ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Collapsible flow settings */}
      {showSettings && (
        <div className="rounded-2xl border bg-card p-4 shadow-card">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            </div>
            {triggerType === "pipeline_stage" && (
              <div className="space-y-1.5">
                <Label>Pipeline segment</Label>
                <select value={segment} onChange={(e) => setSegment(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
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
                  <Input type="number" min={0} value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))} className="w-20" />
                  <select value={unit} onChange={(e) => setUnit(e.target.value)} className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm">
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
                <select value={bookingStatus} onChange={(e) => setBookingStatus(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm capitalize">
                  {BOOKING_STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Connection / Inbox</Label>
              <select value={workspaceId} onChange={(e) => setWorkspaceId(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Lead&apos;s inbox / default</option>
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Responder agent</Label>
              <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">None</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Start from template</Label>
              <select
                value={templateChoice}
                onChange={(e) => {
                  setTemplateChoice(e.target.value);
                  const tmpl = MEETING_OUTCOME_TEMPLATES.find((t) => t.name === e.target.value);
                  if (tmpl) applyTemplate(tmpl);
                }}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select a template…</option>
                {MEETING_OUTCOME_TEMPLATES.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional notes" />
            </div>
            <label className="flex items-center gap-2 pt-6 text-sm">
              <Switch checked={enabled} onCheckedChange={setEnabled} /> Enabled
            </label>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[200px_1fr_300px]">
        {/* Palette */}
        <div className="order-2 lg:order-1">
          <div className="sticky top-2 space-y-3 rounded-2xl border bg-card p-3 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Blocks</p>
            <div className="flex gap-4 overflow-x-auto pb-1 lg:max-h-[52vh] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible">
              {FLOW_CATEGORIES.map((cat) => (
                <div key={cat} className="shrink-0 lg:shrink">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{cat}</p>
                  <div className="flex gap-1.5 lg:flex-col">
                    {FLOW_BLOCKS.filter((b) => b.category === cat).map((b) => {
                      const style = blockStyle(b.type);
                      return (
                        <button
                          key={b.type}
                          type="button"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("application/flowblock", b.type);
                            e.dataTransfer.effectAllowed = "copy";
                          }}
                          onClick={() => addBlock(b.type)}
                          title={b.description}
                          className={`flex items-center gap-2 rounded-lg border bg-muted/30 px-2 py-1.5 text-left text-xs font-medium transition-colors hover:bg-muted ${style.ring}`}
                        >
                          <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${style.chip}`}>
                            <b.icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="truncate">{b.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="hidden text-[10px] leading-snug text-muted-foreground lg:block">
              Drag a block onto the canvas or click to append it to the flow.
            </p>
          </div>
        </div>

        {/* Canvas */}
        <div className="order-1 lg:order-2">
          <ReactFlowProvider>
            <CanvasArea
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelect={setSelectedId}
              onDropBlock={onDrop}
            />
          </ReactFlowProvider>
        </div>

        {/* Inspector */}
        <div className="order-3">
          <div className="sticky top-2 rounded-2xl border bg-card p-4 shadow-card">
            {selected ? (
              <NodeInspector
                node={selected}
                allVariables={allVariables}
                callableWorkflows={callableWorkflows}
                agents={agents}
                httpActions={httpActions}
                onPatch={updateSelected}
                onClose={() => setSelectedId(null)}
                onDelete={deleteSelected}
                onDuplicate={duplicateSelected}
              />
            ) : (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Block settings</p>
                <p>Select a block on the canvas to edit its content, branches and timing.</p>
                <ul className="list-inside list-disc space-y-1 text-xs">
                  <li>Drag from the ⚡ handle to connect blocks.</li>
                  <li>Condition blocks branch via the ✓ / ✗ handles.</li>
                  <li>Button blocks branch via each option&apos;s handle.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <WorkflowPreview open={previewOpen} onClose={() => setPreviewOpen(false)} nodes={nodes} edges={edges} />
    </div>
  );
}

function CanvasArea({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelect,
  onDropBlock,
}: {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node>;
  onEdgesChange: OnEdgesChange<Edge>;
  onConnect: (c: Connection) => void;
  onSelect: (id: string) => void;
  onDropBlock: (e: React.DragEvent, screenToFlowPosition: (p: { x: number; y: number }) => { x: number; y: number }) => void;
}) {
  const { screenToFlowPosition } = useReactFlow();
  return (
    <div
      className="h-[540px] overflow-hidden rounded-2xl border bg-muted/20 md:h-[560px]"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(e) => onDropBlock(e, screenToFlowPosition)}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, n) => onSelect(n.id)}
        onPaneClick={() => onSelect("")}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: "smoothstep" }}
      >
        <Background gap={20} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
