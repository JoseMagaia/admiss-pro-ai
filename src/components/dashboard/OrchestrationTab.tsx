import { useState } from "react";
import { Workflow as WorkflowIcon, Bot, Send, Files } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WorkflowManager } from "./orchestration/WorkflowManager";
import { ResponderAgentManager } from "./orchestration/ResponderAgentManager";
import { CampaignManager } from "./orchestration/CampaignManager";
import { TemplateManager } from "./orchestration/TemplateManager";

const SECTIONS = [
  { id: "workflows", label: "Workflows", icon: WorkflowIcon },
  { id: "agents", label: "Responder Agents", icon: Bot },
  { id: "campaigns", label: "Drip Campaigns", icon: Send },
  { id: "templates", label: "Templates", icon: Files },
] as const;


type SectionId = (typeof SECTIONS)[number]["id"];

export function OrchestrationTab() {
  const [section, setSection] = useState<SectionId>("workflows");

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
      <nav className="flex flex-row flex-wrap gap-1 lg:flex-col">
        {SECTIONS.map((s) => (
          <Button
            key={s.id}
            type="button"
            variant="ghost"
            onClick={() => setSection(s.id)}
            className={cn(
              "justify-start gap-2 px-3 py-2 text-sm font-medium",
              section === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            <s.icon className="h-4 w-4" />
            {s.label}
          </Button>
        ))}
      </nav>
      <div>
        {section === "workflows" && <WorkflowManager />}
        {section === "agents" && <ResponderAgentManager />}
        {section === "campaigns" && <CampaignManager />}
        {section === "templates" && <TemplateManager />}

      </div>
    </div>
  );
}
