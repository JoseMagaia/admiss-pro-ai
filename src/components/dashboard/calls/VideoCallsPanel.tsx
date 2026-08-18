import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Video,
  VideoOff,
  Copy,
  ExternalLink,
  Loader2,
  PhoneOff,
  UserRound,
  Phone,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getJitsiSettings } from "@/lib/calendar.functions";
import { logCall } from "@/lib/calls.functions";
import { cn } from "@/lib/utils";

interface JitsiSettings {
  enabled: boolean;
  server_url: string;
  display_name: string;
  room_prefix: string;
}

interface Meeting {
  room: string;
  url: string;
  label: string;
  startedAt: number;
  phone?: string;
  notes?: string;
}

function fmtElapsed(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "call";
}

export function VideoCallsPanel() {
  const settingsFn = useServerFn(getJitsiSettings);
  const logFn = useServerFn(logCall);

  const { data: settingsData } = useQuery({
    queryKey: ["jitsi-settings"],
    queryFn: () => settingsFn(),
    refetchInterval: 15000,
  });
  const settings = (settingsData?.settings ?? null) as JitsiSettings | null;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Live elapsed timer while a meeting is open.
  useEffect(() => {
    if (!meeting) return;
    const t = window.setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - meeting.startedAt) / 1000)));
    }, 1000);
    return () => window.clearInterval(t);
  }, [meeting]);

  const copyLink = useCallback(async () => {
    if (!meeting) return;
    try {
      await navigator.clipboard.writeText(meeting.url);
      setCopied(true);
      toast.success("Meeting link copied");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy — copy the URL manually");
    }
  }, [meeting]);

  const startMeeting = useCallback(() => {
    if (!settings || !settings.enabled) {
      toast.error("Video calls are disabled — enable them in Settings → Video Calls");
      return;
    }
    const label = name.trim() || "Video meeting";
    const room = `${settings.room_prefix || "admissions"}-${slugify(label)}-${Date.now().toString(36).slice(-5)}`;
    const server = (settings.server_url || "https://meet.jit.si").replace(/\/+$/, "");
    const url = `${server}/${room}#userInfo.displayName=${encodeURIComponent(settings.display_name || "Agent")}`;
    setMeeting({ room, url, label, startedAt: Date.now(), phone: phone.trim() || undefined, notes: notes.trim() || undefined });
    setElapsed(0);
  }, [settings, name, phone, notes]);

  const endMeeting = useMutation({
    mutationFn: async () => {
      if (!meeting) return null;
      const res = await logFn({
        data: {
          phone_number: meeting.phone || meeting.label,
          direction: "outbound",
          status: "completed",
          provider: "jitsi",
          provider_call_sid: meeting.room,
          notes: meeting.notes ?? null,
          started_at: new Date(meeting.startedAt).toISOString(),
          ended_at: new Date().toISOString(),
          duration_seconds: Math.max(0, Math.floor((Date.now() - meeting.startedAt) / 1000)),
        },
      });
      return res;
    },
    onSuccess: (r) => {
      const res = r as { ok: boolean; error?: string | null } | null;
      if (res && !res.ok) toast.warning(res.error ?? "Call logged with issues");
      else toast.success("Meeting ended & logged in history");
      setMeeting(null);
      setElapsed(0);
      setName("");
      setPhone("");
      setNotes("");
    },
    onError: () => toast.error("Failed to log the meeting"),
  });

  if (!settingsData) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border bg-card p-6 text-sm text-muted-foreground shadow-card">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading video settings…
      </div>
    );
  }

  if (!settings?.enabled) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <VideoOff className="h-6 w-6" />
        </div>
        <h3 className="mt-3 font-semibold">Video calls are off</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Turn on Jitsi video calls in Settings → Video Calls to start meetings from this tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meeting ? (
        <>
          {/* Live meeting embed */}
          <div className="overflow-hidden rounded-2xl border bg-black shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-zinc-900 px-4 py-2.5 text-white">
              <div className="flex min-w-0 items-center gap-2">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                </span>
                <span className="truncate text-sm font-semibold">{meeting.label}</span>
                <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs tabular-nums">
                  {fmtElapsed(elapsed)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 gap-1.5 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  onClick={copyLink}
                >
                  {copied ? <ClipboardCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy link"}
                </Button>
                <Button size="sm" variant="ghost" className="h-8 gap-1.5 bg-white/10 text-white hover:bg-white/20 hover:text-white" asChild>
                  <a href={meeting.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" /> Fullscreen
                  </a>
                </Button>
              </div>
            </div>
            <iframe
              ref={iframeRef}
              src={meeting.url}
              title="Jitsi video meeting"
              allow="camera; microphone; display-capture; fullscreen; autoplay"
              className="aspect-video w-full"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-zinc-900 px-4 py-3">
              <p className="max-w-full truncate text-xs text-zinc-400">
                Share this link with the lead: <span className="font-mono text-zinc-200">{meeting.url}</span>
              </p>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5"
                onClick={() => endMeeting.mutate()}
                disabled={endMeeting.isPending}
              >
                {endMeeting.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PhoneOff className="h-4 w-4" />
                )}
                End & log call
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Start form — stacked and full-width friendly on phones. */}
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Start a video meeting</h3>
                <p className="text-xs text-muted-foreground">
                  Powered by Jitsi ({settings.server_url.replace(/^https?:\/\//, "")}) — no downloads needed.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="vc-name">Meeting label</Label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="vc-name"
                    className="pl-9"
                    placeholder="e.g. Maria — Enrollment consult"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vc-phone">Lead phone (optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="vc-phone"
                    className="pl-9"
                    placeholder="+15551234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vc-notes">Notes (optional)</Label>
                <Input
                  id="vc-notes"
                  placeholder="Meeting purpose"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <Button className="mt-4 w-full gap-2 sm:w-auto" onClick={startMeeting}>
              <Video className="h-4 w-4" /> Start meeting
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { title: "1. Start the room", body: "Open a Jitsi meeting right here in the tab — no app install." },
              { title: "2. Share the link", body: "Copy the link and drop it into the chat or WhatsApp." },
              { title: "3. Get it logged", body: "Meetings are saved to the call history with duration & notes." },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl border bg-card p-4 shadow-card">
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
