// Server middleware that validates the caller's local session token (sent as a
// Bearer token by the client auth attach middleware) against the sessions table.
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();

    if (!request?.headers) {
      throw new Error("Unauthorized: No request headers available");
    }

    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      throw new Error("Unauthorized: No authorization header provided");
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorized: Only Bearer tokens are supported");
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      throw new Error("Unauthorized: No token provided");
    }

    const { getUserBySession } = await import("@/lib/local-db/db.server");
    const user = await getUserBySession(token);
    if (!user) {
      throw new Error("Unauthorized: Invalid token");
    }

    return next({
      context: {
        userId: user.id,
        claims: { sub: user.id },
      },
    });
  },
);
