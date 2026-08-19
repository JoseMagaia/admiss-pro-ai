import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Ticket as TicketIcon, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  listTickets,
  listQueues,
  listTags,
  listAssignableUsers,
  upsertTicket,
  transferTicket,
  setTicketStatus,
} from "@/lib/tickets.functions";

const NONE = "__none__";

interface TicketRow {
  id: string;
  subject: string;
  status: string;
  priority: string;
  queue_id: string | null;
  assigned_user_id: string | null;
  tags: string[] | null;
}

export function ConversationTickets({ phone }: { phone: string }) {
  const qc = useQueryClient();
  const ticketsFn = useServerFn(listTickets);
  const queuesFn = useServerFn(listQueues);
  const tagsFn = useServerFn(listTags);
  const usersFn = useServerFn(listAssignableUsers);
  const saveFn = useServerFn(upsertTicket);
  const transferFn = useServerFn(transferTicket);
  const statusFn = useServerFn(setTicketStatus);

  const { data } = useQuery({
    queryKey: ["tickets", phone],
    queryFn: () => ticketsFn({ data: { phone, status: "all", limit: 20 } }),
    enabled: Boolean(phone),
  });
  const { data: queueData } = useQuery({ queryKey: ["ticket-queues"], queryFn: () => queuesFn() });
  const { data: tagData } = useQuery({ queryKey: ["tags"], queryFn: () => tagsFn() });
  const { data: userData } = useQuery({ queryKey: ["assignable-users"], queryFn: () => usersFn() });

  const tickets = ((data as { tickets?: TicketRow[] } | undefined)?.tickets ?? []) as TicketRow[];
  const queues = ((queueData as { queues?: { id: string; name: string }[] } | undefined)?.queues ?? []);
  const tags = ((tagData as { tags?: { id: string; name: string; color: string }[] } | undefined)?.tags ?? []);
  const users = ((userData as {
    users?: { user_id: string; email: string | null; full_name: string | null }[];
  } | undefined)?.users ?? []);

  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [queueId, setQueueId] = useState(NONE);
  const [assignee, setAssignee] = useState(NONE);
  const [priority, setPriority] = useState("normal");
  const [picked, setPicked] = useState<string[]>([]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["tickets"] });
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  const create = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          subject: subject.trim(),
          phone_number: phone,
          notes: notes.trim() || null,
          priority: priority as "low" | "normal" | "high" | "urgent",
          queue_id: queueId === NONE ? null : queueId,
          assigned_user_id: assignee === NONE ? null : assignee,
          tags: picked,
        },
      }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error?: string };
      if (!res.ok) return void toast.error(res.error ?? "Could not create ticket");
      toast.success("Ticket created");
      setOpen(false);
      setSubject("");
      setNotes("");
      setPicked([]);
      refresh();
    },
  });

  const transfer = useMutation({
    mutationFn: (v: { id: string; queue_id?: string | null; assigned_user_id?: string | null }) =>
      transferFn({ data: v }),
    onSuccess: () => {
      toast.success("Ticket transferred");
      refresh();
    },
  });

  const close = useMutation({
    mutationFn: (id: string) => statusFn({ data: { id, status: "closed" } }),
    onSuccess: () => {
      toast.success("Ticket closed");
      refresh();
    },
  });

  const open_tickets = tickets.filter((t) => t.status !== "closed");

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 text-xs" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" /> New ticket
      </Button>

      {open_tickets.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-1.5 rounded-full border bg-muted/30 px-2.5 py-1 text-xs"
          title={t.subject}
        >
          <TicketIcon
            className={cn(
              "h-3.5 w-3.5",
              t.priority === "urgent" || t.priority === "high" ? "text-destructive" : "text-primary",
            )}
          />
          <span className="max-w-[140px] truncate">{t.subject}</span>

          <Select
            value={t.queue_id ?? NONE}
            onValueChange={(v) => transfer.mutate({ id: t.id, queue_id: v === NONE ? null : v, assigned_user_id: t.assigned_user_id })}
          >
            <SelectTrigger className="h-6 w-[110px] border-0 bg-transparent px-1 text-xs shadow-none">
              <SelectValue placeholder="Queue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>No queue</SelectItem>
              {queues.map((q) => (
                <SelectItem key={q.id} value={q.id}>
                  {q.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={t.assigned_user_id ?? NONE}
            onValueChange={(v) => transfer.mutate({ id: t.id, queue_id: t.queue_id, assigned_user_id: v === NONE ? null : v })}
          >
            <SelectTrigger className="h-6 w-[130px] border-0 bg-transparent px-1 text-xs shadow-none">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Unassigned</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.user_id} value={u.user_id}>
                  {u.full_name ?? u.email ?? u.user_id.slice(0, 8)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button onClick={() => close.mutate(t.id)} title="Close ticket" className="text-success hover:opacity-70">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New ticket for {phone}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <Textarea placeholder="Notes (optional)" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            <div className="grid gap-2 sm:grid-cols-3">
              <Select value={queueId} onValueChange={setQueueId}>
                <SelectTrigger>
                  <SelectValue placeholder="Queue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>No queue</SelectItem>
                  {queues.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign to" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Unassigned</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.user_id} value={u.user_id}>
                      {u.full_name ?? u.email ?? u.user_id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["low", "normal", "high", "urgent"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => {
                  const on = picked.includes(t.name);
                  return (
                    <button
                      key={t.id}
                      onClick={() => setPicked((p) => (on ? p.filter((x) => x !== t.name) : [...p, t.name]))}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs transition-colors",
                        on ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                      )}
                      style={on ? undefined : { borderColor: t.color, color: t.color }}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!subject.trim() || create.isPending} onClick={() => create.mutate()}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
