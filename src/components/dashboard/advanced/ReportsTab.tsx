import { useMemo, useState, type ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Sparkles, FileText, FileDown, Loader2, TrendingUp, Users, DollarSign, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getReportDashboard, generateReport } from "@/lib/advanced.functions";
import { markdownToHtml, downloadReportAsWord, downloadReportAsPdf } from "@/lib/markdown";

interface Analytics {
  rangeDays: number;
  totals: { leads: number; qualified: number; disqualified: number; bookings: number; messages: number; offers: number };
  opportunityTotals: { valuation: number; liquidity: number; count: number };
  stageDistribution: { id: string; label: string; count: number }[];
  leadsByDay: { date: string; count: number }[];
  messagesByDay: { date: string; count: number }[];
  messagesByHour: { hour: number; count: number }[];
  topCourses: { name: string; count: number }[];
  topCountries: { name: string; count: number }[];
}

const PROMPT_SUGGESTIONS = [
  "Summarise lead volume trends and where leads drop off in the pipeline.",
  "When are students most active? Recommend the best times to message.",
  "Analyse qualification vs disqualification and how to improve revenue.",
  "Which courses and destinations drive the most qualified leads?",
];

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Users; label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-card">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-xl font-bold leading-none">{value}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="h-56">{children}</div>
    </div>
  );
}

export function ReportsTab() {
  const dashFn = useServerFn(getReportDashboard);
  const genFn = useServerFn(generateReport);

  const { data } = useQuery({
    queryKey: ["report-dashboard"],
    queryFn: () => dashFn(),
    refetchInterval: 30000,
  });
  const analytics = (data?.analytics ?? null) as Analytics | null;

  const [prompt, setPrompt] = useState("");
  const [days, setDays] = useState(30);
  const [report, setReport] = useState("");

  const generate = useMutation({
    mutationFn: () => genFn({ data: { prompt, days } }),
    onSuccess: (r) => {
      const res = r as { report: string; error: string | null };
      if (res.error || !res.report) return toast.error(res.error ?? "No report generated");
      setReport(res.report);
    },
    onError: () => toast.error("Failed to generate report"),
  });

  const reportHtml = useMemo(() => (report ? markdownToHtml(report) : ""), [report]);

  const title = "Admissions Insights Report";

  return (
    <div className="space-y-6">
      {/* AI report generator */}
      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">AI Insights Generator</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask anything about your platform data — lead volumes, message trends, qualification patterns and revenue
          recommendations. The report is generated from your live analytics.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {PROMPT_SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setPrompt(s)}
              className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>

        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What would you like to analyse?"
          className="mt-3 min-h-[90px]"
        />

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Timeframe
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last 12 months</option>
            </select>
          </label>
          <Button onClick={() => generate.mutate()} disabled={generate.isPending || !prompt.trim()}>
            {generate.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />}
            Generate Report
          </Button>
          {report && (
            <>
              <Button variant="outline" onClick={() => downloadReportAsWord(title, report)}>
                <FileText className="mr-1 h-4 w-4" /> Word
              </Button>
              <Button variant="outline" onClick={() => downloadReportAsPdf(title, report)}>
                <FileDown className="mr-1 h-4 w-4" /> PDF
              </Button>
            </>
          )}
        </div>

        {report && (
          <div
            className="prose-report mt-5 max-w-none rounded-xl border bg-background p-5 text-sm"
            dangerouslySetInnerHTML={{ __html: reportHtml }}
          />
        )}
      </div>

      {/* Fixed analytics dashboard */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Analytics Overview</h2>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          <Stat icon={Users} label="Total Leads" value={String(analytics?.totals.leads ?? "—")} tone="bg-primary/10 text-primary" />
          <Stat icon={TrendingUp} label="Qualified" value={String(analytics?.totals.qualified ?? "—")} tone="bg-success/15 text-success" />
          <Stat icon={MessageSquare} label="Messages" value={String(analytics?.totals.messages ?? "—")} tone="bg-chart-4/15 text-primary" />
          <Stat icon={FileText} label="Bookings" value={String(analytics?.totals.bookings ?? "—")} tone="bg-accent/20 text-accent-foreground" />
          <Stat
            icon={DollarSign}
            label="Pipeline Value"
            value={analytics ? analytics.opportunityTotals.valuation.toLocaleString() : "—"}
            tone="bg-success/15 text-success"
          />
          <Stat
            icon={DollarSign}
            label="Expected Liquidity"
            value={analytics ? analytics.opportunityTotals.liquidity.toLocaleString() : "—"}
            tone="bg-primary/10 text-primary"
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <ChartCard title={`Leads per day (last ${analytics?.rangeDays ?? 14} days)`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.leadsByDay ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => String(d).slice(5)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Messages by hour (activity moments)">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.messagesByHour ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--chart-3)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Pipeline stage distribution">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.stageDistribution ?? []} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 9 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--chart-2)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title={`Messages per day (last ${analytics?.rangeDays ?? 14} days)`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.messagesByDay ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => String(d).slice(5)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="var(--chart-5)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
