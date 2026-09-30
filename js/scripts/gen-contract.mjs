// Trait contract generator (HOST-001, HOST-002, UNIT-017). The JSON Schemas in
// src/anywidget_instruments_automotive/schema/ are the single source of truth;
// they extend the base schema of anywidget-instruments by its $id. The
// generator of anywidget-instruments (js/scripts/contract.mjs) flattens them;
// this script adds what is proper to this library (units, quantities, the
// "awa-" kinds) and writes:
//
//   js/src/generated/contract.ts                              TypeScript trait interfaces and runtime specs
//   src/anywidget_instruments_automotive/static/contract.json description for host authors (shipped in the wheel)
//
// Every output is generated and never committed.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BASE_ID, buildContract as build, pythonVersion, renderJson as json, renderTs as ts, writeOutputs } from "anywidget-instruments/js/scripts/contract.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const SCHEMA_DIR = join(ROOT, "src/anywidget_instruments_automotive/schema");
/** $id prefix of the schemas of anywidget-instruments, by which ours extend them. */
export const UPSTREAM_ID = BASE_ID;
const TS_OUT = join(ROOT, "js/src/generated/contract.ts");
const JSON_OUT = join(ROOT, "src/anywidget_instruments_automotive/static/contract.json");

/** Flattened contract of every schema of this library, keyed by schema title. */
export function buildContract() {
  const contract = build({ dir: SCHEMA_DIR, skip: ["units.schema.json"], kindPrefix: "awa-", extra: (schema) => ({ quantity: schema["x-awa-quantity"] || "" }) });
  const units = JSON.parse(readFileSync(join(SCHEMA_DIR, "units.schema.json"), "utf8"));
  return { ...contract, units: units["x-awa-units"] };
}

export function renderTs(contract) {
  const quantities = Object.fromEntries(Object.values(contract.widgets).filter((w) => w.quantity).map((w) => [w.kind, w.quantity]));
  return ts(contract, {
    source: "src/anywidget_instruments_automotive/schema/",
    runtimeOmit: ["quantity"],
    append: [
      "/** Physical quantity shown by each widget of a quantity, keyed by `_kind` (UNIT-002). */",
      `export const QUANTITY_OF_KIND: Record<string, keyof typeof UNIT_TABLE> = ${JSON.stringify(quantities, null, 2)};`,
      "",
      "/** Units the front end accepts, by quantity (UNIT-017). */",
      `export const UNIT_TABLE = ${JSON.stringify(contract.units, null, 2)} as const;`,
    ],
  });
}

export function renderJson(contract) {
  return json(contract, {
    comment: "Trait contract of anywidget-instruments-automotive, generated from the JSON Schemas in schema/, which extend those of anywidget-instruments. See the trait contract page of the documentation.",
    version: pythonVersion(ROOT),
    top: { units: contract.units },
    widgetFields: ["quantity"],
  });
}

export function generate({ write = true } = {}) {
  const contract = buildContract();
  const out = { contract, ts: renderTs(contract), json: renderJson(contract) };
  if (write) writeOutputs({ [TS_OUT]: out.ts, [JSON_OUT]: out.json });
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { contract } = generate();
  const n = Object.values(contract.widgets).filter((w) => !w.abstract).length;
  console.log(`contract: ${Object.keys(contract.widgets).length} schemas (${n} widgets)`);
}
