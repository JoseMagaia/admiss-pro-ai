import { useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Plus,
  Trash2,
  Send,
  Play,
  Pause,
  X,
  Upload,
  Users,
  ArrowLeft,
  Loader2,
  Paperclip,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  listCampaigns,
  createCampaign,
  updateCampaign,
  setCampaignStatus,
  deleteCampaign,
  getCampaignOptions,
  listCampaignRecipients,
  addRecipientsFromLeads,
  addRecipientsFromCsv,
  clearPendingRecipients,
  type CampaignRow,
  type CampaignMedia,
  type CampaignButton,
} from "@/lib/campaigns.functions";
import { listWorkflows, uploadMessageAttachment } from "@/lib/dashboard.functions";

const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "sms", label: "SMS" },
  { id: "email", label: "Email" },
  { id: "other", label: "Other" },
] as const;

// 0 = Sunday … 6 = Saturday (matches JS Date.getDay()).
const WEEKDAYS: { value: number; label: string }[] = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-warning/15 text-warning",
  running: "bg-success/15 text-success",
  paused: "bg-warning/15 text-warning",
  completed: "bg-primary/15 text-primary",
  cancelled: "bg-destructive/15 text-destructive",
};

// Minimal RFC-4180-ish CSV parser (handles quoted fields and commas/newlines).
function parseCsv(text: string): Array<Record<string, string>> {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    if (row.some((c) => c.trim() !== "")) rows.push(row);
    row = [];
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") pushField();
    else if (ch === "\n") pushRow();
    else if (ch === "\r") {
      /* ignore */
    } else field += ch;
  }
  if (field !== "" || row.length > 0) pushRow();
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] ?? "").trim();
    });
    return obj;
  });
}

type Options = {
  workspaces: Array<{ id: string; name: string; provider_type: string }>;
  offers: Array<{ id: string; name: string }>;
  stages: Array<{ id: string; label: string; stage_keys: string[]; pipeline_name: string }>;
};

export function CampaignManager() {
  const qc = useQueryClient();
  const listFn = useServerFn(listCampaigns);
  const delFn = useServerFn(deleteCampaign);
  const statusFn = useServerFn(setCampaignStatus);

  const { data } = useQuery({ queryKey: ["campaigns"], queryFn: () => listFn(), refetchInterval: 8000 });
  const campaigns = (data?.campaigns ?? []) as CampaignRow[];

  const [editingId, setEditingId] = useState<string | null | "new">(null);

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Campaign deleted");
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: () => toast.error("Failed to delete"),
  });

  const changeStatus = useMutation({
    mutationFn: (v: { id: string; action: "start" | "pause" | "resume" | "cancel" }) => statusFn({ data: v }),
    onSuccess: (res) => {
      if (res && (res as { ok: boolean }).ok) {
        qc.invalidateQueries({ queryKey: ["campaigns"] });
      } else {
        toast.error((res as { error?: string })?.error ?? "Action failed");
      }
    },
    onError: () => toast.error("Action failed"),
  });

  if (editingId) {
    return <CampaignEditor campaignId={editingId === "new" ? null : editingId} onBack={() => setEditingId(null)} />;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Send bulk WhatsApp, SMS or email through controlled drip schedules. Pick contacts by offer, pipeline stage or CSV
        upload, then send in batches with delays. Replies stop the drip for that contact and flow into the inbox, where
        your AI agents and workflows take over.
      </p>

      {campaigns.map((c) => {
        const s = c.stats;
        const progress = s.total > 0 ? Math.round(((s.total - s.pending) / s.total) * 100) : 0;
        return (
          <div key={c.id} className="rounded-xl border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Send className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{c.name}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                      STATUS_STYLES[c.status] ?? "bg-muted text-muted-foreground",
                    )}
                  >
                    {c.status}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                    {c.channel}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.total} recipient{s.total === 1 ? "" : "s"} · {progress}% processed
                </p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  <Stat label="Pending" value={s.pending} />
                  <Stat label="Sent" value={s.sent} tone="text-foreground" />
                  <Stat label="Delivered" value={s.delivered} />
                  <Stat label="Opened" value={s.opened} />
                  <Stat label="Replied" value={s.replied} tone="text-success" />
                  <Stat label="Failed" value={s.failed} tone="text-destructive" />
                </div>
                {(() => {
                  // Rate report: delivered / sent (or later), opened / delivered, replied / delivered.
                  // Falls back to sent-based denominators when Meta hasn't reported delivery yet.
                  const attempted = s.sent + s.delivered + s.opened + s.replied + s.failed;
                  const successfullyOut = s.sent + s.delivered + s.opened + s.replied;
                  const reachedInbox = s.delivered + s.opened + s.replied;
                  const opened = s.opened + s.replied; // read implies opened
                  const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 100) : 0);
                  if (attempted === 0) return null;
                  return (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                      <RateBadge label="Delivery" value={pct(reachedInbox, successfullyOut || attempted)} />
                      <RateBadge label="Open" value={pct(opened, reachedInbox || successfullyOut || attempted)} />
                      <RateBadge label="Reply" value={pct(s.replied, reachedInbox || successfullyOut || attempted)} />
                    </div>
                  );
                })()}
              </div>

              <div className="flex shrink-0 flex-wrap gap-1">
                {(c.status === "draft" || c.status === "scheduled") && (
                  <Button size="sm" onClick={() => changeStatus.mutate({ id: c.id, action: "start" })}>
                    <Play className="mr-1 h-3.5 w-3.5" /> Start
                  </Button>
                )}
                {c.status === "running" && (
                  <Button size="sm" variant="outline" onClick={() => changeStatus.mutate({ id: c.id, action: "pause" })}>
                    <Pause className="mr-1 h-3.5 w-3.5" /> Pause
                  </Button>
                )}
                {c.status === "paused" && (
                  <Button size="sm" onClick={() => changeStatus.mutate({ id: c.id, action: "resume" })}>
                    <Play className="mr-1 h-3.5 w-3.5" /> Resume
                  </Button>
                )}
                {(c.status === "running" || c.status === "paused" || c.status === "scheduled") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm(`Cancel campaign "${c.name}"? Pending messages won't be sent.`))
                        changeStatus.mutate({ id: c.id, action: "cancel" });
                    }}
                  >
                    <X className="mr-1 h-3.5 w-3.5" /> Cancel
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setEditingId(c.id)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm(`Delete campaign "${c.name}"?`)) del.mutate(c.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      {campaigns.length === 0 && <p className="text-sm text-muted-foreground">No campaigns yet.</p>}

      <Button variant="outline" onClick={() => setEditingId("new")}>
        <Plus className="mr-1 h-4 w-4" /> New Campaign
      </Button>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-muted-foreground">{label}:</span>
      <span className={cn("font-semibold", tone ?? "text-muted-foreground")}>{value}</span>
    </span>
  );
}

/* ----------------------------- Editor ----------------------------- */

function CampaignEditor({ campaignId, onBack }: { campaignId: string | null; onBack: () => void }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listCampaigns);
  const optsFn = useServerFn(getCampaignOptions);
  const createFn = useServerFn(createCampaign);
  const updateFn = useServerFn(updateCampaign);
  const recipFn = useServerFn(listCampaignRecipients);
  const addLeadsFn = useServerFn(addRecipientsFromLeads);
  const addCsvFn = useServerFn(addRecipientsFromCsv);
  const clearFn = useServerFn(clearPendingRecipients);

  const { data: optsData } = useQuery({ queryKey: ["campaign-options"], queryFn: () => optsFn() });
  const opts: Options = {
    workspaces: (optsData?.workspaces ?? []) as Options["workspaces"],
    offers: (optsData?.offers ?? []) as Options["offers"],
    stages: (optsData?.stages ?? []) as Options["stages"],
  };

  const { data: listData } = useQuery({ queryKey: ["campaigns"], queryFn: () => listFn() });
  const existing = (listData?.campaigns ?? []).find((c) => c.id === campaignId) as CampaignRow | undefined;

  const [id, setId] = useState<string | null>(campaignId);
  const [name, setName] = useState(existing?.name ?? "");
  const [channel, setChannel] = useState(existing?.channel ?? "whatsapp");
  const [workspaceId, setWorkspaceId] = useState<string | null>(existing?.workspace_id ?? null);
  const [template, setTemplate] = useState(existing?.message_template ?? "");
  const [batchSize, setBatchSize] = useState(existing?.batch_size ?? 25);
  const [delaySeconds, setDelaySeconds] = useState(existing?.delay_seconds ?? 2);
  const [sendRate, setSendRate] = useState(existing?.send_rate_per_min ?? 60);
  const [startAt, setStartAt] = useState(toLocalInput(existing?.start_at));
  const [endAt, setEndAt] = useState(toLocalInput(existing?.end_at));
  const [variations, setVariations] = useState<string[]>(existing?.message_variations ?? []);
  const [batchBreak, setBatchBreak] = useState(Math.round((existing?.batch_break_seconds ?? 60) / 60));
  const [sendDays, setSendDays] = useState<number[]>(existing?.send_days ?? [0, 1, 2, 3, 4, 5, 6]);
  const [windowStart, setWindowStart] = useState(existing?.send_window_start ?? "");
  const [windowEnd, setWindowEnd] = useState(existing?.send_window_end ?? "");
  const [timezone, setTimezone] = useState(
    existing?.send_timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
  );
  const [media, setMedia] = useState<CampaignMedia>(existing?.media ?? null);
  const [buttons, setButtons] = useState<CampaignButton[]>(existing?.buttons ?? []);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const uploadFn = useServerFn(uploadMessageAttachment);
  const workflowsFn = useServerFn(listWorkflows);
  const { data: wfData } = useQuery({ queryKey: ["campaign-workflows"], queryFn: () => workflowsFn() });
  const workflows = ((wfData as { workflows?: Array<{ id: string; name: string }> } | undefined)?.workflows ?? []) as Array<{
    id: string;
    name: string;
  }>;

  const locked = existing ? !["draft", "scheduled", "paused"].includes(existing.status) : false;

  const { data: recipData } = useQuery({
    queryKey: ["campaign-recipients", id],
    queryFn: () => recipFn({ data: { campaignId: id! } }),
    enabled: Boolean(id),
    refetchInterval: 8000,
  });
  const recipients = (recipData?.recipients ?? []) as Array<{
    id: string;
    phone_number: string;
    name: string | null;
    status: string;
    error: string | null;
  }>;

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        channel: channel as "whatsapp" | "sms" | "email" | "other",
        workspace_id: workspaceId,
        message_template: template,
        message_variations: variations.map((v) => v.trim()).filter(Boolean),
        batch_size: Number(batchSize),
        delay_seconds: Number(delaySeconds),
        batch_break_seconds: Math.max(0, Math.round(Number(batchBreak) * 60)),
        send_rate_per_min: Number(sendRate),
        send_days: sendDays.length ? sendDays : [0, 1, 2, 3, 4, 5, 6],
        send_window_start: windowStart || null,
        send_window_end: windowEnd || null,
        send_timezone: timezone || "UTC",
        start_at: fromLocalInput(startAt),
        end_at: fromLocalInput(endAt),
        media,
        buttons: buttons
          .map((b) => ({ ...b, title: (b.title ?? "").trim() }))
          .filter((b) => b.title.length > 0)
          .slice(0, 3),
      };
      if (id) return updateFn({ data: { id, ...payload } });
      return createFn({ data: payload });
    },
    onSuccess: (res) => {
      const r = res as { ok: boolean; error?: string; id?: string };
      if (!r.ok) {
        toast.error(r.error ?? "Could not save");
        return;
      }
      if (!id && r.id) setId(r.id);
      toast.success("Campaign saved");
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: () => toast.error("Could not save"),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <h3 className="font-semibold">{id ? "Edit campaign" : "New campaign"}</h3>
      </div>

      <div className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>Campaign name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Spring intake outreach" />
        </div>

        <div>
          <Label>Channel</Label>
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHANNELS.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Sending workspace</Label>
          <Select value={workspaceId ?? ""} onValueChange={(v) => setWorkspaceId(v || null)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose workspace" />
            </SelectTrigger>
            <SelectContent>
              {opts.workspaces.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name} ({w.provider_type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-2">
          <Label>Message template</Label>
          <Textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={5}
            placeholder="Hi {{first_name}}, we have openings for {{course_interest}}…"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Merge fields: <code>{"{{first_name}}"}</code>, <code>{"{{name}}"}</code>,{" "}
            <code>{"{{course_interest}}"}</code>, <code>{"{{country_interest}}"}</code>, or any CSV column (e.g.{" "}
            <code>{"{{company_name}}"}</code>).
          </p>
        </div>

        <div className="sm:col-span-2 rounded-lg border bg-muted/20 p-3">
          <div className="flex items-center justify-between">
            <Label>Message variations (spintax / A-B rotation)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setVariations((v) => [...v, ""])}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Add variation
            </Button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            The sender rotates evenly between the main template and these variations to reduce the chance of being
            flagged as spam. Merge fields work here too.
          </p>
          <div className="mt-3 space-y-2">
            {variations.length === 0 && (
              <p className="text-xs text-muted-foreground">No variations yet — only the main template will be used.</p>
            )}
            {variations.map((v, i) => (
              <div key={i} className="flex items-start gap-2">
                <Textarea
                  value={v}
                  onChange={(e) => setVariations((arr) => arr.map((x, idx) => (idx === i ? e.target.value : x)))}
                  rows={3}
                  placeholder={`Variation ${i + 1} — e.g. Hey {{first_name}}! Spots are opening for {{course_interest}}.`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setVariations((arr) => arr.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* --------------- Media attachment --------------- */}
        <div className="sm:col-span-2 rounded-lg border bg-muted/20 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Label className="flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" /> Media attachment (optional)
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Attach one image, audio note, video, or document. Sent with every message in this campaign.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                ref={mediaInputRef}
                type="file"
                accept="image/*,audio/*,video/*,application/pdf"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 12 * 1024 * 1024) {
                    toast.error("File too large (max 12 MB)");
                    return;
                  }
                  setUploadingMedia(true);
                  try {
                    const buf = await file.arrayBuffer();
                    const bytes = new Uint8Array(buf);
                    let binary = "";
                    const chunk = 0x8000;
                    for (let i = 0; i < bytes.length; i += chunk) {
                      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
                    }
                    const base64 = typeof btoa === "function" ? btoa(binary) : "";
                    const res = (await uploadFn({
                      data: { filename: file.name, mime: file.type || "application/octet-stream", base64 },
                    })) as { ok: boolean; url?: string; mime?: string; filename?: string; error?: string };
                    if (!res.ok || !res.url) {
                      toast.error(res.error ?? "Upload failed");
                      return;
                    }
                    const mime = res.mime ?? file.type;
                    const kind: "image" | "audio" | "video" | "document" = mime.startsWith("image/")
                      ? "image"
                      : mime.startsWith("audio/")
                        ? "audio"
                        : mime.startsWith("video/")
                          ? "video"
                          : "document";
                    setMedia({ url: res.url, mime, kind, filename: res.filename ?? file.name, caption: null });
                    toast.success("Media attached");
                  } catch {
                    toast.error("Upload failed");
                  } finally {
                    setUploadingMedia(false);
                    if (mediaInputRef.current) mediaInputRef.current.value = "";
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => mediaInputRef.current?.click()}
                disabled={uploadingMedia}
              >
                {uploadingMedia ? (
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Paperclip className="mr-1 h-3.5 w-3.5" />
                )}
                {media ? "Replace" : "Upload"}
              </Button>
              {media ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => setMedia(null)}>
                  <X className="mr-1 h-3.5 w-3.5" /> Remove
                </Button>
              ) : null}
            </div>
          </div>
          {media ? (
            <div className="mt-3 flex items-start gap-3">
              {media.kind === "image" ? (
                <img
                  src={media.url}
                  alt={media.filename ?? "attachment preview"}
                  className="h-20 w-20 rounded-lg border object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border bg-background text-xs uppercase text-muted-foreground">
                  {media.kind}
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-2">
                <p className="truncate text-sm font-medium">{media.filename ?? media.mime}</p>
                <p className="text-xs text-muted-foreground">{media.mime}</p>
                {media.kind !== "audio" ? (
                  <Input
                    value={media.caption ?? ""}
                    onChange={(e) => setMedia((m) => (m ? { ...m, caption: e.target.value || null } : m))}
                    placeholder="Optional caption (overrides the message text on the media)"
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Audio has no caption — the message text is sent as a separate follow-up message.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* --------------- Interactive buttons --------------- */}
        <div className="sm:col-span-2 rounded-lg border bg-muted/20 p-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Quick-reply buttons (WhatsApp Cloud only)</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Up to 3 tappable buttons. On WhatsApp Cloud they're sent as native interactive buttons; on other
                providers they're folded into the message as a numbered list. Optionally link a button to a follow-up
                workflow — when the recipient taps it, the lead is enrolled automatically.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={buttons.length >= 3}
              onClick={() => setButtons((arr) => [...arr, { title: "", next_workflow_id: null }])}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Add button
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {buttons.length === 0 ? (
              <p className="text-xs text-muted-foreground">No buttons — the message will be sent as plain text.</p>
            ) : null}
            {buttons.map((b, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input
                  value={b.title}
                  maxLength={20}
                  onChange={(e) =>
                    setButtons((arr) => arr.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))
                  }
                  placeholder={`Button ${i + 1} label (max 20 chars)`}
                />
                <Select
                  value={b.next_workflow_id ?? "__none__"}
                  onValueChange={(v) =>
                    setButtons((arr) =>
                      arr.map((x, idx) =>
                        idx === i ? { ...x, next_workflow_id: v === "__none__" ? null : v } : x,
                      ),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No workflow (just a reply)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No workflow (just a reply)</SelectItem>
                    {workflows.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setButtons((arr) => arr.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>



        <div>
          <Label>Batch size (per minute)</Label>
          <Input
            type="number"
            min={1}
            max={100}
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Delay between messages (sec)</Label>
          <Input
            type="number"
            min={0}
            max={5}
            value={delaySeconds}
            onChange={(e) => setDelaySeconds(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Max send rate (per min)</Label>
          <Input
            type="number"
            min={1}
            max={600}
            value={sendRate}
            onChange={(e) => setSendRate(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Break between batches (min)</Label>
          <Input
            type="number"
            min={0}
            max={1440}
            value={batchBreak}
            onChange={(e) => setBatchBreak(Number(e.target.value))}
          />
        </div>

        <div className="sm:col-span-2 rounded-lg border bg-muted/20 p-3">
          <Label>Drip sending schedule</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Restrict sending to specific weekdays and a time-of-day window. Messages outside this window wait until the
            next allowed slot.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {WEEKDAYS.map((d) => {
              const on = sendDays.includes(d.value);
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() =>
                    setSendDays((arr) =>
                      arr.includes(d.value) ? arr.filter((x) => x !== d.value) : [...arr, d.value].sort(),
                    )
                  }
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70",
                  )}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <Label>From (time)</Label>
              <Input type="time" value={windowStart} onChange={(e) => setWindowStart(e.target.value)} />
            </div>
            <div>
              <Label>To (time)</Label>
              <Input type="time" value={windowEnd} onChange={(e) => setWindowEnd(e.target.value)} />
            </div>
            <div>
              <Label>Timezone</Label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g. Europe/London"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Leave the time fields empty to send at any hour on the selected days.
          </p>
        </div>

        <div>
          <Label>Start date/time (optional)</Label>
          <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
        </div>
        <div>
          <Label>End date/time (optional)</Label>
          <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <Button onClick={() => save.mutate()} disabled={save.isPending || !name.trim()}>
            {save.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
            Save campaign
          </Button>
        </div>
      </div>

      {id ? (
        <AudienceManager
          campaignId={id}
          opts={opts}
          locked={locked}
          recipients={recipients}
          onChanged={() => {
            qc.invalidateQueries({ queryKey: ["campaign-recipients", id] });
            qc.invalidateQueries({ queryKey: ["campaigns"] });
          }}
          addLeads={(v) => addLeadsFn({ data: v })}
          addCsv={(v) => addCsvFn({ data: v })}
          clearPending={() => clearFn({ data: { campaignId: id } })}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Save the campaign first to add recipients.</p>
      )}
    </div>
  );
}

/* --------------------------- Audience --------------------------- */

function AudienceManager({
  campaignId,
  opts,
  locked,
  recipients,
  onChanged,
  addLeads,
  addCsv,
  clearPending,
}: {
  campaignId: string;
  opts: Options;
  locked: boolean;
  recipients: Array<{ id: string; phone_number: string; name: string | null; status: string; error: string | null }>;
  onChanged: () => void;
  addLeads: (v: {
    campaignId: string;
    source: "all" | "offer" | "stage";
    offerId?: string;
    stageKeys?: string[];
  }) => Promise<unknown>;
  addCsv: (v: { campaignId: string; rows: Array<Record<string, string>> }) => Promise<unknown>;
  clearPending: () => Promise<unknown>;
}) {
  const [source, setSource] = useState<"all" | "offer" | "stage" | "csv">("offer");
  const [offerId, setOfferId] = useState<string>("");
  const [stageKeys, setStageKeys] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleResult = (res: unknown) => {
    const r = res as { ok?: boolean; error?: string; added?: number; skipped?: number };
    if (r?.ok) {
      toast.success(`Added ${r.added ?? 0} recipient(s)${r.skipped ? `, skipped ${r.skipped}` : ""}`);
      onChanged();
    } else {
      toast.error(r?.error ?? "Could not add recipients");
    }
  };

  const addFromLeads = async () => {
    setBusy(true);
    try {
      if (source === "offer" && !offerId) {
        toast.error("Choose an offer");
        return;
      }
      if (source === "stage" && stageKeys.length === 0) {
        toast.error("Choose at least one stage");
        return;
      }
      const res = await addLeads({
        campaignId,
        source: source as "all" | "offer" | "stage",
        offerId: source === "offer" ? offerId : undefined,
        stageKeys: source === "stage" ? stageKeys : undefined,
      });
      handleResult(res);
    } finally {
      setBusy(false);
    }
  };

  const onCsvFile = async (file: File) => {
    setBusy(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) {
        toast.error("No rows found. Ensure the CSV has a header row and a phone column.");
        return;
      }
      const res = await addCsv({ campaignId, rows: rows.slice(0, 10000) });
      handleResult(res);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const toggleStage = (keys: string[]) => {
    setStageKeys((prev) => {
      const has = keys.every((k) => prev.includes(k));
      if (has) return prev.filter((k) => !keys.includes(k));
      return Array.from(new Set([...prev, ...keys]));
    });
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of recipients) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [recipients]);

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <h4 className="font-semibold">Audience</h4>
        <span className="text-xs text-muted-foreground">{recipients.length} recipients</span>
      </div>

      {locked ? (
        <p className="text-sm text-muted-foreground">
          This campaign is finished; its audience can no longer be changed.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1">
            {(
              [
                { id: "offer", label: "By offer" },
                { id: "stage", label: "By pipeline stage" },
                { id: "all", label: "All contacts" },
                { id: "csv", label: "CSV upload" },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                onClick={() => setSource(s.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium",
                  source === s.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {source === "offer" && (
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[200px] flex-1">
                <Label>Offer</Label>
                <Select value={offerId} onValueChange={setOfferId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose offer" />
                  </SelectTrigger>
                  <SelectContent>
                    {opts.offers.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addFromLeads} disabled={busy}>
                {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
                Add
              </Button>
            </div>
          )}

          {source === "stage" && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {opts.stages.map((st) => {
                  const active = st.stage_keys.length > 0 && st.stage_keys.every((k) => stageKeys.includes(k));
                  return (
                    <button
                      key={st.id}
                      onClick={() => toggleStage(st.stage_keys)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs",
                        active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
                      )}
                    >
                      {st.pipeline_name ? `${st.pipeline_name}: ` : ""}
                      {st.label}
                    </button>
                  );
                })}
                {opts.stages.length === 0 && (
                  <span className="text-xs text-muted-foreground">No pipeline stages found.</span>
                )}
              </div>
              <Button onClick={addFromLeads} disabled={busy}>
                {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
                Add stage contacts
              </Button>
            </div>
          )}

          {source === "all" && (
            <div>
              <Button onClick={addFromLeads} disabled={busy}>
                {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
                Add all contacts
              </Button>
            </div>
          )}

          {source === "csv" && (
            <div className="space-y-2">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onCsvFile(f);
                }}
              />
              <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>
                {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}
                Upload CSV
              </Button>
              <p className="text-xs text-muted-foreground">
                CSV needs a header row with a <code>phone</code> column. Optional <code>name</code> and any extra columns
                become merge fields.
              </p>
            </div>
          )}
        </>
      )}

      {recipients.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              {["pending", "sent", "delivered", "opened", "replied", "failed"].map((k) => (
                <Stat key={k} label={k} value={counts[k] ?? 0} />
              ))}
            </div>
            {!locked && (counts.pending ?? 0) > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (!confirm("Remove all pending recipients?")) return;
                  await clearPending();
                  onChanged();
                }}
              >
                Clear pending
              </Button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/60 text-left text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recipients.slice(0, 500).map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-1.5">{r.name ?? "—"}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{r.phone_number}</td>
                    <td className="px-3 py-1.5">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                          r.status === "replied"
                            ? "bg-success/15 text-success"
                            : r.status === "failed"
                              ? "bg-destructive/15 text-destructive"
                              : r.status === "sent" || r.status === "delivered"
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground",
                        )}
                        title={r.error ?? undefined}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- utils ----------------------------- */

function toLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}
