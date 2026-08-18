const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Admin",
  agent: "Agent"
};
const ALL_ROLES = ["super_admin", "admin", "agent"];
const TAB_ACCESS = {
  leads: ["super_admin", "admin", "agent"],
  messages: ["super_admin", "admin", "agent"],
  contacts: ["super_admin", "admin", "agent"],
  // directory of contacted people
  calls: ["super_admin", "admin", "agent"],
  // PBX / VoIP dialer
  bookings: ["super_admin", "admin", "agent"],
  pipeline: ["super_admin", "admin", "agent"],
  meeting_outcomes: ["super_admin", "admin"],
  // record specialist meeting results (no agent)
  orchestration: ["super_admin"],
  // visual workflow builder + responder agents
  settings: ["super_admin", "admin"]
  // agent: no settings
};
const SETTINGS_ACCESS = {
  company: ["super_admin", "admin"],
  programs: ["super_admin", "admin"],
  lab: ["super_admin", "admin"],
  prompt: ["super_admin"],
  // AI Prompt
  variables: ["super_admin"],
  // AI Variables
  chatwoot: ["super_admin"],
  // Chatwoot
  workspaces: ["super_admin"],
  // Chatwoot workspaces (multi-inbox)
  actions: ["super_admin"],
  // HTTP Actions
  provider: ["super_admin"],
  // AI Provider (built-in vs own key)
  users: ["super_admin"],
  // User management
  spaces: ["super_admin"],
  // Spaces (multi-tenant sub-accounts)
  telephony: ["super_admin"],
  // VoIP / SIP / Twilio connection settings
  calendar: ["super_admin", "admin"],
  // Calendar & availability (booking slots)
  video: ["super_admin"]
  // Jitsi video call settings
};
const CALL_CAMPAIGN_ROLES = ["super_admin", "admin"];
function canManageCallCampaigns(role) {
  if (!role) return false;
  return CALL_CAMPAIGN_ROLES.includes(role);
}
function canAccessTab(role, tab) {
  if (!role) return false;
  return TAB_ACCESS[tab]?.includes(role) ?? false;
}
function canAccessSettingsSection(role, section) {
  if (!role) return false;
  return SETTINGS_ACCESS[section]?.includes(role) ?? false;
}
const ADVANCED_PERMISSION = "advanced";
function canAccessAdvanced(role, permissions) {
  if (role === "super_admin") return true;
  return (permissions ?? []).includes(ADVANCED_PERMISSION);
}
const ADVANCED_SECTIONS = ["reports", "opportunities"];
export {
  ALL_ROLES as A,
  CALL_CAMPAIGN_ROLES as C,
  ROLE_LABELS as R,
  ADVANCED_PERMISSION as a,
  canAccessTab as b,
  canAccessAdvanced as c,
  canManageCallCampaigns as d,
  ADVANCED_SECTIONS as e,
  canAccessSettingsSection as f
};
