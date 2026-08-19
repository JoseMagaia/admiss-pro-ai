import { useMemo, useState, useEffect, useRef } from "react";
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Paperclip,
  Mic,
  StopCircle,
  Image as ImageIcon,
  FileText,
  Check,
  CheckCheck,
  AlertCircle,
  RefreshCw,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import { toast } from "sonner";
import { getSettings } from "@/lib/dashboard.functions";
import { resolveAudioFormat } from "@/lib/audio/formats";
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
import { LeadPanel } from "@/components/dashboard/messages/LeadPanel";
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
  listMessageThreads,
  syncInbox,
  listConversationMessages,
  sendHumanMessage,
  scheduleMessage,
  listScheduledMessages,
  cancelScheduledMessage,
  toggleHumanTakeover,
  listWorkflowStates,
  pauseLeadWorkflow,
  listWorkspaces,
  startConversation,
  uploadMessageAttachment,
} from "@/lib/dashboard.functions";
import { LeadWorkflowManager } from "./LeadWorkflowManager";
import { ConversationTickets } from "./tickets/ConversationTickets";
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
  attachment_url?: string | null;
  attachment_path?: string | null;
  attachment_mime?: string | null;
  attachment_kind?: string | null;
  delivery_status?: string | null;
  delivered_at?: string | null;
  read_at?: string | null;
  delivery_error?: string | null;
}

interface Conversation {
  phone_number: string;
  human_takeover: boolean;
  status: string;
  workspace_id?: string | null;
}

interface MessageThread {
  phone_number: string;
  lead_name: string | null;
  human_takeover: boolean | null;
  status: string | null;
  conversation_updated_at: string | null;
  last_message_content: string | null;
  last_message_at: string | null;
  last_sender: string | null;
  match_message_content: string | null;
  match_message_at: string | null;
  match_sender: string | null;
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
  const threadsFn = useServerFn(listMessageThreads);
  const threadMessagesFn = useServerFn(listConversationMessages);
  const schedFn = useServerFn(listScheduledMessages);
  const sendFn = useServerFn(sendHumanMessage);
  const scheduleFn = useServerFn(scheduleMessage);
  const cancelFn = useServerFn(cancelScheduledMessage);
  const takeoverFn = useServerFn(toggleHumanTakeover);
  const statesFn = useServerFn(listWorkflowStates);
  const pauseFn = useServerFn(pauseLeadWorkflow);
  const workspacesFn = useServerFn(listWorkspaces);
  const startFn = useServerFn(startConversation);
  const syncFn = useServerFn(syncInbox);

  // Audio format enabled by the super admin (Settings → Audio).
  const settingsFn = useServerFn(getSettings);
  const { data: settingsData } = useQuery({ queryKey: ["settings"], queryFn: () => settingsFn() });
  const audioFormat = resolveAudioFormat(
    (settingsData?.settings as { audio_delivery_format?: string } | null)?.audio_delivery_format,
  );


  // Pull history from the connected Chatwoot inbox(es) into the timeline.
  const syncMutation = useMutation({
    mutationFn: () => syncFn(),
    onSuccess: (res) => {
      const r = res as { imported?: number; error?: string | null; reports?: Array<{ error?: string; skipped?: string }> };
      if (r.error) {
        toast.error(r.error);
        return;
      }
      const failed = (r.reports ?? []).filter((x) => x.error);
      if (failed.length > 0) toast.warning(failed[0].error ?? "Some inboxes could not be synced");
      else if ((r.imported ?? 0) > 0) toast.success(`Synced ${r.imported} message(s) from the connected inbox`);
      else toast.info("Inbox is already up to date");
      qc.invalidateQueries({ queryKey: ["message-threads"] });
      qc.invalidateQueries({ queryKey: ["conversation-messages"] });
    },
    onError: () => toast.error("Inbox sync failed"),
  });


  const [search, setSearch] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  // Workspace the human agent texts from (empty = lead's default inbox).
  const [sendWorkspace, setSendWorkspace] = useState("");
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

  // Filter which conversations show up in the list.
  type ResponderFilter = "all" | "ai" | "human" | "unread_lead";
  const [responderFilter, setResponderFilter] = useState<ResponderFilter>("all");
  type SortMode = "recent" | "oldest";
  const [sortMode, setSortMode] = useState<SortMode>("recent");

  // Pending attachment for the next outbound message.
  type PendingAttachment = {
    url: string;
    path?: string | null;
    mime: string;
    filename: string;
    kind: "image" | "audio" | "video" | "document";
  };
  const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFn = useServerFn(uploadMessageAttachment);

  // Voice-note recorder state.
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // Right-hand lead context panel (info / notes / history).
  const [panelOpen, setPanelOpen] = useState(true);
  const recordChunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);


  const threadSearch = search.trim();
  const threadPageSize = 30;
  const threadQuery = useInfiniteQuery({
    queryKey: ["message-threads", threadSearch],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      threadsFn({ data: { search: threadSearch, limit: threadPageSize, offset: pageParam } }),
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((sum, page) => sum + (((page as { threads?: unknown[] }).threads ?? []).length), 0);
      return (lastPage as { hasMore?: boolean }).hasMore ? loaded : undefined;
    },
    // Only refresh the first page in the background so paginated results
    // stay stable while the user scrolls; older pages accumulate as the user
    // scrolls further so they can browse all matches without paging clicks.
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
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

  const scheduled = (schedData?.scheduled ?? []) as Scheduled[];
  const workspaces = (workspacesData?.workspaces ?? []) as unknown as Workspace[];

  const rawThreads = useMemo(
    () =>
      (threadQuery.data?.pages ?? []).flatMap(
        (page) => ((page as { threads?: MessageThread[] }).threads ?? []) as MessageThread[],
      ),
    [threadQuery.data],
  );

  const threads = useMemo(() => {
    const filtered = rawThreads.filter((t) => {
      if (responderFilter === "ai" && t.human_takeover) return false;
      if (responderFilter === "human" && !t.human_takeover) return false;
      if (responderFilter === "unread_lead" && t.last_sender !== "lead") return false;
      return true;
    });
    const sorted = [...filtered].sort((a, b) => {
      const at = new Date(a.last_message_at ?? a.conversation_updated_at ?? 0).getTime();
      const bt = new Date(b.last_message_at ?? b.conversation_updated_at ?? 0).getTime();
      return sortMode === "recent" ? bt - at : at - bt;
    });
    return sorted;
  }, [rawThreads, responderFilter, sortMode]);

  // Auto-load additional pages when the sentinel scrolls into view, or when
  // client-side filters hide most of what the server returned.
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          threadQuery.hasNextPage &&
          !threadQuery.isFetchingNextPage
        ) {
          threadQuery.fetchNextPage();
        }
      },
      { root: el.parentElement, rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threadQuery]);
  useEffect(() => {
    if (
      threadQuery.hasNextPage &&
      !threadQuery.isFetchingNextPage &&
      !threadQuery.isFetching &&
      rawThreads.length > 0 &&
      threads.length < threadPageSize &&
      (responderFilter !== "all" || threadSearch.length > 0)
    ) {
      threadQuery.fetchNextPage();
    }
  }, [threads.length, rawThreads.length, responderFilter, threadSearch, threadQuery]);



  const activeDigits = active ? digitsOnly(active) : null;
  const { data: activeData } = useQuery({
    queryKey: ["conversation-messages", activeDigits ?? active],
    queryFn: () => threadMessagesFn({ data: { phone: active!, limit: 1000 } }),
    enabled: Boolean(active),
    refetchInterval: 5000,
  });

  // When another tab requests a conversation, open it (works on mobile too).
  // Match on digits so it opens regardless of how the phone is formatted in
  // leads/contacts vs. the message records.
  useEffect(() => {
    if (!pendingConversation) return;
    const target = digitsOnly(pendingConversation);
    const match = threads.find((c) => digitsOnly(c.phone_number) === target);
    setActive(match ? match.phone_number : pendingConversation);
    onPendingHandled?.();
  }, [pendingConversation, threads, onPendingHandled]);

  useEffect(() => {
    // On desktop auto-open the most recent conversation. On mobile keep the list
    // visible until the user taps a conversation.
    if (!active && !isMobile && threads.length) setActive(threads[0].phone_number);
  }, [threads, active, isMobile]);

  const activeMsgs = ((activeData as { messages?: Message[] } | undefined)?.messages ?? []) as Message[];
  const activeConv = (activeData as { conversation?: Conversation | null } | undefined)?.conversation ?? null;
  const activePhone = (activeData as { phone?: string } | undefined)?.phone ?? active;
  const takeover = activeConv?.human_takeover ?? false;
  const activeScheduled = scheduled.filter((s) => digitsOnly(s.phone_number) === activeDigits && s.status === "pending");
  const workflowState =
    (statesData?.states ?? []).find(
      (s: { phone_number: string }) => digitsOnly(s.phone_number) === activeDigits,
    )?.status as "active" | "paused" | undefined;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMsgs.length, active]);

  // Default the composer's "send from" selector to the conversation's workspace
  // whenever the open conversation (or its stored workspace) changes.
  useEffect(() => {
    setSendWorkspace((activeConv?.workspace_id as string | null) ?? "");
  }, [active, activeConv?.workspace_id]);

  const send = useMutation({
    mutationFn: (message: string) =>
      sendFn({
        data: {
          phone: activePhone!,
          message,
          workspaceId: sendWorkspace || undefined,
          attachment: pendingAttachment
            ? {
                url: pendingAttachment.url,
                mime: pendingAttachment.mime,
                kind: pendingAttachment.kind,
                filename: pendingAttachment.filename,
              }
            : undefined,
        },
      }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error?: string };
      if (res.ok) {
        toast.success("Message sent");
      } else {
        toast.warning(res.error ?? "Sent but delivery may have failed");
      }
      setDraft("");
      setPendingAttachment(null);
      qc.invalidateQueries({ queryKey: ["message-threads"] });
      qc.invalidateQueries({ queryKey: ["conversation-messages"] });
    },
    onError: () => toast.error("Failed to send"),
  });

  const schedule = useMutation({
    mutationFn: (vars: { message: string; scheduledFor: string }) =>
      scheduleFn({ data: { phone: activePhone!, message: vars.message, scheduledFor: vars.scheduledFor } }),
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
      qc.invalidateQueries({ queryKey: ["message-threads"] });
      qc.invalidateQueries({ queryKey: ["conversation-messages"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["contacts"] });
      setActive(vars.phone);
    },
    onError: () => toast.error("Failed to start conversation"),
  });


  const toggleTakeover = useMutation({
    mutationFn: (enabled: boolean) => takeoverFn({ data: { phone: activePhone!, enabled } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["message-threads"] });
      qc.invalidateQueries({ queryKey: ["conversation-messages"] });
    },
    onError: () => toast.error("Failed to update"),
  });

  const pauseWorkflow = useMutation({
    mutationFn: (paused: boolean) => pauseFn({ data: { phone: activePhone!, paused } }),
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
    if (!active) return;
    if (!text && !pendingAttachment) return;
    send.mutate(text);
  }

  async function blobToBase64(blob: Blob): Promise<string> {
    const buf = await blob.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return typeof btoa === "function" ? btoa(binary) : Buffer.from(binary, "binary").toString("base64");
  }

  function classifyKind(mime: string): PendingAttachment["kind"] {
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("audio/")) return "audio";
    if (mime.startsWith("video/")) return "video";
    return "document";
  }

  async function uploadBlob(blob: Blob, filename: string) {
    if (blob.size > 12 * 1024 * 1024) {
      toast.error("File too large (max 12 MB)");
      return;
    }
    setUploading(true);
    try {
      const base64 = await blobToBase64(blob);
      const res = (await uploadFn({
        data: { filename, mime: blob.type || "application/octet-stream", base64 },
      })) as { ok: boolean; url?: string; path?: string; mime?: string; filename?: string; error?: string };
      if (!res.ok || !res.url || !res.mime) {
        toast.error(res.error ?? "Upload failed");
        return;
      }
      setPendingAttachment({
        url: res.url,
        path: res.path,
        mime: res.mime,
        filename: res.filename ?? filename,
        kind: classifyKind(res.mime),
      });
      toast.success("Attachment ready");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await uploadBlob(file, file.name);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function startRecording() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      toast.error("Recording not supported in this browser");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // WhatsApp only accepts ogg/opus, mp4/aac, mpeg or amr audio — pick the
      // first container the browser can record that WhatsApp will play.
      const preferred = ["audio/ogg;codecs=opus", "audio/mp4", "audio/mpeg", "audio/webm;codecs=opus"];
      const mimeType = preferred.find((m) => MediaRecorder.isTypeSupported?.(m));
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recordChunksRef.current = [];
      rec.ondataavailable = (ev) => {
        if (ev.data.size > 0) recordChunksRef.current.push(ev.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const type = (rec.mimeType || mimeType || "audio/webm").split(";")[0];
        let blob = new Blob(recordChunksRef.current, { type });
        let ext = type.includes("ogg") ? "ogg" : type.includes("mp4") ? "m4a" : type.includes("mpeg") ? "mp3" : "webm";

        // Convert the recording into the format the super admin enabled.
        if (audioFormat.ext === "mp3") {
          const { encodeMp3 } = await import("@/lib/audio/encode-mp3");
          const mp3 = await encodeMp3(blob);
          if (mp3) {
            blob = mp3;
            ext = "mp3";
          }
        }
        if (ext === "webm") {
          // Chrome records WebM/Opus; WhatsApp only plays Ogg/Opus, so repackage
          // the same Opus frames into an Ogg container before uploading.
          const { webmOpusToOgg } = await import("@/lib/audio/webm-opus-to-ogg");
          const ogg = await webmOpusToOgg(blob);
          if (ogg) {
            blob = ogg;
            ext = "ogg";
          }
        }
        await uploadBlob(blob, `voice-${Date.now()}.${ext}`);
      };
      rec.start();
      mediaRecorderRef.current = rec;
      setRecording(true);
    } catch {
      toast.error("Microphone access denied");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
  }


  return (
    <div className={"-mx-4 grid h-[calc(100vh-9rem)] grid-cols-1 gap-3 px-2 sm:-mx-6 sm:px-3 md:h-[calc(100vh-10rem)] md:grid-cols-[minmax(240px,280px)_1fr] " + (active && panelOpen ? "xl:grid-cols-[minmax(240px,280px)_1fr_minmax(280px,320px)]" : "")}>
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
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1.5"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Sync inbox
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
          <div className="grid grid-cols-2 gap-2">
            <Select value={responderFilter} onValueChange={(v) => setResponderFilter(v as ResponderFilter)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All responders</SelectItem>
                <SelectItem value="ai">AI is replying</SelectItem>
                <SelectItem value="human">Human took over</SelectItem>
                <SelectItem value="unread_lead">Last from student</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {threads.map((c) => {
            const preview = c.match_message_content ?? c.last_message_content ?? "No messages yet.";
            return (
              <button
                key={c.phone_number}
                onClick={() => setActive(c.phone_number)}
                className={cn(
                  "flex w-full flex-col gap-0.5 border-b px-4 py-3 text-left transition-colors hover:bg-muted/40",
                  activeDigits === digitsOnly(c.phone_number) && "bg-primary/5",
                )}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span className="truncate">{c.lead_name || c.phone_number}</span>
                  {c.human_takeover && (
                    <span className="shrink-0 rounded-full bg-accent/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-accent-foreground">
                      Human
                    </span>
                  )}
                </span>
                {c.lead_name && <span className="text-[11px] text-muted-foreground">{c.phone_number}</span>}
                <span className="line-clamp-2 text-xs text-muted-foreground">
                  {c.match_message_content ? (
                    <>
                      <span className="mr-1 rounded bg-muted px-1 py-0.5 text-[9px] font-semibold uppercase">
                        {c.match_sender === "lead" ? "Student" : c.match_sender === "ai" ? "AI" : "Agent"}
                      </span>
                      <MatchSnippet text={preview} term={search} />
                    </>
                  ) : (
                    preview
                  )}
                </span>
              </button>
            );
          })}
          {threadQuery.isLoading && (
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading conversations…
            </div>
          )}
          {!threadQuery.isLoading && threads.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">No conversations.</p>
          )}
          {threadQuery.hasNextPage && (
            <div
              ref={loadMoreRef}
              className="flex items-center justify-center gap-2 p-4 text-xs text-muted-foreground"
            >
              {threadQuery.isFetchingNextPage ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading more…
                </>
              ) : (
                <span>Scroll for more</span>
              )}
            </div>
          )}
          {!threadQuery.hasNextPage && threads.length > 0 && (
            <p className="p-3 text-center text-[11px] text-muted-foreground">
              End of results · {threads.length} conversation{threads.length === 1 ? "" : "s"}
            </p>
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
            <div className="border-b px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2 font-semibold">
                  <button
                    onClick={() => setActive(null)}
                    className="-ml-1 shrink-0 rounded-md p-1 hover:bg-muted md:hidden"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <MessageSquare className="hidden h-4 w-4 text-primary md:block" />
                  <span className="truncate">{active}</span>
                </span>
                {/* AI toggle — always visible and easy to tap on mobile. */}
                <span className="flex shrink-0 items-center gap-2">
                <label className="flex shrink-0 items-center gap-1.5 rounded-full border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                  {takeover ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  AI {takeover ? "paused" : "active"}
                  <Switch
                    checked={!takeover}
                    onCheckedChange={(v) => toggleTakeover.mutate(!v)}
                    disabled={toggleTakeover.isPending}
                  />
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPanelOpen((v) => !v)}
                  title={panelOpen ? "Hide lead details" : "Show lead details"}
                >
                  {panelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                </Button>
                </span>
              </div>
              {activePhone && <ConversationTickets phone={activePhone} />}
              {/* Workflow controls — own row so they stay reachable on small screens. */}
              {canPause && activePhone && (
                <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-0.5">
                  <LeadWorkflowManager phone={activePhone} />
                  {workflowState && (
                    <Button
                      size="sm"
                      variant={workflowState === "paused" ? "default" : "outline"}
                      className="h-8 shrink-0 gap-1 px-2.5 text-xs"
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
                </div>
              )}
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
                if (m.sender === "note") {
                  return (
                    <div key={m.id} className="flex justify-center">
                      <div className="max-w-[85%] rounded-full bg-muted/60 px-3 py-1 text-center text-[11px] text-muted-foreground">
                        {m.message_content}
                      </div>
                    </div>
                  );
                }
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
                      {m.attachment_url && (
                        <div className="mb-1">
                          {m.attachment_kind === "image" ? (
                            <img
                              src={m.attachment_url}
                              alt="attachment"
                              className="max-h-64 rounded-lg object-cover"
                            />
                          ) : m.attachment_kind === "audio" ? (
                            <audio controls src={m.attachment_url} className="w-full" />
                          ) : m.attachment_kind === "video" ? (
                            <video controls src={m.attachment_url} className="max-h-64 rounded-lg" />
                          ) : (
                            <a
                              href={m.attachment_url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 rounded-md bg-background/40 px-2 py-1 text-xs underline"
                            >
                              <FileText className="h-3.5 w-3.5" /> Open file
                            </a>
                          )}
                        </div>
                      )}
                      {m.message_content && <p className="whitespace-pre-wrap">{m.message_content}</p>}
                      <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-60">
                        <span>{new Date(m.received_at).toLocaleString()}</span>
                        {!isLead && m.sender !== "note" && (() => {
                          // WhatsApp-style ticks: one grey ✓ = sent, two grey ✓✓ = delivered,
                          // two blue ✓✓ = read, red ! = failed.
                          const st = (m.delivery_status ?? "").toLowerCase();
                          if (st === "failed")
                            return (
                              <span title={m.delivery_error ?? "Failed to deliver"}>
                                <AlertCircle className="h-3 w-3 text-destructive" aria-label="Failed" />
                              </span>
                            );
                          if (st === "read") return <CheckCheck className="h-3 w-3 text-sky-400" aria-label="Read" />;
                          if (st === "delivered") return <CheckCheck className="h-3 w-3" aria-label="Delivered" />;
                          if (st === "sent" || st === "") return <Check className="h-3 w-3" aria-label="Sent" />;
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Composer */}
            <div className="border-t p-3">
              {pendingAttachment && (
                <div className="mb-2 flex items-center justify-between gap-2 rounded-md border bg-muted/40 px-2 py-1.5 text-xs">
                  <span className="flex min-w-0 items-center gap-1.5">
                    {pendingAttachment.kind === "image" ? (
                      <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                    ) : pendingAttachment.kind === "audio" ? (
                      <Mic className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="truncate">{pendingAttachment.filename}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPendingAttachment(null)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
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
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,audio/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                onChange={handleFilePick}
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={uploading || recording}
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach file"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant={recording ? "destructive" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    disabled={uploading}
                    onClick={() => (recording ? stopRecording() : startRecording())}
                    title={recording ? "Stop recording" : "Record voice note"}
                  >
                    {recording ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <span className="text-[11px] text-muted-foreground">Send from</span>
                  <Select
                    value={sendWorkspace || "__default"}
                    onValueChange={(v) => setSendWorkspace(v === "__default" ? "" : v)}
                  >
                    <SelectTrigger className="h-8 w-[170px] text-xs">
                      <SelectValue placeholder="Lead's default inbox" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__default">Lead&apos;s default inbox</SelectItem>
                      {workspaces.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name ?? "Unnamed"}
                          {w.is_default ? " (default)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScheduleOpen(true)}
                    disabled={!draft.trim()}
                  >
                    <Clock className="mr-1 h-4 w-4" /> Schedule
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSend}
                    disabled={(!draft.trim() && !pendingAttachment) || send.isPending || uploading}
                  >
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

      {/* Lead context panel */}
      {active && panelOpen && (
        <div className="hidden xl:block">
          <LeadPanel phone={active} />
        </div>
      )}

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
