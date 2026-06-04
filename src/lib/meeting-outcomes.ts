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

/* ------------------------- WORKFLOW TEMPLATES ------------------------- */
// Editable, pre-generated follow-up message sequences for each meeting outcome.
// Messages support {{lead_name}}, {{course_interest}}, {{country_interest}} and
// {{phone_number}} placeholders, filled from the lead record when sent.

export interface TemplateStep {
  content: string;
  delayValue: number;
  delayUnit: "seconds" | "minutes" | "hours" | "days";
}

export interface OutcomeWorkflowTemplate {
  /** Workflow name — must match OutcomeOption.workflow exactly. */
  name: string;
  description: string;
  steps: TemplateStep[];
}

export const MEETING_OUTCOME_TEMPLATES: OutcomeWorkflowTemplate[] = [
  {
    name: "Deposit Follow-Up Workflow",
    description: "For leads ready to pay — secure the deposit and confirm the place.",
    steps: [
      {
        content:
          "Hi {{lead_name}}! 🎉 It was great speaking with you about {{course_interest}}. To secure your place, the next step is the enrollment deposit. I'll send the payment details now — let me know once you're ready and I'll guide you through it.",
        delayValue: 0,
        delayUnit: "minutes",
      },
      {
        content:
          "Hi {{lead_name}}, just checking in 😊 Have you had a chance to review the deposit details for {{course_interest}}? Places fill quickly, so I'd love to lock yours in. Happy to answer any questions!",
        delayValue: 1,
        delayUnit: "days",
      },
      {
        content:
          "Hi {{lead_name}}, a quick final reminder about securing your spot for {{course_interest}} in {{country_interest}}. Once the deposit is in, we'll move straight to onboarding. Shall I resend the payment link?",
        delayValue: 3,
        delayUnit: "days",
      },
    ],
  },
  {
    name: "Parent Approval Workflow",
    description: "For leads who need a parent/guardian discussion before committing.",
    steps: [
      {
        content:
          "Hi {{lead_name}}! Thanks for the great conversation about {{course_interest}}. I completely understand you'd like to discuss this with your parents first. I can prepare a short summary of the program, costs and outcomes you can share with them — would that help?",
        delayValue: 0,
        delayUnit: "minutes",
      },
      {
        content:
          "Hi {{lead_name}}, have you had the chance to talk things over with your family about {{course_interest}}? I'm happy to join a quick call with your parents to answer their questions directly.",
        delayValue: 2,
        delayUnit: "days",
      },
      {
        content:
          "Hi {{lead_name}}, just following up — is there any information your parents still need about studying {{course_interest}} in {{country_interest}}? I'm here to help make the decision easier for everyone.",
        delayValue: 4,
        delayUnit: "days",
      },
    ],
  },
  {
    name: "Financial Nurture Workflow",
    description: "For leads delayed by financing — nurture with options over time.",
    steps: [
      {
        content:
          "Hi {{lead_name}}! Thanks for being open about the financial side of {{course_interest}}. We have scholarship options and flexible payment plans that many students use — would you like me to put together the options that fit your situation?",
        delayValue: 0,
        delayUnit: "minutes",
      },
      {
        content:
          "Hi {{lead_name}}, I wanted to share that funding for {{course_interest}} doesn't have to be paid all at once. Instalment plans and partial scholarships are available. Want me to walk you through them?",
        delayValue: 3,
        delayUnit: "days",
      },
      {
        content:
          "Hi {{lead_name}}, checking in about your plans for {{country_interest}}. If timing is the main thing, we can map out a payment schedule that works for you so you don't miss the intake. Shall we have a quick chat?",
        delayValue: 7,
        delayUnit: "days",
      },
    ],
  },
  {
    name: "Future Applicant Pipeline",
    description: "For leads applying in a future intake — stay top of mind.",
    steps: [
      {
        content:
          "Hi {{lead_name}}! Thanks for your interest in {{course_interest}}. Since you're planning for a future intake, I'll keep you posted on deadlines, scholarships and openings so you're ready when the time comes. 😊",
        delayValue: 0,
        delayUnit: "minutes",
      },
      {
        content:
          "Hi {{lead_name}}, a friendly check-in about your plans to study {{course_interest}} in {{country_interest}}. Anything changed on your side? I'm here whenever you're ready to take the next step.",
        delayValue: 14,
        delayUnit: "days",
      },
      {
        content:
          "Hi {{lead_name}}, the next intake for {{course_interest}} is approaching. Would you like me to reserve a spot to discuss your application early? Early applicants get priority on scholarships.",
        delayValue: 30,
        delayUnit: "days",
      },
    ],
  },
  {
    name: "Archive or Low-Ticket Offer Workflow",
    description: "For leads not currently qualified — offer a lighter option, then archive.",
    steps: [
      {
        content:
          "Hi {{lead_name}}, thank you for taking the time to chat about {{course_interest}}. While the full program may not be the right fit right now, we have shorter preparatory and language options that could be a great starting point. Want to hear about them?",
        delayValue: 0,
        delayUnit: "minutes",
      },
      {
        content:
          "Hi {{lead_name}}, no pressure at all — if a lighter program or future intake for {{country_interest}} ever interests you, just reply here and I'll be glad to help. Wishing you the best! 🙏",
        delayValue: 7,
        delayUnit: "days",
      },
    ],
  },
];

export function templateForWorkflow(name: string): OutcomeWorkflowTemplate | undefined {
  return MEETING_OUTCOME_TEMPLATES.find(
    (t) => t.name.trim().toLowerCase() === name.trim().toLowerCase(),
  );
}

