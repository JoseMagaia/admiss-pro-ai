import { useState } from "react";
import { Building2, BookOpen, Bot, Variable, Webhook, FlaskConical, Plug } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanySettingsForm, ProgramSettingsForm, ChatwootSettingsForm } from "./settings/SettingsForms";
import { AiPromptEditor } from "./settings/AiPromptEditor";
import { AiVariablesEditor } from "./settings/AiVariablesEditor";
import { HttpActionsManager } from "./settings/HttpActionsManager";
import { PromptTestingLab } from "./settings/PromptTestingLab";

const SECTIONS = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "programs", label: "Programs", icon: BookOpen },
  { id: "prompt", label: "AI Prompt", icon: Bot },
  { id: "variables", label: "AI Variables", icon: Variable },
  { id: "chatwoot", label: "Chatwoot", icon: Plug },
  { id: "actions", label: "HTTP Actions", icon: Webhook },
  { id: "lab", label: "Prompt Lab", icon: FlaskConical },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function SettingsTab() {
  const [section, setSection] = useState<SectionId>("company");

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
      <nav className="flex flex-row flex-wrap gap-1 lg:flex-col">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              section === s.id
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
        {section === "company" && <CompanySettingsForm />}
        {section === "programs" && <ProgramSettingsForm />}
        {section === "prompt" && <AiPromptEditor />}
        {section === "variables" && <AiVariablesEditor />}
        {section === "chatwoot" && <ChatwootSettingsForm />}
        {section === "actions" && <HttpActionsManager />}
        {section === "lab" && <PromptTestingLab />}
      </div>
    </div>
  );
}
