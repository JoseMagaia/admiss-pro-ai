import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { B as Button } from "./button-BXrfXN_b.mjs";
import { G as GraduationCap, A as ArrowRight, b as CircleCheck, B as Bot, a as Globe, C as Calendar, M as MessageSquare, F as FileText, P as Phone } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
const heroImage = "/assets/hero-admissions-cLzX6QXy.jpg";
const features = [{
  icon: Bot,
  title: "24/7 Lead Qualification",
  desc: "An AI admissions agent qualifies every WhatsApp lead instantly — day or night, in Portuguese or English."
}, {
  icon: GraduationCap,
  title: "Scholarship Screening",
  desc: "Assess academic profiles and financial alignment to surface students who fit your programs and funding."
}, {
  icon: Globe,
  title: "Admissions Guidance",
  desc: "Capture course and destination interest, then guide students through every admission requirement."
}, {
  icon: Calendar,
  title: "Booking Preparation",
  desc: "Qualified leads are handed to your team with a booking request ready for the confirmation call."
}, {
  icon: MessageSquare,
  title: "WhatsApp Automation",
  desc: "Connected through Chatwoot, replies appear right inside the conversation — no extra apps needed."
}, {
  icon: FileText,
  title: "Document Collection",
  desc: "Request and track academic documents and parent consent automatically along the pipeline."
}];
const steps = ["Student messages on WhatsApp", "AI qualifies & collects requirements", "Financial & parent consent confirmed", "Qualified lead handed to your team"];
function Landing() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "absolute top-0 z-20 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-primary-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-accent shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { className: "h-5 w-5 text-accent-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-lg font-bold", children: "Linkmoore" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "sm", className: "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/features", children: "Features" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "secondary", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/auth", children: [
          "Login ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-1 h-4 w-4" })
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative overflow-hidden bg-gradient-hero", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto grid max-w-7xl items-center gap-10 px-6 pb-20 pt-32 lg:grid-cols-2 lg:pb-28 lg:pt-40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-primary-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-sm font-medium backdrop-blur", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-accent" }),
          "AI Admissions Qualification Platform"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-6 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl", children: [
          "Qualify every student lead, ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient", children: "automatically" }),
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 max-w-xl text-lg text-primary-foreground/80", children: "Linkmoore's AI admissions assistant works inside WhatsApp to qualify leads, screen scholarships, collect documents and prepare bookings — handing your team only ready-to-enroll students." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "lg", className: "bg-gradient-accent text-accent-foreground hover:opacity-90", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/auth", children: [
            "Login ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-1 h-4 w-4" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "lg", variant: "outline", className: "border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/features", children: "Explore features" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-primary-foreground/70", children: ["Chatwoot integrated", "AI-powered", "Human takeover ready"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-accent" }),
          " ",
          t
        ] }, t)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -inset-4 rounded-3xl bg-accent/20 blur-3xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: heroImage, alt: "Student chatting with the Linkmoore AI admissions assistant on WhatsApp", width: 1280, height: 960, className: "relative w-full rounded-3xl shadow-elevated" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "border-b bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid max-w-7xl gap-4 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4", children: steps.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary", children: i + 1 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: s })
    ] }, s)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "features", className: "mx-auto max-w-7xl px-6 py-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold sm:text-4xl", children: "Everything your admissions team needs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-muted-foreground", children: "A complete qualification engine that turns WhatsApp conversations into enrolled students." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3", children: features.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group rounded-2xl border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(f.icon, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-5 text-lg font-semibold", children: f.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: f.desc })
      ] }, f.title)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "px-6 pb-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-hero px-8 py-14 text-center text-primary-foreground shadow-elevated sm:px-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "mx-auto h-10 w-10 text-accent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-3xl font-bold sm:text-4xl", children: "Ready to qualify smarter?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-3 max-w-xl text-primary-foreground/80", children: "Sign in to the admissions dashboard to manage leads, conversations, bookings and your AI assistant — all in one place." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "lg", className: "mt-8 bg-gradient-accent text-accent-foreground hover:opacity-90", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/auth", children: [
        "Login ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-1 h-4 w-4" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-sm text-muted-foreground sm:flex-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { className: "h-4 w-4 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display font-semibold text-foreground", children: "Linkmoore Education" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "AI Admissions Qualification Platform" })
    ] }) })
  ] });
}
export {
  Landing as component
};
