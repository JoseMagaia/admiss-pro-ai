import { useState } from "react";
import { Workflow as WorkflowIcon, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkflowManager } from "./orchestration/WorkflowManager";
import { ResponderAgentManager } from "./orchestration/ResponderAgentManager";

const SECTIONS = [
  { id: "workflows", label: "Workflows", icon: WorkflowIcon },
  { id: "agents", label: "Responder Agents", icon: Bot },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function OrchestrationTab() {
  const [section, setSection] = useState<SectionId>("workflows");

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
      <nav className="flex flex-row flex-wrap gap-1 lg:flex-col">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              section === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            <s.icon className="h-4 w-4" />
            {s.label}
          </button>
        ))}
      </nav>
      <div>
        {section === "workflows" && <WorkflowManager />}
        {section === "agents" && <ResponderAgentManager />}
      </div>
    </div>
  );
}
