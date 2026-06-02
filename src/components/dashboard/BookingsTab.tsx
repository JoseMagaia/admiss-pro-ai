import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Calendar, List, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "./StageBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listAppointments, updateAppointmentStatus } from "@/lib/dashboard.functions";
import { APPOINTMENT_STATUSES } from "@/lib/pipeline";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  phone_number: string | null;
  lead_name: string | null;
  appointment_date: string | null;
  appointment_type: string;
  status: string;
  notes: string | null;
}

export function BookingsTab() {
  const qc = useQueryClient();
  const fn = useServerFn(listAppointments);
  const updateFn = useServerFn(updateAppointmentStatus);
  const [view, setView] = useState<"list" | "calendar">("list");

  const { data } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => fn(),
    refetchInterval: 5000,
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; status: (typeof APPOINTMENT_STATUSES)[number]; appointment_date?: string | null }) =>
      updateFn({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Booking updated");
    },
    onError: () => toast.error("Update failed"),
  });

  const appointments = (data?.appointments ?? []) as Appointment[];

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
      <div className="flex items-center gap-2">
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
      </div>

      {view === "list" ? (
        <div className="overflow-x-auto rounded-2xl border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Lead</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{a.lead_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.phone_number ?? "—"}</td>
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
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No bookings yet.
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
            <p className="col-span-full py-12 text-center text-muted-foreground">No bookings yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
