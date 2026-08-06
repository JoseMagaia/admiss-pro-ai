const DEFAULT_AGENT_ID = "00000000-0000-0000-0000-000000000001";
const TRIGGER_TYPES = [
  { id: "manual", label: "Manual only", help: "Only enrolled by Meeting Outcomes or other manual actions." },
  { id: "pipeline_stage", label: "Pipeline stage", help: "Enroll leads currently in a pipeline segment." },
  {
    id: "time_since_first_message",
    label: "Time since first message",
    help: "Enroll leads whose first message was at least the chosen time ago."
  },
  {
    id: "time_since_last_message",
    label: "Time since last message",
    help: "Enroll leads who have been inactive for at least the chosen time."
  },
  { id: "booking_status", label: "Booking status", help: "Enroll leads with a booking in the chosen status." }
];
const TIME_UNITS = [
  { id: "seconds", label: "Seconds", seconds: 1 },
  { id: "minutes", label: "Minutes", seconds: 60 },
  { id: "hours", label: "Hours", seconds: 3600 },
  { id: "days", label: "Days", seconds: 86400 }
];
const UNIT_SECONDS = {
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400
};
function delayToMs(value, unit) {
  return Math.max(0, Number(value) || 0) * (UNIT_SECONDS[unit] ?? 60) * 1e3;
}
const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"];
function triggerTypeLabel(id) {
  return TRIGGER_TYPES.find((t) => t.id === id)?.label ?? "Manual only";
}
const STEP_ANCHORS = [
  {
    id: "wait",
    label: "Wait (relative delay)",
    help: "Send this step a fixed amount of time after the previous step."
  },
  {
    id: "before_goal",
    label: "Before goal date",
    help: "Count down to the lead's goal date and send this many time units before it."
  },
  {
    id: "before_appointment",
    label: "Before appointment",
    help: "Count down to the lead's appointment and send this many time units before it."
  }
];
export {
  BOOKING_STATUSES,
  DEFAULT_AGENT_ID,
  STEP_ANCHORS,
  TIME_UNITS,
  TRIGGER_TYPES,
  UNIT_SECONDS,
  delayToMs,
  triggerTypeLabel
};
