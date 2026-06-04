import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap,
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
      { title: "Features — Linkmoore Education AI Admissions" },
      {
        name: "description",
        content:
          "Explore the Linkmoore AI admissions platform: 24/7 WhatsApp lead qualification, scholarship screening, document collection and automated booking preparation.",
      },
      { property: "og:title", content: "Features — Linkmoore Education AI Admissions" },
      {
        property: "og:description",
        content:
          "24/7 WhatsApp lead qualification, scholarship screening, document collection and automated booking preparation.",
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
    desc: "An AI admissions agent qualifies every WhatsApp lead instantly — day or night, in Portuguese or English.",
  },
  {
    icon: GraduationCap,
    title: "Scholarship Screening",
    desc: "Assess academic profiles and financial alignment to surface students who fit your programs and funding.",
  },
  {
    icon: Globe,
    title: "Admissions Guidance",
    desc: "Capture course and destination interest, then guide students through every admission requirement.",
  },
  {
    icon: Calendar,
    title: "Booking Preparation",
    desc: "Qualified leads are handed to your team with a booking request ready for the confirmation call.",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Automation",
    desc: "Connected through Chatwoot, replies appear right inside the conversation — no extra apps needed.",
  },
  {
    icon: FileText,
    title: "Document Collection",
    desc: "Request and track academic documents and parent consent automatically along the pipeline.",
  },
];

const detailed = [
  "Lead memory that remembers every student across conversations.",
  "Financial readiness and parent-consent checks built into the flow.",
  "Configurable AI prompt, variables and provider — no redeploy needed.",
  "Switch between built-in AI or your own provider and API key.",
  "Human takeover the moment a student asks for a person.",
  "Outbound HTTP actions to trigger your CRM or automation tools.",
];

function Features() {
  return (
    <div className="min-h-screen bg-background">
      <header className="absolute top-0 z-20 w-full">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-2 text-primary-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-accent shadow-glow">
              <GraduationCap className="h-5 w-5 text-accent-foreground" />
            </span>
            <span className="font-display text-lg font-bold">Linkmoore</span>
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
          <h1 className="text-4xl font-extrabold sm:text-5xl">Built for modern admissions teams</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-primary-foreground/80">
            Everything Linkmoore's AI assistant does to turn WhatsApp conversations into enrolled students.
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
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="font-display font-semibold text-foreground">Linkmoore Education</span>
          </div>
          <p>AI Admissions Qualification Platform</p>
        </div>
      </footer>
    </div>
  );
}
