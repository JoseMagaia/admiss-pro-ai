import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Target,
  Globe,
  Bot,
  Calendar,
  FileText,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — fliq" },
      {
        name: "description",
        content:
          "Explore fliq: 24/7 WhatsApp lead capture, AI qualification, automated follow-ups and appointment booking.",
      },
      { property: "og:title", content: "Features — fliq" },
      {
        property: "og:description",
        content:
          "24/7 WhatsApp lead capture, AI qualification, automated follow-ups and appointment booking.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://agents.linkmoore.com/features" },
    ],
    links: [{ rel: "canonical", href: "https://agents.linkmoore.com/features" }],
  }),
  component: Features,
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

const detailed = [
  "Lead memory that remembers every prospect across conversations.",
  "Availability and appointment slots synced to your calendar options.",
  "Configurable AI prompt, variables and provider — no redeploy needed.",
  "Switch between built-in AI or your own provider and API key.",
  "Human takeover the moment a lead asks for a person.",
  "Outbound HTTP actions to trigger your CRM or automation tools.",
];

function Features() {
  return (
    <div className="min-h-screen bg-background">
      <header className="absolute top-0 z-20 w-full">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-2 text-primary-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-accent shadow-glow">
              <Target className="h-5 w-5 text-accent-foreground" />
            </span>
            <span className="font-display text-lg font-bold">fliq</span>
          </Link>
          <Button asChild variant="secondary" size="sm">
            <Link to="/auth">
              Login <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </nav>
      </header>

      <section className="bg-gradient-hero pb-16 pt-32 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">Built to fill your calendar</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-primary-foreground/80">
            Everything fliq's AI assistant does to turn WhatsApp conversations into qualified leads and
            booked appointments.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

        <div className="mt-16 rounded-3xl border bg-card p-8 shadow-card sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">And more under the hood</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {detailed.map((d) => (
              <div key={d} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm text-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/auth">
              Login to dashboard <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back home
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
