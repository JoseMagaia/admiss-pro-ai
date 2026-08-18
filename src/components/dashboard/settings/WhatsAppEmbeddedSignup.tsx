import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { exchangeWhatsappSignupCode, getMetaSignupConfig } from "@/lib/dashboard.functions";

// One-Click WhatsApp Business API onboarding through Meta's Embedded Signup.
//
// Flow:
//  1. Load the Facebook JS SDK and init it with the Meta App ID.
//  2. FB.login(..., { config_id, response_type: "code", override_default_response_type: true })
//     opens the Embedded Signup dialog.
//  3. Meta posts a `WA_EMBEDDED_SIGNUP` message with the created waba_id and
//     phone_number_id; the login callback returns the authorization code.
//  4. The code is exchanged server-side for a business access token, the app is
//     subscribed to the WABA webhooks and the number is registered.
//  5. The resulting credentials are pushed back into the workspace form.

declare global {
  interface Window {
    FB?: {
      init: (o: Record<string, unknown>) => void;
      login: (cb: (r: FbLoginResponse) => void, o: Record<string, unknown>) => void;
    };
    fbAsyncInit?: () => void;
  }
}

interface FbLoginResponse {
  authResponse?: { code?: string } | null;
  status?: string;
}

interface SignupResult {
  phone_number_id: string;
  waba_id: string;
  access_token: string;
}

function loadFacebookSdk(appId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.FB) {
      window.FB.init({ appId, cookie: true, xfbml: false, version: "v20.0" });
      resolve();
      return;
    }
    const existing = document.getElementById("facebook-jssdk") as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    window.fbAsyncInit = () => {
      window.FB?.init({ appId, cookie: true, xfbml: false, version: "v20.0" });
      resolve();
    };
    if (!existing) {
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.onerror = () => reject(new Error("Failed to load the Facebook SDK"));
      document.body.appendChild(script);
    }
  });
}

export function WhatsAppEmbeddedSignup({ onConnected }: { onConnected: (r: SignupResult) => void }) {
  const configFn = useServerFn(getMetaSignupConfig);
  const exchangeFn = useServerFn(exchangeWhatsappSignupCode);
  const { data: metaConfig } = useQuery({ queryKey: ["meta-signup-config"], queryFn: () => configFn() });

  const [appId, setAppId] = useState("");
  const [configId, setConfigId] = useState("");
  const [busy, setBusy] = useState(false);
  // Populated by Meta's postMessage before the login callback resolves.
  const signupInfo = useRef<{ waba_id: string | null; phone_number_id: string | null }>({
    waba_id: null,
    phone_number_id: null,
  });

  useEffect(() => {
    if (metaConfig?.appId) setAppId((v) => v || metaConfig.appId!);
    if (metaConfig?.configId) setConfigId((v) => v || metaConfig.configId!);
  }, [metaConfig]);

  // Restore locally entered ids so operators don't retype them every visit.
  useEffect(() => {
    setAppId((v) => v || localStorage.getItem("meta_app_id") || "");
    setConfigId((v) => v || localStorage.getItem("meta_config_id") || "");
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!/^https:\/\/www\.facebook\.com$/.test(event.origin)) return;
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.type !== "WA_EMBEDDED_SIGNUP") return;
        if (data.event === "FINISH" || data.event === "FINISH_ONLY_WABA") {
          signupInfo.current = {
            waba_id: data.data?.waba_id ?? null,
            phone_number_id: data.data?.phone_number_id ?? null,
          };
        } else if (data.event === "CANCEL") {
          toast.message("Signup cancelled", { description: data.data?.current_step ?? undefined });
        } else if (data.event === "ERROR") {
          toast.error(data.data?.error_message ?? "Meta reported an error during signup");
        }
      } catch {
        /* not our message */
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const start = useCallback(async () => {
    if (!appId || !configId) {
      toast.error("Enter your Meta App ID and Embedded Signup Configuration ID first.");
      return;
    }
    localStorage.setItem("meta_app_id", appId);
    localStorage.setItem("meta_config_id", configId);
    setBusy(true);
    signupInfo.current = { waba_id: null, phone_number_id: null };
    try {
      await loadFacebookSdk(appId);
    } catch {
      setBusy(false);
      toast.error("Couldn't load the Facebook SDK. Disable blockers and retry.");
      return;
    }

    window.FB?.login(
      (response) => {
        const code = response?.authResponse?.code;
        if (!code) {
          setBusy(false);
          toast.error("Signup was closed before it finished.");
          return;
        }
        void exchangeFn({
          data: {
            code,
            waba_id: signupInfo.current.waba_id,
            phone_number_id: signupInfo.current.phone_number_id,
          },
        })
          .then((r) => {
            const res = r as { ok: boolean; error?: string | null; access_token?: string | null; warnings?: string[] };
            if (!res.ok || !res.access_token) {
              toast.error(res.error ?? "Couldn't finish the WhatsApp connection.");
              return;
            }
            for (const w of res.warnings ?? []) toast.warning(w);
            onConnected({
              phone_number_id: signupInfo.current.phone_number_id ?? "",
              waba_id: signupInfo.current.waba_id ?? "",
              access_token: res.access_token,
            });
            toast.success("WhatsApp Business account connected");
          })
          .catch(() => toast.error("Couldn't finish the WhatsApp connection."))
          .finally(() => setBusy(false));
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        extras: { setup: {}, featureType: "", sessionInfoVersion: "3" },
      },
    );
  }, [appId, configId, exchangeFn, onConnected]);

  return (
    <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Zap className="h-4 w-4 text-primary" /> One-click WhatsApp Business setup
      </div>
      <p className="text-xs text-muted-foreground">
        Connect a WhatsApp Business number through Meta's Embedded Signup. The phone number ID, business account ID
        and access token are filled in automatically when the flow completes.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Meta App ID</Label>
          <Input value={appId} onChange={(e) => setAppId(e.target.value)} placeholder="1234567890123456" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Embedded Signup Configuration ID</Label>
          <Input value={configId} onChange={(e) => setConfigId(e.target.value)} placeholder="9876543210987654" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={() => void start()} disabled={busy}>
          {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-1 h-4 w-4" />}
          Connect with Facebook
        </Button>
        <span className="text-[11px] text-muted-foreground">
          Requires META_APP_ID and META_APP_SECRET configured on the server.
        </span>
      </div>
    </div>
  );
}
