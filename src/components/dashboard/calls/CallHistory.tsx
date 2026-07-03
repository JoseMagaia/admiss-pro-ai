import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { Phone, PhoneOutgoing, PhoneIncoming, FileText, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listCalls, updateCallNotes } from "@/lib/calls.functions";
import { CALL_STATUSES, type CallTarget } from "./CallOutcomeDialog";

interface CallRow {
  id: string;
  phone_number: string;
  direction: string;
  status: string;
  disposition: string | null;
  notes: string | null;
  duration_seconds: number;
  lead_id: string | null;
  created_at: string;
}

const STATUS_LABELS = Object.fromEntries(CALL_STATUSES.map((s) => [s.id, s.label]));
const STATUS_STYLES: Record<string, string> = {
  completed: "bg-success/10 text-success",
  no_answer: "bg-destructive/10 text-destructive",
  busy: "bg-amber-500/10 text-amber-600",
  voicemail: "bg-primary/10 text-primary",
  failed: "bg-destructive/10 text-destructive",
  canceled: "bg-muted text-muted-foreground",
};

function fmtDuration(s: number) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m ? `${m}m ${sec}s` : `${sec}s`;
}

export function CallHistory({ onCall, busy }: { onCall: (t: CallTarget) => void; busy: boolean }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listCalls);
  const notesFn = useServerFn(updateCallNotes);
  const [editing, setEditing] = useState<CallRow | null>(null);
  const [noteText, setNoteText] = useState("");

  const { data } = useQuery({ queryKey: ["calls"], queryFn: () => listFn(), refetchInterval: 15000 });
  const calls = useMemo(() => (data?.calls ?? []) as CallRow[], [data]);

  const saveNotes = useMutation({
    mutationFn: () => notesFn({ data: { id: editing!.id, notes: noteText || null } }),
    onSuccess: (res) => {
      if ((res as { ok: boolean }).ok) {
        qc.invalidateQueries({ queryKey: ["calls"] });
        toast.success("Notes updated");
        setEditing(null);
      } else {
        toast.error("Failed to update notes");
      }
    },
    onError: () => toast.error("Failed to update notes"),
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Dir</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Duration</th>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3 font-semibold">Notes</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((c) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{c.phone_number}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.direction === "inbound" ? (
                    <PhoneIncoming className="h-4 w-4 text-primary" />
                  ) : (
                    <PhoneOutgoing className="h-4 w-4 text-muted-foreground" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[c.status] ?? "bg-muted"}`}>
                    {STATUS_LABELS[c.status] ?? c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{fmtDuration(c.duration_seconds)}</td>
                <td className="px-4 py-3 text-muted-foreground">{format(new Date(c.created_at), "MMM d, HH:mm")}</td>
                <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">{c.notes ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 px-2 text-xs"
                      onClick={() => {
                        setEditing(c);
                        setNoteText(c.notes ?? "");
                      }}
                    >
                      <FileText className="h-3.5 w-3.5" /> Notes
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 px-2 text-xs text-primary"
                      disabled={busy}
                      onClick={() => onCall({ phone_number: c.phone_number, lead_id: c.lead_id })}
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Call back
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {calls.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  <Phone className="mx-auto mb-2 h-6 w-6 opacity-40" />
                  No calls yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call notes — {editing?.phone_number}</DialogTitle>
          </DialogHeader>
          <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={5} placeholder="Add notes about this call…" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saveNotes.isPending}>
              Cancel
            </Button>
            <Button onClick={() => saveNotes.mutate()} disabled={saveNotes.isPending}>
              {saveNotes.isPending ? "Saving…" : "Save notes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
