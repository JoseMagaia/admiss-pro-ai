import { useEffect, useRef, useState } from "react";
import type { Edge, Node } from "@xyflow/react";
import { Bot, Loader2, Play, RotateCcw, User, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FLOW_BLOCK_MAP } from "./flowblocks";
import { cn } from "@/lib/utils";

interface PreviewMsg {
  id: string;
  role: "bot" | "user" | "system";
  text: string;
  options?: string[];
}

interface LeadLike {
  lead_name: string;
  phone_number: string;
  qualification_status: string;
  course_interest: string;
  country_interest: string;
}

const DEFAULT_LEAD: LeadLike = {
  lead_name: "Maria",
  phone_number: "+5511999999999",
  qualification_status: "NEW_LEAD",
  course_interest: "Nursing",
  country_interest: "UK",
};

function fill(text: string, lead: Record<string, string>, ctx: Record<string, string>): string {
  return String(text ?? "").replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, key: string) => {
    const v = ctx[key] ?? lead[key] ?? "";
    return v === undefined || v === null ? "" : String(v);
  });
}

function evalCondition(data: Record<string, unknown>, lead: Record<string, string>, ctx: Record<string, string>): boolean {
  const field = String(data.field ?? "qualification_status");
  const operator = String(data.operator ?? "equals");
  const raw = ctx[field] ?? lead[field] ?? "";
  const expected = fill(String(data.value ?? ""), lead, ctx);
  const numA = Number(raw);
  const numB = Number(expected);
  switch (operator) {
    case "is_set":
      return raw !== undefined && raw !== null && String(raw).trim() !== "";
    case "is_empty":
      return raw === undefined || raw === null || String(raw).trim() === "";
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

export function WorkflowPreview({
  open,
  onClose,
  nodes,
  edges,
}: {
  open: boolean;
  onClose: () => void;
  nodes: Node[];
  edges: Edge[];
}) {
  const graphRef = useRef({ nodes, edges });
  useEffect(() => {
    graphRef.current = { nodes, edges };
  }, [nodes, edges]);

  const [msgs, setMsgs] = useState<PreviewMsg[]>([]);
  const [lead, setLead] = useState<Record<string, string>>({ ...DEFAULT_LEAD });
  const [ctx, setCtx] = useState<Record<string, string>>({});
  const [waiting, setWaiting] = useState<{ options: string[]; sourceHandleIds: string[]; fromNode: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const idCounter = useRef(0);
  const [showLeadEditor, setShowLeadEditor] = useState(false);

  const nextId = () => `m${++idCounter.current}`;

  function reset() {
    idCounter.current = 0;
    setMsgs([]);
    setLead({ ...DEFAULT_LEAD });
    setCtx({});
    setWaiting(null);
    runFrom("trigger");
  }

  // Continue walking the graph from a node until the path ends or the lead
  // must tap a quick reply. Accumulates a batch of messages, then commits.
  function runFrom(startId: string, skipFirst = false) {
    const { nodes: ns, edges: es } = graphRef.current;
    const batch: PreviewMsg[] = [];
    let current = startId;
    let pending: { options: string[]; sourceHandleIds: string[]; fromNode: string } | null = null;
    let leadNow = lead;
    let ctxNow = ctx;
    const labelById = (id: string) => String(ns.find((n) => n.id === id)?.data?.label ?? "");

    while (current && !pending) {
      const node = ns.find((n) => n.id === current);
      if (!node) break;
      // Block kind lives in data.type / data._t; node.type is always "flow" in
      // the current builder (legacy graphs used node.type directly).
      const data = (node.data ?? {}) as Record<string, unknown>;
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
          if (url) batch.push({ id: nextId(), role: "bot", text: `[📷 Image] ${url}${cap ? `\n\n${cap}` : ""}` });
          current = outs[0]?.target ?? "";
          continue;
        }
        case "buttons": {
          const options = Array.isArray(data.options) ? (data.options as Array<{ id: string; label: string }>) : [];
          const text = fill(String(data.message ?? ""), leadNow, ctxNow);
          batch.push({ id: nextId(), role: "bot", text, options: options.map((o) => o.label) });
          pending = {
            options: options.map((o) => o.label),
            sourceHandleIds: options.map((o) => `opt_${o.id}`),
            fromNode: current,
          };
          break;
        }
        case "wait": {
          batch.push({
            id: nextId(),
            role: "system",
            text: `⏳ Waiting ${data.delayValue ?? 1} ${data.delayUnit ?? "days"}…`,
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
            text: `➡️ Condition "${String(data.field ?? "")}" → ${result ? String(data.trueLabel ?? "Yes") : String(data.falseLabel ?? "No")}`,
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
            text: `✨ AI (${agent}) generating reply…${instr ? `\n> ${instr}` : ""}`,
          });
          batch.push({ id: nextId(), role: "bot", text: "🤖 (AI simulated reply) Thanks! I'll help you with that." });
          current = outs[0]?.target ?? "";
          continue;
        }
        case "http": {
          batch.push({
            id: nextId(),
            role: "system",
            text: `🌐 HTTP call → ${String(data.actionName ?? data.actionId ?? "action")}`,
          });
          current = outs[0]?.target ?? "";
          continue;
        }
        case "booking": {
          const inDays = Number(data.daysAhead ?? 3);
          const when = new Date(Date.now() + inDays * 86400000).toLocaleDateString([], {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
          batch.push({ id: nextId(), role: "system", text: `📅 Appointment booked (${String(data.appointmentType ?? "booking")}) for ${when}` });
          batch.push({
            id: nextId(),
            role: "bot",
            text: `Great news! I've booked your ${String(data.appointmentType ?? "consultation")} for ${when}. 🎉`,
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
            text: `↪️ Redirect to workflow "${String(data.targetWorkflowName ?? data.targetWorkflowId ?? "—")}"`,
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
    void labelById;
  }

  function handleOption(optionIdx: number) {
    if (!waiting) return;
    const { options, sourceHandleIds, fromNode } = waiting;
    const label = options[optionIdx];
    setMsgs((prev) => [...prev, { id: nextId(), role: "user", text: label }]);
    const { edges: es } = graphRef.current;
    const edge =
      es.find((e) => e.source === fromNode && e.sourceHandle === sourceHandleIds[optionIdx]) ??
      es.find((e) => e.source === fromNode && e.label === label) ??
      es.find((e) => e.source === fromNode);
    setWaiting(null);
    runFrom(edge?.target ?? "");
  }

  function handleOpen(v: boolean) {
    if (v) {
      setBusy(true);
      reset();
    } else {
      onClose();
    }
  }

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, waiting]);

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-md">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" /> Test flow — chat preview
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <span>Simulates the flow as the lead sees it.</span>
          <button
            type="button"
            className="ml-auto shrink-0 rounded-md border px-2 py-1 font-medium hover:bg-muted"
            onClick={() => setShowLeadEditor((v) => !v)}
          >
            {showLeadEditor ? "Hide lead data" : "Edit lead data"}
          </button>
        </div>

        {showLeadEditor && (
          <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-3">
            {Object.keys(DEFAULT_LEAD).map((k) => (
              <label key={k} className="space-y-0.5 text-[11px] font-medium text-muted-foreground">
                {k}
                <input
                  value={lead[k] ?? ""}
                  onChange={(e) => setLead((l) => ({ ...l, [k]: e.target.value }))}
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground"
                />
              </label>
            ))}
          </div>
        )}

        <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto py-3">
          {msgs.length === 0 && (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Starting…
            </div>
          )}
          {msgs.map((m) =>
            m.role === "system" ? (
              <div key={m.id} className="flex justify-center">
                <div className="max-w-[90%] rounded-full bg-muted/60 px-3 py-1 text-center text-[11px] text-muted-foreground">
                  {m.text}
                </div>
              </div>
            ) : (
              <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap",
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  <div className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase opacity-60">
                    {m.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                    {m.role === "user" ? "Lead" : "Bot"}
                  </div>
                  {m.text}
                  {m.options && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.options.map((o, i) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => handleOption(i)}
                          className="rounded-full border border-primary/40 bg-background px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ),
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t pt-3">
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Restart
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onClose()}>
            <X className="mr-1 h-3.5 w-3.5" /> Close
          </Button>
          <span className="text-[11px] text-muted-foreground">
            {busy ? "Running…" : waiting ? "Awaiting reply" : msgs.length > 0 ? "Flow ended" : ""}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
