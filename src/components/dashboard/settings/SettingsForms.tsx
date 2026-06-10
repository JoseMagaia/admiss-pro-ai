import { useEffect, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Save, PlugZap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getSettings, updateSettings, testWorkspaceConnection } from "@/lib/dashboard.functions";

type Settings = Record<string, string | null> & { id?: string };

export function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function useSettingsForm() {
  const qc = useQueryClient();
  const getFn = useServerFn(getSettings);
  const saveFn = useServerFn(updateSettings);
  const [form, setForm] = useState<Settings>({});

  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => getFn() });

  useEffect(() => {
    if (data?.settings) setForm(data.settings as Settings);
  }, [data]);

  const save = useMutation({
    mutationFn: (payload: Settings) => saveFn({ data: payload as never }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved");
    },
    onError: () => toast.error("Failed to save"),
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return { form, set, save };
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  type,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {textarea ? (
        <Textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} />
      ) : (
        <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type} />
      )}
    </div>
  );
}

export function CompanySettingsForm() {
  const { form, set, save } = useSettingsForm();
  return (
    <SettingsCard title="Company Settings" description="Details used by the AI in conversations.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company Name" value={form.company_name} onChange={(v) => set("company_name", v)} />
        <Field label="Phone" value={form.company_phone} onChange={(v) => set("company_phone", v)} />
        <Field label="Email" value={form.company_email} onChange={(v) => set("company_email", v)} />
        <Field label="Working Hours" value={form.working_hours} onChange={(v) => set("working_hours", v)} />
      </div>
      <Field label="Office Address" value={form.office_address} onChange={(v) => set("office_address", v)} textarea />
      <Button onClick={() => save.mutate(form)} disabled={save.isPending}>
        <Save className="mr-1 h-4 w-4" /> Save
      </Button>
    </SettingsCard>
  );
}

export function ProgramSettingsForm() {
  const { form, set, save } = useSettingsForm();
  return (
    <SettingsCard title="Program Settings" description="Destinations, programs and scholarships you offer.">
      <Field
        label="Active Destinations"
        value={form.active_destinations}
        onChange={(v) => set("active_destinations", v)}
        placeholder="United Kingdom, Canada, Australia…"
        textarea
      />
      <Field
        label="Active Programs"
        value={form.active_programs}
        onChange={(v) => set("active_programs", v)}
        placeholder="Undergraduate, Postgraduate, MBA…"
        textarea
      />
      <Field
        label="Scholarship Information"
        value={form.scholarship_information}
        onChange={(v) => set("scholarship_information", v)}
        textarea
      />
      <Button onClick={() => save.mutate(form)} disabled={save.isPending}>
        <Save className="mr-1 h-4 w-4" /> Save
      </Button>
    </SettingsCard>
  );
}

export function ChatwootSettingsForm() {
  const { form, set, save } = useSettingsForm();
  return (
    <SettingsCard
      title="Chatwoot Integration"
      description="Connect your Chatwoot account so AI replies reach WhatsApp. Credentials are stored securely and never exposed to the browser after saving."
    >
      <Field label="Chatwoot URL" value={form.chatwoot_url} onChange={(v) => set("chatwoot_url", v)} placeholder="https://app.chatwoot.com" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Account ID" value={form.chatwoot_account_id} onChange={(v) => set("chatwoot_account_id", v)} />
        <Field label="Inbox ID" value={form.chatwoot_inbox_id} onChange={(v) => set("chatwoot_inbox_id", v)} />
      </div>
      <Field label="API Token" value={form.chatwoot_api_token} onChange={(v) => set("chatwoot_api_token", v)} type="password" />
      <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        Set your Chatwoot webhook to: <code className="font-mono">/api/public/chatwoot-webhook</code> on this app's domain.
      </div>
      <Button onClick={() => save.mutate(form)} disabled={save.isPending}>
        <Save className="mr-1 h-4 w-4" /> Save
      </Button>
    </SettingsCard>
  );
}
