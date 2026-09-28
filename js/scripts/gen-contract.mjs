// Trait contract generator (HOST-001, HOST-002, UNIT-017). The JSON Schemas in
// src/anywidget_automotives/schema/ are the single source of truth; they extend
// the schemas of anywidget-instruments by their $id. This script flattens them
// and writes:
//
//   js/src/generated/contract.ts                   TypeScript trait interfaces and runtime specs
//   src/anywidget_automotives/static/contract.json description for host authors (shipped in the wheel)
//
// It first runs the generator of anywidget-instruments, whose base view imports
// its own generated contract. Every output is generated and never committed.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generate as generateUpstream } from "anywidget-instruments/js/scripts/gen-contract.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const SCHEMA_DIR = join(ROOT, "src/anywidget_automotives/schema");
const UPSTREAM_ROOT = dirname(createRequire(import.meta.url).resolve("anywidget-instruments/package.json"));
export const UPSTREAM_SCHEMA_DIR = join(UPSTREAM_ROOT, "src/anywidget_instruments/schema");
/** $id prefix of the schemas of anywidget-instruments, by which ours extend them. */
export const UPSTREAM_ID = "https://s-celles.github.io/anywidget-instruments/schema/";
const TS_OUT = join(ROOT, "js/src/generated/contract.ts");
const JSON_OUT = join(ROOT, "src/anywidget_automotives/static/contract.json");

// ---------------------------------------------------------------------------
// Loading and flattening. A schema is named by its file in our directory, or
// by the $id URL of an upstream schema; relative references inside an upstream
// schema stay upstream.
// ---------------------------------------------------------------------------
function loader() {
  const cache = new Map();
  return (name) => {
    if (!cache.has(name)) {
      const path = name.startsWith(UPSTREAM_ID) ? join(UPSTREAM_SCHEMA_DIR, name.slice(UPSTREAM_ID.length)) : join(SCHEMA_DIR, name);
      cache.set(name, JSON.parse(readFileSync(path, "utf8")));
    }
    return cache.get(name);
  };
}

/** Name of the document `ref` points to, seen from the document `from`. */
function documentOf(ref, from) {
  const target = ref.split("#")[0];
  if (!target) return from;
  if (target.startsWith("https://")) return target;
  return from.startsWith(UPSTREAM_ID) ? UPSTREAM_ID + target : target;
}

function pointer(doc, ptr) {
  if (!ptr) return doc;
  return ptr
    .replace(/^\//, "")
    .split("/")
    .map((p) => p.replace(/~1/g, "/").replace(/~0/g, "~"))
    .reduce((node, key) => {
      if (node === undefined || !(key in node)) throw new Error(`unresolved JSON pointer ${ptr}`);
      return node[key];
    }, doc);
}

function resolveRef(load, ref, from) {
  const doc = documentOf(ref, from);
  return [pointer(load(doc), ref.split("#")[1] || ""), doc];
}

function resolveProperty(load, prop, from) {
  if (!prop.$ref) return prop;
  const [target, doc] = resolveRef(load, prop.$ref, from);
  const { $ref: _ref, ...rest } = prop;
  return { ...resolveProperty(load, target, doc), ...rest };
}

/** Properties and messages of a schema, bases (allOf) first; later keywords override earlier ones. */
function flatten(load, name) {
  const schema = load(name);
  const properties = {};
  const messages = [];
  let framework = [];
  for (const part of schema.allOf || []) {
    if (!part.$ref) throw new Error(`${name}: allOf entries must be $ref`);
    const base = flatten(load, documentOf(part.$ref, name));
    for (const [k, prop] of Object.entries(base.properties)) properties[k] = { ...prop };
    messages.push(...base.messages);
    framework = framework.concat(base.framework);
  }
  for (const [k, prop] of Object.entries(schema.properties || {})) {
    const own = resolveProperty(load, prop, name);
    // an own enum or const replaces the inherited type rather than merging with it
    const inherited = { ...(properties[k] || {}) };
    if (own.enum || own.const !== undefined || own.type || own.anyOf) for (const key of ["type", "anyOf", "enum", "x-awi-nonfinite"]) if (!(key in own)) delete inherited[key];
    properties[k] = { ...inherited, ...own };
  }
  messages.push(...(schema["x-awi-messages"] || []).map((m) => (m.$ref ? resolveRef(load, m.$ref, name)[0] : m)));
  framework = framework.concat(schema["x-awi-framework-traits"] || []);
  return { schema, properties, messages, framework };
}

// ---------------------------------------------------------------------------
// Trait specs: the shape of anywidget-instruments (contract/spec.ts), so that
// its base view reads our traits as it reads its own.
// ---------------------------------------------------------------------------
const WRITERS = new Set(["host", "both", "front", "derived"]);

function traitSpec(name, p, where, nested = false) {
  const spec = {};
  let types = Array.isArray(p.type) ? [...p.type] : p.type ? [p.type] : [];
  if (Array.isArray(p.anyOf) && p.anyOf.some((alt) => alt.type === "null")) spec.nullable = true;
  if (types.includes("null")) {
    spec.nullable = true;
    types = types.filter((t) => t !== "null");
  }
  if (p.const !== undefined) {
    spec.type = "const";
    spec.values = [p.const];
  } else if (p["x-awi-nonfinite"]) {
    spec.type = "number";
    spec.nonfinite = true;
  } else if (p.enum && types.length === 0) {
    spec.type = "enum";
    spec.values = p.enum.filter((v) => v !== null);
    if (p.enum.includes(null)) spec.nullable = true;
  } else if (types.length === 1) {
    spec.type = types[0];
  } else if (types.length === 0) {
    spec.type = "any";
  } else {
    throw new Error(`${where}.${name}: unsupported type ${JSON.stringify(p.type)}`);
  }
  for (const k of ["minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "minItems", "maxItems", "uniqueItems"]) if (p[k] !== undefined) spec[k] = p[k];
  if (p["x-awi-item-default"] !== undefined) spec.itemDefault = p["x-awi-item-default"];
  if (spec.type === "array") {
    if (Array.isArray(p.prefixItems)) spec.prefixItems = p.prefixItems.map((it, i) => traitSpec(`${name}[${i}]`, it, where, true));
    else if (p.items && typeof p.items === "object") spec.items = traitSpec(`${name}[]`, p.items, where, true);
  }
  if (spec.type === "object" && p.propertyNames?.enum) spec.keys = p.propertyNames.enum;
  if (spec.type === "object" && p.properties) {
    spec.properties = Object.fromEntries(Object.entries(p.properties).map(([k, v]) => [k, traitSpec(`${name}.${k}`, v, where, true)]));
  }
  if (nested) return spec;
  if (!("default" in p)) throw new Error(`${where}.${name}: missing default`);
  spec.default = p.default;
  const writer = p["x-awi-writer"];
  if (!WRITERS.has(writer)) throw new Error(`${where}.${name}: x-awi-writer must be one of ${[...WRITERS]}`);
  spec.writer = writer;
  if (p.readOnly) spec.readOnly = true;
  if (p.description) spec.description = p.description;
  return spec;
}

/** Flattened contract of every schema of this library, keyed by schema title. */
export function buildContract() {
  const load = loader();
  const files = readdirSync(SCHEMA_DIR).filter((f) => f.endsWith(".schema.json")).sort();
  const widgets = {};
  let framework = [];
  let units = null;
  for (const file of files) {
    if (file === "units.schema.json") {
      units = load(file);
      continue;
    }
    const { schema, properties, messages, framework: fw } = flatten(load, file);
    const title = schema.title;
    if (!title || !/^[A-Z][A-Za-z0-9]*$/.test(title)) throw new Error(`${file}: title must be a class-like name`);
    if (!schema["x-awi-class"]) throw new Error(`${file}: missing x-awi-class`);
    const traits = {};
    for (const [name, p] of Object.entries(properties)) traits[name] = traitSpec(name, p, file);
    const abstract = !!schema["x-awi-abstract"];
    const kind = traits._kind?.type === "const" ? traits._kind.values[0] : "";
    if (!abstract && !kind) throw new Error(`${file}: a concrete widget fixes _kind with a const`);
    if (!abstract && !kind.startsWith("awa-")) throw new Error(`${file}: the _kind of a widget of this library starts with "awa-"`);
    widgets[title] = { className: schema["x-awi-class"], kind, abstract, schema: file, traits, messages };
    framework = framework.concat(fw);
  }
  if (!units) throw new Error("units.schema.json is missing");
  return { widgets, frameworkTraits: [...new Set(framework)].sort(), units: units["x-awa-units"] };
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------
function tsType(spec) {
  let t;
  switch (spec.type) {
    case "number":
    case "integer":
      t = spec.nonfinite ? 'number | "nan" | "inf" | "-inf"' : "number";
      break;
    case "string":
    case "boolean":
      t = spec.type;
      break;
    case "enum":
    case "const":
      t = spec.values.map((v) => JSON.stringify(v)).join(" | ");
      break;
    case "array":
      if (spec.prefixItems) t = `[${spec.prefixItems.map(tsType).join(", ")}]`;
      else if (spec.items) t = `Array<${tsType(spec.items)}>`;
      else t = "unknown[]";
      break;
    case "object":
      if (spec.keys) t = `Partial<Record<${spec.keys.map((k) => JSON.stringify(k)).join(" | ")}, string>>`;
      else if (spec.properties) t = `{ ${Object.entries(spec.properties).map(([k, v]) => `${k}?: ${tsType(v)}`).join("; ")} }`;
      else t = "Record<string, unknown>";
      break;
    default:
      t = "unknown";
  }
  return spec.nullable ? `${t} | null` : t;
}

export function renderTs(contract) {
  const out = [
    "// Generated by js/scripts/gen-contract.mjs from src/anywidget_automotives/schema/.",
    "// Do not edit: change the schemas and run `npm run gen`.",
    'import type { WidgetContract } from "anywidget-instruments/js/src/contract/spec.js";',
    "",
  ];
  const names = Object.keys(contract.widgets);
  for (const title of names) {
    const w = contract.widgets[title];
    out.push(`/** Traits of \`${w.className}\`${w.kind ? ` (\`_kind\` "${w.kind}")` : ""}. */`);
    out.push(`export interface ${title}Traits {`);
    for (const [name, spec] of Object.entries(w.traits)) {
      if (spec.description) out.push(`  /** ${spec.description.replace(/\*\//g, "* /")} */`);
      out.push(`  ${/^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name)}: ${tsType(spec)};`);
    }
    out.push("}", "");
  }
  const runtime = Object.fromEntries(names.map((n) => {
    const { schema: _schema, ...rest } = contract.widgets[n];
    return [n, rest];
  }));
  out.push("/** Flattened contract of every schema, keyed by schema title. */");
  out.push(`export const CONTRACTS: Record<${names.map((n) => JSON.stringify(n)).join(" | ")}, WidgetContract> = ${JSON.stringify(runtime, null, 2)};`, "");
  out.push("/** Contract of the concrete widgets, keyed by `_kind`. */");
  out.push("export const BY_KIND: Record<string, WidgetContract> = Object.fromEntries(");
  out.push("  Object.values(CONTRACTS).filter((c) => !c.abstract).map((c) => [c.kind, c]),");
  out.push(");", "");
  out.push("/** Units the front end accepts, by quantity (UNIT-017). */");
  out.push(`export const UNIT_TABLE = ${JSON.stringify(contract.units, null, 2)} as const;`);
  return `${out.join("\n")}\n`;
}

function pythonVersion() {
  const m = /^version\s*=\s*"([^"]+)"/m.exec(readFileSync(join(ROOT, "pyproject.toml"), "utf8"));
  return m ? m[1] : "";
}

export function renderJson(contract) {
  const widgets = {};
  for (const [title, w] of Object.entries(contract.widgets)) {
    widgets[title] = { class: w.className, kind: w.kind, abstract: w.abstract, schema: `schema/${w.schema}`, traits: w.traits, messages: w.messages };
  }
  return `${JSON.stringify(
    {
      $comment: "Trait contract of anywidget-automotives, generated from the JSON Schemas in schema/, which extend those of anywidget-instruments. See the trait contract page of the documentation.",
      format: 1,
      version: pythonVersion(),
      encoding: {
        nonfinite: "Traits with nonfinite: true carry NaN and infinities as the strings \"nan\", \"inf\" and \"-inf\".",
      },
      frameworkTraits: contract.frameworkTraits,
      units: contract.units,
      widgets,
    },
    null,
    2,
  )}\n`;
}

export function generate({ write = true } = {}) {
  generateUpstream({ write });
  const contract = buildContract();
  const ts = renderTs(contract);
  const json = renderJson(contract);
  if (write) {
    mkdirSync(dirname(TS_OUT), { recursive: true });
    mkdirSync(dirname(JSON_OUT), { recursive: true });
    writeFileSync(TS_OUT, ts);
    writeFileSync(JSON_OUT, json);
  }
  return { contract, ts, json };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { contract } = generate();
  const n = Object.values(contract.widgets).filter((w) => !w.abstract).length;
  console.log(`contract: ${Object.keys(contract.widgets).length} schemas (${n} widgets)`);
}
