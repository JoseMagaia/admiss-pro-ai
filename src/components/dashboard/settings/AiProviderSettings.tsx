import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Save, Cpu, KeyRound, Plug, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SettingsCard } from "./SettingsForms";
import { getAiConfig, saveAiProvider, testAiProvider } from "@/lib/dashboard.functions";

interface Preset {
  id: string;
  label: string;
  base_url: string;
  models: string[];
}

const PRESETS: Preset[] = [
  { id: "openai", label: "OpenAI", base_url: "https://api.openai.com/v1", models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini"] },
  { id: "anthropic", label: "Anthropic", base_url: "https://api.anthropic.com", models: ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest", "claude-3-opus-latest"] },
  { id: "google", label: "Google Gemini", base_url: "https://generativelanguage.googleapis.com/v1beta/openai", models: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"] },
  { id: "groq", label: "Groq", base_url: "https://api.groq.com/openai/v1", models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"] },
  { id: "deepseek", label: "DeepSeek", base_url: "https://api.deepseek.com/v1", models: ["deepseek-chat", "deepseek-reasoner"] },
  { id: "mistral", label: "Mistral", base_url: "https://api.mistral.ai/v1", models: ["mistral-large-latest", "mistral-small-latest"] },
  { id: "openrouter", label: "OpenRouter", base_url: "https://openrouter.ai/api/v1", models: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "meta-llama/llama-3.3-70b-instruct"] },
  { id: "custom", label: "Custom (OpenAI-compatible)", base_url: "", models: [] },
];

interface ConfigRow {
  id?: string;
  provider_mode?: string | null;
  custom_provider?: string | null;
  custom_base_url?: string | null;
  custom_model?: string | null;
  custom_api_key?: string | null;
}

export function AiProviderSettings() {
  const qc = useQueryClient();
  const getFn = useServerFn(getAiConfig);
  const saveFn = useServerFn(saveAiProvider);
  const testFn = useServerFn(testAiProvider);

  const { data } = useQuery({ queryKey: ["ai-config"], queryFn: () => getFn() });
  const cfg = (data?.config ?? null) as ConfigRow | null;

  const [mode, setMode] = useState<"built_in" | "custom">("built_in");
  const [provider, setProvider] = useState("openai");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [hasSavedKey, setHasSavedKey] = useState(false);

  useEffect(() => {
    if (!cfg) return;
    setMode((cfg.provider_mode as "built_in" | "custom") ?? "built_in");
    setProvider(cfg.custom_provider ?? "openai");
    setBaseUrl(cfg.custom_base_url ?? "");
    setModel(cfg.custom_model ?? "");
    setHasSavedKey(Boolean(cfg.custom_api_key));
  }, [cfg]);

  const preset = PRESETS.find((p) => p.id === provider) ?? PRESETS[0];

  const selectProvider = (id: string) => {
    setProvider(id);
    const p = PRESETS.find((x) => x.id === id);
    if (p && p.id !== "custom") {
      setBaseUrl(p.base_url);
      if (!p.models.includes(model)) setModel(p.models[0] ?? "");
    }
  };

  const save = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          id: cfg?.id,
          provider_mode: mode,
          custom_provider: provider,
          custom_base_url: baseUrl || null,
          custom_model: model || null,
          custom_api_key: apiKey || "", // empty → server keeps existing key
        },
      }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null };
      if (!res.ok) {
        toast.error(res.error ?? "Failed to save");
        return;
      }
      setApiKey("");
      setHasSavedKey((prev) => prev || apiKey.length > 0);
      qc.invalidateQueries({ queryKey: ["ai-config"] });
      toast.success("AI provider settings saved");
    },
    onError: () => toast.error("Failed to save"),
  });

  const test = useMutation({
    mutationFn: () =>
      testFn({
        data: {
          provider_mode: mode,
          custom_provider: provider,
          custom_base_url: baseUrl || null,
          custom_model: model || null,
          custom_api_key: apiKey || "", // empty → server uses the saved key
        },
      }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null };
      if (res.ok) toast.success("Connection successful");
      else toast.error(res.error ?? "Connection failed");
    },
    onError: () => toast.error("Connection failed"),
  });

  return (
    <SettingsCard
      title="AI Provider"
      description="Choose between Lovable's built-in AI or your own provider and API key. Applies instantly to the assistant."
    >
      {/* Mode toggle */}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("built_in")}
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
            mode === "built_in" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50",
          )}
        >
          <Cpu className="mt-0.5 h-5 w-5 text-primary" />
          <span>
            <span className="block text-sm font-semibold">Built-in AI</span>
            <span className="block text-xs text-muted-foreground">Powered by Lovable AI. No API key required.</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMode("custom")}
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
            mode === "custom" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50",
          )}
        >
          <KeyRound className="mt-0.5 h-5 w-5 text-primary" />
          <span>
            <span className="block text-sm font-semibold">Own API Key</span>
            <span className="block text-xs text-muted-foreground">Use your own provider, model and key.</span>
          </span>
        </button>
      </div>

      {mode === "custom" && (
        <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
          <div className="space-y-1.5">
            <Label>Provider</Label>
            <select
              value={provider}
              onChange={(e) => selectProvider(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Base URL</Label>
              <Input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                disabled={provider !== "custom" && provider !== "anthropic"}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Model</Label>
              {preset.models.length > 0 ? (
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {[...new Set([...preset.models, model].filter(Boolean))].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              ) : (
                <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="model-name" />
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>API Key</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={hasSavedKey ? "•••••••••• (saved — leave blank to keep)" : "Paste your API key"}
            />
            <p className="text-xs text-muted-foreground">
              Stored securely on the server and never exposed to the browser after saving.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          <Save className="mr-1 h-4 w-4" /> Save Provider Settings
        </Button>
        {mode === "custom" && (
          <Button variant="outline" onClick={() => test.mutate()} disabled={test.isPending}>
            {test.isPending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Plug className="mr-1 h-4 w-4" />
            )}
            Test connection
          </Button>
        )}
      </div>
    </SettingsCard>
  );
}
