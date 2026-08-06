const QUALIFICATION_STAGES = [
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
  "DISQUALIFIED"
];
const AI_FINAL_STAGE = "BOOKING_REQUEST_CREATED";
const STAGE_LABELS = {
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
  DISQUALIFIED: "Disqualified"
};
const PIPELINE_COLUMNS = [
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
      "PARENT_CONTACT_RECEIVED"
    ]
  },
  { id: "qualified", label: "Qualified", stages: ["QUALIFIED"] },
  { id: "booking", label: "Booking Pending", stages: ["BOOKING_REQUEST_CREATED"] },
  {
    id: "meeting",
    label: "Meeting Scheduled",
    stages: ["BOOKING_CONFIRMATION_CALL", "SPECIALIST_CONSULTATION"]
  },
  { id: "payment", label: "Payment Pending", stages: ["PAYMENT_ACTIVATION"] },
  { id: "onboarding", label: "Onboarding", stages: ["ONBOARDING"] },
  { id: "disqualified", label: "Disqualified", stages: ["DISQUALIFIED"] }
];
function columnForStage(stage) {
  return PIPELINE_COLUMNS.find((c) => c.stages.includes(stage)) ?? PIPELINE_COLUMNS[0];
}
function stageLabel(stage) {
  return STAGE_LABELS[stage] ?? stage;
}
const LEAD_FILTERS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "qualification", label: "Qualification" },
  { id: "qualified", label: "Qualified" },
  { id: "booking", label: "Booking Pending" },
  { id: "meeting", label: "Meeting Scheduled" },
  { id: "payment", label: "Payment Pending" },
  { id: "onboarding", label: "Onboarding" },
  { id: "disqualified", label: "Disqualified" }
];
const APPOINTMENT_STATUSES = ["pending", "confirmed", "completed", "cancelled"];
export {
  AI_FINAL_STAGE as A,
  LEAD_FILTERS as L,
  PIPELINE_COLUMNS as P,
  QUALIFICATION_STAGES as Q,
  APPOINTMENT_STATUSES as a,
  columnForStage as c,
  stageLabel as s
};
