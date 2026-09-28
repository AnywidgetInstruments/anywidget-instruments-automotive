// Unit systems and conversion (UNIT-001 .. UNIT-017), computed in the front end
// so that every host shows the same figures for the same traits (GEN-004).
//
// The names come from the trait contract (units.schema.json, UNIT-017); this
// module holds how each converts. Linear quantities go through the metric
// unit of their quantity with the exact defining factors (UNIT-011); a fuel
// economy goes through L/100 km with the reciprocal relation (UNIT-012).
import { UNIT_TABLE } from "../generated/contract.js";

export type Quantity = keyof typeof UNIT_TABLE;
export type UnitSystem = "metric" | "imperial" | "us";

// Exact by definition: the international mile (1959) and the US liquid and
// imperial gallons; the pound-force from the pound (0.45359237 kg) and the
// standard gravity (9.80665 m/s²), over the square inch (0.0254 m)².
export const KM_PER_MI = 1.609344;
export const L_PER_US_GAL = 3.785411784;
export const L_PER_IMP_GAL = 4.54609;
export const KPA_PER_PSI = (0.45359237 * 9.80665) / (0.0254 * 0.0254) / 1000;

/**
 * A linear unit by its size in the metric unit of its quantity, and the
 * offset of its zero: metric value = (value − offset) × size. Sizes are the
 * defining factors themselves, never their inverses, so that 1 US gal is
 * exactly 3.785411784 L.
 */
interface Linear {
  size: number;
  offset?: number;
}

const LINEAR: Record<string, Linear> = {
  "km/h": { size: 1 },
  mph: { size: KM_PER_MI },
  km: { size: 1 },
  mi: { size: KM_PER_MI },
  L: { size: 1 },
  "imperial gal": { size: L_PER_IMP_GAL },
  "US gal": { size: L_PER_US_GAL },
  "L/100 km": { size: 1 },
  "L/h": { size: 1 },
  "imperial gal/h": { size: L_PER_IMP_GAL },
  "US gal/h": { size: L_PER_US_GAL },
  "°C": { size: 1 },
  "°F": { size: 5 / 9, offset: 32 },
  kPa: { size: 1 },
  psi: { size: KPA_PER_PSI },
  bar: { size: 100 },
  rpm: { size: 1 },
  "%": { size: 1 },
};

/**
 * A fuel economy is either per distance (L/100 km, lower is better) or per
 * volume (mpg, km/L, higher is better). `k` relates a per-volume unit to
 * L/100 km: value = k / (L/100 km).
 */
const PER_VOLUME: Record<string, number> = {
  "km/L": 100,
  "mpg (US)": (100 * L_PER_US_GAL) / KM_PER_MI,
  "mpg (imperial)": (100 * L_PER_IMP_GAL) / KM_PER_MI,
};

const QUANTITY_OF: Record<string, Quantity> = Object.fromEntries(
  (Object.entries(UNIT_TABLE) as Array<[Quantity, { units: readonly string[] }]>).flatMap(([q, { units }]) => units.map((u) => [u, q])),
);

/** Every unit name the front end accepts (UNIT-017). */
export const UNITS: readonly string[] = Object.keys(QUANTITY_OF);

export function quantityOf(unit: string): Quantity | undefined {
  return QUANTITY_OF[unit];
}

/** The metric unit of a quantity: the default of `input_unit` (UNIT-010). */
export function metricUnit(quantity: Quantity): string {
  return UNIT_TABLE[quantity].units[0];
}

/** The unit a unit system assigns to a quantity (UNIT-002). */
export function systemUnit(quantity: Quantity, system: UnitSystem): string {
  return UNIT_TABLE[quantity].systems[system];
}

/** True for a fuel economy per volume (mpg, km/L), where higher is better. */
export function perVolume(unit: string): boolean {
  return unit in PER_VOLUME;
}

/**
 * Units a widget works with: the unit of its values (`input_unit`, or the
 * metric unit) and the displayed unit (`unit`, or the one of the unit system,
 * UNIT-003). `undefined` when a name is not a unit of the quantity: the widget
 * then shows its invalid state rather than a guessed figure (HOST-004).
 */
export function resolveUnits(quantity: Quantity, { unit, input_unit, unit_system }: { unit?: unknown; input_unit?: unknown; unit_system?: unknown }): { from: string; to: string } | undefined {
  const system: UnitSystem = unit_system === "imperial" || unit_system === "us" ? unit_system : "metric";
  const from = typeof input_unit === "string" && input_unit ? input_unit : metricUnit(quantity);
  const to = typeof unit === "string" && unit ? unit : systemUnit(quantity, system);
  if (quantityOf(from) !== quantity || quantityOf(to) !== quantity) return undefined;
  return { from, to };
}

function toMetric(v: number, unit: string): number {
  if (unit in PER_VOLUME) return PER_VOLUME[unit] / v;
  const l = LINEAR[unit];
  return (v - (l.offset ?? 0)) * l.size;
}

function fromMetric(v: number, unit: string): number {
  if (unit in PER_VOLUME) return PER_VOLUME[unit] / v;
  const l = LINEAR[unit];
  return v / l.size + (l.offset ?? 0);
}

/**
 * `v` converted from the unit `from` to the unit `to`, of one quantity.
 * A fuel economy of zero (or an infinite one) has no finite reciprocal: the
 * result is NaN, which a widget shows as no value (UNIT-016), never infinity.
 */
export function convert(v: number, from: string, to: string): number {
  if (!Number.isFinite(v)) return NaN;
  if (from === to) return v;
  const q = quantityOf(from);
  if (!q || q !== quantityOf(to)) throw new Error(`cannot convert ${from} to ${to}`);
  if ((perVolume(from) || perVolume(to)) && perVolume(from) !== perVolume(to) && v === 0) return NaN;
  if (perVolume(from) && perVolume(to) && v === 0) return 0;
  const out = fromMetric(toMetric(v, from), to);
  return Number.isFinite(out) ? out : NaN;
}

/** A scale in a displayed unit: `reversed` when its better end moved (UNIT-013). */
export interface ConvertedScale {
  min: number;
  max: number;
  /** True when the scale runs from high to low, its better end kept on the same side. */
  reversed: boolean;
}

/**
 * The ends of a scale [min, max] given in `from`, in the unit `to`. Between a
 * per-distance and a per-volume economy the relation is reciprocal and
 * decreasing: the ends swap, and the scale is reversed so that its better end
 * stays where it was (UNIT-013). An end of zero L/100 km has no finite mpg:
 * it is NaN, and the widget does not draw that part of the scale.
 */
export function convertScale(min: number, max: number, from: string, to: string): ConvertedScale {
  const a = convert(min, from, to);
  const b = convert(max, from, to);
  const reversed = perVolume(from) !== perVolume(to);
  return reversed ? { min: b, max: a, reversed } : { min: a, max: b, reversed };
}

/**
 * Round `v` up to a multiple of `resolution`, never down (SPD-001), after any
 * conversion (UNIT-015). The quotient is compared with a tolerance of 1e-9 of
 * the resolution, so that a value on a boundary that the conversion factors
 * move by a rounding error of binary floating point (50 mph given as
 * 80.4672 km/h) is not pushed to the next step.
 */
export function roundUp(v: number, resolution = 1): number {
  if (!Number.isFinite(v) || !(resolution > 0)) return v;
  const q = v / resolution;
  const n = Math.abs(q - Math.round(q)) < 1e-9 ? Math.round(q) : Math.ceil(q);
  // a negative zero would print as "-0"
  return n * resolution + 0;
}

/** Number of decimals needed to print multiples of `resolution`. */
export function decimalsOf(resolution: number): number {
  if (!(resolution > 0) || resolution >= 1) return 0;
  return Math.min(6, Math.max(0, Math.ceil(-Math.log10(resolution) - 1e-9)));
}
