/// <reference types="node" />
// Contrast of the colours this library adds (LEG-002), with the targets of
// anywidget-instruments: 4.5:1 for text, 3:1 for a graphical object.
import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

const css = readFileSync("js/src/styles.css", "utf8");

function tokens(selector: string): Record<string, string> {
  const i = css.indexOf(selector);
  const block = css.slice(css.indexOf("{", i) + 1, css.indexOf("}", i));
  return Object.fromEntries([...block.matchAll(/(--awa-[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

const rgb = (hex: string) => [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16));
const lum = (hex: string) => {
  const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = rgb(hex);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
export const contrast = (a: string, b: string) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

const t = tokens("\n.awa-root {\n");

test.each(["red", "amber", "green", "blue"])("a lit %s tell-tale stands out from its ground by at least 3:1", (c) => {
  expect(contrast(t[`--awa-tt-${c}`], t["--awa-tt-ground"])).toBeGreaterThanOrEqual(3);
});

test.each(["red", "amber", "green", "blue"])("a lit %s tell-tale is at least twice as contrasted as an unlit one (TEL-005)", (c) => {
  const lit = contrast(t[`--awa-tt-${c}`], t["--awa-tt-ground"]);
  const off = contrast(t["--awa-tt-off"], t["--awa-tt-ground"]);
  expect(lit / off).toBeGreaterThanOrEqual(2);
});

test("an unlit tell-tale can still be seen on its ground", () => {
  expect(contrast(t["--awa-tt-off"], t["--awa-tt-ground"])).toBeGreaterThanOrEqual(1.5);
});

test("the text of a state flag reads on the ground of a tell-tale", () => {
  expect(contrast(t["--awa-tt-flag-ink"], t["--awa-tt-ground"])).toBeGreaterThanOrEqual(4.5);
});
