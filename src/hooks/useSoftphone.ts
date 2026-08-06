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

export type CallDirection = "inbound" | "outbound" | null;

export interface SoftphoneState {
  status: CallStatus;
  provider: "sip" | "twilio" | "disabled" | null;
  ready: boolean;
  error: string | null;
  currentNumber: string | null;
  durationSec: number;
  muted: boolean;
  direction: CallDirection;
  incoming: boolean;
  incomingFrom: string | null;
  registered: boolean;
}

// Minimal cross-provider softphone. Wraps sip.js (Web.SimpleUser) and the
// Twilio Voice SDK behind a single call/hangup/mute/accept/reject interface. All
// SDK code is dynamically imported so it never runs during SSR.
type TwilioDeviceConstructor = new (token: string, options?: Record<string, unknown>) => any;

type TwilioBrowserModule = {
  Device?: TwilioDeviceConstructor;
};

async function loadTwilioDevice(): Promise<TwilioDeviceConstructor> {
  // The package ESM entry imports Node's `events`, which Vite externalizes in
  // browser builds. Use Twilio's pre-bundled browser distribution instead.
  // @ts-expect-error The distribution bundle has no standalone TypeScript declaration.
  const bundle = (await import("@twilio/voice-sdk/dist/twilio.js")) as TwilioBrowserModule;
  const globalTwilio = typeof window !== "undefined" ? (window as Window & { Twilio?: TwilioBrowserModule }).Twilio : undefined;
  const Device = bundle.Device ?? globalTwilio?.Device;
  if (!Device) throw new Error("Twilio Voice SDK browser bundle did not expose Device.");
  return Device;
}

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
    direction: null,
    incoming: false,
    incomingFrom: null,
    registered: false,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sipRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const twilioDeviceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const twilioCallRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const incomingCallRef = useRef<any>(null); // pending Twilio incoming call
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

  const endedThenIdle = useCallback(() => {
    stopTimer();
    patch({ status: "ended", currentNumber: null, incoming: false, incomingFrom: null });
    setTimeout(
      () =>
        setState((s) =>
          s.status === "ended" ? { ...s, status: "idle", durationSec: 0, direction: null, muted: false } : s,
        ),
      800,
    );
  }, [patch, stopTimer]);

  // Load the current VoIP config (mints a Twilio token when needed).
  const loadConfig = useCallback(async () => {
    const res = (await configFn()) as { config: Record<string, unknown> };
    configRef.current = res.config;
    patch({ provider: (res.config.provider as SoftphoneState["provider"]) ?? "disabled" });
    return res.config;
  }, [configFn, patch]);

  // Register with the provider so inbound calls can reach this browser. Safe to
  // call repeatedly — it no-ops if already set up for the active provider.
  const register = useCallback(async () => {
    let config = configRef.current;
    try {
      config = await loadConfig();
    } catch {
      return;
    }
    if (!config || config.provider === "disabled" || !config.inbound) return;

    // ---- Twilio ----
    if (config.provider === "twilio") {
      try {
        const Device = await loadTwilioDevice();
        ensureAudio();
        if (!twilioDeviceRef.current) {
          const device = new Device(String(config.token), { logLevel: "error" });
          twilioDeviceRef.current = device;
          device.on("incoming", (call: unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const c = call as any;
            incomingCallRef.current = c;
            const from = c?.parameters?.From ?? null;
            patch({ incoming: true, incomingFrom: from, direction: "inbound", status: "ringing", currentNumber: from });
            c.on("cancel", () => {
              incomingCallRef.current = null;
              endedThenIdle();
            });
            c.on("disconnect", () => {
              twilioCallRef.current = null;
              endedThenIdle();
            });
            c.on("error", () => {
              incomingCallRef.current = null;
              patch({ status: "failed", incoming: false });
            });
          });
          await device.register();
        } else {
          twilioDeviceRef.current.updateToken(String(config.token));
        }
        patch({ registered: true });
      } catch {
        /* inbound registration is best-effort */
      }
      return;
    }

    // ---- SIP / WebRTC ----
    if (config.provider === "sip") {
      try {
        if (!sipRef.current) {
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
              onCallReceived: () => {
                patch({ incoming: true, incomingFrom: null, direction: "inbound", status: "ringing" });
              },
              onCallAnswered: () => {
                patch({ status: "in-call", incoming: false });
                startTimer();
              },
              onCallHangup: () => {
                endedThenIdle();
              },
            },
          });
          sipRef.current = su;
          await su.connect();
          await su.register();
        }
        patch({ registered: true });
      } catch {
        /* inbound registration is best-effort */
      }
    }
  }, [loadConfig, ensureAudio, patch, startTimer, endedThenIdle]);

  const teardownActive = useCallback(async () => {
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
    await teardownActive();
    endedThenIdle();
  }, [teardownActive, endedThenIdle]);

  // Answer a ringing inbound call.
  const accept = useCallback(async () => {
    const provider = configRef.current?.provider;
    if (provider === "twilio" && incomingCallRef.current) {
      const c = incomingCallRef.current;
      twilioCallRef.current = c;
      incomingCallRef.current = null;
      try {
        c.accept();
        patch({ incoming: false, status: "in-call" });
        startTimer();
      } catch {
        patch({ status: "failed", incoming: false });
      }
      return;
    }
    if (provider === "sip" && sipRef.current) {
      try {
        await sipRef.current.answer();
        patch({ incoming: false });
      } catch {
        patch({ status: "failed", incoming: false });
      }
    }
  }, [patch, startTimer]);

  // Decline a ringing inbound call.
  const reject = useCallback(async () => {
    const provider = configRef.current?.provider;
    if (provider === "twilio" && incomingCallRef.current) {
      try {
        incomingCallRef.current.reject();
      } catch { /* noop */ }
      incomingCallRef.current = null;
    } else if (provider === "sip" && sipRef.current) {
      try {
        await sipRef.current.decline();
      } catch { /* noop */ }
    }
    endedThenIdle();
  }, [endedThenIdle]);

  const call = useCallback(
    async (rawNumber: string) => {
      const number = rawNumber.trim();
      if (!number) return;
      patch({
        status: "initializing",
        error: null,
        currentNumber: number,
        durationSec: 0,
        muted: false,
        direction: "outbound",
        incoming: false,
        incomingFrom: null,
      });
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
          let su = sipRef.current;
          if (!su) {
            su = new Web.SimpleUser(String(config.wsServer), {
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
                  endedThenIdle();
                },
              },
            });
            sipRef.current = su;
            patch({ status: "connecting" });
            await su.connect();
            await su.register();
          }
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
          const Device = await loadTwilioDevice();
          ensureAudio();
          if (!twilioDeviceRef.current) {
            twilioDeviceRef.current = new Device(String(config.token), { logLevel: "error" });
          } else {
            twilioDeviceRef.current.updateToken(String(config.token));
          }
          patch({ status: "connecting" });
          const twilioCall = await twilioDeviceRef.current.connect({
            params: { To: number, CallerId: String(config.callerId || "") },
          });
          twilioCallRef.current = twilioCall;
          patch({ status: "ringing" });
          twilioCall.on("accept", () => {
            patch({ status: "in-call" });
            startTimer();
          });
          twilioCall.on("disconnect", () => {
            twilioCallRef.current = null;
            endedThenIdle();
          });
          twilioCall.on("cancel", () => {
            twilioCallRef.current = null;
            endedThenIdle();
          });
          twilioCall.on("error", (err: { message?: string }) => {
            stopTimer();
            patch({ status: "failed", error: err?.message ?? "Twilio call error." });
          });
        } catch (e) {
          patch({ status: "failed", error: (e as Error)?.message ?? "Twilio call failed." });
        }
        return;
      }
    },
    [ensureAudio, loadConfig, patch, startTimer, stopTimer, endedThenIdle],
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
        incomingCallRef.current?.reject?.();
        twilioDeviceRef.current?.destroy();
      } catch { /* noop */ }
      try {
        sipRef.current?.unregister?.();
        sipRef.current?.disconnect?.();
      } catch { /* noop */ }
      if (audioRef.current) {
        audioRef.current.remove();
        audioRef.current = null;
      }
    };
  }, [stopTimer]);

  const active = ["initializing", "connecting", "ringing", "in-call"].includes(state.status) && !state.incoming;

  return { ...state, active, call, hangup, toggleMute, loadConfig, register, accept, reject };
}
