// Pure slot-math helpers shared by the calendar server functions, the AI
// availability check and the calendar UI. No server-only imports here so this
// module is safe on both sides.

export interface CalendarConfig {
  id: string;
  name: string;
  timezone: string;
  slot_duration_minutes: number;
  buffer_minutes: number;
  min_notice_minutes: number;
  max_days_ahead: number;
}

export interface AvailabilityRule {
  weekday: number; // 0 = Sunday … 6 = Saturday
  start_time: string; // "09:00" / "09:00:00"
  end_time: string;
}

export interface CalendarException {
  exception_date: string; // YYYY-MM-DD
  closed: boolean;
  start_time?: string | null;
  end_time?: string | null;
}

export interface BusyBlock {
  start: string; // ISO
  durationMinutes: number;
}

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** Minutes since midnight for a "HH:MM[:SS]" string. */
export function minutesOfDay(time: string): number {
  const [h = "0", m = "0"] = String(time).split(":");
  return Number(h) * 60 + Number(m);
}

export function toTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Offset (in minutes) of a time zone at a given instant. */
function zoneOffsetMinutes(date: Date, timeZone: string): number {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const parts = Object.fromEntries(dtf.formatToParts(date).map((p) => [p.type, p.value]));
    const asUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour === "24" ? "0" : parts.hour),
      Number(parts.minute),
      Number(parts.second),
    );
    return (asUtc - date.getTime()) / 60000;
  } catch {
    return 0;
  }
}

/** Convert a wall-clock date+time in `timeZone` into a UTC Date. */
export function zonedToUtc(dateISO: string, minutes: number, timeZone: string): Date {
  const [y, m, d] = dateISO.split("-").map(Number);
  const naive = Date.UTC(y!, (m ?? 1) - 1, d ?? 1, 0, minutes, 0);
  const guess = new Date(naive);
  const offset = zoneOffsetMinutes(guess, timeZone);
  return new Date(naive - offset * 60000);
}

/** YYYY-MM-DD for an instant, rendered in `timeZone`. */
export function dateKeyInZone(date: Date, timeZone: string): string {
  try {
    const dtf = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return dtf.format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/** Weekday index (0-6) of a YYYY-MM-DD date string. */
export function weekdayOf(dateISO: string): number {
  const [y, m, d] = dateISO.split("-").map(Number);
  return new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1)).getUTCDay();
}

export function addDays(dateISO: string, days: number): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export interface Slot {
  /** ISO start instant. */
  start: string;
  /** ISO end instant. */
  end: string;
  /** Wall-clock label in the calendar's time zone, e.g. "09:30". */
  label: string;
  date: string;
}

/**
 * Compute open slots for a calendar between two dates (inclusive), honouring
 * weekly availability, date overrides, slot length + buffer, minimum notice
 * and already-booked appointments.
 */
export function computeSlots(params: {
  calendar: CalendarConfig;
  rules: AvailabilityRule[];
  exceptions: CalendarException[];
  busy: BusyBlock[];
  fromDate: string;
  toDate: string;
  now?: Date;
  maxSlots?: number;
}): Slot[] {
  const { calendar, rules, exceptions, busy } = params;
  const tz = calendar.timezone || "UTC";
  const now = params.now ?? new Date();
  const step = Math.max(5, calendar.slot_duration_minutes || 30);
  const buffer = Math.max(0, calendar.buffer_minutes || 0);
  const earliest = new Date(now.getTime() + Math.max(0, calendar.min_notice_minutes || 0) * 60000);
  const horizon = new Date(now.getTime() + Math.max(1, calendar.max_days_ahead || 60) * 86400000);
  const maxSlots = params.maxSlots ?? 500;

  const busyRanges = busy.map((b) => {
    const start = new Date(b.start).getTime();
    return { start, end: start + Math.max(5, b.durationMinutes) * 60000 };
  });

  const exceptionsByDate = new Map(exceptions.map((e) => [e.exception_date, e]));
  const out: Slot[] = [];

  let date = params.fromDate;
  let guard = 0;
  while (date <= params.toDate && guard < 400 && out.length < maxSlots) {
    guard += 1;
    const ex = exceptionsByDate.get(date);
    let windows: Array<{ from: number; to: number }> = [];

    if (ex) {
      if (!ex.closed && ex.start_time && ex.end_time) {
        windows = [{ from: minutesOfDay(ex.start_time), to: minutesOfDay(ex.end_time) }];
      }
    } else {
      const wd = weekdayOf(date);
      windows = rules
        .filter((r) => r.weekday === wd)
        .map((r) => ({ from: minutesOfDay(r.start_time), to: minutesOfDay(r.end_time) }))
        .filter((w) => w.to > w.from);
    }

    for (const w of windows) {
      for (let m = w.from; m + step <= w.to; m += step + buffer) {
        const startDate = zonedToUtc(date, m, tz);
        const endDate = new Date(startDate.getTime() + step * 60000);
        if (startDate < earliest || startDate > horizon) continue;
        const overlaps = busyRanges.some(
          (b) => startDate.getTime() < b.end && endDate.getTime() > b.start,
        );
        if (overlaps) continue;
        out.push({
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          label: toTimeString(m),
          date,
        });
        if (out.length >= maxSlots) break;
      }
      if (out.length >= maxSlots) break;
    }
    date = addDays(date, 1);
  }
  return out;
}

/** Is a specific instant bookable on this calendar? */
export function isSlotAvailable(params: {
  calendar: CalendarConfig;
  rules: AvailabilityRule[];
  exceptions: CalendarException[];
  busy: BusyBlock[];
  when: string;
  now?: Date;
}): boolean {
  const when = new Date(params.when);
  if (Number.isNaN(when.getTime())) return false;
  const date = dateKeyInZone(when, params.calendar.timezone || "UTC");
  const slots = computeSlots({
    calendar: params.calendar,
    rules: params.rules,
    exceptions: params.exceptions,
    busy: params.busy,
    fromDate: date,
    toDate: date,
    now: params.now,
  });
  return slots.some((s) => Math.abs(new Date(s.start).getTime() - when.getTime()) < 60000);
}
