/// <reference types="node" />
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { convert, convertScale, decimalsOf, KPA_PER_PSI, metricUnit, quantityOf, resolveUnits, roundUp, systemUnit, UNITS, type Quantity } from "../src/core/units.js";
import { UNIT_TABLE } from "../src/generated/contract.js";

const close = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThanOrEqual(1e-9 * Math.max(1, Math.abs(b)));

describe("unit systems (UNIT-001, UNIT-002)", () => {
  test("each unit system assigns the unit of the table of the specification to each quantity", () => {
    const table: Record<string, [string, string, string]> = {
      speed: ["km/h", "mph", "mph"],
      distance: ["km", "mi", "mi"],
      volume: ["L", "imperial gal", "US gal"],
      fuel_economy: ["L/100 km", "mpg (imperial)", "mpg (US)"],
      temperature: ["°C", "°C", "°F"],
      pressure: ["kPa", "psi", "psi"],
    };
    for (const [q, [metric, imperial, us]] of Object.entries(table)) {
      expect([systemUnit(q as Quantity, "metric"), systemUnit(q as Quantity, "imperial"), systemUnit(q as Quantity, "us")]).toEqual([metric, imperial, us]);
    }
  });

  test("the metric unit of a quantity is the first unit the contract lists for it", () => {
    for (const q of Object.keys(UNIT_TABLE) as Quantity[]) expect(metricUnit(q)).toBe(systemUnit(q, "metric"));
  });

  test("every unit a system assigns is a unit of its quantity", () => {
    for (const [q, { units, systems }] of Object.entries(UNIT_TABLE)) {
      for (const u of Object.values(systems)) {
        expect(units).toContain(u);
        expect(quantityOf(u)).toBe(q);
      }
    }
  });

  test("a gallon and an mpg are always named imperial or US (UNIT-005)", () => {
    for (const u of UNITS) if (/gal|mpg/.test(u)) expect(u).toMatch(/imperial|US/);
  });
});

describe("conversion (UNIT-010 .. UNIT-016)", () => {
  test("every unit name of the contract converts to every other unit of its quantity (UNIT-017)", () => {
    for (const { units } of Object.values(UNIT_TABLE)) for (const a of units) for (const b of units) expect(Number.isFinite(convert(7, a, b))).toBe(true);
  });

  test("the factors are the exact defining ones (UNIT-011)", () => {
    expect(convert(1, "mi", "km")).toBe(1.609344);
    expect(convert(1, "US gal", "L")).toBe(3.785411784);
    expect(convert(1, "imperial gal", "L")).toBe(4.54609);
    expect(convert(37, "°C", "°F")).toBeCloseTo(98.6, 12);
    close(KPA_PER_PSI, 6.894757293168361);
  });

  test("a fuel economy converts by its reciprocal, not in proportion (UNIT-012)", () => {
    // halving the consumption doubles the mpg
    close(convert(5, "L/100 km", "mpg (US)"), 2 * convert(10, "L/100 km", "mpg (US)"));
  });

  test("a zero consumption has no mpg: no figure, never infinity (UNIT-016)", () => {
    expect(convert(0, "L/100 km", "mpg (US)")).toBeNaN();
    expect(convert(0, "L/100 km", "km/L")).toBeNaN();
  });

  test("converting between quantities is refused", () => {
    expect(() => convert(1, "km/h", "°C")).toThrow();
  });

  test("a scale between L/100 km and mpg is reversed, its ends swapped (UNIT-013)", () => {
    const s = convertScale(4, 20, "L/100 km", "mpg (US)");
    expect(s.reversed).toBe(true);
    expect(s.min).toBeLessThan(s.max);
    close(s.max, convert(4, "L/100 km", "mpg (US)"));
  });
});

describe("rounding up (SPD-001, UNIT-015)", () => {
  test("a value is never rounded down", () => {
    for (let i = 0; i < 2000; i++) {
      const v = i * 0.137;
      expect(roundUp(v, 1)).toBeGreaterThanOrEqual(v - 1e-9);
      expect(roundUp(v, 1) - v).toBeLessThan(1);
    }
  });

  test("the number of decimals follows the resolution", () => {
    expect([decimalsOf(1), decimalsOf(0.1), decimalsOf(0.5), decimalsOf(0.01), decimalsOf(2)]).toEqual([0, 1, 1, 2, 0]);
  });

  test("50 mph given as 80.4672 km/h reads 50, not 51: rounding after conversion tolerates the float error", () => {
    expect(roundUp(convert(80.4672, "km/h", "mph"), 1)).toBe(50);
  });
});

describe("resolving units from traits (UNIT-003, UNIT-010, HOST-004)", () => {
  test("a unit of another quantity is refused", () => {
    expect(resolveUnits("speed", { unit: "L" })).toBeUndefined();
  });
  test("an unknown unit system is read as metric", () => {
    expect(resolveUnits("speed", { unit_system: "martian" })).toEqual({ from: "km/h", to: "km/h" });
  });
});

describe("parity cases (HOST-003)", () => {
  const cases: any = JSON.parse(readFileSync("tests/parity/units.json", "utf8"));
  const num = (v: unknown) => (v === "nan" ? NaN : v === "inf" ? Infinity : v === "-inf" ? -Infinity : (v as number));

  for (const c of cases.convert) test(`convert ${c.value} ${c.from} → ${c.to}`, () => {
    const out = convert(num(c.value), c.from, c.to);
    if (c.expected === null) expect(out).toBeNaN();
    else close(out, c.expected);
  });

  for (const c of cases.resolve) test(`resolve ${c.quantity} ${JSON.stringify(c.traits)}`, () => {
    expect(resolveUnits(c.quantity, c.traits) ?? null).toEqual(c.expected);
  });

  for (const [v, res, expected] of cases.round_up as Array<[number, number, number]>) test(`round up ${v} at ${res} gives ${expected}`, () => {
    close(roundUp(v, res), expected);
  });

  for (const c of cases.scale) test(`scale ${c.min}..${c.max} ${c.from} → ${c.to}`, () => {
    const s = convertScale(c.min, c.max, c.from, c.to);
    expect(s.reversed).toBe(c.expected.reversed);
    for (const k of ["min", "max"] as const) {
      if (c.expected[k] === null) expect(s[k]).toBeNaN();
      else close(s[k], c.expected[k]);
    }
  });

  test("every unit of the parity cases is a unit of the contract", () => {
    for (const c of cases.convert) expect(UNITS).toEqual(expect.arrayContaining([c.from, c.to]));
  });
});
