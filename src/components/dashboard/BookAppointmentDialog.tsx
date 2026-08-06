import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, CalendarCheck, Link2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getAvailableSlots, bookAppointmentFromChat } from "@/lib/calendar.functions";
import { cn } from "@/lib/utils";

interface Slot {
  start: string;
  end: string;
}

interface SlotsResult {
  slots: Slot[];
  provider: string;
  calcomLink: string | null;
}

interface BookAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phone: string;
  leadName?: string | null;
  onBooked?: () => void;
}

/** The next N days as YYYY-MM-DD, starting today. */
function nextDays(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  for (let i = 0; i < n; i++) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

function DayChip({ date, active, onClick }: { date: string; active: boolean; onClick: () => void }) {
  const d = new Date(`${date}T12:00:00`);
  const dow = d.toLocaleDateString([], { weekday: "short" });
  const dom = d.getDate();
  const month = d.toLocaleDateString([], { month: "short" });
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 flex-col items-center rounded-xl border px-3.5 py-2 transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{dow}</span>
      <span className="text-base font-bold leading-tight">{dom}</span>
      <span className="text-[10px] opacity-70">{month}</span>
    </button>
  );
}

export function BookAppointmentDialog({
  open,
  onOpenChange,
  phone,
  leadName,
  onBooked,
}: BookAppointmentDialogProps) {
  const slotsFn = useServerFn(getAvailableSlots);
  const bookFn = useServerFn(bookAppointmentFromChat);

  const days = useMemo(() => nextDays(14), []);
  const [date, setDate] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const slotsQuery = useQuery({
    queryKey: ["available-slots", date],
    queryFn: () => slotsFn({ data: { date: date! } }),
    enabled: open && Boolean(date),
  });
  const slotsData = (slotsQuery.data ?? null) as SlotsResult | null;

  const book = useMutation({
    mutationFn: (startIso: string) =>
      bookFn({
        data: {
          phone,
          lead_name: leadName || undefined,
          appointment_date: startIso,
          appointment_type: "booking",
          notes: note.trim() || undefined,
        },
      }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error?: string | null; id?: string | null };
      if (res.ok) {
        toast.success("Appointment booked — confirmation sent to the lead");
        setSelected(null);
        setNote("");
        onOpenChange(false);
        onBooked?.();
      } else {
        toast.error(res.error ?? "Failed to book the appointment");
      }
    },
    onError: () => toast.error("Failed to book the appointment"),
  });

  function reset() {
    setDate(null);
    setSelected(null);
    setNote("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Book an appointment
          </DialogTitle>
        </DialogHeader>

        {slotsData?.provider === "calcom" && slotsData.calcomLink ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-primary" />
                Powered by cal.com
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                This space uses cal.com for scheduling. Open the booking page to pick a time —
                the appointment lands in your cal.com calendar automatically.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" className="gap-1.5" asChild>
                  <a href={slotsData.calcomLink} target="_blank" rel="noreferrer">
                    <Link2 className="h-4 w-4" /> Open booking page
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => {
                    navigator.clipboard?.writeText(slotsData.calcomLink ?? "");
                    toast.success("Booking link copied");
                  }}
                >
                  Copy link
                </Button>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Send the link to {leadName || "the lead"} and they can pick their own slot.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Day picker — horizontally scrollable on phones. */}
            <div className="-mx-1 space-y-1.5">
              <p className="px-1 text-xs font-medium text-muted-foreground">Pick a day</p>
              <div className="flex gap-2 overflow-x-auto px-1 pb-1">
                {days.map((d) => (
                  <DayChip
                    key={d}
                    date={d}
                    active={date === d}
                    onClick={() => {
                      setDate(d);
                      setSelected(null);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Slot grid */}
            {date && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Available times</p>
                {slotsQuery.isLoading ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Checking availability…
                  </div>
                ) : slotsData && slotsData.slots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {slotsData.slots.map((s) => (
                      <button
                        key={s.start}
                        type="button"
                        onClick={() => setSelected(selected === s.start ? null : s.start)}
                        className={cn(
                          "rounded-lg border px-2 py-2 text-sm font-medium transition-colors",
                          selected === s.start
                            ? "border-primary bg-primary text-primary-foreground"
                            : "bg-card text-foreground hover:border-primary/50",
                        )}
                      >
                        {fmtTime(s.start)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg bg-muted/50 px-3 py-4 text-center text-sm text-muted-foreground">
                    No availability on this day — try another date.
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            {date && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Notes (optional)
                </label>
                <Input
                  placeholder="e.g. Consult about enrollment"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            )}

            <DialogFooter className="gap-2 sm:justify-end">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                disabled={!selected || book.isPending}
                onClick={() => selected && book.mutate(selected)}
                className="gap-1.5"
              >
                {book.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CalendarCheck className="h-4 w-4" />
                )}
                Book & confirm
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
