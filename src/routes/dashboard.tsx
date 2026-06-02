import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  GraduationCap,
  Users,
  MessageSquare,
  Calendar,
  KanbanSquare,
  Settings as SettingsIcon,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { LeadsTab } from "@/components/dashboard/LeadsTab";
import { MessagesTab } from "@/components/dashboard/MessagesTab";
import { BookingsTab } from "@/components/dashboard/BookingsTab";
import { PipelineTab } from "@/components/dashboard/PipelineTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { DashboardStats } from "@/components/dashboard/DashboardStats";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Admissions Dashboard — Linkmoore Education" },
      { name: "description", content: "Manage leads, conversations, bookings and AI behavior." },
    ],
  }),
  component: Dashboard,
});

const TABS = [
  { id: "leads", label: "Leads", icon: Users },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "pipeline", label: "Pipeline", icon: KanbanSquare },
  { id: "settings", label: "Settings", icon: SettingsIcon },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Dashboard() {
  const [tab, setTab] = useState<TabId>("leads");

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-sidebar px-4 py-6 text-sidebar-foreground lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-accent">
            <GraduationCap className="h-5 w-5 text-accent-foreground" />
          </span>
          <span className="font-display text-lg font-bold">Linkmoore</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile tabs */}
        <div className="flex gap-1 overflow-x-auto border-b bg-card px-3 py-2 lg:hidden">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium",
                tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <header className="mb-6">
            <h1 className="font-display text-2xl font-bold capitalize">{tab}</h1>
            <p className="text-sm text-muted-foreground">
              Linkmoore Education · AI Admissions Platform
            </p>
          </header>

          {tab !== "settings" && <DashboardStats />}

          <div className="mt-6">
            {tab === "leads" && <LeadsTab />}
            {tab === "messages" && <MessagesTab />}
            {tab === "bookings" && <BookingsTab />}
            {tab === "pipeline" && <PipelineTab />}
            {tab === "settings" && <SettingsTab />}
          </div>
        </div>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
