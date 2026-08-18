import { c as createServerRpc } from "./createServerRpc-Baarst8k.mjs";
import { A as ALL_ROLES } from "./roles-vB9M4HoO.mjs";
import { c as createServerFn } from "./server-BpMAhPfL.mjs";

import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, a as arrayType, n as numberType, e as enumType, b as booleanType } from "../_libs/zod.mjs";

import "../_libs/h3-v2.mjs";
import "../_libs/unenv.mjs";


import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";





import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";

import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
async function spaceCtx() {
  const {
    resolveSpaceContext
  } = await import("./space-context.server-D2TjyZvs.mjs");
  return resolveSpaceContext();
}
async function scopedDb() {
  const {
    supabaseAdmin
  } = await import("./client.server-5D-kk_Jp.mjs");
  const {
    makeScopedClient,
    NO_SPACE
  } = await import("./space-context.server-D2TjyZvs.mjs");
  const ctx = await spaceCtx();
  const sid = ctx && (ctx.isSuperAdmin || ctx.status === "active") ? ctx.spaceId : NO_SPACE;
  return makeScopedClient(supabaseAdmin, sid);
}
async function guard(allowed) {
  const {
    assertRole
  } = await import("./role-guard.server-D4B58koo.mjs");
  return assertRole(allowed);
}
async function currentUser() {
  const {
    getRequestUser
  } = await import("./role-guard.server-D4B58koo.mjs");
  return getRequestUser();
}
async function activeSpaceId() {
  const ctx = await spaceCtx();
  if (!ctx) return null;
  if (ctx.status === "suspended" && !ctx.isSuperAdmin) return null;
  return ctx.spaceId;
}
async function isAuthed() {
  const u = await currentUser();
  return Boolean(u?.role);
}
const ANY_ROLE = ALL_ROLES;
const DEFAULTS = {
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
  google_api_key: null
};
const getCalendarSettings_createServerFn_handler = createServerRpc({
  id: "890113bdd975282eeb9f3e4a6905c86d19c05edf8caac5659c3f00f39d11f1eb",
  name: "getCalendarSettings",
  filename: "src/lib/calendar.functions.ts"
}, (opts) => getCalendarSettings.__executeServer(opts));
const getCalendarSettings = createServerFn({
  method: "GET"
}).handler(getCalendarSettings_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    settings: DEFAULTS
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("calendar_settings").select("*").limit(1).maybeSingle();
  return {
    settings: data ?? DEFAULTS
  };
});
const calendarSchema = objectType({
  id: stringType().uuid().optional(),
  provider: enumType(["manual", "calcom", "google"]),
  slot_duration_minutes: numberType().int().min(10).max(240),
  buffer_minutes: numberType().int().min(0).max(240),
  working_days: arrayType(numberType().int().min(0).max(6)),
  working_start: stringType().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  working_end: stringType().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  timezone: stringType().max(100),
  calcom_username: stringType().max(200).nullable().optional(),
  calcom_event_slug: stringType().max(200).nullable().optional(),
  calcom_api_key: stringType().max(500).nullable().optional(),
  google_calendar_id: stringType().max(300).nullable().optional(),
  google_api_key: stringType().max(500).nullable().optional()
});
const saveCalendarSettings_createServerFn_handler = createServerRpc({
  id: "d180556cfe86edb3c69f25c26ec960ceebaa80c8b8ceb1fcf99001f653874c5c",
  name: "saveCalendarSettings",
  filename: "src/lib/calendar.functions.ts"
}, (opts) => saveCalendarSettings.__executeServer(opts));
const saveCalendarSettings = createServerFn({
  method: "POST"
}).inputValidator((d) => calendarSchema.parse(d)).handler(saveCalendarSettings_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(["super_admin", "admin"]);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    id,
    ...rest
  } = data;
  for (const f of ["calcom_api_key", "google_api_key"]) {
    if (rest[f] === "" || rest[f] === void 0) delete rest[f];
  }
  if (id) {
    const {
      error: error2
    } = await db.from("calendar_settings").update(rest).eq("id", id);
    return {
      ok: !error2,
      error: error2?.message ?? null
    };
  }
  const {
    error
  } = await db.from("calendar_settings").insert(rest);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
function tzOffsetMinutes(dateStr, tz) {
  try {
    const dt = /* @__PURE__ */ new Date(`${dateStr}T12:00:00Z`);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(dt);
    const get = (t) => Number(parts.find((p) => p.type === t)?.value ?? 0);
    const h = get("hour") % 24;
    const local = Date.UTC(get("year"), get("month") - 1, get("day"), h, get("minute"));
    return Math.round((local - dt.getTime()) / 6e4);
  } catch {
    return 0;
  }
}
function parseHM(s) {
  const [h, m] = s.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
function buildSlots(dateStr, s) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const dow = new Date(Date.UTC(y, mo - 1, d, 12)).getUTCDay();
  if (!(s.working_days ?? []).includes(dow)) return [];
  const offset = tzOffsetMinutes(dateStr, s.timezone || "UTC");
  const start = parseHM(s.working_start || "09:00");
  const end = parseHM(s.working_end || "18:00");
  const duration = Math.max(10, s.slot_duration_minutes || 30);
  const buffer = Math.max(0, s.buffer_minutes || 0);
  const dayStartUtc = Date.UTC(y, mo - 1, d, 0, 0) - offset * 6e4;
  const wallStart = dayStartUtc + start * 6e4;
  const wallEnd = dayStartUtc + end * 6e4;
  const slots = [];
  let t = wallStart;
  while (t + duration * 6e4 <= wallEnd) {
    slots.push({
      startMs: t
    });
    t += (duration + buffer) * 6e4;
  }
  return slots;
}
function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}
async function googleBusyRanges(calId, apiKey, fromMs, toMs) {
  try {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?key=${encodeURIComponent(apiKey)}&singleEvents=true&timeMin=${new Date(fromMs).toISOString()}&timeMax=${new Date(toMs).toISOString()}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json"
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? []).filter((i) => i.status !== "cancelled").map((i) => {
      const s = i.start?.dateTime ?? i.start?.date;
      const e = i.end?.dateTime;
      if (!s || !e) return null;
      const sMs = Date.parse(s);
      const eMs = Date.parse(e);
      if (isNaN(sMs) || isNaN(eMs)) return null;
      return {
        start: sMs,
        end: eMs
      };
    }).filter((x) => x !== null);
  } catch {
    return [];
  }
}
const getAvailableSlots_createServerFn_handler = createServerRpc({
  id: "082b1bc725b594e0b1f41713c403ca659cca2b034c60b262f616d3cd1704b1ca",
  name: "getAvailableSlots",
  filename: "src/lib/calendar.functions.ts"
}, (opts) => getAvailableSlots.__executeServer(opts));
const getAvailableSlots = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: stringType().max(100).optional()
}).parse(d)).handler(getAvailableSlots_createServerFn_handler, async ({
  data
}) => {
  if (!await isAuthed()) return {
    slots: [],
    error: "Unauthorized"
  };
  const db = await scopedDb();
  const {
    data: row
  } = await db.from("calendar_settings").select("*").limit(1).maybeSingle();
  const settings = row ?? DEFAULTS;
  const [y, mo, d] = data.date.split("-").map(Number);
  const offset = tzOffsetMinutes(data.date, settings.timezone || "UTC");
  const dayStartUtc = Date.UTC(y, mo - 1, d, 0, 0) - offset * 6e4;
  const dayEndUtc = dayStartUtc + 24 * 60 * 60 * 1e3;
  const duration = Math.max(10, settings.slot_duration_minutes || 30);
  const {
    data: appts
  } = await db.from("appointments").select("appointment_date, status").gte("appointment_date", new Date(dayStartUtc).toISOString()).lt("appointment_date", new Date(dayEndUtc).toISOString());
  const booked = (appts ?? []).filter((a) => a.status !== "cancelled" && a.status !== "canceled").map((a) => {
    const s = Date.parse(a.appointment_date);
    return {
      start: s,
      end: s + duration * 6e4
    };
  });
  let busy = [];
  if (settings.provider === "google" && settings.google_calendar_id && settings.google_api_key) {
    busy = await googleBusyRanges(settings.google_calendar_id, settings.google_api_key, dayStartUtc, dayEndUtc);
  }
  const now = Date.now();
  const slots = buildSlots(data.date, settings).filter((s) => s.startMs + duration * 6e4 > now).filter((s) => {
    const end = s.startMs + duration * 6e4;
    if (busy.some((b) => overlaps(s.startMs, end, b.start, b.end))) return false;
    if (booked.some((b) => overlaps(s.startMs, end, b.start, b.end))) return false;
    return true;
  }).map((s) => ({
    start: new Date(s.startMs).toISOString(),
    end: new Date(s.startMs + duration * 6e4).toISOString()
  }));
  return {
    slots,
    provider: settings.provider,
    calcomLink: settings.provider === "calcom" && settings.calcom_username && settings.calcom_event_slug ? `https://cal.com/${encodeURIComponent(settings.calcom_username)}/${encodeURIComponent(settings.calcom_event_slug)}` : null
  };
});
const createAppointment_createServerFn_handler = createServerRpc({
  id: "dbfa9dc3831d9672adbc3d7efc7c6ad31240429e963d86f927d8c14d8f50f10f",
  name: "createAppointment",
  filename: "src/lib/calendar.functions.ts"
}, (opts) => createAppointment.__executeServer(opts));
const createAppointment = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: stringType().min(3).max(60),
  lead_name: stringType().max(200).nullable().optional(),
  appointment_date: stringType(),
  appointment_type: stringType().max(100).optional(),
  notes: stringType().max(2e3).nullable().optional()
}).parse(d)).handler(createAppointment_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(ANY_ROLE);
  } catch (e) {
    return {
      ok: false,
      error: e.message,
      id: null
    };
  }
  const db = await scopedDb();
  const {
    data: inserted,
    error
  } = await db.from("appointments").insert({
    phone_number: data.phone,
    lead_name: data.lead_name ?? null,
    appointment_date: new Date(data.appointment_date).toISOString(),
    appointment_type: data.appointment_type ?? "booking",
    status: "pending",
    notes: data.notes ?? null
  }).select("id").maybeSingle();
  return {
    ok: !error,
    error: error?.message ?? null,
    id: inserted?.id ?? null
  };
});
const bookAppointmentFromChat_createServerFn_handler = createServerRpc({
  id: "be66105b4f9d539b5df6962e14e5744381d2196f906d25e4dae85cc23e9dec7c",
  name: "bookAppointmentFromChat",
  filename: "src/lib/calendar.functions.ts"
}, (opts) => bookAppointmentFromChat.__executeServer(opts));
const bookAppointmentFromChat = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: stringType().min(3).max(60),
  lead_name: stringType().max(200).nullable().optional(),
  appointment_date: stringType(),
  appointment_type: stringType().max(100).optional(),
  notes: stringType().max(2e3).nullable().optional()
}).parse(d)).handler(bookAppointmentFromChat_createServerFn_handler, async ({
  data
}) => {
  let me;
  try {
    me = await guard(ANY_ROLE);
  } catch (e) {
    return {
      ok: false,
      error: e.message,
      id: null
    };
  }
  const {
    runInSpace
  } = await import("./space-context.server-D2TjyZvs.mjs");
  const sid = await activeSpaceId();
  if (!sid) return {
    ok: false,
    error: "No active space.",
    id: null
  };
  const {
    deliverHumanMessage
  } = await import("./admissions.server-Dhr9qutG.mjs");
  const appointmentDate = new Date(data.appointment_date).toISOString();
  let bookingOk = true;
  let bookingId = null;
  await runInSpace(sid, async () => {
    const db = await scopedDb();
    const {
      data: inserted,
      error
    } = await db.from("appointments").insert({
      phone_number: data.phone,
      lead_name: data.lead_name ?? null,
      appointment_date: appointmentDate,
      appointment_type: data.appointment_type ?? "booking",
      status: "pending",
      notes: data.notes ?? null
    }).select("id").maybeSingle();
    bookingOk = !error;
    bookingId = inserted?.id ?? null;
    if (bookingOk) {
      const {
        data: calRow
      } = await db.from("calendar_settings").select("timezone").limit(1).maybeSingle();
      const tz = (calRow?.timezone ?? "UTC") || "UTC";
      const label = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        dateStyle: "full",
        timeStyle: "short"
      }).format(new Date(appointmentDate));
      const msg = `📅 *Your call is booked!*

Hi ${data.lead_name || "there"}, your consultation is scheduled for:
🗓️ ${label}

We'll reach out to confirm the details. See you then!`;
      await deliverHumanMessage({
        phone: data.phone,
        message: msg,
        workspaceId: null,
        actor: me.email ?? "Agent"
      });
    }
  });
  return {
    ok: bookingOk,
    error: bookingOk ? null : "Failed to book the appointment.",
    id: bookingId
  };
});
const JITSI_DEFAULTS = {
  enabled: true,
  server_url: "https://meet.jit.si",
  display_name: "Admissions",
  room_prefix: "admissions"
};
const getJitsiSettings_createServerFn_handler = createServerRpc({
  id: "d1d5f2c5a83c1797b5d6450eb2782a55e15dccf83d7d0af49188c32120144207",
  name: "getJitsiSettings",
  filename: "src/lib/calendar.functions.ts"
}, (opts) => getJitsiSettings.__executeServer(opts));
const getJitsiSettings = createServerFn({
  method: "GET"
}).handler(getJitsiSettings_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    settings: JITSI_DEFAULTS
  };
  const db = await scopedDb();
  const {
    data
  } = await db.from("jitsi_settings").select("*").limit(1).maybeSingle();
  return {
    settings: data ?? JITSI_DEFAULTS
  };
});
const jitsiSchema = objectType({
  id: stringType().uuid().optional(),
  enabled: booleanType(),
  server_url: stringType().min(3).max(300),
  display_name: stringType().min(1).max(100),
  room_prefix: stringType().min(1).max(60).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only")
});
const saveJitsiSettings_createServerFn_handler = createServerRpc({
  id: "4fdde4e2c0e159c7181898eec5b1f380356e3f6fcc0bd80bae3d3e8f90aceb62",
  name: "saveJitsiSettings",
  filename: "src/lib/calendar.functions.ts"
}, (opts) => saveJitsiSettings.__executeServer(opts));
const saveJitsiSettings = createServerFn({
  method: "POST"
}).inputValidator((d) => jitsiSchema.parse(d)).handler(saveJitsiSettings_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(["super_admin"]);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    id,
    ...rest
  } = data;
  const cleanServer = String(rest.server_url ?? "").replace(/\/+$/, "");
  const payload = {
    ...rest,
    server_url: cleanServer
  };
  if (id) {
    const {
      error: error2
    } = await db.from("jitsi_settings").update(payload).eq("id", id);
    return {
      ok: !error2,
      error: error2?.message ?? null
    };
  }
  const {
    error
  } = await db.from("jitsi_settings").insert(payload);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
export {
  bookAppointmentFromChat_createServerFn_handler,
  createAppointment_createServerFn_handler,
  getAvailableSlots_createServerFn_handler,
  getCalendarSettings_createServerFn_handler,
  getJitsiSettings_createServerFn_handler,
  saveCalendarSettings_createServerFn_handler,
  saveJitsiSettings_createServerFn_handler
};
