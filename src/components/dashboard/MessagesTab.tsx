import { useMemo, useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Search,
  MessageSquare,
  Bot,
  User,
  UserCog,
  Send,
  Clock,
  X,
  Loader2,
  Pause,
  Play,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  listMessages,
  listConversations,
  sendHumanMessage,
  scheduleMessage,
  listScheduledMessages,
  cancelScheduledMessage,
  toggleHumanTakeover,
  listWorkflowStates,
  pauseLeadWorkflow,
  listWorkspaces,
  startConversation,
} from "@/lib/dashboard.functions";
import { cn } from "@/lib/utils";

/** Compare phone numbers by their digits only, ignoring +, spaces, dashes, etc. */
const digitsOnly = (p: string) => (p ?? "").replace(/\D/g, "");

/** Render a short snippet of `text` centered on the first match of `term`, with the match highlighted. */
function MatchSnippet({ text, term }: { text: string; term: string }) {
  const q = term.trim();
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;
  const start = Math.max(0, idx - 24);
  const end = Math.min(text.length, idx + q.length + 40);
  const before = (start > 0 ? "…" : "") + text.slice(start, idx);
  const match = text.slice(idx, idx + q.length);
  const after = text.slice(idx + q.length, end) + (end < text.length ? "…" : "");
  return (
    <>
      {before}
      <mark className="rounded bg-accent/40 px-0.5 text-accent-foreground">{match}</mark>
      {after}
    </>
  );
}

interface Workspace {
  id: string;
  name?: string | null;
  is_default?: boolean | null;
}

interface Message {
  id: string;
  phone_number: string;
  message_content: string;
  sender: string;
  received_at: string;
}

interface Conversation {
  phone_number: string;
  human_takeover: boolean;
  status: string;
}

interface Scheduled {
  id: string;
  phone_number: string;
  message_content: string;
  scheduled_for: string;
  status: string;
}

interface MessagesTabProps {
  pendingConversation?: string | null;
  onPendingHandled?: () => void;
}

export function MessagesTab({ pendingConversation, onPendingHandled }: MessagesTabProps = {}) {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const canPause = profile.role === "super_admin" || profile.role === "admin";
  const msgFn = useServerFn(listMessages);
  const convFn = useServerFn(listConversations);
  const schedFn = useServerFn(listScheduledMessages);
  const sendFn = useServerFn(sendHumanMessage);
  const scheduleFn = useServerFn(scheduleMessage);
  const cancelFn = useServerFn(cancelScheduledMessage);
  const takeoverFn = useServerFn(toggleHumanTakeover);
  const statesFn = useServerFn(listWorkflowStates);
  const pauseFn = useServerFn(pauseLeadWorkflow);
  const workspacesFn = useServerFn(listWorkspaces);
  const startFn = useServerFn(startConversation);

  const { data: msgData } = useQuery({ queryKey: ["messages"], queryFn: () => msgFn(), refetchInterval: 5000 });
  const { data: convData } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => convFn(),
    refetchInterval: 5000,
  });
  const { data: schedData } = useQuery({
    queryKey: ["scheduled"],
    queryFn: () => schedFn(),
    refetchInterval: 10000,
  });
  const { data: statesData } = useQuery({
    queryKey: ["workflow-states"],
    queryFn: () => statesFn(),
    refetchInterval: 8000,
    enabled: canPause,
  });
  const { data: workspacesData } = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => workspacesFn(),
  });

  const [search, setSearch] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // New-conversation dialog state.
  const [newOpen, setNewOpen] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [newWorkspace, setNewWorkspace] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const messages = (msgData?.messages ?? []) as Message[];
  const conversations = (convData?.conversations ?? []) as Conversation[];
  const scheduled = (schedData?.scheduled ?? []) as Scheduled[];
  const workspaces = (workspacesData?.workspaces ?? []) as unknown as Workspace[];

  const grouped = useMemo(() => {
    const map = new Map<string, Message[]>();
    for (const m of messages) {
      if (!map.has(m.phone_number)) map.set(m.phone_number, []);
      map.get(m.phone_number)!.push(m);
    }
    return Array.from(map.entries())
      .map(([phone, msgs]) => ({ phone, msgs, last: msgs[msgs.length - 1] }))
      .sort((a, b) => new Date(b.last.received_at).getTime() - new Date(a.last.received_at).getTime());
  }, [messages]);

  const filteredConvs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return grouped.map((c) => ({ ...c, matchMsg: null as Message | null }));
    return grouped
      .map((c) => {
        const phoneMatch = c.phone.toLowerCase().includes(q);
        // Find the most recent message whose body contains the search term.
        const matchMsg =
          [...c.msgs].reverse().find((m) => m.message_content?.toLowerCase().includes(q)) ?? null;
        if (!phoneMatch && !matchMsg) return null;
        return { ...c, matchMsg };
      })
      .filter((c): c is (typeof grouped)[number] & { matchMsg: Message | null } => c !== null);
  }, [grouped, search]);

  // When another tab requests a conversation, open it (works on mobile too).
  // Match on digits so it opens regardless of how the phone is formatted in
  // leads/contacts vs. the message records.
  useEffect(() => {
    if (!pendingConversation) return;
    const target = digitsOnly(pendingConversation);
    const match = grouped.find((c) => digitsOnly(c.phone) === target);
    setActive(match ? match.phone : pendingConversation);
    onPendingHandled?.();
  }, [pendingConversation, grouped, onPendingHandled]);

  useEffect(() => {
    // On desktop auto-open the most recent conversation. On mobile keep the list
    // visible until the user taps a conversation.
    if (!active && !isMobile && filteredConvs.length) setActive(filteredConvs[0].phone);
  }, [filteredConvs, active, isMobile]);

  const activeDigits = active ? digitsOnly(active) : null;
  const activeMsgs = grouped.find((c) => digitsOnly(c.phone) === activeDigits)?.msgs ?? [];
  const activeConv = conversations.find((c) => digitsOnly(c.phone_number) === activeDigits);
  const takeover = activeConv?.human_takeover ?? false;
  const activeScheduled = scheduled.filter((s) => s.phone_number === active && s.status === "pending");
  const workflowState =
    (statesData?.states ?? []).find(
      (s: { phone_number: string }) => s.phone_number === active,
    )?.status as "active" | "paused" | undefined;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMsgs.length, active]);

  const send = useMutation({
    mutationFn: (message: string) => sendFn({ data: { phone: active!, message } }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error?: string };
      if (res.ok) {
        toast.success("Message sent");
      } else {
        toast.warning(res.error ?? "Sent but delivery may have failed");
      }
      setDraft("");
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => toast.error("Failed to send"),
  });

  const schedule = useMutation({
    mutationFn: (vars: { message: string; scheduledFor: string }) =>
      scheduleFn({ data: { phone: active!, message: vars.message, scheduledFor: vars.scheduledFor } }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error?: string };
      if (res.ok) {
        toast.success("Message scheduled");
        setScheduleOpen(false);
        setDraft("");
        setScheduleAt("");
        qc.invalidateQueries({ queryKey: ["scheduled"] });
      } else {
        toast.error(res.error ?? "Failed to schedule");
      }
    },
    onError: () => toast.error("Failed to schedule"),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => cancelFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Scheduled message cancelled");
      qc.invalidateQueries({ queryKey: ["scheduled"] });
    },
    onError: () => toast.error("Failed to cancel"),
  });

  const startConv = useMutation({
    mutationFn: (vars: { phone: string; name: string; workspaceId: string; message: string }) =>
      startFn({
        data: {
          phone: vars.phone,
          name: vars.name || undefined,
          workspaceId: vars.workspaceId || undefined,
          message: vars.message,
        },
      }),
    onSuccess: (r, vars) => {
      const res = r as { ok: boolean; error?: string };
      if (!res.ok) {
        toast.error(res.error ?? "Failed to start conversation");
        return;
      }
      toast.success("Conversation started");
      setNewOpen(false);
      setNewPhone("");
      setNewName("");
      setNewWorkspace("");
      setNewMessage("");
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["contacts"] });
      setActive(vars.phone);
    },
    onError: () => toast.error("Failed to start conversation"),
  });


  const toggleTakeover = useMutation({
    mutationFn: (enabled: boolean) => takeoverFn({ data: { phone: active!, enabled } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => toast.error("Failed to update"),
  });

  const pauseWorkflow = useMutation({
    mutationFn: (paused: boolean) => pauseFn({ data: { phone: active!, paused } }),
    onSuccess: (res, paused) => {
      if ((res as { ok: boolean }).ok) {
        qc.invalidateQueries({ queryKey: ["workflow-states"] });
        toast.success(paused ? "Workflow paused for this lead" : "Workflow resumed");
      } else {
        toast.error((res as { error?: string }).error ?? "Failed to update workflow");
      }
    },
    onError: () => toast.error("Failed to update workflow"),
  });

  function handleSend() {
    const text = draft.trim();
    if (!text || !active) return;
    send.mutate(text);
  }

  return (
    <div className="grid h-[82vh] grid-cols-1 gap-4 md:h-[80vh] md:grid-cols-[300px_1fr]">
      {/* List */}
      <div
        className={cn(
          "flex-col overflow-hidden rounded-2xl border bg-card shadow-card md:flex",
          active ? "hidden" : "flex",
        )}
      >
        <div className="space-y-2 border-b p-3">
          <Button size="sm" className="w-full gap-1.5" onClick={() => setNewOpen(true)}>
            <Plus className="h-4 w-4" /> New conversation
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search number or message…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConvs.map((c) => {
            const conv = conversations.find((x) => x.phone_number === c.phone);
            return (
              <button
                key={c.phone}
                onClick={() => setActive(c.phone)}
                className={cn(
                  "flex w-full flex-col gap-0.5 border-b px-4 py-3 text-left transition-colors hover:bg-muted/40",
                  active === c.phone && "bg-primary/5",
                )}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {c.phone}
                  {conv?.human_takeover && (
                    <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-accent-foreground">
                      Human
                    </span>
                  )}
                </span>
                <span className="line-clamp-1 text-xs text-muted-foreground">{c.last.message_content}</span>
              </button>
            );
          })}
          {filteredConvs.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">No conversations.</p>
          )}
        </div>
      </div>

      {/* Timeline + composer */}
      <div
        className={cn(
          "flex-col overflow-hidden rounded-2xl border bg-card shadow-card md:flex",
          active ? "flex" : "hidden md:flex",
        )}
      >
        {active ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
              <span className="flex min-w-0 items-center gap-2 font-semibold">
                <button
                  onClick={() => setActive(null)}
                  className="md:hidden"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                </button>
                <MessageSquare className="hidden h-4 w-4 text-primary md:block" />
                <span className="truncate">{active}</span>
              </span>
              <div className="flex items-center gap-3">
                {canPause && workflowState && (
                  <Button
                    size="sm"
                    variant={workflowState === "paused" ? "default" : "outline"}
                    className="h-7 gap-1 px-2 text-xs"
                    disabled={pauseWorkflow.isPending}
                    onClick={() => pauseWorkflow.mutate(workflowState !== "paused")}
                  >
                    {workflowState === "paused" ? (
                      <Play className="h-3.5 w-3.5" />
                    ) : (
                      <Pause className="h-3.5 w-3.5" />
                    )}
                    {workflowState === "paused" ? "Resume workflow" : "Pause workflow"}
                  </Button>
                )}
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  {takeover ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  AI {takeover ? "paused" : "active"}
                  <Switch
                    checked={!takeover}
                    onCheckedChange={(v) => toggleTakeover.mutate(!v)}
                    disabled={toggleTakeover.isPending}
                  />
                </label>
              </div>
            </div>


            {/* Scheduled banner */}
            {activeScheduled.length > 0 && (
              <div className="space-y-1 border-b bg-muted/30 px-4 py-2">
                {activeScheduled.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="line-clamp-1">{s.message_content}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-muted-foreground">{new Date(s.scheduled_for).toLocaleString()}</span>
                      <button onClick={() => cancel.mutate(s.id)} className="text-destructive hover:opacity-70">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {activeMsgs.map((m) => {
                const isLead = m.sender === "lead";
                const isHuman = m.sender === "agent" || m.sender === "human";
                return (
                  <div key={m.id} className={cn("flex", isLead ? "justify-start" : "justify-end")}>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                        isLead
                          ? "bg-muted text-foreground"
                          : isHuman
                            ? "bg-accent text-accent-foreground"
                            : "bg-primary text-primary-foreground",
                      )}
                    >
                      <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase opacity-70">
                        {isLead ? (
                          <>
                            <User className="h-3 w-3" /> Student
                          </>
                        ) : isHuman ? (
                          <>
                            <UserCog className="h-3 w-3" /> Agent
                          </>
                        ) : (
                          <>
                            <Bot className="h-3 w-3" /> AI
                          </>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap">{m.message_content}</p>
                      <p className="mt-1 text-right text-[10px] opacity-60">
                        {new Date(m.received_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Composer */}
            <div className="border-t p-3">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a reply…  (⌘/Ctrl + Enter to send)"
                rows={2}
                className="resize-none"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-[11px] text-muted-foreground">
                  Sending pauses the AI for this conversation.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScheduleOpen(true)}
                    disabled={!draft.trim()}
                  >
                    <Clock className="mr-1 h-4 w-4" /> Schedule
                  </Button>
                  <Button size="sm" onClick={handleSend} disabled={!draft.trim() || send.isPending}>
                    {send.isPending ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-1 h-4 w-4" />
                    )}
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">Select a conversation</div>
        )}
      </div>

      {/* Schedule dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule message</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Message to send later…"
              rows={3}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Send at</label>
              <Input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setScheduleOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!draft.trim() || !scheduleAt) {
                  toast.error("Enter a message and time");
                  return;
                }
                schedule.mutate({
                  message: draft.trim(),
                  scheduledFor: new Date(scheduleAt).toISOString(),
                });
              }}
              disabled={schedule.isPending}
            >
              {schedule.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Clock className="mr-1 h-4 w-4" />}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New conversation dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start new conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone number</label>
              <Input
                placeholder="e.g. +15551234567"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name (optional)</label>
              <Input
                placeholder="Lead name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Send through workspace</label>
              <Select value={newWorkspace} onValueChange={setNewWorkspace}>
                <SelectTrigger>
                  <SelectValue placeholder="Default workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name ?? "Unnamed"}
                      {w.is_default ? " (default)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">First message</label>
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type the first message…"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!newPhone.trim() || !newMessage.trim()) {
                  toast.error("Enter a phone number and message");
                  return;
                }
                startConv.mutate({
                  phone: newPhone.trim(),
                  name: newName.trim(),
                  workspaceId: newWorkspace,
                  message: newMessage.trim(),
                });
              }}
              disabled={startConv.isPending}
            >
              {startConv.isPending ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-1 h-4 w-4" />
              )}
              Start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
