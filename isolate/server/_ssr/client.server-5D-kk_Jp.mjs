import process from "node:process";
import { getDb } from "./db.server-BWf4zT2m.mjs";
import "../_libs/electric-sql__pglite.mjs";




import "../_libs/unenv.mjs";

const OP_SQL = {
  eq: "=",
  neq: "<>",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
  like: "LIKE",
  ilike: "ILIKE",
  is: "IS",
  cs: "@>",
  // contains (jsonb/array)
  ov: "&&",
  // overlaps
  sl: "^@"
  // starts with
};
function quoteIdent(name) {
  return `"${name.replace(/"/g, '""')}"`;
}
function toParams(value) {
  if (value instanceof Date) return value.toISOString();
  return value;
}
function buildFilter(column, op, value, next) {
  const col = quoteIdent(column);
  const opKey = String(op).toLowerCase();
  if (opKey === "not") {
    const inner = buildFilter(column, value.op, value.value, next);
    return { sql: `NOT (${inner.sql})`, params: inner.params };
  }
  if (opKey === "or") {
    return buildOr(String(value), next);
  }
  const sqlOp = OP_SQL[opKey] ?? "=";
  if (opKey === "is") {
    if (value === null) return { sql: `${col} IS NULL`, params: [] };
    if (value === true) return { sql: `${col} IS TRUE`, params: [] };
    if (value === false) return { sql: `${col} IS FALSE`, params: [] };
    return { sql: `${col} = $${next()}`, params: [toParams(value)] };
  }
  if (opKey === "in") {
    const arr = Array.isArray(value) ? value : [];
    if (arr.length === 0) return { sql: "1 = 0", params: [] };
    const placeholders = arr.map(() => `$${next()}`).join(", ");
    return { sql: `${col} IN (${placeholders})`, params: arr.map(toParams) };
  }
  return { sql: `${col} ${sqlOp} $${next()}`, params: [toParams(value)] };
}
function buildOr(filterStr, next) {
  const parts = filterStr.split(",").filter(Boolean);
  const clauses = [];
  const params = [];
  for (const part of parts) {
    const dot1 = part.indexOf(".");
    const dot2 = dot1 >= 0 ? part.indexOf(".", dot1 + 1) : -1;
    if (dot1 <= 0 || dot2 <= 0) continue;
    const col = part.slice(0, dot1);
    const op = part.slice(dot1 + 1, dot2);
    let raw = part.slice(dot2 + 1);
    let value = raw;
    if (op === "in" && raw.startsWith("(") && raw.endsWith(")")) {
      value = raw.slice(1, -1).split(",").map((v) => v === "null" ? null : v);
    } else if (raw === "null") {
      value = null;
    }
    const f = buildFilter(col, op, value, next);
    clauses.push(f.sql);
    params.push(...f.params);
  }
  return { sql: `(${clauses.join(" OR ")})`, params };
}
class LocalQuery {
  constructor(table) {
    this.table = table;
  }
  table;
  selectCols = "*";
  headOnly = false;
  countExact = false;
  conditions = [];
  orders = [];
  limitN = null;
  offsetN = null;
  singleMode = null;
  pending = null;
  writeRows = [];
  conflictCols = null;
  /* ------------------------------ read side ------------------------------ */
  select(columns, opts) {
    if (columns) this.selectCols = columns;
    if (opts) {
      this.countExact = opts.count === "exact";
      this.headOnly = Boolean(opts.head);
    }
    if (!this.pending) this.pending = "select";
    return this;
  }
  eq(column, value) {
    return this.add(column, "eq", value);
  }
  neq(column, value) {
    return this.add(column, "neq", value);
  }
  gt(column, value) {
    return this.add(column, "gt", value);
  }
  gte(column, value) {
    return this.add(column, "gte", value);
  }
  lt(column, value) {
    return this.add(column, "lt", value);
  }
  lte(column, value) {
    return this.add(column, "lte", value);
  }
  like(column, value) {
    return this.add(column, "like", value);
  }
  ilike(column, value) {
    return this.add(column, "ilike", value);
  }
  is(column, value) {
    return this.add(column, "is", value);
  }
  in(column, values) {
    return this.add(column, "in", values);
  }
  not(column, op, value) {
    return this.add(column, "not", { op, value });
  }
  contains(column, value) {
    return this.add(column, "cs", value);
  }
  filter(column, op, value) {
    return this.add(column, op, value);
  }
  or(filterStr) {
    return this.add("", "or", filterStr);
  }
  order(column, opts) {
    const dir = opts?.ascending === false ? "DESC" : "ASC";
    const nulls = opts?.nullsFirst != null ? opts.nullsFirst ? "NULLS FIRST" : "NULLS LAST" : "";
    this.orders.push(`${quoteIdent(column)} ${dir} ${nulls}`.trim());
    return this;
  }
  limit(n) {
    this.limitN = n;
    return this;
  }
  range(from, to) {
    this.offsetN = from;
    this.limitN = to - from + 1;
    return this;
  }
  single() {
    this.singleMode = "single";
    return this;
  }
  maybeSingle() {
    this.singleMode = "maybeSingle";
    return this;
  }
  returns() {
    return this;
  }
  /* ------------------------------ write side ------------------------------ */
  insert(rows) {
    this.pending = "insert";
    this.writeRows = Array.isArray(rows) ? rows : [rows];
    return this;
  }
  update(values) {
    this.pending = "update";
    this.writeRows = [values];
    return this;
  }
  upsert(rows, opts) {
    this.pending = "upsert";
    this.writeRows = Array.isArray(rows) ? rows : [rows];
    this.conflictCols = opts?.onConflict ? opts.onConflict.split(",").map((c) => c.trim()).filter(Boolean) : null;
    return this;
  }
  delete() {
    this.pending = "delete";
    return this;
  }
  /* ------------------------------ execution ------------------------------ */
  add(col, op, value) {
    this.conditions.push({ col, op, value });
    return this;
  }
  // Compile conditions into SQL + params. `startN` is the number of params
  // already consumed (write-side SET params come before WHERE params).
  compileWhere(startN) {
    if (this.conditions.length === 0) return { sql: "", params: [] };
    let n = startN;
    const next = () => ++n;
    const clauses = [];
    const params = [];
    for (const c of this.conditions) {
      const f = buildFilter(c.col, c.op, c.value, next);
      clauses.push(f.sql);
      params.push(...f.params);
    }
    return { sql: ` WHERE ${clauses.join(" AND ")}`, params };
  }
  singleify(data, errorPrefix) {
    if (this.singleMode === "single") {
      if (data.length === 0) return { data: null, error: { message: `${errorPrefix} The result contains 0 rows`, code: "PGRST116" } };
      if (data.length > 1) return { data: null, error: { message: `${errorPrefix} The result contains more than one row`, code: "PGRST205" } };
      return { data: data[0], error: null };
    }
    if (this.singleMode === "maybeSingle") {
      if (data.length > 1) return { data: null, error: { message: `${errorPrefix} The result contains more than one row`, code: "PGRST205" } };
      return { data: data[0] ?? null, error: null };
    }
    return { data, error: null };
  }
  async countRows(where) {
    const db = await getDb();
    const q = `SELECT count(*)::int AS count FROM ${quoteIdent(this.table)}${where.sql}`;
    const res = await db.query(q, where.params);
    return Number(res.rows[0]?.count ?? 0);
  }
  async runSelect() {
    const where = this.compileWhere(0);
    const db = await getDb();
    if (this.headOnly && this.countExact) {
      const count2 = await this.countRows(where);
      return { data: null, error: null, count: count2 };
    }
    const cols = this.selectCols.split(",").map((c) => c.trim()).filter(Boolean).map((c) => c === "*" ? "*" : quoteIdent(c)).join(", ");
    let sql = `SELECT ${cols} FROM ${quoteIdent(this.table)}${where.sql}`;
    if (this.orders.length) sql += ` ORDER BY ${this.orders.join(", ")}`;
    if (this.limitN != null) sql += ` LIMIT ${Math.max(0, this.limitN)}`;
    if (this.offsetN != null) sql += ` OFFSET ${Math.max(0, this.offsetN)}`;
    let rows = [];
    let error = null;
    if (process.env.DEBUG_PG) console.error("[query] select sql:", sql, "params:", JSON.stringify(where.params));
    try {
      const res = await db.query(sql, where.params);
      rows = res.rows;
    } catch (e) {
      error = { message: e instanceof Error ? e.message : String(e) };
    }
    if (error) return { data: null, error };
    const count = this.countExact ? await this.countRows(where) : void 0;
    const single = this.singleify(rows, `GET /${this.table}`);
    return { data: single.data, error: single.error, count };
  }
  async runWrite() {
    const db = await getDb();
    const returning = this.selectCols !== "*" ? this.selectCols : "*";
    const retCols = returning.split(",").map((c) => c.trim()).filter(Boolean).map((c) => c === "*" ? "*" : quoteIdent(c)).join(", ");
    const retSql = ` RETURNING ${retCols}`;
    let sql;
    let params = [];
    let paramN = 0;
    const nextParam = () => ++paramN;
    if (this.pending === "insert") {
      const rows = this.writeRows;
      if (rows.length === 0) return { data: null, error: { message: "No rows provided for insert" } };
      const cols = Object.keys(rows[0]);
      if (cols.length === 0) return { data: null, error: { message: "No columns provided for insert" } };
      const colSql = cols.map(quoteIdent).join(", ");
      const valueSets = rows.map((row) => {
        const placeholders = cols.map(() => `$${nextParam()}`);
        cols.forEach((c) => params.push(toParams(row[c])));
        return `(${placeholders.join(", ")})`;
      });
      sql = `INSERT INTO ${quoteIdent(this.table)} (${colSql}) VALUES ${valueSets.join(", ")}${retSql}`;
    } else if (this.pending === "upsert") {
      const rows = this.writeRows;
      if (rows.length === 0) return { data: null, error: { message: "No rows provided for upsert" } };
      const cols = Object.keys(rows[0]);
      const colSql = cols.map(quoteIdent).join(", ");
      const valueSets = rows.map((row) => {
        const placeholders = cols.map(() => `$${nextParam()}`);
        cols.forEach((c) => params.push(toParams(row[c])));
        return `(${placeholders.join(", ")})`;
      });
      let conflictSql = "";
      if (this.conflictCols && this.conflictCols.length > 0) {
        const keys = this.conflictCols.map(quoteIdent).join(", ");
        const setClause = cols.filter((c) => !this.conflictCols.includes(c)).map((c) => `${quoteIdent(c)} = EXCLUDED.${quoteIdent(c)}`).join(", ");
        conflictSql = ` ON CONFLICT (${keys}) DO UPDATE SET ${setClause || `${quoteIdent(cols[0])} = EXCLUDED.${quoteIdent(cols[0])}`}`;
      }
      sql = `INSERT INTO ${quoteIdent(this.table)} (${colSql}) VALUES ${valueSets.join(", ")}${conflictSql}${retSql}`;
    } else if (this.pending === "update") {
      if (this.conditions.length === 0) {
        return { data: null, error: { message: `Please provide a filter for the update on "${this.table}"` } };
      }
      const values = this.writeRows[0] ?? {};
      const cols = Object.keys(values);
      if (cols.length === 0) return { data: null, error: { message: "No columns provided for update" } };
      const setSql = cols.map((c) => `${quoteIdent(c)} = $${nextParam()}`);
      cols.forEach((c) => params.push(toParams(values[c])));
      const where = this.compileWhere(params.length);
      params.push(...where.params);
      sql = `UPDATE ${quoteIdent(this.table)} SET ${setSql.join(", ")}${where.sql}${retSql}`;
    } else {
      if (this.conditions.length === 0) {
        return { data: null, error: { message: `Please provide a filter for the delete on "${this.table}"` } };
      }
      const where = this.compileWhere(params.length);
      params.push(...where.params);
      sql = `DELETE FROM ${quoteIdent(this.table)}${where.sql}${retSql}`;
    }
    if (process.env.DEBUG_PG) console.error("[query] write sql:", sql, "params:", JSON.stringify(params));
    try {
      const res = await db.query(sql, params);
      const rows = res.rows;
      const single = this.singleify(rows, `POST /${this.table}`);
      return { data: single.data, error: single.error, count: rows.length };
    } catch (e) {
      return { data: null, error: { message: e instanceof Error ? e.message : String(e) } };
    }
  }
  async run() {
    const op = this.pending ?? "select";
    if (op === "select") return this.runSelect();
    return this.runWrite();
  }
  then(onfulfilled, onrejected) {
    return this.run().then(onfulfilled, onrejected);
  }
  catch(onrejected) {
    return this.run().catch(onrejected);
  }
}
function createLocalClient() {
  return {
    from: (table) => new LocalQuery(table)
  };
}
const supabaseAdmin = createLocalClient();
export {
  supabaseAdmin
};
