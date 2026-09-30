// Figures of a trip computer (DIG-001 .. DIG-004, UNIT-016), computed in the
// front end from the raw figures of a trip, so that every host shows the same.
//
// The rules are those of the trip computer of CAN & CANopen Studio: below
// 5 km/h the consumption is given per hour, since per 100 km it tends to
// infinity at a standstill; an average over less than 0.1 km is noise and is
// not given.
import { convert, systemUnit, type UnitSystem } from "./units.js";

/** Below this speed (km/h) the consumption is given per hour (DIG-002). */
export const PER_HOUR_BELOW_KMH = 5;
/** Below this distance (km) no average is given (DIG-003). */
export const AVERAGE_FROM_KM = 0.1;

/** Raw figures of a trip, in metric units, as a host reads them. */
export interface Trip {
  /** Vehicle speed, km/h. */
  speed?: number | null;
  /** Fuel rate, L/h. */
  fuel_rate?: number | null;
  /** Distance since the trip began, km. */
  distance?: number | null;
  /** Fuel used since the trip began, L. */
  fuel_used?: number | null;
  /** Time since the trip began, s. */
  elapsed?: number | null;
  /** Remaining range, km; absent: not shown (DIG-004). */
  range?: number | null;
  /** Power of an electric drivetrain, kW; negative when it regenerates (EV-006). */
  power?: number | null;
  /** Energy used since the trip began, kWh (EV-006). */
  energy_used?: number | null;
}

export const TRIP_KEYS = ["speed", "fuel_rate", "distance", "fuel_used", "elapsed", "range", "power", "energy_used"] as const;

/** Figures that may be negative: an electric drivetrain regenerates. */
const SIGNED = new Set(["power", "energy_used"]);

/** One line of the display: what it is, the figure, its unit; `text` null: no figure, with `why`. */
export interface Row {
  key: "instant" | "average" | "fuel_used" | "energy_used" | "distance" | "elapsed" | "range";
  label: string;
  text: string | null;
  unit: string;
  why?: string;
}

const known = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function fixed(v: number, decimals: number): string {
  return (Math.round(v * 10 ** decimals) / 10 ** decimals + 0).toFixed(decimals);
}

/** h:mm:ss */
export function duration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** A consumption per distance in the unit of the system: L/100 km, or mpg, which may have no figure (UNIT-016). */
function economy(lPer100: number, system: UnitSystem, unit: string): { text: string | null; unit: string } {
  const to = unit || systemUnit("fuel_economy", system);
  const v = convert(lPer100, "L/100 km", to);
  return { text: Number.isFinite(v) ? fixed(v, 1) : null, unit: to };
}

/** An energy consumption per distance in the unit of the system: kWh/100 km, or mi/kWh (UNIT-012). */
function energyEconomy(kwhPer100: number, system: UnitSystem, unit: string): { text: string | null; unit: string } {
  const to = unit || systemUnit("energy_economy", system);
  const v = convert(kwhPer100, "kWh/100 km", to);
  return { text: Number.isFinite(v) ? fixed(v, 1) : null, unit: to };
}

/**
 * The rows of the trip computer of an electric drivetrain (EV-006): the rules of
 * DIG-002 and DIG-003 applied to energy. A negative power is regeneration: it is
 * given in kW, never as a negative consumption.
 */
export function electricRows(trip: Trip, system: UnitSystem, unit = ""): Row[] {
  const rows: Row[] = [];
  const econUnit = unit || systemUnit("energy_economy", system);
  if (known(trip.power) && trip.power < 0) {
    rows.push({ key: "instant", label: "Instant", text: fixed(-trip.power, 1), unit: "kW", why: "regenerating" });
  } else if (known(trip.speed) && known(trip.power) && trip.speed >= PER_HOUR_BELOW_KMH) {
    rows.push({ key: "instant", label: "Instant", ...energyEconomy((trip.power / trip.speed) * 100, system, unit) });
  } else if (known(trip.power)) {
    rows.push({ key: "instant", label: "Instant", text: fixed(trip.power, 1), unit: "kW", why: known(trip.speed) ? `below ${PER_HOUR_BELOW_KMH} km/h` : undefined });
  } else {
    rows.push({ key: "instant", label: "Instant", text: null, unit: "kW", why: "no power" });
  }
  if (known(trip.distance) && known(trip.energy_used) && trip.distance >= AVERAGE_FROM_KM) {
    const avg = (trip.energy_used / trip.distance) * 100;
    rows.push(avg > 0 ? { key: "average", label: "Average", ...energyEconomy(avg, system, unit) } : { key: "average", label: "Average", text: null, unit: econUnit, why: "more regenerated than used" });
  } else {
    rows.push({ key: "average", label: "Average", text: null, unit: econUnit, why: known(trip.distance) ? `after ${AVERAGE_FROM_KM} km` : "no distance" });
  }
  rows.push({ key: "energy_used", label: "Energy used", text: known(trip.energy_used) ? fixed(trip.energy_used, 2) : null, unit: "kWh" });
  return [...rows, ...commonRows(trip, system)];
}

/** Distance, time and range: the same for every drivetrain. */
function commonRows(trip: Trip, system: UnitSystem): Row[] {
  const rows: Row[] = [];
  const dist = systemUnit("distance", system);
  rows.push({ key: "distance", label: "Distance", text: known(trip.distance) ? fixed(convert(trip.distance, "km", dist), 1) : null, unit: dist });
  rows.push({ key: "elapsed", label: "Time", text: known(trip.elapsed) ? duration(trip.elapsed) : null, unit: "" });
  // range, where given (DIG-004)
  if (trip.range !== undefined && trip.range !== null) rows.push({ key: "range", label: "Range", text: known(trip.range) ? fixed(convert(trip.range, "km", dist), 0) : null, unit: dist });
  return rows;
}

/**
 * The rows of a trip computer. `unit` is the economy unit of the widget, if
 * set; the other quantities follow the unit system.
 */
export function tripRows(trip: Trip, system: UnitSystem, unit = ""): Row[] {
  const rows: Row[] = [];
  const rateUnit = systemUnit("fuel_rate", system);
  // instant consumption (DIG-002)
  if (known(trip.speed) && known(trip.fuel_rate) && trip.speed >= PER_HOUR_BELOW_KMH) {
    rows.push({ key: "instant", label: "Instant", ...economy((trip.fuel_rate / trip.speed) * 100, system, unit) });
  } else if (known(trip.fuel_rate)) {
    rows.push({ key: "instant", label: "Instant", text: fixed(convert(trip.fuel_rate, "L/h", rateUnit), 1), unit: rateUnit, why: known(trip.speed) ? `below ${PER_HOUR_BELOW_KMH} km/h` : undefined });
  } else {
    rows.push({ key: "instant", label: "Instant", text: null, unit: rateUnit, why: "no fuel rate" });
  }
  // average consumption (DIG-003)
  const econUnit = unit || systemUnit("fuel_economy", system);
  if (known(trip.distance) && known(trip.fuel_used) && trip.distance >= AVERAGE_FROM_KM) {
    rows.push({ key: "average", label: "Average", ...economy((trip.fuel_used / trip.distance) * 100, system, unit) });
  } else {
    rows.push({ key: "average", label: "Average", text: null, unit: econUnit, why: known(trip.distance) ? `after ${AVERAGE_FROM_KM} km` : "no distance" });
  }
  const volume = systemUnit("volume", system);
  rows.push({ key: "fuel_used", label: "Fuel used", text: known(trip.fuel_used) ? fixed(convert(trip.fuel_used, "L", volume), 2) : null, unit: volume });
  return [...rows, ...commonRows(trip, system)];
}

/** A trip as the schema describes it; `undefined` when a field is rejected (HOST-004). */
export function readTrip(raw: unknown): Trip | undefined {
  if (raw === null) return {};
  if (typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: Trip = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!(TRIP_KEYS as readonly string[]).includes(k)) return undefined;
    if (v !== null && (typeof v !== "number" || !Number.isFinite(v) || (v < 0 && !SIGNED.has(k)))) return undefined;
    out[k as keyof Trip] = v as number | null;
  }
  return out;
}
