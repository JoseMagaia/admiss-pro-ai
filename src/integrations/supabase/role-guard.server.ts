// Server-only helper to validate the requesting user's role from the bearer token.
import { getRequest } from "@tanstack/react-start/server";
import type { AppRole } from "@/lib/roles";

export interface RequestUser {
  userId: string;
  email: string | null;
  role: AppRole | null;
}

export async function getRequestUser(): Promise<RequestUser | null> {
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  const { supabaseAdmin } = await import("./client.server");
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;

  const { data: roleRow } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return {
    userId: data.user.id,
    email: data.user.email ?? null,
    role: (roleRow?.role as AppRole) ?? null,
  };
}

// Throws if the requester is not authenticated or lacks one of the allowed roles.
export async function assertRole(allowed: AppRole[]): Promise<RequestUser> {
  const user = await getRequestUser();
  if (!user) throw new Error("Unauthorized: please sign in");
  if (!user.role || !allowed.includes(user.role)) {
    throw new Error("Forbidden: insufficient permissions");
  }
  return user;
}
