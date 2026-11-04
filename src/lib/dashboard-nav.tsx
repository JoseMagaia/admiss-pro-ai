import { createContext, useContext } from "react";

export interface DashboardNav {
  /** Switch to the Messages tab and open the conversation for this phone number. */
  openConversation: (phone: string) => void;
  /** Header search text; each tab filters its own rows by it. */
  globalQuery?: string;
}

/** Case-insensitive match on name or phone (digits-aware). */
export function matchesQuery(q: string, name?: string | null, phone?: string | null, ...extra: (string | null | undefined)[]): boolean {
  const t = q.trim().toLowerCase();
  if (!t) return true;
  const digits = t.replace(/\D/g, "");
  if (name?.toLowerCase().includes(t)) return true;
  if (phone && (phone.toLowerCase().includes(t) || (digits.length >= 2 && phone.replace(/\D/g, "").includes(digits)))) return true;
  return extra.some((e) => e?.toLowerCase().includes(t));
}

const DashboardNavContext = createContext<DashboardNav | null>(null);

export const DashboardNavProvider = DashboardNavContext.Provider;

export function useDashboardNav(): DashboardNav {
  const ctx = useContext(DashboardNavContext);
  // Fall back to a no-op so components remain usable outside the dashboard shell.
  return ctx ?? { openConversation: () => {}, globalQuery: "" };
}
