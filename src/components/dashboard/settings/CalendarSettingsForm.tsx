import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Save, Loader2, CalendarClock, CalendarCheck2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsCard } from "./SettingsForms";
import { getCalendarSettings, saveCalendarSettings, getAvailableSlots } from "@/lib/calendar.functions";
import { cn } from "@/lib/utils";

const WEEKDAYS = [
  { n: 1, label: "Mon" },
  { n: 2, label: "Tue" },
  { n: 3, label: "Wed" },
  { n: 4, label: "Thu" },
  { n: 5, label: "Fri" },
  { n: 6, label: "Sat" },
  { n: 0, label: "Sun" },
];

interface Settings {
  id?: string;
  provider: "manual" | "calcom" | "google";
  slot_duration_minutes: number;
  buffer_minutes: number;
  working_days: number[];
  working_start: string;
  working_end: string;
  timezone: string;
  calcom_username?: string | null;
  calcom_event_slug?: string | null;
  calcom_api_key?: string | null;
  google_calendar_id?: string | null;
  google_api_key?: string | null;
}

function nextDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function CalendarSettingsForm() {
  const qc = useQueryClient();
  const getFn = useServerFn(getCalendarSettings);
  const saveFn = useServerFn(saveCalendarSettings);
  const slotsFn = useServerFn(getAvailableSlots);

  const { data } = useQuery({ queryKey: ["calendar-settings"], queryFn: () => getFn() });

  const [form, setForm] = useState<Settings>({
    provider: "manual",
    slot_duration_minutes: 30,
    buffer_minutes: 0,
    working_days: [1, 2, 3, 4, 5],
    working_start: "09:00",
    working_end: "18:00",
    timezone: "UTC",
    calcom_username: null,
    calcom_event_slug: null,
    calcom_api_key: null,
    google_calendar_id: null,
    google_api_key: null,
  });

  useEffect(() => {
    const s = (data?.settings ?? null) as Settings | null;
    if (!s) return;
    setForm({
      ...s,
      calcom_api_key: "", // never surface stored secrets back
      google_api_key: "",
    });
  }, [data]);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setForm((f) => ({ ...f, [k]: v }));

  const toggleDay = (n: number) => {
    setForm((f) => ({
      ...f,
      working_days: f.working_days.includes(n) ? f.working_days.filter((d) => d !== n) : [...f.working_days, n].sort(),
    }));
  };

  const hasSecret = (k: "calcom_api_key" | "google_api_key") =>
    Boolean((data?.settings as Settings | null)?.[k]);

  const save = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          id: form.id,
          provider: form.provider,
          slot_duration_minutes: form.slot_duration_minutes,
          buffer_minutes: form.buffer_minutes,
          working_days: form.working_days,
          working_start: form.working_start,
          working_end: form.working_end,
          timezone: form.timezone,
          calcom_username: form.calcom_username || null,
          calcom_event_slug: form.calcom_event_slug || null,
          calcom_api_key: form.calcom_api_key || "",
          google_calendar_id: form.google_calendar_id || null,
          google_api_key: form.google_api_key || "",
        },
      }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null };
      if (!res.ok) {
        toast.error(res.error ?? "Failed to save");
        return;
      }
      setForm((f) => ({ ...f, calcom_api_key: "", google_api_key: "" }));
      qc.invalidateQueries({ queryKey: ["calendar-settings"] });
      toast.success("Calendar settings saved");
    },
    onError: () => toast.error("Failed to save"),
  });

  // Preview the first available slots over the next 7 days.
  const previewQuery = useQuery({
    queryKey: ["slot-preview", form.working_start, form.working_end, form.slot_duration_minutes, form.provider],
    queryFn: async () => {
      for (let i = 1; i <= 7; i++) {
        const r = (await slotsFn({ data: { date: nextDateStr(i) } })) as {
          slots?: Array<{ start: string; end: string }>;
          provider?: string;
          calcomLink?: string | null;
        };
        if (r.slots?.length) return r;
      }
      return { slots: [], provider: form.provider, calcomLink: null } as {
        slots: Array<{ start: string; end: string }>;
        provider: string;
        calcomLink?: string | null;
      };
    },
    enabled: form.provider !== "calcom",
    staleTime: 30000,
  });

  const preview = previewQuery.data as
    | { slots: Array<{ start: string; end: string }>; provider?: string; calcomLink?: string | null }
    | undefined;

  const calcomLink =
    form.provider === "calcom" && form.calcom_username && form.calcom_event_slug
      ? `https://cal.com/${encodeURIComponent(form.calcom_username)}/${encodeURIComponent(form.calcom_event_slug)}`
      : null;

  const slotLabels = useMemo(
    () =>
      (preview?.slots ?? []).slice(0, 6).map((s) =>
        new Intl.DateTimeFormat("en-US", {
          timeZone: form.timezone || "UTC",
          weekday: "short",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(new Date(s.start)),
      ),
    [preview, form.timezone],
  );

  return (
    <div className="space-y-5">
      <SettingsCard
        title="Calendar & Availability"
        description="Controls the available slots agents can book from the chat. Slots can be manual or powered by Cal.com / Google Calendar."
      >
        <div className="space-y-1.5">
          <Label>Booking provider</Label>
          <Select value={form.provider} onValueChange={(v) => set("provider", v as Settings["provider"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual availability</SelectItem>
              <SelectItem value="calcom">Cal.com</SelectItem>
              <SelectItem value="google">Google Calendar</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {form.provider === "manual" && "Slots are generated from the working hours below."}
            {form.provider === "calcom" && "Agents get a Cal.com booking link; the in-app picker still uses working hours."}
            {form.provider === "google" && "Busy events from the public Google Calendar are excluded from the slot picker."}
          </p>
        </div>

        {/* Manual availability */}
        <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
          <div className="space-y-1.5">
            <Label>Working days</Label>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((d) => (
                <button
                  key={d.n}
                  type="button"
                  onClick={() => toggleDay(d.n)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    form.working_days.includes(d.n)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Day starts at</Label>
              <Input type="time" value={form.working_start} onChange={(e) => set("working_start", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Day ends at</Label>
              <Input type="time" value={form.working_end} onChange={(e) => set("working_end", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Slot length (minutes)</Label>
              <Input
                type="number"
                min={10}
                max={240}
                step={5}
                value={form.slot_duration_minutes}
                onChange={(e) => set("slot_duration_minutes", Number(e.target.value) || 30)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Buffer between slots (minutes)</Label>
              <Input
                type="number"
                min={0}
                max={240}
                step={5}
                value={form.buffer_minutes}
                onChange={(e) => set("buffer_minutes", Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Timezone</Label>
              <Input
                value={form.timezone}
                onChange={(e) => set("timezone", e.target.value)}
                placeholder="UTC, America/Sao_Paulo, Europe/London…"
              />
              <p className="text-xs text-muted-foreground">IANA timezone used to display slots and book appointments.</p>
            </div>
          </div>

          {/* Slot preview */}
          {form.provider !== "calcom" && (
            <div className="rounded-lg border border-dashed bg-background/60 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" /> Next available slots
              </p>
              {previewQuery.isLoading ? (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Checking…
                </p>
              ) : slotLabels.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {slotLabels.map((l, i) => (
                    <span key={i} className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                      {l}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No slots generated — check the working days and hours.</p>
              )}
            </div>
          )}
        </div>

        {/* Cal.com */}
        {form.provider === "calcom" && (
          <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Cal.com username</Label>
                <Input
                  value={form.calcom_username ?? ""}
                  onChange={(e) => set("calcom_username", e.target.value)}
                  placeholder="yourname"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Event type slug</Label>
                <Input
                  value={form.calcom_event_slug ?? ""}
                  onChange={(e) => set("calcom_event_slug", e.target.value)}
                  placeholder="admissions-call"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Cal.com API key (optional)</Label>
              <Input
                type="password"
                value={form.calcom_api_key ?? ""}
                onChange={(e) => set("calcom_api_key", e.target.value)}
                placeholder={hasSecret("calcom_api_key") ? "•••••••• (saved — leave blank to keep)" : "Paste your API key"}
              />
            </div>
            {calcomLink && (
              <a
                href={calcomLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs text-primary hover:bg-muted"
              >
                <ExternalLink className="h-3.5 w-3.5" /> {calcomLink}
              </a>
            )}
            <p className="text-xs text-muted-foreground">
              Agents can share this booking link with leads or open it from the chat. In-app slots still use the working
              hours above.
            </p>
          </div>
        )}

        {/* Google Calendar */}
        {form.provider === "google" && (
          <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Google Calendar ID</Label>
                <Input
                  value={form.google_calendar_id ?? ""}
                  onChange={(e) => set("google_calendar_id", e.target.value)}
                  placeholder="calendar@group.calendar.google.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Google API key</Label>
                <Input
                  type="password"
                  value={form.google_api_key ?? ""}
                  onChange={(e) => set("google_api_key", e.target.value)}
                  placeholder={hasSecret("google_api_key") ? "•••••••• (saved — leave blank to keep)" : "Paste your API key"}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Busy events are pulled from a <span className="font-medium">public</span> calendar using the Google Calendar
              API. Keep the calendar shared publicly, or use the Cal.com provider for private scheduling.
            </p>
            {form.google_calendar_id && (
              <a
                href={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(form.google_calendar_id)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs text-primary hover:bg-muted"
              >
                <CalendarCheck2 className="h-3.5 w-3.5" /> Open embedded calendar
              </a>
            )}
          </div>
        )}

        <Button onClick={() => save.mutate()} disabled={save.isPending} className="gap-2">
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save calendar settings
        </Button>
      </SettingsCard>
    </div>
  );
}
