// Server-only helper to validate the requesting user's role from the local
// session bearer token.
import { getRequest } from "@tanstack/react-start/server";
import type { AppRole } from "@/lib/roles";
import { getUserBySession, getRoleForUser } from "@/lib/local-db/db.server";

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

  const user = await getUserBySession(token);
  if (!user) return null;

  const role = (await getRoleForUser(user.id)) as AppRole | null;
  return {
    userId: user.id,
    email: user.email ?? null,
    role,
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
