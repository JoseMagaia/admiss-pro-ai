// Cal.com (API v2) integration: availability lookup + real bookings so the AI
// can agree a time with a lead and confirm it without a human in the loop.
// Server-only: the API key never leaves this module.

const CAL_BASE = "https://api.cal.com/v2";

export interface CalcomConfig {
  enabled: boolean;
  apiKey: string;
  eventTypeId: number;
  timezone: string;
  notifyQueueId: string | null;
}

export interface CalcomSlot {
  /** ISO start instant (UTC). */
  start: string;
  /** YYYY-MM-DD in the configured time zone. */
  date: string;
  /** HH:MM wall clock in the configured time zone. */
  label: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Read the space's Cal.com configuration from education_settings. */
export async function loadCalcomConfig(db: any): Promise<CalcomConfig | null> {
  try {
    const { data } = await db
      .from("education_settings")
      .select("calcom_enabled, calcom_api_key, calcom_event_type_id, calcom_timezone, calcom_notify_queue_id")
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    const eventTypeId = Number(data.calcom_event_type_id ?? 0);
    if (!data.calcom_enabled || !data.calcom_api_key || !eventTypeId) return null;
    return {
      enabled: true,
      apiKey: String(data.calcom_api_key),
      eventTypeId,
      timezone: data.calcom_timezone || "UTC",
      notifyQueueId: data.calcom_notify_queue_id ?? null,
    };
  } catch {
    return null;
  }
}

function headers(apiKey: string, version: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "cal-api-version": version,
    "Content-Type": "application/json",
  };
}

function parts(iso: string, timeZone: string): { date: string; label: string } {
  const d = new Date(iso);
  try {
    const date = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
    const label = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
    return { date, label };
  } catch {
    return { date: d.toISOString().slice(0, 10), label: d.toISOString().slice(11, 16) };
  }
}

/** Free slots between two YYYY-MM-DD dates, as reported by Cal.com. */
export async function fetchCalcomSlots(
  cfg: CalcomConfig,
  fromDate: string,
  toDate: string,
  maxSlots = 12,
): Promise<CalcomSlot[]> {
  const url = new URL(`${CAL_BASE}/slots`);
  url.searchParams.set("eventTypeId", String(cfg.eventTypeId));
  url.searchParams.set("start", fromDate);
  url.searchParams.set("end", toDate);
  url.searchParams.set("timeZone", cfg.timezone);

  const res = await fetch(url.toString(), { headers: headers(cfg.apiKey, "2024-09-04") });
  const text = await res.text();
  if (!res.ok) {
    console.error(`Cal.com slots failed [${res.status}]: ${text}`);
    return [];
  }
  let body: any;
  try {
    body = JSON.parse(text);
  } catch {
    return [];
  }
  const data = body?.data ?? {};
  const out: CalcomSlot[] = [];
  const collect = (entry: any) => {
    const start = typeof entry === "string" ? entry : entry?.start;
    if (!start) return;
    const p = parts(start, cfg.timezone);
    out.push({ start: new Date(start).toISOString(), date: p.date, label: p.label });
  };
  if (Array.isArray(data)) data.forEach(collect);
  else for (const value of Object.values(data)) (value as any[])?.forEach?.(collect);

  return out.sort((a, b) => a.start.localeCompare(b.start)).slice(0, maxSlots);
}

/** Is a specific instant still free on the Cal.com event type? */
export async function isCalcomSlotFree(cfg: CalcomConfig, whenIso: string): Promise<boolean> {
  const when = new Date(whenIso);
  if (Number.isNaN(when.getTime())) return false;
  const day = parts(when.toISOString(), cfg.timezone).date;
  const next = new Date(when.getTime() + 86400000).toISOString().slice(0, 10);
  const slots = await fetchCalcomSlots(cfg, day, next, 200);
  return slots.some((s) => Math.abs(new Date(s.start).getTime() - when.getTime()) < 60000);
}

export interface CalcomBooking {
  ok: boolean;
  uid?: string | null;
  status?: string | null;
  meetingUrl?: string | null;
  error?: string;
}

/** Create a real booking on Cal.com for the agreed time. */
export async function createCalcomBooking(
  cfg: CalcomConfig,
  params: { startIso: string; name: string; email?: string | null; phone?: string | null; notes?: string | null },
): Promise<CalcomBooking> {
  const email =
    params.email && /.+@.+\..+/.test(params.email)
      ? params.email
      : `lead-${String(params.phone ?? "unknown").replace(/\D/g, "")}@no-reply.invalid`;

  const res = await fetch(`${CAL_BASE}/bookings`, {
    method: "POST",
    headers: headers(cfg.apiKey, "2024-08-13"),
    body: JSON.stringify({
      start: new Date(params.startIso).toISOString(),
      eventTypeId: cfg.eventTypeId,
      attendee: {
        name: params.name || "Lead",
        email,
        timeZone: cfg.timezone,
        language: "en",
        ...(params.phone ? { phoneNumber: params.phone } : {}),
      },
      ...(params.notes ? { bookingFieldsResponses: { notes: params.notes.slice(0, 500) } } : {}),
      metadata: { source: "ai-agent", phone: params.phone ?? "" },
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`Cal.com booking failed [${res.status}]: ${text}`);
    return { ok: false, error: `Cal.com booking failed [${res.status}]: ${text.slice(0, 300)}` };
  }
  let body: any;
  try {
    body = JSON.parse(text);
  } catch {
    return { ok: false, error: "Cal.com returned an unreadable response." };
  }
  const d = body?.data ?? {};
  return {
    ok: true,
    uid: d.uid ?? null,
    status: (d.status as string) ?? "accepted",
    meetingUrl: d.meetingUrl ?? d.location ?? null,
  };
}

/** Cancel a Cal.com booking (used when a booking is cancelled in-app). */
export async function cancelCalcomBooking(cfg: CalcomConfig, uid: string, reason?: string): Promise<boolean> {
  const res = await fetch(`${CAL_BASE}/bookings/${encodeURIComponent(uid)}/cancel`, {
    method: "POST",
    headers: headers(cfg.apiKey, "2024-08-13"),
    body: JSON.stringify({ cancellationReason: reason ?? "Cancelled in admissions dashboard" }),
  });
  if (!res.ok) console.error(`Cal.com cancel failed [${res.status}]: ${await res.text()}`);
  return res.ok;
}

/** Validate credentials + event type and report back in plain language. */
export async function checkCalcomConnection(
  apiKey: string,
  eventTypeId: number,
  timezone: string,
): Promise<{ ok: boolean; message: string; slotsFound?: number }> {
  try {
    const me = await fetch(`${CAL_BASE}/me`, { headers: headers(apiKey, "2024-08-13") });
    if (!me.ok) {
      const body = await me.text();
      return { ok: false, message: `Cal.com rejected the API key [${me.status}]: ${body.slice(0, 200)}` };
    }
    const today = new Date().toISOString().slice(0, 10);
    const end = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    const slots = await fetchCalcomSlots(
      { enabled: true, apiKey, eventTypeId, timezone, notifyQueueId: null },
      today,
      end,
      50,
    );
    return {
      ok: true,
      slotsFound: slots.length,
      message:
        slots.length > 0
          ? `Connected. ${slots.length} open times found in the next 14 days.`
          : "Connected, but this event type has no open times in the next 14 days.",
    };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
