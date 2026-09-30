/// <reference types="node" />
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { DEFAULT_MAX_ITEMS, visibleItems } from "../src/widgets/cluster.js";
import { defaults, frame, mount } from "./helpers.js";

const css = readFileSync("js/src/styles.css", "utf8");

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.textContent = "";
});

const speed = { _kind: "awa-speedometer", value: 87.3 };
const rpm = { _kind: "awa-tachometer", value: 2500 };
const lamps = { _kind: "awa-telltalecluster", value: [{ function: "engine", state: "on" }] };
const trip = { _kind: "awa-tripcomputer", value: { speed: 90, fuel_rate: 5.4 } };

async function cluster(traits: Record<string, unknown>) {
  const w = mount(defaults("Cluster", traits));
  await frame();
  await frame();
  const area = (name: string) => [...w.el.querySelectorAll(`.awa-area-${name} > .awa-cell > .awa-root`)].map((r) => [...r.classList].find((c) => c.startsWith("awa-") && c !== "awa-root" && !c.startsWith("awa-theme") && !["awa-animate", "awa-missing", "awa-invalid", "awa-stale"].includes(c)));
  const child = (kind: string) => w.el.querySelector(`.awa-root.${kind}`) as HTMLElement;
  return { ...w, area, child };
}

describe("layout (CLU-001, CLU-003)", () => {
  test("puts the dials on the sides, the tell-tales between them and the digital displays below", async () => {
    const c = await cluster({ value: [rpm, lamps, speed, trip] });
    expect(c.area("left")).toEqual(["awa-tachometer"]);
    expect(c.area("mid")).toEqual(["awa-telltalecluster"]);
    expect(c.area("right")).toEqual(["awa-speedometer"]);
    expect(c.area("bottom")).toEqual(["awa-tripcomputer"]);
  });

  test("draws each widget from its traits, the others from the contract", async () => {
    const c = await cluster({ value: [speed] });
    expect(c.child("awa-speedometer").querySelector(".awa-readout")!.textContent).toBe("88");
    expect(c.child("awa-speedometer").querySelector(".awi-label")!.textContent).toBe("Speed");
  });

  test("updates a widget in place when its traits change", async () => {
    const c = await cluster({ value: [speed] });
    const before = c.child("awa-speedometer");
    c.model.set("value", [{ ...speed, value: 120 }]);
    await frame();
    await frame();
    expect(c.child("awa-speedometer")).toBe(before);
    expect(before.querySelector(".awa-readout")!.textContent).toBe("120");
  });

  test("shows an item the contract rejects as INVALID in its place (HOST-004)", async () => {
    const c = await cluster({ value: [{ _kind: "awa-hovercraft" }, "speed", speed] });
    expect([...c.el.querySelectorAll(".awa-cell-invalid")].map((e) => e.textContent)).toEqual(["INVALID", "INVALID"]);
    expect(c.child("awa-speedometer")).toBeTruthy();
  });

  test("a cluster is one widget: it needs no nested widget support from its host (CLU-003)", async () => {
    const c = await cluster({ value: [speed, rpm] });
    expect(c.el.querySelectorAll(".awa-root.awa-cluster").length).toBe(1);
    expect(c.body.getAttribute("role")).toBe("group");
  });
});

describe("traits applied to every widget (CLU-002, UNIT-004)", () => {
  test("its theme", async () => {
    const c = await cluster({ value: [speed, lamps], theme: "dark" });
    for (const k of ["awa-speedometer", "awa-telltalecluster"]) expect(c.child(k).classList.contains("awi-theme-dark")).toBe(true);
  });

  test("its unit system, except where a widget has a unit of its own", async () => {
    const c = await cluster({ value: [speed, { _kind: "awa-temperaturegauge", value: 90, unit: "°C" }], unit_system: "us" });
    expect(c.child("awa-speedometer").querySelector(".awa-unit")!.textContent).toBe("mph");
    expect(c.child("awa-temperaturegauge").querySelector(".awa-readout")!.textContent).toBe("90 °C");
  });

  test("its brightness", async () => {
    const c = await cluster({ value: [speed], brightness: 0.4 });
    expect((c.el.querySelector(".awa-panel") as HTMLElement).style.filter).toBe("brightness(0.4)");
  });
});

describe("distraction (DIS-001)", () => {
  const many = Array.from({ length: 10 }, (_, i) => ({ _kind: "awa-telltale", function: "engine", value: "on", label: `L${i}` }));

  test(`shows at most ${DEFAULT_MAX_ITEMS} widgets, and names the others`, async () => {
    const c = await cluster({ value: many });
    expect(c.el.querySelectorAll(".awa-cell").length).toBe(8);
    expect(c.el.querySelector(".awa-cluster-note")!.textContent).toBe("2 more not shown: L8, L9");
  });

  test("shows as many as max_items where it is set", async () => {
    const c = await cluster({ value: many, max_items: 10 });
    expect(c.el.querySelectorAll(".awa-cell").length).toBe(10);
    expect((c.el.querySelector(".awa-cluster-note") as HTMLElement).hidden).toBe(true);
  });
});

describe("head-up display (HUD-001 .. HUD-006)", () => {
  const panel = [rpm, lamps, speed, { ...trip, hud: true }, { _kind: "awa-gearindicator", value: "4" }];

  test("mirrors the panel left to right, on black (HUD-001, HUD-002)", async () => {
    const c = await cluster({ value: panel, hud: true });
    expect(c.root.classList.contains("awa-hud-on")).toBe(true);
    expect(css).toMatch(/\.awa-root\.awa-hud-on \.awa-panel \{ transform: scaleX\(-1\); background: #000; \}/);
  });

  test("draws the figures in one colour and keeps the colours of the tell-tales (HUD-003)", () => {
    const rule = css.slice(css.indexOf(".awa-root.awa-hud-on .awa-panel .awa-root"));
    const block = rule.slice(0, rule.indexOf("}"));
    for (const t of ["--awi-fg", "--awi-needle", "--awa-lcd-ink"]) expect(block).toContain(`${t}: var(--awa-hud)`);
    expect(block).not.toMatch(/--awa-tt-(red|amber|green|blue)/);
  });

  test("shows only the speed and the widgets marked hud (HUD-004)", async () => {
    const c = await cluster({ value: panel, hud: true });
    expect(c.el.querySelectorAll(".awa-cell").length).toBe(2);
    expect(c.child("awa-speedometer")).toBeTruthy();
    expect(c.child("awa-tripcomputer")).toBeTruthy();
    expect(visibleItems(panel, false, 8).shown.length).toBe(5);
  });

  test("turns animation off in every widget (HUD-005)", async () => {
    const c = await cluster({ value: panel, hud: true });
    expect(c.child("awa-speedometer").classList.contains("awa-animate")).toBe(false);
    const normal = await cluster({ value: panel });
    expect(normal.child("awa-speedometer").classList.contains("awa-animate")).toBe(true);
  });

  test("applies its brightness to every widget (HUD-006)", async () => {
    const c = await cluster({ value: panel, hud: true, brightness: 0.3 });
    expect((c.el.querySelector(".awa-panel") as HTMLElement).style.filter).toBe("brightness(0.3)");
  });
});
