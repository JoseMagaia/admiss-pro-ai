// Local in-process Postgres (PGlite) — replaces the remote Supabase database.
// Everything here is server-only; never import this module from client code.
import { PGlite } from "@electric-sql/pglite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import schemaSql from "./schema.sql?raw";

let _pg: PGlite | null = null;
let _ready: Promise<PGlite> | null = null;

// Prefer a file-backed database so data survives server restarts; fall back to
// in-memory when the filesystem is not writable (e.g. some hosted runtimes).
function resolveDataDir(): string | undefined {
  if (process.env.PGLITE_DATA_DIR) return process.env.PGLITE_DATA_DIR;
  try {
    const dir = join(process.cwd(), ".pglite");
    mkdirSync(dir, { recursive: true });
    return dir;
  } catch {
    return undefined;
  }
}

function createPglite(): PGlite {
  const dir = resolveDataDir();
  try {
    return dir ? new PGlite(dir) : new PGlite();
  } catch (e) {
    console.warn("[local-db] File-backed PGlite failed, falling back to in-memory:", e);
    return new PGlite();
  }
}

// Split SQL on top-level semicolons, respecting strings, comments and
// dollar-quoted bodies (PL/pgSQL functions).
function splitStatements(sql: string): string[] {
  const out: string[] = [];
  let cur = "";
  let i = 0;
  let inSingle = false;
  let inDouble = false;
  let inLine = false;
  let inBlock = false;
  let dollar: string | null = null;
  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1];
    if (inLine) {
      cur += ch;
      if (ch === "\n") inLine = false;
      i++;
      continue;
    }
    if (inBlock) {
      cur += ch;
      if (ch === "*" && next === "/") {
        cur += "/";
        i += 2;
        inBlock = false;
        continue;
      }
      i++;
      continue;
    }
    if (dollar) {
      if (sql.startsWith(dollar, i)) {
        cur += dollar;
        i += dollar.length;
        dollar = null;
        continue;
      }
      cur += ch;
      i++;
      continue;
    }
    if (!inSingle && !inDouble && ch === "-" && next === "-") {
      inLine = true;
      cur += ch;
      i++;
      continue;
    }
    if (!inSingle && !inDouble && ch === "/" && next === "*") {
      inBlock = true;
      cur += ch;
      i++;
      continue;
    }
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      cur += ch;
      i++;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      cur += ch;
      i++;
      continue;
    }
    if (!inSingle && !inDouble && ch === "$") {
      const m = sql.slice(i).match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|\$\$/);
      if (m) {
        dollar = m[0];
        cur += dollar;
        i += dollar.length;
        continue;
      }
    }
    if (ch === ";" && !inSingle && !inDouble) {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
      i++;
      continue;
    }
    cur += ch;
    i++;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// Apply the consolidated schema. CREATE statements that already exist are
// ignored so re-boots are idempotent; any other failure is fatal.
async function applySchema(pg: PGlite): Promise<void> {
  const IGNORE =
    /already exists|duplicate_object|duplicate (table|trigger|index|type|function|column|key|constraint)/i;
  for (const stmt of splitStatements(schemaSql)) {
    try {
      await pg.exec(stmt);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (IGNORE.test(msg)) continue;
      console.error("[local-db] schema statement failed:", msg.slice(0, 400), "\nSQL:", stmt.slice(0, 240));
      throw e;
    }
  }
}

// Local auth tables (replaces Supabase Auth users/sessions).
async function ensureAuthTables(pg: PGlite): Promise<void> {
  await pg.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL UNIQUE,
      password_hash text NOT NULL,
      full_name text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token text NOT NULL UNIQUE,
      created_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz NOT NULL,
      last_seen_at timestamptz
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (token);
  `);
}

// Seed a Default Space and a bootstrap super admin so the app is usable
// immediately after first boot. Credentials are printed once on first seed.
async function seed(pg: PGlite): Promise<void> {
  await pg.exec(
    `INSERT INTO spaces (name, slug, is_default) VALUES ('Default Space', 'default', true)
     ON CONFLICT (slug) DO NOTHING;`,
  );

  const { rows } = (await pg.query(`SELECT count(*)::int AS n FROM users`)) as { rows: Array<{ n: number }> };
  if (Number(rows[0]?.n ?? 0) > 0) return;

  const email = process.env.LOCAL_ADMIN_EMAIL || "admin@linkmoore.local";
  const password = process.env.LOCAL_ADMIN_PASSWORD || "admin1234";
  const passwordHash = hashPassword(password);
  const res = (await pg.query(
    `INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id`,
    [email, passwordHash, "Platform Admin"],
  )) as { rows: Array<{ id: string }> };
  const userId = res.rows[0]?.id as string;
  await pg.query(`INSERT INTO profiles (user_id, email, full_name) VALUES ($1, $2, $3)`, [
    userId,
    email,
    "Platform Admin",
  ]);
  await pg.query(`INSERT INTO user_roles (user_id, role) VALUES ($1, 'super_admin')`, [userId]);
  const sp = (await pg.query(`SELECT id FROM spaces WHERE is_default = true LIMIT 1`)) as {
    rows: Array<{ id: string }>;
  };
  if (sp.rows[0]?.id) {
    await pg.query(
      `INSERT INTO space_members (space_id, user_id, role) VALUES ($1, $2, 'admin')
       ON CONFLICT (space_id, user_id) DO NOTHING`,
      [sp.rows[0].id, userId],
    );
  }
  console.log(`[local-db] Seeded admin account: ${email} / ${password}`);
}

// Guarantees the platform owner account always exists with super_admin rights,
// even on a database that already has users (e.g. after a reset or restore).
async function ensureBootstrapAdmin(pg: PGlite): Promise<void> {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL || "jamagaia7@gmail.com";
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || "Linkmoore0204";
  const fullName = "Platform Owner";

  const found = (await pg.query(`SELECT id FROM users WHERE lower(email) = lower($1) LIMIT 1`, [email])) as {
    rows: Array<{ id: string }>;
  };
  let userId = found.rows[0]?.id ?? null;

  if (!userId) {
    const res = (await pg.query(
      `INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id`,
      [email, hashPassword(password), fullName],
    )) as { rows: Array<{ id: string }> };
    userId = res.rows[0]?.id ?? null;
    if (!userId) return;
    console.log(`[local-db] Bootstrap super admin created: ${email}`);
  }

  await pg.query(
    `INSERT INTO profiles (user_id, email, full_name) VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email`,
    [userId, email, fullName],
  );
  await pg.query(`DELETE FROM user_roles WHERE user_id = $1 AND role <> 'super_admin'`, [userId]);
  await pg.query(
    `INSERT INTO user_roles (user_id, role) VALUES ($1, 'super_admin') ON CONFLICT DO NOTHING`,
    [userId],
  );
  const sp = (await pg.query(`SELECT id FROM spaces WHERE is_default = true LIMIT 1`)) as {
    rows: Array<{ id: string }>;
  };
  if (sp.rows[0]?.id) {
    await pg
      .query(
        `INSERT INTO space_members (space_id, user_id, role) VALUES ($1, $2, 'admin')
         ON CONFLICT (space_id, user_id) DO NOTHING`,
        [sp.rows[0].id, userId],
      )
      .catch(() => {});
  }
}

// Tenant tables that carry a space_id. Mirrors the original Supabase migration
// "20260610232814" which added the column to every space-scoped table. The
// ALTERs are idempotent so re-boots (and tables created later, like
// calendar_settings / jitsi_settings) are safe.
const TENANT_TABLES = [
  "leads",
  "conversations",
  "whatsapp_messages",
  "appointments",
  "education_settings",
  "ai_configuration",
  "ai_variables",
  "prompt_versions",
  "http_actions",
  "chatwoot_workspaces",
  "scheduled_messages",
  "responder_agents",
  "workflows",
  "workflow_enrollments",
  "lead_opportunities",
  "meeting_outcomes",
  "offers",
  "stage_opportunity_settings",
  "report_conversations",
  "ai_provider_pool",
  "audit_logs",
  "voip_settings",
  "calls",
  "call_callbacks",
  "dial_campaigns",
  "dial_campaign_members",
  "ring_groups",
  "ring_group_members",
  "inbound_routes",
  "calendar_settings",
  "jitsi_settings",
];

// Add space_id to every tenant table, backfill existing rows into the default
// space, then build the per-space unique indexes from the original migration.
async function ensureTenantScoping(pg: PGlite): Promise<void> {
  for (const t of TENANT_TABLES) {
    try {
      await pg.exec(
        `ALTER TABLE "${t}" ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE`,
      );
    } catch (e) {
      console.warn(`[local-db] Could not scope table ${t}:`, (e as Error).message.slice(0, 160));
    }
  }
  // Backfill rows that were created before scoping existed.
  const sp = (await pg.query(`SELECT id FROM spaces WHERE is_default = true LIMIT 1`)) as {
    rows: Array<{ id: string }>;
  };
  const defId = sp.rows[0]?.id;
  if (defId) {
    for (const t of TENANT_TABLES) {
      try {
        await pg.query(`UPDATE "${t}" SET space_id = $1 WHERE space_id IS NULL`, [defId]);
      } catch {
        // Table may not exist yet; ignore.
      }
    }
  }
  try {
    await pg.exec(`
      ALTER TABLE workflow_enrollments ADD COLUMN IF NOT EXISTS context jsonb;
      ALTER TABLE chatwoot_workspaces ADD COLUMN IF NOT EXISTS waba_phone_number_id text;
      ALTER TABLE chatwoot_workspaces ADD COLUMN IF NOT EXISTS waba_business_account_id text;
      ALTER TABLE chatwoot_workspaces ADD COLUMN IF NOT EXISTS waba_access_token text;
      ALTER TABLE chatwoot_workspaces ADD COLUMN IF NOT EXISTS waba_api_version text NOT NULL DEFAULT 'v21.0';
      ALTER TABLE chatwoot_workspaces ADD COLUMN IF NOT EXISTS waba_verify_token text;
      ALTER TABLE chatwoot_workspaces ADD COLUMN IF NOT EXISTS waba_app_secret text;
      ALTER TABLE chatwoot_workspaces ADD COLUMN IF NOT EXISTS waba_display_name text;
      CREATE UNIQUE INDEX IF NOT EXISTS leads_space_phone_idx ON leads (space_id, phone_number);
      CREATE UNIQUE INDEX IF NOT EXISTS ai_variables_space_name_idx ON ai_variables (space_id, variable_name);
      CREATE UNIQUE INDEX IF NOT EXISTS stage_opportunity_settings_space_stage_idx ON stage_opportunity_settings (space_id, stage);
      CREATE INDEX IF NOT EXISTS idx_leads_space ON leads (space_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_space ON conversations (space_id);
      CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_space ON whatsapp_messages (space_id);
      CREATE INDEX IF NOT EXISTS idx_workflows_space ON workflows (space_id);
      CREATE INDEX IF NOT EXISTS idx_workflow_enrollments_space ON workflow_enrollments (space_id);
    `);
  } catch (e) {
    console.warn("[local-db] Tenant indexes skipped:", (e as Error).message.slice(0, 160));
  }
}

async function init(): Promise<PGlite> {
  if (!_pg) _pg = createPglite();
  await _pg.waitReady;
  await applySchema(_pg);
  await ensureAuthTables(_pg);
  await seed(_pg);
  await ensureBootstrapAdmin(_pg);
  await ensureTenantScoping(_pg);
  return _pg;
}

/** Singleton accessor for the local Postgres instance. */
export function getDb(): Promise<PGlite> {
  if (!_ready) _ready = init();
  return _ready;
}

/* ------------------------- Local auth primitives ------------------------- */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const idx = stored.indexOf(":");
  if (idx <= 0) return false;
  const salt = stored.slice(0, idx);
  const expectedHex = stored.slice(idx + 1);
  try {
    const candidate = scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, "hex");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const db = await getDb();
  await db.query(`INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)`, [
    userId,
    token,
    expiresAt,
  ]);
  return token;
}

export interface LocalUser {
  id: string;
  email: string | null;
  full_name: string | null;
}

export async function getUserBySession(token: string): Promise<LocalUser | null> {
  const db = await getDb();
  const { rows } = (await db.query(
    `SELECT u.id, u.email, u.full_name
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = $1 AND s.expires_at > now()`,
    [token],
  )) as { rows: Array<{ id: string; email: string | null; full_name: string | null }> };
  const row = rows[0];
  if (!row) return null;
  await db.query(`UPDATE sessions SET last_seen_at = now() WHERE token = $1`, [token]).catch(() => {});
  return { id: row.id, email: row.email, full_name: row.full_name };
}

export async function getUserByEmail(email: string): Promise<LocalUser | null> {
  const db = await getDb();
  const { rows } = (await db.query(`SELECT id, email, full_name FROM users WHERE lower(email) = lower($1)`, [
    email,
  ])) as { rows: Array<{ id: string; email: string; full_name: string | null }> };
  const row = rows[0];
  return row ? { id: row.id, email: row.email, full_name: row.full_name } : null;
}

export async function getRoleForUser(userId: string): Promise<string | null> {
  const db = await getDb();
  const { rows } = (await db.query(
    `SELECT role FROM user_roles WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1`,
    [userId],
  )) as { rows: Array<{ role: string }> };
  return rows[0]?.role ?? null;
}

export async function deleteSessionByToken(token: string): Promise<void> {
  const db = await getDb();
  await db.query(`DELETE FROM sessions WHERE token = $1`, [token]);
}

/** Creates a local user with profile, role and default-space membership. */
export async function createLocalUser(args: {
  email: string;
  password: string;
  full_name: string;
  role: "super_admin" | "admin" | "agent";
}): Promise<LocalUser> {
  const db = await getDb();
  const passwordHash = hashPassword(args.password);
  const res = (await db.query(
    `INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id`,
    [args.email, passwordHash, args.full_name],
  )) as { rows: Array<{ id: string }> };
  const userId = res.rows[0]?.id as string;
  await db.query(`INSERT INTO profiles (user_id, email, full_name) VALUES ($1, $2, $3)`, [
    userId,
    args.email,
    args.full_name,
  ]);
  await db.query(`INSERT INTO user_roles (user_id, role) VALUES ($1, $2)`, [userId, args.role]);
  const sp = (await db.query(`SELECT id FROM spaces WHERE is_default = true LIMIT 1`)) as {
    rows: Array<{ id: string }>;
  };
  if (sp.rows[0]?.id) {
    await db
      .query(
        `INSERT INTO space_members (space_id, user_id, role) VALUES ($1, $2, $3)
         ON CONFLICT (space_id, user_id) DO NOTHING`,
        [sp.rows[0].id, userId, args.role],
      )
      .catch(() => {});
  }
  return { id: userId, email: args.email, full_name: args.full_name };
}

export async function deleteLocalUser(userId: string): Promise<void> {
  const db = await getDb();
  await db.query(`DELETE FROM profiles WHERE user_id = $1`, [userId]);
  await db.query(`DELETE FROM user_roles WHERE user_id = $1`, [userId]);
  await db.query(`DELETE FROM user_permissions WHERE user_id = $1`, [userId]);
  await db.query(`DELETE FROM space_members WHERE user_id = $1`, [userId]);
  await db.query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
  await db.query(`DELETE FROM users WHERE id = $1`, [userId]);
}

/** True when no super_admin exists (used to bootstrap the first signup as admin). */
export async function hasSuperAdmin(): Promise<boolean> {
  const db = await getDb();
  const { rows } = (await db.query(
    `SELECT count(*)::int AS n FROM user_roles WHERE role = 'super_admin'`,
  )) as { rows: Array<{ n: number }> };
  return Number(rows[0]?.n ?? 0) > 0;
}
