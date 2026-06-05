import { createContext, useContext } from "react";

export interface DashboardNav {
  /** Switch to the Messages tab and open the conversation for this phone number. */
  openConversation: (phone: string) => void;
}

const DashboardNavContext = createContext<DashboardNav | null>(null);

export const DashboardNavProvider = DashboardNavContext.Provider;

export function useDashboardNav(): DashboardNav {
  const ctx = useContext(DashboardNavContext);
  // Fall back to a no-op so components remain usable outside the dashboard shell.
  return ctx ?? { openConversation: () => {} };
}
