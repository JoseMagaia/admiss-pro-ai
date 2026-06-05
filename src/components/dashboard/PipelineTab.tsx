import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { GripVertical, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { listLeads, updateLeadStage } from "@/lib/dashboard.functions";
import { PIPELINE_COLUMNS, columnForStage, stageLabel } from "@/lib/pipeline";
import { useDashboardNav } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

interface Lead {
  id: string;
  phone_number: string;
  lead_name: string | null;
  course_interest: string | null;
  country_interest: string | null;
  qualification_status: string;
}

export function PipelineTab() {
  const qc = useQueryClient();
  const leadsFn = useServerFn(listLeads);
  const stageFn = useServerFn(updateLeadStage);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["leads"],
    queryFn: () => leadsFn(),
    refetchInterval: 5000,
  });

  const move = useMutation({
    mutationFn: (vars: { id: string; stage: string }) => stageFn({ data: vars }),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["leads"] });
      const prev = qc.getQueryData(["leads"]);
      qc.setQueryData(["leads"], (old: unknown) => {
        const o = old as { leads: Lead[] } | undefined;
        if (!o) return old;
        return { ...o, leads: o.leads.map((l) => (l.id === vars.id ? { ...l, qualification_status: vars.stage } : l)) };
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["leads"], ctx.prev);
      toast.error("Could not move lead");
    },
    onSuccess: () => toast.success("Lead moved"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });

  const leads = (data?.leads ?? []) as Lead[];

  function onDrop(colId: string) {
    setOverCol(null);
    if (!dragId) return;
    const col = PIPELINE_COLUMNS.find((c) => c.id === colId);
    if (!col) return;
    const lead = leads.find((l) => l.id === dragId);
    if (lead && columnForStage(lead.qualification_status).id !== colId) {
      move.mutate({ id: dragId, stage: col.stages[0] });
    }
    setDragId(null);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PIPELINE_COLUMNS.map((col) => {
        const colLeads = leads.filter((l) => columnForStage(l.qualification_status).id === col.id);
        return (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(col.id);
            }}
            onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
            onDrop={() => onDrop(col.id)}
            className={cn(
              "flex w-72 shrink-0 flex-col rounded-2xl border bg-muted/30 transition-colors",
              overCol === col.id && "border-primary bg-primary/5",
            )}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="font-display text-sm font-semibold">{col.label}</span>
              <span className="rounded-full bg-card px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {colLeads.length}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-3">
              {colLeads.map((l) => (
                <div
                  key={l.id}
                  draggable
                  onDragStart={() => setDragId(l.id)}
                  onDragEnd={() => setDragId(null)}
                  className={cn(
                    "group cursor-grab rounded-xl border bg-card p-3 shadow-card active:cursor-grabbing",
                    dragId === l.id && "opacity-50",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold">{l.lead_name ?? l.phone_number}</span>
                    <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{l.phone_number}</p>
                  {(l.course_interest || l.country_interest) && (
                    <p className="mt-2 text-xs text-foreground">
                      {[l.course_interest, l.country_interest].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {stageLabel(l.qualification_status)}
                  </p>
                </div>
              ))}
              {colLeads.length === 0 && (
                <p className="py-6 text-center text-xs text-muted-foreground">Drop leads here</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
