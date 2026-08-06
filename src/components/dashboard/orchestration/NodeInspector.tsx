import { useRef } from "react";
import { Copy, Trash2, X } from "lucide-react";

/** crypto.randomUUID requires a secure context; fall back for http previews. */
function rid(): string {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `id_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
import type { Node } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FLOW_BLOCK_MAP, blockStyle } from "./flowblocks";
import { TIME_UNITS, STEP_ANCHORS } from "@/lib/orchestration";

export const LEAD_FIELDS = [
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
  "document_received",
];

const CONDITION_OPERATORS = [
  { id: "equals", label: "is equal to" },
  { id: "not_equals", label: "is not equal to" },
  { id: "contains", label: "contains" },
  { id: "is_set", label: "is set" },
  { id: "is_empty", label: "is empty" },
  { id: "gt", label: "is greater than" },
  { id: "lt", label: "is less than" },
];

interface NodeInspectorProps {
  node: Node;
  allVariables: string[];
  callableWorkflows: Array<{ id: string; name: string }>;
  agents: Array<{ id: string; name: string }>;
  httpActions: Array<{ id: string; name: string; method?: string | null }>;
  onPatch: (patch: Record<string, unknown>) => void;
  onClose: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function SchedulingFields({
  data,
  onPatch,
}: {
  data: Record<string, unknown>;
  onPatch: (p: Record<string, unknown>) => void;
}) {
  const anchor = String(data.anchor ?? "wait");
  const countdown = anchor !== "wait";
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Scheduling</Label>
        <select
          value={anchor}
          onChange={(e) => onPatch({ anchor: e.target.value })}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {STEP_ANCHORS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </div>
      {countdown ? (
        <div className="space-y-1.5">
          <Label>Send before the target date</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              value={Number(data.offsetValue ?? 0)}
              onChange={(e) => onPatch({ offsetValue: Math.max(0, Number(e.target.value)) })}
              className="w-24"
            />
            <select
              value={String(data.offsetUnit ?? "days")}
              onChange={(e) => onPatch({ offsetUnit: e.target.value })}
              className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
            >
              {TIME_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label>Wait before sending</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              value={Number(data.delayValue ?? 0)}
              onChange={(e) => onPatch({ delayValue: Math.max(0, Number(e.target.value)) })}
              className="w-24"
            />
            <select
              value={String(data.delayUnit ?? "minutes")}
              onChange={(e) => onPatch({ delayUnit: e.target.value })}
              className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
            >
              {TIME_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

function VariableChips({
  variables,
  onInsert,
}: {
  variables: string[];
  onInsert: (name: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 pt-1">
      {variables.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onInsert(v)}
          className="rounded-md border border-input bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {`{{${v}}}`}
        </button>
      ))}
    </div>
  );
}

export function NodeInspector({
  node,
  allVariables,
  callableWorkflows,
  agents,
  httpActions,
  onPatch,
  onClose,
  onDelete,
  onDuplicate,
}: NodeInspectorProps) {
  // Block kind lives in data.type / data._t (node.type is always "flow" in the
  // current builder); fall back to node.type for legacy graphs.
  const data0 = (node.data ?? {}) as Record<string, unknown>;
  const type = String(data0.type ?? data0._t ?? node.type ?? "text");
  const def = FLOW_BLOCK_MAP[type] ?? FLOW_BLOCK_MAP.text;
  const data = data0;
  const style = blockStyle(type);
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  const insertVariable = (name: string) => {
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

  const options = Array.isArray(data.options) ? (data.options as Array<{ id: string; label: string }>) : [];
  const patchOption = (id: string, label: string) =>
    onPatch({ options: options.map((o) => (o.id === id ? { ...o, label } : o)) });
  const addOption = () =>
    onPatch({
      options: [
        ...options,
        { id: rid(), label: `Option ${options.length + 1}` },
      ],
    });
  const removeOption = (id: string) => onPatch({ options: options.filter((o) => o.id !== id) });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className={`flex items-center gap-1.5 text-sm font-semibold ${style.text}`}>
          <def.icon className="h-4 w-4" /> {def.label}
        </span>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onDuplicate} title="Duplicate block">
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {type === "text" && (
        <div className="space-y-1.5">
          <Label>Message content</Label>
          <Textarea
            ref={textRef}
            value={String(data.content ?? "")}
            onChange={(e) => onPatch({ content: e.target.value })}
            rows={6}
            placeholder="The WhatsApp message to send…"
          />
          <VariableChips variables={allVariables} onInsert={insertVariable} />
        </div>
      )}

      {type === "image" && (
        <>
          <div className="space-y-1.5">
            <Label>Image URL</Label>
            <Input
              value={String(data.imageUrl ?? "")}
              onChange={(e) => onPatch({ imageUrl: e.target.value })}
              placeholder="https://…/photo.jpg"
            />
            {data.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={String(data.imageUrl)}
                alt="preview"
                className="mt-1 h-32 w-full rounded-lg border object-cover"
                onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0.3")}
              />
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label>Caption (optional)</Label>
            <Textarea
              ref={textRef}
              value={String(data.caption ?? "")}
              onChange={(e) => onPatch({ caption: e.target.value })}
              rows={3}
            />
            <VariableChips variables={allVariables} onInsert={insertVariable} />
          </div>
        </>
      )}

      {type === "buttons" && (
        <>
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea
              ref={textRef}
              value={String(data.message ?? "")}
              onChange={(e) => onPatch({ message: e.target.value })}
              rows={4}
            />
            <VariableChips variables={allVariables} onInsert={insertVariable} />
          </div>
          <div className="space-y-1.5">
            <Label>Quick replies (each one becomes a branch handle →)</Label>
            <div className="space-y-2">
              {options.map((o, i) => (
                <div key={o.id} className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">{i + 1}.</span>
                  <Input
                    value={o.label}
                    onChange={(e) => patchOption(o.id, e.target.value)}
                    placeholder="Option label"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeOption(o.id)}
                    disabled={options.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addOption}>
              + Add option
            </Button>
          </div>
        </>
      )}

      {type === "wait" && (
        <div className="space-y-1.5">
          <Label>Pause duration</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              value={Number(data.delayValue ?? 1)}
              onChange={(e) => onPatch({ delayValue: Math.max(0, Number(e.target.value)) })}
              className="w-24"
            />
            <select
              value={String(data.delayUnit ?? "days")}
              onChange={(e) => onPatch({ delayUnit: e.target.value })}
              className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
            >
              {TIME_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {type === "condition" && (
        <>
          <div className="space-y-1.5">
            <Label>Lead field / variable</Label>
            <select
              value={String(data.field ?? "qualification_status")}
              onChange={(e) => onPatch({ field: e.target.value })}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {[...LEAD_FIELDS, ...allVariables.filter((v) => !LEAD_FIELDS.includes(v))].map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Operator</Label>
            <select
              value={String(data.operator ?? "equals")}
              onChange={(e) => onPatch({ operator: e.target.value })}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {CONDITION_OPERATORS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {!["is_set", "is_empty"].includes(String(data.operator ?? "equals")) && (
            <div className="space-y-1.5">
              <Label>Value</Label>
              <Input
                value={String(data.value ?? "")}
                onChange={(e) => onPatch({ value: e.target.value })}
                placeholder="e.g. QUALIFIED"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label>True branch</Label>
              <Input value={String(data.trueLabel ?? "Yes")} onChange={(e) => onPatch({ trueLabel: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>False branch</Label>
              <Input value={String(data.falseLabel ?? "No")} onChange={(e) => onPatch({ falseLabel: e.target.value })} />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Drag from the <span className="font-semibold text-success">✓</span> /{" "}
            <span className="font-semibold text-destructive">✗</span> handles to route each branch.
          </p>
        </>
      )}

      {type === "setvar" && (
        <>
          <div className="space-y-1.5">
            <Label>Variable name</Label>
            <Input
              value={String(data.varName ?? "")}
              onChange={(e) => onPatch({ varName: e.target.value.replace(/[^a-zA-Z0-9_]/g, "") })}
              placeholder="e.g. payment_method"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Value</Label>
            <Input
              value={String(data.varValue ?? "")}
              onChange={(e) => onPatch({ varValue: e.target.value })}
              placeholder="e.g. credit_card or {{lead_name}}"
            />
          </div>
        </>
      )}

      {type === "ai" && (
        <>
          <div className="space-y-1.5">
            <Label>Responder agent</Label>
            <select
              value={String(data.agentId ?? "")}
              onChange={(e) => {
                const a = agents.find((x) => x.id === e.target.value);
                onPatch({ agentId: e.target.value, agentName: a?.name ?? "" });
              }}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Default qualification agent</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Instruction (optional)</Label>
            <Textarea
              value={String(data.instruction ?? "")}
              onChange={(e) => onPatch({ instruction: e.target.value })}
              rows={4}
              placeholder="e.g. Ask about their course preferences in a friendly tone."
            />
          </div>
        </>
      )}

      {type === "http" && (
        <div className="space-y-1.5">
          <Label>HTTP action</Label>
          <select
            value={String(data.actionId ?? "")}
            onChange={(e) => {
              const a = httpActions.find((x) => x.id === e.target.value);
              onPatch({ actionId: e.target.value, actionName: a?.name ?? "" });
            }}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Select an action…</option>
            {httpActions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} {a.method ? `(${a.method})` : ""}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground">
            Uses the HTTP actions defined in Settings → HTTP Actions. The lead&apos;s variables are merged into the
            request.
          </p>
        </div>
      )}

      {type === "booking" && (
        <>
          <div className="space-y-1.5">
            <Label>Appointment type</Label>
            <Input
              value={String(data.appointmentType ?? "booking")}
              onChange={(e) => onPatch({ appointmentType: e.target.value })}
              placeholder="booking"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Schedule in (days)</Label>
            <Input
              type="number"
              min={1}
              max={90}
              value={Number(data.daysAhead ?? 3)}
              onChange={(e) => onPatch({ daysAhead: Math.max(1, Math.min(90, Number(e.target.value))) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Input
              value={String(data.notes ?? "")}
              onChange={(e) => onPatch({ notes: e.target.value })}
              placeholder="e.g. Booked automatically by flow"
            />
          </div>
        </>
      )}

      {type === "handoff" && (
        <div className="space-y-1.5">
          <Label>Note for the agent (optional)</Label>
          <Input
            value={String(data.note ?? "")}
            onChange={(e) => onPatch({ note: e.target.value })}
            placeholder="e.g. Lead asked for pricing"
          />
          <p className="text-[11px] text-muted-foreground">
            This pauses the AI, enables human takeover and stops the flow for this lead.
          </p>
        </div>
      )}

      {type === "end" && (
        <div className="space-y-1.5">
          <Label>Note (optional)</Label>
          <Input
            value={String(data.note ?? "")}
            onChange={(e) => onPatch({ note: e.target.value })}
            placeholder="e.g. Flow complete"
          />
        </div>
      )}

      {type === "redirect" && (
        <div className="space-y-1.5">
          <Label>Workflow to redirect to</Label>
          <select
            value={String(data.targetWorkflowId ?? "")}
            onChange={(e) => {
              const w = callableWorkflows.find((x) => x.id === e.target.value);
              onPatch({ targetWorkflowId: e.target.value, targetWorkflowName: w?.name ?? "" });
            }}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Select a workflow…</option>
            {callableWorkflows.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground">
            The lead is enrolled into that workflow and this flow continues.
          </p>
        </div>
      )}

      {(type === "text" || type === "image" || type === "buttons") && (
        <SchedulingFields data={data} onPatch={onPatch} />
      )}

      <div className="flex gap-2 pt-1">
        <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
          <Trash2 className="mr-1 h-4 w-4" /> Delete block
        </Button>
      </div>
    </div>
  );
}
