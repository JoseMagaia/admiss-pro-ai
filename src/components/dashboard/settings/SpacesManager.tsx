import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, Loader2, Settings2, Users, Pause, Play, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsCard } from "./SettingsForms";
import {
  listSpaces,
  createSpace,
  updateSpace,
  setSpaceStatus,
  deleteSpace,
  listSpaceMembers,
  addSpaceMember,
  removeSpaceMember,
  type SpaceRow,
} from "@/lib/spaces.functions";

const FLAG_DEFS: Array<{ key: string; label: string }> = [
  { key: "orchestration", label: "Orchestration (Workflows & Agents)" },
  { key: "workflows", label: "Outbound Workflows" },
  { key: "advanced", label: "Advanced (Reports & Opportunities)" },
  { key: "agentic", label: "Agentic AI Assistant" },
  { key: "http_actions", label: "HTTP Actions" },
  { key: "evolution", label: "Evolution API (WhatsApp)" },
];

const LIMIT_DEFS: Array<{ key: string; label: string }> = [
  { key: "max_users", label: "Max users" },
  { key: "max_leads", label: "Max leads" },
  { key: "max_workflows", label: "Max workflows" },
  { key: "max_inboxes", label: "Max inboxes" },
];

export function SpacesManager() {
  const qc = useQueryClient();
  const listFn = useServerFn(listSpaces);
  const createFn = useServerFn(createSpace);
  const statusFn = useServerFn(setSpaceStatus);
  const deleteFn = useServerFn(deleteSpace);

  const { data, isLoading } = useQuery({ queryKey: ["spaces"], queryFn: () => listFn() });
  const spaces = (data?.spaces ?? []) as SpaceRow[];

  const [newName, setNewName] = useState("");
  const [newPlan, setNewPlan] = useState("standard");
  const [editing, setEditing] = useState<SpaceRow | null>(null);
  const [managingMembers, setManagingMembers] = useState<SpaceRow | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["spaces"] });

  const create = useMutation({
    mutationFn: () => createFn({ data: { name: newName.trim(), plan: newPlan.trim() || "standard" } }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null };
      if (!res.ok) return toast.error(res.error ?? "Failed to create space");
      toast.success("Space created");
      setNewName("");
      setNewPlan("standard");
      invalidate();
    },
    onError: () => toast.error("Failed to create space"),
  });

  const toggleStatus = useMutation({
    mutationFn: (vars: { id: string; status: "active" | "suspended" }) => statusFn({ data: vars }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null };
      if (!res.ok) return toast.error(res.error ?? "Failed");
      toast.success("Space updated");
      invalidate();
    },
    onError: () => toast.error("Failed to update space"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null };
      if (!res.ok) return toast.error(res.error ?? "Failed to delete");
      toast.success("Space deleted");
      invalidate();
    },
    onError: () => toast.error("Failed to delete space"),
  });

  return (
    <div className="space-y-6">
      <SettingsCard title="Create a Space" description="Spaces are isolated sub-accounts. Each one has its own leads, conversations, workflows and settings.">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="space-name">Name</Label>
            <Input
              id="space-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Acme University"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="space-plan">Plan</Label>
            <Input
              id="space-plan"
              value={newPlan}
              onChange={(e) => setNewPlan(e.target.value)}
              placeholder="standard"
            />
          </div>
          <Button onClick={() => create.mutate()} disabled={!newName.trim() || create.isPending}>
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create
          </Button>
        </div>
      </SettingsCard>

      <SettingsCard title="Spaces" description="Manage sub-accounts, their access plans and members.">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : spaces.length === 0 ? (
          <p className="text-sm text-muted-foreground">No spaces yet.</p>
        ) : (
          <div className="space-y-3">
            {spaces.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-3 rounded-xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{s.name}</span>
                    {s.is_default && <Badge variant="secondary">Default</Badge>}
                    <Badge variant={s.status === "active" ? "default" : "destructive"}>{s.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Plan: {s.plan} · {s.member_count} member{s.member_count === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setManagingMembers(s)}>
                    <Users className="h-4 w-4" /> Members
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditing(s)}>
                    <Settings2 className="h-4 w-4" /> Plan
                  </Button>
                  {!s.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toggleStatus.mutate({ id: s.id, status: s.status === "active" ? "suspended" : "active" })
                      }
                    >
                      {s.status === "active" ? (
                        <>
                          <Pause className="h-4 w-4" /> Suspend
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" /> Activate
                        </>
                      )}
                    </Button>
                  )}
                  {!s.is_default && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {s.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently deletes the Space and ALL of its data (leads, conversations, workflows,
                            settings). This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => remove.mutate(s.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsCard>

      {editing && <EditPlanDialog space={editing} onClose={() => setEditing(null)} onSaved={invalidate} />}
      {managingMembers && (
        <MembersDialog space={managingMembers} onClose={() => setManagingMembers(null)} />
      )}
    </div>
  );
}

function EditPlanDialog({ space, onClose, onSaved }: { space: SpaceRow; onClose: () => void; onSaved: () => void }) {
  const updateFn = useServerFn(updateSpace);
  const [plan, setPlan] = useState(space.plan);
  const [flags, setFlags] = useState<Record<string, boolean>>({ ...space.feature_flags });
  const [limits, setLimits] = useState<Record<string, number>>({ ...space.limits });

  const save = useMutation({
    mutationFn: () =>
      updateFn({ data: { id: space.id, plan, feature_flags: flags, limits } }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null };
      if (!res.ok) return toast.error(res.error ?? "Failed to save");
      toast.success("Plan updated");
      onSaved();
      onClose();
    },
    onError: () => toast.error("Failed to save plan"),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{space.name} — Access Plan</DialogTitle>
          <DialogDescription>Control which features and limits apply to this Space.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label>Plan label</Label>
            <Input value={plan} onChange={(e) => setPlan(e.target.value)} />
          </div>
          <div className="space-y-3">
            <Label>Features</Label>
            {FLAG_DEFS.map((f) => (
              <div key={f.key} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span className="text-sm">{f.label}</span>
                <Switch
                  checked={flags[f.key] ?? false}
                  onCheckedChange={(v) => setFlags((p) => ({ ...p, [f.key]: v }))}
                />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <Label>Usage limits</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {LIMIT_DEFS.map((l) => (
                <div key={l.key} className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{l.label}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={limits[l.key] ?? 0}
                    onChange={(e) => setLimits((p) => ({ ...p, [l.key]: Number(e.target.value) }))}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface MemberRow {
  id: string;
  user_id: string;
  role: string;
  email: string | null;
  full_name: string | null;
}
interface AssignableUser {
  user_id: string;
  email: string | null;
  full_name: string | null;
}

function MembersDialog({ space, onClose }: { space: SpaceRow; onClose: () => void }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listSpaceMembers);
  const addFn = useServerFn(addSpaceMember);
  const removeFn = useServerFn(removeSpaceMember);

  const { data, isLoading } = useQuery({
    queryKey: ["space-members", space.id],
    queryFn: () => listFn({ data: { spaceId: space.id } }),
  });
  const members = (data?.members ?? []) as MemberRow[];
  const users = (data?.users ?? []) as AssignableUser[];

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "agent">("agent");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["space-members", space.id] });
  const invalidateSpaces = () => qc.invalidateQueries({ queryKey: ["spaces"] });

  const add = useMutation({
    mutationFn: () => addFn({ data: { spaceId: space.id, userId: selectedUser, role: selectedRole } }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null };
      if (!res.ok) return toast.error(res.error ?? "Failed to add member");
      toast.success("Member added");
      setSelectedUser("");
      invalidate();
      invalidateSpaces();
    },
    onError: () => toast.error("Failed to add member"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeFn({ data: { id } }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null };
      if (!res.ok) return toast.error(res.error ?? "Failed to remove member");
      toast.success("Member removed");
      invalidate();
      invalidateSpaces();
    },
    onError: () => toast.error("Failed to remove member"),
  });

  const userLabel = useMemo(
    () => (u: AssignableUser) => u.full_name ? `${u.full_name} (${u.email ?? "no email"})` : u.email ?? u.user_id,
    [],
  );

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{space.name} — Members</DialogTitle>
          <DialogDescription>
            Assign existing platform users to this Space. Super admins are not members; they manage all Spaces.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-[1fr_130px_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label className="text-xs">User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">No users to add</div>
                  ) : (
                    users.map((u) => (
                      <SelectItem key={u.user_id} value={u.user_id}>
                        {userLabel(u)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as "admin" | "agent")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => add.mutate()} disabled={!selectedUser || add.isPending}>
              {add.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet.</p>
          ) : (
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{m.full_name ?? m.email ?? m.user_id}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.email} · {m.role}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove.mutate(m.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
