// Client middleware that attaches the local session token (stored in
// localStorage by client.ts) to every server-function call as a Bearer token.
import { createMiddleware } from "@tanstack/react-start";
import { SESSION_STORAGE_KEY } from "./client";

// Must be registered as a global `functionMiddleware` in `src/start.ts`; otherwise
// the browser never attaches the bearer token to serverFn RPCs.
export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    let token: string | null = null;
    if (typeof window !== "undefined") {
      try {
        token = window.localStorage.getItem(SESSION_STORAGE_KEY);
      } catch {
        token = null;
      }
    }
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
)
