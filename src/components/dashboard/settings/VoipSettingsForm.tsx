import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Save, Loader2, Phone, PhoneIncoming } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getVoipSettings, saveVoipSettings } from "@/lib/calls.functions";
import { SettingsCard } from "./SettingsForms";
import { RingGroupsManager } from "./RingGroupsManager";
import { InboundRoutesManager } from "./InboundRoutesManager";
import { useProjectUrl } from "@/lib/useProjectUrl";

type VoipForm = {
  id?: string;
  provider: "disabled" | "sip" | "twilio";
  enabled: boolean;
  inbound_enabled?: boolean;
  sip_ws_server?: string | null;
  sip_domain?: string | null;
  sip_uri?: string | null;
  sip_username?: string | null;
  sip_password?: string | null;
  sip_display_name?: string | null;
  twilio_account_sid?: string | null;
  twilio_api_key_sid?: string | null;
  twilio_api_key_secret?: string | null;
  twilio_twiml_app_sid?: string | null;
  twilio_caller_id?: string | null;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type,
  hint,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function VoipSettingsForm() {
  const qc = useQueryClient();
  const getFn = useServerFn(getVoipSettings);
  const saveFn = useServerFn(saveVoipSettings);
  const twimlUrl = useProjectUrl("/api/public/voip/twiml");
  const inboundUrl = useProjectUrl("/api/public/voip/inbound");
  const [form, setForm] = useState<VoipForm>({ provider: "disabled", enabled: false, inbound_enabled: false });

  const { data } = useQuery({ queryKey: ["voip-settings"], queryFn: () => getFn() });

  useEffect(() => {
    if (data?.settings) {
      // Never surface stored secrets back into the form — leave blank so an
      // empty value means "keep existing".
      const s = data.settings as VoipForm;
      setForm({ ...s, sip_password: "", twilio_api_key_secret: "" });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: (payload: VoipForm) => saveFn({ data: payload as never }),
    onSuccess: (res) => {
      const r = res as { ok: boolean; error?: string | null };
      if (r.ok) {
        qc.invalidateQueries({ queryKey: ["voip-settings"] });
        toast.success("Telephony settings saved");
      } else {
        toast.error(r.error ?? "Failed to save");
      }
    },
    onError: () => toast.error("Failed to save"),
  });

  const set = (k: keyof VoipForm, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      <SettingsCard
        title="Telephony"
        description="Configure how agents place calls from the Calls tab. Choose a self-hosted SIP/WebRTC server or Twilio Programmable Voice."
      >
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Enable calling</p>
            <p className="text-xs text-muted-foreground">Turn the softphone on for this Space.</p>
          </div>
          <Switch checked={form.enabled} onCheckedChange={(v) => set("enabled", v)} />
        </div>

        <div className="space-y-1.5">
          <Label>Provider</Label>
          <Select value={form.provider} onValueChange={(v) => set("provider", v as VoipForm["provider"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="disabled">Disabled</SelectItem>
              <SelectItem value="sip">SIP / WebRTC (self-hosted PBX)</SelectItem>
              <SelectItem value="twilio">Twilio Programmable Voice</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingsCard>

      {form.provider === "sip" && (
        <SettingsCard title="SIP / WebRTC" description="Connect to your Asterisk / FreePBX / Kamailio server over a secure WebSocket (WSS).">
          <Field
            label="WebSocket server (WSS)"
            value={form.sip_ws_server}
            onChange={(v) => set("sip_ws_server", v)}
            placeholder="wss://pbx.example.com:8089/ws"
          />
          <Field label="SIP URI (AOR)" value={form.sip_uri} onChange={(v) => set("sip_uri", v)} placeholder="sip:1001@pbx.example.com" />
          <Field label="SIP domain" value={form.sip_domain} onChange={(v) => set("sip_domain", v)} placeholder="pbx.example.com" />
          <Field label="Auth username" value={form.sip_username} onChange={(v) => set("sip_username", v)} placeholder="1001" />
          <Field
            label="Auth password"
            value={form.sip_password}
            onChange={(v) => set("sip_password", v)}
            placeholder="••••••• (leave blank to keep current)"
            type="password"
          />
          <Field label="Display name" value={form.sip_display_name} onChange={(v) => set("sip_display_name", v)} placeholder="Admissions" />
        </SettingsCard>
      )}

      {form.provider === "twilio" && (
        <SettingsCard title="Twilio Programmable Voice" description="Uses a Twilio TwiML App + API Key to place browser calls.">
          <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Phone className="h-3.5 w-3.5" /> TwiML App Voice URL
            </div>
            <p className="mt-1">Set your TwiML App's Voice Request URL (HTTP POST) to:</p>
            <code className="mt-1 block break-all rounded bg-background px-2 py-1">{twimlUrl}</code>
          </div>
          <Field label="Account SID" value={form.twilio_account_sid} onChange={(v) => set("twilio_account_sid", v)} placeholder="ACxxxxxxxx" />
          <Field label="API Key SID" value={form.twilio_api_key_sid} onChange={(v) => set("twilio_api_key_sid", v)} placeholder="SKxxxxxxxx" />
          <Field
            label="API Key Secret"
            value={form.twilio_api_key_secret}
            onChange={(v) => set("twilio_api_key_secret", v)}
            placeholder="••••••• (leave blank to keep current)"
            type="password"
          />
          <Field label="TwiML App SID" value={form.twilio_twiml_app_sid} onChange={(v) => set("twilio_twiml_app_sid", v)} placeholder="APxxxxxxxx" />
          <Field
            label="Caller ID (from number)"
            value={form.twilio_caller_id}
            onChange={(v) => set("twilio_caller_id", v)}
            placeholder="+15551234567"
            hint="A Twilio number verified for outbound calls."
          />
        </SettingsCard>
      )}

      <Button onClick={() => save.mutate(form)} disabled={save.isPending} className="gap-2">
        {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save telephony settings
      </Button>
    </div>
  );
}
