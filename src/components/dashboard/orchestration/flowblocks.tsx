import type { LucideIcon } from "lucide-react";
import {
  Zap,
  MessageSquareText,
  Image as ImageIcon,
  ListChecks,
  Timer,
  GitBranch,
  Variable,
  Bot,
  Globe,
  CalendarCheck,
  UserRound,
  Flag,
  Repeat,
} from "lucide-react";

export type FlowBlockType =
  | "trigger"
  | "text"
  | "image"
  | "buttons"
  | "wait"
  | "condition"
  | "setvar"
  | "ai"
  | "http"
  | "booking"
  | "handoff"
  | "end"
  | "redirect";

export type FlowCategory = "Start" | "Messages" | "Logic" | "Integrations";

export interface FlowBlockDef {
  type: FlowBlockType;
  label: string;
  category: FlowCategory;
  color: string; // tailwind text + bg tints used on cards/edges
  icon: LucideIcon;
  description: string;
  defaultData: () => Record<string, unknown>;
}

const waitBase = { anchor: "wait", delayValue: 1, delayUnit: "days", offsetValue: 1, offsetUnit: "days" };

/** crypto.randomUUID needs a secure context; fall back for http previews. */
function rid(): string {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `id_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export const FLOW_BLOCKS: FlowBlockDef[] = [
  {
    type: "trigger",
    label: "Trigger",
    category: "Start",
    color: "amber",
    icon: Zap,
    description: "Entry point — every flow starts here.",
    defaultData: () => ({ label: "Trigger" }),
  },
  {
    type: "text",
    label: "Text message",
    category: "Messages",
    color: "indigo",
    icon: MessageSquareText,
    description: "Send a WhatsApp text message with variables.",
    defaultData: () => ({ ...waitBase, content: "", index: 0 }),
  },
  {
    type: "image",
    label: "Image message",
    category: "Messages",
    color: "sky",
    icon: ImageIcon,
    description: "Send an image (URL) with an optional caption.",
    defaultData: () => ({ ...waitBase, imageUrl: "", caption: "" }),
  },
  {
    type: "buttons",
    label: "Buttons / quick replies",
    category: "Messages",
    color: "violet",
    icon: ListChecks,
    description: "Message with tappable quick-reply options.",
    defaultData: () => ({ ...waitBase, message: "", options: [{ id: rid(), label: "Yes" }, { id: rid(), label: "No" }] }),
  },
  {
    type: "wait",
    label: "Wait",
    category: "Logic",
    color: "slate",
    icon: Timer,
    description: "Pause the flow before the next block.",
    defaultData: () => ({ delayValue: 1, delayUnit: "days" }),
  },
  {
    type: "condition",
    label: "Condition",
    category: "Logic",
    color: "orange",
    icon: GitBranch,
    description: "Branch the flow on a lead field or variable.",
    defaultData: () => ({
      field: "qualification_status",
      operator: "equals",
      value: "QUALIFIED",
      trueLabel: "Yes",
      falseLabel: "No",
    }),
  },
  {
    type: "setvar",
    label: "Set variable",
    category: "Logic",
    color: "teal",
    icon: Variable,
    description: "Store a value in the conversation context.",
    defaultData: () => ({ varName: "", varValue: "" }),
  },
  {
    type: "end",
    label: "End",
    category: "Logic",
    color: "rose",
    icon: Flag,
    description: "Stop the flow for this lead.",
    defaultData: () => ({ note: "Flow complete" }),
  },
  {
    type: "redirect",
    label: "Redirect",
    category: "Logic",
    color: "fuchsia",
    icon: Repeat,
    description: "Enroll the lead into another workflow.",
    defaultData: () => ({ targetWorkflowId: "", targetWorkflowName: "" }),
  },
  {
    type: "ai",
    label: "AI reply",
    category: "Integrations",
    color: "emerald",
    icon: Bot,
    description: "Generate & send a message with a responder agent.",
    defaultData: () => ({ ...waitBase, agentId: "", instruction: "" }),
  },
  {
    type: "http",
    label: "HTTP request",
    category: "Integrations",
    color: "cyan",
    icon: Globe,
    description: "Call a webhook / API and capture the result.",
    defaultData: () => ({ actionId: "", actionName: "" }),
  },
  {
    type: "booking",
    label: "Book appointment",
    category: "Integrations",
    color: "yellow",
    icon: CalendarCheck,
    description: "Create an appointment for the lead.",
    defaultData: () => ({ appointmentType: "booking", daysAhead: 3, notes: "" }),
  },
  {
    type: "handoff",
    label: "Handoff to agent",
    category: "Integrations",
    color: "blue",
    icon: UserRound,
    description: "Pause the AI and hand the chat to a human.",
    defaultData: () => ({ note: "" }),
  },
];

export const FLOW_BLOCK_MAP: Record<string, FlowBlockDef> = Object.fromEntries(
  FLOW_BLOCKS.map((b) => [b.type, b]),
);

export const FLOW_CATEGORIES: FlowCategory[] = ["Start", "Messages", "Logic", "Integrations"];

/** Tailwind class map for block card accents (border/text tints). */
export const BLOCK_STYLE: Record<string, { ring: string; chip: string; text: string; edge: string }> = {
  amber: { ring: "border-amber-400/70", chip: "bg-amber-400/15 text-amber-600 dark:text-amber-400", text: "text-amber-600 dark:text-amber-400", edge: "#f59e0b" },
  indigo: { ring: "border-indigo-400/70", chip: "bg-indigo-400/15 text-indigo-600 dark:text-indigo-400", text: "text-indigo-600 dark:text-indigo-400", edge: "#6366f1" },
  sky: { ring: "border-sky-400/70", chip: "bg-sky-400/15 text-sky-600 dark:text-sky-400", text: "text-sky-600 dark:text-sky-400", edge: "#0ea5e9" },
  violet: { ring: "border-violet-400/70", chip: "bg-violet-400/15 text-violet-600 dark:text-violet-400", text: "text-violet-600 dark:text-violet-400", edge: "#8b5cf6" },
  slate: { ring: "border-slate-400/70", chip: "bg-slate-400/15 text-slate-600 dark:text-slate-400", text: "text-slate-600 dark:text-slate-400", edge: "#94a3b8" },
  orange: { ring: "border-orange-400/70", chip: "bg-orange-400/15 text-orange-600 dark:text-orange-400", text: "text-orange-600 dark:text-orange-400", edge: "#f97316" },
  teal: { ring: "border-teal-400/70", chip: "bg-teal-400/15 text-teal-600 dark:text-teal-400", text: "text-teal-600 dark:text-teal-400", edge: "#14b8a6" },
  rose: { ring: "border-rose-400/70", chip: "bg-rose-400/15 text-rose-600 dark:text-rose-400", text: "text-rose-600 dark:text-rose-400", edge: "#f43f5e" },
  fuchsia: { ring: "border-fuchsia-400/70", chip: "bg-fuchsia-400/15 text-fuchsia-600 dark:text-fuchsia-400", text: "text-fuchsia-600 dark:text-fuchsia-400", edge: "#d946ef" },
  emerald: { ring: "border-emerald-400/70", chip: "bg-emerald-400/15 text-emerald-600 dark:text-emerald-400", text: "text-emerald-600 dark:text-emerald-400", edge: "#10b981" },
  cyan: { ring: "border-cyan-400/70", chip: "bg-cyan-400/15 text-cyan-600 dark:text-cyan-400", text: "text-cyan-600 dark:text-cyan-400", edge: "#06b6d4" },
  yellow: { ring: "border-yellow-400/70", chip: "bg-yellow-400/15 text-yellow-600 dark:text-yellow-400", text: "text-yellow-600 dark:text-yellow-400", edge: "#eab308" },
  blue: { ring: "border-blue-400/70", chip: "bg-blue-400/15 text-blue-600 dark:text-blue-400", text: "text-blue-600 dark:text-blue-400", edge: "#3b82f6" },
};

export function blockStyle(type: string): { ring: string; chip: string; text: string; edge: string } {
  const def = FLOW_BLOCK_MAP[type];
  return BLOCK_STYLE[def?.color ?? "slate"] ?? BLOCK_STYLE.slate;
}
