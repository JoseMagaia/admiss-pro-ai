import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Users, GraduationCap, Calendar, MessageSquare, UserX, UserCheck } from "lucide-react";
import { getDashboardStats } from "@/lib/dashboard.functions";
import { usePersistentState } from "@/hooks/usePersistentState";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CARDS = [
  { key: "leads", label: "Total Leads", icon: Users, color: "text-primary bg-primary/10" },
  { key: "qualified", label: "Qualified", icon: GraduationCap, color: "text-success bg-success/15" },
  { key: "bookings", label: "Bookings", icon: Calendar, color: "text-accent-foreground bg-accent/20" },
  { key: "messages", label: "Messages", icon: MessageSquare, color: "text-primary bg-chart-4/15" },
  { key: "onboarding", label: "Onboarding", icon: UserCheck, color: "text-success bg-chart-2/15" },
  { key: "disqualified", label: "Disqualified", icon: UserX, color: "text-destructive bg-destructive/10" },
] as const;

const PERIODS = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "month", label: "This month" },
  { id: "last_month", label: "Last month" },
  { id: "year", label: "This year" },
  { id: "custom", label: "Custom range" },
] as const;

function rangeFor(period: string, from: string, to: string): { from: string | null; to: string | null } {
  const now = new Date();
  const sod = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = 86400000;
  switch (period) {
    case "today": return { from: sod(now).toISOString(), to: null };
    case "yesterday": {
      const t = sod(now);
      return { from: new Date(t.getTime() - day).toISOString(), to: new Date(t.getTime() - 1).toISOString() };
    }
    case "7d": return { from: new Date(now.getTime() - 7 * day).toISOString(), to: null };
    case "30d": return { from: new Date(now.getTime() - 30 * day).toISOString(), to: null };
    case "90d": return { from: new Date(now.getTime() - 90 * day).toISOString(), to: null };
    case "month": return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), to: null };
    case "last_month": return {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
      to: new Date(new Date(now.getFullYear(), now.getMonth(), 1).getTime() - 1).toISOString(),
    };
    case "year": return { from: new Date(now.getFullYear(), 0, 1).toISOString(), to: null };
    case "custom": return {
      from: from ? new Date(`${from}T00:00:00`).toISOString() : null,
      to: to ? new Date(`${to}T23:59:59.999`).toISOString() : null,
    };
    default: return { from: null, to: null };
  }
}

export function DashboardStats() {
  const fn = useServerFn(getDashboardStats);
  const [period, setPeriod] = usePersistentState<string>("stats.period", "all");
  const [from, setFrom] = usePersistentState<string>("stats.from", "");
  const [to, setTo] = usePersistentState<string>("stats.to", "");
  const range = useMemo(() => rangeFor(period, from, to), [period, from, to]);
  const { data } = useQuery({
    queryKey: ["dashboard-stats", range.from, range.to],
    queryFn: () => fn({ data: range }),
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="h-8 w-[150px] text-xs" aria-label="Summary period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>
        {period === "custom" && (
          <>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-8 w-[145px] text-xs" aria-label="From date" />
            <span className="text-xs text-muted-foreground">to</span>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-8 w-[145px] text-xs" aria-label="To date" />
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {CARDS.map((c) => (
          <div key={c.key} className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-card">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${c.color}`}>
              <c.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-xl font-bold leading-none">
                {data ? (data as Record<string, number>)[c.key] : "—"}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{c.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
