// Boots the real local DB layer (schema bootstrap, seed, adapter).
import { getDb, verifyPassword, createSession, getUserBySession, hasSuperAdmin } from "../src/lib/local-db/db.server";
import { createLocalClient } from "../src/lib/local-db/query";

async function main() {
  const db = await getDb();
  const { rows } = await db.query(`SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public'`);
  console.log("tables:", rows[0].n);

  const c = createLocalClient();

  // seeded admin
  const { data: admin } = await c.from("users").select("email").maybeSingle();
  console.log("seeded admin email:", admin?.email);

  // adapter select + filter + single
  const { data: sp } = await c.from("spaces").select("id, name").eq("is_default", true).maybeSingle();
  console.log("default space:", sp?.name);

  // insert + select chain
  const insRes = await c
    .from("leads")
    .insert({ phone_number: "+15559998888", space_id: sp?.id ?? null })
    .select()
    .maybeSingle();
  console.log("insert result:", JSON.stringify(insRes));
  const lead = insRes.data as { id: string } | null;

  // update with filter
  const { data: upd } = await c
    .from("leads")
    .update({ qualification_status: "QUALIFIED" })
    .eq("id", lead?.id)
    .select()
    .maybeSingle();
  console.log("updated status:", upd?.qualification_status);

  // count head
  const { count } = await c.from("leads").select("id", { count: "exact", head: true });
  console.log("count:", count);

  // upsert
  const { data: ups } = await c
    .from("leads")
    .upsert({ phone_number: "+15559998888", space_id: sp?.id ?? null, qualification_status: "DISQUALIFIED" }, { onConflict: "space_id,phone_number" })
    .select()
    .maybeSingle();
  console.log("upsert status:", ups?.qualification_status);

  // in + ilike
  const { data: leads } = await c
    .from("leads")
    .select("phone_number")
    .in("qualification_status", ["DISQUALIFIED", "NEW_LEAD"])
    .ilike("phone_number", "%999%");
  console.log("ilike/in rows:", (leads as unknown[])?.length);

  // auth primitives
  const adminUser = await getUserByEmail2();
  console.log("adminUser keys:", adminUser ? Object.keys(adminUser) : "null");
  const token = await createSession(adminUser!.id);
  const me = await getUserBySession(token);
  console.log("session user:", me?.email, "| super admin exists:", await hasSuperAdmin());
  console.log("password verify:", verifyPassword("admin1234", adminUser!.password_hash));

  await db.close().catch(() => {});
  console.log("REAL DB OK");
}

async function getUserByEmail2() {
  const c = createLocalClient();
  const { data } = await c.from("users").select("id, email, password_hash").maybeSingle();
  return data as { id: string; email: string; password_hash: string } | null;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
