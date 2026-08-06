import { Buffer } from "node:buffer";
import process from "node:process";
import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { I as redirect } from "../_libs/tanstack__router-core.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-Cq9-7bp9.mjs";
import { createHmac, timingSafeEqual } from "node:crypto";

import "../_libs/seroval.mjs";
import "../_libs/react-dom.mjs";

import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";

import "./server-BpMAhPfL.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/unenv.mjs";

import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




import "./roles-vB9M4HoO.mjs";
import "../_libs/zod.mjs";
const appCss = "/assets/styles-BffkFh24.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$e = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Linkmoore Education — AI Admissions Assistant" },
      { name: "description", content: "WhatsApp admissions platform that qualifies leads, collects requirements, and prepares them for enrollment." },
      { name: "author", content: "Linkmoore Education" },
      { property: "og:title", content: "Linkmoore Education — AI Admissions Assistant" },
      { property: "og:description", content: "WhatsApp admissions platform that qualifies leads, collects requirements, and prepares them for enrollment." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Linkmoore Education" },
      { property: "og:url", content: "https://agents.linkmoore.com" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Linkmoore" },
      { name: "twitter:title", content: "Linkmoore Education — AI Admissions Assistant" },
      { name: "twitter:description", content: "WhatsApp admissions platform that qualifies leads, collects requirements, and prepares them for enrollment." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7d5ea32e-2b6d-43d8-a450-fc63b443add4/id-preview-92c6562a--e01e4fe6-fbb9-4991-917e-e1bd97b5a9f3.lovable.app-1780440586310.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7d5ea32e-2b6d-43d8-a450-fc63b443add4/id-preview-92c6562a--e01e4fe6-fbb9-4991-917e-e1bd97b5a9f3.lovable.app-1780440586310.png" }
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap" },
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$e.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
}
const BASE_URL = "https://agents.linkmoore.com";
const Route$d = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/features", changefreq: "monthly", priority: "0.8" }
        ];
        const urls = entries.map(
          (e) => [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`
          ].filter(Boolean).join("\n")
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" }
        });
      }
    }
  }
});
const $$splitComponentImporter$4 = () => import("./features-CsSvnaRC.mjs");
const Route$c = createFileRoute("/features")({
  head: () => ({
    meta: [{
      title: "Features — Linkmoore Education AI Admissions"
    }, {
      name: "description",
      content: "Explore the Linkmoore AI admissions platform: 24/7 WhatsApp lead qualification, scholarship screening, document collection and automated booking preparation."
    }, {
      property: "og:title",
      content: "Features — Linkmoore Education AI Admissions"
    }, {
      property: "og:description",
      content: "24/7 WhatsApp lead qualification, scholarship screening, document collection and automated booking preparation."
    }, {
      property: "og:type",
      content: "website"
    }, {
      property: "og:url",
      content: "https://agents.linkmoore.com/features"
    }],
    links: [{
      rel: "canonical",
      href: "https://agents.linkmoore.com/features"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./auth-nGKSLFFI.mjs");
const Route$b = createFileRoute("/auth")({
  head: () => ({
    meta: [{
      title: "Sign In — Linkmoore Education"
    }, {
      name: "description",
      content: "Sign in to the Linkmoore Education admissions dashboard."
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./route-BFsOu0JM.mjs");
const Route$a = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const {
      data,
      error
    } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({
      to: "/auth"
    });
    return {
      user: data.user
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./index-DQrgvNqG.mjs");
const Route$9 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Linkmoore Education — AI Admissions Assistant"
    }, {
      name: "description",
      content: "WhatsApp-powered AI admissions assistant that qualifies students 24/7, screens scholarships, collects documents and books consultations for your admissions team."
    }, {
      property: "og:title",
      content: "Linkmoore Education — AI Admissions Assistant"
    }, {
      property: "og:description",
      content: "Qualify, screen and onboard international students automatically over WhatsApp with an AI admissions assistant."
    }, {
      property: "og:type",
      content: "website"
    }, {
      property: "og:url",
      content: "https://agents.linkmoore.com/"
    }],
    links: [{
      rel: "canonical",
      href: "https://agents.linkmoore.com/"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./dashboard-jh-w5arD.mjs");
const Route$8 = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{
      title: "Admissions Dashboard — Linkmoore Education"
    }, {
      name: "description",
      content: "Manage leads, conversations, bookings and AI behavior."
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
function sha256Signature(secret, rawBody) {
  return "sha256=" + createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}
function safeEqual(a, b) {
  try {
    const ab = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    return ab.length === bb.length && timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}
async function wabaWorkspace(phoneNumberId) {
  const { supabaseAdmin } = await import("./client.server-5D-kk_Jp.mjs");
  const { data } = await supabaseAdmin.from("chatwoot_workspaces").select("id, waba_verify_token, waba_app_secret, waba_phone_number_id").eq("provider_type", "waba");
  const rows = data ?? [];
  if (phoneNumberId) {
    const byNumber = rows.find(
      (w) => String(w.waba_phone_number_id ?? "").trim() === String(phoneNumberId).trim()
    );
    if (byNumber) return byNumber;
  }
  return rows[0] ?? null;
}
const Route$7 = createFileRoute("/api/public/waba-webhook")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");
        if (mode === "subscribe" && token) {
          const ws = await wabaWorkspace(null);
          const expected = String(ws?.waba_verify_token ?? "");
          if (expected && safeEqual(token, expected)) {
            return new Response(challenge ?? "ok", {
              status: 200,
              headers: { "Content-Type": "text/plain" }
            });
          }
          if (process.env.WABA_VERIFY_TOKEN && safeEqual(token, process.env.WABA_VERIFY_TOKEN)) {
            return new Response(challenge ?? "ok", {
              status: 200,
              headers: { "Content-Type": "text/plain" }
            });
          }
        }
        return new Response("Forbidden", { status: 403 });
      },
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("x-hub-signature-256") ?? "";
        let phoneNumberId = null;
        let payload;
        try {
          payload = JSON.parse(rawBody);
          const entry2 = payload.entry ?? [];
          const change = entry2[0]?.changes ?? [];
          const value2 = change[0]?.value ?? {};
          phoneNumberId = value2.metadata?.phone_number_id ?? null;
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        const ws = await wabaWorkspace(phoneNumberId);
        const appSecret = String(ws?.waba_app_secret ?? "").trim();
        if (appSecret) {
          const expected = sha256Signature(appSecret, rawBody);
          if (!signature || !safeEqual(signature, expected)) {
            return new Response(JSON.stringify({ error: "Invalid signature" }), {
              status: 403,
              headers: { "Content-Type": "application/json" }
            });
          }
        } else {
          console.warn("[waba-webhook] No app secret configured on the connection; signature not verified.");
        }
        const entry = payload.entry ?? [];
        const value = (entry[0]?.changes ?? [0])[0]?.value;
        const messages = value?.messages ?? [];
        const statuses = value?.statuses ?? [];
        const results = [];
        for (const msg of messages) {
          if (msg.from === void 0) continue;
          const textObj = msg.text ?? {};
          const content = String(textObj.body ?? "").trim();
          const from = String(msg.from ?? "").replace(/[^0-9]/g, "");
          if (!from || !content) continue;
          try {
            const { processInboundMessage } = await import("./admissions.server-Dhr9qutG.mjs");
            const result = await processInboundMessage({
              phone: from,
              message: content,
              wabaPhoneNumberId: phoneNumberId
            });
            results.push(result);
          } catch (e) {
            console.error("WABA webhook processing error:", e);
            return new Response(JSON.stringify({ ok: false, error: "processing_failed" }), {
              status: 500,
              headers: { "Content-Type": "application/json" }
            });
          }
        }
        return new Response(
          JSON.stringify({ ok: true, messages: messages.length, statuses: statuses.length, processed: results.length }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }
});
const Route$6 = createFileRoute("/api/public/process-workflows")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = request.headers.get("apikey");
        const expected = process.env.WEBHOOK_SECRET || "local-dev-webhook-secret";
        if (apiKey !== expected) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
          });
        }
        try {
          const { processWorkflows } = await import("./admissions.server-Dhr9qutG.mjs");
          const result = await processWorkflows();
          return new Response(JSON.stringify({ ok: true, ...result }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } catch (e) {
          console.error("Workflow processing error:", e);
          return new Response(JSON.stringify({ ok: false, error: "processing_failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
  }
});
const Route$5 = createFileRoute("/api/public/process-scheduled-messages")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = request.headers.get("apikey");
        const expected = process.env.WEBHOOK_SECRET || "local-dev-webhook-secret";
        if (apiKey !== expected) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
          });
        }
        try {
          const { processScheduledMessages } = await import("./admissions.server-Dhr9qutG.mjs");
          const result = await processScheduledMessages();
          return new Response(JSON.stringify({ ok: true, ...result }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } catch (e) {
          console.error("Scheduled message processing error:", e);
          return new Response(JSON.stringify({ ok: false, error: "processing_failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
  }
});
const Route$4 = createFileRoute("/api/public/process-campaigns")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = request.headers.get("apikey");
        const expected = process.env.WEBHOOK_SECRET || "local-dev-webhook-secret";
        if (apiKey !== expected) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
          });
        }
        try {
          const { processCampaigns } = await import("./admissions.server-Dhr9qutG.mjs");
          const result = await processCampaigns();
          return new Response(JSON.stringify({ ok: true, ...result }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } catch (e) {
          console.error("Campaign processing error:", e);
          return new Response(JSON.stringify({ ok: false, error: "processing_failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
  }
});
const Route$3 = createFileRoute("/api/public/evolution-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload;
        try {
          payload = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        const event = String(payload.event ?? "").toLowerCase().replace(/_/g, ".");
        if (event && event !== "messages.upsert") {
          return new Response(JSON.stringify({ ok: true, ignored: event }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        }
        const instance = payload.instance !== void 0 ? String(payload.instance) : null;
        const rawData = payload.data;
        const items = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];
        const results = [];
        for (const item of items) {
          const key = item.key ?? {};
          const remoteJid = key.remoteJid !== void 0 ? String(key.remoteJid) : "";
          const fromMe = key.fromMe === true;
          if (fromMe || !remoteJid || remoteJid.endsWith("@g.us")) continue;
          const messageObj = item.message ?? {};
          const extended = messageObj.extendedTextMessage ?? {};
          const image = messageObj.imageMessage ?? {};
          const video = messageObj.videoMessage ?? {};
          const content = String(
            messageObj.conversation || extended.text || image.caption || video.caption || ""
          ).trim();
          const phone = remoteJid.replace(/@.*$/, "").replace(/[^0-9]/g, "");
          if (!phone || !content) continue;
          try {
            const { processInboundMessage } = await import("./admissions.server-Dhr9qutG.mjs");
            const result = await processInboundMessage({
              phone,
              message: content,
              evolutionInstance: instance
            });
            results.push(result);
          } catch (e) {
            console.error("Evolution webhook processing error:", e);
            return new Response(JSON.stringify({ ok: false, error: "processing_failed" }), {
              status: 500,
              headers: { "Content-Type": "application/json" }
            });
          }
        }
        return new Response(JSON.stringify({ ok: true, processed: results.length }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
  }
});
const Route$2 = createFileRoute("/api/public/chatwoot-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload;
        try {
          payload = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        const event = String(payload.event ?? "");
        const conversation = payload.conversation ?? {};
        const sender = payload.sender ?? {};
        const messageType = String(payload.message_type ?? "");
        if (event !== "message_created") {
          return new Response(JSON.stringify({ ok: true, ignored: event }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        }
        if (messageType && messageType !== "incoming") {
          return new Response(JSON.stringify({ ok: true, ignored: "non-incoming" }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        }
        const content = String(payload.content ?? "").trim();
        const conversationId = conversation.id !== void 0 ? String(conversation.id) : payload.conversation_id ? String(payload.conversation_id) : null;
        const inboxObj = payload.inbox ?? {};
        const accountObj = payload.account ?? {};
        const inboxId = inboxObj.id !== void 0 ? String(inboxObj.id) : conversation.inbox_id !== void 0 ? String(conversation.inbox_id) : null;
        const accountId = accountObj.id !== void 0 ? String(accountObj.id) : payload.account_id !== void 0 ? String(payload.account_id) : null;
        const phone = sender.phone_number || sender.identifier || conversation.contact_inbox && conversation.contact_inbox.source_id || (sender.id !== void 0 ? `chatwoot-${sender.id}` : null);
        const contactId = sender.id !== void 0 ? String(sender.id) : null;
        if (!phone || !content) {
          return new Response(JSON.stringify({ ok: true, ignored: "missing phone or content" }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        }
        try {
          const { processInboundMessage } = await import("./admissions.server-Dhr9qutG.mjs");
          const result = await processInboundMessage({
            phone: String(phone),
            message: content,
            chatwootConversationId: conversationId,
            chatwootContactId: contactId,
            chatwootInboxId: inboxId,
            chatwootAccountId: accountId
          });
          return new Response(JSON.stringify({ ok: true, ...result }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } catch (e) {
          console.error("Webhook processing error:", e);
          return new Response(JSON.stringify({ ok: false, error: "processing_failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
  }
});
function xmlEscape$1(v) {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function sanitizeNumber$1(v) {
  const trimmed = v.trim().slice(0, 60);
  if (/^\+?[0-9\s\-().]+$/.test(trimmed)) return trimmed.replace(/[\s\-().]/g, "");
  return "";
}
async function buildTwiml(params) {
  const to = sanitizeNumber$1(params.get("To") ?? "");
  const callerId = sanitizeNumber$1(params.get("CallerId") ?? params.get("callerId") ?? "");
  let twiml;
  if (!to) {
    twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>No destination number was provided.</Say></Response>`;
  } else {
    const dialAttrs = callerId ? ` callerId="${xmlEscape$1(callerId)}"` : "";
    twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Dial${dialAttrs} answerOnBridge="true"><Number>${xmlEscape$1(to)}</Number></Dial></Response>`;
  }
  return new Response(twiml, { status: 200, headers: { "Content-Type": "text/xml" } });
}
const Route$1 = createFileRoute("/api/public/voip/twiml")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData().catch(() => null);
        const params = new URLSearchParams();
        if (form) for (const [k, v] of form.entries()) params.set(k, String(v));
        return buildTwiml(params);
      },
      GET: async ({ request }) => {
        const url = new URL(request.url);
        return buildTwiml(url.searchParams);
      }
    }
  }
});
function xmlEscape(v) {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function sanitizeNumber(v) {
  const trimmed = v.trim().slice(0, 60);
  if (/^\+?[0-9\s\-().]+$/.test(trimmed)) return trimmed.replace(/[\s\-().]/g, "");
  return "";
}
function agentIdentity(userId) {
  return `agent_${userId.replace(/-/g, "")}`;
}
function say(message) {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>${xmlEscape(message)}</Say><Hangup/></Response>`;
  return new Response(twiml, { status: 200, headers: { "Content-Type": "text/xml" } });
}
async function buildInboundTwiml(params) {
  const to = sanitizeNumber(params.get("To") ?? "");
  const from = sanitizeNumber(params.get("From") ?? "");
  if (!to) return say("This number is not configured.");
  const { supabaseAdmin } = await import("./client.server-5D-kk_Jp.mjs");
  const candidates = to.startsWith("+") ? [to, to.slice(1)] : [to, `+${to}`];
  const { data: route } = await supabaseAdmin.from("inbound_routes").select("ring_group_id, active").in("did", candidates).eq("active", true).limit(1).maybeSingle();
  const r = route;
  if (!r || !r.ring_group_id) return say("Sorry, no one is available to take your call right now.");
  const { data: group } = await supabaseAdmin.from("ring_groups").select("ring_seconds, active").eq("id", r.ring_group_id).maybeSingle();
  const g = group;
  if (!g || !g.active) return say("Sorry, no one is available to take your call right now.");
  const { data: members } = await supabaseAdmin.from("ring_group_members").select("user_id, position").eq("ring_group_id", r.ring_group_id).order("position", { ascending: true });
  const memberRows = members ?? [];
  if (!memberRows.length) return say("Sorry, no one is available to take your call right now.");
  const timeout = Math.max(5, Math.min(120, Number(g.ring_seconds) || 20));
  const callerAttr = from ? ` callerId="${xmlEscape(from)}"` : "";
  const clients = memberRows.map((m) => `<Client>${xmlEscape(agentIdentity(m.user_id))}</Client>`).join("");
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Dial${callerAttr} timeout="${timeout}" answerOnBridge="true">${clients}</Dial></Response>`;
  return new Response(twiml, { status: 200, headers: { "Content-Type": "text/xml" } });
}
const Route = createFileRoute("/api/public/voip/inbound")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData().catch(() => null);
        const params = new URLSearchParams();
        if (form) for (const [k, v] of form.entries()) params.set(k, String(v));
        return buildInboundTwiml(params);
      },
      GET: async ({ request }) => {
        const url = new URL(request.url);
        return buildInboundTwiml(url.searchParams);
      }
    }
  }
});
const SitemapDotxmlRoute = Route$d.update({
  id: "/sitemap.xml",
  path: "/sitemap.xml",
  getParentRoute: () => Route$e
});
const FeaturesRoute = Route$c.update({
  id: "/features",
  path: "/features",
  getParentRoute: () => Route$e
});
const AuthRoute = Route$b.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$e
});
const AuthenticatedRouteRoute = Route$a.update({
  id: "/_authenticated",
  getParentRoute: () => Route$e
});
const IndexRoute = Route$9.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$e
});
const AuthenticatedDashboardRoute = Route$8.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AuthenticatedRouteRoute
});
const ApiPublicWabaWebhookRoute = Route$7.update({
  id: "/api/public/waba-webhook",
  path: "/api/public/waba-webhook",
  getParentRoute: () => Route$e
});
const ApiPublicProcessWorkflowsRoute = Route$6.update({
  id: "/api/public/process-workflows",
  path: "/api/public/process-workflows",
  getParentRoute: () => Route$e
});
const ApiPublicProcessScheduledMessagesRoute = Route$5.update({
  id: "/api/public/process-scheduled-messages",
  path: "/api/public/process-scheduled-messages",
  getParentRoute: () => Route$e
});
const ApiPublicProcessCampaignsRoute = Route$4.update({
  id: "/api/public/process-campaigns",
  path: "/api/public/process-campaigns",
  getParentRoute: () => Route$e
});
const ApiPublicEvolutionWebhookRoute = Route$3.update({
  id: "/api/public/evolution-webhook",
  path: "/api/public/evolution-webhook",
  getParentRoute: () => Route$e
});
const ApiPublicChatwootWebhookRoute = Route$2.update({
  id: "/api/public/chatwoot-webhook",
  path: "/api/public/chatwoot-webhook",
  getParentRoute: () => Route$e
});
const ApiPublicVoipTwimlRoute = Route$1.update({
  id: "/api/public/voip/twiml",
  path: "/api/public/voip/twiml",
  getParentRoute: () => Route$e
});
const ApiPublicVoipInboundRoute = Route.update({
  id: "/api/public/voip/inbound",
  path: "/api/public/voip/inbound",
  getParentRoute: () => Route$e
});
const AuthenticatedRouteRouteChildren = {
  AuthenticatedDashboardRoute
};
const AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
  AuthRoute,
  FeaturesRoute,
  SitemapDotxmlRoute,
  ApiPublicChatwootWebhookRoute,
  ApiPublicEvolutionWebhookRoute,
  ApiPublicProcessCampaignsRoute,
  ApiPublicProcessScheduledMessagesRoute,
  ApiPublicProcessWorkflowsRoute,
  ApiPublicWabaWebhookRoute,
  ApiPublicVoipInboundRoute,
  ApiPublicVoipTwimlRoute
};
const routeTree = Route$e._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router;
};
export {
  getRouter
};
