import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, Webhook } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { SettingsCard } from "./SettingsForms";
import { listHttpActions, upsertHttpAction, deleteHttpAction } from "@/lib/dashboard.functions";
import { QUALIFICATION_STAGES, stageLabel } from "@/lib/pipeline";

interface Action {
  id: string;
  name: string;
  trigger_stage: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  payload_template: string;
  enabled: boolean;
}

const EMPTY = {
  name: "",
  trigger_stage: "QUALIFIED",
  url: "",
  method: "POST" as const,
  headersText: "{}",
  payload_template: '{\n  "name": "{{lead_name}}",\n  "phone": "{{phone_number}}",\n  "course": "{{course_interest}}",\n  "country": "{{country_interest}}"\n}',
  enabled: true,
};

export function HttpActionsManager() {
  const qc = useQueryClient();
  const listFn = useServerFn(listHttpActions);
  const upsertFn = useServerFn(upsertHttpAction);
  const deleteFn = useServerFn(deleteHttpAction);

  const { data } = useQuery({ queryKey: ["http-actions"], queryFn: () => listFn() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const upsert = useMutation({
    mutationFn: (payload: Record<string, unknown>) => upsertFn({ data: payload as never }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["http-actions"] });
      toast.success("Action saved");
      setOpen(false);
      setForm(EMPTY);
    },
    onError: () => toast.error("Check the URL and headers JSON"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["http-actions"] });
      toast.success("Action deleted");
    },
  });

  const toggle = useMutation({
    mutationFn: (a: Action) =>
      upsertFn({
        data: {
          id: a.id,
          name: a.name,
          trigger_stage: a.trigger_stage,
          url: a.url,
          method: a.method as "POST",
          headers: a.headers,
          payload_template: a.payload_template,
          enabled: !a.enabled,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["http-actions"] }),
  });

  function submit() {
    let headers: Record<string, string> = {};
    try {
      headers = JSON.parse(form.headersText || "{}");
    } catch {
      toast.error("Headers must be valid JSON");
      return;
    }
    upsert.mutate({
      name: form.name,
      trigger_stage: form.trigger_stage,
      url: form.url,
      method: form.method,
      headers,
      payload_template: form.payload_template,
      enabled: form.enabled,
    });
  }

  const actions = (data?.actions ?? []) as Action[];

  return (
    <SettingsCard
      title="HTTP Actions"
      description="Fire outbound webhooks when a lead reaches a pipeline stage — CRM sync, Slack, Sheets, Make.com, n8n."
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-1 h-4 w-4" /> New Action
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>HTTP Action</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Trigger Stage</Label>
                <select
                  value={form.trigger_stage}
                  onChange={(e) => setForm((f) => ({ ...f, trigger_stage: e.target.value }))}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {QUALIFICATION_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {stageLabel(s)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Method</Label>
                <select
                  value={form.method}
                  onChange={(e) => setForm((f) => ({ ...f, method: e.target.value as "POST" }))}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {["POST", "GET", "PUT", "PATCH"].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>URL</Label>
              <Input
                placeholder="https://your-crm.com/api/leads"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Headers (JSON)</Label>
              <Textarea
                value={form.headersText}
                onChange={(e) => setForm((f) => ({ ...f, headersText: e.target.value }))}
                rows={2}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Payload Template</Label>
              <Textarea
                value={form.payload_template}
                onChange={(e) => setForm((f) => ({ ...f, payload_template: e.target.value }))}
                rows={6}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Use {"{{lead_name}}"}, {"{{phone_number}}"}, {"{{course_interest}}"}, {"{{country_interest}}"}.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.enabled} onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: v }))} />
              <Label>Enabled</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={submit} disabled={upsert.isPending || !form.name || !form.url}>
              Save Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        {actions.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-xl border p-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Webhook className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">{a.name}</p>
                <p className="text-xs text-muted-foreground">
                  {a.method} · {stageLabel(a.trigger_stage)} · {a.url}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={a.enabled} onCheckedChange={() => toggle.mutate(a)} />
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove.mutate(a.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {actions.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No HTTP actions configured.</p>
        )}
      </div>
    </SettingsCard>
  );
}
