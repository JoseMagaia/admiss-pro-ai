import { useEffect, useState } from "react";

// Returns an absolute, publicly reachable URL for a given app path, based on the
// current origin. Used to show external services (e.g. Twilio) where to send
// webhooks. Falls back to a relative path during SSR.
export function useProjectUrl(path: string): string {
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);
  const clean = path.startsWith("/") ? path : `/${path}`;
  return origin ? `${origin}${clean}` : clean;
}
