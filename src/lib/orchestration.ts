// Client-safe constants & helpers for the orchestration workflow engine.
// No secrets, safe to import from both browser components and server code.

// Sentinel id for the built-in default qualification agent. It is a valid UUID
// so it passes uuid validation and can be stored in workflows.agent_id, but it
// never exists as a row in responder_agents — the engine special-cases it to use
// the qualification agent configured in AI Settings.
export const DEFAULT_AGENT_ID = "00000000-0000-0000-0000-000000000001";

export const TRIGGER_TYPES = [
  { id: "manual", label: "Manual only", help: "Only enrolled by Meeting Outcomes or other manual actions." },
  { id: "pipeline_stage", label: "Pipeline stage", help: "Enroll leads currently in a pipeline segment." },
  {
    id: "time_since_first_message",
    label: "Time since first message",
    help: "Enroll leads whose first message was at least the chosen time ago.",
  },
  {
    id: "time_since_last_message",
    label: "Time since last message",
    help: "Enroll leads who have been inactive for at least the chosen time.",
  },
  { id: "booking_status", label: "Booking status", help: "Enroll leads with a booking in the chosen status." },
] as const;

export type TriggerType = (typeof TRIGGER_TYPES)[number]["id"];

export const TIME_UNITS = [
  { id: "seconds", label: "Seconds", seconds: 1 },
  { id: "minutes", label: "Minutes", seconds: 60 },
  { id: "hours", label: "Hours", seconds: 3600 },
  { id: "days", label: "Days", seconds: 86400 },
] as const;

export type TimeUnit = (typeof TIME_UNITS)[number]["id"];

export const UNIT_SECONDS: Record<string, number> = {
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400,
};

export function delayToMs(value: number, unit: string): number {
  return Math.max(0, Number(value) || 0) * (UNIT_SECONDS[unit] ?? 60) * 1000;
}

export const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface TriggerConfig {
  segment?: string;
  amount?: number;
  unit?: TimeUnit;
  status?: BookingStatus;
}

export function triggerTypeLabel(id: string | null | undefined): string {
  return TRIGGER_TYPES.find((t) => t.id === id)?.label ?? "Manual only";
}
