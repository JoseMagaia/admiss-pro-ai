import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import {
  CalendarDays,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  CreditCard,
  Users,
  Wallet,
  Clock3,
  TrendingUp,
  ClipboardCheck,
  Loader2,
  Pencil,
  Zap,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
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
import {
  listLeads,
  listWorkspaces,
  listMeetingOutcomes,
  saveMeetingOutcome,
  updateMeetingOutcome,
  deleteMeetingOutcome,
  processDueWorkflows,
  getMeetingOutcomeStats,
} from "@/lib/dashboard.functions";
import {
  MEETING_OUTCOMES,
  COMMITMENT_LEVELS,
  MAIN_OBSTACLES,
  NEXT_ACTIONS,
  outcomeLabel,
  labelFromList,
} from "@/lib/meeting-outcomes";

interface Lead {
  id: string;
  phone_number: string;
  lead_name: string | null;
}

interface Workspace {
  id: string;
  name?: string | null;
  is_default?: boolean | null;
}

interface OutcomeRow {
  id: string;
  lead_name: string | null;
  phone_number: string;
  meeting_date: string;
  outcome: string;
  commitment_level: string | null;
  main_obstacle: string | null;
  next_action: string | null;
  follow_up_date: string | null;
  workflow_triggered: string | null;
  recorded_by: string | null;
  created_at: string;
}

const EDIT_WINDOW_MS = 60_000;


const WIDGETS = [
  { key: "meetingsThisWeek", label: "Meetings This Week", icon: CalendarDays, color: "text-primary bg-primary/10" },
  { key: "readyToPay", label: "Ready to Pay", icon: CreditCard, color: "text-success bg-success/15" },
  { key: "parentDiscussion", label: "Parent Discussion", icon: Users, color: "text-accent-foreground bg-accent/20" },
  { key: "financialDelay", label: "Financial Delay", icon: Wallet, color: "text-primary bg-chart-4/15" },
  { key: "futureApplicants", label: "Future Applicants", icon: Clock3, color: "text-primary bg-chart-2/15" },
  { key: "conversionForecast", label: "Conversion Forecast", icon: TrendingUp, color: "text-success bg-success/15" },
] as const;

const EMPTY_FORM = {
  leadId: "",
  outcome: "",
  commitment: "",
  obstacle: "",
  nextAction: "",
  notes: "",
};

export function MeetingOutcomesTab() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const isSuperAdmin = profile.role === "super_admin";
  const leadsFn = useServerFn(listLeads);
  const workspacesFn = useServerFn(listWorkspaces);
  const outcomesFn = useServerFn(listMeetingOutcomes);
  const statsFn = useServerFn(getMeetingOutcomeStats);
  const saveFn = useServerFn(saveMeetingOutcome);
  const updateFn = useServerFn(updateMeetingOutcome);
  const deleteFn = useServerFn(deleteMeetingOutcome);
  const processFn = useServerFn(processDueWorkflows);

  // Tracks pending "fire the workflow when the countdown ends" timers so they are
  // cleared on unmount.
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  // Schedule the workflow processor to run just after the 1-minute edit window
  // ends, so the follow-up fires the moment the countdown reaches zero. The cron
  // job is the fallback if the page is closed before then.
  function scheduleWorkflowFire() {
    const t = setTimeout(() => {
      processFn()
        .catch(() => {})
        .finally(() => qc.invalidateQueries({ queryKey: ["messages"] }));
    }, EDIT_WINDOW_MS + 3000);
    timersRef.current.push(t);
  }

  const [pendingDelete, setPendingDelete] = useState<OutcomeRow | null>(null);


  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [workspaceId, setWorkspaceId] = useState<string>("");
  const [followUp, setFollowUp] = useState<Date | undefined>(undefined);
  const [meetingDate] = useState<Date>(new Date());
  const [leadOpen, setLeadOpen] = useState(false);

  // Re-render every second so the 1-minute edit window closes precisely.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Edit dialog state.
  const [editRow, setEditRow] = useState<OutcomeRow | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });
  const [editFollowUp, setEditFollowUp] = useState<Date | undefined>(undefined);

  const { data: leadsData } = useQuery({ queryKey: ["leads"], queryFn: () => leadsFn() });
  const { data: workspacesData } = useQuery({ queryKey: ["workspaces"], queryFn: () => workspacesFn() });
  const { data: outcomesData } = useQuery({
    queryKey: ["meeting-outcomes"],
    queryFn: () => outcomesFn(),
    refetchInterval: 10000,
  });
  const { data: stats } = useQuery({
    queryKey: ["meeting-outcome-stats"],
    queryFn: () => statsFn(),
    refetchInterval: 10000,
  });

  const leads = (leadsData?.leads ?? []) as Lead[];
  const workspaces = (workspacesData?.workspaces ?? []) as unknown as Workspace[];
  const outcomes = (outcomesData?.outcomes ?? []) as OutcomeRow[];
  const selectedLead = useMemo(() => leads.find((l) => l.id === form.leadId), [leads, form.leadId]);

  const save = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          lead_id: form.leadId,
          meeting_date: meetingDate.toISOString(),
          outcome: form.outcome as
            | "ready_to_pay"
            | "parent_discussion"
            | "financial_delay"
            | "future_applicant"
            | "not_qualified",
          commitment_level: (form.commitment || null) as "high" | "medium" | "low" | null,
          main_obstacle: form.obstacle || null,
          next_action: form.nextAction || null,
          follow_up_date: followUp ? format(followUp, "yyyy-MM-dd") : null,
          internal_notes: form.notes || null,
          workspace_id: workspaceId || null,
        },
      }),
    onSuccess: (res) => {
      const r = res as { ok: boolean; error?: string; workflowStatus?: string };
      if (!r.ok) {
        toast.error(r.error ?? "Failed to save outcome");
        return;
      }
      const wf =
        r.workflowStatus === "enrolled"
          ? "Follow-up scheduled — the first message sends when the 1-minute edit window ends."
          : r.workflowStatus === "already_enrolled"
            ? "Lead already in this workflow."
            : "No matching active workflow found — create it in Orchestration.";
      toast.success(`Outcome saved. ${wf}`);
      if (r.workflowStatus === "enrolled") scheduleWorkflowFire();
      setForm({ ...EMPTY_FORM });
      setFollowUp(undefined);
      qc.invalidateQueries({ queryKey: ["meeting-outcomes"] });
      qc.invalidateQueries({ queryKey: ["meeting-outcome-stats"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: () => toast.error("Failed to save outcome"),
  });

  const update = useMutation({
    mutationFn: () =>
      updateFn({
        data: {
          id: editRow!.id,
          outcome: editForm.outcome as
            | "ready_to_pay"
            | "parent_discussion"
            | "financial_delay"
            | "future_applicant"
            | "not_qualified",
          commitment_level: (editForm.commitment || null) as "high" | "medium" | "low" | null,
          main_obstacle: editForm.obstacle || null,
          next_action: editForm.nextAction || null,
          follow_up_date: editFollowUp ? format(editFollowUp, "yyyy-MM-dd") : null,
          internal_notes: editForm.notes || null,
        },
      }),
    onSuccess: (res) => {
      const r = res as { ok: boolean; error?: string };
      if (!r.ok) {
        toast.error(r.error ?? "Failed to update outcome");
        return;
      }
      toast.success("Outcome updated.");
      setEditRow(null);
      qc.invalidateQueries({ queryKey: ["meeting-outcomes"] });
      qc.invalidateQueries({ queryKey: ["meeting-outcome-stats"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: () => toast.error("Failed to update outcome"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: (res) => {
      const r = res as { ok: boolean; error?: string };
      if (!r.ok) {
        toast.error(r.error ?? "Failed to delete outcome");
        return;
      }
      toast.success("Meeting outcome deleted.");
      setPendingDelete(null);
      qc.invalidateQueries({ queryKey: ["meeting-outcomes"] });
      qc.invalidateQueries({ queryKey: ["meeting-outcome-stats"] });
    },
    onError: () => {
      toast.error("Failed to delete outcome");
      setPendingDelete(null);
    },
  });

  function openEdit(o: OutcomeRow) {
    setEditRow(o);
    setEditForm({
      leadId: o.id,
      outcome: o.outcome,
      commitment: o.commitment_level ?? "",
      obstacle: o.main_obstacle ?? "",
      nextAction: o.next_action ?? "",
      notes: "",
    });
    setEditFollowUp(o.follow_up_date ? new Date(o.follow_up_date) : undefined);
  }

  function editableFor(o: OutcomeRow): number {
    const remaining = EDIT_WINDOW_MS - (now - new Date(o.created_at).getTime());
    return remaining > 0 ? remaining : 0;
  }

  const canSave = form.leadId && form.outcome && !save.isPending;
  const mappedWorkflow = MEETING_OUTCOMES.find((o) => o.value === form.outcome)?.workflow;


  return (
    <div className="space-y-6">
      {/* Widget */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {WIDGETS.map((w) => (
          <div key={w.key} className="rounded-2xl border bg-card p-4 shadow-card">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${w.color}`}>
              <w.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 font-display text-2xl font-bold">
              {stats ? (stats as Record<string, number>)[w.key] ?? 0 : "—"}
            </p>
            <p className="text-xs text-muted-foreground">{w.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* Form */}
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Record Meeting Outcome</h2>
          </div>

          <div className="space-y-4">
            {/* Lead picker */}
            <div className="space-y-1.5">
              <Label>Lead</Label>
              <Popover open={leadOpen} onOpenChange={setLeadOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-normal"
                  >
                    {selectedLead
                      ? `${selectedLead.lead_name ?? "Unnamed"} · ${selectedLead.phone_number}`
                      : "Select a lead…"}
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command
                    filter={(value, search) => (value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0)}
                  >
                    <CommandInput placeholder="Search leads…" />
                    <CommandList>
                      <CommandEmpty>No leads found.</CommandEmpty>
                      <CommandGroup>
                        {leads.map((l) => (
                          <CommandItem
                            key={l.id}
                            value={`${l.lead_name ?? ""} ${l.phone_number}`}
                            onSelect={() => {
                              setForm((f) => ({ ...f, leadId: l.id }));
                              setLeadOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                form.leadId === l.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <span className="truncate">
                              {l.lead_name ?? "Unnamed"} · {l.phone_number}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Read-only lead info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Lead Name</Label>
                <Input value={selectedLead?.lead_name ?? ""} readOnly placeholder="—" className="bg-muted/40" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input value={selectedLead?.phone_number ?? ""} readOnly placeholder="—" className="bg-muted/40" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Meeting Date</Label>
              <Input value={format(meetingDate, "PPP p")} readOnly className="bg-muted/40" />
            </div>

            {/* Outcome (required) */}
            <div className="space-y-1.5">
              <Label>
                Outcome <span className="text-destructive">*</span>
              </Label>
              <Select value={form.outcome} onValueChange={(v) => setForm((f) => ({ ...f, outcome: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  {MEETING_OUTCOMES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mappedWorkflow && (
                <div className="flex items-start gap-1.5 rounded-lg bg-primary/5 px-2.5 py-2 text-xs text-primary">
                  <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Matched workflow template: <strong>{mappedWorkflow}</strong>. It activates
                    immediately for the selected lead on save.
                  </span>
                </div>
              )}
            </div>

            {/* Workspace (Chatwoot connection) to send through */}
            <div className="space-y-1.5">
              <Label>Send Through Workspace</Label>
              <Select value={workspaceId} onValueChange={setWorkspaceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Default workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name ?? "Unnamed"}
                      {w.is_default ? " (default)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The follow-up messages are sent through this Chatwoot connection.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Commitment Level</Label>
              <Select value={form.commitment} onValueChange={(v) => setForm((f) => ({ ...f, commitment: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {COMMITMENT_LEVELS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Main Obstacle</Label>
              <Select value={form.obstacle} onValueChange={(v) => setForm((f) => ({ ...f, obstacle: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select obstacle" />
                </SelectTrigger>
                <SelectContent>
                  {MAIN_OBSTACLES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Next Expected Action</Label>
              <Select value={form.nextAction} onValueChange={(v) => setForm((f) => ({ ...f, nextAction: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  {NEXT_ACTIONS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Follow-Up Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !followUp && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {followUp ? format(followUp, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={followUp}
                    onSelect={setFollowUp}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label>Internal Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Context, commitments, objections…"
                rows={4}
                maxLength={5000}
              />
            </div>

            <Button className="w-full" disabled={!canSave} onClick={() => save.mutate()}>
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Outcome
            </Button>
          </div>
        </div>

        {/* Recent outcomes */}
        <div className="rounded-2xl border bg-card shadow-card">
          <div className="border-b px-5 py-4">
            <h2 className="font-display text-lg font-semibold">Recent Meeting Outcomes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Lead</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Outcome</th>
                  <th className="px-4 py-3 font-semibold">Commitment</th>
                  <th className="px-4 py-3 font-semibold">Next Action</th>
                  <th className="px-4 py-3 font-semibold">Follow-Up</th>
                  <th className="px-4 py-3 font-semibold">Workflow</th>
                  <th className="px-4 py-3 text-right font-semibold">Edit</th>
                </tr>
              </thead>
              <tbody>
                {outcomes.map((o) => {
                  const remaining = editableFor(o);
                  const editable = remaining > 0;
                  return (
                    <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-medium">{o.lead_name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{o.phone_number}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {format(new Date(o.meeting_date), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {outcomeLabel(o.outcome)}
                        </span>
                      </td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">{o.commitment_level ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {labelFromList(NEXT_ACTIONS, o.next_action)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{o.follow_up_date ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{o.workflow_triggered ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        {editable ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 text-primary"
                            onClick={() => openEdit(o)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            {Math.ceil(remaining / 1000)}s
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Locked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {outcomes.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      No meeting outcomes recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit dialog (available within 1 minute of submission) */}
      <Dialog open={!!editRow} onOpenChange={(open) => !open && setEditRow(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Meeting Outcome</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/40 px-3 py-2 text-sm">
              <div className="font-medium">{editRow?.lead_name ?? "—"}</div>
              <div className="text-xs text-muted-foreground">{editRow?.phone_number}</div>
            </div>

            <div className="space-y-1.5">
              <Label>Outcome</Label>
              <Select
                value={editForm.outcome}
                onValueChange={(v) => setEditForm((f) => ({ ...f, outcome: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  {MEETING_OUTCOMES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Commitment Level</Label>
              <Select
                value={editForm.commitment}
                onValueChange={(v) => setEditForm((f) => ({ ...f, commitment: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {COMMITMENT_LEVELS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Main Obstacle</Label>
              <Select
                value={editForm.obstacle}
                onValueChange={(v) => setEditForm((f) => ({ ...f, obstacle: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select obstacle" />
                </SelectTrigger>
                <SelectContent>
                  {MAIN_OBSTACLES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Next Expected Action</Label>
              <Select
                value={editForm.nextAction}
                onValueChange={(v) => setEditForm((f) => ({ ...f, nextAction: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  {NEXT_ACTIONS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Follow-Up Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editFollowUp && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editFollowUp ? format(editFollowUp, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editFollowUp}
                    onSelect={setEditFollowUp}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label>Internal Notes</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Update context, commitments, objections…"
                rows={3}
                maxLength={5000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRow(null)}>
              Cancel
            </Button>
            <Button
              disabled={!editForm.outcome || update.isPending}
              onClick={() => update.mutate()}
            >
              {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
