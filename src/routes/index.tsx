import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Target,
  Globe,
  Phone,
  MessageSquare,
  Bot,
  Calendar,
  FileText,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-admissions.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "fliq — AI Lead Generation & Appointment Setting" },
      {
        name: "description",
        content:
          "WhatsApp-powered AI that captures and qualifies leads 24/7, follows up automatically and books appointments straight into your calendar.",
      },
      { property: "og:title", content: "fliq — AI Lead Generation & Appointment Setting" },
      {
        property: "og:description",
        content:
          "Capture, qualify and book leads automatically over WhatsApp with an AI lead generation and appointment assistant.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://agents.linkmoore.com/" },
    ],
    links: [{ rel: "canonical", href: "https://agents.linkmoore.com/" }],
  }),
  component: Landing,
});

const features = [
  {
    icon: Bot,
    title: "24/7 Lead Qualification",
    desc: "An AI assistant captures and qualifies every WhatsApp lead instantly — day or night, in Portuguese or English.",
  },
  {
    icon: Calendar,
    title: "Appointment Setting",
    desc: "Qualified leads pick a slot from your calendar and get booked automatically — ready for your team to confirm.",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Automation",
    desc: "Connected through Chatwoot, replies appear right inside the conversation — no extra apps needed.",
  },
  {
    icon: Globe,
    title: "Multi-channel Capture",
    desc: "Bring leads in from WhatsApp and more, with every conversation unified in a single inbox.",
  },
  {
    icon: FileText,
    title: "Smart Follow-ups",
    desc: "Automated sequences keep every lead warm and engaged until they book a call with your team.",
  },
  {
    icon: Target,
    title: "Qualified Handoff",
    desc: "Only ready-to-convert leads reach your team — with full context and a booking request attached.",
  },
];

const steps = [
  "Lead messages on WhatsApp",
  "AI qualifies & captures details",
  "Lead books an appointment slot",
  "Qualified lead handed to your team",
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="absolute top-0 z-20 w-full">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2 text-primary-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-accent shadow-glow">
              <Target className="h-5 w-5 text-accent-foreground" />
            </span>
            <span className="font-display text-lg font-bold">fliq</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link to="/features">Features</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to="/auth">
                Login <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-20 pt-32 lg:grid-cols-2 lg:pb-28 lg:pt-40">
          <div className="text-primary-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-accent" />
              AI Lead Generation & Appointment Platform
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Turn every lead into a <span className="text-gradient">booked appointment</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-primary-foreground/80">
              fliq works inside WhatsApp to capture, qualify and follow up with leads automatically —
              then books them straight into your calendar, so your team only talks to ready-to-convert
              prospects.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-accent text-accent-foreground hover:opacity-90">
                <Link to="/auth">
                  Login <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/features">Explore features</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-primary-foreground/70">
              {["Chatwoot integrated", "AI-powered", "Human takeover ready"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-accent" /> {t}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-accent/20 blur-3xl" />
            <img
              src={heroImage}
              alt="Lead chatting with the fliq AI assistant on WhatsApp"
              width={1280}
              height={960}
              className="relative w-full rounded-3xl shadow-elevated"
            />
          </div>
        </div>
      </section>

      {/* Pipeline strip */}
      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s} className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                {i + 1}
              </span>
              <p className="text-sm font-medium text-foreground">{s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Everything your lead team needs</h2>
          <p className="mt-4 text-muted-foreground">
            A complete lead engine that turns WhatsApp conversations into booked appointments.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-hero px-8 py-14 text-center text-primary-foreground shadow-elevated sm:px-16">
          <Phone className="mx-auto h-10 w-10 text-accent" />
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Ready to fill your calendar?</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
            Sign in to the lead generation dashboard to manage leads, conversations, bookings and your AI
            assistant — all in one place.
          </p>
          <Button asChild size="lg" className="mt-8 bg-gradient-accent text-accent-foreground hover:opacity-90">
            <Link to="/auth">
              Login <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="font-display font-semibold text-foreground">fliq</span>
          </div>
          <p>AI Lead Generation & Appointment Platform</p>
        </div>
      </footer>
    </div>
  );
}
