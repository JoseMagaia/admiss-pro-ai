import { useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Workflow as WorkflowIcon, Plus, X, Target } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  listLeadWorkflows,
  assignLeadWorkflow,
  removeLeadWorkflow,
} from "@/lib/dashboard.functions";

interface AssignedWorkflow {
  id: string;
  workflow_id: string;
  name: string;
  status: string;
  current_step: number;
  goal_at: string | null;
  next_run_at: string | null;
}

const statusStyles: Record<string, string> = {
  active: "bg-success/15 text-success",
  paused: "bg-amber-500/15 text-amber-600",
  completed: "bg-muted text-muted-foreground",
  reacted: "bg-primary/15 text-primary",
  stopped: "bg-destructive/15 text-destructive",
};

export function LeadWorkflowManager({
  phone,
  trigger,
}: {
  phone: string;
  /** Optional custom trigger button. Defaults to a small outline button. */
  trigger?: React.ReactNode;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [pickWorkflow, setPickWorkflow] = useState("");
  const [goalAt, setGoalAt] = useState("");

  const listFn = useServerFn(listLeadWorkflows);
  const assignFn = useServerFn(assignLeadWorkflow);
  const removeFn = useServerFn(removeLeadWorkflow);

  const { data } = useQuery({
    queryKey: ["lead-workflows", phone],
    queryFn: () => listFn({ data: { phone } }),
    enabled: open && !!phone,
  });

  const assigned = (data?.assigned ?? []) as AssignedWorkflow[];
  const available = (data?.available ?? []) as Array<{ id: string; name: string }>;
  const assignedIds = new Set(assigned.map((a) => a.workflow_id));
  const selectable = available.filter((w) => !assignedIds.has(w.id));

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["lead-workflows", phone] });
    qc.invalidateQueries({ queryKey: ["workflow-states"] });
  };

  const assign = useMutation({
    mutationFn: () =>
      assignFn({ data: { phone, workflowId: pickWorkflow, goalAt: goalAt || null } }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error?: string };
      if (!res.ok) {
        toast.error(res.error ?? "Failed to assign workflow");
        return;
      }
      toast.success("Workflow assigned");
      setPickWorkflow("");
      setGoalAt("");
      invalidate();
    },
    onError: () => toast.error("Failed to assign workflow"),
  });

  const remove = useMutation({
    mutationFn: (workflowId: string) => removeFn({ data: { phone, workflowId } }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error?: string };
      if (!res.ok) {
        toast.error(res.error ?? "Failed to remove workflow");
        return;
      }
      toast.success("Workflow removed");
      invalidate();
    },
    onError: () => toast.error("Failed to remove workflow"),
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs">
            <WorkflowIcon className="h-3.5 w-3.5" /> Workflows
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <WorkflowIcon className="h-4 w-4 text-primary" /> Assigned workflows
        </div>

        <div className="space-y-1.5">
          {assigned.length === 0 && (
            <p className="text-xs text-muted-foreground">No workflows assigned to this lead.</p>
          )}
          {assigned.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-2 rounded-lg border bg-card px-2.5 py-1.5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-medium">{a.name}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold capitalize ${
                      statusStyles[a.status] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Step {a.current_step + 1}
                  {a.goal_at && (
                    <>
                      {" · "}
                      <Target className="inline h-2.5 w-2.5" /> goal{" "}
                      {new Date(a.goal_at).toLocaleDateString()}
                    </>
                  )}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 shrink-0"
                disabled={remove.isPending}
                onClick={() => remove.mutate(a.workflow_id)}
                aria-label={`Remove ${a.name}`}
              >
                <X className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t pt-3">
          <Label className="text-xs">Add a workflow</Label>
          <select
            value={pickWorkflow}
            onChange={(e) => setPickWorkflow(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">Select a workflow…</option>
            {selectable.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">
              Goal date (optional — for countdown steps)
            </Label>
            <Input
              type="datetime-local"
              value={goalAt}
              onChange={(e) => setGoalAt(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <Button
            size="sm"
            className="w-full gap-1"
            disabled={!pickWorkflow || assign.isPending}
            onClick={() => assign.mutate()}
          >
            <Plus className="h-3.5 w-3.5" /> Assign workflow
          </Button>
          {selectable.length === 0 && available.length > 0 && (
            <p className="text-[10px] text-muted-foreground">
              All enabled workflows are already assigned.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
