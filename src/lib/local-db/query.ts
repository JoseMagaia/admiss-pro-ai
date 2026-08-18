// Supabase-style query builder adapter over PGlite.
//
// The rest of the codebase talks to the database through a Supabase client
// surface (`db.from("leads").select(...).eq(...).maybeSingle()`). This module
// re-implements the small slice of that API that the app actually uses, backed
// by local PGlite instead of the Supabase REST API. Only server code touches it.
import type { PGlite } from "@electric-sql/pglite";
import { getDb } from "./db.server";

export interface LocalError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

// `data` is intentionally loose (like the Supabase client's any-typed rows) —
// the app reads arbitrary columns from these rows throughout the codebase.
export type LocalResult = {
  data: any;
  error: LocalError | null;
  count?: number | null;
};

const OP_SQL: Record<string, string> = {
  eq: "=",
  neq: "<>",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
  like: "LIKE",
  ilike: "ILIKE",
  is: "IS",
  cs: "@>", // contains (jsonb/array)
  ov: "&&", // overlaps
  sl: "^@", // starts with
};

interface Filter {
  sql: string;
  params: unknown[];
}

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function toParams(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  return value;
}

/** Maps a postgrest-style op to SQL, expanding values into `$n` params. */
function buildFilter(
  column: string,
  op: unknown,
  value: unknown,
  next: () => number,
): Filter {
  const col = quoteIdent(column);
  const opKey = String(op).toLowerCase();

  if (opKey === "not") {
    const inner = buildFilter(column, (value as { op: string }).op, (value as { value: unknown }).value, next);
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

/** Parses `col.op.value,col.op.value` (postgrest `.or()` style). */
function buildOr(filterStr: string, next: () => number): Filter {
  const parts = filterStr.split(",").filter(Boolean);
  const clauses: string[] = [];
  const params: unknown[] = [];
  for (const part of parts) {
    const dot1 = part.indexOf(".");
    const dot2 = dot1 >= 0 ? part.indexOf(".", dot1 + 1) : -1;
    if (dot1 <= 0 || dot2 <= 0) continue;
    const col = part.slice(0, dot1);
    const op = part.slice(dot1 + 1, dot2);
    let raw = part.slice(dot2 + 1);
    let value: unknown = raw;
    if (op === "in" && raw.startsWith("(") && raw.endsWith(")")) {
      value = raw.slice(1, -1).split(",").map((v) => (v === "null" ? null : v));
    } else if (raw === "null") {
      value = null;
    }
    const f = buildFilter(col, op, value, next);
    clauses.push(f.sql);
    params.push(...f.params);
  }
  return { sql: `(${clauses.join(" OR ")})`, params };
}

interface Condition {
  col: string;
  op: string;
  value: unknown;
}

export class LocalQuery {
  private selectCols = "*";
  private headOnly = false;
  private countExact = false;
  private conditions: Condition[] = [];
  private orders: string[] = [];
  private limitN: number | null = null;
  private offsetN: number | null = null;
  private singleMode: "single" | "maybeSingle" | null = null;
  private pending: "select" | "insert" | "update" | "upsert" | "delete" | null = null;
  private writeRows: Record<string, unknown>[] = [];
  private conflictCols: string[] | null = null;

  constructor(private table: string) {}

  /* ------------------------------ read side ------------------------------ */

  select(columns?: string, opts?: { count?: "exact" | "planned" | "estimated"; head?: boolean }): this {
    if (columns) this.selectCols = columns;
    if (opts) {
      this.countExact = opts.count === "exact";
      this.headOnly = Boolean(opts.head);
    }
    // On a write chain (insert/update/upsert/delete) select() only picks the
    // RETURNING columns; otherwise it starts a read query.
    if (!this.pending) this.pending = "select";
    return this;
  }

  eq(column: string, value: unknown): this {
    return this.add(column, "eq", value);
  }
  neq(column: string, value: unknown): this {
    return this.add(column, "neq", value);
  }
  gt(column: string, value: unknown): this {
    return this.add(column, "gt", value);
  }
  gte(column: string, value: unknown): this {
    return this.add(column, "gte", value);
  }
  lt(column: string, value: unknown): this {
    return this.add(column, "lt", value);
  }
  lte(column: string, value: unknown): this {
    return this.add(column, "lte", value);
  }
  like(column: string, value: unknown): this {
    return this.add(column, "like", value);
  }
  ilike(column: string, value: unknown): this {
    return this.add(column, "ilike", value);
  }
  is(column: string, value: unknown): this {
    return this.add(column, "is", value);
  }
  in(column: string, values: unknown[]): this {
    return this.add(column, "in", values);
  }
  not(column: string, op: string, value: unknown): this {
    return this.add(column, "not", { op, value });
  }
  contains(column: string, value: unknown): this {
    return this.add(column, "cs", value);
  }
  filter(column: string, op: string, value: unknown): this {
    return this.add(column, op, value);
  }
  or(filterStr: string): this {
    return this.add("", "or", filterStr);
  }
  order(column: string, opts?: { ascending?: boolean; nullsFirst?: boolean }): this {
    const dir = opts?.ascending === false ? "DESC" : "ASC";
    const nulls = opts?.nullsFirst != null ? (opts.nullsFirst ? "NULLS FIRST" : "NULLS LAST") : "";
    this.orders.push(`${quoteIdent(column)} ${dir} ${nulls}`.trim());
    return this;
  }
  limit(n: number): this {
    this.limitN = n;
    return this;
  }
  range(from: number, to: number): this {
    this.offsetN = from;
    this.limitN = to - from + 1;
    return this;
  }
  single(): this {
    this.singleMode = "single";
    return this;
  }
  maybeSingle(): this {
    this.singleMode = "maybeSingle";
    return this;
  }
  returns(): this {
    return this;
  }

  /* ------------------------------ write side ------------------------------ */

  insert(rows: Record<string, unknown> | Record<string, unknown>[]): this {
    this.pending = "insert";
    this.writeRows = Array.isArray(rows) ? rows : [rows];
    return this;
  }
  update(values: Record<string, unknown>): this {
    this.pending = "update";
    this.writeRows = [values];
    return this;
  }
  upsert(rows: Record<string, unknown> | Record<string, unknown>[], opts?: { onConflict?: string }): this {
    this.pending = "upsert";
    this.writeRows = Array.isArray(rows) ? rows : [rows];
    this.conflictCols = opts?.onConflict ? opts.onConflict.split(",").map((c) => c.trim()).filter(Boolean) : null;
    return this;
  }
  delete(): this {
    this.pending = "delete";
    return this;
  }

  /* ------------------------------ execution ------------------------------ */

  private add(col: string, op: string, value: unknown): this {
    this.conditions.push({ col, op, value });
    return this;
  }

  // Compile conditions into SQL + params. `startN` is the number of params
  // already consumed (write-side SET params come before WHERE params).
  private compileWhere(startN: number): { sql: string; params: unknown[] } {
    if (this.conditions.length === 0) return { sql: "", params: [] };
    let n = startN;
    const next = () => ++n;
    const clauses: string[] = [];
    const params: unknown[] = [];
    for (const c of this.conditions) {
      const f = buildFilter(c.col, c.op, c.value, next);
      clauses.push(f.sql);
      params.push(...f.params);
    }
    return { sql: ` WHERE ${clauses.join(" AND ")}`, params };
  }

  private singleify(data: unknown[], errorPrefix: string): { data: unknown; error: LocalError | null } {
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

  private async countRows(where: { sql: string; params: unknown[] }): Promise<number> {
    const db = await getDb();
    const q = `SELECT count(*)::int AS count FROM ${quoteIdent(this.table)}${where.sql}`;
    const res = (await db.query(q, where.params)) as { rows: Array<{ count: number }> };
    return Number(res.rows[0]?.count ?? 0);
  }

  private async runSelect(): Promise<LocalResult> {
    const where = this.compileWhere(0);
    const db = await getDb();

    if (this.headOnly && this.countExact) {
      const count = await this.countRows(where);
      return { data: null, error: null, count };
    }

    const cols = this.selectCols
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => (c === "*" ? "*" : quoteIdent(c)))
      .join(", ");

    let sql = `SELECT ${cols} FROM ${quoteIdent(this.table)}${where.sql}`;
    if (this.orders.length) sql += ` ORDER BY ${this.orders.join(", ")}`;
    if (this.limitN != null) sql += ` LIMIT ${Math.max(0, this.limitN)}`;
    if (this.offsetN != null) sql += ` OFFSET ${Math.max(0, this.offsetN)}`;

    let rows: unknown[] = [];
    let error: LocalError | null = null;
    if (process.env.DEBUG_PG) console.error("[query] select sql:", sql, "params:", JSON.stringify(where.params));
    try {
      const res = await db.query(sql, where.params);
      rows = res.rows as unknown[];
    } catch (e) {
      error = { message: e instanceof Error ? e.message : String(e) };
    }
    if (error) return { data: null, error };

    const count = this.countExact ? await this.countRows(where) : undefined;
    const single = this.singleify(rows, `GET /${this.table}`);
    return { data: single.data, error: single.error, count };
  }

  private async runWrite(): Promise<LocalResult> {
    const db = await getDb();
    const returning = this.selectCols !== "*" ? this.selectCols : "*";
    const retCols = returning
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => (c === "*" ? "*" : quoteIdent(c)))
      .join(", ");
    const retSql = ` RETURNING ${retCols}`;

    let sql: string;
    let params: unknown[] = [];
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
        const setClause = cols
          .filter((c) => !this.conflictCols!.includes(c))
          .map((c) => `${quoteIdent(c)} = EXCLUDED.${quoteIdent(c)}`)
          .join(", ");
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
      // delete
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
      const rows = res.rows as unknown[];
      const single = this.singleify(rows, `POST /${this.table}`);
      return { data: single.data, error: single.error, count: rows.length };
    } catch (e) {
      return { data: null, error: { message: e instanceof Error ? e.message : String(e) } };
    }
  }

  async run(): Promise<LocalResult> {
    const op = this.pending ?? "select";
    if (op === "select") return this.runSelect();
    return this.runWrite();
  }

  then<TResult1 = LocalResult, TResult2 = never>(
    onfulfilled?: ((value: LocalResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.run().then(onfulfilled as never, onrejected as never);
  }

  catch<TResult = never>(
    onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null,
  ): Promise<LocalResult | TResult> {
    return this.run().catch(onrejected as never);
  }
}

/** Creates the app-facing database object (`supabaseAdmin` shape) backed by PGlite. */
export function createLocalClient(): { from: (table: string) => LocalQuery } {
  return {
    from: (table: string) => new LocalQuery(table),
  };
}
