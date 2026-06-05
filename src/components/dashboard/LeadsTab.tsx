import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, UserCog, Bot, Trash2, Pause, Play, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StageBadge } from "./StageBadge";
import {
  listLeads,
  toggleHumanTakeover,
  listConversations,
  deleteLead,
  listWorkflowStates,
  pauseLeadWorkflow,
} from "@/lib/dashboard.functions";
import { LEAD_FILTERS, columnForStage } from "@/lib/pipeline";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardNav } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

interface Lead {
  id: string;
  phone_number: string;
  lead_name: string | null;
  course_interest: string | null;
  country_interest: string | null;
  financial_alignment: string | null;
  parent_phone: string | null;
  document_received: boolean;
  qualification_status: string;
}

interface Conversation {
  phone_number: string;
  human_takeover: boolean;
}

export function LeadsTab() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const { openConversation } = useDashboardNav();
  const canDelete = profile.role === "super_admin" || profile.role === "admin";
  const canPause = profile.role === "super_admin" || profile.role === "admin";
  const leadsFn = useServerFn(listLeads);
  const convFn = useServerFn(listConversations);
  const takeoverFn = useServerFn(toggleHumanTakeover);
  const deleteFn = useServerFn(deleteLead);
  const statesFn = useServerFn(listWorkflowStates);
  const pauseFn = useServerFn(pauseLeadWorkflow);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Lead | null>(null);

  const { data } = useQuery({
    queryKey: ["leads"],
    queryFn: () => leadsFn(),
    refetchInterval: 5000,
  });
  const { data: convData } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => convFn(),
    refetchInterval: 5000,
  });
  const { data: statesData } = useQuery({
    queryKey: ["workflow-states"],
    queryFn: () => statesFn(),
    refetchInterval: 8000,
    enabled: canPause,
  });

  const takeoverMap = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const c of (convData?.conversations ?? []) as Conversation[]) m.set(c.phone_number, c.human_takeover);
    return m;
  }, [convData]);

  const workflowMap = useMemo(() => {
    const m = new Map<string, "active" | "paused">();
    for (const s of (statesData?.states ?? []) as Array<{ phone_number: string; status: "active" | "paused" }>) {
      m.set(s.phone_number, s.status);
    }
    return m;
  }, [statesData]);

  const takeover = useMutation({
    mutationFn: (vars: { phone: string; enabled: boolean }) => takeoverFn({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Conversation updated");
    },
    onError: () => toast.error("Failed to update"),
  });

  const pause = useMutation({
    mutationFn: (vars: { phone: string; paused: boolean }) => pauseFn({ data: vars }),
    onSuccess: (res, vars) => {
      if ((res as { ok: boolean }).ok) {
        qc.invalidateQueries({ queryKey: ["workflow-states"] });
        toast.success(vars.paused ? "Workflow paused for this lead" : "Workflow resumed");
      } else {
        toast.error((res as { error?: string }).error ?? "Failed to update workflow");
      }
    },
    onError: () => toast.error("Failed to update workflow"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: (res) => {
      if ((res as { ok: boolean }).ok) {
        qc.invalidateQueries({ queryKey: ["leads"] });
        qc.invalidateQueries({ queryKey: ["conversations"] });
        toast.success("Lead deleted — this number is now a fresh lead");
      } else {
        toast.error((res as { error?: string }).error ?? "Failed to delete");
      }
      setPendingDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete");
      setPendingDelete(null);
    },
  });

  const leads = (data?.leads ?? []) as Lead[];

  const filtered = leads.filter((l) => {
    const matchFilter = filter === "all" || columnForStage(l.qualification_status).id === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      l.lead_name?.toLowerCase().includes(q) ||
      l.phone_number.toLowerCase().includes(q) ||
      l.course_interest?.toLowerCase().includes(q) ||
      l.country_interest?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {LEAD_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filter === f.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Course</th>
              <th className="px-4 py-3 font-semibold">Country</th>
              <th className="px-4 py-3 font-semibold">Stage</th>
              <th className="px-4 py-3 font-semibold">Financial</th>
              <th className="px-4 py-3 font-semibold">Parent</th>
              <th className="px-4 py-3 font-semibold">Doc</th>
              <th className="px-4 py-3 font-semibold">Mode</th>
              {canPause && <th className="px-4 py-3 font-semibold">Workflow</th>}
              {canDelete && <th className="px-4 py-3 font-semibold text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => {
              const human = takeoverMap.get(l.phone_number) ?? false;
              return (
                <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">
                    <button
                      type="button"
                      onClick={() => openConversation(l.phone_number)}
                      className="group inline-flex items-center gap-1.5 text-left hover:text-primary"
                      title="Open conversation"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                      {l.lead_name ?? "—"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => openConversation(l.phone_number)}
                      className="hover:text-primary hover:underline"
                      title="Open conversation"
                    >
                      {l.phone_number}
                    </button>
                  </td>
                  <td className="px-4 py-3">{l.course_interest ?? "—"}</td>
                  <td className="px-4 py-3">{l.country_interest ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StageBadge stage={l.qualification_status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{l.financial_alignment ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.parent_phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    {l.document_received ? (
                      <span className="text-success">✓</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant={human ? "default" : "outline"}
                      className="h-7 gap-1 px-2 text-xs"
                      onClick={() => takeover.mutate({ phone: l.phone_number, enabled: !human })}
                    >
                      {human ? <UserCog className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                      {human ? "Human" : "AI"}
                    </Button>
                  </td>
                  {canPause && (
                    <td className="px-4 py-3">
                      {(() => {
                        const wf = workflowMap.get(l.phone_number);
                        if (!wf) return <span className="text-xs text-muted-foreground">—</span>;
                        const paused = wf === "paused";
                        return (
                          <Button
                            size="sm"
                            variant={paused ? "default" : "outline"}
                            className="h-7 gap-1 px-2 text-xs"
                            disabled={pause.isPending}
                            onClick={() => pause.mutate({ phone: l.phone_number, paused: !paused })}
                          >
                            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                            {paused ? "Resume" : "Pause"}
                          </Button>
                        );
                      })()}
                    </td>
                  )}
                  {canDelete && (
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setPendingDelete(l)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9 + (canPause ? 1 : 0) + (canDelete ? 1 : 0)} className="px-4 py-12 text-center text-muted-foreground">
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes {pendingDelete?.lead_name ?? pendingDelete?.phone_number} and all of their
              conversation history, messages and bookings. The phone number will be treated as a fresh lead the next
              time it messages. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={remove.isPending}
              onClick={() => pendingDelete && remove.mutate(pendingDelete.id)}
            >
              {remove.isPending ? "Deleting…" : "Delete lead"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
