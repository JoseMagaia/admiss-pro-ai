import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Sparkles,
  FileText,
  FileDown,
  Loader2,
  TrendingUp,
  Users,
  DollarSign,
  MessageSquare,
  Star,
  Plus,
  Trash2,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  getReportDashboard,
  generateChatReply,
  listConversations,
  saveConversation,
  deleteConversation,
} from "@/lib/advanced.functions";
import {
  markdownToHtml,
  downloadReportAsWord,
  downloadReportAsPdf,
} from "@/lib/markdown";

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

type ChatMsg = { role: "user" | "assistant"; content: string };
type SavedConversation = { id: string; title: string; messages: ChatMsg[]; updated_at: string };

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

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="h-56">{children}</div>
    </div>
  );
}

// Turn a saved conversation into a Markdown report for Word/PDF export.
function conversationToMarkdown(title: string, messages: ChatMsg[]): string {
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

function deriveTitle(messages: ChatMsg[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  const t = (firstUser?.content ?? "Conversation").trim().replace(/\s+/g, " ");
  return t.length > 70 ? `${t.slice(0, 67)}…` : t;
}

export function ReportsTab() {
  const queryClient = useQueryClient();
  const dashFn = useServerFn(getReportDashboard);
  const chatFn = useServerFn(generateChatReply);
  const listFn = useServerFn(listConversations);
  const saveFn = useServerFn(saveConversation);
  const deleteFn = useServerFn(deleteConversation);

  const { data: dashData } = useQuery({
    queryKey: ["report-dashboard"],
    queryFn: () => dashFn(),
    refetchInterval: 30000,
  });
  const analytics = (dashData?.analytics ?? null) as Analytics | null;

  const { data: convData } = useQuery({
    queryKey: ["report-conversations"],
    queryFn: () => listFn(),
  });
  const favorites = (convData?.conversations ?? []) as unknown as SavedConversation[];

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [days, setDays] = useState(30);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  const focusInput = () => requestAnimationFrame(() => inputRef.current?.focus());
  useEffect(() => {
    focusInput();
  }, []);
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const chat = useMutation({
    mutationFn: (msgs: ChatMsg[]) => chatFn({ data: { messages: msgs, days } }),
    onSuccess: (r) => {
      const res = r as { reply: string; error: string | null };
      if (res.error || !res.reply) {
        toast.error(res.error ?? "No response generated");
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    },
    onError: () => toast.error("Failed to get a response"),
    onSettled: () => focusInput(),
  });

  const send = (text: string) => {
    const content = text.trim();
    if (!content || chat.isPending) return;
    const next: ChatMsg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    chat.mutate(next);
  };

  const save = useMutation({
    mutationFn: () =>
      saveFn({
        data: { id: activeId ?? undefined, title: deriveTitle(messages), messages },
      }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; id: string | null; error: string | null };
      if (!res.ok) {
        toast.error(res.error ?? "Could not save conversation");
        return;
      }
      if (res.id) setActiveId(res.id);
      toast.success("Saved to favorites");
      queryClient.invalidateQueries({ queryKey: ["report-conversations"] });
    },
    onError: () => toast.error("Could not save conversation"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: (r, id) => {
      const res = r as { ok: boolean; error: string | null };
      if (!res.ok) {
        toast.error(res.error ?? "Could not delete");
        return;
      }
      if (activeId === id) {
        setActiveId(null);
        setMessages([]);
      }
      queryClient.invalidateQueries({ queryKey: ["report-conversations"] });
    },
    onError: () => toast.error("Could not delete"),
  });

  const startNew = () => {
    setActiveId(null);
    setMessages([]);
    setInput("");
    focusInput();
  };

  const loadFavorite = (c: SavedConversation) => {
    setActiveId(c.id);
    setMessages(Array.isArray(c.messages) ? c.messages : []);
    focusInput();
  };

  const hasConversation = messages.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Favorites sidebar */}
        <div className="rounded-2xl border bg-card p-3 shadow-card lg:max-h-[640px] lg:overflow-y-auto">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold">Favorites</h3>
            </div>
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={startNew}>
              <Plus className="mr-1 h-3.5 w-3.5" /> New
            </Button>
          </div>
          {favorites.length === 0 ? (
            <p className="px-1 py-6 text-center text-xs text-muted-foreground">
              Save conversations here to revisit and download them later.
            </p>
          ) : (
            <div className="space-y-1.5">
              {favorites.map((c) => (
                <div
                  key={c.id}
                  className={`group rounded-lg border p-2 transition-colors ${
                    activeId === c.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => loadFavorite(c)}
                    className="block w-full text-left"
                  >
                    <p className="line-clamp-2 text-xs font-medium">{c.title}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {new Date(c.updated_at).toLocaleDateString()} · {c.messages?.length ?? 0} messages
                    </p>
                  </button>
                  <div className="mt-1.5 flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1.5 text-[10px]"
                      onClick={() => downloadReportAsWord(c.title, conversationToMarkdown(c.title, c.messages ?? []))}
                    >
                      <FileText className="mr-0.5 h-3 w-3" /> Word
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1.5 text-[10px]"
                      onClick={() => downloadReportAsPdf(c.title, conversationToMarkdown(c.title, c.messages ?? []))}
                    >
                      <FileDown className="mr-0.5 h-3 w-3" /> PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => remove.mutate(c.id)}
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversational generator */}
        <div className="flex min-h-[480px] flex-col rounded-2xl border bg-card shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-display text-lg font-semibold leading-tight">AI Insights Generator</h2>
                <p className="text-xs text-muted-foreground">
                  Chat with your live analytics — ask follow-ups, then save to favorites.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                Timeframe
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                  <option value={365}>12 months</option>
                </select>
              </label>
              {hasConversation && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => save.mutate()}
                  disabled={save.isPending}
                >
                  {save.isPending ? (
                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Star className="mr-1 h-3.5 w-3.5 text-amber-500" />
                  )}
                  {activeId ? "Update favorite" : "Save to favorites"}
                </Button>
              )}
            </div>
          </div>

          {/* Thread */}
          <div ref={threadRef} className="flex-1 space-y-4 overflow-y-auto p-4 lg:max-h-[440px]">
            {!hasConversation && (
              <div className="py-6">
                <p className="mb-3 text-sm text-muted-foreground">
                  Start a conversation about your platform data. Try one of these:
                </p>
                <div className="flex flex-wrap gap-2">
                  {PROMPT_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, idx) =>
              m.role === "user" ? (
                <div key={idx} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={idx} className="flex justify-start">
                  <div
                    className="prose-report max-w-[90%] rounded-2xl rounded-bl-sm border bg-background px-4 py-3 text-sm"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(m.content) }}
                  />
                </div>
              ),
            )}

            {chat.isPending && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analysing your data…
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t p-3">
            <div className="flex items-end gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask a question about your analytics…"
                className="min-h-[44px] flex-1 resize-none"
                rows={1}
              />
              <Button onClick={() => send(input)} disabled={chat.isPending || !input.trim()} size="icon" className="h-11 w-11 shrink-0">
                {chat.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
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
