import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Users, GraduationCap, Calendar, MessageSquare } from "lucide-react";
import { getDashboardStats } from "@/lib/dashboard.functions";

const CARDS = [
  { key: "leads", label: "Total Leads", icon: Users, color: "text-primary bg-primary/10" },
  { key: "qualified", label: "Qualified", icon: GraduationCap, color: "text-success bg-success/15" },
  { key: "bookings", label: "Bookings", icon: Calendar, color: "text-accent-foreground bg-accent/20" },
  { key: "messages", label: "Messages", icon: MessageSquare, color: "text-primary bg-chart-4/15" },
] as const;

export function DashboardStats() {
  const fn = useServerFn(getDashboardStats);
  const { data } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fn(),
    refetchInterval: 5000,
  });

  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
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
  );
}
