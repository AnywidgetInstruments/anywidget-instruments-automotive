/// <reference types="node" />
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { AVERAGE_FROM_KM, duration, electricRows, PER_HOUR_BELOW_KMH, readTrip, tripRows } from "../src/core/trip.js";
import { OdometerView } from "../src/widgets/digital.js";
import { defaults, frame, mount } from "./helpers.js";

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.textContent = "";
});

describe("trip computer rules (DIG-002, DIG-003, UNIT-016)", () => {
  test("the thresholds are those of the specification", () => {
    expect([PER_HOUR_BELOW_KMH, AVERAGE_FROM_KM]).toEqual([5, 0.1]);
  });

  test("durations read h:mm:ss", () => {
    expect([duration(0), duration(59.9), duration(3725), duration(36000)]).toEqual(["0:00:00", "0:00:59", "1:02:05", "10:00:00"]);
  });

  test.each([
    [{ speed: -1 }],
    [{ fuel_used: -1 }],
    [{ speed: "fast" }],
    [{ speed: "nan" }],
    [{ odometer: 3 }],
    [[1, 2]],
    ["trip"],
  ])("a trip of %j is rejected (HOST-004)", (raw) => {
    expect(readTrip(raw)).toBeUndefined();
  });

  const { cases } = JSON.parse(readFileSync("tests/parity/trip.json", "utf8"));
  for (const c of cases) {
    test(`parity: ${c.name} (HOST-003)`, () => {
      const rowsOf = c.energy === "electric" ? electricRows : tripRows;
      const rows = Object.fromEntries(rowsOf(c.trip, c.unit_system).map((r) => [r.key, [r.text, r.unit]]));
      for (const [key, expected] of Object.entries(c.rows)) {
        if (expected === "absent") expect(rows[key]).toBeUndefined();
        else expect(rows[key], key).toEqual(expected);
      }
    });
  }
});

describe("TripComputer (DIG-001 .. DIG-004)", () => {
  const trip = async (traits: Record<string, unknown>) => {
    const w = mount(defaults("TripComputer", traits));
    await frame();
    const row = (key: string) => w.el.querySelector(`dd[data-key=${key}]`) as HTMLElement | null;
    return { ...w, row, num: (key: string) => row(key)?.querySelector(".awa-trip-num")?.textContent };
  };

  test("shows instant and average consumption, fuel used, distance and elapsed time (DIG-001)", async () => {
    const w = await trip({ value: { speed: 90, fuel_rate: 5.4, distance: 45, fuel_used: 3.15, elapsed: 1800 } });
    expect([...w.el.querySelectorAll("dt")].map((d) => d.textContent)).toEqual(["Instant", "Average", "Fuel used", "Distance", "Time"]);
    expect(["instant", "average", "fuel_used", "distance", "elapsed"].map(w.num)).toEqual(["6.0", "7.0", "3.15", "45.0", "0:30:00"]);
  });

  test("gives the consumption per hour below 5 km/h, and says why (DIG-002)", async () => {
    const w = await trip({ value: { speed: 2, fuel_rate: 0.8 } });
    expect(w.num("instant")).toBe("0.8");
    expect(w.row("instant")!.textContent).toContain("L/h");
    expect(w.row("instant")!.textContent).toContain("below 5 km/h");
  });

  test("gives no average before 0.1 km, a dash and not a zero (DIG-003)", async () => {
    const w = await trip({ value: { distance: 0.05, fuel_used: 0.01 } });
    expect(w.num("average")).toBe("—");
    expect(w.row("average")!.textContent).toContain("after 0.1 km");
  });

  test("shows the range only where it is given (DIG-004)", async () => {
    expect((await trip({ value: { range: 300 } })).num("range")).toBe("300");
    expect((await trip({ value: { speed: 50 } })).row("range")).toBeNull();
  });

  test("shows mpg in the us unit system, or the unit of its own (UNIT-002, UNIT-003)", async () => {
    const us = await trip({ value: { speed: 100, fuel_rate: 8 }, unit_system: "us" });
    expect(us.row("instant")!.textContent).toContain("mpg (US)");
    const own = await trip({ value: { speed: 100, fuel_rate: 8 }, unit_system: "us", unit: "km/L" });
    expect(own.row("instant")!.textContent).toContain("km/L");
    expect(own.num("instant")).toBe("12.5");
  });

  test("with no trip says NO VALUE; with a rejected field, INVALID (ROB-002, HOST-004)", async () => {
    expect((await trip({})).el.querySelector(".awa-state-line")!.textContent).toBe("NO VALUE");
    const bad = await trip({ value: { speed: -3 } });
    expect(bad.el.querySelector(".awa-state-line")!.textContent).toBe("INVALID");
    expect(bad.el.querySelectorAll("dd").length).toBe(0);
  });
});

describe("Odometer (DIG-005)", () => {
  const odo = async (traits: Record<string, unknown>) => {
    const w = mount(defaults("Odometer", traits));
    await frame();
    const drums = (sel: string) => [...w.el.querySelectorAll(`${sel} .awa-drum`)].map((d) => d.textContent).join("");
    return { ...w, total: () => drums(".awa-drums:not(.awa-drums-trip)"), trip: () => drums(".awa-drums-trip") };
  };

  test("shows the total and the trip distance on drums, never rounded up", async () => {
    const w = await odo({ value: 48213.97, trip: 48.36 });
    expect(w.total()).toBe("048213");
    expect(w.trip()).toBe("00483");
    expect(w.body.getAttribute("aria-label")).toBe("Odometer: 48213 km, trip 48.3 km");
  });

  test("a counter never rounds a distance up, even by a float error", () => {
    expect(OdometerView.drums(0.3 * 3, 3, 1)).toBe("0009");
    expect(OdometerView.drums(99.99, 3, 0)).toBe("099");
  });

  test("converts to miles in the imperial and us unit systems", async () => {
    const w = await odo({ value: 160.9344, trip: null, unit_system: "imperial" });
    expect(w.total()).toBe("000100");
    expect(w.el.querySelector(".awa-odo-unit")!.textContent).toBe("mi");
    expect((w.el.querySelector(".awa-odo-trip") as HTMLElement).hidden).toBe(true);
  });

  test("shows dashes, not zeros, with no value (ROB-002)", async () => {
    const w = await odo({});
    expect(w.total()).toBe("------");
  });
});

describe("GearIndicator (DIG-006, DIG-007)", () => {
  const gear = async (traits: Record<string, unknown>) => {
    const w = mount(defaults("GearIndicator", traits));
    await frame();
    return { ...w, gear: () => w.el.querySelector(".awa-gear")!.textContent };
  };

  test.each(["P", "R", "N", "D", "1", "6", "8"])("shows the gear %s (DIG-006)", async (g) => {
    expect((await gear({ value: g })).gear()).toBe(g);
  });

  test("shows an up or down arrow for a suggestion, and none without (DIG-007)", async () => {
    const up = await gear({ value: "3", suggestion: "up" });
    expect(up.el.querySelector(".awa-shift-arrow")!.getAttribute("d")).toMatch(/^M10 2/);
    expect(up.body.getAttribute("aria-label")).toBe("Gear: gear 3, shift up");
    const down = await gear({ value: "3", suggestion: "down" });
    expect(down.el.querySelector(".awa-shift-arrow")!.getAttribute("d")).toMatch(/^M10 18/);
    const none = await gear({ value: "3" });
    expect((none.el.querySelector(".awa-gear-arrow") as unknown as HTMLElement).style.visibility).toBe("hidden");
  });

  test("an unknown gear is not guessed (HOST-004, ROB-002)", async () => {
    expect((await gear({ value: "9" })).gear()).toBe("?");
    expect((await gear({})).gear()).toBe("–");
  });
});
