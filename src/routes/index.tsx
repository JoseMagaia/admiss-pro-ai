import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap,
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
      { title: "Linkmoore Education — AI Admissions Assistant" },
      {
        name: "description",
        content:
          "WhatsApp-powered AI admissions assistant that qualifies students 24/7, screens scholarships, collects documents and books consultations for your admissions team.",
      },
      { property: "og:title", content: "Linkmoore Education — AI Admissions Assistant" },
      {
        property: "og:description",
        content:
          "Qualify, screen and onboard international students automatically over WhatsApp with an AI admissions assistant.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
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

const steps = [
  "Student messages on WhatsApp",
  "AI qualifies & collects requirements",
  "Financial & parent consent confirmed",
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
              <GraduationCap className="h-5 w-5 text-accent-foreground" />
            </span>
            <span className="font-display text-lg font-bold">Linkmoore</span>
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
              AI Admissions Qualification Platform
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Qualify every student lead, <span className="text-gradient">automatically</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-primary-foreground/80">
              Linkmoore's AI admissions assistant works inside WhatsApp to qualify leads, screen
              scholarships, collect documents and prepare bookings — handing your team only
              ready-to-enroll students.
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
              alt="Student chatting with the Linkmoore AI admissions assistant on WhatsApp"
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
          <h2 className="text-3xl font-bold sm:text-4xl">Everything your admissions team needs</h2>
          <p className="mt-4 text-muted-foreground">
            A complete qualification engine that turns WhatsApp conversations into enrolled students.
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
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Ready to qualify smarter?</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
            Sign in to the admissions dashboard to manage leads, conversations, bookings and your AI
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
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="font-display font-semibold text-foreground">Linkmoore Education</span>
          </div>
          <p>AI Admissions Qualification Platform</p>
        </div>
      </footer>
    </div>
  );
}
