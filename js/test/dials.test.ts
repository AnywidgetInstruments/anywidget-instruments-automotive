/// <reference types="node" />
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { CONTRACTS } from "../src/generated/contract.js";
import { defaults, frame, mount } from "./helpers.js";

const css = readFileSync("js/src/styles.css", "utf8");
type Title = "Speedometer" | "Tachometer" | "FuelGauge" | "TemperatureGauge";

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.textContent = "";
});

async function dial(title: Title, traits: Record<string, unknown> = {}) {
  const w = mount(defaults(title, traits));
  await frame();
  const q = (sel: string) => w.el.querySelector(sel) as SVGElement | HTMLElement;
  return {
    ...w,
    q,
    readout: () => q(".awa-readout").textContent,
    unit: () => q(".awa-unit").textContent,
    angle: () => Number(/rotate\(([-\d.]+)deg\)/.exec((q(".awa-needle") as SVGElement).style.transform)?.[1] ?? NaN),
    /** A new value from the host, once the previous one has been held (DIS-002). */
    async push(v: unknown) {
      await vi.advanceTimersByTimeAsync(600);
      w.model.set("value", v);
      await frame();
    },
  };
}

describe("common dial behaviour (DIAL-001 .. DIAL-005)", () => {
  test("draws major and minor ticks from min and max, and a needle (DIAL-001)", async () => {
    const d = await dial("Speedometer", { value: 50 });
    expect(d.el.querySelectorAll(".awa-tick-major").length).toBeGreaterThanOrEqual(4);
    expect(d.el.querySelectorAll(".awa-tick-minor").length).toBeGreaterThan(d.el.querySelectorAll(".awa-tick-major").length);
    expect([...d.el.querySelectorAll(".awa-tick-label")].map((t) => t.textContent)).toEqual(["0", "50", "100", "150", "200"]);
    expect(d.q(".awa-needle")).toBeTruthy();
  });

  test("shows the value as text below the needle, with its unit (DIAL-002)", async () => {
    const d = await dial("Speedometer", { value: 50 });
    expect([d.readout(), d.unit()]).toEqual(["50", "km/h"]);
    expect(Number(d.q(".awa-readout").getAttribute("y"))).toBeGreaterThan(Number(d.q(".awa-hub").getAttribute("cy")));
  });

  test("stops the needle at the end of the scale and marks a value above it (DIAL-003)", async () => {
    const d = await dial("Speedometer", { value: 220 });
    const end = d.angle();
    await d.push(260);
    expect(d.angle()).toBe(end);
    expect((d.q(".awa-oor-over") as SVGElement).style.visibility).toBe("visible");
    expect(d.readout()).toBe("260");
    expect(d.body.getAttribute("aria-valuetext")).toBe("260 km/h, above the scale");
    await d.push(-5);
    expect((d.q(".awa-oor-under") as SVGElement).style.visibility).toBe("visible");
  });

  test.each(["nan", "inf", "-inf"])("keeps the needle where it was and shows INVALID for %s (DIAL-004)", async (bad) => {
    const d = await dial("Speedometer", { value: 90 });
    const before = d.angle();
    await d.push(bad);
    expect(d.readout()).toBe("INVALID");
    expect(d.angle()).toBe(before);
  });

  test("colours the zones it is given, converted with the scale (DIAL-005, UNIT-013)", async () => {
    const d = await dial("TemperatureGauge", { value: 90, cold: null, hot: null, unit_system: "us", zones: [{ from: 100, to: 130, kind: "warning" }] });
    expect(d.el.querySelectorAll(".awa-zone-warning").length).toBe(1);
    expect(d.readout()).toBe("194 °F");
  });

  test("shows no value, and no needle, until it receives one (ROB-002)", async () => {
    const d = await dial("Tachometer");
    expect(d.readout()).toBe("NO VALUE");
    expect((d.q(".awa-needle") as SVGElement).style.visibility).toBe("hidden");
    await d.push(900);
    expect((d.q(".awa-needle") as SVGElement).style.visibility).toBe("");
  });

  test("says STALE when its value is older than max_age (ROB-001)", async () => {
    const d = await dial("Speedometer", { value: 30, max_age: 1 });
    await vi.advanceTimersByTimeAsync(1500);
    expect(d.unit()).toBe("km/h · STALE");
    expect(d.body.getAttribute("aria-valuetext")).toBe("30 km/h, stale");
  });

  test.each([
    ["a unit of another quantity", { unit: "L" }],
    ["an unknown input unit", { input_unit: "knots" }],
    ["min above max", { min: 100, max: 0 }],
    ["a zone of an unknown kind", { zones: [{ from: 0, to: 10, kind: "pink" }] }],
    ["a zone with a stray key", { zones: [{ from: 0, to: 10, kind: "danger", color: "red" }] }],
  ])("shows INVALID rather than a figure for %s (HOST-004)", async (_n, traits) => {
    const d = await dial("Speedometer", { value: 50, ...traits });
    expect(d.readout()).toBe("INVALID");
    expect(d.root.classList.contains("awa-invalid")).toBe(true);
  });

  test.each(["Speedometer", "Tachometer", "FuelGauge", "TemperatureGauge", "StateOfChargeGauge", "PowerMeter"] as const)(
    "%s shows its value when a host sets only the value, leaving the other traits to their defaults",
    async (title) => {
      // a JSON-only host (a dashboard panel) sets a few traits; the others are undefined
      const w = mount({ _kind: CONTRACTS[title].kind, value: 50 });
      await frame();
      expect(w.root.classList.contains("awa-invalid")).toBe(false);
      expect(w.el.querySelector(".awa-readout")?.textContent).not.toBe("INVALID");
      w.cleanup();
    },
  );

  test("is a meter to assistive technologies, with its value as text (A11Y-001)", async () => {
    const d = await dial("Speedometer", { value: 50 });
    expect(d.body.getAttribute("role")).toBe("meter");
    expect(d.body.getAttribute("aria-valuetext")).toBe("50 km/h");
    expect(d.body.getAttribute("aria-labelledby")).toBe(d.root.querySelector(".awi-label")!.id);
  });
});

describe("day and night themes (LEG-003, LEG-004)", () => {
  test("the day theme is the light one; the night theme, the dark one at a lower luminance", async () => {
    const day = await dial("Speedometer", { value: 1, theme: "day" });
    expect(day.root.classList.contains("awi-theme-light")).toBe(true);
    const night = await dial("Speedometer", { value: 1, theme: "night" });
    expect(night.root.classList.contains("awi-theme-dark")).toBe(true);
    expect(night.root.classList.contains("awa-night")).toBe(true);
    expect(css).toMatch(/\.awa-root\.awa-root\.awa-root\.awa-root\.awa-night \{/);
  });

  test("a cluster gives its night theme to every widget it holds", async () => {
    const w = mount(defaults("Cluster", { theme: "night", value: [{ _kind: "awa-speedometer", value: 1 }] }));
    await frame();
    await frame();
    expect(w.el.querySelector(".awa-root.awa-speedometer")!.classList.contains("awa-night")).toBe(true);
  });
});

describe("distraction (DIS-002, DIS-003)", () => {
  test("holds each displayed value for 0.5 s when the value changes faster than twice a second (DIS-002)", async () => {
    const d = await dial("Speedometer", { value: 10 });
    await vi.advanceTimersByTimeAsync(600);
    d.model.set("value", 20);
    await frame();
    expect(d.readout()).toBe("20");
    for (const v of [30, 40, 50]) {
      await vi.advanceTimersByTimeAsync(100);
      d.model.set("value", v);
      await frame();
      expect(d.readout()).toBe("20");
    }
    await vi.advanceTimersByTimeAsync(300);
    await frame();
    expect(d.readout()).toBe("50");
  });

  test("a value changing slowly is shown at once", async () => {
    const d = await dial("Speedometer", { value: 10 });
    await d.push(11);
    expect(d.readout()).toBe("11");
  });

  test("the needle glides only while animate is true, and never under reduced motion (DIS-003, A11Y-002)", async () => {
    const d = await dial("Speedometer", { value: 10 });
    expect(d.root.classList.contains("awa-animate")).toBe(true);
    d.model.set("animate", false);
    await frame();
    expect(d.root.classList.contains("awa-animate")).toBe(false);
    expect(css).toMatch(/\.awa-root\.awa-animate \.awa-needle \{ transition: transform/);
    expect(css.slice(css.lastIndexOf("@media (prefers-reduced-motion: reduce)"))).toMatch(/\.awa-animate \.awa-needle \{ transition: none; \}/);
  });
});

describe("speedometer (DIAL-101, SPD-001 .. SPD-003, QA-003)", () => {
  test("shows km/h by default, the unit of the unit system, or its own unit (SPD-002, UNIT-003)", async () => {
    expect((await dial("Speedometer", { value: 1 })).unit()).toBe("km/h");
    expect((await dial("Speedometer", { value: 1, unit_system: "imperial" })).unit()).toBe("mph");
    expect((await dial("Speedometer", { value: 1, unit_system: "us", unit: "km/h" })).unit()).toBe("km/h");
  });

  for (const resolution of [1, 0.5, 2, 0.1]) {
    test(`never rounds down, at every boundary of a resolution of ${resolution} (SPD-001, QA-003)`, async () => {
      const d = await dial("Speedometer", { value: 0, resolution, max: 220 });
      const dec = resolution < 1 ? 1 : 0;
      const steps = Math.round(20 / resolution);
      for (let k = 0; k <= steps; k++) {
        const b = k * resolution;
        await d.push(b);
        expect(d.readout(), `${b}`).toBe(b.toFixed(dec));
        await d.push(b + resolution * 1e-6);
        expect(d.readout(), `just above ${b}`).toBe(((k + 1) * resolution).toFixed(dec));
        if (k > 0) {
          await d.push(b - resolution * 1e-6);
          expect(d.readout(), `just below ${b}`).toBe(b.toFixed(dec));
        }
      }
    });
  }

  test("rounds up after converting, at every boundary in mph (UNIT-015, QA-003)", async () => {
    const d = await dial("Speedometer", { value: 0, unit_system: "us" });
    for (let mph = 0; mph <= 136; mph++) {
      const kmh = mph * 1.609344;
      await d.push(kmh);
      expect(d.readout(), `${mph} mph`).toBe(String(mph));
      await d.push(kmh + 1e-4);
      expect(d.readout(), `just above ${mph} mph`).toBe(String(mph + 1));
    }
  });

  test("marks the limit on the scale and highlights the readout above it (SPD-003)", async () => {
    const d = await dial("Speedometer", { value: 90, limit: 90 });
    expect(d.el.querySelectorAll(".awa-limit").length).toBe(1);
    expect(d.root.classList.contains("awa-over-limit")).toBe(false);
    await d.push(90.4);
    expect(d.root.classList.contains("awa-over-limit")).toBe(true);
    expect(css).toMatch(/\.awa-over-limit \.awa-readout \{[^}]*text-decoration: underline/);
  });
});

describe("tachometer (DIAL-102 .. DIAL-104)", () => {
  test("draws a red zone from the redline (DIAL-102)", async () => {
    const d = await dial("Tachometer", { value: 1000, redline: 6000 });
    expect(d.el.querySelectorAll(".awa-zone-danger").length).toBe(1);
    expect((await dial("Tachometer", { value: 1000 })).el.querySelectorAll(".awa-zone-danger").length).toBe(0);
  });

  test("labels the scale in thousands of rpm", async () => {
    const d = await dial("Tachometer", { value: 1000 });
    expect([...d.el.querySelectorAll(".awa-tick-label")].map((t) => t.textContent)).toEqual(["0", "1", "2", "3", "4", "5", "6", "7"]);
    expect(d.q(".awa-note").textContent).toBe("×1000");
  });

  test("lights the shift light at and above its engine speed (DIAL-103)", async () => {
    const d = await dial("Tachometer", { value: 5799, shift_light: 5800 });
    expect(d.q(".awa-shift").classList.contains("awa-lit")).toBe(false);
    await d.push(5800);
    expect(d.q(".awa-shift").classList.contains("awa-lit")).toBe(true);
  });

  test("says READY at 0 rpm while the vehicle can move, and not otherwise (DIAL-104)", async () => {
    const d = await dial("Tachometer", { value: 0, ready: true });
    expect((d.q(".awa-ready") as SVGElement).style.display).toBe("");
    await d.push(800);
    expect((d.q(".awa-ready") as SVGElement).style.display).toBe("none");
    expect((await dial("Tachometer", { value: 0 })).q(".awa-ready").style.display).toBe("none");
  });
});

describe("fuel and temperature gauges (DIAL-105 .. DIAL-108)", () => {
  test("a fuel gauge reads E to F, with a reserve zone and the fuel pump lit in it (DIAL-105)", async () => {
    const d = await dial("FuelGauge", { value: 50 });
    expect([...d.el.querySelectorAll(".awa-tick-label")].map((t) => t.textContent).filter(Boolean)).toEqual(["E", "½", "F"]);
    expect(d.el.querySelectorAll(".awa-zone-warning").length).toBe(1);
    expect(d.q(".awa-dial-tt").classList.contains("awa-lit")).toBe(false);
    await d.push(12);
    expect(d.q(".awa-dial-tt").classList.contains("awa-lit")).toBe(true);
  });

  test("points the fuel pump towards the filler side (DIAL-106)", async () => {
    const right = await dial("FuelGauge", { value: 50, filler_side: "right" });
    const left = await dial("FuelGauge", { value: 50, filler_side: "left" });
    const x = (d: typeof right) => Number(/^M([\d.]+)/.exec(d.q(".awa-filler").getAttribute("d")!)![1]);
    expect(x(right)).toBeGreaterThan(80);
    expect(x(left)).toBeLessThan(80);
    expect((await dial("FuelGauge", { value: 50 })).q(".awa-filler").style.display).toBe("none");
  });

  test("a temperature gauge has cold and hot zones (DIAL-107)", async () => {
    const d = await dial("TemperatureGauge", { value: 90 });
    expect(d.el.querySelectorAll(".awa-zone-cold").length).toBe(1);
    expect(d.el.querySelectorAll(".awa-zone-danger").length).toBe(1);
  });

  test("lights its temperature tell-tale in red in the hot zone (DIAL-108)", async () => {
    const d = await dial("TemperatureGauge", { value: 114 });
    const lamp = d.q(".awa-dial-tt");
    expect(lamp.classList.contains("awa-red")).toBe(true);
    expect(lamp.classList.contains("awa-lit")).toBe(false);
    await d.push(115);
    expect(lamp.classList.contains("awa-lit")).toBe(true);
  });
});

describe("parity cases (HOST-003)", () => {
  const { cases } = JSON.parse(readFileSync("tests/parity/dials.json", "utf8"));
  for (const c of cases) {
    test(`${c.widget} ${JSON.stringify(c.traits)} reads ${c.readout}`, async () => {
      expect(Object.keys(CONTRACTS)).toContain(c.widget);
      const d = await dial(c.widget, c.traits);
      expect(d.readout()).toBe(c.readout);
      if (c.unit) expect(d.unit()).toBe(c.unit);
    });
  }
});
