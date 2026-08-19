// Client-safe role definitions and permission helpers (no secrets).
export type AppRole = "super_admin" | "admin" | "agent";

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  agent: "Agent",
};

export const ALL_ROLES: AppRole[] = ["super_admin", "admin", "agent"];

// Dashboard top-level tabs each role may access.
export const TAB_ACCESS: Record<string, AppRole[]> = {
  leads: ["super_admin", "admin", "agent"],
  messages: ["super_admin", "admin", "agent"],
  contacts: ["super_admin", "admin", "agent"], // directory of contacted people
  bookings: ["super_admin", "admin", "agent"],
  pipeline: ["super_admin", "admin", "agent"],
  meeting_outcomes: ["super_admin", "admin"], // record specialist meeting results (no agent)
  orchestration: ["super_admin"], // visual workflow builder + responder agents
  settings: ["super_admin", "admin"], // agent: no settings
};

// Settings sub-sections each role may access.
export const SETTINGS_ACCESS: Record<string, AppRole[]> = {
  company: ["super_admin", "admin"],
  programs: ["super_admin", "admin"],
  lab: ["super_admin", "admin"],
  prompt: ["super_admin"], // AI Prompt
  variables: ["super_admin"], // AI Variables
  chatwoot: ["super_admin"], // Chatwoot
  workspaces: ["super_admin"], // Chatwoot workspaces (multi-inbox)
  actions: ["super_admin"], // HTTP Actions
  provider: ["super_admin"], // AI Provider (built-in vs own key)
  users: ["super_admin"], // User management
  spaces: ["super_admin"], // Spaces (multi-tenant sub-accounts)
  ticketing: ["super_admin", "admin"], // Ticket queues, tags and broadcasts
  mcp: ["super_admin"], // Remote MCP server documentation & endpoints
};

export function canAccessTab(role: AppRole | null | undefined, tab: string): boolean {
  if (!role) return false;
  return TAB_ACCESS[tab]?.includes(role) ?? false;
}

export function canAccessSettingsSection(role: AppRole | null | undefined, section: string): boolean {
  if (!role) return false;
  return SETTINGS_ACCESS[section]?.includes(role) ?? false;
}

/* ----------------------- GRANULAR PERMISSIONS ----------------------- */
// Feature access granted per-user by a super admin (beyond their base role).
export const ADVANCED_PERMISSION = "advanced";

export const PERMISSION_LABELS: Record<string, string> = {
  [ADVANCED_PERMISSION]: "Advanced (Reports & Opportunities)",
};

export const ALL_PERMISSIONS = [ADVANCED_PERMISSION] as const;

// The Advanced area is always available to super admins, and to any user the
// super admin has granted the "advanced" permission to.
export function canAccessAdvanced(
  role: AppRole | null | undefined,
  permissions: string[] | null | undefined,
): boolean {
  if (role === "super_admin") return true;
  return (permissions ?? []).includes(ADVANCED_PERMISSION);
}

// Advanced sub-sections (mirrors the Settings sub-menu pattern).
export const ADVANCED_SECTIONS = ["reports", "opportunities"] as const;
export type AdvancedSection = (typeof ADVANCED_SECTIONS)[number];
