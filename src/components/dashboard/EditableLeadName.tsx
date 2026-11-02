import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { updateLeadName } from "@/lib/lead-panel.functions";
import { cn } from "@/lib/utils";

/** Lead name with an inline pencil editor for admins and super admins. */
export function EditableLeadName({ phone, name, className }: { phone: string; name: string | null; className?: string }) {
  const { profile } = useAuth();
  const canEdit = profile.role === "super_admin" || profile.role === "admin";
  const qc = useQueryClient();
  const fn = useServerFn(updateLeadName);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name ?? "");
  const save = useMutation({
    mutationFn: () => fn({ data: { phone, name: draft.trim() } }),
    onSuccess: (r) => {
      if (!r.ok) return toast.error(r.error ?? "Could not rename");
      toast.success("Lead name updated");
      setEditing(false);
      for (const k of ["leads", "lead-panel", "appointments", "message-threads"]) qc.invalidateQueries({ queryKey: [k] });
    },
  });
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  if (editing) {
    return (
      <span className="flex items-center gap-1" onClick={stop} onMouseDown={stop}>
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) save.mutate();
            if (e.key === "Escape") setEditing(false);
          }}
          className="h-7 text-sm"
        />
        <button type="button" disabled={!draft.trim() || save.isPending} onClick={() => save.mutate()} className="text-primary">
          <Check className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => setEditing(false)} className="text-muted-foreground">
          <X className="h-4 w-4" />
        </button>
      </span>
    );
  }
  return (
    <span className={cn("group/name inline-flex items-center gap-1", className)}>
      <span>{name ?? phone}</span>
      {canEdit && (
        <button
          type="button"
          title="Edit name"
          onMouseDown={stop}
          onClick={(e) => {
            e.stopPropagation();
            setDraft(name ?? "");
            setEditing(true);
          }}
          className="text-muted-foreground opacity-60 hover:text-primary hover:opacity-100"
        >
          <Pencil className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
