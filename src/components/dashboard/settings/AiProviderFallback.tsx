import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Save, Plug, Loader2, Trash2, ArrowUp, ArrowDown, Plus, Layers, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SettingsCard } from "./SettingsForms";
import {
  listAiProviders,
  saveAiProviderPool,
  deleteAiProvider,
  reorderAiProviders,
  setFallbackEnabled,
  testAiProviderPool,
} from "@/lib/dashboard.functions";

interface Preset {
  id: string;
  label: string;
  base_url: string;
  fixedBase: boolean;
}

const PRESETS: Preset[] = [
  { id: "openai", label: "OpenAI", base_url: "https://api.openai.com/v1", fixedBase: true },
  { id: "anthropic", label: "Anthropic", base_url: "https://api.anthropic.com", fixedBase: false },
  { id: "google", label: "Google Gemini", base_url: "https://generativelanguage.googleapis.com/v1beta/openai", fixedBase: true },
  { id: "groq", label: "Groq", base_url: "https://api.groq.com/openai/v1", fixedBase: true },
  { id: "deepseek", label: "DeepSeek", base_url: "https://api.deepseek.com/v1", fixedBase: true },
  { id: "mistral", label: "Mistral", base_url: "https://api.mistral.ai/v1", fixedBase: true },
  { id: "openrouter", label: "OpenRouter", base_url: "https://openrouter.ai/api/v1", fixedBase: true },
  { id: "together", label: "Together AI", base_url: "https://api.together.xyz/v1", fixedBase: true },
  { id: "custom", label: "Custom (OpenAI-compatible)", base_url: "", fixedBase: false },
];

interface Row {
  key: string;
  id?: string;
  label: string;
  provider: string;
  base_url: string;
  models: string; // comma-separated in the input
  enabled: boolean;
  has_key: boolean;
  apiKey: string; // new key entered this session
}

interface ServerRow {
  id: string;
  priority: number;
  label: string;
  provider: string;
  base_url: string;
  models: string[];
  enabled: boolean;
  has_key: boolean;
}

let keySeq = 0;
const nextKey = () => `row-${Date.now()}-${keySeq++}`;

function toRow(r: ServerRow): Row {
  return {
    key: nextKey(),
    id: r.id,
    label: r.label,
    provider: r.provider,
    base_url: r.base_url,
    models: (r.models ?? []).join(", "),
    enabled: r.enabled,
    has_key: r.has_key,
    apiKey: "",
  };
}

function parseModels(s: string): string[] {
  return s
    .split(/[\n,]/)
    .map((m) => m.trim())
    .filter(Boolean);
}

export function AiProviderFallback() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAiProviders);
  const saveFn = useServerFn(saveAiProviderPool);
  const delFn = useServerFn(deleteAiProvider);
  const reorderFn = useServerFn(reorderAiProviders);
  const toggleFn = useServerFn(setFallbackEnabled);
  const testFn = useServerFn(testAiProviderPool);

  const { data } = useQuery({ queryKey: ["ai-providers"], queryFn: () => listFn() });
  const [rows, setRows] = useState<Row[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [testingKey, setTestingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    const res = data as { providers: ServerRow[]; fallbackEnabled: boolean };
    setRows(res.providers.map(toRow));
    setEnabled(Boolean(res.fallbackEnabled));
  }, [data]);

  const patch = (key: string, fields: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...fields } : r)));

  const selectProvider = (key: string, id: string) => {
    const p = PRESETS.find((x) => x.id === id);
    patch(key, { provider: id, base_url: p && p.id !== "custom" ? p.base_url : "" });
  };

  const toggleEnabled = useMutation({
    mutationFn: (value: boolean) => toggleFn({ data: { enabled: value } }),
    onSuccess: (_r, value) => {
      setEnabled(value);
      qc.invalidateQueries({ queryKey: ["ai-providers"] });
      toast.success(value ? "Auto-rotation enabled" : "Auto-rotation disabled");
    },
    onError: () => toast.error("Failed to update setting"),
  });

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      {
        key: nextKey(),
        label: "",
        provider: "openai",
        base_url: PRESETS[0].base_url,
        models: "",
        enabled: true,
        has_key: false,
        apiKey: "",
      },
    ]);

  const saveRow = async (row: Row) => {
    const models = parseModels(row.models);
    if (!models.length) {
      toast.error("Add at least one model for rotation.");
      return;
    }
    if (!row.id && !row.apiKey.trim()) {
      toast.error("Enter an API key for this provider.");
      return;
    }
    setSavingKey(row.key);
    try {
      const r = (await saveFn({
        data: {
          id: row.id,
          label: row.label || undefined,
          provider: row.provider,
          base_url: row.base_url || null,
          models,
          api_key: row.apiKey || null,
          enabled: row.enabled,
        },
      })) as { ok: boolean; error: string | null };
      if (!r.ok) {
        toast.error(r.error ?? "Failed to save");
        return;
      }
      toast.success("Provider saved");
      qc.invalidateQueries({ queryKey: ["ai-providers"] });
    } catch {
      toast.error("Failed to save");
    } finally {
      setSavingKey(null);
    }
  };

  const removeRow = async (row: Row) => {
    if (!row.id) {
      setRows((prev) => prev.filter((r) => r.key !== row.key));
      return;
    }
    const r = (await delFn({ data: { id: row.id } })) as { ok: boolean; error: string | null };
    if (!r.ok) {
      toast.error(r.error ?? "Failed to remove");
      return;
    }
    qc.invalidateQueries({ queryKey: ["ai-providers"] });
    toast.success("Provider removed");
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    const savedIds = next.filter((r) => r.id).map((r) => r.id!) as string[];
    if (savedIds.length > 1) {
      await reorderFn({ data: { order: savedIds } });
      qc.invalidateQueries({ queryKey: ["ai-providers"] });
    }
  };

  const testRow = async (row: Row) => {
    const models = parseModels(row.models);
    if (!models.length) {
      toast.error("Add at least one model to test.");
      return;
    }
    setTestingKey(row.key);
    try {
      const r = (await testFn({
        data: {
          id: row.id,
          provider: row.provider,
          base_url: row.base_url || null,
          model: models[0],
          api_key: row.apiKey || null,
        },
      })) as { ok: boolean; error: string | null };
      if (r.ok) toast.success(`Connection successful (${models[0]})`);
      else toast.error(r.error ?? "Connection failed");
    } catch {
      toast.error("Connection failed");
    } finally {
      setTestingKey(null);
    }
  };

  return (
    <SettingsCard
      title="Provider Fallback & Auto-Rotation"
      description="Store multiple provider credentials in priority order. When a provider hits its rate limit, the assistant automatically rotates to the next provider's models. Built-in AI is always the final fallback."
    >
      <div className="flex items-start justify-between gap-4 rounded-xl border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Layers className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold">Enable auto-rotation</p>
            <p className="text-xs text-muted-foreground">
              Cycle through the providers below (top to bottom) on rate limits or failures.
            </p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={(v) => toggleEnabled.mutate(Boolean(v))} disabled={toggleEnabled.isPending} />
      </div>

      <div className="space-y-4">
        {rows.length === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No fallback providers yet. Add one to start building your rotation chain.
          </p>
        )}

        {rows.map((row, index) => {
          const preset = PRESETS.find((p) => p.id === row.provider) ?? PRESETS[PRESETS.length - 1];
          const baseDisabled = preset.id !== "custom" && preset.fixedBase;
          return (
            <div key={row.key} className="space-y-4 rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  Priority {index + 1}
                  {row.has_key && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                      <ShieldCheck className="h-3 w-3" /> Key stored
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(index, -1)} disabled={index === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => move(index, 1)}
                    disabled={index === rows.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeRow(row)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Label (optional)</Label>
                  <Input value={row.label} onChange={(e) => patch(row.key, { label: e.target.value })} placeholder="e.g. Groq free tier" />
                </div>
                <div className="space-y-1.5">
                  <Label>Provider</Label>
                  <select
                    value={row.provider}
                    onChange={(e) => selectProvider(row.key, e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Base URL</Label>
                <Input
                  value={row.base_url}
                  onChange={(e) => patch(row.key, { base_url: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                  disabled={baseDisabled}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Models for rotation (comma-separated, in order)</Label>
                <Input
                  value={row.models}
                  onChange={(e) => patch(row.key, { models: e.target.value })}
                  placeholder="llama-3.1-8b-instant, llama-3.3-70b-versatile"
                />
                <p className="text-xs text-muted-foreground">
                  List the free models to cycle through. Each is tried in order before moving to the next provider.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="space-y-1.5">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={row.apiKey}
                    onChange={(e) => patch(row.key, { apiKey: e.target.value })}
                    placeholder={row.has_key ? "•••••••••• (saved — leave blank to keep)" : "Paste your API key"}
                  />
                </div>
                <div className="flex items-center gap-2 pb-0.5">
                  <Label className="text-xs text-muted-foreground">Active</Label>
                  <Switch checked={row.enabled} onCheckedChange={(v) => patch(row.key, { enabled: Boolean(v) })} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={() => saveRow(row)} disabled={savingKey === row.key}>
                  {savingKey === row.key ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => testRow(row)} disabled={testingKey === row.key}>
                  {testingKey === row.key ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plug className="mr-1 h-4 w-4" />}
                  Test
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Button variant="outline" onClick={addRow}>
        <Plus className="mr-1 h-4 w-4" /> Add provider
      </Button>

      <div className="rounded-lg border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Built-in AI</span> is automatically used as the last fallback after every
        provider above is exhausted, so the assistant never goes offline.
      </div>
    </SettingsCard>
  );
}
