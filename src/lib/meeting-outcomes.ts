// Client-safe constants and helpers for the Meeting Outcomes feature (no secrets).

export interface OutcomeOption {
  value: string;
  label: string;
  /** Lead qualification stage applied when this outcome is recorded. */
  stage: string;
  /** Name of the follow-up workflow this outcome enrolls the lead into. */
  workflow: string;
  /** Weight used to estimate the conversion forecast (0–1). */
  weight: number;
}

export const MEETING_OUTCOMES: OutcomeOption[] = [
  {
    value: "ready_to_pay",
    label: "Ready to Pay",
    stage: "PAYMENT_ACTIVATION",
    workflow: "Deposit Follow-Up Workflow",
    weight: 0.9,
  },
  {
    value: "parent_discussion",
    label: "Parent Discussion Required",
    stage: "PARENT_CONTACT_RECEIVED",
    workflow: "Parent Approval Workflow",
    weight: 0.5,
  },
  {
    value: "financial_delay",
    label: "Financial Delay",
    stage: "FINANCIAL_ALIGNMENT",
    workflow: "Financial Nurture Workflow",
    weight: 0.35,
  },
  {
    value: "future_applicant",
    label: "Future Applicant",
    stage: "NEW_LEAD",
    workflow: "Future Applicant Pipeline",
    weight: 0.15,
  },
  {
    value: "not_qualified",
    label: "Not Qualified",
    stage: "NEW_LEAD",
    workflow: "Archive or Low-Ticket Offer Workflow",
    weight: 0.02,
  },
];

export const COMMITMENT_LEVELS = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

// Commitment multiplies the base outcome weight for the conversion forecast.
export const COMMITMENT_WEIGHTS: Record<string, number> = {
  high: 1,
  medium: 0.7,
  low: 0.4,
};

export const MAIN_OBSTACLES = [
  { value: "needs_parent_approval", label: "Needs Parent Approval" },
  { value: "financial_constraints", label: "Financial Constraints" },
  { value: "comparing_options", label: "Comparing Options" },
  { value: "missing_documents", label: "Missing Documents" },
  { value: "timing_not_right", label: "Timing Not Right" },
  { value: "english_preparation_needed", label: "English Preparation Needed" },
  { value: "other", label: "Other" },
];

export const NEXT_ACTIONS = [
  { value: "send_payment_details", label: "Send Payment Details" },
  { value: "follow_up_student", label: "Follow Up with Student" },
  { value: "follow_up_parent", label: "Follow Up with Parent" },
  { value: "request_documents", label: "Request Documents" },
  { value: "add_future_pipeline", label: "Add to Future Applicant Pipeline" },
  { value: "close_opportunity", label: "Close Opportunity" },
];

export function outcomeLabel(value: string | null | undefined): string {
  return MEETING_OUTCOMES.find((o) => o.value === value)?.label ?? value ?? "—";
}

export function findOutcome(value: string): OutcomeOption | undefined {
  return MEETING_OUTCOMES.find((o) => o.value === value);
}

export function labelFromList(
  list: { value: string; label: string }[],
  value: string | null | undefined,
): string {
  if (!value) return "—";
  return list.find((i) => i.value === value)?.label ?? value;
}
