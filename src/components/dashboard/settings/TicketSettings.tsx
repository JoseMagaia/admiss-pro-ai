import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, Loader2, Megaphone, Tag as TagIcon, Inbox } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  listQueues,
  upsertQueue,
  deleteQueue,
  listTags,
  upsertTag,
  deleteTag,
  broadcastNotification,
  listQueueMembers,
  listAssignableUsers,
} from "@/lib/tickets.functions";
import { ALL_ROLES, ROLE_LABELS } from "@/lib/roles";
import { QUALIFICATION_STAGES, STAGE_LABELS } from "@/lib/pipeline";

interface Queue {
  id: string;
  name: string;
  description: string | null;
  color: string;
  ai_handoff_stages?: string[] | null;
  is_ai_default?: boolean | null;
}
interface SpaceUser {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: string;
}
interface Tag {
  id: string;
  name: string;
  color: string;
}

export function TicketSettings() {
  const qc = useQueryClient();
  const queuesFn = useServerFn(listQueues);
  const saveQueueFn = useServerFn(upsertQueue);
  const delQueueFn = useServerFn(deleteQueue);
  const tagsFn = useServerFn(listTags);
  const saveTagFn = useServerFn(upsertTag);
  const delTagFn = useServerFn(deleteTag);
  const broadcastFn = useServerFn(broadcastNotification);

  const { data: queueData } = useQuery({ queryKey: ["ticket-queues"], queryFn: () => queuesFn() });
  const { data: tagData } = useQuery({ queryKey: ["tags"], queryFn: () => tagsFn() });
  const membersFn = useServerFn(listQueueMembers);
  const usersFn = useServerFn(listAssignableUsers);
  const { data: memberData } = useQuery({ queryKey: ["queue-members"], queryFn: () => membersFn() });
  const { data: userData } = useQuery({ queryKey: ["assignable-users"], queryFn: () => usersFn() });
  const queueMembers = ((memberData as { members?: { queue_id: string; user_id: string }[] } | undefined)?.members ?? []);
  const spaceUsers = ((userData as { users?: SpaceUser[] } | undefined)?.users ?? []) as SpaceUser[];
  const [editing, setEditing] = useState<string | null>(null);
  const queues = ((queueData as { queues?: Queue[] } | undefined)?.queues ?? []) as Queue[];
  const tags = ((tagData as { tags?: Tag[] } | undefined)?.tags ?? []) as Tag[];

  const [queueName, setQueueName] = useState("");
  const [queueDesc, setQueueDesc] = useState("");
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#0ea5e9");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<string>("all");

  const saveQueue = useMutation({
    mutationFn: () => saveQueueFn({ data: { name: queueName.trim(), description: queueDesc.trim() || null } }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error?: string };
      if (!res.ok) return void toast.error(res.error ?? "Could not save queue");
      toast.success("Queue created");
      setQueueName("");
      setQueueDesc("");
      qc.invalidateQueries({ queryKey: ["ticket-queues"] });
    },
  });

  // Save staffing + AI routing for one queue.
  const updateQueue = useMutation({
    mutationFn: (v: { q: Queue; member_ids: string[]; stages: string[]; is_ai_default: boolean }) =>
      saveQueueFn({
        data: {
          id: v.q.id,
          name: v.q.name,
          description: v.q.description,
          member_ids: v.member_ids,
          ai_handoff_stages: v.stages,
          is_ai_default: v.is_ai_default,
        },
      }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error?: string };
      if (!res.ok) return void toast.error(res.error ?? "Could not update queue");
      toast.success("Queue updated");
      qc.invalidateQueries({ queryKey: ["ticket-queues"] });
      qc.invalidateQueries({ queryKey: ["queue-members"] });
    },
  });

  const removeQueue = useMutation({
    mutationFn: (id: string) => delQueueFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Queue removed");
      qc.invalidateQueries({ queryKey: ["ticket-queues"] });
    },
  });

  const saveTag = useMutation({
    mutationFn: () => saveTagFn({ data: { name: tagName.trim(), color: tagColor } }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error?: string };
      if (!res.ok) return void toast.error(res.error ?? "Could not save tag");
      toast.success("Tag created");
      setTagName("");
      qc.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  const removeTag = useMutation({
    mutationFn: (id: string) => delTagFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Tag removed");
      qc.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  const broadcast = useMutation({
    mutationFn: () => broadcastFn({ data: { title: title.trim(), body: body.trim() || undefined, target } }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error?: string };
      if (!res.ok) return void toast.error(res.error ?? "Could not send");
      toast.success("Announcement sent");
      setTitle("");
      setBody("");
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Queues */}
      <section className="rounded-2xl border bg-card p-5 shadow-card">
        <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold">
          <Inbox className="h-4 w-4 text-primary" /> Ticket queues
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Queues group tickets by team or topic. Agents can transfer tickets between queues.
        </p>
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input placeholder="Queue name" value={queueName} onChange={(e) => setQueueName(e.target.value)} />
          <Input placeholder="Description (optional)" value={queueDesc} onChange={(e) => setQueueDesc(e.target.value)} />
          <Button
            className="gap-1.5"
            disabled={!queueName.trim() || saveQueue.isPending}
            onClick={() => saveQueue.mutate()}
          >
            {saveQueue.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
          </Button>
        </div>
        <ul className="mt-4 divide-y rounded-xl border">
          {queues.length === 0 && <li className="p-3 text-sm text-muted-foreground">No queues yet.</li>}
          {queues.map((q) => (
            <li key={q.id} className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 truncate text-sm font-medium">
                    {q.name}
                    {q.is_ai_default && (
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
                        AI default
                      </span>
                    )}
                  </p>
                  {q.description && <p className="truncate text-xs text-muted-foreground">{q.description}</p>}
                  <p className="text-[11px] text-muted-foreground">
                    {queueMembers.filter((m) => m.queue_id === q.id).length} agent(s) ·{" "}
                    {(q.ai_handoff_stages ?? []).length} routed stage(s)
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button size="sm" variant="outline" onClick={() => setEditing(editing === q.id ? null : q.id)}>
                    {editing === q.id ? "Close" : "Edit"}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => removeQueue.mutate(q.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              {editing === q.id && (
                <QueueEditor
                  queue={q}
                  users={spaceUsers}
                  memberIds={queueMembers.filter((m) => m.queue_id === q.id).map((m) => m.user_id)}
                  saving={updateQueue.isPending}
                  onSave={(member_ids, stages, is_ai_default) =>
                    updateQueue.mutate({ q, member_ids, stages, is_ai_default })
                  }
                />
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Tags */}
      <section className="rounded-2xl border bg-card p-5 shadow-card">
        <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold">
          <TagIcon className="h-4 w-4 text-primary" /> Tags
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Tags are created here by admins and can be applied to tickets by everyone in the space.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Tag name"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            className="w-48"
          />
          <input
            type="color"
            value={tagColor}
            onChange={(e) => setTagColor(e.target.value)}
            className="h-10 w-12 cursor-pointer rounded-md border bg-background"
            aria-label="Tag colour"
          />
          <Button className="gap-1.5" disabled={!tagName.trim() || saveTag.isPending} onClick={() => saveTag.mutate()}>
            <Plus className="h-4 w-4" /> Add tag
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.length === 0 && <p className="text-sm text-muted-foreground">No tags yet.</p>}
          {tags.map((t) => (
            <span
              key={t.id}
              className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
              style={{ borderColor: t.color, color: t.color }}
            >
              {t.name}
              <button onClick={() => removeTag.mutate(t.id)} aria-label={`Remove ${t.name}`}>
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* Announcements */}
      <section className="rounded-2xl border bg-card p-5 shadow-card">
        <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold">
          <Megaphone className="h-4 w-4 text-primary" /> Announcements
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Send a notification to everyone in this space or to a specific role group.
        </p>
        <div className="space-y-2">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Message" rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="flex items-center gap-2">
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Everyone in this space</SelectItem>
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}s only
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button disabled={!title.trim() || broadcast.isPending} onClick={() => broadcast.mutate()}>
              {broadcast.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send announcement"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Assign agents to a queue and choose which pipeline stages the AI routes here. */
function QueueEditor({
  queue,
  users,
  memberIds,
  saving,
  onSave,
}: {
  queue: Queue;
  users: SpaceUser[];
  memberIds: string[];
  saving: boolean;
  onSave: (memberIds: string[], stages: string[], isAiDefault: boolean) => void;
}) {
  const [members, setMembers] = useState<string[]>(memberIds);
  const [stages, setStages] = useState<string[]>(queue.ai_handoff_stages ?? []);
  const [aiDefault, setAiDefault] = useState<boolean>(Boolean(queue.is_ai_default));

  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  return (
    <div className="mt-3 space-y-4 rounded-xl border bg-muted/20 p-3">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Agents in this queue</p>
        {users.length === 0 && <p className="text-xs text-muted-foreground">No members in this space yet.</p>}
        <div className="flex flex-wrap gap-1.5">
          {users.map((u) => (
            <button
              key={u.user_id}
              type="button"
              onClick={() => setMembers((m) => toggle(m, u.user_id))}
              className={
                "rounded-full border px-2.5 py-1 text-xs transition-colors " +
                (members.includes(u.user_id)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted")
              }
            >
              {u.full_name || u.email || u.user_id.slice(0, 8)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          AI sends leads here at these stages
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUALIFICATION_STAGES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStages((s) => toggle(s, st))}
              className={
                "rounded-full border px-2.5 py-1 text-xs transition-colors " +
                (stages.includes(st)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted")
              }
            >
              {STAGE_LABELS[st] ?? st}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={aiDefault} onChange={(e) => setAiDefault(e.target.checked)} />
        Fallback queue when no stage rule matches
      </label>

      <Button size="sm" disabled={saving} onClick={() => onSave(members, stages, aiDefault)}>
        {saving ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
        Save queue settings
      </Button>
    </div>
  );
}
