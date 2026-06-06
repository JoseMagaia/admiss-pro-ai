import { useState } from "react";
import { BarChart3, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReportsTab } from "./ReportsTab";
import { OffersManager } from "./OffersManager";
import { ADVANCED_SECTIONS, type AdvancedSection } from "@/lib/roles";

const SECTIONS: { id: AdvancedSection; label: string; icon: typeof BarChart3 }[] = [
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "opportunities", label: "Opportunities", icon: Package },
];

export function AdvancedTab() {
  const [section, setSection] = useState<AdvancedSection>(ADVANCED_SECTIONS[0]);

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
        {section === "reports" && <ReportsTab />}
        {section === "opportunities" && <OffersManager />}
      </div>
    </div>
  );
}
