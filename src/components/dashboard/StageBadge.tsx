import { cn } from "@/lib/utils";
import { columnForStage, stageLabel } from "@/lib/pipeline";

const COLUMN_STYLES: Record<string, string> = {
  new: "bg-muted text-muted-foreground",
  qualification: "bg-primary/10 text-primary",
  qualified: "bg-success/15 text-success",
  booking: "bg-accent/20 text-accent-foreground",
  meeting: "bg-chart-4/15 text-primary",
  payment: "bg-warning/20 text-warning-foreground",
  onboarding: "bg-success/20 text-success",
  disqualified: "bg-destructive/15 text-destructive",
};

export function StageBadge({ stage, className }: { stage: string; className?: string }) {
  const col = columnForStage(stage);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        COLUMN_STYLES[col.id] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {stageLabel(stage)}
    </span>
  );
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-warning/20 text-warning-foreground",
  confirmed: "bg-primary/10 text-primary",
  completed: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
  open: "bg-success/15 text-success",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {status}
    </span>
  );
}
