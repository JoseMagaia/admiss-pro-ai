import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logCall, scheduleCallback } from "@/lib/calls.functions";

export interface CallTarget {
  phone_number: string;
  lead_id?: string | null;
  lead_name?: string | null;
  durationSec?: number;
  provider?: string | null;
  direction?: "inbound" | "outbound";
}

export const CALL_STATUSES = [
  { id: "completed", label: "Completed" },
  { id: "no_answer", label: "No answer" },
  { id: "voicemail", label: "Voicemail" },
  { id: "busy", label: "Busy" },
  { id: "failed", label: "Failed" },
  { id: "canceled", label: "Canceled" },
] as const;

// Default the callback picker to ~2 hours from now, formatted for datetime-local.
function defaultCallbackValue(): string {
  const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CallOutcomeDialog({
  open,
  onOpenChange,
  target,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  target: CallTarget | null;
  onSaved?: () => void;
}) {
  const qc = useQueryClient();
  const logFn = useServerFn(logCall);
  const scheduleFn = useServerFn(scheduleCallback);
  const [status, setStatus] = useState<string>("completed");
  const [notes, setNotes] = useState("");
  const [reschedule, setReschedule] = useState(false);
  const [when, setWhen] = useState(defaultCallbackValue());

  useEffect(() => {
    if (open) {
      setStatus("completed");
      setNotes("");
      setReschedule(false);
      setWhen(defaultCallbackValue());
    }
  }, [open]);

  // When there was no pickup, suggest rescheduling by default.
  useEffect(() => {
    if (status === "no_answer" || status === "busy") setReschedule(true);
  }, [status]);

  const save = useMutation({
    mutationFn: async () => {
      if (!target) return { ok: false as const };
      const res = (await logFn({
        data: {
          phone_number: target.phone_number,
          lead_id: target.lead_id ?? null,
          direction: "outbound",
          status: status as never,
          notes: notes || null,
          provider: target.provider ?? null,
          duration_seconds: Math.max(0, Math.round(target.durationSec ?? 0)),
          started_at: new Date(Date.now() - (target.durationSec ?? 0) * 1000).toISOString(),
          ended_at: new Date().toISOString(),
        },
      })) as { ok: boolean; id: string | null };
      if (res.ok && reschedule) {
        await scheduleFn({
          data: {
            phone_number: target.phone_number,
            lead_id: target.lead_id ?? null,
            scheduled_at: new Date(when).toISOString(),
            reason: status === "no_answer" ? "No answer" : status,
            from_call_id: res.id ?? null,
          },
        });
      }
      return res;
    },
    onSuccess: (res) => {
      if (res?.ok) {
        qc.invalidateQueries({ queryKey: ["calls"] });
        qc.invalidateQueries({ queryKey: ["callbacks"] });
        toast.success(reschedule ? "Call logged & callback scheduled" : "Call logged");
        onOpenChange(false);
        onSaved?.();
      } else {
        toast.error("Failed to log call");
      }
    },
    onError: () => toast.error("Failed to log call"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Call outcome</DialogTitle>
          <DialogDescription>
            {target?.lead_name ?? target?.phone_number}
            {target?.durationSec ? ` · ${Math.floor(target.durationSec / 60)}m ${target.durationSec % 60}s` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Outcome</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CALL_STATUSES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="What was discussed…" />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Schedule a callback</p>
              <p className="text-xs text-muted-foreground">Follow up later if there was no pickup.</p>
            </div>
            <Switch checked={reschedule} onCheckedChange={setReschedule} />
          </div>

          {reschedule && (
            <div className="space-y-1.5">
              <Label>Callback time</Label>
              <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={save.isPending}>
            Cancel
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
