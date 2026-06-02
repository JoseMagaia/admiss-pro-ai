// Shared, client-safe pipeline constants and helpers.

export const QUALIFICATION_STAGES = [
  "NEW_LEAD",
  "NAME_CAPTURED",
  "STRUCTURAL_CONFIRMATION",
  "COURSE_IDENTIFIED",
  "DESTINATION_IDENTIFIED",
  "ACADEMIC_PROFILE_VERIFIED",
  "DOCUMENT_REQUESTED",
  "FINANCIAL_ALIGNMENT",
  "PARENT_CONTACT_RECEIVED",
  "QUALIFIED",
  "BOOKING_REQUEST_CREATED",
  "BOOKING_CONFIRMATION_CALL",
  "SPECIALIST_CONSULTATION",
  "PAYMENT_ACTIVATION",
  "ONBOARDING",
] as const;

export type QualificationStage = (typeof QUALIFICATION_STAGES)[number];

// The AI agent's responsibility ends when the lead reaches the booking call stage.
export const AI_FINAL_STAGE: QualificationStage = "BOOKING_REQUEST_CREATED";

export const STAGE_LABELS: Record<string, string> = {
  NEW_LEAD: "New Lead",
  NAME_CAPTURED: "Name Captured",
  STRUCTURAL_CONFIRMATION: "Structural Confirmation",
  COURSE_IDENTIFIED: "Course Identified",
  DESTINATION_IDENTIFIED: "Destination Identified",
  ACADEMIC_PROFILE_VERIFIED: "Academic Profile Verified",
  DOCUMENT_REQUESTED: "Document Requested",
  FINANCIAL_ALIGNMENT: "Financial Alignment",
  PARENT_CONTACT_RECEIVED: "Parent Contact Received",
  QUALIFIED: "Qualified",
  BOOKING_REQUEST_CREATED: "Booking Request Created",
  BOOKING_CONFIRMATION_CALL: "Booking Confirmation Call",
  SPECIALIST_CONSULTATION: "Specialist Consultation",
  PAYMENT_ACTIVATION: "Payment Activation",
  ONBOARDING: "Onboarding",
};

export interface PipelineColumn {
  id: string;
  label: string;
  stages: QualificationStage[];
}

// Kanban columns map several granular stages into a single board column.
export const PIPELINE_COLUMNS: PipelineColumn[] = [
  { id: "new", label: "New Lead", stages: ["NEW_LEAD", "NAME_CAPTURED"] },
  {
    id: "qualification",
    label: "Qualification",
    stages: [
      "STRUCTURAL_CONFIRMATION",
      "COURSE_IDENTIFIED",
      "DESTINATION_IDENTIFIED",
      "ACADEMIC_PROFILE_VERIFIED",
      "DOCUMENT_REQUESTED",
      "FINANCIAL_ALIGNMENT",
      "PARENT_CONTACT_RECEIVED",
    ],
  },
  { id: "qualified", label: "Qualified", stages: ["QUALIFIED"] },
  { id: "booking", label: "Booking Pending", stages: ["BOOKING_REQUEST_CREATED"] },
  {
    id: "meeting",
    label: "Meeting Scheduled",
    stages: ["BOOKING_CONFIRMATION_CALL", "SPECIALIST_CONSULTATION"],
  },
  { id: "payment", label: "Payment Pending", stages: ["PAYMENT_ACTIVATION"] },
  { id: "onboarding", label: "Onboarding", stages: ["ONBOARDING"] },
];

export function columnForStage(stage: string): PipelineColumn {
  return (
    PIPELINE_COLUMNS.find((c) => c.stages.includes(stage as QualificationStage)) ??
    PIPELINE_COLUMNS[0]
  );
}

export function stageLabel(stage: string): string {
  return STAGE_LABELS[stage] ?? stage;
}

export const LEAD_FILTERS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "qualification", label: "Qualification" },
  { id: "qualified", label: "Qualified" },
  { id: "booking", label: "Booking Pending" },
  { id: "meeting", label: "Meeting Scheduled" },
  { id: "payment", label: "Payment Pending" },
  { id: "onboarding", label: "Onboarding" },
];

export const APPOINTMENT_STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
