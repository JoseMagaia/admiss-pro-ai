import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays } from "@/lib/calendar-slots";
import { listCalendars, listSlots, bookSlot } from "@/lib/calendars.functions";

interface CalendarRow { id: string; name: string; timezone: string; active: boolean; is_default: boolean }
interface SlotRow { start: string; end: string; label: string; date: string }

/** Availability-aware booking panel: pick a calendar, see real free slots, book. */
export function SlotPicker() {
  const qc = useQueryClient();
  const listFn = useServerFn(listCalendars);
  const slotsFn = useServerFn(listSlots);
  const bookFn = useServerFn(bookSlot);

  const { data: calData } = useQuery({ queryKey: ["calendars"], queryFn: () => listFn() });
  const calendars = (((calData as { calendars?: CalendarRow[] } | undefined)?.calendars ?? []) as CalendarRow[]).filter(
    (c) => c.active,
  );

  const today = new Date().toISOString().slice(0, 10);
  const [calendarId, setCalendarId] = useState<string>("");
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(addDays(today, 13));
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const activeCalendar = calendarId || calendars.find((c) => c.is_default)?.id || calendars[0]?.id || "";

  const { data: slotData, isFetching } = useQuery({
    queryKey: ["calendar-slots", activeCalendar, from, to],
    queryFn: () => slotsFn({ data: { calendar_id: activeCalendar, from, to } }),
    enabled: Boolean(activeCalendar),
  });
  const slots = ((slotData as { slots?: SlotRow[] } | undefined)?.slots ?? []) as SlotRow[];

  const grouped = useMemo(() => {
    const map = new Map<string, SlotRow[]>();
    for (const s of slots) {
      if (!map.has(s.date)) map.set(s.date, []);
      map.get(s.date)!.push(s);
    }
    return Array.from(map.entries());
  }, [slots]);

  const book = useMutation({
    mutationFn: (start: string) =>
      bookFn({
        data: {
          calendar_id: activeCalendar,
          start,
          lead_name: name.trim() || null,
          phone_number: phone.trim() || null,
          notes: "Booked from the dashboard.",
        },
      }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error?: string };
      if (!res.ok) return void toast.error(res.error ?? "Could not book slot");
      toast.success("Slot booked");
      qc.invalidateQueries({ queryKey: ["appointments"] });
      qc.invalidateQueries({ queryKey: ["calendar-slots"] });
    },
  });

  if (calendars.length === 0) {
    return (
      <p className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
        Create a calendar first to see bookable slots.
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border bg-card p-4 shadow-card">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1">
          <Label className="text-xs">Calendar</Label>
          <Select value={activeCalendar} onValueChange={setCalendarId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {calendars.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">From</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">To</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Lead name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
        </div>
      </div>

      {isFetching ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : grouped.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No free slots in this range — check the calendar's weekly availability.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {grouped.map(([date, items]) => (
            <div key={date} className="rounded-xl border p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{date}</p>
              <div className="flex flex-wrap gap-1.5">
                {items.map((s) => (
                  <Button
                    key={s.start}
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 px-2 text-xs"
                    disabled={book.isPending}
                    onClick={() => book.mutate(s.start)}
                  >
                    <CalendarPlus className="h-3 w-3" /> {s.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
