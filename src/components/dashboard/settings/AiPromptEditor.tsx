import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Save, Maximize2, History, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SettingsCard } from "./SettingsForms";
import { getAiConfig, saveAiConfig, listPromptVersions } from "@/lib/dashboard.functions";

const MODELS = [
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "openai/gpt-5-mini",
  "openai/gpt-5",
];

interface Config {
  id?: string;
  system_prompt: string;
  model: string;
  temperature: number;
}

interface Version {
  id: string;
  version_number: number;
  system_prompt: string;
  created_at: string;
}

export function AiPromptEditor() {
  const qc = useQueryClient();
  const getFn = useServerFn(getAiConfig);
  const saveFn = useServerFn(saveAiConfig);
  const versionsFn = useServerFn(listPromptVersions);

  const [cfg, setCfg] = useState<Config>({ system_prompt: "", model: MODELS[0], temperature: 0.7 });
  const [fullscreen, setFullscreen] = useState(false);

  const { data } = useQuery({ queryKey: ["ai-config"], queryFn: () => getFn() });
  const { data: versionsData } = useQuery({ queryKey: ["prompt-versions"], queryFn: () => versionsFn() });

  useEffect(() => {
    if (data?.config) setCfg(data.config as Config);
  }, [data]);

  const save = useMutation({
    mutationFn: (payload: Config) => saveFn({ data: { ...payload, temperature: Number(payload.temperature) } }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["ai-config"] });
      qc.invalidateQueries({ queryKey: ["prompt-versions"] });
      toast.success(`Saved as version ${(r as { version: number }).version}`);
    },
    onError: () => toast.error("Failed to save"),
  });

  const versions = (versionsData?.versions ?? []) as Version[];

  const editor = (rows: number) => (
    <Textarea
      value={cfg.system_prompt}
      onChange={(e) => setCfg((c) => ({ ...c, system_prompt: e.target.value }))}
      rows={rows}
      className="font-mono text-sm leading-relaxed"
      placeholder="Write the AI system prompt. Use {{VARIABLE_NAME}} placeholders…"
    />
  );

  return (
    <SettingsCard
      title="AI Prompt Editor"
      description="Control the AI's behavior. Changes apply instantly — no redeploy needed."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Model</Label>
          <select
            value={cfg.model}
            onChange={(e) => setCfg((c) => ({ ...c, model: e.target.value }))}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Temperature ({cfg.temperature})</Label>
          <Input
            type="number"
            min={0}
            max={2}
            step={0.1}
            value={cfg.temperature}
            onChange={(e) => setCfg((c) => ({ ...c, temperature: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label>System Prompt</Label>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <History className="mr-1 h-4 w-4" /> History
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Prompt Version History</DialogTitle>
              </DialogHeader>
              <div className="max-h-[60vh] space-y-3 overflow-y-auto">
                {versions.map((v) => (
                  <div key={v.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Version {v.version_number}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(v.created_at).toLocaleString()}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7"
                          onClick={() => {
                            setCfg((c) => ({ ...c, system_prompt: v.system_prompt }));
                            toast.success(`Loaded version ${v.version_number} — Save to apply`);
                          }}
                        >
                          <RotateCcw className="mr-1 h-3.5 w-3.5" /> Restore
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-3 whitespace-pre-wrap font-mono text-xs text-muted-foreground">
                      {v.system_prompt}
                    </p>
                  </div>
                ))}
                {versions.length === 0 && <p className="text-sm text-muted-foreground">No versions yet.</p>}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={fullscreen} onOpenChange={setFullscreen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Maximize2 className="mr-1 h-4 w-4" /> Full screen
              </Button>
            </DialogTrigger>
            <DialogContent className="h-[85vh] max-w-5xl">
              <DialogHeader>
                <DialogTitle>System Prompt</DialogTitle>
              </DialogHeader>
              <div className="flex h-full flex-col gap-3 pb-2">
                {editor(24)}
                <Button onClick={() => save.mutate(cfg)} disabled={save.isPending} className="self-start">
                  <Save className="mr-1 h-4 w-4" /> Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {editor(14)}

      <Button onClick={() => save.mutate(cfg)} disabled={save.isPending}>
        <Save className="mr-1 h-4 w-4" /> Save Prompt
      </Button>
    </SettingsCard>
  );
}
