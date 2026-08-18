import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Plus,
  Save,
  Trash2,
  Star,
  Plug,
  MessageCircle,
  Copy,
  Webhook,
  Loader2,
  PlugZap,
  ShieldCheck,
} from "lucide-react";
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
  setEvolutionWebhook,
  testWorkspaceConnection,
} from "@/lib/dashboard.functions";

type ProviderType = "chatwoot" | "evolution" | "waba";

interface Workspace {
  id?: string;
  name: string;
  provider_type: ProviderType;
  chatwoot_url: string | null;
  chatwoot_account_id: string | null;
  chatwoot_inbox_id: string | null;
  chatwoot_api_token: string | null;
  evolution_url: string | null;
  evolution_api_key: string | null;
  evolution_instance: string | null;
  waba_phone_number_id: string | null;
  waba_business_account_id: string | null;
  waba_access_token: string | null;
  waba_api_version: string | null;
  waba_verify_token: string | null;
  waba_app_secret: string | null;
  waba_display_name: string | null;
  enabled: boolean;
  is_default: boolean;
  use_shared_ai: boolean;
}

const EMPTY: Workspace = {
  name: "",
  provider_type: "chatwoot",
  chatwoot_url: "",
  chatwoot_account_id: "",
  chatwoot_inbox_id: "",
  chatwoot_api_token: "",
  evolution_url: "",
  evolution_api_key: "",
  evolution_instance: "",
  waba_phone_number_id: "",
  waba_business_account_id: "",
  waba_access_token: "",
  waba_api_version: "v21.0",
  waba_verify_token: "",
  waba_app_secret: "",
  waba_display_name: "",
  enabled: true,
  is_default: false,
  use_shared_ai: true,
};

function webhookUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

const WABA_VERSIONS = ["v24.0", "v23.0", "v22.0", "v21.0", "v20.0", "v19.0", "v18.0", "v17.0"];

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
  const webhookFn = useServerFn(setEvolutionWebhook);
  const testFn = useServerFn(testWorkspaceConnection);
  const [form, setForm] = useState<Workspace>(initial);
  useEffect(() => setForm(initial), [initial]);

  const set = (k: keyof Workspace, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: () => saveFn({ data: form as never }),
    onSuccess: (r) => {
      if ((r as { ok: boolean }).ok) {
        toast.success("Connection saved");
        qc.invalidateQueries({ queryKey: ["workspaces"] });
        onSaved();
      } else {
        toast.error((r as { error?: string }).error ?? "Failed to save");
      }
    },
    onError: () => toast.error("Failed to save"),
  });

  const test = useMutation({
    mutationFn: () =>
      testFn({
        data: {
          id: form.id,
          provider_type: form.provider_type,
          chatwoot_url: form.chatwoot_url,
          chatwoot_account_id: form.chatwoot_account_id,
          chatwoot_api_token: form.chatwoot_api_token,
          evolution_url: form.evolution_url,
          evolution_api_key: form.evolution_api_key,
          evolution_instance: form.evolution_instance,
          waba_phone_number_id: form.waba_phone_number_id,
          waba_business_account_id: form.waba_business_account_id,
          waba_access_token: form.waba_access_token,
          waba_api_version: form.waba_api_version,
        } as never,
      }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error?: string; detail?: string };
      if (res.ok) toast.success(res.detail ?? "Connection successful");
      else toast.error(res.error ?? "Connection failed");
    },
    onError: () => toast.error("Connection test failed"),
  });

  const setWebhook = useMutation({
    mutationFn: () =>
      webhookFn({
        data: {
          id: form.id,
          evolution_url: form.evolution_url ?? "",
          evolution_api_key: form.evolution_api_key ?? "",
          evolution_instance: form.evolution_instance ?? "",
          webhookUrl: webhookUrl("/api/public/evolution-webhook"),
        } as never,
      }),
    onSuccess: (r) => {
      if ((r as { ok: boolean }).ok) toast.success("Webhook set on Evolution instance");
      else toast.error((r as { error?: string }).error ?? "Failed to set webhook");
    },
    onError: () => toast.error("Failed to set webhook"),
  });

  const isEvolution = form.provider_type === "evolution";
  const isWaba = form.provider_type === "waba";

  return (
    <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Connection Name</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="UK Admissions Inbox" />
        </div>
        <div className="space-y-1.5">
          <Label>Connection Provider</Label>
          <select
            value={form.provider_type}
            onChange={(e) => set("provider_type", e.target.value as ProviderType)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="chatwoot">Chatwoot</option>
            <option value="evolution">Evolution API (WhatsApp)</option>
            <option value="waba">WABA — WhatsApp Business Platform (Meta)</option>
          </select>
        </div>
      </div>

      {!isEvolution && !isWaba && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
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
              <Input value={form.chatwoot_account_id ?? ""} onChange={(e) => set("chatwoot_account_id", e.target.value)} />
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
        </>
      )}

      {isEvolution && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Evolution API Base URL</Label>
              <Input
                value={form.evolution_url ?? ""}
                onChange={(e) => set("evolution_url", e.target.value)}
                placeholder="https://your-evolution-host.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Instance Name</Label>
              <Input
                value={form.evolution_instance ?? ""}
                onChange={(e) => set("evolution_instance", e.target.value)}
                placeholder="my-instance"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>API Key</Label>
            <Input
              type="password"
              value={form.evolution_api_key ?? ""}
              onChange={(e) => set("evolution_api_key", e.target.value)}
              placeholder="Leave unchanged to keep the saved key"
            />
          </div>

          <div className="space-y-2 rounded-lg border border-dashed bg-background/60 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Webhook className="h-4 w-4 text-primary" /> Inbound Webhook
            </div>
            <p className="text-xs text-muted-foreground">
              Set this URL as the webhook on your Evolution instance (with the <code>MESSAGES_UPSERT</code> event).
              Use the button to configure it automatically after saving.
            </p>
            <div className="flex items-center gap-2">
              <Input readOnly value={webhookUrl("/api/public/evolution-webhook")} className="text-xs" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard?.writeText(webhookUrl("/api/public/evolution-webhook"));
                  toast.success("Webhook URL copied");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={setWebhook.isPending || !form.evolution_url || !form.evolution_instance}
              onClick={() => setWebhook.mutate()}
            >
              <Webhook className="mr-1 h-4 w-4" /> Set webhook on Evolution
            </Button>
          </div>
        </>
      )}

      {isWaba && (
        <>
          <div className="flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            Official WhatsApp Business Platform (Cloud API). Create an app in Meta&apos;s developer dashboard, add the
            WhatsApp product, and copy the IDs below from the API Setup tab.
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Phone Number ID *</Label>
              <Input
                value={form.waba_phone_number_id ?? ""}
                onChange={(e) => set("waba_phone_number_id", e.target.value)}
                placeholder="e.g. 123456789012345"
              />
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp Business Account ID</Label>
              <Input
                value={form.waba_business_account_id ?? ""}
                onChange={(e) => set("waba_business_account_id", e.target.value)}
                placeholder="WABA ID (optional)"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Graph API Version</Label>
              <select
                value={form.waba_api_version ?? "v21.0"}
                onChange={(e) => set("waba_api_version", e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {WABA_VERSIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Display Name</Label>
              <Input
                value={form.waba_display_name ?? ""}
                onChange={(e) => set("waba_display_name", e.target.value)}
                placeholder="e.g. Linkmore Admissions"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Access Token (system user, permanent) *</Label>
              <Input
                type="password"
                value={form.waba_access_token ?? ""}
                onChange={(e) => set("waba_access_token", e.target.value)}
                placeholder="Leave unchanged to keep the saved token"
              />
              <p className="text-[11px] text-muted-foreground">
                Create a System User in Meta Business Manager with the{" "}
                <code>whatsapp_business_messaging</code> and <code>whatsapp_business_management</code> permissions and
                generate a permanent token.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Verify Token *</Label>
              <Input
                type="password"
                value={form.waba_verify_token ?? ""}
                onChange={(e) => set("waba_verify_token", e.target.value)}
                placeholder="Any secret string you choose"
              />
            </div>
            <div className="space-y-1.5">
              <Label>App Secret *</Label>
              <Input
                type="password"
                value={form.waba_app_secret ?? ""}
                onChange={(e) => set("waba_app_secret", e.target.value)}
                placeholder="Meta app secret (webhook signature)"
              />
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-dashed bg-background/60 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Webhook className="h-4 w-4 text-primary" /> Inbound Webhook (Meta)
            </div>
            <p className="text-xs text-muted-foreground">
              In Meta&apos;s app dashboard → WhatsApp → Configuration, set the webhook URL below and the Verify Token
              above. Subscribe to the <code>messages</code> field. Incoming messages are signed with your App Secret and
              verified automatically.
            </p>
            <div className="flex items-center gap-2">
              <Input readOnly value={webhookUrl("/api/public/waba-webhook")} className="text-xs" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard?.writeText(webhookUrl("/api/public/waba-webhook"));
                  toast.success("Webhook URL copied");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Callback URL: <code className="break-all">{webhookUrl("/api/public/waba-webhook")}</code>
            </p>
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={form.enabled} onCheckedChange={(v) => set("enabled", v)} /> Enabled
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={form.is_default} onCheckedChange={(v) => set("is_default", v)} /> Default connection
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={form.use_shared_ai} onCheckedChange={(v) => set("use_shared_ai", v)} /> Use shared AI
          settings
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name}>
          <Save className="mr-1 h-4 w-4" /> Save Connection
        </Button>
        <Button variant="outline" onClick={() => test.mutate()} disabled={test.isPending}>
          {test.isPending ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <PlugZap className="mr-1 h-4 w-4" />
          )}
          Test Connection
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

function providerBadge(p: ProviderType): { label: string; className: string } {
  switch (p) {
    case "evolution":
      return { label: "Evolution API", className: "bg-secondary text-secondary-foreground" };
    case "waba":
      return { label: "WABA · Meta", className: "bg-primary/10 text-primary" };
    default:
      return { label: "Chatwoot", className: "bg-secondary text-secondary-foreground" };
  }
}

export function ChatwootWorkspaces() {
  const qc = useQueryClient();
  const listFn = useServerFn(listWorkspaces);
  const delFn = useServerFn(deleteWorkspace);
  const { data } = useQuery({ queryKey: ["workspaces"], queryFn: () => listFn() });
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const workspaces = ((data?.workspaces ?? []) as unknown as Workspace[]).map((w) => ({
    ...w,
    provider_type: (w.provider_type as ProviderType) ?? "chatwoot",
  }));

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Connection deleted");
      qc.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: () => toast.error("Failed to delete"),
  });

  const icon = (p: ProviderType) =>
    p === "waba" ? <ShieldCheck className="h-4 w-4 text-primary" /> : p === "evolution" ? <MessageCircle className="h-4 w-4 text-primary" /> : <Plug className="h-4 w-4 text-primary" />;

  const subtitle = (w: Workspace) => {
    if (w.provider_type === "waba")
      return `${w.waba_display_name || "WhatsApp number"} · phone ${w.waba_phone_number_id || "—"} · ${w.waba_api_version || "v21.0"}`;
    if (w.provider_type === "evolution")
      return `${w.evolution_url || "no URL"} · instance ${w.evolution_instance || "—"}`;
    return `${w.chatwoot_url || "no URL"} · acct ${w.chatwoot_account_id || "—"} · inbox ${w.chatwoot_inbox_id || "—"}`;
  };

  return (
    <SettingsCard
      title="Connections"
      description="Connect the AI agent to multiple messaging inboxes. Each connection can use Chatwoot, Evolution API (WhatsApp) or the official WABA WhatsApp Business Platform (Meta Cloud API), and can reuse the shared AI settings or run independently. Incoming messages are routed by their inbox / account ID (Chatwoot), instance name (Evolution) or phone number ID (WABA)."
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
            <div key={w.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {icon(w.provider_type)}
                  <span className="font-semibold">{w.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${providerBadge(w.provider_type).className}`}>
                    {providerBadge(w.provider_type).label}
                  </span>
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
                  {subtitle(w)} · {w.use_shared_ai ? "shared AI" : "independent AI"}
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
                    if (confirm(`Delete connection "${w.name}"?`)) del.mutate(w.id!);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ),
        )}

        {workspaces.length === 0 && (
          <p className="text-sm text-muted-foreground">No connections yet. Add one to start routing inboxes.</p>
        )}

        {creating ? (
          <WorkspaceEditor initial={EMPTY} onSaved={() => setCreating(false)} onCancel={() => setCreating(false)} />
        ) : (
          <Button variant="outline" onClick={() => setCreating(true)}>
            <Plus className="mr-1 h-4 w-4" /> Add Connection
          </Button>
        )}
      </div>
    </SettingsCard>
  );
}
