// Client middleware that attaches the active Space id to every server-function
// call so the server can scope data to the selected sub-account. The server
// always re-validates membership, so this header is a hint, not a trust anchor.
import { createMiddleware } from "@tanstack/react-start";

export const ACTIVE_SPACE_KEY = "activeSpaceId";

export const attachActiveSpace = createMiddleware({ type: "function" }).client(async ({ next }) => {
  let spaceId: string | null = null;
  try {
    if (typeof window !== "undefined") {
      spaceId = window.localStorage.getItem(ACTIVE_SPACE_KEY);
    }
  } catch {
    spaceId = null;
  }
  return next({
    headers: spaceId ? { "x-space-id": spaceId } : {},
  });
});
