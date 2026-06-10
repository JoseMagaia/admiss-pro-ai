import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, Workflow as WorkflowIcon, Power } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { triggerTypeLabel } from "@/lib/orchestration";
import {
  listWorkflows,
  deleteWorkflow,
  listResponderAgents,
  listWorkspaces,
  listAiVariables,
} from "@/lib/dashboard.functions";
import { WorkflowBuilder, type WorkflowRow } from "./WorkflowBuilder";

const EMPTY_WORKFLOW: WorkflowRow = {
  name: "",
  description: "",
  workspace_id: null,
  agent_id: null,
  trigger_segment: "manual",
  trigger_type: "manual",
  trigger_config: {},
  enabled: false,
  graph: {},
};

export function WorkflowManager() {
  const qc = useQueryClient();
  const listFn = useServerFn(listWorkflows);
  const delFn = useServerFn(deleteWorkflow);
  const agentsFn = useServerFn(listResponderAgents);
  const wsFn = useServerFn(listWorkspaces);

  const { data } = useQuery({ queryKey: ["workflows"], queryFn: () => listFn() });
  const { data: agentsData } = useQuery({ queryKey: ["responder-agents"], queryFn: () => agentsFn() });
  const { data: wsData } = useQuery({ queryKey: ["workspaces"], queryFn: () => wsFn() });

  const workflows = (data?.workflows ?? []) as unknown as WorkflowRow[];
  const agents = ((agentsData?.agents ?? []) as unknown as Array<{ id: string; name: string }>).map((a) => ({
    id: a.id,
    name: a.name,
  }));
  const workspaces = ((wsData?.workspaces ?? []) as unknown as Array<{ id: string; name: string }>).map((w) => ({
    id: w.id,
    name: w.name,
  }));

  const [editing, setEditing] = useState<WorkflowRow | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Workflow deleted");
      qc.invalidateQueries({ queryKey: ["workflows"] });
    },
    onError: () => toast.error("Failed to delete"),
  });



  if (editing) {
    return (
      <WorkflowBuilder
        initial={editing}
        agents={agents}
        workspaces={workspaces}
        onDone={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Visually build outbound message sequences. Choose how leads are enrolled (pipeline stage, time since first/last
        message, or booking status) and which responder agent takes over when a lead reacts.
      </p>
      {workflows.map((w) => {
        const triggerLabel =
          w.trigger_type && w.trigger_type !== "pipeline_stage"
            ? triggerTypeLabel(w.trigger_type)
            : triggerTypeLabel("pipeline_stage");
        const agentName = agents.find((a) => a.id === w.agent_id)?.name ?? "No responder";
        const stepCount = ((w.graph as { nodes?: unknown[] })?.nodes ?? []).filter(
          (n) => (n as { type?: string }).type === "message",
        ).length;
        return (
          <div key={w.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <WorkflowIcon className="h-4 w-4 text-primary" />
                <span className="font-semibold">{w.name}</span>
                <span
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    w.enabled ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Power className="h-3 w-3" /> {w.enabled ? "Active" : "Off"}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {triggerLabel} · {stepCount} step{stepCount === 1 ? "" : "s"} · {agentName}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="outline" size="sm" onClick={() => setEditing(w)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm(`Delete workflow "${w.name}"?`)) del.mutate(w.id!);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        );
      })}
      {workflows.length === 0 && <p className="text-sm text-muted-foreground">No workflows yet.</p>}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setEditing({ ...EMPTY_WORKFLOW })}>
          <Plus className="mr-1 h-4 w-4" /> New Workflow
        </Button>
      </div>
    </div>
  );
}
