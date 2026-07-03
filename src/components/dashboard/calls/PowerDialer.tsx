import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Phone, Play, Square, SkipForward, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listDialCampaigns, getDialQueue } from "@/lib/calls.functions";
import type { CallTarget } from "./CallOutcomeDialog";

interface Campaign {
  id: string;
  name: string;
  source_type: string;
  active: boolean;
}
interface QueueEntry {
  lead_id: string | null;
  phone_number: string;
  lead_name: string | null;
}

const SOURCE_LABELS: Record<string, string> = {
  stage: "Pipeline stage",
  filter: "Lead filter",
  manual: "Manual list",
  callbacks: "Due callbacks",
};

export function PowerDialer({
  onCall,
  busy,
  outcomeSavedAt,
}: {
  onCall: (t: CallTarget) => void;
  busy: boolean;
  outcomeSavedAt: number;
}) {
  const listFn = useServerFn(listDialCampaigns);
  const queueFn = useServerFn(getDialQueue);
  const [campaignId, setCampaignId] = useState<string>("");
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [autoDial, setAutoDial] = useState(true);
  const lastSavedRef = useRef(outcomeSavedAt);

  const { data } = useQuery({ queryKey: ["dial-campaigns"], queryFn: () => listFn() });
  const campaigns = (data?.campaigns ?? []) as Campaign[];

  const start = async () => {
    if (!campaignId) return;
    const res = (await queueFn({ data: { campaignId } })) as { queue: QueueEntry[]; error: string | null };
    if (res.error) {
      toast.error(res.error);
      return;
    }
    if (!res.queue.length) {
      toast.info("No contacts match this campaign right now.");
      return;
    }
    setQueue(res.queue);
    setIndex(0);
    setRunning(true);
    toast.success(`Loaded ${res.queue.length} contacts`);
  };

  const stop = () => {
    setRunning(false);
    setQueue([]);
    setIndex(0);
  };

  const callCurrent = () => {
    const entry = queue[index];
    if (!entry) return;
    onCall({ phone_number: entry.phone_number, lead_id: entry.lead_id, lead_name: entry.lead_name });
  };

  const next = () => {
    setIndex((i) => Math.min(i + 1, queue.length));
  };

  // Advance after an outcome is saved; auto-dial the next contact when enabled.
  useEffect(() => {
    if (outcomeSavedAt === lastSavedRef.current) return;
    lastSavedRef.current = outcomeSavedAt;
    if (!running) return;
    setIndex((i) => {
      const nextIndex = i + 1;
      if (autoDial && nextIndex < queue.length && !busy) {
        const entry = queue[nextIndex];
        // slight delay so the softphone fully resets between calls
        setTimeout(() => onCall({ phone_number: entry.phone_number, lead_id: entry.lead_id, lead_name: entry.lead_name }), 900);
      }
      return nextIndex;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcomeSavedAt]);

  const current = queue[index] ?? null;
  const done = running && index >= queue.length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label>Dial campaign</Label>
            <Select value={campaignId} onValueChange={setCampaignId} disabled={running}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a dial list…" />
              </SelectTrigger>
              <SelectContent>
                {campaigns.filter((c) => c.active).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} · {SOURCE_LABELS[c.source_type] ?? c.source_type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!running ? (
            <Button className="gap-2" onClick={start} disabled={!campaignId}>
              <Play className="h-4 w-4" /> Start session
            </Button>
          ) : (
            <Button variant="outline" className="gap-2" onClick={stop}>
              <Square className="h-4 w-4" /> End session
            </Button>
          )}
        </div>

        {campaigns.filter((c) => c.active).length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            No active dial campaigns yet. Create one in the Campaigns tab.
          </p>
        )}
      </div>

      {running && (
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-primary" />
              Contact {Math.min(index + 1, queue.length)} of {queue.length}
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="autodial" className="text-xs text-muted-foreground">
                Auto-dial next
              </Label>
              <Switch id="autodial" checked={autoDial} onCheckedChange={setAutoDial} />
            </div>
          </div>

          {done ? (
            <div className="py-10 text-center">
              <p className="font-display text-lg font-semibold">Session complete 🎉</p>
              <p className="mt-1 text-sm text-muted-foreground">You've called everyone in this list.</p>
            </div>
          ) : current ? (
            <div className="rounded-xl border p-5">
              <p className="font-display text-xl font-semibold">{current.lead_name ?? "Unknown contact"}</p>
              <p className="text-muted-foreground">{current.phone_number}</p>
              <div className="mt-4 flex items-center gap-2">
                <Button className="gap-2" disabled={busy} onClick={callCurrent}>
                  <Phone className="h-4 w-4" /> Call now
                </Button>
                <Button variant="outline" className="gap-2" disabled={busy} onClick={next}>
                  <SkipForward className="h-4 w-4" /> Skip
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
