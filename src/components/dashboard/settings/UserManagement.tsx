import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { UserPlus, Trash2, Loader2 } from "lucide-react";
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
import { SettingsCard } from "./SettingsForms";
import { listUsers, createUser, updateUserRole, deleteUser, setUserPermission } from "@/lib/auth.functions";
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
                <div className="flex items-center gap-2">
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
