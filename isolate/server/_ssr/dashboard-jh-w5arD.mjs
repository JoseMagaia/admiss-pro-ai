import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery, a as useQueryClient, b as useMutation, c as useInfiniteQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useBranding, a as useServerFn, g as getDashboardStats, l as listLeads, b as listConversations$1, t as toggleHumanTakeover, d as deleteLead, c as listWorkflowStates, p as pauseLeadWorkflow, I as Input, e as listMessageThreads, f as listConversationMessages, h as listScheduledMessages, s as sendHumanMessage, i as scheduleMessage, j as cancelScheduledMessage, k as listWorkspaces, m as startConversation, n as listContacts, o as listAppointments, q as updateAppointmentStatus, r as listActiveWorkflows, v as triggerLeadWorkflow, w as updateLeadStage, x as listMeetingOutcomes, y as getMeetingOutcomeStats, z as saveMeetingOutcome, A as updateMeetingOutcome, B as deleteMeetingOutcome, C as processDueWorkflows, L as Label, E as listLeadWorkflows, F as assignLeadWorkflow, G as removeLeadWorkflow, H as listWorkflows, J as deleteWorkflow, K as listResponderAgents, M as listAiVariables, N as deleteResponderAgent, O as getAiConfig, P as saveAiProvider, Q as testAiProvider, R as saveAiConfig, S as listPromptVersions, T as upsertAiVariable, U as deleteAiVariable, V as testWorkspaceConnection, W as deleteWorkspace, X as listHttpActions, Y as upsertHttpAction, Z as deleteHttpAction, _ as testPrompt, $ as upsertWorkflow, a0 as upsertResponderAgent, a1 as getSettings, a2 as updateSettings, a3 as listAiProviders, a4 as saveAiProviderPool, a5 as deleteAiProvider, a6 as reorderAiProviders, a7 as setFallbackEnabled, a8 as testAiProviderPool, a9 as upsertWorkspace, aa as setEvolutionWebhook, ab as listResponderAgentVariables, ac as upsertResponderAgentVariable, ad as deleteResponderAgentVariable } from "./useBranding-BPg4hKJU.mjs";
import { s as supabase, g as getMyProfile, c as createSsrRpc, l as listUsers, b as createUser, u as updateUserRole, d as deleteUser, e as setUserPermission } from "./client-Cq9-7bp9.mjs";
import { c as createServerFn } from "./server-BpMAhPfL.mjs";
import { c as cn, B as Button, b as buttonVariants } from "./button-BXrfXN_b.mjs";
import { t as toast, T as Toaster$1 } from "../_libs/sonner.mjs";
import { R as Root2, V as Value, T as Trigger$1, I as Icon, P as Portal, C as Content2, a as Viewport, b as Item, c as ItemIndicator, d as ItemText, S as ScrollUpButton, e as ScrollDownButton, L as Label$1, f as Separator } from "../_libs/radix-ui__react-select.mjs";
import { R as Root2$1, P as Portal2, C as Content2$1, T as Title2, D as Description2, a as Cancel, A as Action, b as Trigger2, O as Overlay2 } from "../_libs/radix-ui__react-alert-dialog.mjs";
import { c as columnForStage, L as LEAD_FILTERS, a as APPOINTMENT_STATUSES, s as stageLabel$1, Q as QUALIFICATION_STAGES, P as PIPELINE_COLUMNS } from "./pipeline-BHDikEyF.mjs";
import { R as Root$1, T as Thumb } from "../_libs/radix-ui__react-switch.mjs";
import { R as Root, P as Portal$1, C as Content, a as Close, T as Title, b as Trigger$2, O as Overlay, D as Description } from "../_libs/radix-ui__react-dialog.mjs";
import { R as Root2$2, T as Trigger, P as Portal$2, C as Content2$2 } from "../_libs/radix-ui__react-popover.mjs";
import { triggerTypeLabel, TRIGGER_TYPES, TIME_UNITS, BOOKING_STATUSES, STEP_ANCHORS } from "./orchestration-lZ10Rxtv.mjs";
import { u as useNodesState, a as useEdgesState, b as addEdge, R as ReactFlowProvider, c as useReactFlow, i as index, B as Background, C as Controls, H as Handle } from "../_libs/xyflow__react.mjs";
import { MEETING_OUTCOMES, COMMITMENT_LEVELS, MAIN_OBSTACLES, NEXT_ACTIONS, outcomeLabel, labelFromList, MEETING_OUTCOME_TEMPLATES } from "./meeting-outcomes-C7fm1Xor.mjs";
import { _ as _e } from "../_libs/cmdk.mjs";
import { R as Root$2, T as Track, a as Range, b as Thumb$1 } from "../_libs/radix-ui__react-slider.mjs";
import { c as canAccessAdvanced, b as canAccessTab, R as ROLE_LABELS, d as canManageCallCampaigns, e as ADVANCED_SECTIONS, f as canAccessSettingsSection, A as ALL_ROLES, a as ADVANCED_PERMISSION } from "./roles-vB9M4HoO.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { C as Checkbox$1, a as CheckboxIndicator } from "../_libs/radix-ui__react-checkbox.mjs";
import { A as ACTIVE_SPACE_KEY } from "./space-attacher-BSpWLH7Y.mjs";

import "../_libs/seroval.mjs";
import { L as LoaderCircle, M as MessageSquare, d as PhoneCall, C as Calendar$1, S as SquareKanban, e as ClipboardCheck, W as Workflow, f as Gauge, g as Users, h as Contact, i as Settings, j as LogOut, c as ArrowLeft, k as Boxes, G as GraduationCap, l as UserCheck, m as UserX, n as Search, o as ArrowUpDown, p as UserCog, B as Bot, q as Play, r as Pause, T as Trash2, s as Plus, t as Clock, X, u as User, v as CalendarPlus, w as Send, x as PhoneIncoming, y as PhoneOff, P as Phone, z as MicOff, D as Mic, V as Video, Z as Zap, H as History, E as Megaphone, I as Download, J as List, K as CalendarDays, N as Pencil, O as Check, Q as ChevronUp, R as ChevronDown, Y as TrendingUp, _ as Coins, $ as DollarSign, a0 as GripVertical, a1 as CreditCard, a2 as Wallet, a3 as Clock3, a4 as ChevronsUpDown, a5 as ChartColumn, a6 as Package, a7 as Building2, a8 as BookOpen, a9 as Cpu, aa as Variable, ab as Plug, ac as Network, ad as Webhook, ae as FlaskConical, af as Target, ag as Sparkles, ah as Link2, ai as CalendarCheck, aj as Delete, ak as VideoOff, al as Copy, am as ExternalLink, an as UserRound, ao as Square, ap as SkipForward, aq as PhoneOutgoing, F as FileText, ar as RotateCcw, as as ListPlus, at as ChevronLeft, au as ChevronRight, av as Power, aw as Star, ax as FileDown, ay as WandSparkles, az as Settings2, aA as Save, aB as Maximize2, aC as PlugZap, aD as CalendarClock, aE as CalendarCheck2, U as UserPlus, aF as Undo2, aG as Redo2, aH as MessageSquareText, aI as Image$1, aJ as ListChecks, aK as Timer, aL as GitBranch, aM as Flag, aN as Repeat, a as Globe, aO as KeyRound, aP as Upload, aQ as Layers, aR as ShieldCheck, aS as ArrowUp, aT as ArrowDown, aU as MessageCircle } from "../_libs/lucide-react.mjs";
import { f as format } from "../_libs/date-fns.mjs";
import { g as getDefaultClassNames, D as DayPicker } from "../_libs/react-day-picker.mjs";
import { R as ResponsiveContainer, L as LineChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, a as Line, B as BarChart, b as Bar } from "../_libs/recharts.mjs";
import { P as Position } from "../_libs/xyflow__system.mjs";
import { o as objectType, n as numberType, s as stringType, a as arrayType, e as enumType, b as booleanType, r as recordType, u as unknownType } from "../_libs/zod.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/unenv.mjs";


import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/tslib.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/classcat.mjs";
import "../_libs/zustand.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/date-fns__tz.mjs";
import "../_libs/lodash.mjs";
import "../_libs/react-smooth.mjs";
import "../_libs/prop-types.mjs";
import "../_libs/fast-equals.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/react-is.mjs";
import "../_libs/d3-shape.mjs";
import "../_libs/d3-path.mjs";
import "../_libs/victory-vendor.mjs";
import "../_libs/d3-scale.mjs";
import "../_libs/internmap.mjs";
import "../_libs/d3-array.mjs";
import "../_libs/d3-time-format.mjs";
import "../_libs/d3-time.mjs";
import "../_libs/d3-interpolate.mjs";
import "../_libs/d3-color.mjs";
import "../_libs/d3-format.mjs";
import "../_libs/recharts-scale.mjs";
import "../_libs/decimal.js-light.mjs";
import "../_libs/eventemitter3.mjs";
import "../_libs/d3-zoom.mjs";
import "../_libs/d3-transition.mjs";
import "../_libs/d3-dispatch.mjs";
import "../_libs/d3-timer.mjs";
import "../_libs/d3-selection.mjs";
import "../_libs/d3-ease.mjs";
import "../_libs/d3-drag.mjs";
const flagsSchema = recordType(stringType(), booleanType());
const limitsSchema = recordType(stringType(), numberType().int().min(0).max(1e8));
const getActiveSpaceContext = createServerFn({
  method: "GET"
}).handler(createSsrRpc("2379bcb864ac545f5543202ff7dd41c4ffbfef287df3e13470a3dff21d30d38a"));
const listMySpaces = createServerFn({
  method: "GET"
}).handler(createSsrRpc("456600ce273908abe399bb1e4efdc565be912b03f1d085be9e7972dc41cf83ba"));
const listSpaces = createServerFn({
  method: "GET"
}).handler(createSsrRpc("03207fad1b655f4d48a6a0cf029d69fc93efdd09f8b99ed843337ff8186bf106"));
const createSpace = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  name: stringType().min(1).max(120),
  plan: stringType().max(60).optional(),
  feature_flags: flagsSchema.optional(),
  limits: limitsSchema.optional()
}).parse(d)).handler(createSsrRpc("71fc3984673541d77fcd20268f2625d6fe5a528fa6f2ed52ccc6bf9be7e35795"));
const updateSpace = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid(),
  name: stringType().min(1).max(120).optional(),
  plan: stringType().max(60).optional(),
  feature_flags: flagsSchema.optional(),
  limits: limitsSchema.optional()
}).parse(d)).handler(createSsrRpc("3b460756f197702ca387a55029416d84e1e7e88356e07e9def88028fa0d145ff"));
const setSpaceStatus = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["active", "suspended"])
}).parse(d)).handler(createSsrRpc("6331eb5d595ffe887645e3ab92784a4a1d107fa3ab58d931f3fb9241d7d5981b"));
const deleteSpace = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("aca9ec34dbf7c5de681f8d28b5daf35d2aa913140b29de1df684427e7f0c26bd"));
const listSpaceMembers = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  spaceId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("17f93081cdfac3bbe96880a0167306c5d2d35618a0b733bd02d3b73eb0cae7fc"));
const addSpaceMember = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  spaceId: stringType().uuid(),
  userId: stringType().uuid(),
  role: enumType(["admin", "agent"])
}).parse(d)).handler(createSsrRpc("df594e1e74b13e1db50b610c2aa3910a33356e58afbb3d53e8a90feeca1478a9"));
const removeSpaceMember = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("bbdea50d45903d05e85d1d496db6fd3c19b4f39c1942119f89b147f605b009c6"));
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const Select = Root2;
const SelectValue = Value;
const SelectTrigger = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Trigger$1,
  {
    ref,
    className: cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = Trigger$1.displayName;
const SelectScrollUpButton = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  ScrollUpButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = ScrollUpButton.displayName;
const SelectScrollDownButton = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  ScrollDownButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = ScrollDownButton.displayName;
const SelectContent = reactExports.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Content2,
  {
    ref,
    className: cn(
      "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = Content2.displayName;
const SelectLabel = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Label$1,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = Label$1.displayName;
const SelectItem = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ItemText, { children })
    ]
  }
));
SelectItem.displayName = Item.displayName;
const SelectSeparator = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
SelectSeparator.displayName = Separator.displayName;
const AlertDialog = Root2$1;
const AlertDialogTrigger = Trigger2;
const AlertDialogPortal = Portal2;
const AlertDialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay2,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
AlertDialogOverlay.displayName = Overlay2.displayName;
const AlertDialogContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    Content2$1,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = Content2$1.displayName;
const AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title2,
  {
    ref,
    className: cn("text-lg font-semibold", className),
    ...props
  }
));
AlertDialogTitle.displayName = Title2.displayName;
const AlertDialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description2,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
AlertDialogDescription.displayName = Description2.displayName;
const AlertDialogAction = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Action, { ref, className: cn(buttonVariants(), className), ...props }));
AlertDialogAction.displayName = Action.displayName;
const AlertDialogCancel = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Cancel,
  {
    ref,
    className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
    ...props
  }
));
AlertDialogCancel.displayName = Cancel.displayName;
const COLUMN_STYLES = {
  new: "bg-muted text-muted-foreground",
  qualification: "bg-primary/10 text-primary",
  qualified: "bg-success/15 text-success",
  booking: "bg-accent/20 text-accent-foreground",
  meeting: "bg-chart-4/15 text-primary",
  payment: "bg-warning/20 text-warning-foreground",
  onboarding: "bg-success/20 text-success",
  disqualified: "bg-destructive/15 text-destructive"
};
function StageBadge({ stage, className }) {
  const col = columnForStage(stage);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        COLUMN_STYLES[col.id] ?? "bg-muted text-muted-foreground",
        className
      ),
      children: stageLabel$1(stage)
    }
  );
}
const STATUS_STYLES$2 = {
  pending: "bg-warning/20 text-warning-foreground",
  confirmed: "bg-primary/10 text-primary",
  completed: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
  open: "bg-success/15 text-success"
};
function StatusBadge({ status, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        STATUS_STYLES$2[status] ?? "bg-muted text-muted-foreground",
        className
      ),
      children: status
    }
  );
}
const EMPTY$5 = {
  authenticated: false,
  role: null,
  email: null,
  full_name: null,
  userId: null,
  permissions: []
};
function useAuth() {
  const [loading, setLoading] = reactExports.useState(true);
  const [profile, setProfile] = reactExports.useState(EMPTY$5);
  const refresh = reactExports.useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setProfile(EMPTY$5);
      setLoading(false);
      return;
    }
    try {
      const p = await getMyProfile();
      setProfile(p);
    } catch {
      setProfile(EMPTY$5);
    }
    setLoading(false);
  }, []);
  reactExports.useEffect(() => {
    let active = true;
    refresh();
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => {
      if (active) refresh();
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refresh]);
  const signOut = reactExports.useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(EMPTY$5);
  }, []);
  return { loading, profile, refresh, signOut };
}
const DashboardNavContext = reactExports.createContext(null);
const DashboardNavProvider = DashboardNavContext.Provider;
function useDashboardNav() {
  const ctx = reactExports.useContext(DashboardNavContext);
  return ctx ?? { openConversation: () => {
  } };
}
const TIME_FILTERS$2 = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" }
];
const SORTS$2 = [
  { id: "recent", label: "Most recent" },
  { id: "oldest", label: "Oldest" },
  { id: "name_asc", label: "Name A–Z" },
  { id: "stage", label: "Stage" }
];
function withinRange$2(iso, range) {
  if (range === "all") return true;
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (isNaN(t)) return false;
  const now = Date.now();
  const day = 864e5;
  if (range === "today") return new Date(iso).toDateString() === (/* @__PURE__ */ new Date()).toDateString();
  if (range === "7d") return now - t <= 7 * day;
  if (range === "30d") return now - t <= 30 * day;
  return true;
}
function LeadsTab() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const { openConversation } = useDashboardNav();
  const canDelete = profile.role === "super_admin" || profile.role === "admin";
  const canPause = profile.role === "super_admin" || profile.role === "admin";
  const leadsFn = useServerFn(listLeads);
  const convFn = useServerFn(listConversations$1);
  const takeoverFn = useServerFn(toggleHumanTakeover);
  const deleteFn = useServerFn(deleteLead);
  const statesFn = useServerFn(listWorkflowStates);
  const pauseFn = useServerFn(pauseLeadWorkflow);
  const [filter, setFilter] = reactExports.useState("all");
  const [search, setSearch] = reactExports.useState("");
  const [timeFilter, setTimeFilter] = reactExports.useState("all");
  const [sort, setSort] = reactExports.useState("recent");
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  const { data } = useQuery({
    queryKey: ["leads"],
    queryFn: () => leadsFn(),
    refetchInterval: 5e3
  });
  const { data: convData } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => convFn(),
    refetchInterval: 5e3
  });
  const { data: statesData } = useQuery({
    queryKey: ["workflow-states"],
    queryFn: () => statesFn(),
    refetchInterval: 8e3,
    enabled: canPause
  });
  const takeoverMap = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const c of convData?.conversations ?? []) m.set(c.phone_number, c.human_takeover);
    return m;
  }, [convData]);
  const workflowMap = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const s of statesData?.states ?? []) {
      m.set(s.phone_number, s.status);
    }
    return m;
  }, [statesData]);
  const takeover = useMutation({
    mutationFn: (vars) => takeoverFn({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Conversation updated");
    },
    onError: () => toast.error("Failed to update")
  });
  const pause = useMutation({
    mutationFn: (vars) => pauseFn({ data: vars }),
    onSuccess: (res, vars) => {
      if (res.ok) {
        qc.invalidateQueries({ queryKey: ["workflow-states"] });
        toast.success(vars.paused ? "Workflow paused for this lead" : "Workflow resumed");
      } else {
        toast.error(res.error ?? "Failed to update workflow");
      }
    },
    onError: () => toast.error("Failed to update workflow")
  });
  const remove = useMutation({
    mutationFn: (id) => deleteFn({ data: { id } }),
    onSuccess: (res) => {
      if (res.ok) {
        qc.invalidateQueries({ queryKey: ["leads"] });
        qc.invalidateQueries({ queryKey: ["conversations"] });
        toast.success("Lead deleted — this number is now a fresh lead");
      } else {
        toast.error(res.error ?? "Failed to delete");
      }
      setPendingDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete");
      setPendingDelete(null);
    }
  });
  const leads = data?.leads ?? [];
  const filtered = reactExports.useMemo(() => {
    const q = search.toLowerCase();
    const rows = leads.filter((l) => {
      const matchFilter = filter === "all" || columnForStage(l.qualification_status).id === filter;
      const matchSearch = !q || l.lead_name?.toLowerCase().includes(q) || l.phone_number.toLowerCase().includes(q) || l.course_interest?.toLowerCase().includes(q) || l.country_interest?.toLowerCase().includes(q);
      const matchTime = withinRange$2(l.updated_at ?? l.created_at ?? null, timeFilter);
      return matchFilter && matchSearch && matchTime;
    });
    rows.sort((a, b) => {
      if (sort === "name_asc") return (a.lead_name ?? "").localeCompare(b.lead_name ?? "");
      if (sort === "stage") return a.qualification_status.localeCompare(b.qualification_status);
      const at = new Date(a.updated_at ?? a.created_at ?? 0).getTime();
      const bt = new Date(b.updated_at ?? b.created_at ?? 0).getTime();
      return sort === "oldest" ? at - bt : bt - at;
    });
    return rows;
  }, [leads, filter, search, timeFilter, sort]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-xs flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search leads…",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            className: "pl-9"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
        LEAD_FILTERS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setFilter(f.id),
            className: cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filter === f.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
            ),
            children: f.label
          },
          f.id
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: timeFilter, onValueChange: setTimeFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[120px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Time" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TIME_FILTERS$2.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.id, children: t.label }, t.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: sort, onValueChange: setSort, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectTrigger, { className: "h-8 w-[130px] text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { className: "mr-1 h-3.5 w-3.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Sort" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SORTS$2.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id, children: s.label }, s.id)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-2xl border bg-card shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Phone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Course" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Country" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Stage" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Financial" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Parent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Doc" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Mode" }),
        canPause && /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Workflow" }),
        canDelete && /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        filtered.map((l) => {
          const human = takeoverMap.get(l.phone_number) ?? false;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0 hover:bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => openConversation(l.phone_number),
                className: "group inline-flex items-center gap-1.5 text-left hover:text-primary",
                title: "Open conversation",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" }),
                  l.lead_name ?? "—"
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => openConversation(l.phone_number),
                className: "hover:text-primary hover:underline",
                title: "Open conversation",
                children: l.phone_number
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: l.course_interest ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: l.country_interest ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StageBadge, { stage: l.qualification_status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: l.financial_alignment ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: l.parent_phone ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: l.document_received ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-success", children: "✓" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: human ? "default" : "outline",
                className: "h-7 gap-1 px-2 text-xs",
                onClick: () => takeover.mutate({ phone: l.phone_number, enabled: !human }),
                children: [
                  human ? /* @__PURE__ */ jsxRuntimeExports.jsx(UserCog, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-3.5 w-3.5" }),
                  human ? "Human" : "AI"
                ]
              }
            ) }),
            canPause && /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: (() => {
              const wf = workflowMap.get(l.phone_number);
              if (!wf) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "—" });
              const paused = wf === "paused";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: paused ? "default" : "outline",
                  className: "h-7 gap-1 px-2 text-xs",
                  disabled: pause.isPending,
                  onClick: () => pause.mutate({ phone: l.phone_number, paused: !paused }),
                  children: [
                    paused ? /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-3.5 w-3.5" }),
                    paused ? "Resume" : "Pause"
                  ]
                }
              );
            })() }),
            canDelete && /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "ghost",
                className: "h-7 gap-1 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive",
                onClick: () => setPendingDelete(l),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
                  "Delete"
                ]
              }
            ) })
          ] }, l.id);
        }),
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 9 + (canPause ? 1 : 0) + (canDelete ? 1 : 0), className: "px-4 py-12 text-center text-muted-foreground", children: "No leads found." }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!pendingDelete, onOpenChange: (o) => !o && setPendingDelete(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete this lead?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          "This permanently removes ",
          pendingDelete?.lead_name ?? pendingDelete?.phone_number,
          " and all of their conversation history, messages and bookings. The phone number will be treated as a fresh lead the next time it messages. This cannot be undone."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { disabled: remove.isPending, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AlertDialogAction,
          {
            className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            disabled: remove.isPending,
            onClick: () => pendingDelete && remove.mutate(pendingDelete.id),
            children: remove.isPending ? "Deleting…" : "Delete lead"
          }
        )
      ] })
    ] }) })
  ] });
}
const Textarea = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
const Switch = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root$1,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Thumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = Root$1.displayName;
const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = reactExports.useState(void 0);
  reactExports.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
const Dialog = Root;
const DialogTrigger = Trigger$2;
const DialogPortal = Portal$1;
const DialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = Overlay.displayName;
const DialogContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
const DialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = Title.displayName;
const DialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = Description.displayName;
const Popover = Root2$2;
const PopoverTrigger = Trigger;
const PopoverContent = reactExports.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal$2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2$2,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = Content2$2.displayName;
const statusStyles = {
  active: "bg-success/15 text-success",
  paused: "bg-amber-500/15 text-amber-600",
  completed: "bg-muted text-muted-foreground",
  reacted: "bg-primary/15 text-primary",
  stopped: "bg-destructive/15 text-destructive"
};
function LeadWorkflowManager({
  phone,
  trigger
}) {
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [pickWorkflow, setPickWorkflow] = reactExports.useState("");
  const [goalAt, setGoalAt] = reactExports.useState("");
  const listFn = useServerFn(listLeadWorkflows);
  const assignFn = useServerFn(assignLeadWorkflow);
  const removeFn = useServerFn(removeLeadWorkflow);
  const { data } = useQuery({
    queryKey: ["lead-workflows", phone],
    queryFn: () => listFn({ data: { phone } }),
    enabled: open && !!phone
  });
  const assigned = data?.assigned ?? [];
  const available = data?.available ?? [];
  const assignedIds = new Set(assigned.map((a) => a.workflow_id));
  const selectable = available.filter((w) => !assignedIds.has(w.id));
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["lead-workflows", phone] });
    qc.invalidateQueries({ queryKey: ["workflow-states"] });
  };
  const assign = useMutation({
    mutationFn: () => assignFn({ data: { phone, workflowId: pickWorkflow, goalAt: goalAt || null } }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) {
        toast.error(res.error ?? "Failed to assign workflow");
        return;
      }
      toast.success("Workflow assigned");
      setPickWorkflow("");
      setGoalAt("");
      invalidate();
    },
    onError: () => toast.error("Failed to assign workflow")
  });
  const remove = useMutation({
    mutationFn: (workflowId) => removeFn({ data: { phone, workflowId } }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) {
        toast.error(res.error ?? "Failed to remove workflow");
        return;
      }
      toast.success("Workflow removed");
      invalidate();
    },
    onError: () => toast.error("Failed to remove workflow")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: trigger ?? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 gap-1 px-2 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Workflow, { className: "h-3.5 w-3.5" }),
      " Workflows"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(PopoverContent, { align: "end", className: "w-80 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Workflow, { className: "h-4 w-4 text-primary" }),
        " Assigned workflows"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        assigned.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No workflows assigned to this lead." }),
        assigned.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center justify-between gap-2 rounded-lg border bg-card px-2.5 py-1.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-xs font-medium", children: a.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `rounded-full px-1.5 py-0.5 text-[9px] font-semibold capitalize ${statusStyles[a.status] ?? "bg-muted text-muted-foreground"}`,
                      children: a.status
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
                  "Step ",
                  a.current_step + 1,
                  a.goal_at && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    " · ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "inline h-2.5 w-2.5" }),
                    " goal",
                    " ",
                    new Date(a.goal_at).toLocaleDateString()
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "icon",
                  variant: "ghost",
                  className: "h-6 w-6 shrink-0",
                  disabled: remove.isPending,
                  onClick: () => remove.mutate(a.workflow_id),
                  "aria-label": `Remove ${a.name}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5 text-destructive" })
                }
              )
            ]
          },
          a.id
        ))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-t pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Add a workflow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: pickWorkflow,
            onChange: (e) => setPickWorkflow(e.target.value),
            className: "h-9 w-full rounded-md border border-input bg-background px-2 text-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select a workflow…" }),
              selectable.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: w.id, children: w.name }, w.id))
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] text-muted-foreground", children: "Goal date (optional — for countdown steps)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "datetime-local",
              value: goalAt,
              onChange: (e) => setGoalAt(e.target.value),
              className: "h-9 text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            className: "w-full gap-1",
            disabled: !pickWorkflow || assign.isPending,
            onClick: () => assign.mutate(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
              " Assign workflow"
            ]
          }
        ),
        selectable.length === 0 && available.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "All enabled workflows are already assigned." })
      ] })
    ] })
  ] });
}
const getCalendarSettings = createServerFn({
  method: "GET"
}).handler(createSsrRpc("890113bdd975282eeb9f3e4a6905c86d19c05edf8caac5659c3f00f39d11f1eb"));
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
const saveCalendarSettings = createServerFn({
  method: "POST"
}).inputValidator((d) => calendarSchema.parse(d)).handler(createSsrRpc("d180556cfe86edb3c69f25c26ec960ceebaa80c8b8ceb1fcf99001f653874c5c"));
const getAvailableSlots = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: stringType().max(100).optional()
}).parse(d)).handler(createSsrRpc("082b1bc725b594e0b1f41713c403ca659cca2b034c60b262f616d3cd1704b1ca"));
createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: stringType().min(3).max(60),
  lead_name: stringType().max(200).nullable().optional(),
  appointment_date: stringType(),
  appointment_type: stringType().max(100).optional(),
  notes: stringType().max(2e3).nullable().optional()
}).parse(d)).handler(createSsrRpc("dbfa9dc3831d9672adbc3d7efc7c6ad31240429e963d86f927d8c14d8f50f10f"));
const bookAppointmentFromChat = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  phone: stringType().min(3).max(60),
  lead_name: stringType().max(200).nullable().optional(),
  appointment_date: stringType(),
  appointment_type: stringType().max(100).optional(),
  notes: stringType().max(2e3).nullable().optional()
}).parse(d)).handler(createSsrRpc("be66105b4f9d539b5df6962e14e5744381d2196f906d25e4dae85cc23e9dec7c"));
const getJitsiSettings = createServerFn({
  method: "GET"
}).handler(createSsrRpc("d1d5f2c5a83c1797b5d6450eb2782a55e15dccf83d7d0af49188c32120144207"));
const jitsiSchema = objectType({
  id: stringType().uuid().optional(),
  enabled: booleanType(),
  server_url: stringType().min(3).max(300),
  display_name: stringType().min(1).max(100),
  room_prefix: stringType().min(1).max(60).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only")
});
const saveJitsiSettings = createServerFn({
  method: "POST"
}).inputValidator((d) => jitsiSchema.parse(d)).handler(createSsrRpc("4fdde4e2c0e159c7181898eec5b1f380356e3f6fcc0bd80bae3d3e8f90aceb62"));
function nextDays(n) {
  const out = [];
  const d = /* @__PURE__ */ new Date();
  d.setHours(12, 0, 0, 0);
  for (let i = 0; i < n; i++) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return out;
}
function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}
function DayChip({ date, active, onClick }) {
  const d = /* @__PURE__ */ new Date(`${date}T12:00:00`);
  const dow = d.toLocaleDateString([], { weekday: "short" });
  const dom = d.getDate();
  const month = d.toLocaleDateString([], { month: "short" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: cn(
        "flex shrink-0 flex-col items-center rounded-xl border px-3.5 py-2 transition-colors",
        active ? "border-primary bg-primary text-primary-foreground shadow-sm" : "bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold uppercase tracking-wide opacity-80", children: dow }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-bold leading-tight", children: dom }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] opacity-70", children: month })
      ]
    }
  );
}
function BookAppointmentDialog({
  open,
  onOpenChange,
  phone,
  leadName,
  onBooked
}) {
  const slotsFn = useServerFn(getAvailableSlots);
  const bookFn = useServerFn(bookAppointmentFromChat);
  const days = reactExports.useMemo(() => nextDays(14), []);
  const [date, setDate] = reactExports.useState(null);
  const [selected, setSelected] = reactExports.useState(null);
  const [note, setNote] = reactExports.useState("");
  const slotsQuery = useQuery({
    queryKey: ["available-slots", date],
    queryFn: () => slotsFn({ data: { date } }),
    enabled: open && Boolean(date)
  });
  const slotsData = slotsQuery.data ?? null;
  const book = useMutation({
    mutationFn: (startIso) => bookFn({
      data: {
        phone,
        lead_name: leadName || void 0,
        appointment_date: startIso,
        appointment_type: "booking",
        notes: note.trim() || void 0
      }
    }),
    onSuccess: (r) => {
      const res = r;
      if (res.ok) {
        toast.success("Appointment booked — confirmation sent to the lead");
        setSelected(null);
        setNote("");
        onOpenChange(false);
        onBooked?.();
      } else {
        toast.error(res.error ?? "Failed to book the appointment");
      }
    },
    onError: () => toast.error("Failed to book the appointment")
  });
  function reset() {
    setDate(null);
    setSelected(null);
    setNote("");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Dialog,
    {
      open,
      onOpenChange: (v) => {
        onOpenChange(v);
        if (!v) reset();
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-5 w-5 text-primary" }),
          "Book an appointment"
        ] }) }),
        slotsData?.provider === "calcom" && slotsData.calcomLink ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-primary/25 bg-primary/5 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 text-sm font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-primary" }),
              "Powered by cal.com"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "This space uses cal.com for scheduling. Open the booking page to pick a time — the appointment lands in your cal.com calendar automatically." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "gap-1.5", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: slotsData.calcomLink, target: "_blank", rel: "noreferrer", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-4 w-4" }),
                " Open booking page"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "gap-1.5",
                  onClick: () => {
                    navigator.clipboard?.writeText(slotsData.calcomLink ?? "");
                    toast.success("Booking link copied");
                  },
                  children: "Copy link"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-muted-foreground", children: [
            "Send the link to ",
            leadName || "the lead",
            " and they can pick their own slot."
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "-mx-1 space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-1 text-xs font-medium text-muted-foreground", children: "Pick a day" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto px-1 pb-1", children: days.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              DayChip,
              {
                date: d,
                active: date === d,
                onClick: () => {
                  setDate(d);
                  setSelected(null);
                }
              },
              d
            )) })
          ] }),
          date && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "Available times" }),
            slotsQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-4 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
              " Checking availability…"
            ] }) : slotsData && slotsData.slots.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2 sm:grid-cols-4", children: slotsData.slots.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setSelected(selected === s.start ? null : s.start),
                className: cn(
                  "rounded-lg border px-2 py-2 text-sm font-medium transition-colors",
                  selected === s.start ? "border-primary bg-primary text-primary-foreground" : "bg-card text-foreground hover:border-primary/50"
                ),
                children: fmtTime(s.start)
              },
              s.start
            )) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg bg-muted/50 px-3 py-4 text-center text-sm text-muted-foreground", children: "No availability on this day — try another date." })
          ] }),
          date && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground", children: "Notes (optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g. Consult about enrollment",
                value: note,
                onChange: (e) => setNote(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 sm:justify-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => onOpenChange(false), children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                disabled: !selected || book.isPending,
                onClick: () => selected && book.mutate(selected),
                className: "gap-1.5",
                children: [
                  book.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarCheck, { className: "h-4 w-4" }),
                  "Book & confirm"
                ]
              }
            )
          ] })
        ] })
      ] })
    }
  );
}
const digitsOnly = (p) => (p ?? "").replace(/\D/g, "");
function MatchSnippet({ text, term }) {
  const q = term.trim();
  if (!q) return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: text });
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: text });
  const start = Math.max(0, idx - 24);
  const end = Math.min(text.length, idx + q.length + 40);
  const before = (start > 0 ? "…" : "") + text.slice(start, idx);
  const match = text.slice(idx, idx + q.length);
  const after = text.slice(idx + q.length, end) + (end < text.length ? "…" : "");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    before,
    /* @__PURE__ */ jsxRuntimeExports.jsx("mark", { className: "rounded bg-accent/40 px-0.5 text-accent-foreground", children: match }),
    after
  ] });
}
function MessagesTab({ pendingConversation, onPendingHandled } = {}) {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const canPause = profile.role === "super_admin" || profile.role === "admin";
  const threadsFn = useServerFn(listMessageThreads);
  const threadMessagesFn = useServerFn(listConversationMessages);
  const schedFn = useServerFn(listScheduledMessages);
  const sendFn = useServerFn(sendHumanMessage);
  const scheduleFn = useServerFn(scheduleMessage);
  const cancelFn = useServerFn(cancelScheduledMessage);
  const takeoverFn = useServerFn(toggleHumanTakeover);
  const statesFn = useServerFn(listWorkflowStates);
  const pauseFn = useServerFn(pauseLeadWorkflow);
  const workspacesFn = useServerFn(listWorkspaces);
  const startFn = useServerFn(startConversation);
  const [search, setSearch] = reactExports.useState("");
  const [active, setActive] = reactExports.useState(null);
  const [draft, setDraft] = reactExports.useState("");
  const [sendWorkspace, setSendWorkspace] = reactExports.useState("");
  const [scheduleOpen, setScheduleOpen] = reactExports.useState(false);
  const [scheduleAt, setScheduleAt] = reactExports.useState("");
  const [bookOpen, setBookOpen] = reactExports.useState(false);
  const bottomRef = reactExports.useRef(null);
  const isMobile = useIsMobile();
  const [newOpen, setNewOpen] = reactExports.useState(false);
  const [newPhone, setNewPhone] = reactExports.useState("");
  const [newName, setNewName] = reactExports.useState("");
  const [newWorkspace, setNewWorkspace] = reactExports.useState("");
  const [newMessage, setNewMessage] = reactExports.useState("");
  const threadSearch = search.trim();
  const threadPageSize = 30;
  const threadQuery = useInfiniteQuery({
    queryKey: ["message-threads", threadSearch],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => threadsFn({ data: { search: threadSearch, limit: threadPageSize, offset: pageParam } }),
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((sum, page) => sum + (page.threads ?? []).length, 0);
      return lastPage.hasMore ? loaded : void 0;
    },
    refetchInterval: 5e3
  });
  const { data: schedData } = useQuery({
    queryKey: ["scheduled"],
    queryFn: () => schedFn(),
    refetchInterval: 1e4
  });
  const { data: statesData } = useQuery({
    queryKey: ["workflow-states"],
    queryFn: () => statesFn(),
    refetchInterval: 8e3,
    enabled: canPause
  });
  const { data: workspacesData } = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => workspacesFn()
  });
  const scheduled = schedData?.scheduled ?? [];
  const workspaces = workspacesData?.workspaces ?? [];
  const threads = reactExports.useMemo(
    () => (threadQuery.data?.pages ?? []).flatMap(
      (page) => page.threads ?? []
    ),
    [threadQuery.data]
  );
  const activeDigits = active ? digitsOnly(active) : null;
  const { data: activeData } = useQuery({
    queryKey: ["conversation-messages", activeDigits ?? active],
    queryFn: () => threadMessagesFn({ data: { phone: active, limit: 1e3 } }),
    enabled: Boolean(active),
    refetchInterval: 5e3
  });
  reactExports.useEffect(() => {
    if (!pendingConversation) return;
    const target = digitsOnly(pendingConversation);
    const match = threads.find((c) => digitsOnly(c.phone_number) === target);
    setActive(match ? match.phone_number : pendingConversation);
    onPendingHandled?.();
  }, [pendingConversation, threads, onPendingHandled]);
  reactExports.useEffect(() => {
    if (!active && !isMobile && threads.length) setActive(threads[0].phone_number);
  }, [threads, active, isMobile]);
  const activeMsgs = activeData?.messages ?? [];
  const activeConv = activeData?.conversation ?? null;
  const activePhone = activeData?.phone ?? active;
  const takeover = activeConv?.human_takeover ?? false;
  const activeScheduled = scheduled.filter((s) => digitsOnly(s.phone_number) === activeDigits && s.status === "pending");
  const activeLeadName = threads.find((c) => digitsOnly(c.phone_number) === activeDigits)?.lead_name ?? null;
  const workflowState = (statesData?.states ?? []).find(
    (s) => digitsOnly(s.phone_number) === activeDigits
  )?.status;
  reactExports.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMsgs.length, active]);
  reactExports.useEffect(() => {
    setSendWorkspace(activeConv?.workspace_id ?? "");
  }, [active, activeConv?.workspace_id]);
  const send = useMutation({
    mutationFn: (message) => sendFn({ data: { phone: activePhone, message, workspaceId: sendWorkspace || void 0 } }),
    onSuccess: (r) => {
      const res = r;
      if (res.ok) {
        toast.success("Message sent");
      } else {
        toast.warning(res.error ?? "Sent but delivery may have failed");
      }
      setDraft("");
      qc.invalidateQueries({ queryKey: ["message-threads"] });
      qc.invalidateQueries({ queryKey: ["conversation-messages"] });
    },
    onError: () => toast.error("Failed to send")
  });
  const schedule = useMutation({
    mutationFn: (vars) => scheduleFn({ data: { phone: activePhone, message: vars.message, scheduledFor: vars.scheduledFor } }),
    onSuccess: (r) => {
      const res = r;
      if (res.ok) {
        toast.success("Message scheduled");
        setScheduleOpen(false);
        setDraft("");
        setScheduleAt("");
        qc.invalidateQueries({ queryKey: ["scheduled"] });
      } else {
        toast.error(res.error ?? "Failed to schedule");
      }
    },
    onError: () => toast.error("Failed to schedule")
  });
  const cancel = useMutation({
    mutationFn: (id) => cancelFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Scheduled message cancelled");
      qc.invalidateQueries({ queryKey: ["scheduled"] });
    },
    onError: () => toast.error("Failed to cancel")
  });
  const startConv = useMutation({
    mutationFn: (vars) => startFn({
      data: {
        phone: vars.phone,
        name: vars.name || void 0,
        workspaceId: vars.workspaceId || void 0,
        message: vars.message
      }
    }),
    onSuccess: (r, vars) => {
      const res = r;
      if (!res.ok) {
        toast.error(res.error ?? "Failed to start conversation");
        return;
      }
      toast.success("Conversation started");
      setNewOpen(false);
      setNewPhone("");
      setNewName("");
      setNewWorkspace("");
      setNewMessage("");
      qc.invalidateQueries({ queryKey: ["message-threads"] });
      qc.invalidateQueries({ queryKey: ["conversation-messages"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["contacts"] });
      setActive(vars.phone);
    },
    onError: () => toast.error("Failed to start conversation")
  });
  const toggleTakeover = useMutation({
    mutationFn: (enabled) => takeoverFn({ data: { phone: activePhone, enabled } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["message-threads"] });
      qc.invalidateQueries({ queryKey: ["conversation-messages"] });
    },
    onError: () => toast.error("Failed to update")
  });
  const pauseWorkflow = useMutation({
    mutationFn: (paused) => pauseFn({ data: { phone: activePhone, paused } }),
    onSuccess: (res, paused) => {
      if (res.ok) {
        qc.invalidateQueries({ queryKey: ["workflow-states"] });
        toast.success(paused ? "Workflow paused for this lead" : "Workflow resumed");
      } else {
        toast.error(res.error ?? "Failed to update workflow");
      }
    },
    onError: () => toast.error("Failed to update workflow")
  });
  function handleSend() {
    const text = draft.trim();
    if (!text || !active) return;
    send.mutate(text);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid h-[82vh] grid-cols-1 gap-4 md:h-[80vh] md:grid-cols-[300px_1fr]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "flex-col overflow-hidden rounded-2xl border bg-card shadow-card md:flex",
          active ? "hidden" : "flex"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-b p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "w-full gap-1.5", onClick: () => setNewOpen(true), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
              " New conversation"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "Search number or message…",
                  value: search,
                  onChange: (e) => setSearch(e.target.value),
                  className: "pl-9"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto", children: [
            threads.map((c) => {
              const preview = c.match_message_content ?? c.last_message_content ?? "No messages yet.";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setActive(c.phone_number),
                  className: cn(
                    "flex w-full flex-col gap-0.5 border-b px-4 py-3 text-left transition-colors hover:bg-muted/40",
                    activeDigits === digitsOnly(c.phone_number) && "bg-primary/5"
                  ),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-sm font-semibold", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: c.lead_name || c.phone_number }),
                      c.human_takeover && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 rounded-full bg-accent/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-accent-foreground", children: "Human" })
                    ] }),
                    c.lead_name && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: c.phone_number }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-2 text-xs text-muted-foreground", children: c.match_message_content ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-1 rounded bg-muted px-1 py-0.5 text-[9px] font-semibold uppercase", children: c.match_sender === "lead" ? "Student" : c.match_sender === "ai" ? "AI" : "Agent" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MatchSnippet, { text: preview, term: search })
                    ] }) : preview })
                  ]
                },
                c.phone_number
              );
            }),
            threadQuery.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
              " Loading conversations…"
            ] }),
            !threadQuery.isLoading && threads.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-6 text-center text-sm text-muted-foreground", children: "No conversations." }),
            threadQuery.hasNextPage && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: "outline",
                size: "sm",
                className: "w-full",
                disabled: threadQuery.isFetchingNextPage,
                onClick: () => threadQuery.fetchNextPage(),
                children: [
                  threadQuery.isFetchingNextPage ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : null,
                  "Load more chats"
                ]
              }
            ) })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn(
          "flex-col overflow-hidden rounded-2xl border bg-card shadow-card md:flex",
          active ? "flex" : "hidden md:flex"
        ),
        children: active ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b px-3 py-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex min-w-0 items-center gap-2 font-semibold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setActive(null),
                    className: "-ml-1 shrink-0 rounded-md p-1 hover:bg-muted md:hidden",
                    "aria-label": "Back to conversations",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5 text-muted-foreground" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "hidden h-4 w-4 text-primary md:block" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: active })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex shrink-0 items-center gap-1.5 rounded-full border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground", children: [
                takeover ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3.5 w-3.5" }),
                "AI ",
                takeover ? "paused" : "active",
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    checked: !takeover,
                    onCheckedChange: (v) => toggleTakeover.mutate(!v),
                    disabled: toggleTakeover.isPending
                  }
                )
              ] })
            ] }),
            canPause && activePhone && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-2 overflow-x-auto pb-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LeadWorkflowManager, { phone: activePhone }),
              workflowState && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: workflowState === "paused" ? "default" : "outline",
                  className: "h-8 shrink-0 gap-1 px-2.5 text-xs",
                  disabled: pauseWorkflow.isPending,
                  onClick: () => pauseWorkflow.mutate(workflowState !== "paused"),
                  children: [
                    workflowState === "paused" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-3.5 w-3.5" }),
                    workflowState === "paused" ? "Resume workflow" : "Pause workflow"
                  ]
                }
              )
            ] })
          ] }),
          activeScheduled.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 border-b bg-muted/30 px-4 py-2", children: activeScheduled.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1", children: s.message_content })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex shrink-0 items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: new Date(s.scheduled_for).toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => cancel.mutate(s.id), className: "text-destructive hover:opacity-70", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }, s.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-3 overflow-y-auto p-4", children: [
            activeMsgs.map((m) => {
              const isLead = m.sender === "lead";
              const isHuman = m.sender === "agent" || m.sender === "human";
              if (m.sender === "note") {
                return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-[85%] rounded-full bg-muted/60 px-3 py-1 text-center text-[11px] text-muted-foreground", children: m.message_content }) }, m.id);
              }
              return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex", isLead ? "justify-start" : "justify-end"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: cn(
                    "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                    isLead ? "bg-muted text-foreground" : isHuman ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
                  ),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase opacity-70", children: isLead ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3" }),
                      " Student"
                    ] }) : isHuman ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(UserCog, { className: "h-3 w-3" }),
                      " Agent"
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-3 w-3" }),
                      " AI"
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: m.message_content }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-right text-[10px] opacity-60", children: new Date(m.received_at).toLocaleString() })
                  ]
                }
              ) }, m.id);
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: bottomRef })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: draft,
                onChange: (e) => setDraft(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSend();
                  }
                },
                placeholder: "Type a reply…  (⌘/Ctrl + Enter to send)",
                rows: 2,
                className: "resize-none"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: "Send from" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: sendWorkspace || "__default",
                    onValueChange: (v) => setSendWorkspace(v === "__default" ? "" : v),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[190px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Lead's default inbox" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__default", children: "Lead's default inbox" }),
                        workspaces.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: w.id, children: [
                          w.name ?? "Unnamed",
                          w.is_default ? " (default)" : ""
                        ] }, w.id))
                      ] })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: () => setBookOpen(true),
                    disabled: !active,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarPlus, { className: "mr-1 h-4 w-4" }),
                      " Book"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: () => setScheduleOpen(true),
                    disabled: !draft.trim(),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "mr-1 h-4 w-4" }),
                      " Schedule"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleSend, disabled: !draft.trim() || send.isPending, children: [
                  send.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "mr-1 h-4 w-4" }),
                  "Send"
                ] })
              ] })
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 items-center justify-center text-muted-foreground", children: "Select a conversation" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: scheduleOpen, onOpenChange: setScheduleOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Schedule message" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: draft,
            onChange: (e) => setDraft(e.target.value),
            placeholder: "Message to send later…",
            rows: 3
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium", children: "Send at" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", value: scheduleAt, onChange: (e) => setScheduleAt(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setScheduleOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => {
              if (!draft.trim() || !scheduleAt) {
                toast.error("Enter a message and time");
                return;
              }
              schedule.mutate({
                message: draft.trim(),
                scheduledFor: new Date(scheduleAt).toISOString()
              });
            },
            disabled: schedule.isPending,
            children: [
              schedule.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "mr-1 h-4 w-4" }),
              "Schedule"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      BookAppointmentDialog,
      {
        open: bookOpen,
        onOpenChange: setBookOpen,
        phone: activePhone,
        leadName: activeLeadName,
        onBooked: () => {
          qc.invalidateQueries({ queryKey: ["appointments"] });
          qc.invalidateQueries({ queryKey: ["message-threads"] });
          qc.invalidateQueries({ queryKey: ["conversation-messages"] });
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: newOpen, onOpenChange: setNewOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Start new conversation" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium", children: "Phone number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "e.g. +15551234567",
              value: newPhone,
              onChange: (e) => setNewPhone(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium", children: "Name (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Lead name",
              value: newName,
              onChange: (e) => setNewName(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium", children: "Send through connection" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: newWorkspace, onValueChange: setNewWorkspace, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Default connection" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: workspaces.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: w.id, children: [
              w.name ?? "Unnamed",
              w.is_default ? " (default)" : ""
            ] }, w.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium", children: "First message" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: newMessage,
              onChange: (e) => setNewMessage(e.target.value),
              placeholder: "Type the first message…",
              rows: 3
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setNewOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => {
              if (!newPhone.trim() || !newMessage.trim()) {
                toast.error("Enter a phone number and message");
                return;
              }
              startConv.mutate({
                phone: newPhone.trim(),
                name: newName.trim(),
                workspaceId: newWorkspace,
                message: newMessage.trim()
              });
            },
            disabled: startConv.isPending,
            children: [
              startConv.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "mr-1 h-4 w-4" }),
              "Start"
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
const listCampaigns = createServerFn({
  method: "GET"
}).handler(createSsrRpc("a9d93f07e9116cae197653f9538f075fa602afd61a82cb0828323b152fbbb57b"));
const listCampaignRecipients = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  campaignId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("9be36f205e095650b906a98cdcbb1c9b6b2e6294d4d303807d1c7ffc72991024"));
const getCampaignOptions = createServerFn({
  method: "GET"
}).handler(createSsrRpc("c4e7b21088ea68ff37cddb27e497bf5d69b1a5a0f3d35b4e94fee95838219e5a"));
const campaignInput = objectType({
  name: stringType().trim().min(1).max(120),
  channel: enumType(["whatsapp", "sms", "email", "other"]).default("whatsapp"),
  workspace_id: stringType().uuid().nullable().optional(),
  message_template: stringType().max(8e3).default(""),
  message_variations: arrayType(stringType().max(8e3)).max(10).default([]),
  batch_size: numberType().int().min(1).max(100).default(25),
  delay_seconds: numberType().int().min(0).max(5).default(2),
  batch_break_seconds: numberType().int().min(0).max(86400).default(60),
  send_rate_per_min: numberType().int().min(1).max(600).default(60),
  send_days: arrayType(numberType().int().min(0).max(6)).max(7).default([0, 1, 2, 3, 4, 5, 6]),
  send_window_start: stringType().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  send_window_end: stringType().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  send_timezone: stringType().max(64).default("UTC"),
  start_at: stringType().nullable().optional(),
  end_at: stringType().nullable().optional()
});
const createCampaign = createServerFn({
  method: "POST"
}).inputValidator((d) => campaignInput.parse(d)).handler(createSsrRpc("fdd1cd7187316037ea146cc01f5803c448f81fba3975f8ab8d92e76b9ef5f2d3"));
const updateCampaign = createServerFn({
  method: "POST"
}).inputValidator((d) => campaignInput.partial().extend({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("00cb2e82a9b0990de75f2084e38d68c14eb0cbf41b0519728fbdb9e040635442"));
const setCampaignStatus = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid(),
  action: enumType(["start", "pause", "resume", "cancel"])
}).parse(d)).handler(createSsrRpc("a08e28dc292e44c75289d5fcca1f137485ba52c925213b0bee3d203a894437ea"));
const deleteCampaign = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("0fdd36c83dd8dd2d96973afb69b82f5a87217c21241a67b302d9e0853cca7a4a"));
const addRecipientsFromLeads = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  campaignId: stringType().uuid(),
  source: enumType(["all", "offer", "stage", "ids"]),
  offerId: stringType().uuid().optional(),
  stageKeys: arrayType(stringType().max(80)).max(100).optional(),
  leadIds: arrayType(stringType().uuid()).max(5e3).optional()
}).parse(d)).handler(createSsrRpc("8b30a5d064821f11309968fded3e3d07404a06454930c94cd9b8645a04a59e43"));
const addRecipientsFromCsv = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  campaignId: stringType().uuid(),
  rows: arrayType(recordType(stringType(), stringType().max(2e3))).min(1).max(1e4)
}).parse(d)).handler(createSsrRpc("799b5d005056f07de102e92a10b6deb8bee353c5957305173efa90827334250d"));
const clearPendingRecipients = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  campaignId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("f333da84ff96ee40bd85f2d29b1c58ea9f888d3d77136f98a371e2480526de20"));
const exportContactsCsv = createServerFn({
  method: "GET"
}).handler(createSsrRpc("e373b73fb9719155d87a4061ab7f678ef710dc53c0ccbc3e08bc044c1b58808a"));
const TIME_FILTERS$1 = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" }
];
const SORTS$1 = [
  { id: "recent", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "name_asc", label: "Name A–Z" }
];
function withinRange$1(iso, range) {
  if (range === "all") return true;
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (isNaN(t)) return false;
  const now = Date.now();
  const day = 864e5;
  if (range === "today") return new Date(iso).toDateString() === (/* @__PURE__ */ new Date()).toDateString();
  if (range === "7d") return now - t <= 7 * day;
  if (range === "30d") return now - t <= 30 * day;
  return true;
}
function ContactsTab() {
  const fn = useServerFn(listContacts);
  const exportFn = useServerFn(exportContactsCsv);
  const [search, setSearch] = reactExports.useState("");
  const [timeFilter, setTimeFilter] = reactExports.useState("all");
  const [sort, setSort] = reactExports.useState("recent");
  const [exporting, setExporting] = reactExports.useState(false);
  const { openConversation } = useDashboardNav();
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportFn();
      if (!res.csv) {
        toast.error(res.error ?? "No contacts to export");
        return;
      }
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contacts-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Contacts exported");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };
  const { data } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => fn(),
    refetchInterval: 1e4
  });
  const contacts = data?.contacts ?? [];
  const filtered = reactExports.useMemo(() => {
    const q = search.toLowerCase();
    const rows = contacts.filter(
      (c) => (!q || c.lead_name?.toLowerCase().includes(q) || c.phone_number.toLowerCase().includes(q) || c.course_interest?.toLowerCase().includes(q) || c.country_interest?.toLowerCase().includes(q)) && withinRange$1(c.created_at, timeFilter)
    );
    rows.sort((a, b) => {
      if (sort === "name_asc") return (a.lead_name ?? "").localeCompare(b.lead_name ?? "");
      const at = new Date(a.created_at ?? 0).getTime();
      const bt = new Date(b.created_at ?? 0).getTime();
      return sort === "oldest" ? at - bt : bt - at;
    });
    return rows;
  }, [contacts, search, timeFilter, sort]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Contact, { className: "h-4 w-4 text-primary" }),
        filtered.length,
        " contact",
        filtered.length === 1 ? "" : "s"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-xs flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search contacts…",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              className: "pl-9"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: timeFilter, onValueChange: setTimeFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[120px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Time" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TIME_FILTERS$1.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.id, children: t.label }, t.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: sort, onValueChange: setSort, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectTrigger, { className: "h-8 w-[120px] text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { className: "mr-1 h-3.5 w-3.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Sort" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SORTS$1.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id, children: s.label }, s.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-8 gap-1 text-xs", onClick: handleExport, disabled: exporting, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" }),
          "Export CSV"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-2xl border bg-card shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Phone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Course" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Country" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Added" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right font-semibold", children: "Message" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        filtered.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            className: "cursor-pointer border-b last:border-0 hover:bg-muted/30",
            onClick: () => openConversation(c.phone_number),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: c.lead_name ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: c.phone_number }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: c.course_interest ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: c.country_interest ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: format(new Date(c.created_at), "MMM d, yyyy") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  className: "h-7 gap-1 px-2 text-xs text-primary",
                  onClick: (e) => {
                    e.stopPropagation();
                    openConversation(c.phone_number);
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-3.5 w-3.5" }),
                    "Message"
                  ]
                }
              ) })
            ]
          },
          c.id
        )),
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-4 py-12 text-center text-muted-foreground", children: "No contacts found." }) })
      ] })
    ] }) })
  ] });
}
const TIME_FILTERS = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" }
];
const SORTS = [
  { id: "date_desc", label: "Newest first" },
  { id: "date_asc", label: "Oldest first" },
  { id: "name_asc", label: "Name A–Z" },
  { id: "status", label: "Status" }
];
function withinRange(iso, range) {
  if (range === "all") return true;
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (isNaN(t)) return false;
  const now = Date.now();
  const day = 864e5;
  if (range === "today") return new Date(iso).toDateString() === (/* @__PURE__ */ new Date()).toDateString();
  if (range === "7d") return now - t <= 7 * day;
  if (range === "30d") return now - t <= 30 * day;
  return true;
}
function BookingsTab() {
  const qc = useQueryClient();
  const fn = useServerFn(listAppointments);
  const updateFn = useServerFn(updateAppointmentStatus);
  const workflowsFn = useServerFn(listActiveWorkflows);
  const triggerFn = useServerFn(triggerLeadWorkflow);
  const [view, setView] = reactExports.useState("list");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [timeFilter, setTimeFilter] = reactExports.useState("all");
  const [sort, setSort] = reactExports.useState("date_desc");
  const [pickedWorkflow, setPickedWorkflow] = reactExports.useState({});
  const { data } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => fn(),
    refetchInterval: 5e3
  });
  const { data: workflowsData } = useQuery({
    queryKey: ["active-workflows"],
    queryFn: () => workflowsFn()
  });
  const workflows = workflowsData?.workflows ?? [];
  const update = useMutation({
    mutationFn: (vars) => updateFn({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Booking updated");
    },
    onError: () => toast.error("Update failed")
  });
  const trigger = useMutation({
    mutationFn: (vars) => triggerFn({ data: vars }),
    onSuccess: (r) => {
      const res = r;
      if (res.ok) {
        toast.success("Workflow triggered");
        qc.invalidateQueries({ queryKey: ["workflow-states"] });
      } else {
        toast.error(res.error ?? "Could not trigger workflow");
      }
    },
    onError: () => toast.error("Could not trigger workflow")
  });
  const allAppointments = data?.appointments ?? [];
  const appointments = reactExports.useMemo(() => {
    const filtered = allAppointments.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!withinRange(a.appointment_date ?? a.created_at ?? null, timeFilter)) return false;
      return true;
    });
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sort === "name_asc") return (a.lead_name ?? "").localeCompare(b.lead_name ?? "");
      if (sort === "status") return a.status.localeCompare(b.status);
      const at = new Date(a.appointment_date ?? a.created_at ?? 0).getTime();
      const bt = new Date(b.appointment_date ?? b.created_at ?? 0).getTime();
      return sort === "date_asc" ? at - bt : bt - at;
    });
    return sorted;
  }, [allAppointments, statusFilter, timeFilter, sort]);
  const grouped = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const a of appointments) {
      const key = a.appointment_date ? new Date(a.appointment_date).toLocaleDateString() : "Unscheduled";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    }
    return Array.from(map.entries());
  }, [appointments]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "sm",
          variant: view === "list" ? "default" : "outline",
          onClick: () => setView("list"),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "mr-1 h-4 w-4" }),
            " List"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "sm",
          variant: view === "calendar" ? "default" : "outline",
          onClick: () => setView("calendar"),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "mr-1 h-4 w-4" }),
            " Calendar"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[130px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All statuses" }),
            APPOINTMENT_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, className: "capitalize", children: s }, s))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: timeFilter, onValueChange: setTimeFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[120px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Time" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TIME_FILTERS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.id, children: t.label }, t.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: sort, onValueChange: setSort, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectTrigger, { className: "h-8 w-[140px] text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { className: "mr-1 h-3.5 w-3.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Sort" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SORTS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id, children: s.label }, s.id)) })
        ] })
      ] })
    ] }),
    view === "list" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-2xl border bg-card shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Lead" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Phone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Actions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Workflow" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        appointments.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0 hover:bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: a.lead_name ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: a.phone_number ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 capitalize", children: a.appointment_type }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "datetime-local",
              defaultValue: a.appointment_date ? a.appointment_date.slice(0, 16) : "",
              onBlur: (e) => e.target.value && update.mutate({
                id: a.id,
                status: a.status,
                appointment_date: new Date(e.target.value).toISOString()
              }),
              className: "h-8 w-44 text-xs"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: a.status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: APPOINTMENT_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => update.mutate({ id: a.id, status: s }),
              className: cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium capitalize transition-colors",
                a.status === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
              ),
              children: s
            },
            s
          )) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: a.phone_number ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: pickedWorkflow[a.id] ?? "",
                onValueChange: (v) => setPickedWorkflow((m) => ({ ...m, [a.id]: v })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectTrigger, { className: "h-8 w-[160px] text-xs", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Workflow, { className: "mr-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Assign…" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: workflows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none", disabled: true, children: "No workflows" }) : workflows.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: w.id, children: w.name }, w.id)) })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                className: "h-8 gap-1 px-2 text-xs",
                disabled: !pickedWorkflow[a.id] || trigger.isPending,
                onClick: () => trigger.mutate({ workflowId: pickedWorkflow[a.id], phone: a.phone_number }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3.5 w-3.5" }),
                  " Trigger"
                ]
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "—" }) })
        ] }, a.id)),
        appointments.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-4 py-12 text-center text-muted-foreground", children: "No bookings found." }) })
      ] })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [
      grouped.map(([date, items]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-4 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2 border-b pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar$1, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: date })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: items.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/40 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: a.lead_name ?? a.phone_number ?? "Lead" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: a.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs capitalize text-muted-foreground", children: a.appointment_type })
        ] }, a.id)) })
      ] }, date)),
      grouped.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "col-span-full py-12 text-center text-muted-foreground", children: "No bookings found." })
    ] })
  ] });
}
const listOffers = createServerFn({
  method: "GET"
}).handler(createSsrRpc("aa731155c44b879ab903335fbbe2553bfafaccbb340e57b6136a779062820fe4"));
const offerSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(200),
  description: stringType().max(2e3).nullable().optional(),
  products: stringType().max(2e3).nullable().optional(),
  stage: stringType().min(1).max(100),
  stages: arrayType(stringType().min(1).max(100)).max(50).optional(),
  default_valuation: numberType().min(0).max(1e9),
  expected_liquidity: numberType().min(0).max(1e9),
  currency: stringType().min(1).max(8),
  enabled: booleanType(),
  pipeline_id: stringType().uuid().nullable().optional()
});
const upsertOffer = createServerFn({
  method: "POST"
}).inputValidator((d) => offerSchema.parse(d)).handler(createSsrRpc("a4b0b7d8cee7ea93538428d5b7b68799d44cae751347f84ca8526fdac64369cc"));
const deleteOffer = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("ad4ab0e5a64fac56d2cdf88e298c149c0487349381e29d74143710db753b5ac6"));
createServerFn({
  method: "GET"
}).handler(createSsrRpc("35e53c6f9bcbf54bb276553c1426073f35ba91fd10d7cd2c87f3f542a3453ac3"));
createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  lead_id: stringType().uuid(),
  offer_id: stringType().uuid().nullable().optional(),
  valuation: numberType().min(0).max(1e9),
  liquidity: numberType().min(0).max(1e9),
  notes: stringType().max(2e3).nullable().optional()
}).parse(d)).handler(createSsrRpc("388deb8e6034e8877ea6327ba4c528a3333db9a1d5404fdd1172745acf6d0fe6"));
const listStageSettings = createServerFn({
  method: "GET"
}).handler(createSsrRpc("00d37a705f76d0f5cd6958bb87af50a7d275c0d15f4453ac6beef79ac19ee567"));
const upsertStageSetting = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  stage: stringType().min(1).max(100),
  offer_id: stringType().uuid().nullable().optional(),
  valuation: numberType().min(0).max(1e9),
  liquidity: numberType().min(0).max(1e9)
}).parse(d)).handler(createSsrRpc("df5bdc994b5d58ed12c9624d2d76897bee25682773457a5663b3226d43339e16"));
const getReportDashboard = createServerFn({
  method: "GET"
}).handler(createSsrRpc("3513636ab79ebf95fb7f672e5b566664e026d5866df0b8fbb366c4c2cf84bf94"));
const modelConfigSchema = objectType({
  mode: enumType(["built_in", "ai_settings", "custom"]).optional(),
  provider: stringType().max(40).nullable().optional(),
  baseUrl: stringType().max(500).nullable().optional(),
  model: stringType().max(160).nullable().optional(),
  apiKey: stringType().max(2e3).nullable().optional()
}).optional();
createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  prompt: stringType().min(1).max(4e3),
  days: numberType().int().min(1).max(365).optional()
}).parse(d)).handler(createSsrRpc("2c2cdf22ef130c8637595a54d48f42d915291b312305fe594ee940274727155c"));
const chatMessageSchema = objectType({
  role: enumType(["user", "assistant"]),
  content: stringType().min(1).max(2e4)
});
const generateChatReply = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  messages: arrayType(chatMessageSchema).min(1).max(40),
  days: numberType().int().min(1).max(365).optional(),
  deepContent: booleanType().optional(),
  model: modelConfigSchema
}).parse(d)).handler(createSsrRpc("ac0297c0358c09ca8175b3f59846a6e28294069e71be6e665bce70954f15da38"));
const listConversations = createServerFn({
  method: "GET"
}).handler(createSsrRpc("f26db4cd0d46d8e37a39bfb82aac17baa1e813b543f4182a529f582eb4e1ac49"));
const saveConversation = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid().optional(),
  title: stringType().min(1).max(200),
  messages: arrayType(chatMessageSchema).min(1).max(60)
}).parse(d)).handler(createSsrRpc("2221cb2a72ee74292562bf1dc073cf06bb52922e96276f0d2b9130feb3ea0ca2"));
const deleteConversation = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("0f91df053876de7855f9ca6e95ac99a5e7cadd97917e7922b6dabc99e4e47844"));
const generateAgentReply = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  messages: arrayType(chatMessageSchema).min(1).max(40),
  days: numberType().int().min(1).max(365).optional(),
  model: modelConfigSchema
}).parse(d)).handler(createSsrRpc("6f92326e3fd40ca9d279909c087a509aae4e6fee844c5f68d7056e79ea106138"));
const executeAgentAction = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  name: enumType(["move_lead_stage", "update_lead", "assign_workflow", "remove_workflow", "set_opportunity", "upsert_ai_variable", "delete_ai_variable", "create_workflow", "update_workflow", "create_responder_agent", "update_responder_agent", "create_http_action", "update_http_action"]),
  args: recordType(stringType(), unknownType())
}).parse(d)).handler(createSsrRpc("743d522a1acc4a7eee1e7188b0fb967b0b6915f5ead7d2fa04cf4c76f0036e80"));
const listPipelines = createServerFn({
  method: "GET"
}).handler(createSsrRpc("8574a630e4d0a5569e173e9dec24eb99c87242aab076be216209b8b7aa5ff486"));
const listLeadPipelines = createServerFn({
  method: "GET"
}).handler(createSsrRpc("d06a676fefaee26f3761fa763e73cb972a70b89f3594e9fa97926e2de260a0ea"));
const createPipeline = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  name: stringType().min(1).max(120)
}).parse(d)).handler(createSsrRpc("77b010310fb9c39bf1e6a2819a40567765ca476ed6b673a37c2e632cb9739fe1"));
const updatePipeline = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid(),
  name: stringType().min(1).max(120)
}).parse(d)).handler(createSsrRpc("44bc684f421a0b7e7eff8ecc89ccd247b7c820b943a54213baaa1762ebe04916"));
const deletePipeline = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("2420c78ef024ce3c16cabd7eb565757f5e1cc317991ab03e6fe21f9cd17f558f"));
const savePipelineStages = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  pipelineId: stringType().uuid(),
  stages: arrayType(objectType({
    id: stringType().uuid().optional(),
    label: stringType().min(1).max(80),
    stage_keys: arrayType(stringType()).optional()
  })).min(1)
}).parse(d)).handler(createSsrRpc("c380426bffdff594fe382d74070ed7b3bc4274bf4b3ac910e5a2b7b7cf1b22df"));
const STAGE_ACCENTS = [
  "from-sky-500/15 to-sky-500/5 border-sky-500/40 text-sky-600 dark:text-sky-300",
  "from-violet-500/15 to-violet-500/5 border-violet-500/40 text-violet-600 dark:text-violet-300",
  "from-emerald-500/15 to-emerald-500/5 border-emerald-500/40 text-emerald-600 dark:text-emerald-300",
  "from-amber-500/15 to-amber-500/5 border-amber-500/40 text-amber-600 dark:text-amber-300",
  "from-pink-500/15 to-pink-500/5 border-pink-500/40 text-pink-600 dark:text-pink-300",
  "from-cyan-500/15 to-cyan-500/5 border-cyan-500/40 text-cyan-600 dark:text-cyan-300",
  "from-indigo-500/15 to-indigo-500/5 border-indigo-500/40 text-indigo-600 dark:text-indigo-300",
  "from-rose-500/15 to-rose-500/5 border-rose-500/40 text-rose-600 dark:text-rose-300"
];
function PipelineTab({ canAdvanced = false }) {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const canManage = profile.role === "super_admin" || profile.role === "admin";
  const leadsFn = useServerFn(listLeads);
  const stageFn = useServerFn(updateLeadStage);
  const offersFn = useServerFn(listOffers);
  const settingsFn = useServerFn(listStageSettings);
  const saveSettingFn = useServerFn(upsertStageSetting);
  const pipelinesFn = useServerFn(listPipelines);
  const leadPipesFn = useServerFn(listLeadPipelines);
  const createPipeFn = useServerFn(createPipeline);
  const updatePipeFn = useServerFn(updatePipeline);
  const deletePipeFn = useServerFn(deletePipeline);
  const saveStagesFn = useServerFn(savePipelineStages);
  const { openConversation } = useDashboardNav();
  const [dragId, setDragId] = reactExports.useState(null);
  const [overCol, setOverCol] = reactExports.useState(null);
  const [showOpps, setShowOpps] = reactExports.useState(false);
  const [drafts, setDrafts] = reactExports.useState({});
  const [selectedPid, setSelectedPid] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(false);
  const [editStages, setEditStages] = reactExports.useState([]);
  const { data } = useQuery({ queryKey: ["leads"], queryFn: () => leadsFn(), refetchInterval: 5e3 });
  const { data: pipelinesData } = useQuery({ queryKey: ["pipelines"], queryFn: () => pipelinesFn() });
  const { data: leadPipesData } = useQuery({
    queryKey: ["lead-pipelines"],
    queryFn: () => leadPipesFn(),
    refetchInterval: 8e3
  });
  const { data: offersData } = useQuery({
    queryKey: ["offers"],
    queryFn: () => offersFn(),
    enabled: canAdvanced && showOpps
  });
  const { data: settingsData } = useQuery({
    queryKey: ["stage-settings"],
    queryFn: () => settingsFn(),
    enabled: canAdvanced && showOpps
  });
  const pipelines = pipelinesData?.pipelines ?? [];
  const defaultPipeline = pipelines.find((p) => p.is_default) ?? pipelines[0] ?? null;
  reactExports.useEffect(() => {
    if (pipelines.length === 0) return;
    if (!selectedPid || !pipelines.some((p) => p.id === selectedPid)) {
      setSelectedPid(defaultPipeline?.id ?? pipelines[0].id);
    }
  }, [pipelines, selectedPid, defaultPipeline]);
  const selectedPipeline = pipelines.find((p) => p.id === selectedPid) ?? defaultPipeline;
  const columns = reactExports.useMemo(
    () => [...selectedPipeline?.stages ?? []].sort((a, b) => a.position - b.position),
    [selectedPipeline]
  );
  const leadPipeMap = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const r of leadPipesData?.map ?? []) {
      m.set(r.lead_id, r.pipeline_id);
    }
    return m;
  }, [leadPipesData]);
  const offers = (offersData?.offers ?? []).filter((o) => o.enabled);
  const serverSettings = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const s of settingsData?.settings ?? []) m.set(s.stage, s);
    return m;
  }, [settingsData]);
  reactExports.useEffect(() => {
    if (!settingsData) return;
    setDrafts((prev) => {
      const next = { ...prev };
      for (const s of settingsData.settings ?? []) {
        if (!next[s.stage]) {
          next[s.stage] = {
            offer_id: s.offer_id ?? null,
            valuation: Number(s.valuation ?? 0),
            liquidity: Number(s.liquidity ?? 0)
          };
        }
      }
      return next;
    });
  }, [settingsData]);
  const allLeads = data?.leads ?? [];
  const resolvedPid = (leadId) => leadPipeMap.get(leadId) ?? defaultPipeline?.id ?? "";
  const leads = reactExports.useMemo(
    () => allLeads.filter((l) => resolvedPid(l.id) === selectedPipeline?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allLeads, leadPipeMap, selectedPipeline, defaultPipeline]
  );
  const columnForLead = (status) => {
    return columns.find((c) => c.stage_keys.includes(status)) ?? columns[0] ?? null;
  };
  const move = useMutation({
    mutationFn: (vars) => stageFn({ data: vars }),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["leads"] });
      const prev = qc.getQueryData(["leads"]);
      qc.setQueryData(["leads"], (old) => {
        const o = old;
        if (!o) return old;
        return { ...o, leads: o.leads.map((l) => l.id === vars.id ? { ...l, qualification_status: vars.stage } : l) };
      });
      return { prev };
    },
    onError: (_e2, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["leads"], ctx.prev);
      toast.error("Could not move lead");
    },
    onSuccess: () => toast.success("Lead moved"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["leads"] })
  });
  const saveSetting = useMutation({
    mutationFn: (vars) => saveSettingFn({ data: vars }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) return toast.error(res.error ?? "Could not save stage settings");
      qc.invalidateQueries({ queryKey: ["stage-settings"] });
    },
    onError: () => toast.error("Could not save stage settings")
  });
  function settingFor(stageId) {
    const d = drafts[stageId];
    if (d) return d;
    const s = serverSettings.get(stageId);
    return { offer_id: s?.offer_id ?? null, valuation: Number(s?.valuation ?? 0), liquidity: Number(s?.liquidity ?? 0) };
  }
  function setDraft(stageId, patch) {
    setDrafts((prev) => ({ ...prev, [stageId]: { ...settingFor(stageId), ...patch } }));
  }
  function commit(stageId) {
    saveSetting.mutate({ stage: stageId, ...settingFor(stageId) });
  }
  function onOfferChange(stageId, offerId) {
    const offer = offers.find((o) => o.id === offerId);
    const current = settingFor(stageId);
    const next = {
      offer_id: offerId || null,
      valuation: offer ? Number(offer.default_valuation ?? 0) : current.valuation,
      liquidity: offer ? Number(offer.expected_liquidity ?? 0) : current.liquidity
    };
    setDrafts((prev) => ({ ...prev, [stageId]: next }));
    saveSetting.mutate({ stage: stageId, ...next });
  }
  function onDrop(stage) {
    setOverCol(null);
    if (!dragId) return;
    const lead = leads.find((l) => l.id === dragId);
    if (lead && columnForLead(lead.qualification_status)?.id !== stage.id) {
      const key = stage.stage_keys[0];
      if (key) move.mutate({ id: dragId, stage: key });
    }
    setDragId(null);
  }
  const opps = canAdvanced && showOpps && !editing;
  const grandTotal = reactExports.useMemo(() => {
    if (!opps) return { valuation: 0, liquidity: 0 };
    return columns.reduce(
      (acc, col) => {
        const count = leads.filter((l) => columnForLead(l.qualification_status)?.id === col.id).length;
        const s = settingFor(col.id);
        acc.valuation += count * s.valuation;
        acc.liquidity += count * s.liquidity;
        return acc;
      },
      { valuation: 0, liquidity: 0 }
    );
  }, [opps, leads, drafts, serverSettings, columns]);
  const refreshPipelines = () => {
    qc.invalidateQueries({ queryKey: ["pipelines"] });
    qc.invalidateQueries({ queryKey: ["lead-pipelines"] });
  };
  const createPipe = useMutation({
    mutationFn: (name) => createPipeFn({ data: { name } }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) return toast.error(res.error ?? "Could not create pipeline");
      toast.success("Pipeline created");
      if (res.id) setSelectedPid(res.id);
      refreshPipelines();
    },
    onError: () => toast.error("Could not create pipeline")
  });
  const renamePipe = useMutation({
    mutationFn: (vars) => updatePipeFn({ data: vars }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) return toast.error(res.error ?? "Could not rename pipeline");
      toast.success("Pipeline renamed");
      refreshPipelines();
    },
    onError: () => toast.error("Could not rename pipeline")
  });
  const removePipe = useMutation({
    mutationFn: (id) => deletePipeFn({ data: { id } }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) return toast.error(res.error ?? "Could not delete pipeline");
      toast.success("Pipeline deleted");
      setSelectedPid(defaultPipeline?.id ?? null);
      refreshPipelines();
    },
    onError: () => toast.error("Could not delete pipeline")
  });
  const saveStages = useMutation({
    mutationFn: (vars) => saveStagesFn({ data: vars }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) return toast.error(res.error ?? "Could not save stages");
      toast.success("Stages saved");
      setEditing(false);
      refreshPipelines();
    },
    onError: () => toast.error("Could not save stages")
  });
  function startEditing() {
    if (!selectedPipeline) return;
    setEditStages(columns.map((c) => ({ id: c.id, label: c.label, stage_keys: c.stage_keys })));
    setShowOpps(false);
    setEditing(true);
  }
  function moveStage(idx, dir) {
    setEditStages((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }
  function handleNewPipeline() {
    const name = window.prompt("Name your new pipeline");
    if (name && name.trim()) createPipe.mutate(name.trim());
  }
  function handleRename() {
    if (!selectedPipeline) return;
    const name = window.prompt("Rename pipeline", selectedPipeline.name);
    if (name && name.trim()) renamePipe.mutate({ id: selectedPipeline.id, name: name.trim() });
  }
  function handleDeletePipeline() {
    if (!selectedPipeline || selectedPipeline.is_default) return;
    if (window.confirm(`Delete pipeline "${selectedPipeline.name}"? Leads stay on their offer/default pipeline.`)) {
      removePipe.mutate(selectedPipeline.id);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-1.5", children: pipelines.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            setSelectedPid(p.id);
            setEditing(false);
          },
          className: cn(
            "rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
            selectedPipeline?.id === p.id ? "border-primary bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
          ),
          children: p.name
        },
        p.id
      )) }),
      canManage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex flex-wrap items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-8 gap-1 px-2 text-xs", onClick: handleNewPipeline, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
          " Pipeline"
        ] }),
        selectedPipeline && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: editing ? "default" : "outline",
              className: "h-8 gap-1 px-2 text-xs",
              onClick: () => editing ? setEditing(false) : startEditing(),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
                " ",
                editing ? "Close editor" : "Edit stages"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 gap-1 px-2 text-xs", onClick: handleRename, children: "Rename" }),
          !selectedPipeline.is_default && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "ghost",
              className: "h-8 gap-1 px-2 text-xs text-destructive",
              onClick: handleDeletePipeline,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
                " Delete"
              ]
            }
          )
        ] })
      ] })
    ] }),
    editing && selectedPipeline && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-4 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-sm font-semibold", children: [
          "Edit stages — ",
          selectedPipeline.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              className: "h-8 gap-1 px-2 text-xs",
              onClick: () => setEditStages((p) => [...p, { label: "New stage", stage_keys: [] }]),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
                " Add stage"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              className: "h-8 gap-1 px-2 text-xs",
              disabled: saveStages.isPending || editStages.length === 0,
              onClick: () => saveStages.mutate({
                pipelineId: selectedPipeline.id,
                stages: editStages.map((s) => ({ ...s, label: s.label.trim() })).filter((s) => s.label.length > 0)
              }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }),
                " Save"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: editStages.map((s, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 text-center text-xs text-muted-foreground", children: idx + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: s.label,
            onChange: (e) => setEditStages((prev) => prev.map((x, i) => i === idx ? { ...x, label: e.target.value } : x)),
            className: "h-9 flex-1",
            placeholder: "Stage name"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "icon",
            variant: "ghost",
            className: "h-8 w-8",
            disabled: idx === 0,
            onClick: () => moveStage(idx, -1),
            "aria-label": "Move up",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "icon",
            variant: "ghost",
            className: "h-8 w-8",
            disabled: idx === editStages.length - 1,
            onClick: () => moveStage(idx, 1),
            "aria-label": "Move down",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "icon",
            variant: "ghost",
            className: "h-8 w-8 text-destructive",
            onClick: () => setEditStages((prev) => prev.filter((_, i) => i !== idx)),
            "aria-label": "Remove stage",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
          }
        )
      ] }, s.id ?? `new-${idx}`)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-muted-foreground", children: "Renaming or reordering is safe — the AI keeps using the built-in admissions stages. New columns are managed manually by agents." })
    ] }),
    canAdvanced && !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      opps ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 px-3 py-1.5 font-semibold text-emerald-600 dark:text-emerald-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4" }),
          " Total valuation: ",
          grandTotal.valuation.toLocaleString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500/15 to-amber-500/5 px-3 py-1.5 font-semibold text-amber-600 dark:text-amber-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-4 w-4" }),
          " Total liquidity: ",
          grandTotal.liquidity.toLocaleString()
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Turn on Opportunities to value each pipeline stage." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setShowOpps((s) => !s),
          className: cn(
            "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors",
            opps ? "border-emerald-500/50 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md" : "text-muted-foreground hover:bg-muted"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4" }),
            "Opportunities ",
            opps ? "on" : "off"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 overflow-x-auto pb-4", children: [
      columns.map((col, idx) => {
        const colLeads = leads.filter((l) => columnForLead(l.qualification_status)?.id === col.id);
        const s = settingFor(col.id);
        const colValuation = opps ? colLeads.length * s.valuation : 0;
        const colLiquidity = opps ? colLeads.length * s.liquidity : 0;
        const accent = STAGE_ACCENTS[idx % STAGE_ACCENTS.length];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            onDragOver: (e) => {
              e.preventDefault();
              setOverCol(col.id);
            },
            onDragLeave: () => setOverCol((c) => c === col.id ? null : c),
            onDrop: () => onDrop(col),
            className: cn(
              "flex w-72 shrink-0 flex-col rounded-2xl border bg-muted/30 transition-colors",
              opps && cn("bg-gradient-to-b", accent),
              overCol === col.id && "border-primary bg-primary/5"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b px-4 py-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-sm font-semibold", children: col.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-card px-2 py-0.5 text-xs font-semibold text-muted-foreground", children: colLeads.length })
              ] }),
              opps && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-b bg-card/60 px-4 py-3 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: "Offer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "select",
                    {
                      value: s.offer_id ?? "",
                      onChange: (e) => onOfferChange(col.id, e.target.value),
                      className: "h-8 w-full rounded-md border border-input bg-background px-2 text-xs",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "No offer" }),
                        offers.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o.id, children: o.name }, o.id)),
                        s.offer_id && !offers.some((o) => o.id === s.offer_id) && /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.offer_id, children: "(assigned offer)" })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: "Valuation / lead" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "number",
                        min: 0,
                        value: s.valuation || "",
                        onChange: (e) => setDraft(col.id, { valuation: Number(e.target.value) }),
                        onBlur: () => commit(col.id),
                        className: "h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: "Liquidity / lead" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "number",
                        min: 0,
                        value: s.liquidity || "",
                        onChange: (e) => setDraft(col.id, { liquidity: Number(e.target.value) }),
                        onBlur: () => commit(col.id),
                        className: "h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg bg-background/70 px-2.5 py-1.5 font-semibold", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3 w-3" }),
                    " ",
                    colLeads.length,
                    " × ",
                    s.valuation.toLocaleString()
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: colValuation.toLocaleString() })
                ] }),
                s.liquidity > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-2.5 text-[11px] text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Liquidity total" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: colLiquidity.toLocaleString() })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-2 p-3", children: [
                colLeads.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    draggable: true,
                    onDragStart: () => setDragId(l.id),
                    onDragEnd: () => setDragId(null),
                    className: cn(
                      "group cursor-grab rounded-xl border bg-card p-3 shadow-card active:cursor-grabbing",
                      dragId === l.id && "opacity-50"
                    ),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: l.lead_name ?? l.phone_number }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-1", children: [
                          canManage && /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "span",
                            {
                              onMouseDown: (e) => e.stopPropagation(),
                              onClick: (e) => e.stopPropagation(),
                              draggable: false,
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                LeadWorkflowManager,
                                {
                                  phone: l.phone_number,
                                  trigger: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "button",
                                    {
                                      type: "button",
                                      title: "Manage workflows",
                                      className: "text-muted-foreground opacity-0 transition-colors hover:text-primary group-hover:opacity-100",
                                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Workflow, { className: "h-4 w-4" })
                                    }
                                  )
                                }
                              )
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "button",
                            {
                              type: "button",
                              title: "Open conversation",
                              onClick: (e) => {
                                e.stopPropagation();
                                openConversation(l.phone_number);
                              },
                              className: "text-muted-foreground opacity-0 transition-colors hover:text-primary group-hover:opacity-100",
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4" })
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-muted-foreground", children: l.phone_number }),
                      (l.course_interest || l.country_interest) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-foreground", children: [l.course_interest, l.country_interest].filter(Boolean).join(" · ") }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground", children: stageLabel$1(l.qualification_status) })
                    ]
                  },
                  l.id
                )),
                colLeads.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-6 text-center text-xs text-muted-foreground", children: "Drop leads here" })
              ] })
            ]
          },
          col.id
        );
      }),
      columns.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-12 text-center text-sm text-muted-foreground", children: "This pipeline has no stages yet." })
    ] })
  ] });
}
const waitBase = { anchor: "wait", delayValue: 1, delayUnit: "days", offsetValue: 1, offsetUnit: "days" };
function rid$1() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `id_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
const FLOW_BLOCKS = [
  {
    type: "trigger",
    label: "Trigger",
    category: "Start",
    color: "amber",
    icon: Zap,
    description: "Entry point — every flow starts here.",
    defaultData: () => ({ label: "Trigger" })
  },
  {
    type: "text",
    label: "Text message",
    category: "Messages",
    color: "indigo",
    icon: MessageSquareText,
    description: "Send a WhatsApp text message with variables.",
    defaultData: () => ({ ...waitBase, content: "", index: 0 })
  },
  {
    type: "image",
    label: "Image message",
    category: "Messages",
    color: "sky",
    icon: Image$1,
    description: "Send an image (URL) with an optional caption.",
    defaultData: () => ({ ...waitBase, imageUrl: "", caption: "" })
  },
  {
    type: "buttons",
    label: "Buttons / quick replies",
    category: "Messages",
    color: "violet",
    icon: ListChecks,
    description: "Message with tappable quick-reply options.",
    defaultData: () => ({ ...waitBase, message: "", options: [{ id: rid$1(), label: "Yes" }, { id: rid$1(), label: "No" }] })
  },
  {
    type: "wait",
    label: "Wait",
    category: "Logic",
    color: "slate",
    icon: Timer,
    description: "Pause the flow before the next block.",
    defaultData: () => ({ delayValue: 1, delayUnit: "days" })
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
      falseLabel: "No"
    })
  },
  {
    type: "setvar",
    label: "Set variable",
    category: "Logic",
    color: "teal",
    icon: Variable,
    description: "Store a value in the conversation context.",
    defaultData: () => ({ varName: "", varValue: "" })
  },
  {
    type: "end",
    label: "End",
    category: "Logic",
    color: "rose",
    icon: Flag,
    description: "Stop the flow for this lead.",
    defaultData: () => ({ note: "Flow complete" })
  },
  {
    type: "redirect",
    label: "Redirect",
    category: "Logic",
    color: "fuchsia",
    icon: Repeat,
    description: "Enroll the lead into another workflow.",
    defaultData: () => ({ targetWorkflowId: "", targetWorkflowName: "" })
  },
  {
    type: "ai",
    label: "AI reply",
    category: "Integrations",
    color: "emerald",
    icon: Bot,
    description: "Generate & send a message with a responder agent.",
    defaultData: () => ({ ...waitBase, agentId: "", instruction: "" })
  },
  {
    type: "http",
    label: "HTTP request",
    category: "Integrations",
    color: "cyan",
    icon: Globe,
    description: "Call a webhook / API and capture the result.",
    defaultData: () => ({ actionId: "", actionName: "" })
  },
  {
    type: "booking",
    label: "Book appointment",
    category: "Integrations",
    color: "yellow",
    icon: CalendarCheck,
    description: "Create an appointment for the lead.",
    defaultData: () => ({ appointmentType: "booking", daysAhead: 3, notes: "" })
  },
  {
    type: "handoff",
    label: "Handoff to agent",
    category: "Integrations",
    color: "blue",
    icon: UserRound,
    description: "Pause the AI and hand the chat to a human.",
    defaultData: () => ({ note: "" })
  }
];
const FLOW_BLOCK_MAP = Object.fromEntries(
  FLOW_BLOCKS.map((b) => [b.type, b])
);
const FLOW_CATEGORIES = ["Start", "Messages", "Logic", "Integrations"];
const BLOCK_STYLE = {
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
  blue: { ring: "border-blue-400/70", chip: "bg-blue-400/15 text-blue-600 dark:text-blue-400", text: "text-blue-600 dark:text-blue-400", edge: "#3b82f6" }
};
function blockStyle(type) {
  const def = FLOW_BLOCK_MAP[type];
  return BLOCK_STYLE[def?.color ?? "slate"] ?? BLOCK_STYLE.slate;
}
function rid() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `id_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
const LEAD_FIELDS = [
  "lead_name",
  "phone_number",
  "qualification_status",
  "course_interest",
  "country_interest",
  "passport_status",
  "academic_status",
  "parent_phone",
  "financial_alignment",
  "parent_confirmation",
  "document_received"
];
const CONDITION_OPERATORS = [
  { id: "equals", label: "is equal to" },
  { id: "not_equals", label: "is not equal to" },
  { id: "contains", label: "contains" },
  { id: "is_set", label: "is set" },
  { id: "is_empty", label: "is empty" },
  { id: "gt", label: "is greater than" },
  { id: "lt", label: "is less than" }
];
function SchedulingFields({
  data,
  onPatch
}) {
  const anchor = String(data.anchor ?? "wait");
  const countdown = anchor !== "wait";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scheduling" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "select",
        {
          value: anchor,
          onChange: (e) => onPatch({ anchor: e.target.value }),
          className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
          children: STEP_ANCHORS.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: a.id, children: a.label }, a.id))
        }
      )
    ] }),
    countdown ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Send before the target date" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 0,
            value: Number(data.offsetValue ?? 0),
            onChange: (e) => onPatch({ offsetValue: Math.max(0, Number(e.target.value)) }),
            className: "w-24"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: String(data.offsetUnit ?? "days"),
            onChange: (e) => onPatch({ offsetUnit: e.target.value }),
            className: "h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm",
            children: TIME_UNITS.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u.id, children: u.label }, u.id))
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Wait before sending" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 0,
            value: Number(data.delayValue ?? 0),
            onChange: (e) => onPatch({ delayValue: Math.max(0, Number(e.target.value)) }),
            className: "w-24"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: String(data.delayUnit ?? "minutes"),
            onChange: (e) => onPatch({ delayUnit: e.target.value }),
            className: "h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm",
            children: TIME_UNITS.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u.id, children: u.label }, u.id))
          }
        )
      ] })
    ] })
  ] });
}
function VariableChips({
  variables,
  onInsert
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 pt-1", children: variables.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      onClick: () => onInsert(v),
      className: "rounded-md border border-input bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground",
      children: `{{${v}}}`
    },
    v
  )) });
}
function NodeInspector({
  node,
  allVariables,
  callableWorkflows,
  agents,
  httpActions,
  onPatch,
  onClose,
  onDelete,
  onDuplicate
}) {
  const data0 = node.data ?? {};
  const type = String(data0.type ?? data0._t ?? node.type ?? "text");
  const def = FLOW_BLOCK_MAP[type] ?? FLOW_BLOCK_MAP.text;
  const data = data0;
  const style = blockStyle(type);
  const textRef = reactExports.useRef(null);
  const insertVariable = (name) => {
    const token = `{{${name}}}`;
    const field = type === "image" ? "caption" : type === "buttons" ? "message" : "content";
    const el = textRef.current;
    const current = String(data[field] ?? "");
    if (!el) {
      onPatch({ [field]: current + token });
      return;
    }
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    onPatch({ [field]: current.slice(0, start) + token + current.slice(end) });
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  };
  const options = Array.isArray(data.options) ? data.options : [];
  const patchOption = (id, label) => onPatch({ options: options.map((o) => o.id === id ? { ...o, label } : o) });
  const addOption = () => onPatch({
    options: [
      ...options,
      { id: rid(), label: `Option ${options.length + 1}` }
    ]
  });
  const removeOption = (id) => onPatch({ options: options.filter((o) => o.id !== id) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `flex items-center gap-1.5 text-sm font-semibold ${style.text}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(def.icon, { className: "h-4 w-4" }),
        " ",
        def.label
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: onDuplicate, title: "Duplicate block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] })
    ] }),
    type === "text" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Message content" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          ref: textRef,
          value: String(data.content ?? ""),
          onChange: (e) => onPatch({ content: e.target.value }),
          rows: 6,
          placeholder: "The WhatsApp message to send…"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(VariableChips, { variables: allVariables, onInsert: insertVariable })
    ] }),
    type === "image" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Image URL" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: String(data.imageUrl ?? ""),
            onChange: (e) => onPatch({ imageUrl: e.target.value }),
            placeholder: "https://…/photo.jpg"
          }
        ),
        data.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: String(data.imageUrl),
              alt: "preview",
              className: "mt-1 h-32 w-full rounded-lg border object-cover",
              onError: (e) => e.target.style.opacity = "0.3"
            }
          )
        ) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Caption (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            ref: textRef,
            value: String(data.caption ?? ""),
            onChange: (e) => onPatch({ caption: e.target.value }),
            rows: 3
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VariableChips, { variables: allVariables, onInsert: insertVariable })
      ] })
    ] }),
    type === "buttons" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Message" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            ref: textRef,
            value: String(data.message ?? ""),
            onChange: (e) => onPatch({ message: e.target.value }),
            rows: 4
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VariableChips, { variables: allVariables, onInsert: insertVariable })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quick replies (each one becomes a branch handle →)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: options.map((o, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-muted-foreground", children: [
            i + 1,
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: o.label,
              onChange: (e) => patchOption(o.id, e.target.value),
              placeholder: "Option label"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "h-8 w-8 text-destructive",
              onClick: () => removeOption(o.id),
              disabled: options.length <= 1,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
            }
          )
        ] }, o.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: addOption, children: "+ Add option" })
      ] })
    ] }),
    type === "wait" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pause duration" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 0,
            value: Number(data.delayValue ?? 1),
            onChange: (e) => onPatch({ delayValue: Math.max(0, Number(e.target.value)) }),
            className: "w-24"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: String(data.delayUnit ?? "days"),
            onChange: (e) => onPatch({ delayUnit: e.target.value }),
            className: "h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm",
            children: TIME_UNITS.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u.id, children: u.label }, u.id))
          }
        )
      ] })
    ] }),
    type === "condition" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lead field / variable" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: String(data.field ?? "qualification_status"),
            onChange: (e) => onPatch({ field: e.target.value }),
            className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
            children: [...LEAD_FIELDS, ...allVariables.filter((v) => !LEAD_FIELDS.includes(v))].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: f, children: f }, f))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Operator" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: String(data.operator ?? "equals"),
            onChange: (e) => onPatch({ operator: e.target.value }),
            className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
            children: CONDITION_OPERATORS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o.id, children: o.label }, o.id))
          }
        )
      ] }),
      !["is_set", "is_empty"].includes(String(data.operator ?? "equals")) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Value" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: String(data.value ?? ""),
            onChange: (e) => onPatch({ value: e.target.value }),
            placeholder: "e.g. QUALIFIED"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "True branch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(data.trueLabel ?? "Yes"), onChange: (e) => onPatch({ trueLabel: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "False branch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(data.falseLabel ?? "No"), onChange: (e) => onPatch({ falseLabel: e.target.value }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
        "Drag from the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-success", children: "✓" }),
        " /",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-destructive", children: "✗" }),
        " handles to route each branch."
      ] })
    ] }),
    type === "setvar" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Variable name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: String(data.varName ?? ""),
            onChange: (e) => onPatch({ varName: e.target.value.replace(/[^a-zA-Z0-9_]/g, "") }),
            placeholder: "e.g. payment_method"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Value" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: String(data.varValue ?? ""),
            onChange: (e) => onPatch({ varValue: e.target.value }),
            placeholder: "e.g. credit_card or {{lead_name}}"
          }
        )
      ] })
    ] }),
    type === "ai" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Responder agent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: String(data.agentId ?? ""),
            onChange: (e) => {
              const a = agents.find((x) => x.id === e.target.value);
              onPatch({ agentId: e.target.value, agentName: a?.name ?? "" });
            },
            className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Default qualification agent" }),
              agents.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: a.id, children: a.name }, a.id))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Instruction (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: String(data.instruction ?? ""),
            onChange: (e) => onPatch({ instruction: e.target.value }),
            rows: 4,
            placeholder: "e.g. Ask about their course preferences in a friendly tone."
          }
        )
      ] })
    ] }),
    type === "http" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "HTTP action" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: String(data.actionId ?? ""),
          onChange: (e) => {
            const a = httpActions.find((x) => x.id === e.target.value);
            onPatch({ actionId: e.target.value, actionName: a?.name ?? "" });
          },
          className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select an action…" }),
            httpActions.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: a.id, children: [
              a.name,
              " ",
              a.method ? `(${a.method})` : ""
            ] }, a.id))
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Uses the HTTP actions defined in Settings → HTTP Actions. The lead's variables are merged into the request." })
    ] }),
    type === "booking" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Appointment type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: String(data.appointmentType ?? "booking"),
            onChange: (e) => onPatch({ appointmentType: e.target.value }),
            placeholder: "booking"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Schedule in (days)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 1,
            max: 90,
            value: Number(data.daysAhead ?? 3),
            onChange: (e) => onPatch({ daysAhead: Math.max(1, Math.min(90, Number(e.target.value))) })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: String(data.notes ?? ""),
            onChange: (e) => onPatch({ notes: e.target.value }),
            placeholder: "e.g. Booked automatically by flow"
          }
        )
      ] })
    ] }),
    type === "handoff" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Note for the agent (optional)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: String(data.note ?? ""),
          onChange: (e) => onPatch({ note: e.target.value }),
          placeholder: "e.g. Lead asked for pricing"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "This pauses the AI, enables human takeover and stops the flow for this lead." })
    ] }),
    type === "end" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Note (optional)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: String(data.note ?? ""),
          onChange: (e) => onPatch({ note: e.target.value }),
          placeholder: "e.g. Flow complete"
        }
      )
    ] }),
    type === "redirect" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Workflow to redirect to" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: String(data.targetWorkflowId ?? ""),
          onChange: (e) => {
            const w = callableWorkflows.find((x) => x.id === e.target.value);
            onPatch({ targetWorkflowId: e.target.value, targetWorkflowName: w?.name ?? "" });
          },
          className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select a workflow…" }),
            callableWorkflows.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: w.id, children: w.name }, w.id))
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "The lead is enrolled into that workflow and this flow continues." })
    ] }),
    (type === "text" || type === "image" || type === "buttons") && /* @__PURE__ */ jsxRuntimeExports.jsx(SchedulingFields, { data, onPatch }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 pt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "text-destructive", onClick: onDelete, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-1 h-4 w-4" }),
      " Delete block"
    ] }) })
  ] });
}
const DEFAULT_LEAD = {
  lead_name: "Maria",
  phone_number: "+5511999999999",
  qualification_status: "NEW_LEAD",
  course_interest: "Nursing",
  country_interest: "UK"
};
function fill(text, lead, ctx) {
  return String(text ?? "").replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, key) => {
    const v = ctx[key] ?? lead[key] ?? "";
    return v === void 0 || v === null ? "" : String(v);
  });
}
function evalCondition(data, lead, ctx) {
  const field = String(data.field ?? "qualification_status");
  const operator = String(data.operator ?? "equals");
  const raw = ctx[field] ?? lead[field] ?? "";
  const expected = fill(String(data.value ?? ""), lead, ctx);
  const numA = Number(raw);
  const numB = Number(expected);
  switch (operator) {
    case "is_set":
      return raw !== void 0 && raw !== null && String(raw).trim() !== "";
    case "is_empty":
      return raw === void 0 || raw === null || String(raw).trim() === "";
    case "contains":
      return String(raw).toLowerCase().includes(String(expected).toLowerCase());
    case "gt":
      return !isNaN(numA) && !isNaN(numB) && numA > numB;
    case "lt":
      return !isNaN(numA) && !isNaN(numB) && numA < numB;
    case "not_equals":
      return String(raw) !== String(expected);
    default:
      return String(raw) === String(expected);
  }
}
function WorkflowPreview({
  open,
  onClose,
  nodes,
  edges
}) {
  const graphRef = reactExports.useRef({ nodes, edges });
  reactExports.useEffect(() => {
    graphRef.current = { nodes, edges };
  }, [nodes, edges]);
  const [msgs, setMsgs] = reactExports.useState([]);
  const [lead, setLead] = reactExports.useState({ ...DEFAULT_LEAD });
  const [ctx, setCtx] = reactExports.useState({});
  const [waiting, setWaiting] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const idCounter = reactExports.useRef(0);
  const [showLeadEditor, setShowLeadEditor] = reactExports.useState(false);
  const nextId = () => `m${++idCounter.current}`;
  function reset() {
    idCounter.current = 0;
    setMsgs([]);
    setLead({ ...DEFAULT_LEAD });
    setCtx({});
    setWaiting(null);
    runFrom("trigger");
  }
  function runFrom(startId, skipFirst = false) {
    const { nodes: ns, edges: es } = graphRef.current;
    const batch = [];
    let current = startId;
    let pending = null;
    let leadNow = lead;
    let ctxNow = ctx;
    while (current && !pending) {
      const node = ns.find((n) => n.id === current);
      if (!node) break;
      const data = node.data ?? {};
      const type = String(data.type ?? data._t ?? node.type ?? "text");
      const outs = es.filter((e) => e.source === current);
      const def = FLOW_BLOCK_MAP[type];
      const name = def?.label ?? type;
      switch (type) {
        case "trigger": {
          current = outs[0]?.target ?? "";
          continue;
        }
        case "text": {
          const content = fill(String(data.content ?? ""), leadNow, ctxNow);
          if (content.trim()) batch.push({ id: nextId(), role: "bot", text: content });
          current = outs[0]?.target ?? "";
          continue;
        }
        case "image": {
          const url = String(data.imageUrl ?? "");
          const cap = fill(String(data.caption ?? ""), leadNow, ctxNow);
          if (url) batch.push({ id: nextId(), role: "bot", text: `[📷 Image] ${url}${cap ? `

${cap}` : ""}` });
          current = outs[0]?.target ?? "";
          continue;
        }
        case "buttons": {
          const options = Array.isArray(data.options) ? data.options : [];
          const text = fill(String(data.message ?? ""), leadNow, ctxNow);
          batch.push({ id: nextId(), role: "bot", text, options: options.map((o) => o.label) });
          pending = {
            options: options.map((o) => o.label),
            sourceHandleIds: options.map((o) => `opt_${o.id}`),
            fromNode: current
          };
          break;
        }
        case "wait": {
          batch.push({
            id: nextId(),
            role: "system",
            text: `⏳ Waiting ${data.delayValue ?? 1} ${data.delayUnit ?? "days"}…`
          });
          current = outs[0]?.target ?? "";
          continue;
        }
        case "condition": {
          const result = evalCondition(data, leadNow, ctxNow);
          const want = result ? "yes" : "no";
          const edge = outs.find((e) => e.sourceHandle === want) ?? outs[0];
          batch.push({
            id: nextId(),
            role: "system",
            text: `➡️ Condition "${String(data.field ?? "")}" → ${result ? String(data.trueLabel ?? "Yes") : String(data.falseLabel ?? "No")}`
          });
          current = edge?.target ?? "";
          continue;
        }
        case "setvar": {
          const name2 = String(data.varName ?? "");
          if (name2) {
            ctxNow = { ...ctxNow, [name2]: fill(String(data.varValue ?? ""), leadNow, ctxNow) };
            setCtx(ctxNow);
            batch.push({ id: nextId(), role: "system", text: `🧩 Set ${name2} = ${ctxNow[name2]}` });
          }
          current = outs[0]?.target ?? "";
          continue;
        }
        case "ai": {
          const agent = String(data.agentName ?? "") || "Default agent";
          const instr = String(data.instruction ?? "").trim();
          batch.push({
            id: nextId(),
            role: "system",
            text: `✨ AI (${agent}) generating reply…${instr ? `
> ${instr}` : ""}`
          });
          batch.push({ id: nextId(), role: "bot", text: "🤖 (AI simulated reply) Thanks! I'll help you with that." });
          current = outs[0]?.target ?? "";
          continue;
        }
        case "http": {
          batch.push({
            id: nextId(),
            role: "system",
            text: `🌐 HTTP call → ${String(data.actionName ?? data.actionId ?? "action")}`
          });
          current = outs[0]?.target ?? "";
          continue;
        }
        case "booking": {
          const inDays = Number(data.daysAhead ?? 3);
          const when = new Date(Date.now() + inDays * 864e5).toLocaleDateString([], {
            weekday: "short",
            month: "short",
            day: "numeric"
          });
          batch.push({ id: nextId(), role: "system", text: `📅 Appointment booked (${String(data.appointmentType ?? "booking")}) for ${when}` });
          batch.push({
            id: nextId(),
            role: "bot",
            text: `Great news! I've booked your ${String(data.appointmentType ?? "consultation")} for ${when}. 🎉`
          });
          current = outs[0]?.target ?? "";
          continue;
        }
        case "handoff": {
          batch.push({ id: nextId(), role: "system", text: `🤝 Handed off to a human agent${data.note ? ` — "${data.note}"` : ""}` });
          current = "";
          break;
        }
        case "end": {
          batch.push({ id: nextId(), role: "system", text: `🏁 ${String(data.note ?? "Flow ended")}` });
          current = "";
          break;
        }
        case "redirect": {
          batch.push({
            id: nextId(),
            role: "system",
            text: `↪️ Redirect to workflow "${String(data.targetWorkflowName ?? data.targetWorkflowId ?? "—")}"`
          });
          current = "";
          break;
        }
        default: {
          batch.push({ id: nextId(), role: "system", text: `(Unhandled block: ${name})` });
          current = outs[0]?.target ?? "";
          continue;
        }
      }
    }
    if (batch.length > 0) setMsgs((prev) => [...prev, ...batch]);
    setWaiting(pending);
    setBusy(false);
  }
  function handleOption(optionIdx) {
    if (!waiting) return;
    const { options, sourceHandleIds, fromNode } = waiting;
    const label = options[optionIdx];
    setMsgs((prev) => [...prev, { id: nextId(), role: "user", text: label }]);
    const { edges: es } = graphRef.current;
    const edge = es.find((e) => e.source === fromNode && e.sourceHandle === sourceHandleIds[optionIdx]) ?? es.find((e) => e.source === fromNode && e.label === label) ?? es.find((e) => e.source === fromNode);
    setWaiting(null);
    runFrom(edge?.target ?? "");
  }
  function handleOpen(v) {
    if (v) {
      setBusy(true);
      reset();
    } else {
      onClose();
    }
  }
  const scrollRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, waiting]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: handleOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "flex max-h-[85vh] flex-col sm:max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { className: "border-b pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-5 w-5 text-primary" }),
      " Test flow — chat preview"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Simulates the flow as the lead sees it." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "ml-auto shrink-0 rounded-md border px-2 py-1 font-medium hover:bg-muted",
          onClick: () => setShowLeadEditor((v) => !v),
          children: showLeadEditor ? "Hide lead data" : "Edit lead data"
        }
      )
    ] }),
    showLeadEditor && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-3", children: Object.keys(DEFAULT_LEAD).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "space-y-0.5 text-[11px] font-medium text-muted-foreground", children: [
      k,
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          value: lead[k] ?? "",
          onChange: (e) => setLead((l) => ({ ...l, [k]: e.target.value })),
          className: "h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground"
        }
      )
    ] }, k)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: scrollRef, className: "flex-1 space-y-2 overflow-y-auto py-3", children: [
      msgs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-6 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
        " Starting…"
      ] }),
      msgs.map(
        (m) => m.role === "system" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-[90%] rounded-full bg-muted/60 px-3 py-1 text-center text-[11px] text-muted-foreground", children: m.text }) }, m.id) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex", m.role === "user" ? "justify-end" : "justify-start"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: cn(
              "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap",
              m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase opacity-60", children: [
                m.role === "user" ? /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-3 w-3" }),
                m.role === "user" ? "Lead" : "Bot"
              ] }),
              m.text,
              m.options && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-1.5", children: m.options.map((o, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => handleOption(i),
                  className: "rounded-full border border-primary/40 bg-background px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground",
                  children: o
                },
                o
              )) })
            ]
          }
        ) }, m.id)
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 border-t pt-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: reset, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "mr-1 h-3.5 w-3.5" }),
        " Restart"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => onClose(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "mr-1 h-3.5 w-3.5" }),
        " Close"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: busy ? "Running…" : waiting ? "Awaiting reply" : msgs.length > 0 ? "Flow ended" : "" })
    ] })
  ] }) });
}
const BUILTIN_VARS = ["lead_name", "course_interest", "country_interest", "phone_number"];
function unitShort(unit) {
  return TIME_UNITS.find((u) => u.id === unit)?.label.toLowerCase() ?? unit;
}
function blockKindOf(n) {
  const d = n.data ?? {};
  return String(d.type ?? d._t ?? n.type ?? "text");
}
function clone(v) {
  if (typeof structuredClone === "function") return structuredClone(v);
  return JSON.parse(JSON.stringify(v));
}
function nodeSummary(type, d) {
  switch (type) {
    case "text":
      return { main: String(d.content ?? "") || "(empty message)" };
    case "image":
      return { main: String(d.imageUrl ?? "") || "(no image URL)", sub: String(d.caption ?? "") || void 0 };
    case "buttons":
      return {
        main: String(d.message ?? "") || "(no message)",
        sub: (Array.isArray(d.options) ? d.options : []).map((o) => o.label).join(" · ")
      };
    case "wait":
      return { main: `Wait ${d.delayValue ?? 1} ${unitShort(String(d.delayUnit ?? "days"))}` };
    case "condition":
      return {
        main: `${String(d.field ?? "field")} ${String(d.operator ?? "equals")} ${String(d.value ?? "")}`,
        sub: `✓ ${String(d.trueLabel ?? "Yes")}  ·  ✗ ${String(d.falseLabel ?? "No")}`
      };
    case "setvar":
      return { main: `${String(d.varName ?? "")} = ${String(d.varValue ?? "")}` };
    case "ai":
      return { main: String(d.agentName ?? "Default agent"), sub: String(d.instruction ?? "") || void 0 };
    case "http":
      return { main: String(d.actionName ?? "HTTP action") };
    case "booking":
      return { main: `${String(d.appointmentType ?? "booking")} · in ${d.daysAhead ?? 3} days` };
    case "handoff":
      return { main: "Hand off to a human agent", sub: String(d.note ?? "") || void 0 };
    case "end":
      return { main: String(d.note ?? "Flow ended") };
    case "redirect":
      return { main: String(d.targetWorkflowName ?? "Select a workflow…") };
    default:
      return { main: String(d.label ?? type) };
  }
}
function TriggerNode({ data }) {
  const d = data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-44 rounded-xl border-2 border-amber-400/70 bg-card px-3 py-2 shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ZapMini, {}),
      " ",
      d.label ?? "Trigger"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Handle, { type: "source", position: Position.Bottom })
  ] });
}
function ZapMini() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-500", children: "⚡" });
}
function FlowNode({ data, selected, id }) {
  const type = String(data.type ?? data._t ?? "text");
  const d = data ?? {};
  const def = FLOW_BLOCK_MAP[type] ?? FLOW_BLOCK_MAP.text;
  const style = blockStyle(type);
  const summary = nodeSummary(type, d);
  const Icon2 = def.icon;
  const options = Array.isArray(d.options) ? d.options : [];
  const hasBranch = type === "condition" || type === "buttons" && options.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `w-52 rounded-xl border-2 bg-card px-3 py-2 shadow-card transition-shadow ${selected ? "border-primary shadow-glow" : "border-border"}`,
      children: [
        type !== "trigger" && /* @__PURE__ */ jsxRuntimeExports.jsx(Handle, { type: "target", position: Position.Top }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `flex h-5 w-5 items-center justify-center rounded-md ${style.chip}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon2, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-semibold ${style.text}`, children: def.label })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 line-clamp-2 text-xs text-foreground/80", children: summary.main }),
        summary.sub && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 line-clamp-1 text-[10px] text-muted-foreground", children: summary.sub }),
        type === "condition" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Handle,
            {
              type: "source",
              position: Position.Right,
              id: "yes",
              style: { top: "30%", right: -6, background: "#10b981", width: 12, height: 12 },
              className: "!border-2 !border-card"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Handle,
            {
              type: "source",
              position: Position.Right,
              id: "no",
              style: { top: "70%", right: -6, background: "#f43f5e", width: 12, height: 12 },
              className: "!border-2 !border-card"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pointer-events-none absolute right-3 top-4 text-[9px] font-bold text-success", children: "✓" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pointer-events-none absolute right-3 bottom-2 text-[9px] font-bold text-destructive", children: "✗" })
        ] }),
        type === "buttons" && options.map((o, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Handle,
          {
            type: "source",
            position: Position.Right,
            id: `opt_${o.id}`,
            style: { top: `${(i + 1) / (options.length + 1) * 100}%`, right: -6, background: "#8b5cf6", width: 12, height: 12 },
            className: "!border-2 !border-card"
          },
          o.id
        )),
        !hasBranch && type !== "trigger" && /* @__PURE__ */ jsxRuntimeExports.jsx(Handle, { type: "source", position: Position.Bottom })
      ]
    }
  );
}
const nodeTypes = { trigger: TriggerNode, flow: FlowNode };
function defaultGraph() {
  return {
    nodes: [{ id: "trigger", type: "trigger", position: { x: 160, y: 40 }, data: { label: "Trigger" } }],
    edges: []
  };
}
function uid(prefix) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
function normalizeGraph(g) {
  const raw = g ?? {};
  const nodeArr = Array.isArray(raw.nodes) ? raw.nodes : [];
  const nodes = nodeArr.map((n) => {
    const src = n ?? {};
    const id = String(src.id ?? "");
    if (!id) return null;
    let type = String(src.type ?? "");
    const data = src.data && typeof src.data === "object" ? src.data : {};
    if (type === "message") {
      type = "flow";
      data.type = "text";
      data._t = "text";
    } else if (type === "workflow") {
      type = "flow";
      data.type = "redirect";
      data._t = "redirect";
    } else if (type !== "flow" && type !== "trigger") {
      type = "flow";
      data.type = "text";
      data._t = "text";
    }
    const pos = src.position;
    return {
      id,
      type,
      position: pos && typeof pos.x === "number" && typeof pos.y === "number" ? { x: pos.x, y: pos.y } : { x: 160, y: 40 },
      data
    };
  }).filter((n) => Boolean(n));
  const ids = new Set(nodes.map((n) => n.id));
  const edges = (Array.isArray(raw.edges) ? raw.edges : []).map((e) => {
    const src = e ?? {};
    const source = String(src.source ?? "");
    const target = String(src.target ?? "");
    if (!source || !target || !ids.has(source) || !ids.has(target)) return null;
    return {
      id: String(src.id ?? `e_${source}_${target}_${uid("")}`),
      source,
      target,
      sourceHandle: src.sourceHandle ?? null,
      targetHandle: src.targetHandle ?? null
    };
  }).filter((e) => Boolean(e));
  if (nodes.length === 0) return defaultGraph();
  if (!ids.has("trigger")) {
    nodes.unshift({ id: "trigger", type: "trigger", position: { x: 160, y: 40 }, data: { label: "Trigger" } });
  }
  return { nodes, edges };
}
function WorkflowBuilder({
  initial,
  agents,
  workspaces,
  workflows,
  variables,
  onDone
}) {
  const qc = useQueryClient();
  const saveFn = useServerFn(upsertWorkflow);
  const httpFn = useServerFn(listHttpActions);
  const { data: httpData } = useQuery({ queryKey: ["http-actions"], queryFn: () => httpFn() });
  const httpActions = httpData?.actions ?? [];
  const [name, setName] = reactExports.useState(initial.name);
  const [description, setDescription] = reactExports.useState(initial.description ?? "");
  const [workspaceId, setWorkspaceId] = reactExports.useState(initial.workspace_id ?? "");
  const [agentId, setAgentId] = reactExports.useState(initial.agent_id ?? "");
  const [enabled, setEnabled] = reactExports.useState(initial.enabled);
  const [showSettings, setShowSettings] = reactExports.useState(false);
  const initialType = initial.trigger_type ?? (initial.trigger_segment && initial.trigger_segment !== "manual" ? "pipeline_stage" : "manual");
  const initialConfig = initial.trigger_config ?? (initial.trigger_segment && initial.trigger_segment !== "manual" ? { segment: initial.trigger_segment } : {});
  const [triggerType, setTriggerType] = reactExports.useState(initialType);
  const [segment, setSegment] = reactExports.useState(initialConfig.segment ?? PIPELINE_COLUMNS[0].id);
  const [amount, setAmount] = reactExports.useState(initialConfig.amount ?? 1);
  const [unit, setUnit] = reactExports.useState(initialConfig.unit ?? "days");
  const [bookingStatus, setBookingStatus] = reactExports.useState(initialConfig.status ?? "pending");
  const initialGraph = reactExports.useMemo(() => normalizeGraph(initial.graph), []);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraph.edges);
  const [selectedId, setSelectedId] = reactExports.useState(null);
  const [previewOpen, setPreviewOpen] = reactExports.useState(false);
  const [templateChoice, setTemplateChoice] = reactExports.useState("");
  const historyRef = reactExports.useRef([]);
  const futureRef = reactExports.useRef([]);
  const pushHistory = reactExports.useCallback((nds, eds) => {
    historyRef.current.push({ nodes: clone(nds), edges: clone(eds) });
    if (historyRef.current.length > 60) historyRef.current.shift();
    futureRef.current = [];
  }, []);
  const undo = reactExports.useCallback(() => {
    const prev = historyRef.current.pop();
    if (!prev) return;
    futureRef.current.push({ nodes: clone(nodes), edges: clone(edges) });
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setSelectedId(null);
  }, [nodes, edges, setNodes, setEdges]);
  const redo = reactExports.useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) return;
    historyRef.current.push({ nodes: clone(nodes), edges: clone(edges) });
    setNodes(next.nodes);
    setEdges(next.edges);
    setSelectedId(null);
  }, [nodes, edges, setNodes, setEdges]);
  const allVariables = reactExports.useMemo(
    () => [...BUILTIN_VARS, ...(variables ?? []).filter((v) => !BUILTIN_VARS.includes(v))],
    [variables]
  );
  const callableWorkflows = (workflows ?? []).filter((w) => w.id !== initial.id);
  const branchEdgeLabel = (node, handleId) => {
    if (!handleId || !node) return void 0;
    const d = node.data ?? {};
    const kind = blockKindOf(node);
    if (kind === "condition") {
      return handleId === "yes" ? String(d.trueLabel ?? "Yes") : String(d.falseLabel ?? "No");
    }
    if (kind === "buttons" && handleId.startsWith("opt_")) {
      const options = Array.isArray(d.options) ? d.options : [];
      return options.find((o) => `opt_${o.id}` === handleId)?.label;
    }
    return void 0;
  };
  const onConnect = reactExports.useCallback(
    (c) => {
      pushHistory(nodes, edges);
      const sourceNode = nodes.find((n) => n.id === c.source);
      const label = branchEdgeLabel(sourceNode, c.sourceHandle);
      const color = sourceNode ? blockStyle(blockKindOf(sourceNode)).edge : "#94a3b8";
      const newEdge = {
        ...c,
        id: `e_${c.source}_${c.target}_${uid("")}`,
        label,
        data: { branch: label },
        style: label ? { stroke: color, strokeWidth: 2 } : void 0,
        labelStyle: { fontSize: 10, fill: "#fff", fontWeight: 700 },
        labelBgStyle: { fill: color, fillOpacity: 0.9 },
        labelBgPadding: [6, 3],
        labelBgBorderRadius: 6
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [nodes, edges, pushHistory, setEdges]
  );
  const tailNode = reactExports.useMemo(() => {
    const sourceIds = new Set(edges.map((e) => e.source));
    const free = nodes.filter((n) => !sourceIds.has(n.id) && String(n.type) !== "trigger");
    if (free.length > 0) return free[free.length - 1];
    return nodes.find((n) => n.id === selectedId) ?? nodes[nodes.length - 1];
  }, [nodes, edges, selectedId]);
  const canAutoConnect = (n) => {
    if (!n) return false;
    const kind = blockKindOf(n);
    return kind !== "condition" && kind !== "buttons";
  };
  const createNode = reactExports.useCallback(
    (type, position) => {
      const def = FLOW_BLOCK_MAP[type];
      const data = { ...def.defaultData() };
      if (type === "redirect") {
        data.targetWorkflowId = "";
        data.targetWorkflowName = "";
      }
      return {
        id: uid("n_"),
        type: "flow",
        position,
        data: { ...data, type, _t: type }
      };
    },
    []
  );
  const addBlock = reactExports.useCallback(
    (type, at) => {
      if (type === "trigger") {
        toast.info("The trigger block is already on the canvas.");
        return;
      }
      pushHistory(nodes, edges);
      const tail = tailNode;
      const base = at ?? { x: 160, y: (tail?.position.y ?? 40) + (canAutoConnect(tail) ? 140 : 220) };
      const newNode = createNode(type, base);
      setNodes((nds) => [...nds, newNode]);
      if (at && canAutoConnect(tail)) {
        setEdges(
          (eds) => addEdge(
            {
              id: `e_${tail.id}_${newNode.id}_${uid("")}`,
              source: tail.id,
              target: newNode.id,
              sourceHandle: null,
              targetHandle: null
            },
            eds
          )
        );
      }
      setSelectedId(newNode.id);
    },
    [nodes, edges, pushHistory, tailNode, createNode, setNodes, setEdges]
  );
  const onDrop = reactExports.useCallback(
    (e, screenToFlowPosition) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/flowblock");
      if (!raw || !FLOW_BLOCK_MAP[raw]) return;
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      if (!Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return;
      addBlock(raw, { x: Math.max(0, pos.x - 100), y: Math.max(0, pos.y - 30) });
    },
    [addBlock]
  );
  const deleteSelected = reactExports.useCallback(() => {
    if (!selectedId) return;
    pushHistory(nodes, edges);
    setNodes((nds) => nds.filter((n) => n.id !== selectedId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedId && e.target !== selectedId));
    setSelectedId(null);
  }, [selectedId, nodes, edges, pushHistory, setNodes, setEdges]);
  const duplicateSelected = reactExports.useCallback(() => {
    if (!selectedId) return;
    const src = nodes.find((n) => n.id === selectedId);
    if (!src) return;
    pushHistory(nodes, edges);
    const copy = {
      ...src,
      id: uid("dup_"),
      position: { x: src.position.x + 36, y: src.position.y + 36 },
      selected: false,
      data: clone(src.data)
    };
    setNodes((nds) => [...nds, copy]);
    setSelectedId(copy.id);
  }, [selectedId, nodes, edges, pushHistory, setNodes]);
  const updateSelected = reactExports.useCallback(
    (patch) => {
      setNodes((nds) => nds.map((n) => n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n));
    },
    [selectedId, setNodes]
  );
  const selected = nodes.find((n) => n.id === selectedId && n.type !== "trigger");
  const applyTemplate = (tmpl) => {
    setName(tmpl.name);
    setDescription(tmpl.description);
    setTriggerType("manual");
    pushHistory(nodes, edges);
    const tn = [
      { id: "trigger", type: "trigger", position: { x: 160, y: 40 }, data: { label: "Trigger" } }
    ];
    const te = [];
    let prevId = "trigger";
    tmpl.steps.forEach((step, i) => {
      const id = uid("m_");
      tn.push({
        id,
        type: "flow",
        position: { x: 160, y: 40 + (i + 1) * 130 },
        data: { type: "text", _t: "text", content: step.content, delayValue: step.delayValue, delayUnit: step.delayUnit, anchor: "wait", offsetValue: 1, offsetUnit: "days" }
      });
      te.push({ id: uid("e_"), source: prevId, target: id });
      prevId = id;
    });
    setNodes(tn);
    setEdges(te);
    setSelectedId(null);
    toast.success(`Loaded "${tmpl.name}" template`);
  };
  const save = useMutation({
    mutationFn: () => saveFn({
      data: {
        id: initial.id,
        name,
        description: description || null,
        workspace_id: workspaceId || null,
        agent_id: agentId || null,
        trigger_type: triggerType,
        trigger_config: buildTriggerConfig(),
        trigger_segment: triggerType === "pipeline_stage" ? segment : "manual",
        enabled,
        graph: { nodes, edges }
      }
    }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) {
        toast.error(res.error ?? "Failed to save");
        return;
      }
      toast.success("Workflow saved");
      qc.invalidateQueries({ queryKey: ["workflows"] });
      onDone();
    },
    onError: () => toast.error("Failed to save")
  });
  function buildTriggerConfig() {
    if (triggerType === "pipeline_stage") return { segment };
    if (triggerType === "time_since_first_message" || triggerType === "time_since_last_message")
      return { amount, unit };
    if (triggerType === "booking_status") return { status: bookingStatus };
    return {};
  }
  const isTimeTrigger = triggerType === "time_since_first_message" || triggerType === "time_since_last_message";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "Workflow name…", className: "font-semibold" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", onClick: undo, disabled: historyRef.current.length === 0, title: "Undo", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Undo2, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", onClick: redo, disabled: futureRef.current.length === 0, title: "Redo", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Redo2, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setPreviewOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "mr-1 h-4 w-4" }),
          " Test"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(), disabled: save.isPending || !name.trim(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-1 h-4 w-4" }),
          " Save"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setShowSettings((v) => !v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "mr-1 h-4 w-4" }),
          " Settings ",
          showSettings ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5" })
        ] })
      ] })
    ] }),
    showSettings && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border bg-card p-4 shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trigger type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: triggerType,
            onChange: (e) => setTriggerType(e.target.value),
            className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
            children: TRIGGER_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t.id, children: t.label }, t.id))
          }
        )
      ] }),
      triggerType === "pipeline_stage" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pipeline segment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: segment, onChange: (e) => setSegment(e.target.value), className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm", children: PIPELINE_COLUMNS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.id, children: c.label }, c.id)) })
      ] }),
      isTimeTrigger && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Threshold" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: amount, onChange: (e) => setAmount(Math.max(0, Number(e.target.value))), className: "w-20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: unit, onChange: (e) => setUnit(e.target.value), className: "h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm", children: TIME_UNITS.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u.id, children: u.label }, u.id)) })
        ] })
      ] }),
      triggerType === "booking_status" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Booking status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: bookingStatus, onChange: (e) => setBookingStatus(e.target.value), className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm capitalize", children: BOOKING_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, className: "capitalize", children: s }, s)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Connection / Inbox" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: workspaceId, onChange: (e) => setWorkspaceId(e.target.value), className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Lead's inbox / default" }),
          workspaces.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: w.id, children: w.name }, w.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Responder agent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: agentId, onChange: (e) => setAgentId(e.target.value), className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "None" }),
          agents.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: a.id, children: a.name }, a.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start from template" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: templateChoice,
            onChange: (e) => {
              setTemplateChoice(e.target.value);
              const tmpl = MEETING_OUTCOME_TEMPLATES.find((t) => t.name === e.target.value);
              if (tmpl) applyTemplate(tmpl);
            },
            className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select a template…" }),
              MEETING_OUTCOME_TEMPLATES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t.name, children: t.name }, t.name))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Optional notes" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 pt-6 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: enabled, onCheckedChange: setEnabled }),
        " Enabled"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-[200px_1fr_300px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "order-2 lg:order-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-2 space-y-3 rounded-2xl border bg-card p-3 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Blocks" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4 overflow-x-auto pb-1 lg:max-h-[52vh] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible", children: FLOW_CATEGORIES.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 lg:shrink", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70", children: cat }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5 lg:flex-col", children: FLOW_BLOCKS.filter((b) => b.category === cat).map((b) => {
            const style = blockStyle(b.type);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                draggable: true,
                onDragStart: (e) => {
                  e.dataTransfer.setData("application/flowblock", b.type);
                  e.dataTransfer.effectAllowed = "copy";
                },
                onClick: () => addBlock(b.type),
                title: b.description,
                className: `flex items-center gap-2 rounded-lg border bg-muted/30 px-2 py-1.5 text-left text-xs font-medium transition-colors hover:bg-muted ${style.ring}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "h-3 w-3 shrink-0 text-muted-foreground/50" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${style.chip}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(b.icon, { className: "h-3.5 w-3.5" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: b.label })
                ]
              },
              b.type
            );
          }) })
        ] }, cat)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hidden text-[10px] leading-snug text-muted-foreground lg:block", children: "Drag a block onto the canvas or click to append it to the flow." })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "order-1 lg:order-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReactFlowProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        CanvasArea,
        {
          nodes,
          edges,
          onNodesChange,
          onEdgesChange,
          onConnect,
          onSelect: setSelectedId,
          onDropBlock: onDrop
        }
      ) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "order-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-2 rounded-2xl border bg-card p-4 shadow-card", children: selected ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        NodeInspector,
        {
          node: selected,
          allVariables,
          callableWorkflows,
          agents,
          httpActions,
          onPatch: updateSelected,
          onClose: () => setSelectedId(null),
          onDelete: deleteSelected,
          onDuplicate: duplicateSelected
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "Block settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Select a block on the canvas to edit its content, branches and timing." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-inside list-disc space-y-1 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Drag from the ⚡ handle to connect blocks." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Condition blocks branch via the ✓ / ✗ handles." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Button blocks branch via each option's handle." })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WorkflowPreview, { open: previewOpen, onClose: () => setPreviewOpen(false), nodes, edges })
  ] });
}
function CanvasArea({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelect,
  onDropBlock
}) {
  const { screenToFlowPosition } = useReactFlow();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "h-[540px] overflow-hidden rounded-2xl border bg-muted/20 md:h-[560px]",
      onDragOver: (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      },
      onDrop: (e) => onDropBlock(e, screenToFlowPosition),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        index,
        {
          nodes,
          edges,
          onNodesChange,
          onEdgesChange,
          onConnect,
          onNodeClick: (_, n) => onSelect(n.id),
          onPaneClick: () => onSelect(""),
          nodeTypes,
          fitView: true,
          proOptions: { hideAttribution: true },
          defaultEdgeOptions: { type: "smoothstep" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Background, { gap: 20, size: 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Controls, {})
          ]
        }
      )
    }
  );
}
const EMPTY_WORKFLOW = {
  name: "",
  description: "",
  workspace_id: null,
  agent_id: null,
  trigger_segment: "manual",
  trigger_type: "manual",
  trigger_config: {},
  enabled: false,
  graph: {}
};
function WorkflowManager() {
  const qc = useQueryClient();
  const listFn = useServerFn(listWorkflows);
  const delFn = useServerFn(deleteWorkflow);
  const agentsFn = useServerFn(listResponderAgents);
  const wsFn = useServerFn(listWorkspaces);
  const varsFn = useServerFn(listAiVariables);
  const { data } = useQuery({ queryKey: ["workflows"], queryFn: () => listFn() });
  const { data: agentsData } = useQuery({ queryKey: ["responder-agents"], queryFn: () => agentsFn() });
  const { data: wsData } = useQuery({ queryKey: ["workspaces"], queryFn: () => wsFn() });
  const { data: varsData } = useQuery({ queryKey: ["ai-variables"], queryFn: () => varsFn() });
  const workflows = data?.workflows ?? [];
  const agents = (agentsData?.agents ?? []).map((a) => ({
    id: a.id,
    name: a.name
  }));
  const workspaces = (wsData?.workspaces ?? []).map((w) => ({
    id: w.id,
    name: w.name
  }));
  const workflowOptions = workflows.filter((w) => Boolean(w.id)).map((w) => ({ id: w.id, name: w.name }));
  const variableNames = (varsData?.variables ?? []).map((v) => v.variable_name);
  const [editing, setEditing] = reactExports.useState(null);
  const del = useMutation({
    mutationFn: (id) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Workflow deleted");
      qc.invalidateQueries({ queryKey: ["workflows"] });
    },
    onError: () => toast.error("Failed to delete")
  });
  if (editing) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      WorkflowBuilder,
      {
        initial: editing,
        agents,
        workspaces,
        workflows: workflowOptions,
        variables: variableNames,
        onDone: () => setEditing(null)
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Visually build outbound message sequences. Choose how leads are enrolled (pipeline stage, time since first/last message, or booking status) and which responder agent takes over when a lead reacts." }),
    workflows.map((w) => {
      const triggerLabel = w.trigger_type && w.trigger_type !== "pipeline_stage" ? triggerTypeLabel(w.trigger_type) : triggerTypeLabel("pipeline_stage");
      const agentName = agents.find((a) => a.id === w.agent_id)?.name ?? "No responder";
      const stepCount = (w.graph?.nodes ?? []).filter((n) => {
        const t = n.type;
        const d = n.data;
        const kind = d?.type ?? d?._t ?? t;
        return Boolean(kind) && kind !== "trigger";
      }).length;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 rounded-xl border bg-card p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Workflow, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: w.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "span",
              {
                className: `flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${w.enabled ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Power, { className: "h-3 w-3" }),
                  " ",
                  w.enabled ? "Active" : "Off"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 truncate text-xs text-muted-foreground", children: [
            triggerLabel,
            " · ",
            stepCount,
            " step",
            stepCount === 1 ? "" : "s",
            " · ",
            agentName
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setEditing(w), children: "Edit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              onClick: () => {
                if (confirm(`Delete workflow "${w.name}"?`)) del.mutate(w.id);
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" })
            }
          )
        ] })
      ] }, w.id);
    }),
    workflows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No workflows yet." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setEditing({ ...EMPTY_WORKFLOW }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
      " New Workflow"
    ] }) })
  ] });
}
const BUILT_IN_MODELS = [
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "openai/gpt-5-mini",
  "openai/gpt-5"
];
const CUSTOM_PRESETS = [
  { id: "openai", label: "OpenAI", base_url: "https://api.openai.com/v1", models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1-mini"] },
  { id: "anthropic", label: "Anthropic", base_url: "https://api.anthropic.com", models: ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest"] },
  { id: "google", label: "Google Gemini", base_url: "https://generativelanguage.googleapis.com/v1beta/openai", models: ["gemini-2.5-flash", "gemini-2.5-pro"] },
  { id: "groq", label: "Groq", base_url: "https://api.groq.com/openai/v1", models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"] },
  { id: "deepseek", label: "DeepSeek", base_url: "https://api.deepseek.com/v1", models: ["deepseek-chat", "deepseek-reasoner"] },
  { id: "openrouter", label: "OpenRouter", base_url: "https://openrouter.ai/api/v1", models: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet"] },
  { id: "custom", label: "Custom (OpenAI-compatible)", base_url: "", models: [] }
];
const EMPTY_AGENT = {
  name: "",
  description: "",
  workspace_id: null,
  system_prompt: "",
  model: BUILT_IN_MODELS[0],
  temperature: 0.7,
  provider_mode: "inherit",
  custom_provider: "openai",
  custom_base_url: "",
  custom_model: "",
  custom_api_key: "",
  inherit_variables: true,
  enabled: true
};
function ProviderButton({
  active,
  onClick,
  icon: Icon2,
  title,
  subtitle
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: cn(
        "flex items-start gap-2 rounded-xl border p-3 text-left transition-colors",
        active ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon2, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-sm font-semibold", children: title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs text-muted-foreground", children: subtitle })
        ] })
      ]
    }
  );
}
function AgentVariables({ agentId }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listResponderAgentVariables);
  const upFn = useServerFn(upsertResponderAgentVariable);
  const delFn = useServerFn(deleteResponderAgentVariable);
  const { data } = useQuery({
    queryKey: ["agent-vars", agentId],
    queryFn: () => listFn({ data: { agentId } })
  });
  const variables = data?.variables ?? [];
  const [draft, setDraft] = reactExports.useState({ variable_name: "", variable_value: "" });
  const up = useMutation({
    mutationFn: (v) => upFn({ data: { agent_id: agentId, ...v } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-vars", agentId] });
      setDraft({ variable_name: "", variable_value: "" });
    },
    onError: () => toast.error("Use UPPER_CASE names (letters, numbers, _)")
  });
  const del = useMutation({
    mutationFn: (id) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agent-vars", agentId] })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-xl border bg-muted/10 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "Override or add variables for this agent. Reference them as ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "{{NAME}}" }),
      " in the prompt."
    ] }),
    variables.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-40 shrink-0 truncate font-mono text-xs font-semibold", children: v.variable_name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate text-muted-foreground", children: v.variable_value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 text-destructive", onClick: () => del.mutate(v.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
    ] }, v.id)),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "VARIABLE_NAME",
          value: draft.variable_name,
          onChange: (e) => setDraft((d) => ({ ...d, variable_name: e.target.value.toUpperCase() })),
          className: "h-8 font-mono text-xs sm:w-44"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "Value",
          value: draft.variable_value,
          onChange: (e) => setDraft((d) => ({ ...d, variable_value: e.target.value })),
          className: "h-8 text-xs"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "sm",
          className: "h-8",
          disabled: !draft.variable_name || !draft.variable_value,
          onClick: () => up.mutate(draft),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" })
        }
      )
    ] })
  ] });
}
function AgentEditor({ initial, onDone }) {
  const qc = useQueryClient();
  const saveFn = useServerFn(upsertResponderAgent);
  const wsFn = useServerFn(listWorkspaces);
  const { data: wsData } = useQuery({ queryKey: ["workspaces"], queryFn: () => wsFn() });
  const workspaces = wsData?.workspaces ?? [];
  const [form, setForm] = reactExports.useState(initial);
  reactExports.useEffect(() => setForm(initial), [initial]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const preset = CUSTOM_PRESETS.find((p) => p.id === form.custom_provider) ?? CUSTOM_PRESETS[0];
  const save = useMutation({
    mutationFn: () => saveFn({ data: { ...form, custom_api_key: form.custom_api_key || "" } }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) {
        toast.error(res.error ?? "Failed to save");
        return;
      }
      toast.success("Agent saved");
      qc.invalidateQueries({ queryKey: ["responder-agents"] });
      if (!form.id && res.id) set("id", res.id);
      else onDone();
    },
    onError: () => toast.error("Failed to save")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-2xl border bg-card p-4 shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Agent Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => set("name", e.target.value), placeholder: "Follow-up Closer" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Connection / Inbox" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: form.workspace_id ?? "",
            onChange: (e) => set("workspace_id", e.target.value || null),
            className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Use lead's inbox / default" }),
              workspaces.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: w.id, children: w.name }, w.id))
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: form.description ?? "",
          onChange: (e) => set("description", e.target.value),
          placeholder: "What this responder agent does"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "AI Provider" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ProviderButton,
          {
            active: form.provider_mode === "inherit",
            onClick: () => set("provider_mode", "inherit"),
            icon: GitBranch,
            title: "Inherit",
            subtitle: "Use qualification agent's provider & model"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ProviderButton,
          {
            active: form.provider_mode === "custom",
            onClick: () => set("provider_mode", "custom"),
            icon: KeyRound,
            title: "Own API Key",
            subtitle: "Your provider, model & key."
          }
        )
      ] })
    ] }),
    form.provider_mode === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-xl border bg-muted/20 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Provider" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: form.custom_provider ?? "openai",
              onChange: (e) => {
                const p = CUSTOM_PRESETS.find((x) => x.id === e.target.value);
                set("custom_provider", e.target.value);
                if (p && p.id !== "custom") {
                  set("custom_base_url", p.base_url);
                  if (!p.models.includes(form.custom_model ?? "")) set("custom_model", p.models[0] ?? "");
                }
              },
              className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
              children: CUSTOM_PRESETS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p.id, children: p.label }, p.id))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Model" }),
          preset.models.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: form.custom_model ?? "",
              onChange: (e) => set("custom_model", e.target.value),
              className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
              children: [...new Set([...preset.models, form.custom_model].filter(Boolean))].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: m, children: m }, m))
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.custom_model ?? "",
              onChange: (e) => set("custom_model", e.target.value),
              placeholder: "model-name"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Base URL" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.custom_base_url ?? "",
            onChange: (e) => set("custom_base_url", e.target.value),
            placeholder: "https://api.openai.com/v1",
            disabled: form.custom_provider !== "custom" && form.custom_provider !== "anthropic"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "API Key" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "password",
            value: form.custom_api_key ?? "",
            onChange: (e) => set("custom_api_key", e.target.value),
            placeholder: initial.custom_api_key === "********" ? "•••••• (saved — leave blank to keep)" : "Paste your API key"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "System Prompt" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          value: form.system_prompt,
          onChange: (e) => set("system_prompt", e.target.value),
          rows: 8,
          className: "font-mono text-sm",
          placeholder: "Define how this responder agent talks to leads who react…"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: form.inherit_variables, onCheckedChange: (v) => set("inherit_variables", v) }),
        "Inherit AI variables from qualification agent"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: form.enabled, onCheckedChange: (v) => set("enabled", v) }),
        " Enabled"
      ] })
    ] }),
    form.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Agent Variable Overrides" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AgentVariables, { agentId: form.id })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Save the agent to add variable overrides." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(), disabled: save.isPending || !form.name, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-1 h-4 w-4" }),
        " Save Agent"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onDone, children: "Close" })
    ] })
  ] });
}
function ResponderAgentManager() {
  const qc = useQueryClient();
  const listFn = useServerFn(listResponderAgents);
  const delFn = useServerFn(deleteResponderAgent);
  const { data } = useQuery({ queryKey: ["responder-agents"], queryFn: () => listFn() });
  const agents = data?.agents ?? [];
  const [editing, setEditing] = reactExports.useState(null);
  const del = useMutation({
    mutationFn: (id) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Agent deleted");
      qc.invalidateQueries({ queryKey: ["responder-agents"] });
    },
    onError: () => toast.error("Failed to delete")
  });
  if (editing) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AgentEditor, { initial: editing, onDone: () => setEditing(null) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Responder agents reply to leads who react to a workflow's outbound messages. Each agent has its own prompt, variables, model and provider — just like the qualification agent." }),
    agents.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 rounded-xl border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: a.name }),
          a.is_default && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary", children: "Default" }),
          !a.enabled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground", children: "Disabled" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 truncate text-xs text-muted-foreground", children: a.is_default ? `Qualification agent · ${a.model} · managed in AI Settings` : `${a.provider_mode === "inherit" ? "Inherits provider" : a.provider_mode === "built_in" ? `Uses AI Settings · ${a.model}` : `Custom · ${a.custom_model || a.custom_provider}`}${a.description ? ` · ${a.description}` : ""}` })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex shrink-0 gap-1", children: a.is_default ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "self-center text-xs text-muted-foreground", children: "Routable in workflows" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setEditing(a), children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            onClick: () => {
              if (confirm(`Delete agent "${a.name}"?`)) del.mutate(a.id);
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" })
          }
        )
      ] }) })
    ] }, a.id)),
    agents.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No responder agents yet." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setEditing(EMPTY_AGENT), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
      " New Responder Agent"
    ] })
  ] });
}
const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "sms", label: "SMS" },
  { id: "email", label: "Email" },
  { id: "other", label: "Other" }
];
const WEEKDAYS$1 = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" }
];
const STATUS_STYLES$1 = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-warning/15 text-warning",
  running: "bg-success/15 text-success",
  paused: "bg-warning/15 text-warning",
  completed: "bg-primary/15 text-primary",
  cancelled: "bg-destructive/15 text-destructive"
};
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    if (row.some((c) => c.trim() !== "")) rows.push(row);
    row = [];
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") pushField();
    else if (ch === "\n") pushRow();
    else if (ch === "\r") ;
    else field += ch;
  }
  if (field !== "" || row.length > 0) pushRow();
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] ?? "").trim();
    });
    return obj;
  });
}
function CampaignManager() {
  const qc = useQueryClient();
  const listFn = useServerFn(listCampaigns);
  const delFn = useServerFn(deleteCampaign);
  const statusFn = useServerFn(setCampaignStatus);
  const { data } = useQuery({ queryKey: ["campaigns"], queryFn: () => listFn(), refetchInterval: 8e3 });
  const campaigns = data?.campaigns ?? [];
  const [editingId, setEditingId] = reactExports.useState(null);
  const del = useMutation({
    mutationFn: (id) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Campaign deleted");
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: () => toast.error("Failed to delete")
  });
  const changeStatus = useMutation({
    mutationFn: (v) => statusFn({ data: v }),
    onSuccess: (res) => {
      if (res && res.ok) {
        qc.invalidateQueries({ queryKey: ["campaigns"] });
      } else {
        toast.error(res?.error ?? "Action failed");
      }
    },
    onError: () => toast.error("Action failed")
  });
  if (editingId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CampaignEditor, { campaignId: editingId === "new" ? null : editingId, onBack: () => setEditingId(null) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Send bulk WhatsApp, SMS or email through controlled drip schedules. Pick contacts by offer, pipeline stage or CSV upload, then send in batches with delays. Replies stop the drip for that contact and flow into the inbox, where your AI agents and workflows take over." }),
    campaigns.map((c) => {
      const s = c.stats;
      const progress = s.total > 0 ? Math.round((s.total - s.pending) / s.total * 100) : 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border bg-card p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: c.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                  STATUS_STYLES$1[c.status] ?? "bg-muted text-muted-foreground"
                ),
                children: c.status
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground", children: c.channel })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
            s.total,
            " recipient",
            s.total === 1 ? "" : "s",
            " · ",
            progress,
            "% processed"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stat$1, { label: "Pending", value: s.pending }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stat$1, { label: "Sent", value: s.sent, tone: "text-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stat$1, { label: "Delivered", value: s.delivered }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stat$1, { label: "Opened", value: s.opened }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stat$1, { label: "Replied", value: s.replied, tone: "text-success" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stat$1, { label: "Failed", value: s.failed, tone: "text-destructive" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 flex-wrap gap-1", children: [
          (c.status === "draft" || c.status === "scheduled") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => changeStatus.mutate({ id: c.id, action: "start" }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "mr-1 h-3.5 w-3.5" }),
            " Start"
          ] }),
          c.status === "running" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => changeStatus.mutate({ id: c.id, action: "pause" }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "mr-1 h-3.5 w-3.5" }),
            " Pause"
          ] }),
          c.status === "paused" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => changeStatus.mutate({ id: c.id, action: "resume" }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "mr-1 h-3.5 w-3.5" }),
            " Resume"
          ] }),
          (c.status === "running" || c.status === "paused" || c.status === "scheduled") && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              onClick: () => {
                if (confirm(`Cancel campaign "${c.name}"? Pending messages won't be sent.`))
                  changeStatus.mutate({ id: c.id, action: "cancel" });
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "mr-1 h-3.5 w-3.5" }),
                " Cancel"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setEditingId(c.id), children: "Edit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              onClick: () => {
                if (confirm(`Delete campaign "${c.name}"?`)) del.mutate(c.id);
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" })
            }
          )
        ] })
      ] }) }, c.id);
    }),
    campaigns.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No campaigns yet." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setEditingId("new"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
      " New Campaign"
    ] })
  ] });
}
function Stat$1({ label, value, tone }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
      label,
      ":"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("font-semibold", tone ?? "text-muted-foreground"), children: value })
  ] });
}
function CampaignEditor({ campaignId, onBack }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listCampaigns);
  const optsFn = useServerFn(getCampaignOptions);
  const createFn = useServerFn(createCampaign);
  const updateFn = useServerFn(updateCampaign);
  const recipFn = useServerFn(listCampaignRecipients);
  const addLeadsFn = useServerFn(addRecipientsFromLeads);
  const addCsvFn = useServerFn(addRecipientsFromCsv);
  const clearFn = useServerFn(clearPendingRecipients);
  const { data: optsData } = useQuery({ queryKey: ["campaign-options"], queryFn: () => optsFn() });
  const opts = {
    workspaces: optsData?.workspaces ?? [],
    offers: optsData?.offers ?? [],
    stages: optsData?.stages ?? []
  };
  const { data: listData } = useQuery({ queryKey: ["campaigns"], queryFn: () => listFn() });
  const existing = (listData?.campaigns ?? []).find((c) => c.id === campaignId);
  const [id, setId] = reactExports.useState(campaignId);
  const [name, setName] = reactExports.useState(existing?.name ?? "");
  const [channel, setChannel] = reactExports.useState(existing?.channel ?? "whatsapp");
  const [workspaceId, setWorkspaceId] = reactExports.useState(existing?.workspace_id ?? null);
  const [template, setTemplate] = reactExports.useState(existing?.message_template ?? "");
  const [batchSize, setBatchSize] = reactExports.useState(existing?.batch_size ?? 25);
  const [delaySeconds, setDelaySeconds] = reactExports.useState(existing?.delay_seconds ?? 2);
  const [sendRate, setSendRate] = reactExports.useState(existing?.send_rate_per_min ?? 60);
  const [startAt, setStartAt] = reactExports.useState(toLocalInput(existing?.start_at));
  const [endAt, setEndAt] = reactExports.useState(toLocalInput(existing?.end_at));
  const [variations, setVariations] = reactExports.useState(existing?.message_variations ?? []);
  const [batchBreak, setBatchBreak] = reactExports.useState(Math.round((existing?.batch_break_seconds ?? 60) / 60));
  const [sendDays, setSendDays] = reactExports.useState(existing?.send_days ?? [0, 1, 2, 3, 4, 5, 6]);
  const [windowStart, setWindowStart] = reactExports.useState(existing?.send_window_start ?? "");
  const [windowEnd, setWindowEnd] = reactExports.useState(existing?.send_window_end ?? "");
  const [timezone, setTimezone] = reactExports.useState(
    existing?.send_timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC"
  );
  const locked = existing ? !["draft", "scheduled", "paused"].includes(existing.status) : false;
  const { data: recipData } = useQuery({
    queryKey: ["campaign-recipients", id],
    queryFn: () => recipFn({ data: { campaignId: id } }),
    enabled: Boolean(id),
    refetchInterval: 8e3
  });
  const recipients = recipData?.recipients ?? [];
  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        channel,
        workspace_id: workspaceId,
        message_template: template,
        message_variations: variations.map((v) => v.trim()).filter(Boolean),
        batch_size: Number(batchSize),
        delay_seconds: Number(delaySeconds),
        batch_break_seconds: Math.max(0, Math.round(Number(batchBreak) * 60)),
        send_rate_per_min: Number(sendRate),
        send_days: sendDays.length ? sendDays : [0, 1, 2, 3, 4, 5, 6],
        send_window_start: windowStart || null,
        send_window_end: windowEnd || null,
        send_timezone: timezone || "UTC",
        start_at: fromLocalInput(startAt),
        end_at: fromLocalInput(endAt)
      };
      if (id) return updateFn({ data: { id, ...payload } });
      return createFn({ data: payload });
    },
    onSuccess: (res) => {
      const r = res;
      if (!r.ok) {
        toast.error(r.error ?? "Could not save");
        return;
      }
      if (!id && r.id) setId(r.id);
      toast.success("Campaign saved");
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: () => toast.error("Could not save")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: onBack, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "mr-1 h-4 w-4" }),
        " Back"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: id ? "Edit campaign" : "New campaign" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Campaign name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "Spring intake outreach" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Channel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: channel, onValueChange: setChannel, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CHANNELS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.label }, c.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sending connection" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: workspaceId ?? "", onValueChange: (v) => setWorkspaceId(v || null), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose connection" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: opts.workspaces.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: w.id, children: [
            w.name,
            " (",
            w.provider_type,
            ")"
          ] }, w.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Message template" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: template,
            onChange: (e) => setTemplate(e.target.value),
            rows: 5,
            placeholder: "Hi {{first_name}}, we have openings for {{course_interest}}…"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
          "Merge fields: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "{{first_name}}" }),
          ", ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "{{name}}" }),
          ",",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "{{course_interest}}" }),
          ", ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "{{country_interest}}" }),
          ", or any CSV column (e.g.",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "{{company_name}}" }),
          ")."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 rounded-lg border bg-muted/20 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Message variations (spintax / A-B rotation)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              onClick: () => setVariations((v) => [...v, ""]),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-3.5 w-3.5" }),
                " Add variation"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "The sender rotates evenly between the main template and these variations to reduce the chance of being flagged as spam. Merge fields work here too." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-2", children: [
          variations.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No variations yet — only the main template will be used." }),
          variations.map((v, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: v,
                onChange: (e) => setVariations((arr) => arr.map((x, idx) => idx === i ? e.target.value : x)),
                rows: 3,
                placeholder: `Variation ${i + 1} — e.g. Hey {{first_name}}! Spots are opening for {{course_interest}}.`,
                className: "flex-1"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "icon",
                onClick: () => setVariations((arr) => arr.filter((_, idx) => idx !== i)),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" })
              }
            )
          ] }, i))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch size (per minute)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 1,
            max: 100,
            value: batchSize,
            onChange: (e) => setBatchSize(Number(e.target.value))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delay between messages (sec)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 0,
            max: 5,
            value: delaySeconds,
            onChange: (e) => setDelaySeconds(Number(e.target.value))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Max send rate (per min)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 1,
            max: 600,
            value: sendRate,
            onChange: (e) => setSendRate(Number(e.target.value))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Break between batches (min)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 0,
            max: 1440,
            value: batchBreak,
            onChange: (e) => setBatchBreak(Number(e.target.value))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 rounded-lg border bg-muted/20 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Drip sending schedule" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Restrict sending to specific weekdays and a time-of-day window. Messages outside this window wait until the next allowed slot." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex flex-wrap gap-1.5", children: WEEKDAYS$1.map((d) => {
          const on = sendDays.includes(d.value);
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setSendDays(
                (arr) => arr.includes(d.value) ? arr.filter((x) => x !== d.value) : [...arr, d.value].sort()
              ),
              className: cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
              ),
              children: d.label
            },
            d.value
          );
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid gap-3 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "From (time)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: windowStart, onChange: (e) => setWindowStart(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "To (time)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: windowEnd, onChange: (e) => setWindowEnd(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Timezone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: timezone,
                onChange: (e) => setTimezone(e.target.value),
                placeholder: "e.g. Europe/London"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Leave the time fields empty to send at any hour on the selected days." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start date/time (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", value: startAt, onChange: (e) => setStartAt(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "End date/time (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", value: endAt, onChange: (e) => setEndAt(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(), disabled: save.isPending || !name.trim(), children: [
        save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : null,
        "Save campaign"
      ] }) })
    ] }),
    id ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      AudienceManager,
      {
        campaignId: id,
        opts,
        locked,
        recipients,
        onChanged: () => {
          qc.invalidateQueries({ queryKey: ["campaign-recipients", id] });
          qc.invalidateQueries({ queryKey: ["campaigns"] });
        },
        addLeads: (v) => addLeadsFn({ data: v }),
        addCsv: (v) => addCsvFn({ data: v }),
        clearPending: () => clearFn({ data: { campaignId: id } })
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Save the campaign first to add recipients." })
  ] });
}
function AudienceManager({
  campaignId,
  opts,
  locked,
  recipients,
  onChanged,
  addLeads,
  addCsv,
  clearPending
}) {
  const [source, setSource] = reactExports.useState("offer");
  const [offerId, setOfferId] = reactExports.useState("");
  const [stageKeys, setStageKeys] = reactExports.useState([]);
  const [busy, setBusy] = reactExports.useState(false);
  const fileRef = reactExports.useRef(null);
  const handleResult = (res) => {
    const r = res;
    if (r?.ok) {
      toast.success(`Added ${r.added ?? 0} recipient(s)${r.skipped ? `, skipped ${r.skipped}` : ""}`);
      onChanged();
    } else {
      toast.error(r?.error ?? "Could not add recipients");
    }
  };
  const addFromLeads = async () => {
    setBusy(true);
    try {
      if (source === "offer" && !offerId) {
        toast.error("Choose an offer");
        return;
      }
      if (source === "stage" && stageKeys.length === 0) {
        toast.error("Choose at least one stage");
        return;
      }
      const res = await addLeads({
        campaignId,
        source,
        offerId: source === "offer" ? offerId : void 0,
        stageKeys: source === "stage" ? stageKeys : void 0
      });
      handleResult(res);
    } finally {
      setBusy(false);
    }
  };
  const onCsvFile = async (file) => {
    setBusy(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) {
        toast.error("No rows found. Ensure the CSV has a header row and a phone column.");
        return;
      }
      const res = await addCsv({ campaignId, rows: rows.slice(0, 1e4) });
      handleResult(res);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const toggleStage = (keys) => {
    setStageKeys((prev) => {
      const has = keys.every((k) => prev.includes(k));
      if (has) return prev.filter((k) => !keys.includes(k));
      return Array.from(/* @__PURE__ */ new Set([...prev, ...keys]));
    });
  };
  const counts = reactExports.useMemo(() => {
    const c = {};
    for (const r of recipients) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [recipients]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-xl border bg-card p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold", children: "Audience" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
        recipients.length,
        " recipients"
      ] })
    ] }),
    locked ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This campaign is finished; its audience can no longer be changed." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: [
        { id: "offer", label: "By offer" },
        { id: "stage", label: "By pipeline stage" },
        { id: "all", label: "All contacts" },
        { id: "csv", label: "CSV upload" }
      ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setSource(s.id),
          className: cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium",
            source === s.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          ),
          children: s.label
        },
        s.id
      )) }),
      source === "offer" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[200px] flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Offer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: offerId, onValueChange: setOfferId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose offer" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: opts.offers.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.id, children: o.name }, o.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: addFromLeads, disabled: busy, children: [
          busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
          "Add"
        ] })
      ] }),
      source === "stage" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1", children: [
          opts.stages.map((st) => {
            const active = st.stage_keys.length > 0 && st.stage_keys.every((k) => stageKeys.includes(k));
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => toggleStage(st.stage_keys),
                className: cn(
                  "rounded-full border px-3 py-1 text-xs",
                  active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                ),
                children: [
                  st.pipeline_name ? `${st.pipeline_name}: ` : "",
                  st.label
                ]
              },
              st.id
            );
          }),
          opts.stages.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "No pipeline stages found." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: addFromLeads, disabled: busy, children: [
          busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
          "Add stage contacts"
        ] })
      ] }),
      source === "all" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: addFromLeads, disabled: busy, children: [
        busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
        "Add all contacts"
      ] }) }),
      source === "csv" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: fileRef,
            type: "file",
            accept: ".csv,text/csv",
            className: "hidden",
            onChange: (e) => {
              const f = e.target.files?.[0];
              if (f) onCsvFile(f);
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => fileRef.current?.click(), disabled: busy, children: [
          busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "mr-1 h-4 w-4" }),
          "Upload CSV"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "CSV needs a header row with a ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "phone" }),
          " column. Optional ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "name" }),
          " and any extra columns become merge fields."
        ] })
      ] })
    ] }),
    recipients.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground", children: ["pending", "sent", "delivered", "opened", "replied", "failed"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Stat$1, { label: k, value: counts[k] ?? 0 }, k)) }),
        !locked && (counts.pending ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: async () => {
              if (!confirm("Remove all pending recipients?")) return;
              await clearPending();
              onChanged();
            },
            children: "Clear pending"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-72 overflow-y-auto rounded-lg border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "sticky top-0 bg-muted/60 text-left text-[11px] uppercase text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Phone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2", children: "Status" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: recipients.slice(0, 500).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: r.name ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-muted-foreground", children: r.phone_number }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                r.status === "replied" ? "bg-success/15 text-success" : r.status === "failed" ? "bg-destructive/15 text-destructive" : r.status === "sent" || r.status === "delivered" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              ),
              title: r.error ?? void 0,
              children: r.status
            }
          ) })
        ] }, r.id)) })
      ] }) })
    ] })
  ] });
}
function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}
const SECTIONS$2 = [
  { id: "workflows", label: "Workflows", icon: Workflow },
  { id: "agents", label: "Responder Agents", icon: Bot },
  { id: "campaigns", label: "Drip Campaigns", icon: Send }
];
function OrchestrationTab() {
  const [section, setSection] = reactExports.useState("workflows");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-[200px_1fr]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-row flex-wrap gap-1 lg:flex-col", children: SECTIONS$2.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setSection(s.id),
        className: cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          section === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "h-4 w-4" }),
          s.label
        ]
      },
      s.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      section === "workflows" && /* @__PURE__ */ jsxRuntimeExports.jsx(WorkflowManager, {}),
      section === "agents" && /* @__PURE__ */ jsxRuntimeExports.jsx(ResponderAgentManager, {}),
      section === "campaigns" && /* @__PURE__ */ jsxRuntimeExports.jsx(CampaignManager, {})
    ] })
  ] });
}
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DayPicker,
    {
      showOutsideDays,
      className: cn(
        "bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      ),
      captionLayout,
      formatters: {
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters
      },
      classNames: {
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn("bg-popover absolute inset-0 opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label" ? "text-sm" : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
        week_number: cn(
          "text-muted-foreground select-none text-[0.8rem]",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day
        ),
        range_start: cn("bg-accent rounded-l-md", defaultClassNames.range_start),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames
      },
      components: {
        Root: ({ className: className2, rootRef, ...props2 }) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-slot": "calendar", ref: rootRef, className: cn(className2), ...props2 });
        },
        Chevron: ({ className: className2, orientation, ...props2 }) => {
          if (orientation === "left") {
            return /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: cn("size-4", className2), ...props2 });
          }
          if (orientation === "right") {
            return /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: cn("size-4", className2), ...props2 });
          }
          return /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: cn("size-4", className2), ...props2 });
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props2 }) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx("td", { ...props2, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex size-(--cell-size) items-center justify-center text-center", children }) });
        },
        ...components
      },
      ...props
    }
  );
}
function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();
  const ref = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      ref,
      variant: "ghost",
      size: "icon",
      "data-day": day.date.toLocaleDateString(),
      "data-selected-single": modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle,
      "data-range-start": modifiers.range_start,
      "data-range-end": modifiers.range_end,
      "data-range-middle": modifiers.range_middle,
      className: cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-(--cell-size) flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      ),
      ...props
    }
  );
}
const Command = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  _e,
  {
    ref,
    className: cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    ),
    ...props
  }
));
Command.displayName = _e.displayName;
const CommandInput = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center border-b px-3", "cmdk-input-wrapper": "", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    _e.Input,
    {
      ref,
      className: cn(
        "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props
    }
  )
] }));
CommandInput.displayName = _e.Input.displayName;
const CommandList = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  _e.List,
  {
    ref,
    className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
    ...props
  }
));
CommandList.displayName = _e.List.displayName;
const CommandEmpty = reactExports.forwardRef((props, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(_e.Empty, { ref, className: "py-6 text-center text-sm", ...props }));
CommandEmpty.displayName = _e.Empty.displayName;
const CommandGroup = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  _e.Group,
  {
    ref,
    className: cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    ),
    ...props
  }
));
CommandGroup.displayName = _e.Group.displayName;
const CommandSeparator = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  _e.Separator,
  {
    ref,
    className: cn("-mx-1 h-px bg-border", className),
    ...props
  }
));
CommandSeparator.displayName = _e.Separator.displayName;
const CommandItem = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  _e.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className
    ),
    ...props
  }
));
CommandItem.displayName = _e.Item.displayName;
const EDIT_WINDOW_MS = 6e4;
const WIDGETS = [
  { key: "meetingsThisWeek", label: "Meetings This Week", icon: CalendarDays, color: "text-primary bg-primary/10" },
  { key: "readyToPay", label: "Ready to Pay", icon: CreditCard, color: "text-success bg-success/15" },
  { key: "parentDiscussion", label: "Parent Discussion", icon: Users, color: "text-accent-foreground bg-accent/20" },
  { key: "financialDelay", label: "Financial Delay", icon: Wallet, color: "text-primary bg-chart-4/15" },
  { key: "futureApplicants", label: "Future Applicants", icon: Clock3, color: "text-primary bg-chart-2/15" },
  { key: "conversionForecast", label: "Conversion Forecast", icon: TrendingUp, color: "text-success bg-success/15" }
];
const EMPTY_FORM = {
  leadId: "",
  outcome: "",
  commitment: "",
  obstacle: "",
  nextAction: "",
  notes: ""
};
function MeetingOutcomesTab() {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const isSuperAdmin = profile.role === "super_admin";
  const leadsFn = useServerFn(listLeads);
  const workspacesFn = useServerFn(listWorkspaces);
  const outcomesFn = useServerFn(listMeetingOutcomes);
  const statsFn = useServerFn(getMeetingOutcomeStats);
  const saveFn = useServerFn(saveMeetingOutcome);
  const updateFn = useServerFn(updateMeetingOutcome);
  const deleteFn = useServerFn(deleteMeetingOutcome);
  const processFn = useServerFn(processDueWorkflows);
  const timersRef = reactExports.useRef([]);
  reactExports.useEffect(() => () => timersRef.current.forEach(clearTimeout), []);
  function scheduleWorkflowFire() {
    const t = setTimeout(() => {
      processFn().catch(() => {
      }).finally(() => qc.invalidateQueries({ queryKey: ["messages"] }));
    }, EDIT_WINDOW_MS + 3e3);
    timersRef.current.push(t);
  }
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({ ...EMPTY_FORM });
  const [workspaceId, setWorkspaceId] = reactExports.useState("");
  const [followUp, setFollowUp] = reactExports.useState(void 0);
  const [meetingDate] = reactExports.useState(/* @__PURE__ */ new Date());
  const [leadOpen, setLeadOpen] = reactExports.useState(false);
  const [now, setNow] = reactExports.useState(() => Date.now());
  reactExports.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1e3);
    return () => clearInterval(t);
  }, []);
  const [editRow, setEditRow] = reactExports.useState(null);
  const [editForm, setEditForm] = reactExports.useState({ ...EMPTY_FORM });
  const [editFollowUp, setEditFollowUp] = reactExports.useState(void 0);
  const { data: leadsData } = useQuery({ queryKey: ["leads"], queryFn: () => leadsFn() });
  const { data: workspacesData } = useQuery({ queryKey: ["workspaces"], queryFn: () => workspacesFn() });
  const { data: outcomesData } = useQuery({
    queryKey: ["meeting-outcomes"],
    queryFn: () => outcomesFn(),
    refetchInterval: 1e4
  });
  const { data: stats } = useQuery({
    queryKey: ["meeting-outcome-stats"],
    queryFn: () => statsFn(),
    refetchInterval: 1e4
  });
  const leads = leadsData?.leads ?? [];
  const workspaces = workspacesData?.workspaces ?? [];
  const outcomes = outcomesData?.outcomes ?? [];
  const selectedLead = reactExports.useMemo(() => leads.find((l) => l.id === form.leadId), [leads, form.leadId]);
  const save = useMutation({
    mutationFn: () => saveFn({
      data: {
        lead_id: form.leadId,
        meeting_date: meetingDate.toISOString(),
        outcome: form.outcome,
        commitment_level: form.commitment || null,
        main_obstacle: form.obstacle || null,
        next_action: form.nextAction || null,
        follow_up_date: followUp ? format(followUp, "yyyy-MM-dd") : null,
        internal_notes: form.notes || null,
        workspace_id: workspaceId || null
      }
    }),
    onSuccess: (res) => {
      const r = res;
      if (!r.ok) {
        toast.error(r.error ?? "Failed to save outcome");
        return;
      }
      const wf = r.workflowStatus === "enrolled" ? "Follow-up scheduled — the first message sends when the 1-minute edit window ends." : r.workflowStatus === "already_enrolled" ? "Lead already in this workflow." : "No matching active workflow found — create it in Orchestration.";
      toast.success(`Outcome saved. ${wf}`);
      if (r.workflowStatus === "enrolled") scheduleWorkflowFire();
      setForm({ ...EMPTY_FORM });
      setFollowUp(void 0);
      qc.invalidateQueries({ queryKey: ["meeting-outcomes"] });
      qc.invalidateQueries({ queryKey: ["meeting-outcome-stats"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: () => toast.error("Failed to save outcome")
  });
  const update = useMutation({
    mutationFn: () => updateFn({
      data: {
        id: editRow.id,
        outcome: editForm.outcome,
        commitment_level: editForm.commitment || null,
        main_obstacle: editForm.obstacle || null,
        next_action: editForm.nextAction || null,
        follow_up_date: editFollowUp ? format(editFollowUp, "yyyy-MM-dd") : null,
        internal_notes: editForm.notes || null
      }
    }),
    onSuccess: (res) => {
      const r = res;
      if (!r.ok) {
        toast.error(r.error ?? "Failed to update outcome");
        return;
      }
      toast.success("Outcome updated.");
      scheduleWorkflowFire();
      setEditRow(null);
      qc.invalidateQueries({ queryKey: ["meeting-outcomes"] });
      qc.invalidateQueries({ queryKey: ["meeting-outcome-stats"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: () => toast.error("Failed to update outcome")
  });
  const remove = useMutation({
    mutationFn: (id) => deleteFn({ data: { id } }),
    onSuccess: (res) => {
      const r = res;
      if (!r.ok) {
        toast.error(r.error ?? "Failed to delete outcome");
        return;
      }
      toast.success("Meeting outcome deleted.");
      setPendingDelete(null);
      qc.invalidateQueries({ queryKey: ["meeting-outcomes"] });
      qc.invalidateQueries({ queryKey: ["meeting-outcome-stats"] });
    },
    onError: () => {
      toast.error("Failed to delete outcome");
      setPendingDelete(null);
    }
  });
  function openEdit(o) {
    setEditRow(o);
    setEditForm({
      leadId: o.id,
      outcome: o.outcome,
      commitment: o.commitment_level ?? "",
      obstacle: o.main_obstacle ?? "",
      nextAction: o.next_action ?? "",
      notes: ""
    });
    setEditFollowUp(o.follow_up_date ? new Date(o.follow_up_date) : void 0);
  }
  function editableFor(o) {
    const remaining = EDIT_WINDOW_MS - (now - new Date(o.created_at).getTime());
    return remaining > 0 ? remaining : 0;
  }
  const canSave = form.leadId && form.outcome && !save.isPending;
  const mappedWorkflow = MEETING_OUTCOMES.find((o) => o.value === form.outcome)?.workflow;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2.5 lg:grid-cols-6", children: WIDGETS.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-3 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${w.color}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(w.icon, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-xl font-bold leading-none", children: stats ? stats[w.key] ?? 0 : "—" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-[11px] leading-tight text-muted-foreground", children: w.label })
    ] }, w.key)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-5 shadow-card lg:max-w-2xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: "Record Meeting Outcome" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lead" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open: leadOpen, onOpenChange: setLeadOpen, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "outline",
                  role: "combobox",
                  className: "w-full justify-between font-normal",
                  children: [
                    selectedLead ? `${selectedLead.lead_name ?? "Unnamed"} · ${selectedLead.phone_number}` : "Select a lead…",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "h-4 w-4 opacity-50" })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-[var(--radix-popover-trigger-width)] p-0", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Command,
                {
                  filter: (value, search) => value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CommandInput, { placeholder: "Search leads…" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { children: "No leads found." }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { children: leads.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        CommandItem,
                        {
                          value: `${l.lead_name ?? ""} ${l.phone_number}`,
                          onSelect: () => {
                            setForm((f) => ({ ...f, leadId: l.id }));
                            setLeadOpen(false);
                          },
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Check,
                              {
                                className: cn(
                                  "mr-2 h-4 w-4",
                                  form.leadId === l.id ? "opacity-100" : "opacity-0"
                                )
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
                              l.lead_name ?? "Unnamed",
                              " · ",
                              l.phone_number
                            ] })
                          ]
                        },
                        l.id
                      )) })
                    ] })
                  ]
                }
              ) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lead Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: selectedLead?.lead_name ?? "", readOnly: true, placeholder: "—", className: "bg-muted/40" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: selectedLead?.phone_number ?? "", readOnly: true, placeholder: "—", className: "bg-muted/40" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Meeting Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: format(meetingDate, "PPP p"), readOnly: true, className: "bg-muted/40" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Outcome ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.outcome, onValueChange: (v) => setForm((f) => ({ ...f, outcome: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select outcome" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MEETING_OUTCOMES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.value, children: o.label }, o.value)) })
            ] }),
            mappedWorkflow && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-1.5 rounded-lg bg-primary/5 px-2.5 py-2 text-xs text-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "mt-0.5 h-3.5 w-3.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Matched workflow template: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: mappedWorkflow }),
                ". It activates immediately for the selected lead on save."
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Send Through Connection" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: workspaceId, onValueChange: setWorkspaceId, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Default connection" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: workspaces.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: w.id, children: [
                w.name ?? "Unnamed",
                w.is_default ? " (default)" : ""
              ] }, w.id)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "The follow-up messages are sent through this Chatwoot connection." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Commitment Level" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.commitment, onValueChange: (v) => setForm((f) => ({ ...f, commitment: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select level" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: COMMITMENT_LEVELS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.value, children: c.label }, c.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Main Obstacle" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.obstacle, onValueChange: (v) => setForm((f) => ({ ...f, obstacle: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select obstacle" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MAIN_OBSTACLES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.value, children: o.label }, o.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Expected Action" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.nextAction, onValueChange: (v) => setForm((f) => ({ ...f, nextAction: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select action" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: NEXT_ACTIONS.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: a.value, children: a.label }, a.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Follow-Up Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "outline",
                  className: cn(
                    "w-full justify-start text-left font-normal",
                    !followUp && "text-muted-foreground"
                  ),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar$1, { className: "mr-2 h-4 w-4" }),
                    followUp ? format(followUp, "PPP") : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Pick a date" })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Calendar,
                {
                  mode: "single",
                  selected: followUp,
                  onSelect: setFollowUp,
                  initialFocus: true,
                  className: cn("p-3 pointer-events-auto")
                }
              ) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Internal Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: form.notes,
                onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })),
                placeholder: "Context, commitments, objections…",
                rows: 4,
                maxLength: 5e3
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-full", disabled: !canSave, onClick: () => save.mutate(), children: [
            save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
            "Save Outcome"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b px-5 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: "Recent Meeting Outcomes" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Lead" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Outcome" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Commitment" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Next Action" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Follow-Up" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Workflow" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right font-semibold", children: "Edit" }),
            isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right font-semibold", children: "Delete" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
            outcomes.map((o) => {
              const remaining = editableFor(o);
              const editable = remaining > 0;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0 hover:bg-muted/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: o.lead_name ?? "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: o.phone_number })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: format(new Date(o.meeting_date), "MMM d, yyyy") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary", children: outcomeLabel(o.outcome) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 capitalize text-muted-foreground", children: o.commitment_level ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: labelFromList(NEXT_ACTIONS, o.next_action) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: o.follow_up_date ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-muted-foreground", children: o.workflow_triggered ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: editable ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    variant: "ghost",
                    size: "sm",
                    className: "h-8 gap-1 text-primary",
                    onClick: () => openEdit(o),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
                      Math.ceil(remaining / 1e3),
                      "s"
                    ]
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Locked" }) }),
                isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "sm",
                    className: "h-8 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive",
                    onClick: () => setPendingDelete(o),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
                  }
                ) })
              ] }, o.id);
            }),
            outcomes.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: isSuperAdmin ? 9 : 8, className: "px-4 py-12 text-center text-muted-foreground", children: "No meeting outcomes recorded yet." }) })
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editRow, onOpenChange: (open) => !open && setEditRow(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Edit Meeting Outcome" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/40 px-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: editRow?.lead_name ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: editRow?.phone_number })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Outcome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: editForm.outcome,
              onValueChange: (v) => setEditForm((f) => ({ ...f, outcome: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select outcome" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MEETING_OUTCOMES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.value, children: o.label }, o.value)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Commitment Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: editForm.commitment,
              onValueChange: (v) => setEditForm((f) => ({ ...f, commitment: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select level" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: COMMITMENT_LEVELS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.value, children: c.label }, c.value)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Main Obstacle" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: editForm.obstacle,
              onValueChange: (v) => setEditForm((f) => ({ ...f, obstacle: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select obstacle" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MAIN_OBSTACLES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.value, children: o.label }, o.value)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Expected Action" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: editForm.nextAction,
              onValueChange: (v) => setEditForm((f) => ({ ...f, nextAction: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select action" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: NEXT_ACTIONS.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: a.value, children: a.label }, a.value)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Follow-Up Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                className: cn(
                  "w-full justify-start text-left font-normal",
                  !editFollowUp && "text-muted-foreground"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar$1, { className: "mr-2 h-4 w-4" }),
                  editFollowUp ? format(editFollowUp, "PPP") : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Pick a date" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Calendar,
              {
                mode: "single",
                selected: editFollowUp,
                onSelect: setEditFollowUp,
                initialFocus: true,
                className: cn("p-3 pointer-events-auto")
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Internal Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: editForm.notes,
              onChange: (e) => setEditForm((f) => ({ ...f, notes: e.target.value })),
              placeholder: "Update context, commitments, objections…",
              rows: 3,
              maxLength: 5e3
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setEditRow(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            disabled: !editForm.outcome || update.isPending,
            onClick: () => update.mutate(),
            children: [
              update.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
              "Save Changes"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!pendingDelete, onOpenChange: (o) => !o && setPendingDelete(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete this meeting outcome?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          "This permanently removes the recorded outcome for",
          " ",
          pendingDelete?.lead_name ?? pendingDelete?.phone_number,
          ". This cannot be undone."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { disabled: remove.isPending, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AlertDialogAction,
          {
            className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            disabled: remove.isPending,
            onClick: () => pendingDelete && remove.mutate(pendingDelete.id),
            children: remove.isPending ? "Deleting…" : "Delete"
          }
        )
      ] })
    ] }) })
  ] });
}
const Slider = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Root$2,
  {
    ref,
    className: cn("relative flex w-full touch-none select-none items-center", className),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Track, { className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Range, { className: "absolute h-full bg-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Thumb$1, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })
    ]
  }
));
Slider.displayName = Root$2.displayName;
function SettingsCard({
  title,
  description,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-6 shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: title }),
    description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: description }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 space-y-4", children })
  ] });
}
function useSettingsForm() {
  const qc = useQueryClient();
  const getFn = useServerFn(getSettings);
  const saveFn = useServerFn(updateSettings);
  const [form, setForm] = reactExports.useState({});
  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => getFn() });
  reactExports.useEffect(() => {
    if (data?.settings) setForm(data.settings);
  }, [data]);
  const save = useMutation({
    mutationFn: (payload) => saveFn({ data: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved");
    },
    onError: () => toast.error("Failed to save")
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return { form, set, save };
}
function Field$1({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  type
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: label }),
    textarea ? /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: value ?? "", onChange: (e) => onChange(e.target.value), placeholder, rows: 3 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: value ?? "", onChange: (e) => onChange(e.target.value), placeholder, type })
  ] });
}
async function fileToLogoDataUrl(file, maxEdge = 320) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
  if (file.type === "image/svg+xml") return dataUrl;
  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("decode failed"));
    i.src = dataUrl;
  });
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/png");
}
function LogoUpload({
  label,
  hint,
  value,
  onChange,
  dark
}) {
  const [busy, setBusy] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: hint }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: cn(
            "flex h-16 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border",
            dark ? "bg-sidebar" : "bg-muted/40"
          ),
          children: value ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: value, alt: label, className: "max-h-14 max-w-[120px] object-contain" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "No logo" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex w-fit cursor-pointer items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-3.5 w-3.5" }),
          busy ? "Processing…" : "Upload",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "file",
              accept: "image/png,image/jpeg,image/svg+xml,image/webp",
              className: "hidden",
              onChange: async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setBusy(true);
                try {
                  const url = await fileToLogoDataUrl(file);
                  if (url.length > 29e5) {
                    toast.error("Image is too large after processing. Use a smaller file.");
                  } else {
                    onChange(url);
                  }
                } catch {
                  toast.error("Could not process that image.");
                } finally {
                  setBusy(false);
                }
              }
            }
          )
        ] }),
        value ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "w-fit text-xs text-destructive", onClick: () => onChange(""), children: "Remove" }) : null
      ] })
    ] })
  ] });
}
function LogoScaleField({
  value,
  onChange,
  previewLight,
  previewDark
}) {
  const n = Number(value);
  const scale = Number.isFinite(n) && n > 0 ? n : 100;
  const preview = previewDark || previewLight;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Logo Size" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-muted-foreground", children: [
        scale,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Scales how large the logo appears in the sidebar. 100% is the default size." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Slider,
      {
        value: [scale],
        min: 50,
        max: 300,
        step: 5,
        onValueChange: (v) => onChange(String(v[0]))
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Preview" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-[64px] flex-1 items-center justify-center overflow-hidden rounded-lg bg-sidebar px-4 py-3", children: preview ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: preview,
          alt: "Logo preview",
          className: "w-auto object-contain",
          style: { height: `${56 * scale / 100}px`, maxWidth: `${200 * scale / 100}px` }
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-sidebar-foreground/60", children: "Upload a logo to preview" }) })
    ] })
  ] });
}
function CompanySettingsForm() {
  const { form, set, save } = useSettingsForm();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SettingsCard, { title: "Company Settings", description: "Details used by the AI in conversations.", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Company Name", value: form.company_name, onChange: (v) => set("company_name", v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Phone", value: form.company_phone, onChange: (v) => set("company_phone", v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Email", value: form.company_email, onChange: (v) => set("company_email", v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Working Hours", value: form.working_hours, onChange: (v) => set("working_hours", v) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Office Address", value: form.office_address, onChange: (v) => set("office_address", v), textarea: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-1 h-4 w-4" }),
        " Save"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      SettingsCard,
      {
        title: "Branding (White Label)",
        description: "Customize how this workspace looks. Logos and the tagline apply to this space (and to each sub-account when set on its own settings).",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Field$1,
              {
                label: "Brand Name",
                value: form.brand_name,
                onChange: (v) => set("brand_name", v),
                placeholder: "e.g. fliq"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Field$1,
              {
                label: "Tagline",
                value: form.brand_tagline,
                onChange: (v) => set("brand_tagline", v),
                placeholder: "Linkmoore Education · AI Admissions Platform"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LogoUpload,
              {
                label: "Logo — Light backgrounds",
                hint: "Shown on white/light surfaces (login, header). PNG with transparency recommended.",
                value: form.logo_light_url,
                onChange: (v) => set("logo_light_url", v)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LogoUpload,
              {
                label: "Logo — Dark backgrounds",
                hint: "Shown on the dark sidebar. Use a white/light version of your logo.",
                value: form.logo_dark_url,
                onChange: (v) => set("logo_dark_url", v),
                dark: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            LogoScaleField,
            {
              value: form.logo_scale,
              onChange: (v) => set("logo_scale", v),
              previewLight: form.logo_light_url,
              previewDark: form.logo_dark_url
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-1 h-4 w-4" }),
            " Save Branding"
          ] })
        ]
      }
    ) })
  ] });
}
function ProgramSettingsForm() {
  const { form, set, save } = useSettingsForm();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(SettingsCard, { title: "Program Settings", description: "Destinations, programs and scholarships you offer.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Field$1,
      {
        label: "Active Destinations",
        value: form.active_destinations,
        onChange: (v) => set("active_destinations", v),
        placeholder: "United Kingdom, Canada, Australia…",
        textarea: true
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Field$1,
      {
        label: "Active Programs",
        value: form.active_programs,
        onChange: (v) => set("active_programs", v),
        placeholder: "Undergraduate, Postgraduate, MBA…",
        textarea: true
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Field$1,
      {
        label: "Scholarship Information",
        value: form.scholarship_information,
        onChange: (v) => set("scholarship_information", v),
        textarea: true
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-1 h-4 w-4" }),
      " Save"
    ] })
  ] });
}
function ChatwootSettingsForm() {
  const { form, set, save } = useSettingsForm();
  const testFn = useServerFn(testWorkspaceConnection);
  const test = useMutation({
    mutationFn: () => testFn({
      data: {
        provider_type: "chatwoot",
        chatwoot_url: form.chatwoot_url,
        chatwoot_account_id: form.chatwoot_account_id,
        chatwoot_api_token: form.chatwoot_api_token
      }
    }),
    onSuccess: (r) => {
      if (r.ok) toast.success("Connection successful");
      else toast.error(r.error ?? "Connection failed");
    },
    onError: () => toast.error("Connection test failed")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    SettingsCard,
    {
      title: "Chatwoot Integration",
      description: "Connect your Chatwoot account so AI replies reach WhatsApp. Credentials are stored securely and never exposed to the browser after saving.",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Chatwoot URL", value: form.chatwoot_url, onChange: (v) => set("chatwoot_url", v), placeholder: "https://app.chatwoot.com" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Account ID", value: form.chatwoot_account_id, onChange: (v) => set("chatwoot_account_id", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Inbox ID", value: form.chatwoot_inbox_id, onChange: (v) => set("chatwoot_inbox_id", v) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "API Token", value: form.chatwoot_api_token, onChange: (v) => set("chatwoot_api_token", v), type: "password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground", children: [
          "Set your Chatwoot webhook to: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "font-mono", children: "/api/public/chatwoot-webhook" }),
          " on this app's domain."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-1 h-4 w-4" }),
            " Save"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => test.mutate(), disabled: test.isPending, children: [
            test.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PlugZap, { className: "mr-1 h-4 w-4" }),
            "Test Connection"
          ] })
        ] })
      ]
    }
  );
}
const MODELS = [
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "openai/gpt-5-mini",
  "openai/gpt-5"
];
function AiPromptEditor() {
  const qc = useQueryClient();
  const getFn = useServerFn(getAiConfig);
  const saveFn = useServerFn(saveAiConfig);
  const versionsFn = useServerFn(listPromptVersions);
  const [cfg, setCfg] = reactExports.useState({ system_prompt: "", model: MODELS[0], temperature: 0.7 });
  const [fullscreen, setFullscreen] = reactExports.useState(false);
  const { data } = useQuery({ queryKey: ["ai-config"], queryFn: () => getFn() });
  const { data: versionsData } = useQuery({ queryKey: ["prompt-versions"], queryFn: () => versionsFn() });
  reactExports.useEffect(() => {
    if (data?.config) setCfg(data.config);
  }, [data]);
  const save = useMutation({
    mutationFn: (payload) => saveFn({ data: { ...payload, temperature: Number(payload.temperature) } }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["ai-config"] });
      qc.invalidateQueries({ queryKey: ["prompt-versions"] });
      toast.success(`Saved as version ${r.version}`);
    },
    onError: () => toast.error("Failed to save")
  });
  const versions = versionsData?.versions ?? [];
  const editor = (rows) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    Textarea,
    {
      value: cfg.system_prompt,
      onChange: (e) => setCfg((c) => ({ ...c, system_prompt: e.target.value })),
      rows,
      className: "font-mono text-sm leading-relaxed",
      placeholder: "Write the AI system prompt. Use {{VARIABLE_NAME}} placeholders…"
    }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    SettingsCard,
    {
      title: "AI Prompt Editor",
      description: "Control the AI's behavior. Changes apply instantly — no redeploy needed.",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Model" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                value: cfg.model,
                onChange: (e) => setCfg((c) => ({ ...c, model: e.target.value })),
                className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
                children: MODELS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: m, children: m }, m))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Temperature (",
              cfg.temperature,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: 0,
                max: 2,
                step: 0.1,
                value: cfg.temperature,
                onChange: (e) => setCfg((c) => ({ ...c, temperature: Number(e.target.value) }))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "System Prompt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "mr-1 h-4 w-4" }),
                " History"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Prompt Version History" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[60vh] space-y-3 overflow-y-auto", children: [
                  versions.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold", children: [
                        "Version ",
                        v.version_number
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: new Date(v.created_at).toLocaleString() }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          Button,
                          {
                            size: "sm",
                            variant: "ghost",
                            className: "h-7",
                            onClick: () => {
                              setCfg((c) => ({ ...c, system_prompt: v.system_prompt }));
                              toast.success(`Loaded version ${v.version_number} — Save to apply`);
                            },
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "mr-1 h-3.5 w-3.5" }),
                              " Restore"
                            ]
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 line-clamp-3 whitespace-pre-wrap font-mono text-xs text-muted-foreground", children: v.system_prompt })
                  ] }, v.id)),
                  versions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No versions yet." })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: fullscreen, onOpenChange: setFullscreen, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "mr-1 h-4 w-4" }),
                " Full screen"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "h-[85vh] max-w-5xl", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "System Prompt" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col gap-3 pb-2", children: [
                  editor(24),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(cfg), disabled: save.isPending, className: "self-start", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-1 h-4 w-4" }),
                    " Save"
                  ] })
                ] })
              ] })
            ] })
          ] })
        ] }),
        editor(14),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(cfg), disabled: save.isPending, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-1 h-4 w-4" }),
          " Save Prompt"
        ] })
      ]
    }
  );
}
function AiVariablesEditor() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAiVariables);
  const upsertFn = useServerFn(upsertAiVariable);
  const deleteFn = useServerFn(deleteAiVariable);
  const { data } = useQuery({ queryKey: ["ai-variables"], queryFn: () => listFn() });
  const [draft, setDraft] = reactExports.useState({ variable_name: "", variable_value: "", description: "" });
  const upsert = useMutation({
    mutationFn: (v) => upsertFn({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-variables"] });
      toast.success("Variable saved");
    },
    onError: () => toast.error("Invalid name — use UPPER_CASE letters, numbers, underscores")
  });
  const remove = useMutation({
    mutationFn: (id) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-variables"] });
      toast.success("Variable deleted");
    }
  });
  const variables = data?.variables ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    SettingsCard,
    {
      title: "AI Variables",
      description: "Reusable values for prompts. Reference them as {{VARIABLE_NAME}} in the system prompt.",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-xl border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 font-semibold", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 font-semibold", children: "Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 font-semibold", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          variables.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(VariableRow, { variable: v, onSave: upsert.mutate, onDelete: remove.mutate }, v.id)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-primary/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "VARIABLE_NAME",
                value: draft.variable_name,
                onChange: (e) => setDraft((d) => ({ ...d, variable_name: e.target.value.toUpperCase() })),
                className: "h-8 font-mono text-xs"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Value",
                value: draft.variable_value,
                onChange: (e) => setDraft((d) => ({ ...d, variable_value: e.target.value })),
                className: "h-8 text-xs"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Description",
                value: draft.description,
                onChange: (e) => setDraft((d) => ({ ...d, description: e.target.value })),
                className: "h-8 text-xs"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                className: "h-8",
                disabled: !draft.variable_name || !draft.variable_value,
                onClick: () => upsert.mutate(draft, {
                  onSuccess: () => setDraft({ variable_name: "", variable_value: "", description: "" })
                }),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" })
              }
            ) })
          ] })
        ] })
      ] }) })
    }
  );
}
function VariableRow({
  variable,
  onSave,
  onDelete
}) {
  const [value, setValue] = reactExports.useState(variable.variable_value);
  const [desc, setDesc] = reactExports.useState(variable.description ?? "");
  const dirty = value !== variable.variable_value || desc !== (variable.description ?? "");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono text-xs font-semibold", children: variable.variable_name }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value, onChange: (e) => setValue(e.target.value), className: "h-8 text-xs" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: desc, onChange: (e) => setDesc(e.target.value), className: "h-8 text-xs" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
      dirty && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "sm",
          variant: "outline",
          className: "h-8",
          onClick: () => onSave({ id: variable.id, variable_name: variable.variable_name, variable_value: value, description: desc }),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3.5 w-3.5" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 text-destructive", onClick: () => onDelete(variable.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
    ] }) })
  ] });
}
const EMPTY$4 = {
  name: "",
  trigger_stage: "QUALIFIED",
  url: "",
  method: "POST",
  headersText: "{}",
  payload_template: '{\n  "name": "{{lead_name}}",\n  "phone": "{{phone_number}}",\n  "course": "{{course_interest}}",\n  "country": "{{country_interest}}"\n}',
  enabled: true
};
function HttpActionsManager() {
  const qc = useQueryClient();
  const listFn = useServerFn(listHttpActions);
  const upsertFn = useServerFn(upsertHttpAction);
  const deleteFn = useServerFn(deleteHttpAction);
  const { data } = useQuery({ queryKey: ["http-actions"], queryFn: () => listFn() });
  const [open, setOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState(EMPTY$4);
  const upsert = useMutation({
    mutationFn: (payload) => upsertFn({ data: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["http-actions"] });
      toast.success("Action saved");
      setOpen(false);
      setForm(EMPTY$4);
    },
    onError: () => toast.error("Check the URL and headers JSON")
  });
  const remove = useMutation({
    mutationFn: (id) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["http-actions"] });
      toast.success("Action deleted");
    }
  });
  const toggle = useMutation({
    mutationFn: (a) => upsertFn({
      data: {
        id: a.id,
        name: a.name,
        trigger_stage: a.trigger_stage,
        url: a.url,
        method: a.method,
        headers: a.headers,
        payload_template: a.payload_template,
        enabled: !a.enabled
      }
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["http-actions"] })
  });
  function submit() {
    let headers = {};
    try {
      headers = JSON.parse(form.headersText || "{}");
    } catch {
      toast.error("Headers must be valid JSON");
      return;
    }
    upsert.mutate({
      name: form.name,
      trigger_stage: form.trigger_stage,
      url: form.url,
      method: form.method,
      headers,
      payload_template: form.payload_template,
      enabled: form.enabled
    });
  }
  const actions = data?.actions ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    SettingsCard,
    {
      title: "HTTP Actions",
      description: "Fire outbound webhooks when a lead reaches a pipeline stage — CRM sync, Slack, Sheets, Make.com, n8n.",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
            " New Action"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[85vh] max-w-lg overflow-y-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "HTTP Action" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trigger Stage" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "select",
                    {
                      value: form.trigger_stage,
                      onChange: (e) => setForm((f) => ({ ...f, trigger_stage: e.target.value })),
                      className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
                      children: QUALIFICATION_STAGES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: stageLabel$1(s) }, s))
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Method" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "select",
                    {
                      value: form.method,
                      onChange: (e) => setForm((f) => ({ ...f, method: e.target.value })),
                      className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
                      children: ["POST", "GET", "PUT", "PATCH"].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: m }, m))
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "URL" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    placeholder: "https://your-crm.com/api/leads",
                    value: form.url,
                    onChange: (e) => setForm((f) => ({ ...f, url: e.target.value }))
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Headers (JSON)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Textarea,
                  {
                    value: form.headersText,
                    onChange: (e) => setForm((f) => ({ ...f, headersText: e.target.value })),
                    rows: 2,
                    className: "font-mono text-xs"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payload Template" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Textarea,
                  {
                    value: form.payload_template,
                    onChange: (e) => setForm((f) => ({ ...f, payload_template: e.target.value })),
                    rows: 6,
                    className: "font-mono text-xs"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  "Use ",
                  "{{lead_name}}",
                  ", ",
                  "{{phone_number}}",
                  ", ",
                  "{{course_interest}}",
                  ", ",
                  "{{country_interest}}",
                  "."
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: form.enabled, onCheckedChange: (v) => setForm((f) => ({ ...f, enabled: v })) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Enabled" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, disabled: upsert.isPending || !form.name || !form.url, children: "Save Action" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          actions.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl border p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Webhook, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: a.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  a.method,
                  " · ",
                  stageLabel$1(a.trigger_stage),
                  " · ",
                  a.url
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: a.enabled, onCheckedChange: () => toggle.mutate(a) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "text-destructive", onClick: () => remove.mutate(a.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
            ] })
          ] }, a.id)),
          actions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-8 text-center text-sm text-muted-foreground", children: "No HTTP actions configured." })
        ] })
      ]
    }
  );
}
function PromptTestingLab() {
  const fn = useServerFn(testPrompt);
  const [message, setMessage] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  const run = useMutation({
    mutationFn: () => fn({ data: { message, phone: phone || void 0 } })
  });
  const result = run.data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    SettingsCard,
    {
      title: "Prompt Testing Lab",
      description: "Safely test the AI against a message without affecting real conversations (leave phone empty for a clean test).",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "User Message" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: message,
              onChange: (e) => setMessage(e.target.value),
              rows: 3,
              placeholder: "Olá, quero estudar no Reino Unido…"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone (optional — loads existing lead memory)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "+5511999999999" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => run.mutate(), disabled: !message || run.isPending, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "mr-1 h-4 w-4" }),
          " ",
          run.isPending ? "Running…" : "Run Test"
        ] }),
        result && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-4", children: [
          result.error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-destructive/10 p-3 text-sm text-destructive", children: result.error }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-primary/5 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-4 w-4 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "AI Response" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StageBadge, { stage: result.decision.qualification_status, className: "ml-auto" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap text-sm", children: result.decision.reply }),
            result.decision.reasoning && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs italic text-muted-foreground", children: result.decision.reasoning })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, { title: "Model Used", children: result.modelUsed }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, { title: "Extracted Updates (Tool Calls)", children: /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "overflow-x-auto text-xs", children: JSON.stringify(result.decision.updates, null, 2) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, { title: "Memory Retrieved", children: /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "overflow-x-auto text-xs", children: JSON.stringify(result.memory, null, 2) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Detail, { title: "Prompt Used", children: /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "max-h-64 overflow-auto whitespace-pre-wrap text-xs", children: result.promptUsed }) })
        ] })
      ]
    }
  );
}
function Detail({ title, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "rounded-xl border p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-sm font-semibold", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 font-mono text-muted-foreground", children })
  ] });
}
const PRESETS$1 = [
  { id: "openai", label: "OpenAI", base_url: "https://api.openai.com/v1", fixedBase: true },
  { id: "anthropic", label: "Anthropic", base_url: "https://api.anthropic.com", fixedBase: false },
  { id: "google", label: "Google Gemini", base_url: "https://generativelanguage.googleapis.com/v1beta/openai", fixedBase: true },
  { id: "groq", label: "Groq", base_url: "https://api.groq.com/openai/v1", fixedBase: true },
  { id: "deepseek", label: "DeepSeek", base_url: "https://api.deepseek.com/v1", fixedBase: true },
  { id: "mistral", label: "Mistral", base_url: "https://api.mistral.ai/v1", fixedBase: true },
  { id: "openrouter", label: "OpenRouter", base_url: "https://openrouter.ai/api/v1", fixedBase: true },
  { id: "together", label: "Together AI", base_url: "https://api.together.xyz/v1", fixedBase: true },
  { id: "custom", label: "Custom (OpenAI-compatible)", base_url: "", fixedBase: false }
];
let keySeq = 0;
const nextKey = () => `row-${Date.now()}-${keySeq++}`;
function toRow(r) {
  return {
    key: nextKey(),
    id: r.id,
    label: r.label,
    provider: r.provider,
    base_url: r.base_url,
    models: (r.models ?? []).join(", "),
    enabled: r.enabled,
    has_key: r.has_key,
    apiKey: ""
  };
}
function parseModels(s) {
  return s.split(/[\n,]/).map((m) => m.trim()).filter(Boolean);
}
function AiProviderFallback() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAiProviders);
  const saveFn = useServerFn(saveAiProviderPool);
  const delFn = useServerFn(deleteAiProvider);
  const reorderFn = useServerFn(reorderAiProviders);
  const toggleFn = useServerFn(setFallbackEnabled);
  const testFn = useServerFn(testAiProviderPool);
  const { data } = useQuery({ queryKey: ["ai-providers"], queryFn: () => listFn() });
  const [rows, setRows] = reactExports.useState([]);
  const [enabled, setEnabled] = reactExports.useState(false);
  const [savingKey, setSavingKey] = reactExports.useState(null);
  const [testingKey, setTestingKey] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!data) return;
    const res = data;
    setRows(res.providers.map(toRow));
    setEnabled(Boolean(res.fallbackEnabled));
  }, [data]);
  const patch = (key, fields) => setRows((prev) => prev.map((r) => r.key === key ? { ...r, ...fields } : r));
  const selectProvider = (key, id) => {
    const p = PRESETS$1.find((x) => x.id === id);
    patch(key, { provider: id, base_url: p && p.id !== "custom" ? p.base_url : "" });
  };
  const toggleEnabled = useMutation({
    mutationFn: (value) => toggleFn({ data: { enabled: value } }),
    onSuccess: (_r, value) => {
      setEnabled(value);
      qc.invalidateQueries({ queryKey: ["ai-providers"] });
      toast.success(value ? "Auto-rotation enabled" : "Auto-rotation disabled");
    },
    onError: () => toast.error("Failed to update setting")
  });
  const addRow = () => setRows((prev) => [
    ...prev,
    {
      key: nextKey(),
      label: "",
      provider: "openai",
      base_url: PRESETS$1[0].base_url,
      models: "",
      enabled: true,
      has_key: false,
      apiKey: ""
    }
  ]);
  const saveRow = async (row) => {
    const models = parseModels(row.models);
    if (!models.length) {
      toast.error("Add at least one model for rotation.");
      return;
    }
    if (!row.id && !row.apiKey.trim()) {
      toast.error("Enter an API key for this provider.");
      return;
    }
    setSavingKey(row.key);
    try {
      const r = await saveFn({
        data: {
          id: row.id,
          label: row.label || void 0,
          provider: row.provider,
          base_url: row.base_url || null,
          models,
          api_key: row.apiKey || null,
          enabled: row.enabled
        }
      });
      if (!r.ok) {
        toast.error(r.error ?? "Failed to save");
        return;
      }
      toast.success("Provider saved");
      qc.invalidateQueries({ queryKey: ["ai-providers"] });
    } catch {
      toast.error("Failed to save");
    } finally {
      setSavingKey(null);
    }
  };
  const removeRow = async (row) => {
    if (!row.id) {
      setRows((prev) => prev.filter((r2) => r2.key !== row.key));
      return;
    }
    const r = await delFn({ data: { id: row.id } });
    if (!r.ok) {
      toast.error(r.error ?? "Failed to remove");
      return;
    }
    qc.invalidateQueries({ queryKey: ["ai-providers"] });
    toast.success("Provider removed");
  };
  const move = async (index2, dir) => {
    const target = index2 + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index2], next[target]] = [next[target], next[index2]];
    setRows(next);
    const savedIds = next.filter((r) => r.id).map((r) => r.id);
    if (savedIds.length > 1) {
      await reorderFn({ data: { order: savedIds } });
      qc.invalidateQueries({ queryKey: ["ai-providers"] });
    }
  };
  const testRow = async (row) => {
    const models = parseModels(row.models);
    if (!models.length) {
      toast.error("Add at least one model to test.");
      return;
    }
    setTestingKey(row.key);
    try {
      const r = await testFn({
        data: {
          id: row.id,
          provider: row.provider,
          base_url: row.base_url || null,
          model: models[0],
          api_key: row.apiKey || null
        }
      });
      if (r.ok) toast.success(`Connection successful (${models[0]})`);
      else toast.error(r.error ?? "Connection failed");
    } catch {
      toast.error("Connection failed");
    } finally {
      setTestingKey(null);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    SettingsCard,
    {
      title: "Provider Fallback & Auto-Rotation",
      description: "Store multiple provider credentials in priority order. When a provider hits its rate limit, the assistant automatically rotates to the next provider's models.",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 rounded-xl border bg-muted/30 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "mt-0.5 h-5 w-5 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Enable auto-rotation" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Cycle through the providers below (top to bottom) on rate limits or failures." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: enabled, onCheckedChange: (v) => toggleEnabled.mutate(Boolean(v)), disabled: toggleEnabled.isPending })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground", children: "No fallback providers yet. Add one to start building your rotation chain." }),
          rows.map((row, index2) => {
            const preset = PRESETS$1.find((p) => p.id === row.provider) ?? PRESETS$1[PRESETS$1.length - 1];
            const baseDisabled = preset.id !== "custom" && preset.fixedBase;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-xl border bg-card p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 text-sm font-semibold", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary", children: index2 + 1 }),
                  "Priority ",
                  index2 + 1,
                  row.has_key && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3 w-3" }),
                    " Key stored"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => move(index2, -1), disabled: index2 === 0, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "h-4 w-4" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon",
                      className: "h-8 w-8",
                      onClick: () => move(index2, 1),
                      disabled: index2 === rows.length - 1,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "h-4 w-4" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-destructive", onClick: () => removeRow(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Label (optional)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: row.label, onChange: (e) => patch(row.key, { label: e.target.value }), placeholder: "e.g. Groq free tier" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Provider" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "select",
                    {
                      value: row.provider,
                      onChange: (e) => selectProvider(row.key, e.target.value),
                      className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
                      children: PRESETS$1.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p.id, children: p.label }, p.id))
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Base URL" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: row.base_url,
                    onChange: (e) => patch(row.key, { base_url: e.target.value }),
                    placeholder: "https://api.openai.com/v1",
                    disabled: baseDisabled
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Models for rotation (comma-separated, in order)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: row.models,
                    onChange: (e) => patch(row.key, { models: e.target.value }),
                    placeholder: "llama-3.1-8b-instant, llama-3.3-70b-versatile"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "List the free models to cycle through. Each is tried in order before moving to the next provider." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "API Key" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: "password",
                      value: row.apiKey,
                      onChange: (e) => patch(row.key, { apiKey: e.target.value }),
                      placeholder: row.has_key ? "•••••••••• (saved — leave blank to keep)" : "Paste your API key"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pb-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Active" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: row.enabled, onCheckedChange: (v) => patch(row.key, { enabled: Boolean(v) }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => saveRow(row), disabled: savingKey === row.key, children: [
                  savingKey === row.key ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-1 h-4 w-4" }),
                  "Save"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => testRow(row), disabled: testingKey === row.key, children: [
                  testingKey === row.key ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plug, { className: "mr-1 h-4 w-4" }),
                  "Test"
                ] })
              ] })
            ] }, row.key);
          })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: addRow, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
          " Add provider"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground", children: 'Add every provider you want available for rotation. If none respond, the assistant replies with a graceful "advisor will get back to you" message.' })
      ]
    }
  );
}
const PRESETS = [
  { id: "openai", label: "OpenAI", base_url: "https://api.openai.com/v1", models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini"] },
  { id: "anthropic", label: "Anthropic", base_url: "https://api.anthropic.com", models: ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest", "claude-3-opus-latest"] },
  { id: "google", label: "Google Gemini", base_url: "https://generativelanguage.googleapis.com/v1beta/openai", models: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"] },
  { id: "groq", label: "Groq", base_url: "https://api.groq.com/openai/v1", models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"] },
  { id: "deepseek", label: "DeepSeek", base_url: "https://api.deepseek.com/v1", models: ["deepseek-chat", "deepseek-reasoner"] },
  { id: "mistral", label: "Mistral", base_url: "https://api.mistral.ai/v1", models: ["mistral-large-latest", "mistral-small-latest"] },
  { id: "openrouter", label: "OpenRouter", base_url: "https://openrouter.ai/api/v1", models: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "meta-llama/llama-3.3-70b-instruct"] },
  { id: "custom", label: "Custom (OpenAI-compatible)", base_url: "", models: [] }
];
function AiProviderSettings() {
  const qc = useQueryClient();
  const getFn = useServerFn(getAiConfig);
  const saveFn = useServerFn(saveAiProvider);
  const testFn = useServerFn(testAiProvider);
  const { data } = useQuery({ queryKey: ["ai-config"], queryFn: () => getFn() });
  const cfg = data?.config ?? null;
  const [mode] = reactExports.useState("custom");
  const [provider, setProvider] = reactExports.useState("openai");
  const [baseUrl, setBaseUrl] = reactExports.useState("");
  const [model, setModel] = reactExports.useState("");
  const [apiKey, setApiKey] = reactExports.useState("");
  const [hasSavedKey, setHasSavedKey] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!cfg) return;
    setProvider(cfg.custom_provider ?? "openai");
    setBaseUrl(cfg.custom_base_url ?? "");
    setModel(cfg.custom_model ?? "");
    setHasSavedKey(Boolean(cfg.custom_api_key));
  }, [cfg]);
  const preset = PRESETS.find((p) => p.id === provider) ?? PRESETS[0];
  const selectProvider = (id) => {
    setProvider(id);
    const p = PRESETS.find((x) => x.id === id);
    if (p && p.id !== "custom") {
      setBaseUrl(p.base_url);
      if (!p.models.includes(model)) setModel(p.models[0] ?? "");
    }
  };
  const save = useMutation({
    mutationFn: () => saveFn({
      data: {
        id: cfg?.id,
        provider_mode: mode,
        custom_provider: provider,
        custom_base_url: baseUrl || null,
        custom_model: model || null,
        custom_api_key: apiKey || ""
        // empty → server keeps existing key
      }
    }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) {
        toast.error(res.error ?? "Failed to save");
        return;
      }
      setApiKey("");
      setHasSavedKey((prev) => prev || apiKey.length > 0);
      qc.invalidateQueries({ queryKey: ["ai-config"] });
      toast.success("AI provider settings saved");
    },
    onError: () => toast.error("Failed to save")
  });
  const test = useMutation({
    mutationFn: () => testFn({
      data: {
        provider_mode: mode,
        custom_provider: provider,
        custom_base_url: baseUrl || null,
        custom_model: model || null,
        custom_api_key: apiKey || ""
        // empty → server uses the saved key
      }
    }),
    onSuccess: (r) => {
      const res = r;
      if (res.ok) toast.success("Connection successful");
      else toast.error(res.error ?? "Connection failed");
    },
    onError: () => toast.error("Connection failed")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      SettingsCard,
      {
        title: "AI Provider",
        description: "The assistant uses your own provider and API key. Applies instantly to the assistant, AI reports and responder agents.",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-xl border bg-muted/30 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Provider" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "select",
                {
                  value: provider,
                  onChange: (e) => selectProvider(e.target.value),
                  className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
                  children: PRESETS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p.id, children: p.label }, p.id))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Base URL" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: baseUrl,
                    onChange: (e) => setBaseUrl(e.target.value),
                    placeholder: "https://api.openai.com/v1",
                    disabled: provider !== "custom" && provider !== "anthropic"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Model" }),
                preset.models.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "select",
                  {
                    value: model,
                    onChange: (e) => setModel(e.target.value),
                    className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
                    children: [...new Set([...preset.models, model].filter(Boolean))].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: m, children: m }, m))
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: model, onChange: (e) => setModel(e.target.value), placeholder: "model-name" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "API Key" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "password",
                  value: apiKey,
                  onChange: (e) => setApiKey(e.target.value),
                  placeholder: hasSavedKey ? "•••••••••• (saved — leave blank to keep)" : "Paste your API key"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Stored securely on the server and never exposed to the browser after saving." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-1 h-4 w-4" }),
              " Save Provider Settings"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => test.mutate(), disabled: test.isPending, children: [
              test.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plug, { className: "mr-1 h-4 w-4" }),
              "Test connection"
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AiProviderFallback, {})
  ] });
}
function UserManagement() {
  const qc = useQueryClient();
  const listFn = useServerFn(listUsers);
  const createFn = useServerFn(createUser);
  const roleFn = useServerFn(updateUserRole);
  const deleteFn = useServerFn(deleteUser);
  const permFn = useServerFn(setUserPermission);
  const { data, isLoading } = useQuery({ queryKey: ["platform-users"], queryFn: () => listFn() });
  const users = data?.users ?? [];
  const [email, setEmail] = reactExports.useState("");
  const [fullName, setFullName] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [role, setRole] = reactExports.useState("agent");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["platform-users"] });
  const create = useMutation({
    mutationFn: () => createFn({ data: { email, password, full_name: fullName, role } }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) return toast.error(res.error ?? "Failed to create user");
      toast.success("User created");
      setEmail("");
      setFullName("");
      setPassword("");
      setRole("agent");
      invalidate();
    },
    onError: () => toast.error("Failed to create user")
  });
  const changeRole = useMutation({
    mutationFn: (vars) => roleFn({ data: vars }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) return toast.error(res.error ?? "Failed to update role");
      toast.success("Role updated");
      invalidate();
    },
    onError: () => toast.error("Failed to update role")
  });
  const changePermission = useMutation({
    mutationFn: (vars) => permFn({ data: vars }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) return toast.error(res.error ?? "Failed to update access");
      toast.success("Access updated");
      invalidate();
    },
    onError: () => toast.error("Failed to update access")
  });
  const remove = useMutation({
    mutationFn: (user_id) => deleteFn({ data: { user_id } }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) return toast.error(res.error ?? "Failed to delete user");
      toast.success("User deleted");
      invalidate();
    },
    onError: () => toast.error("Failed to delete user")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SettingsCard, { title: "Create User", description: "Add a team member and assign their role. They sign in with the email and password you set.", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Full Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: fullName, onChange: (e) => setFullName(e.target.value), placeholder: "Jane Doe" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "jane@company.com" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Temporary Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "At least 8 characters" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Role" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: role,
              onChange: (e) => setRole(e.target.value),
              className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
              children: ALL_ROLES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: r, children: ROLE_LABELS[r] }, r))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => create.mutate(),
          disabled: create.isPending || !email || !fullName || password.length < 8,
          children: [
            create.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "mr-1 h-4 w-4" }),
            "Create User"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsCard, { title: "Platform Users", description: "Manage roles and access for everyone on the platform.", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" }) }) : users.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No users yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-medium", children: u.full_name ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-xs text-muted-foreground", children: u.email })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
            u.role !== "super_admin" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "label",
              {
                className: "flex items-center gap-1.5 text-xs text-muted-foreground",
                title: "Grants access to the Advanced area (Reports & Opportunities)",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: u.permissions?.includes(ADVANCED_PERMISSION) ?? false,
                      onChange: (e) => changePermission.mutate({
                        user_id: u.user_id,
                        permission: ADVANCED_PERMISSION,
                        enabled: e.target.checked
                      })
                    }
                  ),
                  "Advanced"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                value: u.role ?? "agent",
                onChange: (e) => changeRole.mutate({ user_id: u.user_id, role: e.target.value }),
                className: "h-9 rounded-md border border-input bg-background px-2 text-sm",
                children: ALL_ROLES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: r, children: ROLE_LABELS[r] }, r))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-9 w-9 text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete this user?" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
                    "This permanently removes ",
                    u.email,
                    "'s account and access. This cannot be undone."
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => remove.mutate(u.user_id), children: "Delete" })
                ] })
              ] })
            ] })
          ] })
        ]
      },
      u.user_id
    )) }) })
  ] });
}
const EMPTY$3 = {
  name: "",
  provider_type: "chatwoot",
  chatwoot_url: "",
  chatwoot_account_id: "",
  chatwoot_inbox_id: "",
  chatwoot_api_token: "",
  evolution_url: "",
  evolution_api_key: "",
  evolution_instance: "",
  waba_phone_number_id: "",
  waba_business_account_id: "",
  waba_access_token: "",
  waba_api_version: "v21.0",
  waba_verify_token: "",
  waba_app_secret: "",
  waba_display_name: "",
  enabled: true,
  is_default: false,
  use_shared_ai: true
};
function webhookUrl(path) {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}
const WABA_VERSIONS = ["v24.0", "v23.0", "v22.0", "v21.0", "v20.0", "v19.0", "v18.0", "v17.0"];
function WorkspaceEditor({
  initial,
  onSaved,
  onCancel
}) {
  const qc = useQueryClient();
  const saveFn = useServerFn(upsertWorkspace);
  const webhookFn = useServerFn(setEvolutionWebhook);
  const testFn = useServerFn(testWorkspaceConnection);
  const [form, setForm] = reactExports.useState(initial);
  reactExports.useEffect(() => setForm(initial), [initial]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = useMutation({
    mutationFn: () => saveFn({ data: form }),
    onSuccess: (r) => {
      if (r.ok) {
        toast.success("Connection saved");
        qc.invalidateQueries({ queryKey: ["workspaces"] });
        onSaved();
      } else {
        toast.error(r.error ?? "Failed to save");
      }
    },
    onError: () => toast.error("Failed to save")
  });
  const test = useMutation({
    mutationFn: () => testFn({
      data: {
        id: form.id,
        provider_type: form.provider_type,
        chatwoot_url: form.chatwoot_url,
        chatwoot_account_id: form.chatwoot_account_id,
        chatwoot_api_token: form.chatwoot_api_token,
        evolution_url: form.evolution_url,
        evolution_api_key: form.evolution_api_key,
        evolution_instance: form.evolution_instance,
        waba_phone_number_id: form.waba_phone_number_id,
        waba_business_account_id: form.waba_business_account_id,
        waba_access_token: form.waba_access_token,
        waba_api_version: form.waba_api_version
      }
    }),
    onSuccess: (r) => {
      const res = r;
      if (res.ok) toast.success(res.detail ?? "Connection successful");
      else toast.error(res.error ?? "Connection failed");
    },
    onError: () => toast.error("Connection test failed")
  });
  const setWebhook = useMutation({
    mutationFn: () => webhookFn({
      data: {
        id: form.id,
        evolution_url: form.evolution_url ?? "",
        evolution_api_key: form.evolution_api_key ?? "",
        evolution_instance: form.evolution_instance ?? "",
        webhookUrl: webhookUrl("/api/public/evolution-webhook")
      }
    }),
    onSuccess: (r) => {
      if (r.ok) toast.success("Webhook set on Evolution instance");
      else toast.error(r.error ?? "Failed to set webhook");
    },
    onError: () => toast.error("Failed to set webhook")
  });
  const isEvolution = form.provider_type === "evolution";
  const isWaba = form.provider_type === "waba";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-xl border bg-muted/20 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Connection Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => set("name", e.target.value), placeholder: "UK Admissions Inbox" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Connection Provider" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: form.provider_type,
            onChange: (e) => set("provider_type", e.target.value),
            className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "chatwoot", children: "Chatwoot" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "evolution", children: "Evolution API (WhatsApp)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "waba", children: "WABA — WhatsApp Business Platform (Meta)" })
            ]
          }
        )
      ] })
    ] }),
    !isEvolution && !isWaba && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Chatwoot Base URL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.chatwoot_url ?? "",
              onChange: (e) => set("chatwoot_url", e.target.value),
              placeholder: "https://app.chatwoot.com"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Account ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.chatwoot_account_id ?? "", onChange: (e) => set("chatwoot_account_id", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inbox ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.chatwoot_inbox_id ?? "", onChange: (e) => set("chatwoot_inbox_id", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "API Token" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "password",
            value: form.chatwoot_api_token ?? "",
            onChange: (e) => set("chatwoot_api_token", e.target.value),
            placeholder: "Leave unchanged to keep the saved token"
          }
        )
      ] })
    ] }),
    isEvolution && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Evolution API Base URL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.evolution_url ?? "",
              onChange: (e) => set("evolution_url", e.target.value),
              placeholder: "https://your-evolution-host.com"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Instance Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.evolution_instance ?? "",
              onChange: (e) => set("evolution_instance", e.target.value),
              placeholder: "my-instance"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "API Key" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "password",
            value: form.evolution_api_key ?? "",
            onChange: (e) => set("evolution_api_key", e.target.value),
            placeholder: "Leave unchanged to keep the saved key"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-lg border border-dashed bg-background/60 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Webhook, { className: "h-4 w-4 text-primary" }),
          " Inbound Webhook"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Set this URL as the webhook on your Evolution instance (with the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "MESSAGES_UPSERT" }),
          " event). Use the button to configure it automatically after saving."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { readOnly: true, value: webhookUrl("/api/public/evolution-webhook"), className: "text-xs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "icon",
              onClick: () => {
                navigator.clipboard?.writeText(webhookUrl("/api/public/evolution-webhook"));
                toast.success("Webhook URL copied");
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "secondary",
            size: "sm",
            disabled: setWebhook.isPending || !form.evolution_url || !form.evolution_instance,
            onClick: () => setWebhook.mutate(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Webhook, { className: "mr-1 h-4 w-4" }),
              " Set webhook on Evolution"
            ]
          }
        )
      ] })
    ] }),
    isWaba && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 shrink-0 text-primary" }),
        "Official WhatsApp Business Platform (Cloud API). Create an app in Meta's developer dashboard, add the WhatsApp product, and copy the IDs below from the API Setup tab."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone Number ID *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.waba_phone_number_id ?? "",
              onChange: (e) => set("waba_phone_number_id", e.target.value),
              placeholder: "e.g. 123456789012345"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "WhatsApp Business Account ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.waba_business_account_id ?? "",
              onChange: (e) => set("waba_business_account_id", e.target.value),
              placeholder: "WABA ID (optional)"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Graph API Version" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: form.waba_api_version ?? "v21.0",
              onChange: (e) => set("waba_api_version", e.target.value),
              className: "h-9 w-full rounded-md border border-input bg-background px-3 text-sm",
              children: WABA_VERSIONS.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: v, children: v }, v))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Display Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.waba_display_name ?? "",
              onChange: (e) => set("waba_display_name", e.target.value),
              placeholder: "e.g. Linkmore Admissions"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Access Token (system user, permanent) *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "password",
              value: form.waba_access_token ?? "",
              onChange: (e) => set("waba_access_token", e.target.value),
              placeholder: "Leave unchanged to keep the saved token"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
            "Create a System User in Meta Business Manager with the",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "whatsapp_business_messaging" }),
            " and ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "whatsapp_business_management" }),
            " permissions and generate a permanent token."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Verify Token *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "password",
              value: form.waba_verify_token ?? "",
              onChange: (e) => set("waba_verify_token", e.target.value),
              placeholder: "Any secret string you choose"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "App Secret *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "password",
              value: form.waba_app_secret ?? "",
              onChange: (e) => set("waba_app_secret", e.target.value),
              placeholder: "Meta app secret (webhook signature)"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-lg border border-dashed bg-background/60 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Webhook, { className: "h-4 w-4 text-primary" }),
          " Inbound Webhook (Meta)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "In Meta's app dashboard → WhatsApp → Configuration, set the webhook URL below and the Verify Token above. Subscribe to the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "messages" }),
          " field. Incoming messages are signed with your App Secret and verified automatically."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { readOnly: true, value: webhookUrl("/api/public/waba-webhook"), className: "text-xs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "icon",
              onClick: () => {
                navigator.clipboard?.writeText(webhookUrl("/api/public/waba-webhook"));
                toast.success("Webhook URL copied");
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
          "Callback URL: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "break-all", children: webhookUrl("/api/public/waba-webhook") })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: form.enabled, onCheckedChange: (v) => set("enabled", v) }),
        " Enabled"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: form.is_default, onCheckedChange: (v) => set("is_default", v) }),
        " Default connection"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: form.use_shared_ai, onCheckedChange: (v) => set("use_shared_ai", v) }),
        " Use shared AI settings"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(), disabled: save.isPending || !form.name, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "mr-1 h-4 w-4" }),
        " Save Connection"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => test.mutate(), disabled: test.isPending, children: [
        test.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PlugZap, { className: "mr-1 h-4 w-4" }),
        "Test Connection"
      ] }),
      onCancel && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onCancel, children: "Cancel" })
    ] })
  ] });
}
function providerBadge(p) {
  switch (p) {
    case "evolution":
      return { label: "Evolution API", className: "bg-secondary text-secondary-foreground" };
    case "waba":
      return { label: "WABA · Meta", className: "bg-primary/10 text-primary" };
    default:
      return { label: "Chatwoot", className: "bg-secondary text-secondary-foreground" };
  }
}
function ChatwootWorkspaces() {
  const qc = useQueryClient();
  const listFn = useServerFn(listWorkspaces);
  const delFn = useServerFn(deleteWorkspace);
  const { data } = useQuery({ queryKey: ["workspaces"], queryFn: () => listFn() });
  const [creating, setCreating] = reactExports.useState(false);
  const [editingId, setEditingId] = reactExports.useState(null);
  const workspaces = (data?.workspaces ?? []).map((w) => ({
    ...w,
    provider_type: w.provider_type ?? "chatwoot"
  }));
  const del = useMutation({
    mutationFn: (id) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Connection deleted");
      qc.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: () => toast.error("Failed to delete")
  });
  const icon = (p) => p === "waba" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 text-primary" }) : p === "evolution" ? /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plug, { className: "h-4 w-4 text-primary" });
  const subtitle = (w) => {
    if (w.provider_type === "waba")
      return `${w.waba_display_name || "WhatsApp number"} · phone ${w.waba_phone_number_id || "—"} · ${w.waba_api_version || "v21.0"}`;
    if (w.provider_type === "evolution")
      return `${w.evolution_url || "no URL"} · instance ${w.evolution_instance || "—"}`;
    return `${w.chatwoot_url || "no URL"} · acct ${w.chatwoot_account_id || "—"} · inbox ${w.chatwoot_inbox_id || "—"}`;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    SettingsCard,
    {
      title: "Connections",
      description: "Connect the AI agent to multiple messaging inboxes. Each connection can use Chatwoot, Evolution API (WhatsApp) or the official WABA WhatsApp Business Platform (Meta Cloud API), and can reuse the shared AI settings or run independently. Incoming messages are routed by their inbox / account ID (Chatwoot), instance name (Evolution) or phone number ID (WABA).",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        workspaces.map(
          (w) => editingId === w.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            WorkspaceEditor,
            {
              initial: w,
              onSaved: () => setEditingId(null),
              onCancel: () => setEditingId(null)
            },
            w.id
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 rounded-xl border bg-card p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                icon(w.provider_type),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: w.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-0.5 text-[10px] font-semibold ${providerBadge(w.provider_type).className}`, children: providerBadge(w.provider_type).label }),
                w.is_default && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3" }),
                  " Default"
                ] }),
                !w.enabled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground", children: "Disabled" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 truncate text-xs text-muted-foreground", children: [
                subtitle(w),
                " · ",
                w.use_shared_ai ? "shared AI" : "independent AI"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setEditingId(w.id), children: "Edit" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  onClick: () => {
                    if (confirm(`Delete connection "${w.name}"?`)) del.mutate(w.id);
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" })
                }
              )
            ] })
          ] }, w.id)
        ),
        workspaces.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No connections yet. Add one to start routing inboxes." }),
        creating ? /* @__PURE__ */ jsxRuntimeExports.jsx(WorkspaceEditor, { initial: EMPTY$3, onSaved: () => setCreating(false), onCancel: () => setCreating(false) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setCreating(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
          " Add Connection"
        ] })
      ] })
    }
  );
}
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
const FLAG_DEFS = [
  { key: "orchestration", label: "Orchestration (Workflows & Agents)" },
  { key: "workflows", label: "Outbound Workflows" },
  { key: "advanced", label: "Advanced (Reports & Opportunities)" },
  { key: "agentic", label: "Agentic AI Assistant" },
  { key: "http_actions", label: "HTTP Actions" },
  { key: "evolution", label: "Evolution API (WhatsApp)" }
];
const LIMIT_DEFS = [
  { key: "max_users", label: "Max users" },
  { key: "max_leads", label: "Max leads" },
  { key: "max_workflows", label: "Max workflows" },
  { key: "max_inboxes", label: "Max inboxes" }
];
function SpacesManager() {
  const qc = useQueryClient();
  const listFn = useServerFn(listSpaces);
  const createFn = useServerFn(createSpace);
  const statusFn = useServerFn(setSpaceStatus);
  const deleteFn = useServerFn(deleteSpace);
  const { data, isLoading } = useQuery({ queryKey: ["spaces"], queryFn: () => listFn() });
  const spaces = data?.spaces ?? [];
  const [newName, setNewName] = reactExports.useState("");
  const [newPlan, setNewPlan] = reactExports.useState("standard");
  const [editing, setEditing] = reactExports.useState(null);
  const [managingMembers, setManagingMembers] = reactExports.useState(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["spaces"] });
  const create = useMutation({
    mutationFn: () => createFn({ data: { name: newName.trim(), plan: newPlan.trim() || "standard" } }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) return toast.error(res.error ?? "Failed to create space");
      toast.success("Space created");
      setNewName("");
      setNewPlan("standard");
      invalidate();
    },
    onError: () => toast.error("Failed to create space")
  });
  const toggleStatus = useMutation({
    mutationFn: (vars) => statusFn({ data: vars }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) return toast.error(res.error ?? "Failed");
      toast.success("Space updated");
      invalidate();
    },
    onError: () => toast.error("Failed to update space")
  });
  const remove = useMutation({
    mutationFn: (id) => deleteFn({ data: { id } }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) return toast.error(res.error ?? "Failed to delete");
      toast.success("Space deleted");
      invalidate();
    },
    onError: () => toast.error("Failed to delete space")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsCard, { title: "Create a Space", description: "Spaces are isolated sub-accounts. Each one has its own leads, conversations, workflows and settings.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "space-name", children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "space-name",
            value: newName,
            onChange: (e) => setNewName(e.target.value),
            placeholder: "Acme University"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "space-plan", children: "Plan" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "space-plan",
            value: newPlan,
            onChange: (e) => setNewPlan(e.target.value),
            placeholder: "standard"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => create.mutate(), disabled: !newName.trim() || create.isPending, children: [
        create.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        "Create"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsCard, { title: "Spaces", description: "Manage sub-accounts, their access plans and members.", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" }) }) : spaces.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No spaces yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: spaces.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col gap-3 rounded-xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: s.name }),
              s.is_default && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Default" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: s.status === "active" ? "default" : "destructive", children: s.status })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Plan: ",
              s.plan,
              " · ",
              s.member_count,
              " member",
              s.member_count === 1 ? "" : "s"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setManagingMembers(s), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
              " Members"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setEditing(s), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "h-4 w-4" }),
              " Plan"
            ] }),
            !s.is_default && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => toggleStatus.mutate({ id: s.id, status: s.status === "active" ? "suspended" : "active" }),
                children: s.status === "active" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-4 w-4" }),
                  " Suspend"
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4" }),
                  " Activate"
                ] })
              }
            ),
            !s.is_default && /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { children: [
                    "Delete ",
                    s.name,
                    "?"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This permanently deletes the Space and ALL of its data (leads, conversations, workflows, settings). This cannot be undone." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    AlertDialogAction,
                    {
                      className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                      onClick: () => remove.mutate(s.id),
                      children: "Delete"
                    }
                  )
                ] })
              ] })
            ] })
          ] })
        ]
      },
      s.id
    )) }) }),
    editing && /* @__PURE__ */ jsxRuntimeExports.jsx(EditPlanDialog, { space: editing, onClose: () => setEditing(null), onSaved: invalidate }),
    managingMembers && /* @__PURE__ */ jsxRuntimeExports.jsx(MembersDialog, { space: managingMembers, onClose: () => setManagingMembers(null) })
  ] });
}
function EditPlanDialog({ space, onClose, onSaved }) {
  const updateFn = useServerFn(updateSpace);
  const [plan, setPlan] = reactExports.useState(space.plan);
  const [flags, setFlags] = reactExports.useState({ ...space.feature_flags });
  const [limits, setLimits] = reactExports.useState({ ...space.limits });
  const save = useMutation({
    mutationFn: () => updateFn({ data: { id: space.id, plan, feature_flags: flags, limits } }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) return toast.error(res.error ?? "Failed to save");
      toast.success("Plan updated");
      onSaved();
      onClose();
    },
    onError: () => toast.error("Failed to save plan")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[85vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        space.name,
        " — Access Plan"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Control which features and limits apply to this Space." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Plan label" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: plan, onChange: (e) => setPlan(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Features" }),
        FLAG_DEFS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: f.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: flags[f.key] ?? false,
              onCheckedChange: (v) => setFlags((p) => ({ ...p, [f.key]: v }))
            }
          )
        ] }, f.key))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Usage limits" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: LIMIT_DEFS.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: l.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              min: 0,
              value: limits[l.key] ?? 0,
              onChange: (e) => setLimits((p) => ({ ...p, [l.key]: Number(e.target.value) }))
            }
          )
        ] }, l.key)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: [
        save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
        "Save"
      ] })
    ] })
  ] }) });
}
function MembersDialog({ space, onClose }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listSpaceMembers);
  const addFn = useServerFn(addSpaceMember);
  const removeFn = useServerFn(removeSpaceMember);
  const { data, isLoading } = useQuery({
    queryKey: ["space-members", space.id],
    queryFn: () => listFn({ data: { spaceId: space.id } })
  });
  const members = data?.members ?? [];
  const users = data?.users ?? [];
  const [selectedUser, setSelectedUser] = reactExports.useState("");
  const [selectedRole, setSelectedRole] = reactExports.useState("agent");
  const invalidate = () => qc.invalidateQueries({ queryKey: ["space-members", space.id] });
  const invalidateSpaces = () => qc.invalidateQueries({ queryKey: ["spaces"] });
  const add = useMutation({
    mutationFn: () => addFn({ data: { spaceId: space.id, userId: selectedUser, role: selectedRole } }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) return toast.error(res.error ?? "Failed to add member");
      toast.success("Member added");
      setSelectedUser("");
      invalidate();
      invalidateSpaces();
    },
    onError: () => toast.error("Failed to add member")
  });
  const remove = useMutation({
    mutationFn: (id) => removeFn({ data: { id } }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) return toast.error(res.error ?? "Failed to remove member");
      toast.success("Member removed");
      invalidate();
      invalidateSpaces();
    },
    onError: () => toast.error("Failed to remove member")
  });
  const userLabel = reactExports.useMemo(
    () => (u) => u.full_name ? `${u.full_name} (${u.email ?? "no email"})` : u.email ?? u.user_id,
    []
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[85vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        space.name,
        " — Members"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Assign existing platform users to this Space. Super admins are not members; they manage all Spaces." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-[1fr_130px_auto] sm:items-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "User" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedUser, onValueChange: setSelectedUser, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a user" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: users.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-1.5 text-sm text-muted-foreground", children: "No users to add" }) : users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u.user_id, children: userLabel(u) }, u.user_id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Role" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedRole, onValueChange: (v) => setSelectedRole(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "admin", children: "Admin" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "agent", children: "Agent" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => add.mutate(), disabled: !selectedUser || add.isPending, children: [
          add.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          "Add"
        ] })
      ] }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" }) }) : members.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No members yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: members.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: m.full_name ?? m.email ?? m.user_id }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            m.email,
            " · ",
            m.role
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-destructive", onClick: () => remove.mutate(m.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] }, m.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Close" }) })
  ] }) });
}
const getVoipSettings = createServerFn({
  method: "GET"
}).handler(createSsrRpc("b03ddef266c0950392b12635353029702c87de4525dc8d88b2ac114e4d0ec662"));
const voipSchema = objectType({
  id: stringType().uuid().optional(),
  provider: enumType(["disabled", "sip", "twilio"]),
  enabled: booleanType(),
  sip_ws_server: stringType().max(500).nullable().optional(),
  sip_domain: stringType().max(300).nullable().optional(),
  sip_uri: stringType().max(300).nullable().optional(),
  sip_username: stringType().max(300).nullable().optional(),
  sip_password: stringType().max(500).nullable().optional(),
  sip_display_name: stringType().max(200).nullable().optional(),
  twilio_account_sid: stringType().max(100).nullable().optional(),
  twilio_api_key_sid: stringType().max(100).nullable().optional(),
  twilio_api_key_secret: stringType().max(500).nullable().optional(),
  twilio_twiml_app_sid: stringType().max(100).nullable().optional(),
  twilio_caller_id: stringType().max(60).nullable().optional(),
  inbound_enabled: booleanType().optional()
});
const saveVoipSettings = createServerFn({
  method: "POST"
}).inputValidator((d) => voipSchema.parse(d)).handler(createSsrRpc("dad28c0d24bb0f8d3f94b0787e0c5251b71059f48a69bafc1733951b251659be"));
const getVoipClientConfig = createServerFn({
  method: "GET"
}).handler(createSsrRpc("25caaca990ebedc2f903c87ae54da6728d0ea78bafac960a8ee62cb6162a72a4"));
const listCalls = createServerFn({
  method: "GET"
}).handler(createSsrRpc("c58440861d680dc087dbe989cbc83d688543877ef870f2f762b3e3c70a11d787"));
const logCallSchema = objectType({
  id: stringType().uuid().optional(),
  lead_id: stringType().uuid().nullable().optional(),
  phone_number: stringType().min(1).max(60),
  direction: enumType(["outbound", "inbound"]).optional(),
  status: enumType(["completed", "no_answer", "busy", "failed", "voicemail", "canceled"]).optional(),
  disposition: stringType().max(200).nullable().optional(),
  notes: stringType().max(5e3).nullable().optional(),
  provider: stringType().max(20).nullable().optional(),
  provider_call_sid: stringType().max(120).nullable().optional(),
  started_at: stringType().nullable().optional(),
  ended_at: stringType().nullable().optional(),
  duration_seconds: numberType().int().min(0).max(86400).optional()
});
const logCall = createServerFn({
  method: "POST"
}).inputValidator((d) => logCallSchema.parse(d)).handler(createSsrRpc("fd0d3b9c8ce4e5ac2d87acf54c38f2ec4eb625ed91f013ca94d2e97381299ed1"));
const updateCallNotes = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid(),
  notes: stringType().max(5e3).nullable(),
  disposition: stringType().max(200).nullable().optional()
}).parse(d)).handler(createSsrRpc("d4891ea68ff5307322482a8a30200c4fd9b87d627ec15141a9ad18b11ff050ac"));
const scheduleCallback = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  lead_id: stringType().uuid().nullable().optional(),
  phone_number: stringType().min(1).max(60),
  scheduled_at: stringType().min(1),
  reason: stringType().max(500).nullable().optional(),
  notes: stringType().max(5e3).nullable().optional(),
  from_call_id: stringType().uuid().nullable().optional()
}).parse(d)).handler(createSsrRpc("41f4843a9bb81e173789f270baaece6814a69fbb86bd369e6761aad89e1e9a9f"));
createServerFn({
  method: "GET"
}).handler(createSsrRpc("560bf64a863cbd8cd6b5531a42029c43ed906bfb77fd28e0dc1fdb5b89cd53e5"));
createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["done", "canceled"]).optional()
}).parse(d)).handler(createSsrRpc("e50779576e31bc4f3b51972f15a3b4f562c03487d5fad48da4dfaa1399c0710c"));
const listDialCampaigns = createServerFn({
  method: "GET"
}).handler(createSsrRpc("9512807060990a885c1149e0e40f5adaebf01a7887a18006efacdfdee00d891d"));
const campaignSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(200),
  source_type: enumType(["stage", "filter", "manual", "callbacks"]),
  criteria: recordType(stringType(), unknownType()).optional(),
  active: booleanType().optional(),
  // For manual campaigns: the members to (re)set.
  members: arrayType(objectType({
    lead_id: stringType().uuid().nullable().optional(),
    phone_number: stringType().min(1).max(60)
  })).max(5e3).optional()
});
const saveDialCampaign = createServerFn({
  method: "POST"
}).inputValidator((d) => campaignSchema.parse(d)).handler(createSsrRpc("151d2799439b6ae93ab9a47ee982f29e75feccb9965783a29f60105bc34369ca"));
const deleteDialCampaign = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("cae24ae13cf900c489434963e29055a95a2f60a30b9b3539f702f5a84a9c43b6"));
const getDialQueue = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  campaignId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("b451d9a310b3253a27530f6a912668e1efd903735a5262c1b5da76277d66f334"));
const searchDialContacts = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  query: stringType().max(200).optional()
}).parse(d ?? {})).handler(createSsrRpc("1dbdb8a6d4237e2084fd6628fcfdf07fce535a0e98aa344f32c319e4008ddd6b"));
const listSpaceAgents = createServerFn({
  method: "GET"
}).handler(createSsrRpc("45267149e0cd688d5407f5e514733fde814645ac8754f46f47b109826842d319"));
const listRingGroups = createServerFn({
  method: "GET"
}).handler(createSsrRpc("aecdb3a5a8a7c7efbc47721add99adf014cc1f7734d33bcd0e118e4fa6775e61"));
const ringGroupSchema = objectType({
  id: stringType().uuid().optional(),
  name: stringType().min(1).max(200),
  ring_seconds: numberType().int().min(5).max(120).optional(),
  active: booleanType().optional(),
  member_ids: arrayType(stringType().uuid()).max(50).optional()
});
const saveRingGroup = createServerFn({
  method: "POST"
}).inputValidator((d) => ringGroupSchema.parse(d)).handler(createSsrRpc("fbc23770a8f8afc5871df4155273041ecf595e1276788a4ee8818548276f3a7e"));
const deleteRingGroup = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("3429ef1809e40da5b2765ce7321f0f8c0bd4480c84d52df3a7704240989c480f"));
const listInboundRoutes = createServerFn({
  method: "GET"
}).handler(createSsrRpc("8d09d91d64c2cae32ca5c0a11dbb00c5071882202f78582bb53815a16ed0c698"));
const inboundRouteSchema = objectType({
  id: stringType().uuid().optional(),
  did: stringType().min(3).max(60),
  ring_group_id: stringType().uuid().nullable().optional(),
  no_answer_action: enumType(["hangup", "voicemail"]).optional(),
  active: booleanType().optional()
});
const saveInboundRoute = createServerFn({
  method: "POST"
}).inputValidator((d) => inboundRouteSchema.parse(d)).handler(createSsrRpc("d6bba8bf2ff4c4c4ce4be456d16903a034e17424789545613276745cf9416ecd"));
const deleteInboundRoute = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("11fc11bca3071e8facf27c51f7dd5dfe326353ee39ceb5b8e190f33464c9556a"));
const Checkbox = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Checkbox$1,
  {
    ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckboxIndicator, { className: cn("grid place-content-center text-current"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = Checkbox$1.displayName;
const EMPTY$2 = { name: "", ring_seconds: 20, active: true, member_ids: [] };
function RingGroupsManager() {
  const qc = useQueryClient();
  const listFn = useServerFn(listRingGroups);
  const agentsFn = useServerFn(listSpaceAgents);
  const saveFn = useServerFn(saveRingGroup);
  const deleteFn = useServerFn(deleteRingGroup);
  const { data: groupsData } = useQuery({ queryKey: ["ring-groups"], queryFn: () => listFn() });
  const { data: agentsData } = useQuery({ queryKey: ["space-agents"], queryFn: () => agentsFn() });
  const groups = groupsData?.groups ?? [];
  const agents = agentsData?.agents ?? [];
  const [draft, setDraft] = reactExports.useState(null);
  const agentName = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const a of agents) m.set(a.user_id, a.full_name || a.email || a.user_id.slice(0, 8));
    return m;
  }, [agents]);
  const save = useMutation({
    mutationFn: (d) => saveFn({ data: d }),
    onSuccess: (res) => {
      const r = res;
      if (r.ok) {
        qc.invalidateQueries({ queryKey: ["ring-groups"] });
        toast.success("Ring group saved");
        setDraft(null);
      } else {
        toast.error(r.error ?? "Failed to save");
      }
    },
    onError: () => toast.error("Failed to save")
  });
  const remove = useMutation({
    mutationFn: (id) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ring-groups"] });
      qc.invalidateQueries({ queryKey: ["inbound-routes"] });
      toast.success("Ring group deleted");
    }
  });
  const toggleMember = (uid2) => setDraft(
    (d) => d ? {
      ...d,
      member_ids: d.member_ids.includes(uid2) ? d.member_ids.filter((x) => x !== uid2) : [...d.member_ids, uid2]
    } : d
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    SettingsCard,
    {
      title: "Ring groups",
      description: "Groups of agents that ring together when an incoming call arrives. The first to answer takes the call.",
      children: [
        draft ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-lg border p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Group name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: draft.name,
                onChange: (e) => setDraft({ ...draft, name: e.target.value }),
                placeholder: "Admissions team"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ring seconds" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: 5,
                  max: 120,
                  value: draft.ring_seconds,
                  onChange: (e) => setDraft({ ...draft, ring_seconds: Number(e.target.value) || 20 })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between rounded-lg border p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Active" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: draft.active, onCheckedChange: (v) => setDraft({ ...draft, active: v }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Members" }),
            agents.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No agents found." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-52 space-y-1 overflow-y-auto rounded-lg border p-2", children: agents.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "label",
              {
                className: "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Checkbox,
                    {
                      checked: draft.member_ids.includes(a.user_id),
                      onCheckedChange: () => toggleMember(a.user_id)
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: a.full_name || a.email || a.user_id.slice(0, 8) }),
                  a.role && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                    "· ",
                    a.role
                  ] })
                ]
              },
              a.user_id
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(draft), disabled: save.isPending || !draft.name.trim(), className: "gap-2", children: [
              save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
              "Save group"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setDraft(null), children: "Cancel" })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "gap-2", onClick: () => setDraft({ ...EMPTY$2 }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          " New ring group"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          groups.length === 0 && !draft && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No ring groups yet." }),
          groups.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-muted-foreground" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-medium", children: g.name }),
                !g.active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "(inactive)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 truncate text-xs text-muted-foreground", children: [
                g.ring_seconds,
                "s ·",
                " ",
                g.member_ids.length ? g.member_ids.map((id) => agentName.get(id) ?? id.slice(0, 8)).join(", ") : "no members"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: () => setDraft({
                    id: g.id,
                    name: g.name,
                    ring_seconds: g.ring_seconds,
                    active: g.active,
                    member_ids: g.member_ids
                  }),
                  children: "Edit"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => remove.mutate(g.id), disabled: remove.isPending, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
            ] })
          ] }, g.id))
        ] })
      ]
    }
  );
}
const EMPTY$1 = { did: "", ring_group_id: null, active: true };
function InboundRoutesManager() {
  const qc = useQueryClient();
  const listFn = useServerFn(listInboundRoutes);
  const groupsFn = useServerFn(listRingGroups);
  const saveFn = useServerFn(saveInboundRoute);
  const deleteFn = useServerFn(deleteInboundRoute);
  const { data: routesData } = useQuery({ queryKey: ["inbound-routes"], queryFn: () => listFn() });
  const { data: groupsData } = useQuery({ queryKey: ["ring-groups"], queryFn: () => groupsFn() });
  const routes = routesData?.routes ?? [];
  const groups = groupsData?.groups ?? [];
  const [draft, setDraft] = reactExports.useState(null);
  const groupName = (id) => groups.find((g) => g.id === id)?.name ?? "— unassigned —";
  const save = useMutation({
    mutationFn: (d) => saveFn({ data: d }),
    onSuccess: (res) => {
      const r = res;
      if (r.ok) {
        qc.invalidateQueries({ queryKey: ["inbound-routes"] });
        toast.success("Inbound route saved");
        setDraft(null);
      } else {
        toast.error(r.error ?? "Failed to save");
      }
    },
    onError: () => toast.error("Failed to save")
  });
  const remove = useMutation({
    mutationFn: (id) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inbound-routes"] });
      toast.success("Route deleted");
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    SettingsCard,
    {
      title: "Inbound routes",
      description: "Map each incoming phone number to a ring group. Point that Twilio number's Voice webhook at the inbound URL shown above.",
      children: [
        draft ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-lg border p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Incoming number (DID)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: draft.did,
                onChange: (e) => setDraft({ ...draft, did: e.target.value }),
                placeholder: "+15551234567"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ring group" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: draft.ring_group_id ?? "none",
                onValueChange: (v) => setDraft({ ...draft, ring_group_id: v === "none" ? null : v }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "— unassigned —" }),
                    groups.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: g.id, children: g.name }, g.id))
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Active" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: draft.active, onCheckedChange: (v) => setDraft({ ...draft, active: v }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(draft), disabled: save.isPending || !draft.did.trim(), className: "gap-2", children: [
              save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
              "Save route"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setDraft(null), children: "Cancel" })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "gap-2", onClick: () => setDraft({ ...EMPTY$1 }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          " New inbound route"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          routes.length === 0 && !draft && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No inbound routes yet." }),
          routes.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneIncoming, { className: "h-4 w-4 text-muted-foreground" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-medium", children: r.did }),
                !r.active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "(inactive)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 truncate text-xs text-muted-foreground", children: [
                "→ ",
                groupName(r.ring_group_id)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: () => setDraft({ id: r.id, did: r.did, ring_group_id: r.ring_group_id, active: r.active }),
                  children: "Edit"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => remove.mutate(r.id), disabled: remove.isPending, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
            ] })
          ] }, r.id))
        ] })
      ]
    }
  );
}
function useProjectUrl(path) {
  const [origin, setOrigin] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);
  const clean = path.startsWith("/") ? path : `/${path}`;
  return origin ? `${origin}${clean}` : clean;
}
function Field({
  label,
  value,
  onChange,
  placeholder,
  type,
  hint
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: value ?? "", onChange: (e) => onChange(e.target.value), placeholder, type }),
    hint && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: hint })
  ] });
}
function VoipSettingsForm() {
  const qc = useQueryClient();
  const getFn = useServerFn(getVoipSettings);
  const saveFn = useServerFn(saveVoipSettings);
  const twimlUrl = useProjectUrl("/api/public/voip/twiml");
  const inboundUrl = useProjectUrl("/api/public/voip/inbound");
  const [form, setForm] = reactExports.useState({ provider: "disabled", enabled: false, inbound_enabled: false });
  const { data } = useQuery({ queryKey: ["voip-settings"], queryFn: () => getFn() });
  reactExports.useEffect(() => {
    if (data?.settings) {
      const s = data.settings;
      setForm({ ...s, sip_password: "", twilio_api_key_secret: "" });
    }
  }, [data]);
  const save = useMutation({
    mutationFn: (payload) => saveFn({ data: payload }),
    onSuccess: (res) => {
      const r = res;
      if (r.ok) {
        qc.invalidateQueries({ queryKey: ["voip-settings"] });
        toast.success("Telephony settings saved");
      } else {
        toast.error(r.error ?? "Failed to save");
      }
    },
    onError: () => toast.error("Failed to save")
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      SettingsCard,
      {
        title: "Telephony",
        description: "Configure how agents place calls from the Calls tab. Choose a self-hosted SIP/WebRTC server or Twilio Programmable Voice.",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Enable calling" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Turn the softphone on for this Space." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: form.enabled, onCheckedChange: (v) => set("enabled", v) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Enable incoming calls" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Ring agents in the browser for inbound calls (Twilio) or answer inbound SIP calls." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: Boolean(form.inbound_enabled), onCheckedChange: (v) => set("inbound_enabled", v) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Provider" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.provider, onValueChange: (v) => set("provider", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "disabled", children: "Disabled" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sip", children: "SIP / WebRTC (self-hosted PBX)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "twilio", children: "Twilio Programmable Voice" })
              ] })
            ] })
          ] })
        ]
      }
    ),
    form.provider === "sip" && /* @__PURE__ */ jsxRuntimeExports.jsxs(SettingsCard, { title: "SIP / WebRTC", description: "Connect to your Asterisk / FreePBX / Kamailio server over a secure WebSocket (WSS).", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Field,
        {
          label: "WebSocket server (WSS)",
          value: form.sip_ws_server,
          onChange: (v) => set("sip_ws_server", v),
          placeholder: "wss://pbx.example.com:8089/ws"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "SIP URI (AOR)", value: form.sip_uri, onChange: (v) => set("sip_uri", v), placeholder: "sip:1001@pbx.example.com" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "SIP domain", value: form.sip_domain, onChange: (v) => set("sip_domain", v), placeholder: "pbx.example.com" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Auth username", value: form.sip_username, onChange: (v) => set("sip_username", v), placeholder: "1001" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Field,
        {
          label: "Auth password",
          value: form.sip_password,
          onChange: (v) => set("sip_password", v),
          placeholder: "••••••• (leave blank to keep current)",
          type: "password"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Display name", value: form.sip_display_name, onChange: (v) => set("sip_display_name", v), placeholder: "Admissions" })
    ] }),
    form.provider === "twilio" && /* @__PURE__ */ jsxRuntimeExports.jsxs(SettingsCard, { title: "Twilio Programmable Voice", description: "Uses a Twilio TwiML App + API Key to place browser calls.", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 font-medium text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
          " TwiML App Voice URL"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: "Set your TwiML App's Voice Request URL (HTTP POST) to:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "mt-1 block break-all rounded bg-background px-2 py-1", children: twimlUrl })
      ] }),
      form.inbound_enabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 font-medium text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneIncoming, { className: "h-3.5 w-3.5" }),
          " Inbound number Voice URL"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: "Set each incoming Twilio number's Voice Request URL (HTTP POST) to:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "mt-1 block break-all rounded bg-background px-2 py-1", children: inboundUrl })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Account SID", value: form.twilio_account_sid, onChange: (v) => set("twilio_account_sid", v), placeholder: "ACxxxxxxxx" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "API Key SID", value: form.twilio_api_key_sid, onChange: (v) => set("twilio_api_key_sid", v), placeholder: "SKxxxxxxxx" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Field,
        {
          label: "API Key Secret",
          value: form.twilio_api_key_secret,
          onChange: (v) => set("twilio_api_key_secret", v),
          placeholder: "••••••• (leave blank to keep current)",
          type: "password"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "TwiML App SID", value: form.twilio_twiml_app_sid, onChange: (v) => set("twilio_twiml_app_sid", v), placeholder: "APxxxxxxxx" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Field,
        {
          label: "Caller ID (from number)",
          value: form.twilio_caller_id,
          onChange: (v) => set("twilio_caller_id", v),
          placeholder: "+15551234567",
          hint: "A Twilio number verified for outbound calls."
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending, className: "gap-2", children: [
      save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
      "Save telephony settings"
    ] }),
    form.inbound_enabled && form.provider !== "disabled" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RingGroupsManager, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InboundRoutesManager, {})
    ] })
  ] });
}
const WEEKDAYS = [
  { n: 1, label: "Mon" },
  { n: 2, label: "Tue" },
  { n: 3, label: "Wed" },
  { n: 4, label: "Thu" },
  { n: 5, label: "Fri" },
  { n: 6, label: "Sat" },
  { n: 0, label: "Sun" }
];
function nextDateStr(offsetDays) {
  const d = /* @__PURE__ */ new Date();
  d.setDate(d.getDate() + offsetDays);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function CalendarSettingsForm() {
  const qc = useQueryClient();
  const getFn = useServerFn(getCalendarSettings);
  const saveFn = useServerFn(saveCalendarSettings);
  const slotsFn = useServerFn(getAvailableSlots);
  const { data } = useQuery({ queryKey: ["calendar-settings"], queryFn: () => getFn() });
  const [form, setForm] = reactExports.useState({
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
  });
  reactExports.useEffect(() => {
    const s = data?.settings ?? null;
    if (!s) return;
    setForm({
      ...s,
      calcom_api_key: "",
      // never surface stored secrets back
      google_api_key: ""
    });
  }, [data]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleDay = (n) => {
    setForm((f) => ({
      ...f,
      working_days: f.working_days.includes(n) ? f.working_days.filter((d) => d !== n) : [...f.working_days, n].sort()
    }));
  };
  const hasSecret = (k) => Boolean(data?.settings?.[k]);
  const save = useMutation({
    mutationFn: () => saveFn({
      data: {
        id: form.id,
        provider: form.provider,
        slot_duration_minutes: form.slot_duration_minutes,
        buffer_minutes: form.buffer_minutes,
        working_days: form.working_days,
        working_start: form.working_start,
        working_end: form.working_end,
        timezone: form.timezone,
        calcom_username: form.calcom_username || null,
        calcom_event_slug: form.calcom_event_slug || null,
        calcom_api_key: form.calcom_api_key || "",
        google_calendar_id: form.google_calendar_id || null,
        google_api_key: form.google_api_key || ""
      }
    }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) {
        toast.error(res.error ?? "Failed to save");
        return;
      }
      setForm((f) => ({ ...f, calcom_api_key: "", google_api_key: "" }));
      qc.invalidateQueries({ queryKey: ["calendar-settings"] });
      toast.success("Calendar settings saved");
    },
    onError: () => toast.error("Failed to save")
  });
  const previewQuery = useQuery({
    queryKey: ["slot-preview", form.working_start, form.working_end, form.slot_duration_minutes, form.provider],
    queryFn: async () => {
      for (let i = 1; i <= 7; i++) {
        const r = await slotsFn({ data: { date: nextDateStr(i) } });
        if (r.slots?.length) return r;
      }
      return { slots: [], provider: form.provider, calcomLink: null };
    },
    enabled: form.provider !== "calcom",
    staleTime: 3e4
  });
  const preview = previewQuery.data;
  const calcomLink = form.provider === "calcom" && form.calcom_username && form.calcom_event_slug ? `https://cal.com/${encodeURIComponent(form.calcom_username)}/${encodeURIComponent(form.calcom_event_slug)}` : null;
  const slotLabels = reactExports.useMemo(
    () => (preview?.slots ?? []).slice(0, 6).map(
      (s) => new Intl.DateTimeFormat("en-US", {
        timeZone: form.timezone || "UTC",
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }).format(new Date(s.start))
    ),
    [preview, form.timezone]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    SettingsCard,
    {
      title: "Calendar & Availability",
      description: "Controls the available slots agents can book from the chat. Slots can be manual or powered by Cal.com / Google Calendar.",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Booking provider" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.provider, onValueChange: (v) => set("provider", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manual", children: "Manual availability" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "calcom", children: "Cal.com" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "google", children: "Google Calendar" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            form.provider === "manual" && "Slots are generated from the working hours below.",
            form.provider === "calcom" && "Agents get a Cal.com booking link; the in-app picker still uses working hours.",
            form.provider === "google" && "Busy events from the public Google Calendar are excluded from the slot picker."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-xl border bg-muted/30 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Working days" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: WEEKDAYS.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => toggleDay(d.n),
                className: cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                  form.working_days.includes(d.n) ? "border-primary bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
                ),
                children: d.label
              },
              d.n
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Day starts at" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: form.working_start, onChange: (e) => set("working_start", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Day ends at" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: form.working_end, onChange: (e) => set("working_end", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Slot length (minutes)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: 10,
                  max: 240,
                  step: 5,
                  value: form.slot_duration_minutes,
                  onChange: (e) => set("slot_duration_minutes", Number(e.target.value) || 30)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buffer between slots (minutes)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: 0,
                  max: 240,
                  step: 5,
                  value: form.buffer_minutes,
                  onChange: (e) => set("buffer_minutes", Number(e.target.value) || 0)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Timezone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: form.timezone,
                  onChange: (e) => set("timezone", e.target.value),
                  placeholder: "UTC, America/Sao_Paulo, Europe/London…"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "IANA timezone used to display slots and book appointments." })
            ] })
          ] }),
          form.provider !== "calcom" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-dashed bg-background/60 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-3.5 w-3.5" }),
              " Next available slots"
            ] }),
            previewQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
              " Checking…"
            ] }) : slotLabels.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: slotLabels.map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary", children: l }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No slots generated — check the working days and hours." })
          ] })
        ] }),
        form.provider === "calcom" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-xl border bg-muted/30 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cal.com username" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: form.calcom_username ?? "",
                  onChange: (e) => set("calcom_username", e.target.value),
                  placeholder: "yourname"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Event type slug" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: form.calcom_event_slug ?? "",
                  onChange: (e) => set("calcom_event_slug", e.target.value),
                  placeholder: "admissions-call"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cal.com API key (optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "password",
                value: form.calcom_api_key ?? "",
                onChange: (e) => set("calcom_api_key", e.target.value),
                placeholder: hasSecret("calcom_api_key") ? "•••••••• (saved — leave blank to keep)" : "Paste your API key"
              }
            )
          ] }),
          calcomLink && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: calcomLink,
              target: "_blank",
              rel: "noreferrer",
              className: "inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs text-primary hover:bg-muted",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" }),
                " ",
                calcomLink
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Agents can share this booking link with leads or open it from the chat. In-app slots still use the working hours above." })
        ] }),
        form.provider === "google" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-xl border bg-muted/30 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Google Calendar ID" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: form.google_calendar_id ?? "",
                  onChange: (e) => set("google_calendar_id", e.target.value),
                  placeholder: "calendar@group.calendar.google.com"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Google API key" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "password",
                  value: form.google_api_key ?? "",
                  onChange: (e) => set("google_api_key", e.target.value),
                  placeholder: hasSecret("google_api_key") ? "•••••••• (saved — leave blank to keep)" : "Paste your API key"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Busy events are pulled from a ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "public" }),
            " calendar using the Google Calendar API. Keep the calendar shared publicly, or use the Cal.com provider for private scheduling."
          ] }),
          form.google_calendar_id && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(form.google_calendar_id)}`,
              target: "_blank",
              rel: "noreferrer",
              className: "inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs text-primary hover:bg-muted",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarCheck2, { className: "h-3.5 w-3.5" }),
                " Open embedded calendar"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(), disabled: save.isPending, className: "gap-2", children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
          "Save calendar settings"
        ] })
      ]
    }
  ) });
}
function JitsiSettingsForm() {
  const qc = useQueryClient();
  const getFn = useServerFn(getJitsiSettings);
  const saveFn = useServerFn(saveJitsiSettings);
  const { data } = useQuery({ queryKey: ["jitsi-settings"], queryFn: () => getFn() });
  const [form, setForm] = reactExports.useState({
    enabled: true,
    server_url: "https://meet.jit.si",
    display_name: "Admissions",
    room_prefix: "admissions"
  });
  reactExports.useEffect(() => {
    const s = data?.settings ?? null;
    if (s) setForm(s);
  }, [data]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = useMutation({
    mutationFn: () => saveFn({ data: { id: form.id, enabled: form.enabled, server_url: form.server_url, display_name: form.display_name, room_prefix: form.room_prefix } }),
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) {
        toast.error(res.error ?? "Failed to save");
        return;
      }
      qc.invalidateQueries({ queryKey: ["jitsi-settings"] });
      toast.success("Video call settings saved");
    },
    onError: () => toast.error("Failed to save")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    SettingsCard,
    {
      title: "Video Calls (Jitsi)",
      description: "Agents start and manage Jitsi video meetings directly from the Calls tab. Uses the free public Jitsi Meet server by default, or point it at your own self-hosted instance.",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "mt-0.5 h-5 w-5 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Enable video calls" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Show the video meeting panel in the Calls tab." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: form.enabled, onCheckedChange: (v) => set("enabled", Boolean(v)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Jitsi server URL" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.server_url,
                onChange: (e) => set("server_url", e.target.value),
                placeholder: "https://meet.jit.si"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Public Jitsi Meet or your self-hosted instance." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Room name prefix" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.room_prefix,
                onChange: (e) => set("room_prefix", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")),
                placeholder: "admissions"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Room names look like: ",
              form.room_prefix || "admissions",
              "-meeting-8f3k."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Agent display name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.display_name, onChange: (e) => set("display_name", e.target.value), placeholder: "Admissions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Shown to the lead when they join the video meeting." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(), disabled: save.isPending, className: "gap-2", children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
          "Save video settings"
        ] })
      ]
    }
  );
}
const SECTIONS$1 = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "programs", label: "Programs", icon: BookOpen },
  { id: "provider", label: "AI Provider", icon: Cpu },
  { id: "prompt", label: "AI Prompt", icon: Bot },
  { id: "variables", label: "AI Variables", icon: Variable },
  { id: "chatwoot", label: "Chatwoot", icon: Plug },
  { id: "workspaces", label: "Connections", icon: Network },
  { id: "actions", label: "HTTP Actions", icon: Webhook },
  { id: "telephony", label: "Telephony", icon: Phone },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "video", label: "Video Calls", icon: Video },
  { id: "lab", label: "Prompt Lab", icon: FlaskConical },
  { id: "users", label: "Users", icon: UserCog },
  { id: "spaces", label: "Spaces", icon: Boxes }
];
function SettingsTab({ role }) {
  const allowed = SECTIONS$1.filter((s) => canAccessSettingsSection(role, s.id));
  const [section, setSection] = reactExports.useState(allowed[0]?.id ?? "company");
  const activeSection = allowed.some((s) => s.id === section) ? section : allowed[0]?.id;
  if (allowed.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "You don't have access to any settings." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-[200px_1fr]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-row flex-wrap gap-1 lg:flex-col", children: allowed.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setSection(s.id),
        className: cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          activeSection === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "h-4 w-4" }),
          s.label
        ]
      },
      s.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      activeSection === "company" && /* @__PURE__ */ jsxRuntimeExports.jsx(CompanySettingsForm, {}),
      activeSection === "programs" && /* @__PURE__ */ jsxRuntimeExports.jsx(ProgramSettingsForm, {}),
      activeSection === "provider" && /* @__PURE__ */ jsxRuntimeExports.jsx(AiProviderSettings, {}),
      activeSection === "prompt" && /* @__PURE__ */ jsxRuntimeExports.jsx(AiPromptEditor, {}),
      activeSection === "variables" && /* @__PURE__ */ jsxRuntimeExports.jsx(AiVariablesEditor, {}),
      activeSection === "chatwoot" && /* @__PURE__ */ jsxRuntimeExports.jsx(ChatwootSettingsForm, {}),
      activeSection === "workspaces" && /* @__PURE__ */ jsxRuntimeExports.jsx(ChatwootWorkspaces, {}),
      activeSection === "actions" && /* @__PURE__ */ jsxRuntimeExports.jsx(HttpActionsManager, {}),
      activeSection === "telephony" && /* @__PURE__ */ jsxRuntimeExports.jsx(VoipSettingsForm, {}),
      activeSection === "calendar" && /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarSettingsForm, {}),
      activeSection === "video" && /* @__PURE__ */ jsxRuntimeExports.jsx(JitsiSettingsForm, {}),
      activeSection === "lab" && /* @__PURE__ */ jsxRuntimeExports.jsx(PromptTestingLab, {}),
      activeSection === "users" && /* @__PURE__ */ jsxRuntimeExports.jsx(UserManagement, {}),
      activeSection === "spaces" && /* @__PURE__ */ jsxRuntimeExports.jsx(SpacesManager, {})
    ] })
  ] });
}
async function loadTwilioDevice() {
  const bundle = await import("./twilio-Bd1qR_K3.mjs").then((n) => n.t);
  const globalTwilio = typeof window !== "undefined" ? window.Twilio : void 0;
  const Device = bundle.Device ?? globalTwilio?.Device;
  if (!Device) throw new Error("Twilio Voice SDK browser bundle did not expose Device.");
  return Device;
}
function useSoftphone() {
  const configFn = useServerFn(getVoipClientConfig);
  const [state, setState] = reactExports.useState({
    status: "idle",
    provider: null,
    ready: false,
    error: null,
    currentNumber: null,
    durationSec: 0,
    muted: false,
    direction: null,
    incoming: false,
    incomingFrom: null,
    registered: false
  });
  const sipRef = reactExports.useRef(null);
  const twilioDeviceRef = reactExports.useRef(null);
  const twilioCallRef = reactExports.useRef(null);
  const incomingCallRef = reactExports.useRef(null);
  const audioRef = reactExports.useRef(null);
  const timerRef = reactExports.useRef(null);
  const configRef = reactExports.useRef(null);
  const patch = reactExports.useCallback((p) => setState((s) => ({ ...s, ...p })), []);
  const stopTimer = reactExports.useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  const startTimer = reactExports.useCallback(() => {
    stopTimer();
    const start = Date.now();
    timerRef.current = setInterval(() => {
      patch({ durationSec: Math.floor((Date.now() - start) / 1e3) });
    }, 1e3);
  }, [patch, stopTimer]);
  const ensureAudio = reactExports.useCallback(() => {
    if (!audioRef.current) {
      const el = document.createElement("audio");
      el.autoplay = true;
      el.style.display = "none";
      document.body.appendChild(el);
      audioRef.current = el;
    }
    return audioRef.current;
  }, []);
  const endedThenIdle = reactExports.useCallback(() => {
    stopTimer();
    patch({ status: "ended", currentNumber: null, incoming: false, incomingFrom: null });
    setTimeout(
      () => setState(
        (s) => s.status === "ended" ? { ...s, status: "idle", durationSec: 0, direction: null, muted: false } : s
      ),
      800
    );
  }, [patch, stopTimer]);
  const loadConfig = reactExports.useCallback(async () => {
    const res = await configFn();
    configRef.current = res.config;
    patch({ provider: res.config.provider ?? "disabled" });
    return res.config;
  }, [configFn, patch]);
  const register = reactExports.useCallback(async () => {
    let config = configRef.current;
    try {
      config = await loadConfig();
    } catch {
      return;
    }
    if (!config || config.provider === "disabled" || !config.inbound) return;
    if (config.provider === "twilio") {
      try {
        const Device = await loadTwilioDevice();
        ensureAudio();
        if (!twilioDeviceRef.current) {
          const device = new Device(String(config.token), { logLevel: "error" });
          twilioDeviceRef.current = device;
          device.on("incoming", (call2) => {
            const c = call2;
            incomingCallRef.current = c;
            const from = c?.parameters?.From ?? null;
            patch({ incoming: true, incomingFrom: from, direction: "inbound", status: "ringing", currentNumber: from });
            c.on("cancel", () => {
              incomingCallRef.current = null;
              endedThenIdle();
            });
            c.on("disconnect", () => {
              twilioCallRef.current = null;
              endedThenIdle();
            });
            c.on("error", () => {
              incomingCallRef.current = null;
              patch({ status: "failed", incoming: false });
            });
          });
          await device.register();
        } else {
          twilioDeviceRef.current.updateToken(String(config.token));
        }
        patch({ registered: true });
      } catch {
      }
      return;
    }
    if (config.provider === "sip") {
      try {
        if (!sipRef.current) {
          const { Web } = await import("../_libs/sip.js.mjs");
          const remote = ensureAudio();
          const su = new Web.SimpleUser(String(config.wsServer), {
            aor: String(config.uri),
            media: { constraints: { audio: true, video: false }, remote: { audio: remote } },
            userAgentOptions: {
              authorizationUsername: String(config.authUser || ""),
              authorizationPassword: String(config.password || ""),
              displayName: String(config.displayName || "")
            },
            delegate: {
              onCallReceived: () => {
                patch({ incoming: true, incomingFrom: null, direction: "inbound", status: "ringing" });
              },
              onCallAnswered: () => {
                patch({ status: "in-call", incoming: false });
                startTimer();
              },
              onCallHangup: () => {
                endedThenIdle();
              }
            }
          });
          sipRef.current = su;
          await su.connect();
          await su.register();
        }
        patch({ registered: true });
      } catch {
      }
    }
  }, [loadConfig, ensureAudio, patch, startTimer, endedThenIdle]);
  const teardownActive = reactExports.useCallback(async () => {
    stopTimer();
    try {
      if (twilioCallRef.current) twilioCallRef.current.disconnect();
    } catch {
    }
    twilioCallRef.current = null;
    try {
      if (sipRef.current) await sipRef.current.hangup();
    } catch {
    }
  }, [stopTimer]);
  const hangup = reactExports.useCallback(async () => {
    await teardownActive();
    endedThenIdle();
  }, [teardownActive, endedThenIdle]);
  const accept = reactExports.useCallback(async () => {
    const provider = configRef.current?.provider;
    if (provider === "twilio" && incomingCallRef.current) {
      const c = incomingCallRef.current;
      twilioCallRef.current = c;
      incomingCallRef.current = null;
      try {
        c.accept();
        patch({ incoming: false, status: "in-call" });
        startTimer();
      } catch {
        patch({ status: "failed", incoming: false });
      }
      return;
    }
    if (provider === "sip" && sipRef.current) {
      try {
        await sipRef.current.answer();
        patch({ incoming: false });
      } catch {
        patch({ status: "failed", incoming: false });
      }
    }
  }, [patch, startTimer]);
  const reject = reactExports.useCallback(async () => {
    const provider = configRef.current?.provider;
    if (provider === "twilio" && incomingCallRef.current) {
      try {
        incomingCallRef.current.reject();
      } catch {
      }
      incomingCallRef.current = null;
    } else if (provider === "sip" && sipRef.current) {
      try {
        await sipRef.current.decline();
      } catch {
      }
    }
    endedThenIdle();
  }, [endedThenIdle]);
  const call = reactExports.useCallback(
    async (rawNumber) => {
      const number = rawNumber.trim();
      if (!number) return;
      patch({
        status: "initializing",
        error: null,
        currentNumber: number,
        durationSec: 0,
        muted: false,
        direction: "outbound",
        incoming: false,
        incomingFrom: null
      });
      let config = configRef.current;
      try {
        config = await loadConfig();
      } catch {
        patch({ status: "failed", error: "Could not load calling settings." });
        return;
      }
      if (!config || config.provider === "disabled") {
        patch({ status: "unavailable", error: config?.reason ?? "Calling is not available." });
        return;
      }
      if (config.provider === "sip") {
        try {
          const { Web } = await import("../_libs/sip.js.mjs");
          const remote = ensureAudio();
          let su = sipRef.current;
          if (!su) {
            su = new Web.SimpleUser(String(config.wsServer), {
              aor: String(config.uri),
              media: { constraints: { audio: true, video: false }, remote: { audio: remote } },
              userAgentOptions: {
                authorizationUsername: String(config.authUser || ""),
                authorizationPassword: String(config.password || ""),
                displayName: String(config.displayName || "")
              },
              delegate: {
                onCallAnswered: () => {
                  patch({ status: "in-call" });
                  startTimer();
                },
                onCallHangup: () => {
                  endedThenIdle();
                }
              }
            });
            sipRef.current = su;
            patch({ status: "connecting" });
            await su.connect();
            await su.register();
          }
          const domain = String(config.domain || "");
          const target = number.startsWith("sip:") ? number : `sip:${number}@${domain}`;
          patch({ status: "ringing" });
          await su.call(target);
        } catch (e) {
          patch({ status: "failed", error: e?.message ?? "SIP call failed." });
        }
        return;
      }
      if (config.provider === "twilio") {
        try {
          const Device = await loadTwilioDevice();
          ensureAudio();
          if (!twilioDeviceRef.current) {
            twilioDeviceRef.current = new Device(String(config.token), { logLevel: "error" });
          } else {
            twilioDeviceRef.current.updateToken(String(config.token));
          }
          patch({ status: "connecting" });
          const twilioCall = await twilioDeviceRef.current.connect({
            params: { To: number, CallerId: String(config.callerId || "") }
          });
          twilioCallRef.current = twilioCall;
          patch({ status: "ringing" });
          twilioCall.on("accept", () => {
            patch({ status: "in-call" });
            startTimer();
          });
          twilioCall.on("disconnect", () => {
            twilioCallRef.current = null;
            endedThenIdle();
          });
          twilioCall.on("cancel", () => {
            twilioCallRef.current = null;
            endedThenIdle();
          });
          twilioCall.on("error", (err) => {
            stopTimer();
            patch({ status: "failed", error: err?.message ?? "Twilio call error." });
          });
        } catch (e) {
          patch({ status: "failed", error: e?.message ?? "Twilio call failed." });
        }
        return;
      }
    },
    [ensureAudio, loadConfig, patch, startTimer, stopTimer, endedThenIdle]
  );
  const toggleMute = reactExports.useCallback(() => {
    setState((s) => {
      const next = !s.muted;
      try {
        if (twilioCallRef.current) twilioCallRef.current.mute(next);
        else if (sipRef.current) {
          if (next) sipRef.current.mute();
          else sipRef.current.unmute();
        }
      } catch {
      }
      return { ...s, muted: next };
    });
  }, []);
  reactExports.useEffect(() => {
    return () => {
      stopTimer();
      try {
        twilioCallRef.current?.disconnect();
        incomingCallRef.current?.reject?.();
        twilioDeviceRef.current?.destroy();
      } catch {
      }
      try {
        sipRef.current?.unregister?.();
        sipRef.current?.disconnect?.();
      } catch {
      }
      if (audioRef.current) {
        audioRef.current.remove();
        audioRef.current = null;
      }
    };
  }, [stopTimer]);
  const active = ["initializing", "connecting", "ringing", "in-call"].includes(state.status) && !state.incoming;
  return { ...state, active, call, hangup, toggleMute, loadConfig, register, accept, reject };
}
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
function DialerPanel({ onCall, busy }) {
  const searchFn = useServerFn(searchDialContacts);
  const [number, setNumber] = reactExports.useState("");
  const [search, setSearch] = reactExports.useState("");
  const { data } = useQuery({
    queryKey: ["dial-contacts", search],
    queryFn: () => searchFn({ data: { query: search } })
  });
  const contacts = data?.contacts ?? [];
  const showResults = reactExports.useMemo(() => search.trim().length > 0, [search]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-6 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: number,
          onChange: (e) => setNumber(e.target.value),
          placeholder: "+1 555 123 4567",
          className: "mb-4 text-center text-lg tracking-wide"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: KEYS.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setNumber((n) => n + k),
          className: "rounded-xl border py-4 text-lg font-medium transition-colors hover:bg-muted",
          children: k
        },
        k
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            className: "h-12 flex-1 gap-2 text-base",
            disabled: busy || !number.trim(),
            onClick: () => onCall({ phone_number: number.trim() }),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-5 w-5" }),
              " Call"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", className: "h-12 w-12", onClick: () => setNumber((n) => n.slice(0, -1)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Delete, { className: "h-5 w-5" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-6 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search contacts…", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-80 space-y-1 overflow-y-auto", children: [
        !showResults && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-8 text-center text-sm text-muted-foreground", children: "Start typing to find a contact to call." }),
        showResults && contacts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-8 text-center text-sm text-muted-foreground", children: "No contacts found." }),
        showResults && contacts.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 truncate font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3.5 w-3.5 text-muted-foreground" }),
              c.lead_name ?? "Unknown"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "truncate text-xs text-muted-foreground", children: [
              c.phone_number,
              c.course_interest ? ` · ${c.course_interest}` : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              className: "h-8 gap-1",
              disabled: busy,
              onClick: () => onCall({ phone_number: c.phone_number, lead_id: c.id, lead_name: c.lead_name }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
                " Call"
              ]
            }
          )
        ] }, c.id))
      ] })
    ] })
  ] });
}
const SOURCE_LABELS = {
  stage: "Pipeline stage",
  filter: "Lead filter",
  manual: "Manual list",
  callbacks: "Due callbacks"
};
function PowerDialer({
  onCall,
  busy,
  outcomeSavedAt
}) {
  const listFn = useServerFn(listDialCampaigns);
  const queueFn = useServerFn(getDialQueue);
  const [campaignId, setCampaignId] = reactExports.useState("");
  const [queue, setQueue] = reactExports.useState([]);
  const [index2, setIndex] = reactExports.useState(0);
  const [running, setRunning] = reactExports.useState(false);
  const [autoDial, setAutoDial] = reactExports.useState(true);
  const lastSavedRef = reactExports.useRef(outcomeSavedAt);
  const { data } = useQuery({ queryKey: ["dial-campaigns"], queryFn: () => listFn() });
  const campaigns = data?.campaigns ?? [];
  const start = async () => {
    if (!campaignId) return;
    const res = await queueFn({ data: { campaignId } });
    if (res.error) {
      toast.error(res.error);
      return;
    }
    if (!res.queue.length) {
      toast.info("No contacts match this campaign right now.");
      return;
    }
    setQueue(res.queue);
    setIndex(0);
    setRunning(true);
    toast.success(`Loaded ${res.queue.length} contacts`);
  };
  const stop = () => {
    setRunning(false);
    setQueue([]);
    setIndex(0);
  };
  const callCurrent = () => {
    const entry = queue[index2];
    if (!entry) return;
    onCall({ phone_number: entry.phone_number, lead_id: entry.lead_id, lead_name: entry.lead_name });
  };
  const next = () => {
    setIndex((i) => Math.min(i + 1, queue.length));
  };
  reactExports.useEffect(() => {
    if (outcomeSavedAt === lastSavedRef.current) return;
    lastSavedRef.current = outcomeSavedAt;
    if (!running) return;
    setIndex((i) => {
      const nextIndex = i + 1;
      if (autoDial && nextIndex < queue.length && !busy) {
        const entry = queue[nextIndex];
        setTimeout(() => onCall({ phone_number: entry.phone_number, lead_id: entry.lead_id, lead_name: entry.lead_name }), 900);
      }
      return nextIndex;
    });
  }, [outcomeSavedAt]);
  const current = queue[index2] ?? null;
  const done = running && index2 >= queue.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-6 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dial campaign" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: campaignId, onValueChange: setCampaignId, disabled: running, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose a dial list…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: campaigns.filter((c) => c.active).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.id, children: [
              c.name,
              " · ",
              SOURCE_LABELS[c.source_type] ?? c.source_type
            ] }, c.id)) })
          ] })
        ] }),
        !running ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "gap-2", onClick: start, disabled: !campaignId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4" }),
          " Start session"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "gap-2", onClick: stop, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "h-4 w-4" }),
          " End session"
        ] })
      ] }),
      campaigns.filter((c) => c.active).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "No active dial campaigns yet. Create one in the Campaigns tab." })
    ] }),
    running && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-6 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4 text-primary" }),
          "Contact ",
          Math.min(index2 + 1, queue.length),
          " of ",
          queue.length
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "autodial", className: "text-xs text-muted-foreground", children: "Auto-dial next" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { id: "autodial", checked: autoDial, onCheckedChange: setAutoDial })
        ] })
      ] }),
      done ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-10 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-lg font-semibold", children: "Session complete 🎉" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "You've called everyone in this list." })
      ] }) : current ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-xl font-semibold", children: current.lead_name ?? "Unknown contact" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: current.phone_number }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "gap-2", disabled: busy, onClick: callCurrent, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }),
            " Call now"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "gap-2", disabled: busy, onClick: next, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SkipForward, { className: "h-4 w-4" }),
            " Skip"
          ] })
        ] })
      ] }) : null
    ] })
  ] });
}
const CALL_STATUSES = [
  { id: "completed", label: "Completed" },
  { id: "no_answer", label: "No answer" },
  { id: "voicemail", label: "Voicemail" },
  { id: "busy", label: "Busy" },
  { id: "failed", label: "Failed" },
  { id: "canceled", label: "Canceled" }
];
function defaultCallbackValue() {
  const d = new Date(Date.now() + 2 * 60 * 60 * 1e3);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function CallOutcomeDialog({
  open,
  onOpenChange,
  target,
  onSaved
}) {
  const qc = useQueryClient();
  const logFn = useServerFn(logCall);
  const scheduleFn = useServerFn(scheduleCallback);
  const [status, setStatus] = reactExports.useState("completed");
  const [notes, setNotes] = reactExports.useState("");
  const [reschedule, setReschedule] = reactExports.useState(false);
  const [when, setWhen] = reactExports.useState(defaultCallbackValue());
  reactExports.useEffect(() => {
    if (open) {
      setStatus("completed");
      setNotes("");
      setReschedule(false);
      setWhen(defaultCallbackValue());
    }
  }, [open]);
  reactExports.useEffect(() => {
    if (status === "no_answer" || status === "busy") setReschedule(true);
  }, [status]);
  const save = useMutation({
    mutationFn: async () => {
      if (!target) return { ok: false };
      const res = await logFn({
        data: {
          phone_number: target.phone_number,
          lead_id: target.lead_id ?? null,
          direction: target.direction ?? "outbound",
          status,
          notes: notes || null,
          provider: target.provider ?? null,
          duration_seconds: Math.max(0, Math.round(target.durationSec ?? 0)),
          started_at: new Date(Date.now() - (target.durationSec ?? 0) * 1e3).toISOString(),
          ended_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      if (res.ok && reschedule) {
        await scheduleFn({
          data: {
            phone_number: target.phone_number,
            lead_id: target.lead_id ?? null,
            scheduled_at: new Date(when).toISOString(),
            reason: status === "no_answer" ? "No answer" : status,
            from_call_id: res.id ?? null
          }
        });
      }
      return res;
    },
    onSuccess: (res) => {
      if (res?.ok) {
        qc.invalidateQueries({ queryKey: ["calls"] });
        qc.invalidateQueries({ queryKey: ["callbacks"] });
        toast.success(reschedule ? "Call logged & callback scheduled" : "Call logged");
        onOpenChange(false);
        onSaved?.();
      } else {
        toast.error("Failed to log call");
      }
    },
    onError: () => toast.error("Failed to log call")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Call outcome" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        target?.lead_name ?? target?.phone_number,
        target?.durationSec ? ` · ${Math.floor(target.durationSec / 60)}m ${target.durationSec % 60}s` : ""
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Outcome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: status, onValueChange: setStatus, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CALL_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id, children: s.label }, s.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: notes, onChange: (e) => setNotes(e.target.value), rows: 3, placeholder: "What was discussed…" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Schedule a callback" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Follow up later if there was no pickup." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: reschedule, onCheckedChange: setReschedule })
      ] }),
      reschedule && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Callback time" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", value: when, onChange: (e) => setWhen(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), disabled: save.isPending, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: save.isPending ? "Saving…" : "Save" })
    ] })
  ] }) });
}
const STATUS_LABELS = Object.fromEntries(CALL_STATUSES.map((s) => [s.id, s.label]));
const STATUS_STYLES = {
  completed: "bg-success/10 text-success",
  no_answer: "bg-destructive/10 text-destructive",
  busy: "bg-amber-500/10 text-amber-600",
  voicemail: "bg-primary/10 text-primary",
  failed: "bg-destructive/10 text-destructive",
  canceled: "bg-muted text-muted-foreground"
};
function fmtDuration(s) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m ? `${m}m ${sec}s` : `${sec}s`;
}
function CallHistory({ onCall, busy }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listCalls);
  const notesFn = useServerFn(updateCallNotes);
  const [editing, setEditing] = reactExports.useState(null);
  const [noteText, setNoteText] = reactExports.useState("");
  const { data } = useQuery({ queryKey: ["calls"], queryFn: () => listFn(), refetchInterval: 15e3 });
  const calls = reactExports.useMemo(() => data?.calls ?? [], [data]);
  const saveNotes = useMutation({
    mutationFn: () => notesFn({ data: { id: editing.id, notes: noteText || null } }),
    onSuccess: (res) => {
      if (res.ok) {
        qc.invalidateQueries({ queryKey: ["calls"] });
        toast.success("Notes updated");
        setEditing(null);
      } else {
        toast.error("Failed to update notes");
      }
    },
    onError: () => toast.error("Failed to update notes")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-2xl border bg-card shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Phone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Dir" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Duration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "When" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right font-semibold", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        calls.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0 hover:bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: c.phone_number }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: c.direction === "inbound" ? /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneIncoming, { className: "h-4 w-4 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneOutgoing, { className: "h-4 w-4 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[c.status] ?? "bg-muted"}`, children: STATUS_LABELS[c.status] ?? c.status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: fmtDuration(c.duration_seconds) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: format(new Date(c.created_at), "MMM d, HH:mm") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "max-w-[220px] truncate px-4 py-3 text-muted-foreground", children: c.notes ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "ghost",
                className: "h-7 gap-1 px-2 text-xs",
                onClick: () => {
                  setEditing(c);
                  setNoteText(c.notes ?? "");
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
                  " Notes"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "ghost",
                className: "h-7 gap-1 px-2 text-xs text-primary",
                disabled: busy,
                onClick: () => onCall({ phone_number: c.phone_number, lead_id: c.lead_id }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3.5 w-3.5" }),
                  " Call back"
                ]
              }
            )
          ] }) })
        ] }, c.id)),
        calls.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 7, className: "px-4 py-12 text-center text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "mx-auto mb-2 h-6 w-6 opacity-40" }),
          "No calls yet."
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editing, onOpenChange: (o) => !o && setEditing(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Call notes — ",
        editing?.phone_number
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: noteText, onChange: (e) => setNoteText(e.target.value), rows: 5, placeholder: "Add notes about this call…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setEditing(null), disabled: saveNotes.isPending, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveNotes.mutate(), disabled: saveNotes.isPending, children: saveNotes.isPending ? "Saving…" : "Save notes" })
      ] })
    ] }) })
  ] });
}
const SOURCE_UI_LABELS = {
  group: "By pipeline group",
  stage: "By specific stage",
  manual: "Manual list",
  callbacks: "Due callbacks"
};
function describe(c) {
  if (c.source_type === "manual") return "Manual list";
  if (c.source_type === "callbacks") return "Due callbacks";
  if (c.source_type === "stage") return `Stage: ${stageLabel$1(String(c.criteria?.stage ?? ""))}`;
  const col = LEAD_FILTERS.find((f) => f.id === c.criteria?.column);
  return `Group: ${col?.label ?? "All"}`;
}
function CallCampaigns() {
  const qc = useQueryClient();
  const listFn = useServerFn(listDialCampaigns);
  const saveFn = useServerFn(saveDialCampaign);
  const delFn = useServerFn(deleteDialCampaign);
  const searchFn = useServerFn(searchDialContacts);
  const [open, setOpen] = reactExports.useState(false);
  const [name, setName] = reactExports.useState("");
  const [sourceUi, setSourceUi] = reactExports.useState("group");
  const [column, setColumn] = reactExports.useState("new");
  const [stage, setStage] = reactExports.useState(QUALIFICATION_STAGES[0]);
  const [members, setMembers] = reactExports.useState([]);
  const [search, setSearch] = reactExports.useState("");
  const { data } = useQuery({ queryKey: ["dial-campaigns"], queryFn: () => listFn() });
  const campaigns = data?.campaigns ?? [];
  const { data: contactData } = useQuery({
    queryKey: ["campaign-contacts", search],
    queryFn: () => searchFn({ data: { query: search } }),
    enabled: sourceUi === "manual" && search.trim().length > 0
  });
  const contacts = contactData?.contacts ?? [];
  const reset = () => {
    setName("");
    setSourceUi("group");
    setColumn("new");
    setStage(QUALIFICATION_STAGES[0]);
    setMembers([]);
    setSearch("");
  };
  const save = useMutation({
    mutationFn: () => {
      const source_type = sourceUi === "group" ? "filter" : sourceUi;
      const criteria = sourceUi === "group" ? { column } : sourceUi === "stage" ? { stage } : {};
      return saveFn({
        data: {
          name,
          source_type,
          criteria,
          members: sourceUi === "manual" ? members.map((m) => ({ lead_id: m.lead_id, phone_number: m.phone_number })) : void 0
        }
      });
    },
    onSuccess: (res) => {
      if (res.ok) {
        qc.invalidateQueries({ queryKey: ["dial-campaigns"] });
        toast.success("Campaign saved");
        setOpen(false);
        reset();
      } else {
        toast.error(res.error ?? "Failed to save");
      }
    },
    onError: () => toast.error("Failed to save")
  });
  const remove = useMutation({
    mutationFn: (id) => delFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dial-campaigns"] });
      toast.success("Campaign deleted");
    },
    onError: () => toast.error("Failed to delete")
  });
  const addMember = (c) => {
    setMembers((m) => m.some((x) => x.phone_number === c.phone_number) ? m : [...m, { lead_id: c.id, phone_number: c.phone_number, lead_name: c.lead_name }]);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Dial lists that power the progressive power dialer." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "gap-1", onClick: () => setOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " New campaign"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
      campaigns.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border bg-card p-4 shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: c.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: describe(c) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "icon",
            variant: "ghost",
            className: "h-7 w-7 text-destructive hover:bg-destructive/10",
            onClick: () => remove.mutate(c.id),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
          }
        )
      ] }) }, c.id)),
      campaigns.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ListPlus, { className: "mx-auto mb-2 h-6 w-6 opacity-40" }),
        "No dial campaigns yet."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[85vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "New dial campaign" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. New leads follow-up" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contacts source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: sourceUi, onValueChange: (v) => setSourceUi(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.keys(SOURCE_UI_LABELS).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: SOURCE_UI_LABELS[k] }, k)) })
          ] })
        ] }),
        sourceUi === "group" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pipeline group" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: column, onValueChange: setColumn, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: LEAD_FILTERS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: f.id, children: f.label }, f.id)) })
          ] })
        ] }),
        sourceUi === "stage" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Stage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stage, onValueChange: setStage, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: QUALIFICATION_STAGES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: stageLabel$1(s) }, s)) })
          ] })
        ] }),
        sourceUi === "callbacks" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground", children: "This list is built automatically from callbacks that are due (rescheduled no-pickup calls)." }),
        sourceUi === "manual" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Add contacts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search leads…", className: "pl-9" })
          ] }),
          search.trim() && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-40 space-y-1 overflow-y-auto rounded-lg border p-1", children: [
            contacts.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => addMember(c),
                className: "flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-muted",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    c.lead_name ?? "Unknown",
                    " · ",
                    c.phone_number
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" })
                ]
              },
              c.id
            )),
            contacts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-2 py-2 text-xs text-muted-foreground", children: "No matches." })
          ] }),
          members.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: members.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs", children: [
            m.lead_name ?? m.phone_number,
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMembers((list) => list.filter((x) => x.phone_number !== m.phone_number)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" }) })
          ] }, m.phone_number)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setOpen(false);
          reset();
        }, disabled: save.isPending, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => save.mutate(),
            disabled: save.isPending || !name.trim() || sourceUi === "manual" && members.length === 0,
            children: save.isPending ? "Saving…" : "Create campaign"
          }
        )
      ] })
    ] }) })
  ] });
}
function fmtElapsed(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "call";
}
function VideoCallsPanel() {
  const settingsFn = useServerFn(getJitsiSettings);
  const logFn = useServerFn(logCall);
  const { data: settingsData } = useQuery({
    queryKey: ["jitsi-settings"],
    queryFn: () => settingsFn(),
    refetchInterval: 15e3
  });
  const settings = settingsData?.settings ?? null;
  const [name, setName] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const [meeting, setMeeting] = reactExports.useState(null);
  const [elapsed, setElapsed] = reactExports.useState(0);
  const [copied, setCopied] = reactExports.useState(false);
  const iframeRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!meeting) return;
    const t = window.setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - meeting.startedAt) / 1e3)));
    }, 1e3);
    return () => window.clearInterval(t);
  }, [meeting]);
  const copyLink = reactExports.useCallback(async () => {
    if (!meeting) return;
    try {
      await navigator.clipboard.writeText(meeting.url);
      setCopied(true);
      toast.success("Meeting link copied");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy — copy the URL manually");
    }
  }, [meeting]);
  const startMeeting = reactExports.useCallback(() => {
    if (!settings || !settings.enabled) {
      toast.error("Video calls are disabled — enable them in Settings → Video Calls");
      return;
    }
    const label = name.trim() || "Video meeting";
    const room = `${settings.room_prefix || "admissions"}-${slugify(label)}-${Date.now().toString(36).slice(-5)}`;
    const server = (settings.server_url || "https://meet.jit.si").replace(/\/+$/, "");
    const url = `${server}/${room}#userInfo.displayName=${encodeURIComponent(settings.display_name || "Agent")}`;
    setMeeting({ room, url, label, startedAt: Date.now(), phone: phone.trim() || void 0, notes: notes.trim() || void 0 });
    setElapsed(0);
  }, [settings, name, phone, notes]);
  const endMeeting = useMutation({
    mutationFn: async () => {
      if (!meeting) return null;
      const res = await logFn({
        data: {
          phone_number: meeting.phone || meeting.label,
          direction: "outbound",
          status: "completed",
          provider: "jitsi",
          provider_call_sid: meeting.room,
          notes: meeting.notes ?? null,
          started_at: new Date(meeting.startedAt).toISOString(),
          ended_at: (/* @__PURE__ */ new Date()).toISOString(),
          duration_seconds: Math.max(0, Math.floor((Date.now() - meeting.startedAt) / 1e3))
        }
      });
      return res;
    },
    onSuccess: (r) => {
      const res = r;
      if (res && !res.ok) toast.warning(res.error ?? "Call logged with issues");
      else toast.success("Meeting ended & logged in history");
      setMeeting(null);
      setElapsed(0);
      setName("");
      setPhone("");
      setNotes("");
    },
    onError: () => toast.error("Failed to log the meeting")
  });
  if (!settingsData) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-2xl border bg-card p-6 text-sm text-muted-foreground shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading video settings…"
    ] });
  }
  if (!settings?.enabled) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-8 text-center shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(VideoOff, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 font-semibold", children: "Video calls are off" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-1 max-w-sm text-sm text-muted-foreground", children: "Turn on Jitsi video calls in Settings → Video Calls to start meetings from this tab." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: meeting ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-2xl border bg-black shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-zinc-900 px-4 py-2.5 text-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-2.5 w-2.5 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex h-2.5 w-2.5 rounded-full bg-success" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm font-semibold", children: meeting.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs tabular-nums", children: fmtElapsed(elapsed) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: "ghost",
            className: "h-8 gap-1.5 bg-white/10 text-white hover:bg-white/20 hover:text-white",
            onClick: copyLink,
            children: [
              copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5" }),
              copied ? "Copied" : "Copy link"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 gap-1.5 bg-white/10 text-white hover:bg-white/20 hover:text-white", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: meeting.url, target: "_blank", rel: "noreferrer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" }),
          " Fullscreen"
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "iframe",
      {
        ref: iframeRef,
        src: meeting.url,
        title: "Jitsi video meeting",
        allow: "camera; microphone; display-capture; fullscreen; autoplay",
        className: "aspect-video w-full"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-zinc-900 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "max-w-full truncate text-xs text-zinc-400", children: [
        "Share this link with the lead: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-zinc-200", children: meeting.url })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "sm",
          variant: "destructive",
          className: "gap-1.5",
          onClick: () => endMeeting.mutate(),
          disabled: endMeeting.isPending,
          children: [
            endMeeting.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneOff, { className: "h-4 w-4" }),
            "End & log call"
          ]
        }
      )
    ] })
  ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-5 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Start a video meeting" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Powered by Jitsi (",
            settings.server_url.replace(/^https?:\/\//, ""),
            ") — no downloads needed."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vc-name", children: "Meeting label" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "vc-name",
                className: "pl-9",
                placeholder: "e.g. Maria — Enrollment consult",
                value: name,
                onChange: (e) => setName(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vc-phone", children: "Lead phone (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "vc-phone",
                className: "pl-9",
                placeholder: "+15551234567",
                value: phone,
                onChange: (e) => setPhone(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vc-notes", children: "Notes (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "vc-notes",
              placeholder: "Meeting purpose",
              value: notes,
              onChange: (e) => setNotes(e.target.value)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "mt-4 w-full gap-2 sm:w-auto", onClick: startMeeting, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "h-4 w-4" }),
        " Start meeting"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-3", children: [
      { title: "1. Start the room", body: "Open a Jitsi meeting right here in the tab — no app install." },
      { title: "2. Share the link", body: "Copy the link and drop it into the chat or WhatsApp." },
      { title: "3. Get it logged", body: "Meetings are saved to the call history with duration & notes." }
    ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-4 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: s.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: s.body })
    ] }, s.title)) })
  ] }) });
}
const STATUS_TEXT = {
  idle: "Idle",
  initializing: "Preparing…",
  connecting: "Connecting…",
  ringing: "Ringing…",
  "in-call": "In call",
  ended: "Call ended",
  failed: "Call failed",
  unavailable: "Unavailable"
};
function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
function CallsTab() {
  const { profile } = useAuth();
  const canManage = canManageCallCampaigns(profile.role);
  const SECTIONS2 = [
    { id: "dialer", label: "Dialer", icon: PhoneCall },
    { id: "video", label: "Video", icon: Video },
    { id: "power", label: "Power Dialer", icon: Zap },
    { id: "history", label: "History", icon: History },
    ...canManage ? [{ id: "campaigns", label: "Campaigns", icon: Megaphone }] : []
  ];
  const [section, setSection] = reactExports.useState("dialer");
  const phone = useSoftphone();
  const targetRef = reactExports.useRef(null);
  const [outcomeTarget, setOutcomeTarget] = reactExports.useState(null);
  const [outcomeOpen, setOutcomeOpen] = reactExports.useState(false);
  const [outcomeSavedAt, setOutcomeSavedAt] = reactExports.useState(0);
  const prevStatus = reactExports.useRef("idle");
  const startCall = reactExports.useCallback(
    (t) => {
      targetRef.current = { ...t, direction: "outbound" };
      phone.call(t.phone_number);
    },
    [phone]
  );
  const register = phone.register;
  reactExports.useEffect(() => {
    void register();
  }, [register]);
  const acceptIncoming = reactExports.useCallback(() => {
    targetRef.current = { phone_number: phone.incomingFrom ?? "Unknown", direction: "inbound" };
    void phone.accept();
  }, [phone]);
  reactExports.useEffect(() => {
    if (prevStatus.current !== "ended" && phone.status === "ended") {
      const t = targetRef.current;
      if (t) {
        setOutcomeTarget({ ...t, durationSec: phone.durationSec, provider: phone.provider });
        setOutcomeOpen(true);
      }
    }
    prevStatus.current = phone.status;
  }, [phone.status, phone.durationSec, phone.provider]);
  const showBar = phone.active || phone.status === "failed" || phone.status === "unavailable";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    phone.incoming && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-2xl border border-primary/40 bg-primary/5 p-4 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneIncoming, { className: "h-5 w-5 animate-pulse" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Incoming call" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: phone.incomingFrom ?? "Unknown caller" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "gap-2", onClick: () => phone.reject(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneOff, { className: "h-4 w-4" }),
          " Decline"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "gap-2 bg-success text-success-foreground hover:bg-success/90", onClick: acceptIncoming, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }),
          " Answer"
        ] })
      ] })
    ] }),
    showBar && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "flex items-center justify-between rounded-2xl border p-4 shadow-card",
          phone.status === "in-call" ? "border-success/40 bg-success/5" : "bg-card"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  phone.status === "in-call" ? "bg-success/15 text-success" : "bg-primary/10 text-primary"
                ),
                children: ["initializing", "connecting", "ringing"].includes(phone.status) ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-5 w-5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: targetRef.current?.lead_name ?? phone.currentNumber ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                STATUS_TEXT[phone.status],
                phone.status === "in-call" ? ` · ${fmt(phone.durationSec)}` : "",
                phone.error ? ` · ${phone.error}` : ""
              ] })
            ] })
          ] }),
          phone.active && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", onClick: phone.toggleMute, title: phone.muted ? "Unmute" : "Mute", children: phone.muted ? /* @__PURE__ */ jsxRuntimeExports.jsx(MicOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", className: "gap-2", onClick: phone.hangup, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneOff, { className: "h-4 w-4" }),
              " Hang up"
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-[200px_1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-row flex-wrap gap-1 lg:flex-col", children: SECTIONS2.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setSection(s.id),
          className: cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            section === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "h-4 w-4" }),
            s.label
          ]
        },
        s.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        section === "dialer" && /* @__PURE__ */ jsxRuntimeExports.jsx(DialerPanel, { onCall: startCall, busy: phone.active }),
        section === "video" && /* @__PURE__ */ jsxRuntimeExports.jsx(VideoCallsPanel, {}),
        section === "power" && /* @__PURE__ */ jsxRuntimeExports.jsx(PowerDialer, { onCall: startCall, busy: phone.active, outcomeSavedAt }),
        section === "history" && /* @__PURE__ */ jsxRuntimeExports.jsx(CallHistory, { onCall: startCall, busy: phone.active }),
        section === "campaigns" && canManage && /* @__PURE__ */ jsxRuntimeExports.jsx(CallCampaigns, {})
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CallOutcomeDialog,
      {
        open: outcomeOpen,
        onOpenChange: setOutcomeOpen,
        target: outcomeTarget,
        onSaved: () => setOutcomeSavedAt(Date.now())
      }
    )
  ] });
}
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function inline(s) {
  let out = escapeHtml(s);
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2">$1</a>');
  return out;
}
function markdownToHtml(md) {
  const lines = (md ?? "").replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let i = 0;
  const flushParagraph = (buf) => {
    if (buf.length) {
      html.push(`<p>${inline(buf.join(" "))}</p>`);
      buf.length = 0;
    }
  };
  const para = [];
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph(para);
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph(para);
      html.push("<hr/>");
      i++;
      continue;
    }
    const h = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushParagraph(para);
      const level = h[1].length;
      html.push(`<h${level}>${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }
    if (trimmed.startsWith("|") && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes("-")) {
      flushParagraph(para);
      const splitRow = (r) => r.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());
      const headers = splitRow(trimmed);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i].trim()));
        i++;
      }
      const thead = `<thead><tr>${headers.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead>`;
      const tbody = `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody>`;
      html.push(`<table>${thead}${tbody}</table>`);
      continue;
    }
    if (/^[-*+]\s+/.test(trimmed)) {
      flushParagraph(para);
      const items = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
        items.push(`<li>${inline(lines[i].trim().replace(/^[-*+]\s+/, ""))}</li>`);
        i++;
      }
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph(para);
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(`<li>${inline(lines[i].trim().replace(/^\d+\.\s+/, ""))}</li>`);
        i++;
      }
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }
    para.push(trimmed);
    i++;
  }
  flushParagraph(para);
  return html.join("\n");
}
const REPORT_STYLES = `
  body { font-family: Calibri, Arial, sans-serif; color: #1a1a1a; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 32px; }
  h1 { font-size: 24px; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
  h2 { font-size: 19px; color: #1e3a8a; margin-top: 24px; }
  h3 { font-size: 16px; color: #1e40af; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; font-size: 13px; }
  th { background: #eff6ff; }
  ul, ol { margin: 8px 0 8px 20px; }
  li { margin: 3px 0; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
  code { background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-size: 12px; }
  .report-meta { color: #64748b; font-size: 12px; margin-bottom: 16px; }
`;
function reportDocument(title, bodyHtml) {
  const date = (/* @__PURE__ */ new Date()).toLocaleString();
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${REPORT_STYLES}</style></head>
<body><h1>${title}</h1><div class="report-meta">Generated ${date}</div>${bodyHtml}</body></html>`;
}
function downloadReportAsWord(title, markdown) {
  const html = reportDocument(title, markdownToHtml(markdown));
  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}
function downloadReportAsPdf(title, markdown) {
  const html = reportDocument(title, markdownToHtml(markdown));
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 350);
}
const ACTION_LABELS = {
  move_lead_stage: "Move lead stage",
  update_lead: "Update lead",
  assign_workflow: "Assign workflow",
  remove_workflow: "Remove workflow",
  set_opportunity: "Set opportunity values",
  upsert_ai_variable: "Create / update AI variable",
  delete_ai_variable: "Delete AI variable",
  create_workflow: "Create workflow",
  update_workflow: "Update workflow",
  create_responder_agent: "Create responder agent",
  update_responder_agent: "Update responder agent",
  create_http_action: "Create HTTP action",
  update_http_action: "Update HTTP action"
};
function describeAction(a) {
  const g = (k) => a.args[k] != null ? String(a.args[k]) : "";
  switch (a.name) {
    case "move_lead_stage":
      return `Move ${g("phone")} → ${g("qualification_status")}`;
    case "update_lead":
      return `Update ${g("phone")} (${Object.keys(a.args).filter((k) => k !== "phone").join(", ")})`;
    case "assign_workflow":
      return `Assign "${g("workflow_name")}" to ${g("phone")}${g("goal_at") ? ` · goal ${g("goal_at")}` : ""}`;
    case "remove_workflow":
      return `Remove "${g("workflow_name")}" from ${g("phone")}`;
    case "set_opportunity":
      return `${g("phone")} → valuation ${g("valuation") || 0}, liquidity ${g("liquidity") || 0}`;
    case "upsert_ai_variable":
      return `Set variable ${g("variable_name")} = "${g("variable_value")}"`;
    case "delete_ai_variable":
      return `Delete variable ${g("variable_name")}`;
    case "create_workflow":
      return `Create workflow "${g("name")}"${g("enabled") === "true" ? " (enabled)" : ""}`;
    case "update_workflow":
      return `Update workflow "${g("name")}"${g("new_name") ? ` → "${g("new_name")}"` : ""}`;
    case "create_responder_agent":
      return `Create responder agent "${g("name")}"`;
    case "update_responder_agent":
      return `Update responder agent "${g("name")}"${g("new_name") ? ` → "${g("new_name")}"` : ""}`;
    case "create_http_action":
      return `Create HTTP action "${g("name")}" → ${g("method") || "POST"} ${g("url")}`;
    case "update_http_action":
      return `Update HTTP action "${g("name")}"`;
    default:
      return a.name;
  }
}
const BUILTIN_MODELS = [
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash (default)" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "openai/gpt-5-mini", label: "GPT-5 mini" },
  { id: "openai/gpt-5", label: "GPT-5" }
];
const BUILD_PROMPT_SUGGESTIONS = [
  "Summarise lead volume trends and where leads drop off in the pipeline.",
  "When are students most active? Recommend the best times to message.",
  "Analyse qualification vs disqualification and how to improve revenue.",
  "Which courses and destinations drive the most qualified leads?"
];
const AGENT_PROMPT_SUGGESTIONS = [
  "Move every qualified lead with no booking into onboarding.",
  "Assign the re-engagement workflow to leads inactive over a week.",
  "Find leads asking about scholarships and add a note to follow up.",
  "Set opportunity values for the most engaged leads."
];
function Stat({ icon: Icon2, label, value, tone }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl border bg-card p-3 shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon2, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-xl font-bold leading-none", children: value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 truncate text-xs text-muted-foreground", children: label })
    ] })
  ] });
}
function ChartCard({ title, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-4 shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-sm font-semibold", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-56", children })
  ] });
}
function conversationToMarkdown(title, messages) {
  const parts = [`# ${title}`, ""];
  for (const m of messages) {
    if (m.role === "user") {
      parts.push(`## Question`, "", m.content, "");
    } else {
      parts.push(`### Analysis`, "", m.content, "");
    }
  }
  return parts.join("\n");
}
function deriveTitle(messages) {
  const firstUser = messages.find((m) => m.role === "user");
  const t = (firstUser?.content ?? "Conversation").trim().replace(/\s+/g, " ");
  return t.length > 70 ? `${t.slice(0, 67)}…` : t;
}
const DOC_REQUEST_RE = /\b(download|report|document|pdf|word|docx|export|write\s*-?\s*up|generate (a|the) (doc|report|document)|downloadable)\b/i;
function isDocRequest(text) {
  return DOC_REQUEST_RE.test(text);
}
function ReportsTab() {
  const queryClient = useQueryClient();
  const dashFn = useServerFn(getReportDashboard);
  const chatFn = useServerFn(generateChatReply);
  const agentFn = useServerFn(generateAgentReply);
  const execFn = useServerFn(executeAgentAction);
  const listFn = useServerFn(listConversations);
  const saveFn = useServerFn(saveConversation);
  const deleteFn = useServerFn(deleteConversation);
  const { data: dashData } = useQuery({
    queryKey: ["report-dashboard"],
    queryFn: () => dashFn(),
    refetchInterval: 3e4
  });
  const analytics = dashData?.analytics ?? null;
  const { data: convData } = useQuery({
    queryKey: ["report-conversations"],
    queryFn: () => listFn()
  });
  const favorites = convData?.conversations ?? [];
  const [messages, setMessages] = reactExports.useState([]);
  const [activeId, setActiveId] = reactExports.useState(null);
  const [input, setInput] = reactExports.useState("");
  const [days, setDays] = reactExports.useState(30);
  const [mode, setMode] = reactExports.useState("insights");
  const [pendingActions, setPendingActions] = reactExports.useState([]);
  const [actionResults, setActionResults] = reactExports.useState({});
  const [showModelCfg, setShowModelCfg] = reactExports.useState(false);
  const [modelMode, setModelMode] = reactExports.useState("ai_settings");
  const [builtInModel, setBuiltInModel] = reactExports.useState(BUILTIN_MODELS[0].id);
  const [customProvider, setCustomProvider] = reactExports.useState("");
  const [customBaseUrl, setCustomBaseUrl] = reactExports.useState("");
  const [customModel, setCustomModel] = reactExports.useState("");
  const [customApiKey, setCustomApiKey] = reactExports.useState("");
  const buildModelConfig = () => {
    if (modelMode === "custom")
      return {
        mode: "custom",
        provider: customProvider || null,
        baseUrl: customBaseUrl || null,
        model: customModel || null,
        apiKey: customApiKey || null
      };
    if (modelMode === "ai_settings") return { mode: "ai_settings" };
    return { mode: "built_in", model: builtInModel || null };
  };
  const promptSuggestions = mode === "agentic" ? AGENT_PROMPT_SUGGESTIONS : BUILD_PROMPT_SUGGESTIONS;
  const inputRef = reactExports.useRef(null);
  const threadRef = reactExports.useRef(null);
  const focusInput = () => requestAnimationFrame(() => inputRef.current?.focus());
  reactExports.useEffect(() => {
    focusInput();
  }, []);
  reactExports.useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);
  const activeIdRef = reactExports.useRef(null);
  const setActive = (id) => {
    activeIdRef.current = id;
    setActiveId(id);
  };
  const chat = useMutation({
    mutationFn: (msgs) => {
      const model = buildModelConfig();
      return mode === "agentic" ? agentFn({ data: { messages: msgs, days, model } }) : chatFn({ data: { messages: msgs, days, model } });
    },
    onSuccess: async (r, variables) => {
      const res = r;
      if (res.error) {
        toast.error(res.error);
        return;
      }
      const actions = res.actions ?? [];
      if (!res.reply && actions.length === 0) {
        toast.error("No response generated");
        return;
      }
      const full = [
        ...variables,
        { role: "assistant", content: res.reply || "Prepared actions for your approval." }
      ];
      setMessages(full);
      if (mode === "agentic" && actions.length > 0) setPendingActions(actions);
      try {
        const saved = await saveFn({
          data: { id: activeIdRef.current ?? void 0, title: deriveTitle(full), messages: full }
        });
        if (saved.ok && saved.id) setActive(saved.id);
        queryClient.invalidateQueries({ queryKey: ["report-conversations"] });
      } catch {
      }
    },
    onError: () => toast.error("Failed to get a response"),
    onSettled: () => focusInput()
  });
  const runAction = useMutation({
    mutationFn: (action) => execFn({ data: { name: action.name, args: action.args } }),
    onSuccess: (r, action) => {
      const res = r;
      setActionResults((prev) => ({
        ...prev,
        [action.id]: { ok: res.ok, msg: res.ok ? res.result ?? "Done" : res.error ?? "Failed" }
      }));
      if (res.ok) {
        toast.success(res.result ?? "Action applied");
        queryClient.invalidateQueries({ queryKey: ["leads"] });
        queryClient.invalidateQueries({ queryKey: ["report-dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["workflow-states"] });
        queryClient.invalidateQueries({ queryKey: ["lead-workflows"] });
      } else {
        toast.error(res.error ?? "Action failed");
      }
    },
    onError: (_e2, action) => {
      setActionResults((prev) => ({ ...prev, [action.id]: { ok: false, msg: "Action failed" } }));
      toast.error("Action failed");
    }
  });
  const dismissAction = (id) => {
    setActionResults((prev) => ({ ...prev, [id]: { ok: false, msg: "Dismissed" } }));
  };
  const send = (text) => {
    const content = text.trim();
    if (!content || chat.isPending) return;
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    chat.mutate(next);
  };
  const remove = useMutation({
    mutationFn: (id) => deleteFn({ data: { id } }),
    onSuccess: (r, id) => {
      const res = r;
      if (!res.ok) {
        toast.error(res.error ?? "Could not delete");
        return;
      }
      if (activeIdRef.current === id) {
        setActive(null);
        setMessages([]);
      }
      queryClient.invalidateQueries({ queryKey: ["report-conversations"] });
    },
    onError: () => toast.error("Could not delete")
  });
  const startNew = () => {
    setActive(null);
    setMessages([]);
    setInput("");
    setPendingActions([]);
    setActionResults({});
    focusInput();
  };
  const loadFavorite = (c) => {
    setActive(c.id);
    setMessages(Array.isArray(c.messages) ? c.messages : []);
    setPendingActions([]);
    setActionResults({});
    focusInput();
  };
  const hasConversation = messages.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-[280px_1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-3 shadow-card lg:max-h-[640px] lg:overflow-y-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "mb-3 w-full", onClick: startNew, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-3.5 w-3.5" }),
          " New analysis"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 text-amber-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "History" })
        ] }),
        favorites.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-1 py-6 text-center text-xs text-muted-foreground", children: "Your past analyses appear here automatically once you start chatting." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: favorites.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `group rounded-lg border p-2 transition-colors ${activeId === c.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => loadFavorite(c),
                  className: "block w-full text-left",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-2 text-xs font-medium", children: c.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 text-[10px] text-muted-foreground", children: [
                      new Date(c.updated_at).toLocaleDateString(),
                      " · ",
                      c.messages?.length ?? 0,
                      " messages"
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "ghost",
                    className: "h-6 px-1.5 text-[10px]",
                    onClick: () => downloadReportAsWord(c.title, conversationToMarkdown(c.title, c.messages ?? [])),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mr-0.5 h-3 w-3" }),
                      " Word"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "ghost",
                    className: "h-6 px-1.5 text-[10px]",
                    onClick: () => downloadReportAsPdf(c.title, conversationToMarkdown(c.title, c.messages ?? [])),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "mr-0.5 h-3 w-3" }),
                      " PDF"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "ghost",
                    className: "ml-auto h-6 w-6 p-0 text-muted-foreground hover:text-destructive",
                    onClick: () => remove.mutate(c.id),
                    "aria-label": "Delete conversation",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" })
                  }
                )
              ] })
            ]
          },
          c.id
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[480px] flex-col rounded-2xl border bg-card shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 border-b p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              mode === "agentic" ? /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "h-5 w-5 text-accent-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold leading-tight", children: "AI Insights Generator" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: mode === "agentic" ? "Ask the assistant to act on leads, pipeline & workflows — every action needs your approval." : "Chat with your live analytics — saved to history automatically. Ask for a report to download it." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [
                "Timeframe",
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    value: days,
                    onChange: (e) => setDays(Number(e.target.value)),
                    className: "h-8 rounded-md border border-input bg-background px-2 text-xs",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 7, children: "7 days" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 30, children: "30 days" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 90, children: "90 days" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 365, children: "12 months" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: showModelCfg ? "default" : "outline",
                  className: "h-8 gap-1 px-2 text-xs",
                  onClick: () => setShowModelCfg((s) => !s),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "h-3.5 w-3.5" }),
                    " Model"
                  ]
                }
              ),
              hasConversation && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: startNew, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-3.5 w-3.5" }),
                " New analysis"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex rounded-lg border bg-muted/40 p-0.5 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setMode("insights"),
                className: `flex items-center gap-1 rounded-md px-3 py-1.5 font-medium transition-colors ${mode === "insights" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5" }),
                  " Insights"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setMode("agentic"),
                className: `flex items-center gap-1 rounded-md px-3 py-1.5 font-medium transition-colors ${mode === "agentic" ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-sm" : "text-muted-foreground"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3.5 w-3.5" }),
                  " Agentic"
                ]
              }
            )
          ] }),
          showModelCfg && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-xl border bg-muted/30 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "AI model provider" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: modelMode,
                onChange: (e) => setModelMode(e.target.value),
                className: "h-8 w-full rounded-md border border-input bg-background px-2 text-xs",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ai_settings", children: "Use AI Settings provider" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "custom", children: "Custom provider (own API)" })
                ]
              }
            ),
            modelMode === "ai_settings" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Uses the custom provider configured in AI Settings. Add your provider and API key there to enable AI reports." }),
            modelMode === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: customProvider,
                  onChange: (e) => setCustomProvider(e.target.value),
                  placeholder: "Provider name (e.g. openai)",
                  className: "h-8 text-xs"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: customModel,
                  onChange: (e) => setCustomModel(e.target.value),
                  placeholder: "Model (e.g. gpt-4o-mini)",
                  className: "h-8 text-xs"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: customBaseUrl,
                  onChange: (e) => setCustomBaseUrl(e.target.value),
                  placeholder: "Base URL (https://api.openai.com/v1)",
                  className: "h-8 text-xs sm:col-span-2"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "password",
                  value: customApiKey,
                  onChange: (e) => setCustomApiKey(e.target.value),
                  placeholder: "API key",
                  className: "h-8 text-xs sm:col-span-2"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: threadRef, className: "flex-1 space-y-4 overflow-y-auto p-4 lg:max-h-[440px]", children: [
          !hasConversation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-sm text-muted-foreground", children: mode === "agentic" ? "Ask the assistant to take action — it proposes each change for you to approve. Try one of these:" : "Start a conversation about your platform data. Try one of these:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: promptSuggestions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => send(s),
                className: "rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground",
                children: s
              },
              s
            )) })
          ] }),
          messages.map(
            (m, idx) => m.role === "user" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground", children: m.content }) }, idx) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "prose-report max-w-[90%] rounded-2xl rounded-bl-sm border bg-background px-4 py-3 text-sm",
                  dangerouslySetInnerHTML: { __html: markdownToHtml(m.content) }
                }
              ),
              idx > 0 && messages[idx - 1]?.role === "user" && isDocRequest(messages[idx - 1].content) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "h-7 px-2 text-xs",
                    onClick: () => {
                      const title = deriveTitle([messages[idx - 1]]);
                      downloadReportAsWord(title, conversationToMarkdown(title, [messages[idx - 1], m]));
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mr-1 h-3.5 w-3.5" }),
                      " Word"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "h-7 px-2 text-xs",
                    onClick: () => {
                      const title = deriveTitle([messages[idx - 1]]);
                      downloadReportAsPdf(title, conversationToMarkdown(title, [messages[idx - 1], m]));
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "mr-1 h-3.5 w-3.5" }),
                      " PDF"
                    ]
                  }
                )
              ] })
            ] }, idx)
          ),
          mode === "agentic" && pendingActions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-violet-500/40 bg-violet-500/5 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2 flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3.5 w-3.5" }),
              " Proposed actions — approve to apply"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: pendingActions.map((a) => {
              const result = actionResults[a.id];
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium", children: ACTION_LABELS[a.name] ?? a.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-[11px] text-muted-foreground", children: describeAction(a) }),
                      result && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "p",
                        {
                          className: `mt-0.5 text-[10px] font-medium ${result.ok ? "text-success" : "text-muted-foreground"}`,
                          children: [
                            result.ok ? "✓ " : "• ",
                            result.msg
                          ]
                        }
                      )
                    ] }),
                    !result && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Button,
                        {
                          size: "sm",
                          className: "h-7 gap-1 bg-success px-2 text-xs text-success-foreground hover:bg-success/90",
                          disabled: runAction.isPending,
                          onClick: () => runAction.mutate(a),
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }),
                            " Approve"
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          size: "sm",
                          variant: "ghost",
                          className: "h-7 w-7 p-0 text-muted-foreground hover:text-destructive",
                          onClick: () => dismissAction(a.id),
                          "aria-label": "Dismiss action",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
                        }
                      )
                    ] })
                  ]
                },
                a.id
              );
            }) })
          ] }),
          chat.isPending && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
            " ",
            mode === "agentic" ? "Thinking and preparing actions…" : "Analysing your data…"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              ref: inputRef,
              value: input,
              onChange: (e) => setInput(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              },
              placeholder: "Ask a question about your analytics…",
              className: "min-h-[44px] flex-1 resize-none",
              rows: 1
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => send(input), disabled: chat.isPending || !input.trim(), size: "icon", className: "h-11 w-11 shrink-0", children: chat.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 font-display text-lg font-semibold", children: "Analytics Overview" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Users, label: "Total Leads", value: String(analytics?.totals.leads ?? "—"), tone: "bg-primary/10 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: TrendingUp, label: "Qualified", value: String(analytics?.totals.qualified ?? "—"), tone: "bg-success/15 text-success" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: MessageSquare, label: "Messages", value: String(analytics?.totals.messages ?? "—"), tone: "bg-chart-4/15 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: FileText, label: "Bookings", value: String(analytics?.totals.bookings ?? "—"), tone: "bg-accent/20 text-accent-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Stat,
          {
            icon: DollarSign,
            label: "Pipeline Value",
            value: analytics ? analytics.opportunityTotals.valuation.toLocaleString() : "—",
            tone: "bg-success/15 text-success"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Stat,
          {
            icon: DollarSign,
            label: "Expected Liquidity",
            value: analytics ? analytics.opportunityTotals.liquidity.toLocaleString() : "—",
            tone: "bg-primary/10 text-primary"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-4 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: `Leads per day (last ${analytics?.rangeDays ?? 14} days)`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: analytics?.leadsByDay ?? [], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", tick: { fontSize: 10 }, tickFormatter: (d) => String(d).slice(5) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false, tick: { fontSize: 10 }, width: 28 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "count", stroke: "var(--chart-1)", strokeWidth: 2, dot: false })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: "Messages by hour (activity moments)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: analytics?.messagesByHour ?? [], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "hour", tick: { fontSize: 10 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false, tick: { fontSize: 10 }, width: 28 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "var(--chart-3)", radius: [3, 3, 0, 0] })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: "Pipeline stage distribution", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: analytics?.stageDistribution ?? [], layout: "vertical", margin: { left: 20 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", allowDecimals: false, tick: { fontSize: 10 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "label", tick: { fontSize: 9 }, width: 90 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "var(--chart-2)", radius: [0, 3, 3, 0] })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: `Messages per day (last ${analytics?.rangeDays ?? 14} days)`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: analytics?.messagesByDay ?? [], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", tick: { fontSize: 10 }, tickFormatter: (d) => String(d).slice(5) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false, tick: { fontSize: 10 }, width: 28 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "count", stroke: "var(--chart-5)", strokeWidth: 2, dot: false })
        ] }) }) })
      ] })
    ] })
  ] });
}
const EMPTY = {
  name: "",
  description: "",
  products: "",
  stage: PIPELINE_COLUMNS[0].id,
  stages: [],
  default_valuation: 0,
  expected_liquidity: 0,
  currency: "USD",
  enabled: true,
  pipeline_id: null
};
function stageLabel(id) {
  return PIPELINE_COLUMNS.find((c) => c.id === id)?.label ?? id;
}
function OffersManager() {
  const qc = useQueryClient();
  const listFn = useServerFn(listOffers);
  const saveFn = useServerFn(upsertOffer);
  const delFn = useServerFn(deleteOffer);
  const pipelinesFn = useServerFn(listPipelines);
  const { data } = useQuery({ queryKey: ["offers"], queryFn: () => listFn() });
  const { data: pipelinesData } = useQuery({ queryKey: ["pipelines"], queryFn: () => pipelinesFn() });
  const pipelines = pipelinesData?.pipelines ?? [];
  const offers = (data?.offers ?? []).map((o) => ({
    ...o,
    // Fall back to the legacy single stage when no multi-stage list is set yet.
    stages: o.stages && o.stages.length > 0 ? o.stages : o.stage ? [o.stage] : []
  }));
  const [editing, setEditing] = reactExports.useState(null);
  const save = useMutation({
    mutationFn: (o) => {
      const stages = o.stages.length > 0 ? o.stages : [PIPELINE_COLUMNS[0].id];
      return saveFn({
        data: {
          ...o,
          stages,
          // Keep the legacy single-stage column in sync for backward compatibility.
          stage: stages[0],
          default_valuation: Number(o.default_valuation) || 0,
          expected_liquidity: Number(o.expected_liquidity) || 0
        }
      });
    },
    onSuccess: (r) => {
      const res = r;
      if (!res.ok) return toast.error(res.error ?? "Failed to save offer");
      toast.success("Offer saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["offers"] });
    },
    onError: () => toast.error("Failed to save offer")
  });
  const del = useMutation({
    mutationFn: (id) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Offer deleted");
      qc.invalidateQueries({ queryKey: ["offers"] });
    },
    onError: () => toast.error("Failed to delete")
  });
  if (editing) {
    const o = editing;
    const set = (patch) => setEditing({ ...o, ...patch });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-6 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: o.id ? "Edit Offer" : "New Offer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setEditing(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Offer name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: o.name, onChange: (e) => set({ name: e.target.value }), placeholder: "e.g. Premium Admissions Package" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Applies to pipeline stages" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 rounded-md border border-input bg-background p-3 sm:grid-cols-3", children: PIPELINE_COLUMNS.map((c) => {
            const checked = o.stages.includes(c.id);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked,
                  onChange: (e) => set({
                    stages: e.target.checked ? [...o.stages, c.id] : o.stages.filter((s) => s !== c.id)
                  })
                }
              ),
              c.label
            ] }, c.id);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Select all stages this offer applies to." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pipeline" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: o.pipeline_id ?? "",
              onChange: (e) => set({ pipeline_id: e.target.value || null }),
              className: "h-9 w-full rounded-md border border-input bg-background px-2 text-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Default pipeline" }),
                pipelines.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: p.id, children: [
                  p.name,
                  p.is_default ? " (default)" : ""
                ] }, p.id))
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Leads holding this offer appear in this pipeline on the Pipeline board." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Currency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: o.currency, onChange: (e) => set({ currency: e.target.value.toUpperCase().slice(0, 8) }), placeholder: "USD" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Default valuation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              min: 0,
              value: o.default_valuation,
              onChange: (e) => set({ default_valuation: Number(e.target.value) })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected liquidity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              min: 0,
              value: o.expected_liquidity,
              onChange: (e) => set({ expected_liquidity: Number(e.target.value) })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Products applicable" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: o.products ?? "",
              onChange: (e) => set({ products: e.target.value }),
              placeholder: "List the products/services included in this offer"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: o.description ?? "",
              onChange: (e) => set({ description: e.target.value }),
              placeholder: "Internal notes about this offer"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: o.enabled, onChange: (e) => set({ enabled: e.target.checked }) }),
          "Enabled"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(o), disabled: save.isPending || !o.name.trim(), children: "Save Offer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setEditing(null), children: "Cancel" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-2xl text-sm text-muted-foreground", children: "Create the offers shown in the Pipeline's Opportunities view. Each offer carries a default valuation and expected liquidity for the stage it applies to, and can be linked to a lead to calculate opportunity value." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setEditing({ ...EMPTY }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
        " New Offer"
      ] })
    ] }),
    offers.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 rounded-xl border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: o.name }),
          o.stages.map((st) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground", children: stageLabel(st) }, st)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              className: `flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${o.enabled ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Power, { className: "h-3 w-3" }),
                " ",
                o.enabled ? "Active" : "Off"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 truncate text-xs text-muted-foreground", children: [
          "Valuation ",
          o.currency,
          " ",
          Number(o.default_valuation).toLocaleString(),
          " · Liquidity ",
          o.currency,
          " ",
          Number(o.expected_liquidity).toLocaleString()
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setEditing(o), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            onClick: () => {
              if (confirm(`Delete offer "${o.name}"?`)) del.mutate(o.id);
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" })
          }
        )
      ] })
    ] }, o.id)),
    offers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No offers yet." })
  ] });
}
const SECTIONS = [
  { id: "reports", label: "Reports", icon: ChartColumn },
  { id: "opportunities", label: "Opportunities", icon: Package }
];
function AdvancedTab() {
  const [section, setSection] = reactExports.useState(ADVANCED_SECTIONS[0]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-[200px_1fr]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-row flex-wrap gap-1 lg:flex-col", children: SECTIONS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setSection(s.id),
        className: cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          section === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "h-4 w-4" }),
          s.label
        ]
      },
      s.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      section === "reports" && /* @__PURE__ */ jsxRuntimeExports.jsx(ReportsTab, {}),
      section === "opportunities" && /* @__PURE__ */ jsxRuntimeExports.jsx(OffersManager, {})
    ] })
  ] });
}
const CARDS = [
  { key: "leads", label: "Total Leads", icon: Users, color: "text-primary bg-primary/10" },
  { key: "qualified", label: "Qualified", icon: GraduationCap, color: "text-success bg-success/15" },
  { key: "bookings", label: "Bookings", icon: Calendar$1, color: "text-accent-foreground bg-accent/20" },
  { key: "messages", label: "Messages", icon: MessageSquare, color: "text-primary bg-chart-4/15" },
  { key: "onboarding", label: "Onboarding", icon: UserCheck, color: "text-success bg-chart-2/15" },
  { key: "disqualified", label: "Disqualified", icon: UserX, color: "text-destructive bg-destructive/10" }
];
function DashboardStats() {
  const fn = useServerFn(getDashboardStats);
  const { data } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fn(),
    refetchInterval: 5e3
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6", children: CARDS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl border bg-card p-3 shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${c.color}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(c.icon, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-xl font-bold leading-none", children: data ? data[c.key] : "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 truncate text-xs text-muted-foreground", children: c.label })
    ] })
  ] }, c.key)) });
}
function SpaceSwitcher() {
  const listFn = useServerFn(listMySpaces);
  const { data } = useQuery({ queryKey: ["my-spaces"], queryFn: () => listFn() });
  const spaces = data?.spaces ?? [];
  const active = typeof window !== "undefined" && window.localStorage.getItem(ACTIVE_SPACE_KEY) || "";
  reactExports.useEffect(() => {
    if (spaces.length === 0) return;
    const ids = spaces.map((s) => s.id);
    if (!active || !ids.includes(active)) {
      try {
        window.localStorage.setItem(ACTIVE_SPACE_KEY, spaces[0].id);
      } catch {
      }
    }
  }, [spaces, active]);
  if (spaces.length <= 1) return null;
  const current = active && spaces.some((s) => s.id === active) ? active : spaces[0]?.id ?? "";
  const onChange = (id) => {
    if (id === current) return;
    try {
      window.localStorage.setItem(ACTIVE_SPACE_KEY, id);
    } catch {
    }
    window.location.reload();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mb-1 flex items-center gap-1.5 text-xs text-sidebar-foreground/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Boxes, { className: "h-3.5 w-3.5" }),
      " Active Space"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: current, onValueChange: onChange, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-full bg-sidebar-accent/40 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: spaces.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: s.id, children: [
        s.name,
        s.status !== "active" ? " (suspended)" : ""
      ] }, s.id)) })
    ] })
  ] });
}
const ALL_TABS = [{
  id: "messages",
  label: "Messages",
  icon: MessageSquare
}, {
  id: "calls",
  label: "Calls",
  icon: PhoneCall
}, {
  id: "bookings",
  label: "Bookings",
  icon: Calendar$1
}, {
  id: "pipeline",
  label: "Pipeline",
  icon: SquareKanban
}, {
  id: "meeting_outcomes",
  label: "Meeting Outcomes",
  icon: ClipboardCheck
}, {
  id: "orchestration",
  label: "Orchestration",
  icon: Workflow
}, {
  id: "advanced",
  label: "Advanced",
  icon: Gauge
}, {
  id: "leads",
  label: "Leads",
  icon: Users
}, {
  id: "contacts",
  label: "Contacts",
  icon: Contact
}, {
  id: "settings",
  label: "Settings",
  icon: Settings
}];
function Dashboard() {
  const {
    loading,
    profile,
    signOut
  } = useAuth();
  const [tab, setTab] = reactExports.useState("messages");
  const [pendingConversation, setPendingConversation] = reactExports.useState(null);
  const brand = useBranding();
  const spaceCtxFn = useServerFn(getActiveSpaceContext);
  const {
    data: spaceCtx
  } = useQuery({
    queryKey: ["active-space-context"],
    queryFn: () => spaceCtxFn()
  });
  const openConversation = reactExports.useCallback((phone) => {
    setPendingConversation(phone);
    setTab("messages");
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) });
  }
  const role = profile.role;
  const flags = spaceCtx?.flags ?? {};
  const isSuperAdmin = spaceCtx?.isSuperAdmin ?? role === "super_admin";
  const suspended = spaceCtx?.status === "suspended" && !isSuperAdmin;
  const flagOn = (key) => isSuperAdmin || flags[key] !== false;
  const advancedAccess = canAccessAdvanced(role, profile.permissions) && flagOn("advanced");
  const tabs = ALL_TABS.filter((t) => {
    if (t.id === "advanced") return advancedAccess;
    if (t.id === "orchestration" && !flagOn("orchestration")) return false;
    if (t.id === "calls" && !flagOn("calls")) return false;
    return canAccessTab(role, t.id);
  });
  const activeTab = tabs.some((t) => t.id === tab) ? tab : tabs[0]?.id ?? "leads";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardNavProvider, { value: {
    openConversation
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-sidebar px-4 py-6 text-sidebar-foreground lg:flex", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mb-8 flex items-center gap-2 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: brand.logoDark, alt: `${brand.name} logo`, className: "w-auto object-contain", style: {
        height: `${56 * brand.scale / 100}px`,
        maxWidth: `${200 * brand.scale / 100}px`
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-1 flex-col gap-1", children: tabs.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTab(t.id), className: cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", activeTab === t.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(t.icon, { className: "h-4 w-4" }),
        t.label
      ] }, t.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-2 border-t border-sidebar-border/50 pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SpaceSwitcher, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-medium", children: profile.full_name ?? profile.email }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-sidebar-foreground/60", children: role ? ROLE_LABELS[role] : "No role" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: signOut, className: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
          " Sign out"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
          " Back to site"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 overflow-x-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 overflow-x-auto border-b bg-card px-3 py-2 lg:hidden", children: [
        tabs.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTab(t.id), className: cn("flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium", activeTab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(t.icon, { className: "h-4 w-4" }),
          t.label
        ] }, t.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: signOut, className: "ml-auto flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 py-6 sm:px-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold capitalize", children: activeTab }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: brand.tagline })
        ] }),
        suspended ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold text-destructive", children: "This Space is suspended" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mx-auto mt-2 max-w-md text-sm text-muted-foreground", children: [
            "Access to ",
            spaceCtx?.name || "this Space",
            " is currently paused. Please contact your administrator to restore access."
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          activeTab !== "settings" && activeTab !== "orchestration" && activeTab !== "advanced" && activeTab !== "calls" && activeTab !== "meeting_outcomes" && /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardStats, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
            activeTab === "leads" && /* @__PURE__ */ jsxRuntimeExports.jsx(LeadsTab, {}),
            activeTab === "messages" && /* @__PURE__ */ jsxRuntimeExports.jsx(MessagesTab, { pendingConversation, onPendingHandled: () => setPendingConversation(null) }),
            activeTab === "calls" && /* @__PURE__ */ jsxRuntimeExports.jsx(CallsTab, {}),
            activeTab === "contacts" && /* @__PURE__ */ jsxRuntimeExports.jsx(ContactsTab, {}),
            activeTab === "bookings" && /* @__PURE__ */ jsxRuntimeExports.jsx(BookingsTab, {}),
            activeTab === "pipeline" && /* @__PURE__ */ jsxRuntimeExports.jsx(PipelineTab, { canAdvanced: advancedAccess }),
            activeTab === "meeting_outcomes" && /* @__PURE__ */ jsxRuntimeExports.jsx(MeetingOutcomesTab, {}),
            activeTab === "orchestration" && /* @__PURE__ */ jsxRuntimeExports.jsx(OrchestrationTab, {}),
            activeTab === "advanced" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdvancedTab, {}),
            activeTab === "settings" && /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsTab, { role })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-right", richColors: true })
  ] }) });
}
export {
  Dashboard as component
};
