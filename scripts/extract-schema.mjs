// Extracts a PGlite-friendly consolidated schema from supabase/migrations.
// - Keeps: CREATE TABLE, ALTER TABLE ... ADD COLUMN, CREATE TYPE, CREATE INDEX,
//   the set_updated_at() function + triggers.
// - Strips: RLS policies, grants, auth.* references, trigger functions that
//   touch auth, comments.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = "supabase/migrations";
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
let all = "";
for (const f of files) {
  all += readFileSync(join(dir, f), "utf8") + "\n";
}

// Protect dollar-quoted bodies ($$ ... $$) so they survive naive ; splitting.
const protectedBlocks = [];
all = all.replace(/\$\$[\s\S]*?\$\$/g, (m) => {
  protectedBlocks.push(m);
  return `__DQ_BLOCK_${protectedBlocks.length - 1}__`;
});

const statements = all
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

const out = [];
for (const raw of statements) {
  let s = raw;
  // Restore dollar-quoted blocks.
  s = s.replace(/__DQ_BLOCK_(\d+)__/g, (_, i) => protectedBlocks[Number(i)]);

  const head = s.slice(0, 120).toUpperCase();

  // Skip RLS / policies / grants / auth schema stuff.
  if (/CREATE POLICY|DROP POLICY|ENABLE ROW LEVEL|DISABLE ROW LEVEL|GRANT |REVOKE |SECURITY LABEL/.test(head)) continue;
  if (/TO AUTHENTICATED|TO ANON|TO SERVICE_ROLE|TO PUBLIC/.test(head)) continue;

  // Skip extensions we can't load in PGlite (pg_cron, etc).
  if (/CREATE EXTENSION/.test(head)) {
    if (/pg_cron|pg_net|vector/.test(s)) continue;
  }

  // Skip functions other than the updated_at trigger helpers.
  if (/CREATE (OR REPLACE )?FUNCTION/.test(head)) {
    if (/updated_at/.test(s)) {
      s = s.replace(/public\./g, "");
      out.push(s);
    }
    continue;
  }

  const keep =
    /CREATE TABLE/.test(head) ||
    /CREATE TYPE/.test(head) ||
    /CREATE INDEX/.test(head) ||
    /CREATE UNIQUE INDEX/.test(head) ||
    /ALTER TABLE/.test(head) ||
    /CREATE TRIGGER/.test(head) ||
    /DROP TABLE IF EXISTS/.test(head);

  if (!keep) continue;

  // Drop "public." schema qualification.
  s = s.replace(/public\./g, "");

  // Replace numeric with double precision so PGlite returns JS numbers.
  s = s.replace(/\bnumeric\b/g, "double precision");

  // Strip auth.* default expressions (e.g. DEFAULT auth.uid()).
  s = s.replace(/DEFAULT\s+auth\.[a-z_]+\(\)/gi, "");
  // Remove FK references into auth.* (including any trailing ON DELETE/UPDATE).
  s = s.replace(/REFERENCES\s+auth\.[a-z_.]+(\s*\([^)]*\))?(\s+ON\s+(DELETE|UPDATE)\s+[A-Z ]+)?/gi, "");
  s = s.replace(/auth\.uid\(\)/gi, "NULL");

  out.push(s);
}

const header = `-- Consolidated local schema generated from supabase/migrations
-- for @electric-sql/pglite (in-process Postgres). RLS/policies/auth grants
-- removed; numeric -> double precision; auth.* defaults stripped.

`;
writeFileSync("src/lib/local-db/schema.sql", header + out.join(";\n\n") + ";\n");
console.log(`Wrote ${out.length} statements to src/lib/local-db/schema.sql`);
console.log(`Size: ${(header + out.join(";\n\n") + ";\n").length} bytes`);
