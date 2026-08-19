import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Save, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getSettings, updateSettings } from "@/lib/dashboard.functions";
import { AUDIO_FORMATS, DEFAULT_AUDIO_FORMAT, type AudioDeliveryFormat } from "@/lib/audio/formats";
import { cn } from "@/lib/utils";

/** Super-admin control: exactly one audio format is active at a time. */
export function AudioDeliverySettings() {
  const qc = useQueryClient();
  const getFn = useServerFn(getSettings);
  const saveFn = useServerFn(updateSettings);
  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => getFn() });
  const settings = (data?.settings ?? null) as Record<string, unknown> | null;

  const [selected, setSelected] = useState<AudioDeliveryFormat>(DEFAULT_AUDIO_FORMAT);

  useEffect(() => {
    const current = settings?.audio_delivery_format;
    if (typeof current === "string" && AUDIO_FORMATS.some((f) => f.id === current)) {
      setSelected(current as AudioDeliveryFormat);
    }
  }, [settings]);

  const save = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          ...(settings?.id ? { id: settings.id as string } : {}),
          audio_delivery_format: selected,
        } as never,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Audio delivery updated");
    },
    onError: () => toast.error("Failed to save"),
  });

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card">
      <div className="flex items-center gap-2">
        <Volume2 className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-semibold">Audio delivery</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose how voice notes and audio files are recorded and delivered on WhatsApp. Only one format can be active —
        every chat, workflow and drip campaign follows it automatically.
      </p>

      <div className="mt-5 space-y-3">
        {AUDIO_FORMATS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setSelected(f.id)}
            className={cn(
              "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
              selected === f.id ? "border-primary bg-primary/5" : "hover:bg-muted/60",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                selected === f.id ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40",
              )}
            >
              {selected === f.id && <Check className="h-3 w-3" />}
            </span>
            <span>
              <span className="block text-sm font-medium">{f.label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{f.description}</span>
            </span>
          </button>
        ))}
      </div>

      <Button className="mt-5" onClick={() => save.mutate()} disabled={save.isPending}>
        <Save className="mr-1 h-4 w-4" /> Save
      </Button>
    </div>
  );
}
