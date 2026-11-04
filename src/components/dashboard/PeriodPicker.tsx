import { useMemo } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const PERIODS = [
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

export function rangeFor(period: string, from: string, to: string): { from: string | null; to: string | null } {
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


/** Persistent period selection (per storage key) resolved to ISO from/to. */
export function usePeriodRange(key: string, initial = "all") {
  const [period, setPeriod] = usePersistentState<string>(`${key}.period`, initial);
  const [from, setFrom] = usePersistentState<string>(`${key}.from`, "");
  const [to, setTo] = usePersistentState<string>(`${key}.to`, "");
  const range = useMemo(() => rangeFor(period, from, to), [period, from, to]);
  return { period, setPeriod, from, setFrom, to, setTo, range };
}

export function PeriodPicker({ state }: { state: ReturnType<typeof usePeriodRange> }) {
  const { period, setPeriod, from, setFrom, to, setTo } = state;
  return (
    <div className="flex flex-wrap items-center gap-2">
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
  );
}
