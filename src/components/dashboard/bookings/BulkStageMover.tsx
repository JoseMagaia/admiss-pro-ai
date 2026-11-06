import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { bulkMoveLeadsByBookingStatus } from "@/lib/dashboard.functions";
import { APPOINTMENT_STATUSES, QUALIFICATION_STAGES, STAGE_LABELS } from "@/lib/pipeline";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useAuth } from "@/hooks/useAuth";
import { canCleanLeads } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DEFAULT_RULES: Record<string, string> = {
  pending: "skip",
  confirmed: "SPECIALIST_CONSULTATION",
  completed: "skip",
  cancelled: "DISQUALIFIED",
};

export function BulkStageMover() {
  const qc = useQueryClient();
  const fn = useServerFn(bulkMoveLeadsByBookingStatus);
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [rules, setRules] = usePersistentState<Record<string, string>>("bookings.cleanRules", DEFAULT_RULES);

  const active = APPOINTMENT_STATUSES.map((s) => ({ status: s, stage: rules[s] ?? "skip" })).filter((r) => r.stage !== "skip");

  const run = useMutation({
    mutationFn: () => fn({ data: { rules: active } }),
    onSuccess: (r) => {
      if (!r.ok) return toast.error(r.error ?? "Could not move leads");
      const already = r.alreadyInStage ?? 0;
      toast.success(
        `${r.moved} lead${r.moved === 1 ? "" : "s"} moved` + (already ? ` · ${already} already in the target stage` : ""),
      );
      qc.invalidateQueries();
      setOpen(false);
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (!canCleanLeads(profile.role, profile.permissions)) return null;

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Sparkles className="mr-1 h-4 w-4" /> Clean up leads
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move leads by booking status</DialogTitle>
            <DialogDescription>Every lead with a booking in that status is moved to the chosen pipeline stage in one go.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {APPOINTMENT_STATUSES.map((s) => (
              <div key={s} className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium capitalize">{s}</span>
                <span className="text-xs text-muted-foreground">→</span>
                <Select value={rules[s] ?? "skip"} onValueChange={(v) => setRules({ ...rules, [s]: v })}>
                  <SelectTrigger className="h-8 flex-1 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">Don't move</SelectItem>
                    {QUALIFICATION_STAGES.map((st) => <SelectItem key={st} value={st}>{STAGE_LABELS[st] ?? st}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={active.length === 0 || run.isPending} onClick={() => run.mutate()}>
              {run.isPending ? "Moving…" : "Move leads now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
