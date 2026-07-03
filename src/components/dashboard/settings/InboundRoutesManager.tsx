import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, Loader2, PhoneIncoming, Save } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listInboundRoutes,
  saveInboundRoute,
  deleteInboundRoute,
  listRingGroups,
  type InboundRouteRow,
  type RingGroupRow,
} from "@/lib/calls.functions";
import { SettingsCard } from "./SettingsForms";

type Draft = {
  id?: string;
  did: string;
  ring_group_id: string | null;
  active: boolean;
};

const EMPTY: Draft = { did: "", ring_group_id: null, active: true };

export function InboundRoutesManager() {
  const qc = useQueryClient();
  const listFn = useServerFn(listInboundRoutes);
  const groupsFn = useServerFn(listRingGroups);
  const saveFn = useServerFn(saveInboundRoute);
  const deleteFn = useServerFn(deleteInboundRoute);

  const { data: routesData } = useQuery({ queryKey: ["inbound-routes"], queryFn: () => listFn() });
  const { data: groupsData } = useQuery({ queryKey: ["ring-groups"], queryFn: () => groupsFn() });
  const routes = (routesData?.routes ?? []) as InboundRouteRow[];
  const groups = (groupsData?.groups ?? []) as RingGroupRow[];

  const [draft, setDraft] = useState<Draft | null>(null);

  const groupName = (id: string | null) => groups.find((g) => g.id === id)?.name ?? "— unassigned —";

  const save = useMutation({
    mutationFn: (d: Draft) => saveFn({ data: d as never }),
    onSuccess: (res) => {
      const r = res as { ok: boolean; error?: string | null };
      if (r.ok) {
        qc.invalidateQueries({ queryKey: ["inbound-routes"] });
        toast.success("Inbound route saved");
        setDraft(null);
      } else {
        toast.error(r.error ?? "Failed to save");
      }
    },
    onError: () => toast.error("Failed to save"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inbound-routes"] });
      toast.success("Route deleted");
    },
  });

  return (
    <SettingsCard
      title="Inbound routes"
      description="Map each incoming phone number to a ring group. Point that Twilio number's Voice webhook at the inbound URL shown above."
    >
      {draft ? (
        <div className="space-y-4 rounded-lg border p-4">
          <div className="space-y-1.5">
            <Label>Incoming number (DID)</Label>
            <Input
              value={draft.did}
              onChange={(e) => setDraft({ ...draft, did: e.target.value })}
              placeholder="+15551234567"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Ring group</Label>
            <Select
              value={draft.ring_group_id ?? "none"}
              onValueChange={(v) => setDraft({ ...draft, ring_group_id: v === "none" ? null : v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— unassigned —</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm font-medium">Active</span>
            <Switch checked={draft.active} onCheckedChange={(v) => setDraft({ ...draft, active: v })} />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => save.mutate(draft)} disabled={save.isPending || !draft.did.trim()} className="gap-2">
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save route
            </Button>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" className="gap-2" onClick={() => setDraft({ ...EMPTY })}>
          <Plus className="h-4 w-4" /> New inbound route
        </Button>
      )}

      <div className="space-y-2">
        {routes.length === 0 && !draft && <p className="text-sm text-muted-foreground">No inbound routes yet.</p>}
        {routes.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <PhoneIncoming className="h-4 w-4 text-muted-foreground" />
                <p className="truncate text-sm font-medium">{r.did}</p>
                {!r.active && <span className="text-xs text-muted-foreground">(inactive)</span>}
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">→ {groupName(r.ring_group_id)}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDraft({ id: r.id, did: r.did, ring_group_id: r.ring_group_id, active: r.active })}
              >
                Edit
              </Button>
              <Button variant="ghost" size="icon" onClick={() => remove.mutate(r.id)} disabled={remove.isPending}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}
