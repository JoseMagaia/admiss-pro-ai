import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const schema = readFileSync("src/lib/local-db/schema.sql", "utf8");

// Split by ; at line ends, respecting dollar-quote blocks.
const blocks = [];
const masked = schema.replace(/\$\$[\s\S]*?\$\$/g, (m) => {
  blocks.push(m);
  return `__B${blocks.length - 1}__`;
});
const statements = masked
  .split(";\n")
  .map((s) => s.replace(/__B(\d+)__/g, (_, i) => blocks[Number(i)]))
  .map((s) => s.trim())
  .filter(Boolean);

console.log("statements:", statements.length);

const pg = new PGlite();
let ok = 0;
for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  try {
    await pg.exec(stmt);
    ok++;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`\nFAILED at statement ${i}: ${msg}`);
    console.log("--- statement ---");
    console.log(stmt.slice(0, 600));
    await pg.close();
    process.exit(1);
  }
}
console.log(`all ${ok} statements OK`);

// Verify tables exist.
const { rows } = await pg.query(
  `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
);
console.log("tables:", rows.length);
console.log(rows.map((r) => r.tablename).join(", "));

// Spot-check: insert a lead + update it (trigger fires), read back.
await pg.query(
  `INSERT INTO leads (phone_number, lead_name, qualification_status) VALUES ('+5511999999999', 'Test Lead', 'NEW_LEAD')`,
);
await pg.query(`UPDATE leads SET lead_name = 'Renamed' WHERE phone_number = '+5511999999999'`);
const lead = await pg.query(`SELECT * FROM leads WHERE phone_number = '+5511999999999'`);
console.log("lead after update:", JSON.stringify(lead.rows[0], (k, v) => (v instanceof Date ? v.toISOString() : v)));

// Spot-check: spaces + jsonb + arrays.
await pg.query(
  `INSERT INTO spaces (name, slug, status, plan, is_default, feature_flags, limits)
   VALUES ('Default', 'default', 'active', 'pro', true, '{"a":true}'::jsonb, '{"max_users":25}'::jsonb)`,
);
const sp = await pg.query(`SELECT * FROM spaces WHERE is_default = true`);
console.log("space:", JSON.stringify(sp.rows[0], (k, v) => (v instanceof Date ? v.toISOString() : v)));

await pg.close();
console.log("SCHEMA VALID");
