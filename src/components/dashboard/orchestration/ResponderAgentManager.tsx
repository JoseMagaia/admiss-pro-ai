import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Save, Trash2, Bot, Cpu, KeyRound, GitBranch } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  listResponderAgents,
  upsertResponderAgent,
  deleteResponderAgent,
  listWorkspaces,
  listResponderAgentVariables,
  upsertResponderAgentVariable,
  deleteResponderAgentVariable,
} from "@/lib/dashboard.functions";

const BUILT_IN_MODELS = [
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "openai/gpt-5-mini",
  "openai/gpt-5",
];

const CUSTOM_PRESETS = [
  { id: "openai", label: "OpenAI", base_url: "https://api.openai.com/v1", models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1-mini"] },
  { id: "anthropic", label: "Anthropic", base_url: "https://api.anthropic.com", models: ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest"] },
  { id: "google", label: "Google Gemini", base_url: "https://generativelanguage.googleapis.com/v1beta/openai", models: ["gemini-2.5-flash", "gemini-2.5-pro"] },
  { id: "groq", label: "Groq", base_url: "https://api.groq.com/openai/v1", models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"] },
  { id: "deepseek", label: "DeepSeek", base_url: "https://api.deepseek.com/v1", models: ["deepseek-chat", "deepseek-reasoner"] },
  { id: "openrouter", label: "OpenRouter", base_url: "https://openrouter.ai/api/v1", models: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet"] },
  { id: "custom", label: "Custom (OpenAI-compatible)", base_url: "", models: [] },
];

export interface Agent {
  id?: string;
  name: string;
  description: string | null;
  workspace_id: string | null;
  system_prompt: string;
  model: string;
  temperature: number;
  provider_mode: "inherit" | "built_in" | "custom";
  custom_provider: string | null;
  custom_base_url: string | null;
  custom_model: string | null;
  custom_api_key: string | null;
  inherit_variables: boolean;
  enabled: boolean;
}

const EMPTY_AGENT: Agent = {
  name: "",
  description: "",
  workspace_id: null,
  system_prompt: "",
  model: BUILT_IN_MODELS[0],
  temperature: 0.7,
  provider_mode: "inherit",
  custom_provider: "openai",
  custom_base_url: "",
  custom_model: "",
  custom_api_key: "",
  inherit_variables: true,
  enabled: true,
};

interface Workspace {
  id: string;
  name: string;
}

interface AgentVariable {
  id: string;
  agent_id: string;
  variable_name: string;
  variable_value: string;
  description: string | null;
}

function ProviderButton({
  active,
  onClick,
  icon: Icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Cpu;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-2 rounded-xl border p-3 text-left transition-colors",
        active ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50",
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{subtitle}</span>
      </span>
    </button>
  );
}

function AgentVariables({ agentId }: { agentId: string }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listResponderAgentVariables);
  const upFn = useServerFn(upsertResponderAgentVariable);
  const delFn = useServerFn(deleteResponderAgentVariable);
  const { data } = useQuery({
    queryKey: ["agent-vars", agentId],
    queryFn: () => listFn({ data: { agentId } }),
  });
  const variables = (data?.variables ?? []) as AgentVariable[];
  const [draft, setDraft] = useState({ variable_name: "", variable_value: "" });

  const up = useMutation({
    mutationFn: (v: { variable_name: string; variable_value: string }) =>
      upFn({ data: { agent_id: agentId, ...v } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-vars", agentId] });
      setDraft({ variable_name: "", variable_value: "" });
    },
    onError: () => toast.error("Use UPPER_CASE names (letters, numbers, _)"),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agent-vars", agentId] }),
  });

  return (
    <div className="space-y-2 rounded-xl border bg-muted/10 p-3">
      <p className="text-xs text-muted-foreground">
        Override or add variables for this agent. Reference them as <code>{"{{NAME}}"}</code> in the prompt.
      </p>
      {variables.map((v) => (
        <div key={v.id} className="flex items-center gap-2 text-sm">
          <span className="w-40 shrink-0 truncate font-mono text-xs font-semibold">{v.variable_name}</span>
          <span className="flex-1 truncate text-muted-foreground">{v.variable_value}</span>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => del.mutate(v.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="VARIABLE_NAME"
          value={draft.variable_name}
          onChange={(e) => setDraft((d) => ({ ...d, variable_name: e.target.value.toUpperCase() }))}
          className="h-8 font-mono text-xs sm:w-44"
        />
        <Input
          placeholder="Value"
          value={draft.variable_value}
          onChange={(e) => setDraft((d) => ({ ...d, variable_value: e.target.value }))}
          className="h-8 text-xs"
        />
        <Button
          size="sm"
          className="h-8"
          disabled={!draft.variable_name || !draft.variable_value}
          onClick={() => up.mutate(draft)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function AgentEditor({ initial, onDone }: { initial: Agent; onDone: () => void }) {
  const qc = useQueryClient();
  const saveFn = useServerFn(upsertResponderAgent);
  const wsFn = useServerFn(listWorkspaces);
  const { data: wsData } = useQuery({ queryKey: ["workspaces"], queryFn: () => wsFn() });
  const workspaces = (wsData?.workspaces ?? []) as unknown as Workspace[];

  const [form, setForm] = useState<Agent>(initial);
  useEffect(() => setForm(initial), [initial]);
  const set = <K extends keyof Agent>(k: K, v: Agent[K]) => setForm((f) => ({ ...f, [k]: v }));

  const preset = CUSTOM_PRESETS.find((p) => p.id === form.custom_provider) ?? CUSTOM_PRESETS[0];

  const save = useMutation({
    mutationFn: () => saveFn({ data: { ...form, custom_api_key: form.custom_api_key || "" } as never }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error?: string; id?: string };
      if (!res.ok) {
        toast.error(res.error ?? "Failed to save");
        return;
      }
      toast.success("Agent saved");
      qc.invalidateQueries({ queryKey: ["responder-agents"] });
      if (!form.id && res.id) set("id", res.id);
      else onDone();
    },
    onError: () => toast.error("Failed to save"),
  });

  return (
    <div className="space-y-4 rounded-2xl border bg-card p-4 shadow-card">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Agent Name</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Follow-up Closer" />
        </div>
        <div className="space-y-1.5">
          <Label>Chatwoot Workspace</Label>
          <select
            value={form.workspace_id ?? ""}
            onChange={(e) => set("workspace_id", e.target.value || null)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Use lead&apos;s inbox / default</option>
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <Input
          value={form.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
          placeholder="What this responder agent does"
        />
      </div>

      {/* Provider mode */}
      <div className="space-y-2">
        <Label>AI Provider</Label>
        <div className="grid gap-3 sm:grid-cols-3">
          <ProviderButton
            active={form.provider_mode === "inherit"}
            onClick={() => set("provider_mode", "inherit")}
            icon={GitBranch}
            title="Inherit"
            subtitle="Use qualification agent's provider & model"
          />
          <ProviderButton
            active={form.provider_mode === "built_in"}
            onClick={() => set("provider_mode", "built_in")}
            icon={Cpu}
            title="Built-in AI"
            subtitle="Lovable AI. No key required."
          />
          <ProviderButton
            active={form.provider_mode === "custom"}
            onClick={() => set("provider_mode", "custom")}
            icon={KeyRound}
            title="Own API Key"
            subtitle="Your provider, model & key."
          />
        </div>
      </div>

      {form.provider_mode === "built_in" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Model</Label>
            <select
              value={form.model}
              onChange={(e) => set("model", e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {[...new Set([...BUILT_IN_MODELS, form.model].filter(Boolean))].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Temperature ({form.temperature})</Label>
            <Input
              type="number"
              min={0}
              max={2}
              step={0.1}
              value={form.temperature}
              onChange={(e) => set("temperature", Number(e.target.value))}
            />
          </div>
        </div>
      )}

      {form.provider_mode === "custom" && (
        <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Provider</Label>
              <select
                value={form.custom_provider ?? "openai"}
                onChange={(e) => {
                  const p = CUSTOM_PRESETS.find((x) => x.id === e.target.value);
                  set("custom_provider", e.target.value);
                  if (p && p.id !== "custom") {
                    set("custom_base_url", p.base_url);
                    if (!p.models.includes(form.custom_model ?? "")) set("custom_model", p.models[0] ?? "");
                  }
                }}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {CUSTOM_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Model</Label>
              {preset.models.length > 0 ? (
                <select
                  value={form.custom_model ?? ""}
                  onChange={(e) => set("custom_model", e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {[...new Set([...preset.models, form.custom_model].filter(Boolean))].map((m) => (
                    <option key={m as string} value={m as string}>
                      {m}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  value={form.custom_model ?? ""}
                  onChange={(e) => set("custom_model", e.target.value)}
                  placeholder="model-name"
                />
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Base URL</Label>
            <Input
              value={form.custom_base_url ?? ""}
              onChange={(e) => set("custom_base_url", e.target.value)}
              placeholder="https://api.openai.com/v1"
              disabled={form.custom_provider !== "custom" && form.custom_provider !== "anthropic"}
            />
          </div>
          <div className="space-y-1.5">
            <Label>API Key</Label>
            <Input
              type="password"
              value={form.custom_api_key ?? ""}
              onChange={(e) => set("custom_api_key", e.target.value)}
              placeholder={initial.custom_api_key === "********" ? "•••••• (saved — leave blank to keep)" : "Paste your API key"}
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>System Prompt</Label>
        <Textarea
          value={form.system_prompt}
          onChange={(e) => set("system_prompt", e.target.value)}
          rows={8}
          className="font-mono text-sm"
          placeholder="Define how this responder agent talks to leads who react…"
        />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={form.inherit_variables} onCheckedChange={(v) => set("inherit_variables", v)} />
          Inherit AI variables from qualification agent
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={form.enabled} onCheckedChange={(v) => set("enabled", v)} /> Enabled
        </label>
      </div>

      {form.id ? (
        <div className="space-y-1.5">
          <Label>Agent Variable Overrides</Label>
          <AgentVariables agentId={form.id} />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Save the agent to add variable overrides.</p>
      )}

      <div className="flex gap-2">
        <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name}>
          <Save className="mr-1 h-4 w-4" /> Save Agent
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Close
        </Button>
      </div>
    </div>
  );
}

export function ResponderAgentManager() {
  const qc = useQueryClient();
  const listFn = useServerFn(listResponderAgents);
  const delFn = useServerFn(deleteResponderAgent);
  const { data } = useQuery({ queryKey: ["responder-agents"], queryFn: () => listFn() });
  const agents = (data?.agents ?? []) as Agent[];
  const [editing, setEditing] = useState<Agent | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Agent deleted");
      qc.invalidateQueries({ queryKey: ["responder-agents"] });
    },
    onError: () => toast.error("Failed to delete"),
  });

  if (editing) {
    return <AgentEditor initial={editing} onDone={() => setEditing(null)} />;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Responder agents reply to leads who react to a workflow&apos;s outbound messages. Each agent has its own prompt,
        variables, model and provider — just like the qualification agent.
      </p>
      {agents.map((a) => (
        <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <span className="font-semibold">{a.name}</span>
              {!a.enabled && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  Disabled
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {a.provider_mode === "inherit" ? "Inherits provider" : a.provider_mode === "built_in" ? `Built-in · ${a.model}` : `Custom · ${a.custom_model || a.custom_provider}`}
              {a.description ? ` · ${a.description}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="outline" size="sm" onClick={() => setEditing(a)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (confirm(`Delete agent "${a.name}"?`)) del.mutate(a.id!);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
      {agents.length === 0 && <p className="text-sm text-muted-foreground">No responder agents yet.</p>}
      <Button variant="outline" onClick={() => setEditing(EMPTY_AGENT)}>
        <Plus className="mr-1 h-4 w-4" /> New Responder Agent
      </Button>
    </div>
  );
}
