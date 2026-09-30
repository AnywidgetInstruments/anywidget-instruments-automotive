/// <reference types="node" />
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { BaseView } from "anywidget-instruments/js/src/core/view.js";
import widget, { VIEWS } from "../src/index.js";
import { BY_KIND } from "../src/generated/contract.js";
import { hostModel } from "./helpers.js";

const sources = (dir: string): string[] =>
  readdirSync(dir).flatMap((f: string) => (statSync(join(dir, f)).isDirectory() ? sources(join(dir, f)) : [join(dir, f)]));

test("every concrete widget of the contract has a view, and every view a contract", () => {
  expect(Object.keys(VIEWS).sort()).toEqual(Object.keys(BY_KIND).sort());
});

test("every view derives from the base view of anywidget-instruments (GEN-001)", () => {
  for (const View of Object.values(VIEWS)) expect(View.prototype).toBeInstanceOf(BaseView);
});

test("the module is an AFM module: a default export with initialize and render (GEN-003)", () => {
  expect(typeof widget.initialize).toBe("function");
  expect(typeof widget.render).toBe("function");
});

test("the front end is bundled into one ES module and one stylesheet, with the parts of anywidget-instruments it uses (GEN-002)", () => {
  const build = readFileSync("js/build.mjs", "utf8");
  expect(build).toMatch(/entryPoints: \["js\/src\/index\.ts"\][^\n]*bundle: true, format: "esm"/);
  expect(build).toMatch(/entryPoints: \["js\/src\/styles\.css"\][^\n]*bundle: true/);
});

test("an unknown kind is reported as text in the output, not thrown", () => {
  const el = document.createElement("div");
  expect(widget.render({ model: hostModel({ _kind: "awa-hovercraft" }), el })).toBeUndefined();
  expect(el.textContent).toContain('unknown widget kind "awa-hovercraft"');
});

test("every style rule is scoped to the widget roots (GEN-008)", () => {
  const css = readFileSync("js/src/styles.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const selectors = [...css.matchAll(/(^|[}\n])\s*([^{}@]+)\{/g)].map((m) => m[2].trim()).filter((s) => !/^(\d+%|from|to)$/.test(s));
  // commas at the top level only: those inside :is() belong to one selector
  const parts = (s: string) => s.split(/,(?![^(]*\))/);
  for (const s of selectors) for (const part of parts(s)) expect(part.trim()).toMatch(/^\.awa-root/);
});

test("the front end loads nothing from the network (GEN-005)", () => {
  for (const f of sources("js/src").filter((f) => /\.(ts|js|css)$/.test(f))) {
    const text = readFileSync(f, "utf8");
    expect(text, f).not.toMatch(/\bfetch\(|XMLHttpRequest|WebSocket|import\(|url\(\s*['"]?https?:/);
  }
});
