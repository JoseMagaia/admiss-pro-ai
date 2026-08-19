import { useState } from "react";
import { Building2, BookOpen, Bot, Variable, Webhook, FlaskConical, Plug, Cpu, UserCog, Network, Boxes, Ticket, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanySettingsForm, ProgramSettingsForm, ChatwootSettingsForm } from "./settings/SettingsForms";
import { AiPromptEditor } from "./settings/AiPromptEditor";
import { AiVariablesEditor } from "./settings/AiVariablesEditor";
import { HttpActionsManager } from "./settings/HttpActionsManager";
import { PromptTestingLab } from "./settings/PromptTestingLab";
import { AiProviderSettings } from "./settings/AiProviderSettings";
import { UserManagement } from "./settings/UserManagement";
import { ChatwootWorkspaces } from "./settings/ChatwootWorkspaces";
import { SpacesManager } from "./settings/SpacesManager";
import { TicketSettings } from "./settings/TicketSettings";
import { McpServerDocs } from "./settings/McpServerDocs";
import { canAccessSettingsSection, type AppRole } from "@/lib/roles";

const SECTIONS = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "programs", label: "Programs", icon: BookOpen },
  { id: "provider", label: "AI Provider", icon: Cpu },
  { id: "prompt", label: "AI Prompt", icon: Bot },
  { id: "variables", label: "AI Variables", icon: Variable },
  { id: "chatwoot", label: "Chatwoot", icon: Plug },
  { id: "workspaces", label: "Workspaces", icon: Network },
  { id: "actions", label: "HTTP Actions", icon: Webhook },
  { id: "ticketing", label: "Ticketing", icon: Ticket },
  { id: "lab", label: "Prompt Lab", icon: FlaskConical },
  { id: "users", label: "Users", icon: UserCog },
  { id: "spaces", label: "Spaces", icon: Boxes },
  { id: "mcp", label: "MCP Server", icon: Server },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function SettingsTab({ role }: { role: AppRole | null }) {
  const allowed = SECTIONS.filter((s) => canAccessSettingsSection(role, s.id));
  const [section, setSection] = useState<SectionId>(allowed[0]?.id ?? "company");

  const activeSection = allowed.some((s) => s.id === section) ? section : allowed[0]?.id;

  if (allowed.length === 0) {
    return <p className="text-sm text-muted-foreground">You don't have access to any settings.</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
      <nav className="flex flex-row flex-wrap gap-1 lg:flex-col">
        {allowed.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activeSection === s.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <s.icon className="h-4 w-4" />
            {s.label}
          </button>
        ))}
      </nav>

      <div>
        {activeSection === "company" && <CompanySettingsForm />}
        {activeSection === "programs" && <ProgramSettingsForm />}
        {activeSection === "provider" && <AiProviderSettings />}
        {activeSection === "prompt" && <AiPromptEditor />}
        {activeSection === "variables" && <AiVariablesEditor />}
        {activeSection === "chatwoot" && <ChatwootSettingsForm />}
        {activeSection === "workspaces" && <ChatwootWorkspaces />}
        {activeSection === "actions" && <HttpActionsManager />}
        {activeSection === "ticketing" && <TicketSettings />}
        {activeSection === "lab" && <PromptTestingLab />}
        {activeSection === "users" && <UserManagement />}
        {activeSection === "spaces" && <SpacesManager />}
        {activeSection === "mcp" && <McpServerDocs />}
      </div>
    </div>
  );
}
