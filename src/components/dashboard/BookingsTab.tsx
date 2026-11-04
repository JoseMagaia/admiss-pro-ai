import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Calendar, List, CalendarDays, Workflow, Zap, ArrowUpDown, CalendarCog, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "./StageBadge";
import { CalendarManager } from "./bookings/CalendarManager";
import { SlotPicker } from "./bookings/SlotPicker";
import { BulkStageMover } from "./bookings/BulkStageMover";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listAppointments,
  updateAppointmentStatus,
  listActiveWorkflows,
  triggerLeadWorkflow,
} from "@/lib/dashboard.functions";
import { APPOINTMENT_STATUSES } from "@/lib/pipeline";
import { cn } from "@/lib/utils";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useDashboardNav } from "@/lib/dashboard-nav";
import { listLeadHistories } from "@/lib/lead-panel.functions";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { TouchpointButton, type HistNote } from "./bookings/TouchpointButton";

interface Appointment {
  id: string;
  phone_number: string | null;
  lead_name: string | null;
  appointment_date: string | null;
  appointment_type: string;
  status: string;
  notes: string | null;
  created_at?: string | null;
}

const TIME_FILTERS = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
] as const;

const SORTS = [
  { id: "date_desc", label: "Newest first" },
  { id: "date_asc", label: "Oldest first" },
  { id: "name_asc", label: "Name A–Z" },
  { id: "status", label: "Status" },
] as const;

function withinRange(iso: string | null | undefined, range: string): boolean {
  if (range === "all") return true;
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (isNaN(t)) return false;
  const now = Date.now();
  const day = 86400000;
  if (range === "today") return new Date(iso).toDateString() === new Date().toDateString();
  if (range === "7d") return now - t <= 7 * day;
  if (range === "30d") return now - t <= 30 * day;
  return true;
}

export function BookingsTab() {
  const qc = useQueryClient();
  const fn = useServerFn(listAppointments);
  const updateFn = useServerFn(updateAppointmentStatus);
  const workflowsFn = useServerFn(listActiveWorkflows);
  const triggerFn = useServerFn(triggerLeadWorkflow);
  const { data } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => fn(),
    refetchInterval: 5000,
  });
  const [view, setView] = usePersistentState<"list" | "calendar" | "slots" | "manage">("bookings.view", "list");
  const [statusFilter, setStatusFilter] = usePersistentState<string>("bookings.status", "all");
  const [timeFilter, setTimeFilter] = usePersistentState<string>("bookings.time", "all");
  const [sort, setSort] = usePersistentState<string>("bookings.sort", "date_desc");
  const { openConversation } = useDashboardNav();
  const historiesFn = useServerFn(listLeadHistories);
  const phones = useMemo(
    () => Array.from(new Set(((data?.appointments ?? []) as Appointment[]).map((a) => a.phone_number).filter(Boolean) as string[])),
    [data],
  );
  const { data: histData } = useQuery({
    queryKey: ["lead-histories", phones],
    queryFn: () => historiesFn({ data: { phones } }),
    enabled: phones.length > 0,
  });
  const historyByPhone = useMemo(() => {
    const m = new Map<string, HistNote[]>();
    for (const n of (histData?.notes ?? []) as unknown as HistNote[]) {
      const k = n.phone_number ?? "";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(n);
    }
    return m;
  }, [histData]);
  const [pickedWorkflow, setPickedWorkflow] = useState<Record<string, string>>({});


  const { data: workflowsData } = useQuery({
    queryKey: ["active-workflows"],
    queryFn: () => workflowsFn(),
  });
  const workflows = (workflowsData?.workflows ?? []) as Array<{ id: string; name: string }>;

  const update = useMutation({
    mutationFn: (vars: { id: string; status: (typeof APPOINTMENT_STATUSES)[number]; appointment_date?: string | null }) =>
      updateFn({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Booking updated");
    },
    onError: () => toast.error("Update failed"),
  });

  const trigger = useMutation({
    mutationFn: (vars: { workflowId: string; phone: string }) => triggerFn({ data: vars }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error?: string };
      if (res.ok) {
        toast.success("Workflow triggered");
        qc.invalidateQueries({ queryKey: ["workflow-states"] });
      } else {
        toast.error(res.error ?? "Could not trigger workflow");
      }
    },
    onError: () => toast.error("Could not trigger workflow"),
  });

  const allAppointments = (data?.appointments ?? []) as Appointment[];

  const appointments = useMemo(() => {
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

  const grouped = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appointments) {
      const key = a.appointment_date ? new Date(a.appointment_date).toLocaleDateString() : "Unscheduled";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return Array.from(map.entries());
  }, [appointments]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={view === "list" ? "default" : "outline"}
          onClick={() => setView("list")}
        >
          <List className="mr-1 h-4 w-4" /> List
        </Button>
        <Button
          size="sm"
          variant={view === "calendar" ? "default" : "outline"}
          onClick={() => setView("calendar")}
        >
          <CalendarDays className="mr-1 h-4 w-4" /> Calendar
        </Button>
        <Button
          size="sm"
          variant={view === "slots" ? "default" : "outline"}
          onClick={() => setView("slots")}
        >
          <CalendarClock className="mr-1 h-4 w-4" /> Book a slot
        </Button>
        <Button
          size="sm"
          variant={view === "manage" ? "default" : "outline"}
          onClick={() => setView("manage")}
        >
          <CalendarCog className="mr-1 h-4 w-4" /> Calendars
        </Button>

        <div className={cn("ml-auto flex flex-wrap items-center gap-2", view !== "list" && view !== "calendar" && "hidden")}>
          <BulkStageMover />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {APPOINTMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              {TIME_FILTERS.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <ArrowUpDown className="mr-1 h-3.5 w-3.5" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {view === "manage" ? (
        <CalendarManager />
      ) : view === "slots" ? (
        <SlotPicker />
      ) : view === "list" ? (

        <div className="overflow-x-auto rounded-2xl border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Lead</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Touchpoints</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
                <th className="px-4 py-3 font-semibold">Workflow</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => {
                const hist = historyByPhone.get(a.phone_number ?? "") ?? [];
                const tpCount = hist.filter((n) => n.body.startsWith("[Touchpoint]")).length;
                return (
                <HoverCard key={a.id} openDelay={400} closeDelay={100}>
                <HoverCardTrigger asChild>
                <tr
                  onClick={(e) => {
                    if (!a.phone_number) return;
                    if ((e.target as HTMLElement).closest("button,input,select,a,[role=combobox],[role=dialog]")) return;
                    openConversation(a.phone_number);
                  }}
                  className="cursor-pointer border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium">{a.lead_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {a.phone_number ? (
                      <button
                        type="button"
                        onClick={() => openConversation(a.phone_number!)}
                        className="hover:text-primary hover:underline"
                        title="Open conversation"
                      >
                        {a.phone_number}
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 capitalize">{a.appointment_type}</td>
                  <td className="px-4 py-3">
                    <Input
                      type="datetime-local"
                      defaultValue={a.appointment_date ? a.appointment_date.slice(0, 16) : ""}
                      onBlur={(e) =>
                        e.target.value &&
                        update.mutate({
                          id: a.id,
                          status: a.status as (typeof APPOINTMENT_STATUSES)[number],
                          appointment_date: new Date(e.target.value).toISOString(),
                        })
                      }
                      className="h-8 w-44 text-xs"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3">
                    {a.phone_number ? <TouchpointButton phone={a.phone_number} count={tpCount} /> : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {APPOINTMENT_STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => update.mutate({ id: a.id, status: s })}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-medium capitalize transition-colors",
                            a.status === s
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/70",
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {a.phone_number ? (
                      <div className="flex items-center gap-1.5">
                        <Select
                          value={pickedWorkflow[a.id] ?? ""}
                          onValueChange={(v) => setPickedWorkflow((m) => ({ ...m, [a.id]: v }))}
                        >
                          <SelectTrigger className="h-8 w-[160px] text-xs">
                            <Workflow className="mr-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <SelectValue placeholder="Assign…" />
                          </SelectTrigger>
                          <SelectContent>
                            {workflows.length === 0 ? (
                              <SelectItem value="__none" disabled>
                                No workflows
                              </SelectItem>
                            ) : (
                              workflows.map((w) => (
                                <SelectItem key={w.id} value={w.id}>
                                  {w.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 px-2 text-xs"
                          disabled={!pickedWorkflow[a.id] || trigger.isPending}
                          onClick={() =>
                            trigger.mutate({ workflowId: pickedWorkflow[a.id], phone: a.phone_number! })
                          }
                        >
                          <Zap className="h-3.5 w-3.5" /> Trigger
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
                </HoverCardTrigger>
                <HoverCardContent side="top" align="start" className="w-96 max-h-80 overflow-y-auto">
                  <p className="mb-2 text-xs font-semibold">
                    Lead history · {tpCount} touchpoint{tpCount === 1 ? "" : "s"}
                  </p>
                  {hist.length === 0 && <p className="text-xs text-muted-foreground">No history logged yet.</p>}
                  <div className="space-y-2">
                    {hist.slice(0, 30).map((n) => (
                      <div key={n.id} className="rounded-md border bg-muted/30 p-2 text-xs">
                        <div className="mb-0.5 flex justify-between gap-2 text-[10px] text-muted-foreground">
                          <span>{n.author_label ?? "Agent"}</span>
                          <span>{new Date(n.created_at).toLocaleString()}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{n.body}</p>
                      </div>
                    ))}
                  </div>
                </HoverCardContent>
                </HoverCard>
                );
              })}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grouped.map(([date, items]) => (
            <div key={date} className="rounded-2xl border bg-card p-4 shadow-card">
              <div className="mb-3 flex items-center gap-2 border-b pb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-semibold">{date}</span>
              </div>
              <div className="space-y-2">
                {items.map((a) => (
                  <div key={a.id} className="rounded-lg bg-muted/40 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{a.lead_name ?? a.phone_number ?? "Lead"}</span>
                      <StatusBadge status={a.status} />
                    </div>
                    <p className="mt-1 text-xs capitalize text-muted-foreground">{a.appointment_type}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {grouped.length === 0 && (
            <p className="col-span-full py-12 text-center text-muted-foreground">No bookings found.</p>
          )}
        </div>
      )}
    </div>
  );
}
