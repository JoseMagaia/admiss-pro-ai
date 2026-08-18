// One-off database bootstrap + seed for self-hosted installs.
// Runs the same initialization the server performs on first boot
// (schema, local auth tables, default space, tenant scoping, super-admin
// seed) against a file-backed PGlite directory, then exits.
//
// Usage:
//   PGLITE_DATA_DIR=/var/lib/admiss-pro/data \
//   LOCAL_ADMIN_EMAIL=admin@example.com \
//   LOCAL_ADMIN_PASSWORD='change-me' \
//   bun run scripts/init-db.ts
import { getDb, getUserByEmail, hasSuperAdmin } from "../src/lib/local-db/db.server";

async function main() {
  const dataDir = process.env.PGLITE_DATA_DIR || ".pglite";
  const email = process.env.LOCAL_ADMIN_EMAIL || "admin@linkmoore.local";

  console.log(`[db:init] Initializing local database at: ${dataDir}`);

  // getDb() runs applySchema → ensureAuthTables → seed → ensureTenantScoping.
  const db = await getDb();

  const { rows } = (await db.query(
    `SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public'`,
  )) as { rows: Array<{ n: number }> };
  const tableCount = rows[0]?.n ?? 0;
  console.log(`[db:init] Schema applied: ${tableCount} tables`);

  const admin = await getUserByEmail(email);
  const superAdmin = await hasSuperAdmin();

  if (tableCount === 0 || !admin || !superAdmin) {
    console.error(
      `[db:init] Bootstrap incomplete (tables=${tableCount}, admin=${Boolean(admin)}, super_admin=${superAdmin}).`,
    );
    process.exit(1);
  }

  console.log(`[db:init] Super admin ready: ${admin.email}`);
  console.log("[db:init] DB INIT OK");
  await db.close().catch(() => {});
}

main().catch((e) => {
  console.error("[db:init] FAILED:", e);
  process.exit(1);
});
