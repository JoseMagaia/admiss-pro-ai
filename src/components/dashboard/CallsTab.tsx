import { useCallback, useEffect, useRef, useState } from "react";
import { PhoneCall, Zap, History, Megaphone, Phone, PhoneOff, PhoneIncoming, Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { canManageCallCampaigns } from "@/lib/roles";
import { useSoftphone, type CallStatus } from "@/hooks/useSoftphone";
import { DialerPanel } from "./calls/DialerPanel";
import { PowerDialer } from "./calls/PowerDialer";
import { CallHistory } from "./calls/CallHistory";
import { CallCampaigns } from "./calls/CallCampaigns";
import { CallOutcomeDialog, type CallTarget } from "./calls/CallOutcomeDialog";

type SectionId = "dialer" | "power" | "history" | "campaigns";

const STATUS_TEXT: Record<CallStatus, string> = {
  idle: "Idle",
  initializing: "Preparing…",
  connecting: "Connecting…",
  ringing: "Ringing…",
  "in-call": "In call",
  ended: "Call ended",
  failed: "Call failed",
  unavailable: "Unavailable",
};

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function CallsTab() {
  const { profile } = useAuth();
  const canManage = canManageCallCampaigns(profile.role);

  const SECTIONS: { id: SectionId; label: string; icon: typeof PhoneCall }[] = [
    { id: "dialer", label: "Dialer", icon: PhoneCall },
    { id: "power", label: "Power Dialer", icon: Zap },
    { id: "history", label: "History", icon: History },
    ...(canManage ? [{ id: "campaigns" as const, label: "Campaigns", icon: Megaphone }] : []),
  ];

  const [section, setSection] = useState<SectionId>("dialer");
  const phone = useSoftphone();

  const targetRef = useRef<CallTarget | null>(null);
  const [outcomeTarget, setOutcomeTarget] = useState<CallTarget | null>(null);
  const [outcomeOpen, setOutcomeOpen] = useState(false);
  const [outcomeSavedAt, setOutcomeSavedAt] = useState(0);
  const prevStatus = useRef<CallStatus>("idle");

  const startCall = useCallback(
    (t: CallTarget) => {
      targetRef.current = { ...t, direction: "outbound" };
      phone.call(t.phone_number);
    },
    [phone],
  );

  // Register with the telephony provider on mount so inbound calls can ring
  // this browser (no-ops unless incoming calling is enabled).
  const register = phone.register;
  useEffect(() => {
    void register();
  }, [register]);

  const acceptIncoming = useCallback(() => {
    targetRef.current = { phone_number: phone.incomingFrom ?? "Unknown", direction: "inbound" };
    void phone.accept();
  }, [phone]);

  // When a call finishes, open the outcome dialog pre-filled with its duration.
  useEffect(() => {
    if (prevStatus.current !== "ended" && phone.status === "ended") {
      const t = targetRef.current;
      if (t) {
        setOutcomeTarget({ ...t, durationSec: phone.durationSec, provider: phone.provider });
        setOutcomeOpen(true);
      }
    }
    prevStatus.current = phone.status;
  }, [phone.status, phone.durationSec, phone.provider]);

  const showBar = phone.active || phone.status === "failed" || phone.status === "unavailable";

  return (
    <div className="space-y-6">
      {/* Live call bar */}
      {showBar && (
        <div
          className={cn(
            "flex items-center justify-between rounded-2xl border p-4 shadow-card",
            phone.status === "in-call" ? "border-success/40 bg-success/5" : "bg-card",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                phone.status === "in-call" ? "bg-success/15 text-success" : "bg-primary/10 text-primary",
              )}
            >
              {["initializing", "connecting", "ringing"].includes(phone.status) ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Phone className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {targetRef.current?.lead_name ?? phone.currentNumber ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {STATUS_TEXT[phone.status]}
                {phone.status === "in-call" ? ` · ${fmt(phone.durationSec)}` : ""}
                {phone.error ? ` · ${phone.error}` : ""}
              </p>
            </div>
          </div>
          {phone.active && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={phone.toggleMute} title={phone.muted ? "Unmute" : "Mute"}>
                {phone.muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button variant="destructive" className="gap-2" onClick={phone.hangup}>
                <PhoneOff className="h-4 w-4" /> Hang up
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <nav className="flex flex-row flex-wrap gap-1 lg:flex-col">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                section === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          ))}
        </nav>

        <div>
          {section === "dialer" && <DialerPanel onCall={startCall} busy={phone.active} />}
          {section === "power" && <PowerDialer onCall={startCall} busy={phone.active} outcomeSavedAt={outcomeSavedAt} />}
          {section === "history" && <CallHistory onCall={startCall} busy={phone.active} />}
          {section === "campaigns" && canManage && <CallCampaigns />}
        </div>
      </div>

      <CallOutcomeDialog
        open={outcomeOpen}
        onOpenChange={setOutcomeOpen}
        target={outcomeTarget}
        onSaved={() => setOutcomeSavedAt(Date.now())}
      />
    </div>
  );
}
