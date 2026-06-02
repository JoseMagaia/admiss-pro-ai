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
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {CARDS.map((c) => (
        <div key={c.key} className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-4 font-display text-3xl font-bold">
            {data ? (data as Record<string, number>)[c.key] : "—"}
          </p>
          <p className="text-sm text-muted-foreground">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
