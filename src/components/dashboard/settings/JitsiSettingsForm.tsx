import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Save, Loader2, Video } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingsCard } from "./SettingsForms";
import { getJitsiSettings, saveJitsiSettings } from "@/lib/calendar.functions";

interface JitsiForm {
  id?: string;
  enabled: boolean;
  server_url: string;
  display_name: string;
  room_prefix: string;
}

export function JitsiSettingsForm() {
  const qc = useQueryClient();
  const getFn = useServerFn(getJitsiSettings);
  const saveFn = useServerFn(saveJitsiSettings);

  const { data } = useQuery({ queryKey: ["jitsi-settings"], queryFn: () => getFn() });

  const [form, setForm] = useState<JitsiForm>({
    enabled: true,
    server_url: "https://meet.jit.si",
    display_name: "Admissions",
    room_prefix: "admissions",
  });

  useEffect(() => {
    const s = (data?.settings ?? null) as JitsiForm | null;
    if (s) setForm(s);
  }, [data]);

  const set = <K extends keyof JitsiForm>(k: K, v: JitsiForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: () => saveFn({ data: { id: form.id, enabled: form.enabled, server_url: form.server_url, display_name: form.display_name, room_prefix: form.room_prefix } }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null };
      if (!res.ok) {
        toast.error(res.error ?? "Failed to save");
        return;
      }
      qc.invalidateQueries({ queryKey: ["jitsi-settings"] });
      toast.success("Video call settings saved");
    },
    onError: () => toast.error("Failed to save"),
  });

  return (
    <SettingsCard
      title="Video Calls (Jitsi)"
      description="Agents start and manage Jitsi video meetings directly from the Calls tab. Uses the free public Jitsi Meet server by default, or point it at your own self-hosted instance."
    >
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="flex items-start gap-3">
          <Video className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Enable video calls</p>
            <p className="text-xs text-muted-foreground">Show the video meeting panel in the Calls tab.</p>
          </div>
        </div>
        <Switch checked={form.enabled} onCheckedChange={(v) => set("enabled", Boolean(v))} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Jitsi server URL</Label>
          <Input
            value={form.server_url}
            onChange={(e) => set("server_url", e.target.value)}
            placeholder="https://meet.jit.si"
          />
          <p className="text-xs text-muted-foreground">Public Jitsi Meet or your self-hosted instance.</p>
        </div>
        <div className="space-y-1.5">
          <Label>Room name prefix</Label>
          <Input
            value={form.room_prefix}
            onChange={(e) => set("room_prefix", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            placeholder="admissions"
          />
          <p className="text-xs text-muted-foreground">Room names look like: {form.room_prefix || "admissions"}-meeting-8f3k.</p>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Agent display name</Label>
          <Input value={form.display_name} onChange={(e) => set("display_name", e.target.value)} placeholder="Admissions" />
          <p className="text-xs text-muted-foreground">Shown to the lead when they join the video meeting.</p>
        </div>
      </div>

      <Button onClick={() => save.mutate()} disabled={save.isPending} className="gap-2">
        {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save video settings
      </Button>
    </SettingsCard>
  );
}
