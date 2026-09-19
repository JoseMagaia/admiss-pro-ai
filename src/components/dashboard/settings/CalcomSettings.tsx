import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, Loader2, PlugZap, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getCalcomSettings, saveCalcomSettings, testCalcomConnection, listCalcomSlots } from "@/lib/calcom.functions";
import { listQueues } from "@/lib/tickets.functions";

/** Super-admin only: connect Cal.com so the AI can book and confirm meetings. */
export function CalcomSettings() {
  const qc = useQueryClient();
  const getFn = useServerFn(getCalcomSettings);
  const saveFn = useServerFn(saveCalcomSettings);
  const testFn = useServerFn(testCalcomConnection);
  const slotsFn = useServerFn(listCalcomSlots);
  const queuesFn = useServerFn(listQueues);

  const { data } = useQuery({ queryKey: ["calcom-settings"], queryFn: () => getFn() });
  const { data: queueData } = useQuery({ queryKey: ["ticket-queues"], queryFn: () => queuesFn() });
  const queues = (queueData?.queues ?? []) as Array<{ id: string; name: string }>;

  const [enabled, setEnabled] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [eventTypeId, setEventTypeId] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [queueId, setQueueId] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [slots, setSlots] = useState<Array<{ start: string; date: string; label: string }>>([]);

  const s = data?.settings ?? null;
  useEffect(() => {
    if (!s) return;
    setEnabled(s.enabled);
    setEventTypeId(s.event_type_id ?? "");
    setTimezone(s.timezone ?? "UTC");
    setQueueId(s.notify_queue_id ?? "");
  }, [s]);

  const save = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          enabled,
          api_key: apiKey || undefined,
          event_type_id: eventTypeId || null,
          timezone: timezone || "UTC",
          notify_queue_id: queueId || null,
        },
      }),
    onSuccess: (r) => {
      if (!r.ok) return toast.error(r.error ?? "Failed to save");
      setApiKey("");
      qc.invalidateQueries({ queryKey: ["calcom-settings"] });
      toast.success("Cal.com settings saved");
    },
    onError: () => toast.error("Failed to save"),
  });

  const test = useMutation({
    mutationFn: () => testFn({ data: { api_key: apiKey || undefined, event_type_id: eventTypeId, timezone } }),
    onSuccess: (r) => {
      setTestResult(r.message);
      r.ok ? toast.success("Cal.com reachable") : toast.error("Cal.com check failed");
    },
    onError: (e) => setTestResult((e as Error).message),
  });

  const preview = useMutation({
    mutationFn: () => slotsFn({ data: { days: 14 } }),
    onSuccess: (r) => {
      setSlots(r.slots ?? []);
      if (r.error) toast.error(r.error);
    },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Cal.com scheduling</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          When this is on, the assistant offers only times that are genuinely free on Cal.com, books the meeting itself
          and then hands the conversation to your team with a notification.
        </p>

        <div className="mt-5 flex items-center justify-between rounded-xl border p-4">
          <div>
            <p className="text-sm font-medium">Use Cal.com for meeting booking</p>
            <p className="text-xs text-muted-foreground">Off means the app keeps using its own in-app calendars.</p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="cal-key">API key</Label>
            <Input
              id="cal-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={s?.has_api_key ? "•••••••• (saved — type to replace)" : "cal_live_..."}
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cal-event">Event type ID</Label>
            <Input
              id="cal-event"
              value={eventTypeId}
              onChange={(e) => setEventTypeId(e.target.value)}
              placeholder="e.g. 1234567"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cal-tz">Time zone</Label>
            <Input id="cal-tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Europe/Lisbon" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cal-queue">Notify this team queue</Label>
            <select
              id="cal-queue"
              value={queueId}
              onChange={(e) => setQueueId(e.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Use the stage / default handoff queue</option>
              {queues.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            <Save className="mr-1 h-4 w-4" /> Save
          </Button>
          <Button variant="outline" onClick={() => test.mutate()} disabled={test.isPending}>
            {test.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <PlugZap className="mr-1 h-4 w-4" />}
            Test connection
          </Button>
          <Button variant="ghost" onClick={() => preview.mutate()} disabled={preview.isPending}>
            Preview open times
          </Button>
        </div>

        {testResult && <p className="mt-3 text-sm text-muted-foreground">{testResult}</p>}

        {slots.length > 0 && (
          <div className="mt-4 rounded-xl border p-4">
            <p className="text-sm font-medium">Next open times</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {slots.map((sl) => (
                <span key={sl.start} className="rounded-full bg-muted px-3 py-1 text-xs">
                  {sl.date} · {sl.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
