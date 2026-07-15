import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

// Supabase client bound to the OAuth caller's bearer token so RLS scopes
// every read AND write to the user's space and role.
export function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function unauth() {
  return { content: [{ type: "text" as const, text: "Not authenticated" }], isError: true };
}

export function ok<T>(data: T, key = "result") {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data) }],
    structuredContent: { [key]: data } as Record<string, unknown>,
  };
}

export function err(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}
