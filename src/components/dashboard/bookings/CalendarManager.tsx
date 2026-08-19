import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarCog, Plus, Trash2, Clock, CalendarOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { WEEKDAY_LABELS } from "@/lib/calendar-slots";
import {
  listCalendars,
  upsertCalendar,
  deleteCalendar,
  saveAvailability,
  upsertException,
  deleteException,
} from "@/lib/calendars.functions";

interface CalendarRow {
  id: string;
  name: string;
  description: string | null;
  color: string;
  timezone: string;
  slot_duration_minutes: number;
  buffer_minutes: number;
  min_notice_minutes: number;
  max_days_ahead: number;
  is_default: boolean;
  active: boolean;
}
interface RuleRow {
  id: string;
  calendar_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
}
interface ExceptionRow {
  id: string;
  calendar_id: string;
  exception_date: string;
  closed: boolean;
  start_time: string | null;
  end_time: string | null;
  note: string | null;
}

const TIMEZONES = [
  "UTC",
  "Africa/Lagos",
  "Africa/Nairobi",
  "Europe/London",
  "Europe/Lisbon",
  "Europe/Berlin",
  "America/New_York",
  "America/Sao_Paulo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Australia/Sydney",
];

const blank = {
  name: "",
  description: "",
  color: "#6366f1",
  timezone: "UTC",
  slot_duration_minutes: 30,
  buffer_minutes: 0,
  min_notice_minutes: 60,
  max_days_ahead: 60,
  is_default: false,
  active: true,
};

export function CalendarManager() {
  const qc = useQueryClient();
  const listFn = useServerFn(listCalendars);
  const saveFn = useServerFn(upsertCalendar);
  const delFn = useServerFn(deleteCalendar);
  const availFn = useServerFn(saveAvailability);
  const exFn = useServerFn(upsertException);
  const exDelFn = useServerFn(deleteException);

  const { data } = useQuery({ queryKey: ["calendars"], queryFn: () => listFn() });
  const calendars = ((data as { calendars?: CalendarRow[] } | undefined)?.calendars ?? []) as CalendarRow[];
  const rules = ((data as { availability?: RuleRow[] } | undefined)?.availability ?? []) as RuleRow[];
  const exceptions = ((data as { exceptions?: ExceptionRow[] } | undefined)?.exceptions ?? []) as ExceptionRow[];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<typeof blank & { id?: string }>(blank);
  const [newException, setNewException] = useState({ date: "", note: "" });

  const selected = useMemo(
    () => calendars.find((c) => c.id === selectedId) ?? null,
    [calendars, selectedId],
  );
  const selectedRules = rules.filter((r) => r.calendar_id === selectedId);
  const selectedExceptions = exceptions.filter((e) => e.calendar_id === selectedId);

  const refresh = () => qc.invalidateQueries({ queryKey: ["calendars"] });

  const save = useMutation({
    mutationFn: (v: typeof blank & { id?: string }) => saveFn({ data: v }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error?: string };
      if (!res.ok) return void toast.error(res.error ?? "Could not save calendar");
      toast.success("Calendar saved");
      setDraft(blank);
      refresh();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Calendar deleted");
      setSelectedId(null);
      refresh();
    },
  });

  const saveRules = useMutation({
    mutationFn: (v: { calendar_id: string; rules: { weekday: number; start_time: string; end_time: string }[] }) =>
      availFn({ data: v }),
    onSuccess: () => {
      toast.success("Availability updated");
      refresh();
    },
  });

  const addException = useMutation({
    mutationFn: (v: { calendar_id: string; exception_date: string; note: string | null }) =>
      exFn({ data: { ...v, closed: true } }),
    onSuccess: () => {
      setNewException({ date: "", note: "" });
      refresh();
    },
  });

  const removeException = useMutation({
    mutationFn: (id: string) => exDelFn({ data: { id } }),
    onSuccess: refresh,
  });

  /** Toggle a weekday on/off, keeping the existing hours where possible. */
  const toggleDay = (weekday: number) => {
    if (!selected) return;
    const current = selectedRules.map((r) => ({
      weekday: r.weekday,
      start_time: r.start_time.slice(0, 5),
      end_time: r.end_time.slice(0, 5),
    }));
    const has = current.some((r) => r.weekday === weekday);
    const next = has
      ? current.filter((r) => r.weekday !== weekday)
      : [...current, { weekday, start_time: "09:00", end_time: "17:00" }];
    saveRules.mutate({ calendar_id: selected.id, rules: next });
  };

  const changeHours = (weekday: number, field: "start_time" | "end_time", value: string) => {
    if (!selected) return;
    const next = selectedRules.map((r) => ({
      weekday: r.weekday,
      start_time: r.weekday === weekday && field === "start_time" ? value : r.start_time.slice(0, 5),
      end_time: r.weekday === weekday && field === "end_time" ? value : r.end_time.slice(0, 5),
    }));
    saveRules.mutate({ calendar_id: selected.id, rules: next });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      {/* Calendar list + create form */}
      <div className="space-y-3 rounded-2xl border bg-card p-4 shadow-card">
        <div className="flex items-center gap-2">
          <CalendarCog className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Calendars</h3>
        </div>

        <div className="space-y-1.5">
          {calendars.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                selectedId === c.id ? "border-primary bg-primary/5" : "hover:bg-muted/50",
              )}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.color }} />
              <span className="flex-1 truncate font-medium">{c.name}</span>
              {c.is_default && <span className="text-[10px] uppercase text-muted-foreground">default</span>}
              {!c.active && <span className="text-[10px] uppercase text-muted-foreground">off</span>}
            </button>
          ))}
          {calendars.length === 0 && (
            <p className="py-4 text-center text-xs text-muted-foreground">No calendars yet.</p>
          )}
        </div>

        <div className="space-y-2 border-t pt-3">
          <Label className="text-xs">New calendar</Label>
          <Input
            placeholder="e.g. Admissions consultations"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <Select value={draft.timezone} onValueChange={(v) => setDraft({ ...draft, timezone: v })}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={5}
              step={5}
              value={draft.slot_duration_minutes}
              onChange={(e) => setDraft({ ...draft, slot_duration_minutes: Number(e.target.value) })}
              placeholder="Slot mins"
            />
          </div>
          <Button
            className="w-full"
            disabled={!draft.name.trim() || save.isPending}
            onClick={() => save.mutate({ ...draft, is_default: calendars.length === 0 })}
          >
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="mr-1 h-4 w-4" /> Create</>}
          </Button>
        </div>
      </div>

      {/* Selected calendar editor */}
      <div className="space-y-4 rounded-2xl border bg-card p-4 shadow-card">
        {!selected ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Select a calendar to edit its slots and availability.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                className="max-w-xs font-medium"
                value={selected.name}
                onChange={(e) => save.mutate({ ...selected, name: e.target.value, description: selected.description ?? "" })}
              />
              <div className="ml-auto flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs">Default</Label>
                  <Switch
                    checked={selected.is_default}
                    onCheckedChange={(v) =>
                      save.mutate({ ...selected, description: selected.description ?? "", is_default: v })
                    }
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs">Active</Label>
                  <Switch
                    checked={selected.active}
                    onCheckedChange={(v) =>
                      save.mutate({ ...selected, description: selected.description ?? "", active: v })
                    }
                  />
                </div>
                <Button size="sm" variant="ghost" onClick={() => remove.mutate(selected.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ["slot_duration_minutes", "Slot length (min)"],
                  ["buffer_minutes", "Buffer between (min)"],
                  ["min_notice_minutes", "Minimum notice (min)"],
                  ["max_days_ahead", "Bookable days ahead"],
                ] as const
              ).map(([field, label]) => (
                <div key={field} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <Input
                    type="number"
                    min={0}
                    defaultValue={selected[field]}
                    onBlur={(e) =>
                      save.mutate({
                        ...selected,
                        description: selected.description ?? "",
                        [field]: Number(e.target.value),
                      })
                    }
                  />
                </div>
              ))}
              <div className="space-y-1">
                <Label className="text-xs">Time zone</Label>
                <Select
                  value={selected.timezone}
                  onValueChange={(v) =>
                    save.mutate({ ...selected, description: selected.description ?? "", timezone: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Weekly availability */}
            <div className="space-y-2 border-t pt-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold">Weekly availability</h4>
              </div>
              <div className="space-y-1.5">
                {WEEKDAY_LABELS.map((label, wd) => {
                  const rule = selectedRules.find((r) => r.weekday === wd);
                  return (
                    <div key={label} className="flex items-center gap-3 rounded-lg border px-3 py-2">
                      <Switch checked={Boolean(rule)} onCheckedChange={() => toggleDay(wd)} />
                      <span className="w-12 text-sm font-medium">{label}</span>
                      {rule ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            className="h-8 w-28"
                            defaultValue={rule.start_time.slice(0, 5)}
                            onBlur={(e) => changeHours(wd, "start_time", e.target.value)}
                          />
                          <span className="text-xs text-muted-foreground">to</span>
                          <Input
                            type="time"
                            className="h-8 w-28"
                            defaultValue={rule.end_time.slice(0, 5)}
                            onBlur={(e) => changeHours(wd, "end_time", e.target.value)}
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unavailable</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date overrides */}
            <div className="space-y-2 border-t pt-3">
              <div className="flex items-center gap-2">
                <CalendarOff className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold">Blocked dates</h4>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="date"
                  className="h-9 w-44"
                  value={newException.date}
                  onChange={(e) => setNewException({ ...newException, date: e.target.value })}
                />
                <Input
                  className="h-9 w-52"
                  placeholder="Reason (optional)"
                  value={newException.note}
                  onChange={(e) => setNewException({ ...newException, note: e.target.value })}
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!newException.date}
                  onClick={() =>
                    addException.mutate({
                      calendar_id: selected.id,
                      exception_date: newException.date,
                      note: newException.note || null,
                    })
                  }
                >
                  <Plus className="mr-1 h-4 w-4" /> Block
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedExceptions.map((e) => (
                  <span key={e.id} className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs">
                    {e.exception_date}
                    {e.note ? ` — ${e.note}` : ""}
                    <button onClick={() => removeException.mutate(e.id)} className="text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {selectedExceptions.length === 0 && (
                  <span className="text-xs text-muted-foreground">No blocked dates.</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
