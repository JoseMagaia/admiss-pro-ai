import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  GraduationCap,
  Users,
  MessageSquare,
  Calendar,
  KanbanSquare,
  Workflow as WorkflowIcon,
  ClipboardCheck,
  Contact as ContactIcon,
  Settings as SettingsIcon,
  ArrowLeft,
  LogOut,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { LeadsTab } from "@/components/dashboard/LeadsTab";
import { MessagesTab } from "@/components/dashboard/MessagesTab";
import { ContactsTab } from "@/components/dashboard/ContactsTab";
import { BookingsTab } from "@/components/dashboard/BookingsTab";
import { PipelineTab } from "@/components/dashboard/PipelineTab";
import { OrchestrationTab } from "@/components/dashboard/OrchestrationTab";
import { MeetingOutcomesTab } from "@/components/dashboard/MeetingOutcomesTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { useAuth } from "@/hooks/useAuth";
import { canAccessTab, ROLE_LABELS } from "@/lib/roles";
import { DashboardNavProvider } from "@/lib/dashboard-nav";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Admissions Dashboard — Linkmoore Education" },
      { name: "description", content: "Manage leads, conversations, bookings and AI behavior." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const ALL_TABS = [
  { id: "leads", label: "Leads", icon: Users },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "contacts", label: "Contacts", icon: ContactIcon },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "pipeline", label: "Pipeline", icon: KanbanSquare },
  { id: "meeting_outcomes", label: "Meeting Outcomes", icon: ClipboardCheck },
  { id: "orchestration", label: "Orchestration", icon: WorkflowIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
] as const;

type TabId = (typeof ALL_TABS)[number]["id"];

function Dashboard() {
  const { loading, profile, signOut } = useAuth();
  const [tab, setTab] = useState<TabId>("leads");
  const [pendingConversation, setPendingConversation] = useState<string | null>(null);

  const openConversation = useCallback((phone: string) => {
    setPendingConversation(phone);
    setTab("messages");
  }, []);



  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const role = profile.role;
  const tabs = ALL_TABS.filter((t) => canAccessTab(role, t.id));
  const activeTab = tabs.some((t) => t.id === tab) ? tab : tabs[0]?.id ?? "leads";

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
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activeTab === t.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>

        <div className="mt-4 space-y-2 border-t border-sidebar-border/50 pt-4">
          <div className="px-2">
            <p className="truncate text-sm font-medium">{profile.full_name ?? profile.email}</p>
            <p className="text-xs text-sidebar-foreground/60">{role ? ROLE_LABELS[role] : "No role"}</p>
          </div>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-b bg-card px-3 py-2 lg:hidden">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium",
                activeTab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
          <button
            onClick={signOut}
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <header className="mb-6">
            <h1 className="font-display text-2xl font-bold capitalize">{activeTab}</h1>
            <p className="text-sm text-muted-foreground">
              Linkmoore Education · AI Admissions Platform
            </p>
          </header>

          {activeTab !== "settings" &&
            activeTab !== "orchestration" &&
            activeTab !== "meeting_outcomes" && <DashboardStats />}

          <div className="mt-6">
            {activeTab === "leads" && <LeadsTab />}
            {activeTab === "messages" && <MessagesTab />}
            {activeTab === "contacts" && <ContactsTab />}
            {activeTab === "bookings" && <BookingsTab />}
            {activeTab === "pipeline" && <PipelineTab />}
            {activeTab === "meeting_outcomes" && <MeetingOutcomesTab />}
            {activeTab === "orchestration" && <OrchestrationTab />}
            {activeTab === "settings" && <SettingsTab role={role} />}
          </div>
        </div>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
