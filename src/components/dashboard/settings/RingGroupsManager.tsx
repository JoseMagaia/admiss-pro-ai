import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, Loader2, Users, Save } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  listRingGroups,
  saveRingGroup,
  deleteRingGroup,
  listSpaceAgents,
  type RingGroupRow,
} from "@/lib/calls.functions";
import { SettingsCard } from "./SettingsForms";

type Agent = { user_id: string; full_name: string | null; email: string | null; role: string | null };

type Draft = {
  id?: string;
  name: string;
  ring_seconds: number;
  active: boolean;
  member_ids: string[];
};

const EMPTY: Draft = { name: "", ring_seconds: 20, active: true, member_ids: [] };

export function RingGroupsManager() {
  const qc = useQueryClient();
  const listFn = useServerFn(listRingGroups);
  const agentsFn = useServerFn(listSpaceAgents);
  const saveFn = useServerFn(saveRingGroup);
  const deleteFn = useServerFn(deleteRingGroup);

  const { data: groupsData } = useQuery({ queryKey: ["ring-groups"], queryFn: () => listFn() });
  const { data: agentsData } = useQuery({ queryKey: ["space-agents"], queryFn: () => agentsFn() });
  const groups = (groupsData?.groups ?? []) as RingGroupRow[];
  const agents = (agentsData?.agents ?? []) as Agent[];

  const [draft, setDraft] = useState<Draft | null>(null);

  const agentName = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of agents) m.set(a.user_id, a.full_name || a.email || a.user_id.slice(0, 8));
    return m;
  }, [agents]);

  const save = useMutation({
    mutationFn: (d: Draft) => saveFn({ data: d as never }),
    onSuccess: (res) => {
      const r = res as { ok: boolean; error?: string | null };
      if (r.ok) {
        qc.invalidateQueries({ queryKey: ["ring-groups"] });
        toast.success("Ring group saved");
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
      qc.invalidateQueries({ queryKey: ["ring-groups"] });
      qc.invalidateQueries({ queryKey: ["inbound-routes"] });
      toast.success("Ring group deleted");
    },
  });

  const toggleMember = (uid: string) =>
    setDraft((d) =>
      d
        ? {
            ...d,
            member_ids: d.member_ids.includes(uid)
              ? d.member_ids.filter((x) => x !== uid)
              : [...d.member_ids, uid],
          }
        : d,
    );

  return (
    <SettingsCard
      title="Ring groups"
      description="Groups of agents that ring together when an incoming call arrives. The first to answer takes the call."
    >
      {draft ? (
        <div className="space-y-4 rounded-lg border p-4">
          <div className="space-y-1.5">
            <Label>Group name</Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Admissions team"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Ring seconds</Label>
              <Input
                type="number"
                min={5}
                max={120}
                value={draft.ring_seconds}
                onChange={(e) => setDraft({ ...draft, ring_seconds: Number(e.target.value) || 20 })}
              />
            </div>
            <div className="flex items-end justify-between rounded-lg border p-3">
              <span className="text-sm font-medium">Active</span>
              <Switch checked={draft.active} onCheckedChange={(v) => setDraft({ ...draft, active: v })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Members</Label>
            {agents.length === 0 ? (
              <p className="text-xs text-muted-foreground">No agents found.</p>
            ) : (
              <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border p-2">
                {agents.map((a) => (
                  <label
                    key={a.user_id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
                  >
                    <Checkbox
                      checked={draft.member_ids.includes(a.user_id)}
                      onCheckedChange={() => toggleMember(a.user_id)}
                    />
                    <span className="text-sm">{a.full_name || a.email || a.user_id.slice(0, 8)}</span>
                    {a.role && <span className="text-xs text-muted-foreground">· {a.role}</span>}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => save.mutate(draft)} disabled={save.isPending || !draft.name.trim()} className="gap-2">
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save group
            </Button>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" className="gap-2" onClick={() => setDraft({ ...EMPTY })}>
          <Plus className="h-4 w-4" /> New ring group
        </Button>
      )}

      <div className="space-y-2">
        {groups.length === 0 && !draft && (
          <p className="text-sm text-muted-foreground">No ring groups yet.</p>
        )}
        {groups.map((g) => (
          <div key={g.id} className="flex items-center justify-between rounded-lg border p-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="truncate text-sm font-medium">{g.name}</p>
                {!g.active && <span className="text-xs text-muted-foreground">(inactive)</span>}
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {g.ring_seconds}s ·{" "}
                {g.member_ids.length
                  ? g.member_ids.map((id) => agentName.get(id) ?? id.slice(0, 8)).join(", ")
                  : "no members"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setDraft({
                    id: g.id,
                    name: g.name,
                    ring_seconds: g.ring_seconds,
                    active: g.active,
                    member_ids: g.member_ids,
                  })
                }
              >
                Edit
              </Button>
              <Button variant="ghost" size="icon" onClick={() => remove.mutate(g.id)} disabled={remove.isPending}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}
