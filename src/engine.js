// A tiny in-browser MongoDB runtime.
// Lets users type real queries like `db.movies.find({...}).sort({...}).limit(3)`
// or `db.reviews.aggregate([...])` and executes them against sample data.
import "mingo/init/system";
import { Query, Aggregator } from "mingo";

// deep clone so a query can never mutate the seed data
const clone = (v) => JSON.parse(JSON.stringify(v));

class Cursor {
  constructor(mcursor) {
    this._c = mcursor;
    this.__cursor = true;
  }
  sort(spec) { this._c = this._c.sort(spec); return this; }
  limit(n) { this._c = this._c.limit(n); return this; }
  skip(n) { this._c = this._c.skip(n); return this; }
  toArray() { return this._c.all(); }
  all() { return this._c.all(); }
  pretty() { return this._c.all(); }
  count() { return this._c.all().length; }
}

class Collection {
  constructor(docs, resolver) {
    this.docs = docs;
    this.resolver = resolver; // (name) => docs[], lets $lookup find other collections
  }

  find(query = {}, projection) {
    return new Cursor(new Query(query).find(this.docs, projection));
  }
  findOne(query = {}, projection) {
    const r = new Query(query).find(this.docs, projection).all();
    return r.length ? r[0] : null;
  }
  aggregate(pipeline = []) {
    return new Aggregator(pipeline, { collectionResolver: this.resolver }).run(this.docs);
  }
  countDocuments(query = {}) {
    return new Query(query).find(this.docs).all().length;
  }
  count(query = {}) {
    return this.countDocuments(query);
  }
  distinct(field, query = {}) {
    const rows = new Query(query).find(this.docs).all();
    const seen = new Set();
    for (const doc of rows) {
      const val = field.split(".").reduce((o, k) => (o == null ? o : o[k]), doc);
      if (Array.isArray(val)) val.forEach((v) => seen.add(JSON.stringify(v)));
      else if (val !== undefined) seen.add(JSON.stringify(val));
    }
    return [...seen].map((s) => JSON.parse(s)).sort();
  }
}

function buildDb(collections) {
  const db = {};
  const cloned = {};
  for (const [name, docs] of Object.entries(collections)) cloned[name] = clone(docs);
  // $lookup resolves its `from` collection by name through this resolver
  const resolver = (name) => cloned[name] || [];
  for (const [name, docs] of Object.entries(cloned)) {
    db[name] = new Collection(docs, resolver);
  }
  return db;
}

// Execute a user query string. Returns { ok, value } or { ok:false, error }.
export function runQuery(source, collections) {
  const db = buildDb(collections);
  const code = String(source || "").trim();
  if (!code) return { ok: false, error: "Write a query first." };
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("db", `"use strict"; return ( ${code} );`);
    let result = fn(db);
    if (result && result.__cursor) result = result.toArray();
    return { ok: true, value: result };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}

// ---- result comparison -----------------------------------------------------

function normalizeArray(arr, ordered) {
  const mapped = arr.map((d) => JSON.stringify(sortKeys(d)));
  return ordered ? mapped : mapped.slice().sort();
}

// recursively sort object keys so {a,b} equals {b,a}
function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const out = {};
    for (const k of Object.keys(value).sort()) out[k] = sortKeys(value[k]);
    return out;
  }
  return value;
}

export function resultsEqual(actual, expected, ordered = false) {
  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (actual.length !== expected.length) return false;
    const a = normalizeArray(actual, ordered);
    const b = normalizeArray(expected, ordered);
    return a.every((v, i) => v === b[i]);
  }
  return JSON.stringify(sortKeys(actual)) === JSON.stringify(sortKeys(expected));
}
