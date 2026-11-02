import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { logTouchpoint } from "@/lib/lead-panel.functions";
import { cn } from "@/lib/utils";

export interface HistNote {
  id: string;
  phone_number: string | null;
  body: string;
  author_label: string | null;
  created_at: string;
}

const OUTCOMES = ["Answered", "No answer", "Voicemail", "Follow-up needed", "Not interested"];

/** Shows how many times the SDR called this lead and lets them log a new call. */
export function TouchpointButton({ phone, count }: { phone: string; count: number }) {
  const qc = useQueryClient();
  const fn = useServerFn(logTouchpoint);
  const [open, setOpen] = useState(false);
  const [outcome, setOutcome] = useState(OUTCOMES[0]);
  const [body, setBody] = useState("");
  const save = useMutation({
    mutationFn: () => fn({ data: { phone, outcome, body } }),
    onSuccess: (r) => {
      if (!r.ok) return toast.error(r.error ?? "Could not log touchpoint");
      toast.success("Touchpoint logged");
      setBody("");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["lead-histories"] });
      qc.invalidateQueries({ queryKey: ["lead-panel"] });
    },
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground hover:bg-accent/70"
          title="Log a touchpoint"
        >
          <PhoneCall className="h-3 w-3" /> {count} call{count === 1 ? "" : "s"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-3" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-semibold">Log touchpoint</p>
        <div className="flex flex-wrap gap-1">
          {OUTCOMES.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOutcome(o)}
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                outcome === o ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {o}
            </button>
          ))}
        </div>
        <Textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Call notes…"
          className="resize-none text-sm"
        />
        <Button size="sm" className="w-full" disabled={save.isPending} onClick={() => save.mutate()}>
          Save touchpoint
        </Button>
      </PopoverContent>
    </Popover>
  );
}
