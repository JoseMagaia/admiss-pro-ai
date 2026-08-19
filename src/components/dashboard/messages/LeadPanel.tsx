import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Loader2,
  StickyNote,
  History,
  UserRound,
  Trash2,
  Phone,
  Mail,
  Tag as TagIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getLeadPanel, addLeadNote, deleteLeadNote } from "@/lib/lead-panel.functions";

/** Right-hand context panel: lead profile, running notes and full activity history. */
export function LeadPanel({ phone }: { phone: string }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"info" | "notes" | "history">("info");
  const [note, setNote] = useState("");

  const panelFn = useServerFn(getLeadPanel);
  const addFn = useServerFn(addLeadNote);
  const delFn = useServerFn(deleteLeadNote);

  const { data, isLoading } = useQuery({
    queryKey: ["lead-panel", phone],
    queryFn: () => panelFn({ data: { phone } }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["lead-panel", phone] });

  const add = useMutation({
    mutationFn: () => addFn({ data: { phone, body: note.trim() } }),
    onSuccess: (r) => {
      if (r && "ok" in r && !r.ok) return toast.error(r.error ?? "Could not save note");
      setNote("");
      toast.success("Note added");
      invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => invalidate(),
  });

  const lead = data?.lead ?? null;
  const notes = data?.notes ?? [];
  const history = data?.history ?? [];

  const field = (label: string, value: unknown) =>
    value ? (
      <div key={label} className="flex justify-between gap-3 py-1 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="max-w-[60%] truncate text-right font-medium">{String(value)}</span>
      </div>
    ) : null;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card">
      <div className="flex flex-col items-center gap-2 border-b px-4 py-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
          {(String(lead?.lead_name ?? phone) || "?").trim().charAt(0).toUpperCase()}
        </div>
        <p className="text-sm font-semibold">{String(lead?.lead_name ?? "Unknown lead")}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Phone className="h-3 w-3" /> {phone}
        </p>
        {lead?.qualification_status && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
            {String(lead.qualification_status)}
          </span>
        )}
      </div>

      <div className="flex border-b text-xs">
        {(
          [
            ["info", "Info", UserRound],
            ["notes", "Notes", StickyNote],
            ["history", "History", History],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 py-2 font-medium transition-colors",
              tab === id ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/40",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && tab === "info" && (
          <div className="divide-y">
            {!lead && <p className="text-xs text-muted-foreground">No lead record for this number yet.</p>}
            {field("Type", lead?.student_or_parent)}
            {field("Course", lead?.course_interest)}
            {field("Destination", lead?.country_interest)}
            {field("Passport", lead?.passport_status)}
            {field("Academic", lead?.academic_status)}
            {field("Parent phone", lead?.parent_phone)}
            {field("Financial", lead?.financial_alignment)}
            {field("Created", lead?.created_at ? new Date(String(lead.created_at)).toLocaleString() : null)}
            {lead?.tags && String(lead.tags) !== "[]" && (
              <div className="flex items-start gap-2 py-2 text-xs">
                <TagIcon className="mt-0.5 h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{String(lead.tags).replace(/[[\]"]/g, "")}</span>
              </div>
            )}
            {lead?.notes && (
              <div className="py-2 text-xs">
                <p className="mb-1 flex items-center gap-1 text-muted-foreground">
                  <Mail className="h-3 w-3" /> Lead summary
                </p>
                <p className="whitespace-pre-wrap">{String(lead.notes)}</p>
              </div>
            )}
          </div>
        )}

        {!isLoading && tab === "notes" && (
          <div className="space-y-3">
            <Textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this lead…"
              className="resize-none text-sm"
            />
            <Button
              size="sm"
              className="w-full"
              disabled={!note.trim() || add.isPending}
              onClick={() => add.mutate()}
            >
              {add.isPending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
              Add note
            </Button>
            {notes.length === 0 && <p className="text-xs text-muted-foreground">No notes yet.</p>}
            {notes.map((n) => (
              <div key={String(n.id)} className="rounded-lg border bg-muted/30 p-2.5 text-xs">
                <div className="mb-1 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                  <span>
                    {String(n.author_label ?? "Agent")} ·{" "}
                    {n.created_at ? new Date(String(n.created_at)).toLocaleString() : ""}
                  </span>
                  <button
                    onClick={() => remove.mutate(String(n.id))}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Delete note"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <p className="whitespace-pre-wrap">{String(n.body ?? "")}</p>
              </div>
            ))}
          </div>
        )}

        {!isLoading && tab === "history" && (
          <div className="space-y-3">
            {history.length === 0 && <p className="text-xs text-muted-foreground">No activity recorded yet.</p>}
            {history.map((h, i) => (
              <div key={`${h.at}-${i}`} className="relative border-l pl-4 text-xs">
                <span className="absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                <p className="font-medium">{h.title}</p>
                {h.detail && <p className="text-muted-foreground">{h.detail}</p>}
                <p className="text-[10px] text-muted-foreground">{new Date(h.at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
