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

// Read an image file and downscale it to a compact PNG/JPEG data URL so it can
// be stored inline in settings (no public bucket needed). Caps the longest edge.
async function fileToLogoDataUrl(file: File, maxEdge = 320): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
  // SVGs can't be drawn-and-rescaled reliably; keep as-is if already small.
  if (file.type === "image/svg+xml") return dataUrl;
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("decode failed"));
    i.src = dataUrl;
  });
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);
  // PNG keeps transparency (important for dark-mode logos).
  return canvas.toDataURL("image/png");
}

function LogoUpload({
  label,
  hint,
  value,
  onChange,
  dark,
}: {
  label: string;
  hint: string;
  value: string | null | undefined;
  onChange: (v: string) => void;
  dark?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-16 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border",
            dark ? "bg-sidebar" : "bg-muted/40",
          )}
        >
          {value ? (
            <img src={value} alt={label} className="max-h-14 max-w-[120px] object-contain" />
          ) : (
            <span className="text-[10px] text-muted-foreground">No logo</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="inline-flex w-fit cursor-pointer items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
            <Upload className="h-3.5 w-3.5" />
            {busy ? "Processing…" : "Upload"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setBusy(true);
                try {
                  const url = await fileToLogoDataUrl(file);
                  if (url.length > 2_900_000) {
                    toast.error("Image is too large after processing. Use a smaller file.");
                  } else {
                    onChange(url);
                  }
                } catch {
                  toast.error("Could not process that image.");
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          {value ? (
            <button type="button" className="w-fit text-xs text-destructive" onClick={() => onChange("")}>
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function CompanySettingsForm() {
  const { form, set, save } = useSettingsForm();
  return (
    <>
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

      <div className="mt-6">
        <SettingsCard
          title="Branding (White Label)"
          description="Customize how this workspace looks. Logos and the tagline apply to this space (and to each sub-account when set on its own settings)."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Brand Name"
              value={form.brand_name}
              onChange={(v) => set("brand_name", v)}
              placeholder="e.g. fliq"
            />
            <Field
              label="Tagline"
              value={form.brand_tagline}
              onChange={(v) => set("brand_tagline", v)}
              placeholder="Linkmoore Education · AI Admissions Platform"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <LogoUpload
              label="Logo — Light backgrounds"
              hint="Shown on white/light surfaces (login, header). PNG with transparency recommended."
              value={form.logo_light_url}
              onChange={(v) => set("logo_light_url", v)}
            />
            <LogoUpload
              label="Logo — Dark backgrounds"
              hint="Shown on the dark sidebar. Use a white/light version of your logo."
              value={form.logo_dark_url}
              onChange={(v) => set("logo_dark_url", v)}
              dark
            />
          </div>
          <Button onClick={() => save.mutate(form)} disabled={save.isPending}>
            <Save className="mr-1 h-4 w-4" /> Save Branding
          </Button>
        </SettingsCard>
      </div>
    </>
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
  const testFn = useServerFn(testWorkspaceConnection);
  const test = useMutation({
    mutationFn: () =>
      testFn({
        data: {
          provider_type: "chatwoot",
          chatwoot_url: form.chatwoot_url,
          chatwoot_account_id: form.chatwoot_account_id,
          chatwoot_api_token: form.chatwoot_api_token,
        } as never,
      }),
    onSuccess: (r) => {
      if ((r as { ok: boolean }).ok) toast.success("Connection successful");
      else toast.error((r as { error?: string }).error ?? "Connection failed");
    },
    onError: () => toast.error("Connection test failed"),
  });
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
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => save.mutate(form)} disabled={save.isPending}>
          <Save className="mr-1 h-4 w-4" /> Save
        </Button>
        <Button variant="outline" onClick={() => test.mutate()} disabled={test.isPending}>
          {test.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <PlugZap className="mr-1 h-4 w-4" />}
          Test Connection
        </Button>
      </div>
    </SettingsCard>
  );
}
