import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Save, Trash2, Star, Plug } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingsCard } from "./SettingsForms";
import {
  listWorkspaces,
  upsertWorkspace,
  deleteWorkspace,
} from "@/lib/dashboard.functions";

interface Workspace {
  id?: string;
  name: string;
  chatwoot_url: string | null;
  chatwoot_account_id: string | null;
  chatwoot_inbox_id: string | null;
  chatwoot_api_token: string | null;
  enabled: boolean;
  is_default: boolean;
  use_shared_ai: boolean;
}

const EMPTY: Workspace = {
  name: "",
  chatwoot_url: "",
  chatwoot_account_id: "",
  chatwoot_inbox_id: "",
  chatwoot_api_token: "",
  enabled: true,
  is_default: false,
  use_shared_ai: true,
};

function WorkspaceEditor({
  initial,
  onSaved,
  onCancel,
}: {
  initial: Workspace;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const qc = useQueryClient();
  const saveFn = useServerFn(upsertWorkspace);
  const [form, setForm] = useState<Workspace>(initial);
  useEffect(() => setForm(initial), [initial]);

  const set = (k: keyof Workspace, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: () => saveFn({ data: form as never }),
    onSuccess: (r) => {
      if ((r as { ok: boolean }).ok) {
        toast.success("Workspace saved");
        qc.invalidateQueries({ queryKey: ["workspaces"] });
        onSaved();
      } else {
        toast.error((r as { error?: string }).error ?? "Failed to save");
      }
    },
    onError: () => toast.error("Failed to save"),
  });

  return (
    <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Workspace Name</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="UK Admissions Inbox" />
        </div>
        <div className="space-y-1.5">
          <Label>Chatwoot Base URL</Label>
          <Input
            value={form.chatwoot_url ?? ""}
            onChange={(e) => set("chatwoot_url", e.target.value)}
            placeholder="https://app.chatwoot.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Account ID</Label>
          <Input
            value={form.chatwoot_account_id ?? ""}
            onChange={(e) => set("chatwoot_account_id", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Inbox ID</Label>
          <Input value={form.chatwoot_inbox_id ?? ""} onChange={(e) => set("chatwoot_inbox_id", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>API Token</Label>
        <Input
          type="password"
          value={form.chatwoot_api_token ?? ""}
          onChange={(e) => set("chatwoot_api_token", e.target.value)}
          placeholder="Leave unchanged to keep the saved token"
        />
      </div>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={form.enabled} onCheckedChange={(v) => set("enabled", v)} /> Enabled
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={form.is_default} onCheckedChange={(v) => set("is_default", v)} /> Default workspace
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={form.use_shared_ai} onCheckedChange={(v) => set("use_shared_ai", v)} /> Use shared AI
          settings
        </label>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name}>
          <Save className="mr-1 h-4 w-4" /> Save Workspace
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

export function ChatwootWorkspaces() {
  const qc = useQueryClient();
  const listFn = useServerFn(listWorkspaces);
  const delFn = useServerFn(deleteWorkspace);
  const { data } = useQuery({ queryKey: ["workspaces"], queryFn: () => listFn() });
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const workspaces = (data?.workspaces ?? []) as Workspace[];

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Workspace deleted");
      qc.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: () => toast.error("Failed to delete"),
  });

  return (
    <SettingsCard
      title="Chatwoot Workspaces"
      description="Point the AI agent at multiple Chatwoot inboxes simultaneously. Each workspace can reuse the shared AI settings or run independently. Incoming messages are routed by their inbox / account ID."
    >
      <div className="space-y-3">
        {workspaces.map((w) =>
          editingId === w.id ? (
            <WorkspaceEditor
              key={w.id}
              initial={w}
              onSaved={() => setEditingId(null)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={w.id}
              className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Plug className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{w.name}</span>
                  {w.is_default && (
                    <span className="flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                      <Star className="h-3 w-3" /> Default
                    </span>
                  )}
                  {!w.enabled && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      Disabled
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {w.chatwoot_url || "no URL"} · acct {w.chatwoot_account_id || "—"} · inbox{" "}
                  {w.chatwoot_inbox_id || "—"} · {w.use_shared_ai ? "shared AI" : "independent AI"}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="outline" size="sm" onClick={() => setEditingId(w.id!)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm(`Delete workspace "${w.name}"?`)) del.mutate(w.id!);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ),
        )}

        {workspaces.length === 0 && (
          <p className="text-sm text-muted-foreground">No workspaces yet. Add one to start routing inboxes.</p>
        )}

        {creating ? (
          <WorkspaceEditor initial={EMPTY} onSaved={() => setCreating(false)} onCancel={() => setCreating(false)} />
        ) : (
          <Button variant="outline" onClick={() => setCreating(true)}>
            <Plus className="mr-1 h-4 w-4" /> Add Workspace
          </Button>
        )}
      </div>
    </SettingsCard>
  );
}
