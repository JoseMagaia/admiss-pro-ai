import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { UserPlus, Trash2, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SettingsCard } from "./SettingsForms";
import { listUsers, createUser, updateUserRole, deleteUser, setUserPermission, updateUserCredentials } from "@/lib/auth.functions";
import { ALL_ROLES, ROLE_LABELS, ADVANCED_PERMISSION, type AppRole } from "@/lib/roles";

interface UserRow {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  permissions: string[];
  created_at: string;
}

export function UserManagement() {
  const qc = useQueryClient();
  const listFn = useServerFn(listUsers);
  const createFn = useServerFn(createUser);
  const roleFn = useServerFn(updateUserRole);
  const deleteFn = useServerFn(deleteUser);
  const permFn = useServerFn(setUserPermission);
  const credsFn = useServerFn(updateUserCredentials);

  const { data, isLoading } = useQuery({ queryKey: ["platform-users"], queryFn: () => listFn() });
  const users = (data?.users ?? []) as UserRow[];

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole>("agent");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["platform-users"] });

  const create = useMutation({
    mutationFn: () => createFn({ data: { email, password, full_name: fullName, role } }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null };
      if (!res.ok) return toast.error(res.error ?? "Failed to create user");
      toast.success("User created");
      setEmail("");
      setFullName("");
      setPassword("");
      setRole("agent");
      invalidate();
    },
    onError: () => toast.error("Failed to create user"),
  });

  const changeRole = useMutation({
    mutationFn: (vars: { user_id: string; role: AppRole }) => roleFn({ data: vars }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null };
      if (!res.ok) return toast.error(res.error ?? "Failed to update role");
      toast.success("Role updated");
      invalidate();
    },
    onError: () => toast.error("Failed to update role"),
  });

  const changePermission = useMutation({
    mutationFn: (vars: { user_id: string; permission: string; enabled: boolean }) => permFn({ data: vars }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null };
      if (!res.ok) return toast.error(res.error ?? "Failed to update access");
      toast.success("Access updated");
      invalidate();
    },
    onError: () => toast.error("Failed to update access"),
  });

  const remove = useMutation({
    mutationFn: (user_id: string) => deleteFn({ data: { user_id } }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null };
      if (!res.ok) return toast.error(res.error ?? "Failed to delete user");
      toast.success("User deleted");
      invalidate();
    },
    onError: () => toast.error("Failed to delete user"),
  });

  return (
    <div className="space-y-6">
      <SettingsCard title="Create User" description="Add a team member and assign their role. They sign in with the email and password you set.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Temporary Password</Label>
            <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AppRole)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button
          onClick={() => create.mutate()}
          disabled={create.isPending || !email || !fullName || password.length < 8}
        >
          {create.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <UserPlus className="mr-1 h-4 w-4" />}
          Create User
        </Button>
      </SettingsCard>

      <SettingsCard title="Platform Users" description="Manage roles and access for everyone on the platform.">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users yet.</p>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.user_id}
                className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{u.full_name ?? "—"}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {u.role !== "super_admin" && (
                    <label
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                      title="Grants access to the Advanced area (Reports & Opportunities)"
                    >
                      <input
                        type="checkbox"
                        checked={u.permissions?.includes(ADVANCED_PERMISSION) ?? false}
                        onChange={(e) =>
                          changePermission.mutate({
                            user_id: u.user_id,
                            permission: ADVANCED_PERMISSION,
                            enabled: e.target.checked,
                          })
                        }
                      />
                      Advanced
                    </label>
                  )}
                  <select
                    value={u.role ?? "agent"}
                    onChange={(e) => changeRole.mutate({ user_id: u.user_id, role: e.target.value as AppRole })}
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                  <EditCredentialsDialog
                    user={u}
                    onSave={async (payload) => {
                      const r = (await credsFn({ data: payload })) as { ok: boolean; error: string | null };
                      if (!r.ok) {
                        toast.error(r.error ?? "Failed to update credentials");
                        return false;
                      }
                      toast.success("Credentials updated");
                      invalidate();
                      return true;
                    }}
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this user?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently removes {u.email}'s account and access. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove.mutate(u.user_id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsCard>
    </div>
  );
}

interface CredsPayload {
  user_id: string;
  email?: string;
  password?: string;
  full_name?: string;
}

function EditCredentialsDialog({
  user,
  onSave,
}: {
  user: UserRow;
  onSave: (payload: CredsPayload) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState(user.full_name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const payload: CredsPayload = { user_id: user.user_id };
    if (fullName && fullName !== user.full_name) payload.full_name = fullName;
    if (email && email !== user.email) payload.email = email;
    if (password.length >= 8) payload.password = password;
    if (!payload.email && !payload.password && !payload.full_name) {
      toast.error("Change at least one field (password must be 8+ chars).");
      setSaving(false);
      return;
    }
    const ok = await onSave(payload);
    setSaving(false);
    if (ok) {
      setPassword("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" title="Edit credentials">
          <KeyRound className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Access Credentials</DialogTitle>
          <DialogDescription>
            Update {user.email}'s login email, password, or name. Leave password blank to keep it unchanged.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>New Password</Label>
            <Input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
            <p className="text-xs text-muted-foreground">Minimum 8 characters when changing.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
