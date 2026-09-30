// Front-end build (GEN-002). One ES module and one stylesheet, bundling the
// parts of anywidget-instruments the widgets derive from: a host loads them
// with no JavaScript toolchain and nothing from the network (GEN-005).
//
// Deterministic, as upstream: no timestamps, no absolute paths, a pinned
// esbuild (package-lock.json); see js/scripts/check-reproducible.mjs. Not
// minified, with its source map, so the module shipped in the wheel stays
// readable.
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { generate } from "./scripts/gen-contract.mjs";

const OUT = "src/anywidget_instruments_automotive/static";

// The base view of anywidget-instruments looks a widget up in the contract of
// its own widgets, which is most of its bundle; ours carry their own contract
// (js/src/core/view.ts), so theirs is left out. Matched on the installed
// package, not on the name: this repository's own path contains it too.
const UPSTREAM_PACKAGE = /[\\/]node_modules[\\/]anywidget-instruments[\\/]/;
const upstreamContract = {
  name: "upstream-contract",
  setup(b) {
    b.onResolve({ filter: /\/generated\/contract\.js$/ }, (args) =>
      UPSTREAM_PACKAGE.test(args.importer) ? { path: "upstream-contract", namespace: "awa-stub" } : undefined,
    );
    b.onLoad({ filter: /.*/, namespace: "awa-stub" }, () => ({ contents: "export const BY_KIND = {};\nexport const CONTRACTS = {};\n", loader: "js" }));
  },
};

export const targets = [
  { entryPoints: ["js/src/index.ts"], outfile: `${OUT}/index.js`, bundle: true, format: "esm", minify: false, sourcemap: "linked", sourcesContent: true, legalComments: "inline", target: "es2020", charset: "utf8", plugins: [upstreamContract] },
  { entryPoints: ["js/src/styles.css"], outfile: `${OUT}/index.css`, bundle: true, minify: false, charset: "utf8" },
];

export async function buildAll({ write = true } = {}) {
  generate({ write });
  const results = [];
  for (const t of targets) {
    const r = await build({ ...t, write, logLevel: write ? "info" : "silent" });
    results.push(...(r.outputFiles || []));
  }
  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await buildAll();
}
