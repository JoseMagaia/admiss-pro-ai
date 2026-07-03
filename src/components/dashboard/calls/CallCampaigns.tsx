import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, Search, X, ListPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listDialCampaigns, saveDialCampaign, deleteDialCampaign, searchDialContacts } from "@/lib/calls.functions";
import { LEAD_FILTERS, QUALIFICATION_STAGES, stageLabel } from "@/lib/pipeline";

interface Campaign {
  id: string;
  name: string;
  source_type: string;
  criteria: Record<string, unknown>;
  active: boolean;
}
interface ContactRow {
  id: string;
  phone_number: string;
  lead_name: string | null;
}
type Member = { lead_id: string | null; phone_number: string; lead_name: string | null };

type SourceUi = "group" | "stage" | "manual" | "callbacks";

const SOURCE_UI_LABELS: Record<SourceUi, string> = {
  group: "By pipeline group",
  stage: "By specific stage",
  manual: "Manual list",
  callbacks: "Due callbacks",
};

function describe(c: Campaign): string {
  if (c.source_type === "manual") return "Manual list";
  if (c.source_type === "callbacks") return "Due callbacks";
  if (c.source_type === "stage") return `Stage: ${stageLabel(String(c.criteria?.stage ?? ""))}`;
  const col = LEAD_FILTERS.find((f) => f.id === c.criteria?.column);
  return `Group: ${col?.label ?? "All"}`;
}

export function CallCampaigns() {
  const qc = useQueryClient();
  const listFn = useServerFn(listDialCampaigns);
  const saveFn = useServerFn(saveDialCampaign);
  const delFn = useServerFn(deleteDialCampaign);
  const searchFn = useServerFn(searchDialContacts);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [sourceUi, setSourceUi] = useState<SourceUi>("group");
  const [column, setColumn] = useState("new");
  const [stage, setStage] = useState<string>(QUALIFICATION_STAGES[0]);
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");

  const { data } = useQuery({ queryKey: ["dial-campaigns"], queryFn: () => listFn() });
  const campaigns = (data?.campaigns ?? []) as Campaign[];

  const { data: contactData } = useQuery({
    queryKey: ["campaign-contacts", search],
    queryFn: () => searchFn({ data: { query: search } }),
    enabled: sourceUi === "manual" && search.trim().length > 0,
  });
  const contacts = (contactData?.contacts ?? []) as ContactRow[];

  const reset = () => {
    setName("");
    setSourceUi("group");
    setColumn("new");
    setStage(QUALIFICATION_STAGES[0]);
    setMembers([]);
    setSearch("");
  };

  const save = useMutation({
    mutationFn: () => {
      const source_type = sourceUi === "group" ? "filter" : sourceUi;
      const criteria =
        sourceUi === "group" ? { column } : sourceUi === "stage" ? { stage } : {};
      return saveFn({
        data: {
          name,
          source_type: source_type as never,
          criteria,
          members: sourceUi === "manual" ? members.map((m) => ({ lead_id: m.lead_id, phone_number: m.phone_number })) : undefined,
        },
      });
    },
    onSuccess: (res) => {
      if ((res as { ok: boolean }).ok) {
        qc.invalidateQueries({ queryKey: ["dial-campaigns"] });
        toast.success("Campaign saved");
        setOpen(false);
        reset();
      } else {
        toast.error((res as { error?: string }).error ?? "Failed to save");
      }
    },
    onError: () => toast.error("Failed to save"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dial-campaigns"] });
      toast.success("Campaign deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const addMember = (c: ContactRow) => {
    setMembers((m) => (m.some((x) => x.phone_number === c.phone_number) ? m : [...m, { lead_id: c.id, phone_number: c.phone_number, lead_name: c.lead_name }]));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Dial lists that power the progressive power dialer.</p>
        <Button size="sm" className="gap-1" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New campaign
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {campaigns.map((c) => (
          <div key={c.id} className="rounded-2xl border bg-card p-4 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{describe(c)}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => remove.mutate(c.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {campaigns.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            <ListPlus className="mx-auto mb-2 h-6 w-6 opacity-40" />
            No dial campaigns yet.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New dial campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. New leads follow-up" />
            </div>

            <div className="space-y-1.5">
              <Label>Contacts source</Label>
              <Select value={sourceUi} onValueChange={(v) => setSourceUi(v as SourceUi)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SOURCE_UI_LABELS) as SourceUi[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {SOURCE_UI_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {sourceUi === "group" && (
              <div className="space-y-1.5">
                <Label>Pipeline group</Label>
                <Select value={column} onValueChange={setColumn}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_FILTERS.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {sourceUi === "stage" && (
              <div className="space-y-1.5">
                <Label>Stage</Label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUALIFICATION_STAGES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {stageLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {sourceUi === "callbacks" && (
              <p className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                This list is built automatically from callbacks that are due (rescheduled no-pickup calls).
              </p>
            )}

            {sourceUi === "manual" && (
              <div className="space-y-2">
                <Label>Add contacts</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads…" className="pl-9" />
                </div>
                {search.trim() && (
                  <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border p-1">
                    {contacts.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => addMember(c)}
                        className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                      >
                        <span>{c.lead_name ?? "Unknown"} · {c.phone_number}</span>
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    ))}
                    {contacts.length === 0 && <p className="px-2 py-2 text-xs text-muted-foreground">No matches.</p>}
                  </div>
                )}
                {members.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {members.map((m) => (
                      <span key={m.phone_number} className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">
                        {m.lead_name ?? m.phone_number}
                        <button onClick={() => setMembers((list) => list.filter((x) => x.phone_number !== m.phone_number))}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); reset(); }} disabled={save.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => save.mutate()}
              disabled={save.isPending || !name.trim() || (sourceUi === "manual" && members.length === 0)}
            >
              {save.isPending ? "Saving…" : "Create campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
