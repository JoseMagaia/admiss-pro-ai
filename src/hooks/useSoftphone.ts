import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getVoipClientConfig } from "@/lib/calls.functions";

export type CallStatus =
  | "idle"
  | "initializing"
  | "connecting"
  | "ringing"
  | "in-call"
  | "ended"
  | "failed"
  | "unavailable";

export interface SoftphoneState {
  status: CallStatus;
  provider: "sip" | "twilio" | "disabled" | null;
  ready: boolean;
  error: string | null;
  currentNumber: string | null;
  durationSec: number;
  muted: boolean;
}

// Minimal cross-provider softphone. Wraps sip.js (Web.SimpleUser) and the
// Twilio Voice SDK behind a single call/hangup/mute interface. All SDK code is
// dynamically imported so it never runs during SSR.
export function useSoftphone() {
  const configFn = useServerFn(getVoipClientConfig);
  const [state, setState] = useState<SoftphoneState>({
    status: "idle",
    provider: null,
    ready: false,
    error: null,
    currentNumber: null,
    durationSec: 0,
    muted: false,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sipRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const twilioDeviceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const twilioCallRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const configRef = useRef<any>(null);

  const patch = useCallback((p: Partial<SoftphoneState>) => setState((s) => ({ ...s, ...p })), []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    const start = Date.now();
    timerRef.current = setInterval(() => {
      patch({ durationSec: Math.floor((Date.now() - start) / 1000) });
    }, 1000);
  }, [patch, stopTimer]);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const el = document.createElement("audio");
      el.autoplay = true;
      el.style.display = "none";
      document.body.appendChild(el);
      audioRef.current = el;
    }
    return audioRef.current;
  }, []);

  // Load the current VoIP config (mints a Twilio token when needed).
  const loadConfig = useCallback(async () => {
    const res = (await configFn()) as { config: Record<string, unknown> };
    configRef.current = res.config;
    patch({ provider: (res.config.provider as SoftphoneState["provider"]) ?? "disabled" });
    return res.config;
  }, [configFn, patch]);

  const teardown = useCallback(async () => {
    stopTimer();
    try {
      if (twilioCallRef.current) twilioCallRef.current.disconnect();
    } catch { /* noop */ }
    twilioCallRef.current = null;
    try {
      if (sipRef.current) await sipRef.current.hangup();
    } catch { /* noop */ }
  }, [stopTimer]);

  const hangup = useCallback(async () => {
    await teardown();
    patch({ status: "ended", currentNumber: null, muted: false });
    setTimeout(() => setState((s) => (s.status === "ended" ? { ...s, status: "idle", durationSec: 0 } : s)), 800);
  }, [patch, teardown]);

  const call = useCallback(
    async (rawNumber: string) => {
      const number = rawNumber.trim();
      if (!number) return;
      patch({ status: "initializing", error: null, currentNumber: number, durationSec: 0, muted: false });
      let config = configRef.current;
      try {
        config = await loadConfig();
      } catch {
        patch({ status: "failed", error: "Could not load calling settings." });
        return;
      }
      if (!config || config.provider === "disabled") {
        patch({ status: "unavailable", error: (config?.reason as string) ?? "Calling is not available." });
        return;
      }

      // ---- SIP / WebRTC ----
      if (config.provider === "sip") {
        try {
          const { Web } = await import("sip.js");
          const remote = ensureAudio();
          const su = new Web.SimpleUser(String(config.wsServer), {
            aor: String(config.uri),
            media: { constraints: { audio: true, video: false }, remote: { audio: remote } },
            userAgentOptions: {
              authorizationUsername: String(config.authUser || ""),
              authorizationPassword: String(config.password || ""),
              displayName: String(config.displayName || ""),
            },
            delegate: {
              onCallAnswered: () => {
                patch({ status: "in-call" });
                startTimer();
              },
              onCallHangup: () => {
                stopTimer();
                patch({ status: "ended", currentNumber: null });
                setTimeout(() => setState((s) => (s.status === "ended" ? { ...s, status: "idle", durationSec: 0 } : s)), 800);
              },
            },
          });
          sipRef.current = su;
          patch({ status: "connecting" });
          await su.connect();
          await su.register();
          const domain = String(config.domain || "");
          const target = number.startsWith("sip:") ? number : `sip:${number}@${domain}`;
          patch({ status: "ringing" });
          await su.call(target);
        } catch (e) {
          patch({ status: "failed", error: (e as Error)?.message ?? "SIP call failed." });
        }
        return;
      }

      // ---- Twilio ----
      if (config.provider === "twilio") {
        try {
          const { Device } = await import("@twilio/voice-sdk");
          ensureAudio();
          if (!twilioDeviceRef.current) {
            twilioDeviceRef.current = new Device(String(config.token), { logLevel: "error" });
          } else {
            twilioDeviceRef.current.updateToken(String(config.token));
          }
          patch({ status: "connecting" });
          const call = await twilioDeviceRef.current.connect({
            params: { To: number, CallerId: String(config.callerId || "") },
          });
          twilioCallRef.current = call;
          patch({ status: "ringing" });
          call.on("accept", () => {
            patch({ status: "in-call" });
            startTimer();
          });
          call.on("disconnect", () => {
            stopTimer();
            twilioCallRef.current = null;
            patch({ status: "ended", currentNumber: null });
            setTimeout(() => setState((s) => (s.status === "ended" ? { ...s, status: "idle", durationSec: 0 } : s)), 800);
          });
          call.on("cancel", () => {
            stopTimer();
            twilioCallRef.current = null;
            patch({ status: "ended", currentNumber: null });
            setTimeout(() => setState((s) => (s.status === "ended" ? { ...s, status: "idle", durationSec: 0 } : s)), 800);
          });
          call.on("error", (err: { message?: string }) => {
            stopTimer();
            patch({ status: "failed", error: err?.message ?? "Twilio call error." });
          });
        } catch (e) {
          patch({ status: "failed", error: (e as Error)?.message ?? "Twilio call failed." });
        }
        return;
      }
    },
    [ensureAudio, loadConfig, patch, startTimer, stopTimer],
  );

  const toggleMute = useCallback(() => {
    setState((s) => {
      const next = !s.muted;
      try {
        if (twilioCallRef.current) twilioCallRef.current.mute(next);
        else if (sipRef.current) {
          if (next) sipRef.current.mute();
          else sipRef.current.unmute();
        }
      } catch { /* noop */ }
      return { ...s, muted: next };
    });
  }, []);

  useEffect(() => {
    return () => {
      stopTimer();
      try {
        twilioCallRef.current?.disconnect();
        twilioDeviceRef.current?.destroy();
      } catch { /* noop */ }
      try {
        sipRef.current?.disconnect?.();
      } catch { /* noop */ }
      if (audioRef.current) {
        audioRef.current.remove();
        audioRef.current = null;
      }
    };
  }, [stopTimer]);

  const active = ["initializing", "connecting", "ringing", "in-call"].includes(state.status);

  return { ...state, active, call, hangup, toggleMute, loadConfig };
}
