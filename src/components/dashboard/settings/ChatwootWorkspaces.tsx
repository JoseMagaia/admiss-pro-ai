import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Save, Trash2, Star, Plug, MessageCircle, Copy, Webhook, Loader2, PlugZap } from "lucide-react";
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

type ProviderType = "chatwoot" | "evolution" | "whatsapp_cloud";

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
  wa_phone_number_id: string | null;
  wa_business_account_id: string | null;
  wa_access_token: string | null;
  wa_verify_token: string | null;
  wa_app_secret: string | null;
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
  wa_phone_number_id: "",
  wa_business_account_id: "",
  wa_access_token: "",
  wa_verify_token: "",
  wa_app_secret: "",
  enabled: true,
  is_default: false,
  use_shared_ai: true,
};

function evolutionWebhookUrl(): string {
  if (typeof window === "undefined") return "/api/public/evolution-webhook";
  return `${window.location.origin}/api/public/evolution-webhook`;
}

function whatsappCloudWebhookUrl(): string {
  if (typeof window === "undefined") return "/api/public/whatsapp-webhook";
  return `${window.location.origin}/api/public/whatsapp-webhook`;
}

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
        toast.success("Workspace saved");
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
          // WhatsApp Cloud credentials must be sent too, otherwise the server
          // always reports "Enter the WhatsApp Phone Number ID first".
          wa_phone_number_id: form.wa_phone_number_id,
          wa_access_token: form.wa_access_token,
        } as never,
      }),
    onSuccess: (r) => {
      if ((r as { ok: boolean }).ok) toast.success("Connection successful");
      else toast.error((r as { error?: string }).error ?? "Connection failed");
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
          webhookUrl: evolutionWebhookUrl(),
        } as never,
      }),
    onSuccess: (r) => {
      if ((r as { ok: boolean }).ok) toast.success("Webhook set on Evolution instance");
      else toast.error((r as { error?: string }).error ?? "Failed to set webhook");
    },
    onError: () => toast.error("Failed to set webhook"),
  });

  const isEvolution = form.provider_type === "evolution";
  const isWhatsAppCloud = form.provider_type === "whatsapp_cloud";
  const isChatwoot = form.provider_type === "chatwoot";

  return (
    <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Workspace Name</Label>
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
            <option value="whatsapp_cloud">WhatsApp Cloud API (Meta)</option>
          </select>
        </div>
      </div>

      {isChatwoot && (
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
              <Input readOnly value={evolutionWebhookUrl()} className="text-xs" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard?.writeText(evolutionWebhookUrl());
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

      {isWhatsAppCloud && (
        <>
          <WhatsAppEmbeddedSignup
            onConnected={(r) =>
              setForm((f) => ({
                ...f,
                provider_type: "whatsapp_cloud",
                wa_phone_number_id: r.phone_number_id || f.wa_phone_number_id,
                wa_business_account_id: r.waba_id || f.wa_business_account_id,
                wa_access_token: r.access_token,
                wa_verify_token:
                  f.wa_verify_token && f.wa_verify_token.length > 0
                    ? f.wa_verify_token
                    : crypto.randomUUID().replace(/-/g, ""),
                name: f.name || `WhatsApp ${r.phone_number_id || ""}`.trim(),
              }))
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Phone Number ID</Label>
              <Input
                value={form.wa_phone_number_id ?? ""}
                onChange={(e) => set("wa_phone_number_id", e.target.value)}
                placeholder="123456789012345"
              />
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp Business Account ID</Label>
              <Input
                value={form.wa_business_account_id ?? ""}
                onChange={(e) => set("wa_business_account_id", e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Permanent Access Token</Label>
            <Input
              type="password"
              value={form.wa_access_token ?? ""}
              onChange={(e) => set("wa_access_token", e.target.value)}
              placeholder="Leave unchanged to keep the saved token"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Webhook Verify Token</Label>
              <Input
                value={form.wa_verify_token ?? ""}
                onChange={(e) => set("wa_verify_token", e.target.value)}
                placeholder="Any strong random string"
              />
            </div>
            <div className="space-y-1.5">
              <Label>App Secret (optional, for signature verification)</Label>
              <Input
                type="password"
                value={form.wa_app_secret ?? ""}
                onChange={(e) => set("wa_app_secret", e.target.value)}
                placeholder="Leave unchanged to keep the saved secret"
              />
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-dashed bg-background/60 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Webhook className="h-4 w-4 text-primary" /> Meta Webhook Callback URL
            </div>
            <p className="text-xs text-muted-foreground">
              In Meta Business → WhatsApp → Configuration, set this Callback URL and paste the Verify Token above.
              Subscribe to the <code>messages</code> field.
            </p>
            <div className="flex items-center gap-2">
              <Input readOnly value={whatsappCloudWebhookUrl()} className="text-xs" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard?.writeText(whatsappCloudWebhookUrl());
                  toast.success("Webhook URL copied");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}



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
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name}>
          <Save className="mr-1 h-4 w-4" /> Save Workspace
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
      toast.success("Workspace deleted");
      qc.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: () => toast.error("Failed to delete"),
  });

  return (
    <SettingsCard
      title="Inbox Connections"
      description="Connect the AI agent to multiple inboxes simultaneously. Each workspace can use Chatwoot or Evolution API (WhatsApp), and can reuse the shared AI settings or run independently. Incoming messages are routed by their inbox / account ID (Chatwoot) or instance name (Evolution)."
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
                  {w.provider_type === "evolution" || w.provider_type === "whatsapp_cloud" ? (
                    <MessageCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <Plug className="h-4 w-4 text-primary" />
                  )}
                  <span className="font-semibold">{w.name}</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                    {w.provider_type === "evolution"
                      ? "Evolution API"
                      : w.provider_type === "whatsapp_cloud"
                        ? "WhatsApp Cloud"
                        : "Chatwoot"}
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
                  {w.provider_type === "evolution"
                    ? `${w.evolution_url || "no URL"} · instance ${w.evolution_instance || "—"}`
                    : w.provider_type === "whatsapp_cloud"
                      ? `Meta Cloud API · phone id ${w.wa_phone_number_id || "—"}`
                      : `${w.chatwoot_url || "no URL"} · acct ${w.chatwoot_account_id || "—"} · inbox ${
                          w.chatwoot_inbox_id || "—"
                        }`}{" "}
                  · {w.use_shared_ai ? "shared AI" : "independent AI"}
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
