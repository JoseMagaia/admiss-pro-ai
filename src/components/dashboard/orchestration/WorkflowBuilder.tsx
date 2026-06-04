import { useCallback, useMemo, useState } from "react";
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
import { Save, Plus, MessageSquare, Zap, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PIPELINE_COLUMNS } from "@/lib/pipeline";
import { upsertWorkflow } from "@/lib/dashboard.functions";

export interface WorkflowRow {
  id?: string;
  name: string;
  description: string | null;
  workspace_id: string | null;
  agent_id: string | null;
  trigger_segment: string;
  enabled: boolean;
  graph: unknown;
}

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

function MessageNode({ data, selected }: NodeProps) {
  const d = data as { content?: string; delayMinutes?: number; index?: number };
  return (
    <div
      className={`w-52 rounded-xl border-2 bg-card px-4 py-2 shadow-card ${selected ? "border-primary" : "border-border"}`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-xs font-semibold text-primary">
        <MessageSquare className="h-3.5 w-3.5" /> Message {(d.index ?? 0) + 1}
      </div>
      <p className="mt-1 line-clamp-2 text-xs text-foreground/80">{d.content || "(empty message)"}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">
        wait {d.delayMinutes ?? 0} min before sending
      </p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { trigger: TriggerNode, message: MessageNode };

function defaultGraph(segmentLabel: string): { nodes: Node[]; edges: Edge[] } {
  return {
    nodes: [
      {
        id: "trigger",
        type: "trigger",
        position: { x: 80, y: 20 },
        data: { label: `Trigger: ${segmentLabel}` },
      },
    ],
    edges: [],
  };
}

export function WorkflowBuilder({
  initial,
  agents,
  workspaces,
  onDone,
}: {
  initial: WorkflowRow;
  agents: MiniAgent[];
  workspaces: MiniWorkspace[];
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const saveFn = useServerFn(upsertWorkflow);

  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description ?? "");
  const [workspaceId, setWorkspaceId] = useState(initial.workspace_id ?? "");
  const [agentId, setAgentId] = useState(initial.agent_id ?? "");
  const [segment, setSegment] = useState(initial.trigger_segment);
  const [enabled, setEnabled] = useState(initial.enabled);

  const segmentLabel = useMemo(
    () => PIPELINE_COLUMNS.find((c) => c.id === segment)?.label ?? "Manual",
    [segment],
  );

  const initialGraph = useMemo(() => {
    const g = (initial.graph ?? {}) as { nodes?: Node[]; edges?: Edge[] };
    if (g.nodes && g.nodes.length > 0) return { nodes: g.nodes, edges: g.edges ?? [] };
    return defaultGraph(segmentLabel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraph.edges);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const onConnect = useCallback((c: Connection) => setEdges((eds) => addEdge(c, eds)), [setEdges]);

  const messageCount = nodes.filter((n) => n.type === "message").length;

  const addMessage = () => {
    const id = `m${Date.now()}`;
    // tail = node with no outgoing edge
    const sources = new Set(edges.map((e) => e.source));
    const tail = nodes.find((n) => !sources.has(n.id)) ?? nodes[nodes.length - 1];
    const y = (tail?.position.y ?? 20) + 120;
    const newNode: Node = {
      id,
      type: "message",
      position: { x: 80, y },
      data: { content: "", delayMinutes: messageCount === 0 ? 0 : 60, index: messageCount },
    };
    setNodes((nds) => [...nds, newNode]);
    if (tail) setEdges((eds) => addEdge({ source: tail.id, target: id }, eds));
    setSelectedId(id);
  };

  const selected = nodes.find((n) => n.id === selectedId && n.type === "message");

  const updateSelected = (patch: Record<string, unknown>) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n)),
    );
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedId && e.target !== selectedId));
    setSelectedId(null);
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
          trigger_segment: segment,
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

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Workflow Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Cold lead re-engagement" />
        </div>
        <div className="space-y-1.5">
          <Label>Enrolls leads in segment</Label>
          <select
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="manual">Manual only</option>
            {PIPELINE_COLUMNS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Chatwoot Workspace</Label>
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
        <Button variant="outline" size="sm" onClick={addMessage}>
          <Plus className="mr-1 h-4 w-4" /> Add message step
        </Button>
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
                <span className="text-sm font-semibold">Edit message</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedId(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1.5">
                <Label>Message content</Label>
                <Textarea
                  value={String((selected.data as { content?: string }).content ?? "")}
                  onChange={(e) => updateSelected({ content: e.target.value })}
                  rows={6}
                  placeholder="The WhatsApp message to send…"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Wait before sending (minutes)</Label>
                <Input
                  type="number"
                  min={0}
                  value={Number((selected.data as { delayMinutes?: number }).delayMinutes ?? 0)}
                  onChange={(e) => updateSelected({ delayMinutes: Math.max(0, Number(e.target.value)) })}
                />
              </div>
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
