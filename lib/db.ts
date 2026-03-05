import { Pool } from "pg"

let _pool: Pool | null = null

function getPool(): Pool {
  if (!_pool) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error("Missing DATABASE_URL env var")
    _pool = new Pool({ connectionString: url, ssl: false })
    _pool.on("error", (e) => console.error("[pg-shim] pool error:", e.message))
  }
  return _pool
}

type Condition =
  | { t: "eq" | "neq" | "lt" | "lte" | "gt" | "gte"; col: string; val: unknown }
  | { t: "in"; col: string; vals: unknown[] }
  | { t: "not_is_null"; col: string }

class QueryBuilder {
  private _table: string
  private _op: "select" | "insert" | "update" | "delete" = "select"
  private _cols = "*"
  private _countOnly = false
  private _data: Record<string, unknown> | null = null
  private _conds: Condition[] = []
  private _ord: { col: string; asc: boolean } | null = null
  private _lim: number | null = null
  private _sing = false
  private _maybe = false
  private _ret = false

  constructor(table: string) {
    this._table = table
  }

  select(cols?: string, opts?: { count?: string; head?: boolean }) {
    if (this._op === "insert" || this._op === "update") {
      this._ret = true
      return this
    }
    this._op = "select"
    if (opts?.count === "exact" && opts?.head) {
      this._countOnly = true
    } else {
      this._cols = cols || "*"
    }
    return this
  }

  insert(data: Record<string, unknown> | Record<string, unknown>[]) {
    this._op = "insert"
    this._data = Array.isArray(data) ? data[0] : data
    return this
  }

  update(data: Record<string, unknown>) {
    this._op = "update"
    this._data = data
    return this
  }

  delete() {
    this._op = "delete"
    return this
  }

  eq(col: string, val: unknown) { this._conds.push({ t: "eq", col, val }); return this }
  neq(col: string, val: unknown) { this._conds.push({ t: "neq", col, val }); return this }
  lt(col: string, val: unknown) { this._conds.push({ t: "lt", col, val }); return this }
  lte(col: string, val: unknown) { this._conds.push({ t: "lte", col, val }); return this }
  gt(col: string, val: unknown) { this._conds.push({ t: "gt", col, val }); return this }
  gte(col: string, val: unknown) { this._conds.push({ t: "gte", col, val }); return this }
  in(col: string, vals: unknown[]) { this._conds.push({ t: "in", col, vals }); return this }
  not(col: string, op: string, _val: unknown) {
    if (op === "is" && _val === null) this._conds.push({ t: "not_is_null", col })
    return this
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this._ord = { col, asc: opts?.ascending !== false }
    return this
  }
  limit(n: number) { this._lim = n; return this }
  single() { this._sing = true; return this }
  maybeSingle() { this._maybe = true; return this }

  then(resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) {
    return this._run().then(resolve, reject)
  }

  private _buildWhere(params: unknown[]): string {
    if (!this._conds.length) return ""
    const clauses = this._conds.map((c) => {
      if (c.t === "in") {
        const pl = c.vals.map((v) => { params.push(v); return "$" + params.length })
        return `"${c.col}" IN (${pl.join(",")})`
      }
      if (c.t === "not_is_null") return `"${c.col}" IS NOT NULL`
      params.push(c.val)
      const op = { eq: "=", neq: "!=", lt: "<", lte: "<=", gt: ">", gte: ">=" }[c.t] || "="
      return `"${c.col}" ${op} $${params.length}`
    })
    return " WHERE " + clauses.join(" AND ")
  }

  private _sanitizeCols(cols: string): string {
    // Strip Supabase join syntax like "*, admin_users(username)" -> "*"
    return cols.replace(/\w+\s*\([^)]+\)/g, "").replace(/,\s*,/g, ",").replace(/,\s*$|^\s*,/, "").trim() || "*"
  }

  private async _run(): Promise<{
    data?: unknown
    error?: { message: string; details?: string; hint?: string } | null
    count?: number | null
  }> {
    try {
      const pool = getPool()

      if (this._op === "select") {
        const params: unknown[] = []

        if (this._countOnly) {
          let sql = `SELECT COUNT(*) FROM "${this._table}"`
          sql += this._buildWhere(params)
          const r = await pool.query(sql, params)
          return { count: parseInt(r.rows[0].count, 10), error: null }
        }

        const cols = this._sanitizeCols(this._cols)
        let sql = `SELECT ${cols} FROM "${this._table}"`
        sql += this._buildWhere(params)
        if (this._ord) sql += ` ORDER BY "${this._ord.col}" ${this._ord.asc ? "ASC" : "DESC"}`
        if (this._lim) sql += ` LIMIT ${Number(this._lim)}`
        const r = await pool.query(sql, params)
        if (this._sing || this._maybe) return { data: r.rows[0] || null, error: null }
        return { data: r.rows, error: null }
      }

      if (this._op === "insert") {
        const keys = Object.keys(this._data!)
        const vals = Object.values(this._data!)
        const ph = keys.map((_, i) => "$" + (i + 1))
        let sql = `INSERT INTO "${this._table}" (${keys.map((k) => `"${k}"`).join(",")}) VALUES (${ph.join(",")})`
        if (this._ret) sql += " RETURNING *"
        const r = await pool.query(sql, vals)
        if (this._ret) return { data: (this._sing || this._maybe) ? (r.rows[0] || null) : r.rows, error: null }
        return { data: null, error: null }
      }

      if (this._op === "update") {
        const keys = Object.keys(this._data!)
        const vals = Object.values(this._data!)
        const params: unknown[] = [...vals]
        const set = keys.map((k, i) => `"${k}"=$${i + 1}`).join(",")
        let sql = `UPDATE "${this._table}" SET ${set}`
        sql += this._buildWhere(params)
        if (this._ret) sql += " RETURNING *"
        const r = await pool.query(sql, params)
        if (this._ret) return { data: (this._sing || this._maybe) ? (r.rows[0] || null) : r.rows, error: null }
        return { data: null, error: null }
      }

      if (this._op === "delete") {
        const params: unknown[] = []
        let sql = `DELETE FROM "${this._table}"`
        sql += this._buildWhere(params)
        if (this._ret) sql += " RETURNING *"
        const r = await pool.query(sql, params)
        return { data: this._ret ? r.rows : null, error: null }
      }

      return { data: null, error: { message: "Unknown op" } }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[pg-shim] DB error on", this._op, this._table, ":", msg)
      return { data: null, error: { message: msg, details: "", hint: "" } }
    }
  }
}

export function createClient(_url: string, _key: string) {
  return {
    from(table: string) {
      return new QueryBuilder(table)
    },
  }
}
