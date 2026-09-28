// Tell-tale functions: name, colour and symbol (TEL-001 .. TEL-003).
//
// The colour comes from the meaning of the function — red for a danger, amber
// for a warning, green for a function on, blue for the main beam — and never
// from the theme (TEL-001). The symbols are original drawings, modelled on the
// published meaning of the ISO 2575 symbols and not copied from the figures of
// the standard (open question 2 of the specification): a 24 × 24 grid, strokes
// of 1.6, filled shapes where a hollow one would not read at 16 px.

export type Colour = "red" | "amber" | "green" | "blue";

/** One SVG primitive of a symbol: tag, attributes, and text for a <text>. */
export type Part = [tag: string, attrs: Record<string, string | number>, text?: string];

export interface TellTaleFunction {
  name: string;
  colour: Colour;
  symbol: Part[];
}

/** Order of the lit tell-tales in a cluster (TEL-006). */
export const COLOUR_ORDER: Record<Colour, number> = { red: 0, amber: 1, green: 2, blue: 3 };

const path = (d: string, extra: Record<string, string | number> = {}): Part => ["path", { d, ...extra }];
const filled = (d: string): Part => ["path", { d, class: "awa-fill" }];
const circle = (cx: number, cy: number, r: number, extra: Record<string, string | number> = {}): Part => ["circle", { cx, cy, r, ...extra }];
const text = (x: number, y: number, t: string, size = 6.5): Part => ["text", { x, y, "font-size": size, class: "awa-sym-text" }, t];

/** Beams of a lamp: `n` lines from x0 to x1, tilted down by `drop`. */
function beams(x0: number, x1: number, ys: number[], drop = 0): Part[] {
  return ys.map((y) => path(`M${x0} ${y}L${x1} ${y + drop}`));
}
/** A wavy line crossing the beams of a fog lamp. */
const wave = (x: number): Part => path(`M${x} 5c-1.5 2 1.5 3 0 5s1.5 3 0 5s1.5 3 0 5`);

export const FUNCTIONS: Record<string, TellTaleFunction> = {
  brake: {
    name: "Brake",
    colour: "red",
    symbol: [circle(12, 12, 6.5), path("M5 6.5a8 8 0 0 0 0 11"), path("M19 6.5a8 8 0 0 1 0 11"), path("M12 8.5v4.5"), circle(12, 15.6, 0.9, { class: "awa-fill" })],
  },
  oil_pressure: {
    name: "Oil pressure",
    colour: "red",
    symbol: [path("M3 11h3l2-2h7l6-2-6 7H6v-4"), path("M8 9V7h3"), path("M21 14c0 1.2-.7 2-1.4 2s-1.4-.8-1.4-2c0-1 1.4-2.6 1.4-2.6s1.4 1.6 1.4 2.6z", { class: "awa-fill" })],
  },
  coolant_temperature: {
    name: "Coolant temperature",
    colour: "red",
    symbol: [path("M12 3v10"), path("M12 5h3M12 8h3M12 11h3"), circle(12, 15, 2.2, { class: "awa-fill" }), path("M3 19c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0")],
  },
  battery: {
    name: "Battery",
    colour: "red",
    symbol: [path("M3 8h18v11H3z"), path("M6 8V6h3v2M15 8V6h3v2"), path("M6 13.5h4M16 11.5v4M14 13.5h4")],
  },
  seat_belt: {
    name: "Seat belt",
    colour: "red",
    symbol: [circle(11, 4.5, 2, { class: "awa-fill" }), path("M11 8v6l-3 6M11 14h5l1 6"), path("M8 8l8 8"), path("M16 8h3")],
  },
  airbag: {
    name: "Airbag",
    colour: "red",
    symbol: [circle(7, 4.5, 2, { class: "awa-fill" }), path("M7 8v6l-2 6M7 14h5l1 6"), circle(16, 10, 4.5)],
  },
  door_open: {
    name: "Door open",
    colour: "red",
    symbol: [path("M8 3h8l1 5v11H7V8z"), path("M7 9l-4 3M17 9l4 3"), path("M9 8h6")],
  },
  engine: {
    name: "Engine",
    colour: "amber",
    symbol: [path("M4 10h2V8h3V6h6v2h2l2 2h2v6h-2l-2 2H8l-2-2H4z"), path("M2 12v2"), path("M10 6V4h4v2")],
  },
  abs: {
    name: "ABS",
    colour: "amber",
    symbol: [circle(12, 12, 6.5), path("M4.5 6.5a8 8 0 0 0 0 11"), path("M19.5 6.5a8 8 0 0 1 0 11"), text(12, 14.3, "ABS", 5.6)],
  },
  low_fuel: {
    name: "Low fuel",
    colour: "amber",
    symbol: [path("M5 20V5h8v15z"), path("M4 20h10"), path("M7 8h4v3H7z", { class: "awa-fill" }), path("M13 9h2l2 2v6a1.5 1.5 0 0 0 3 0V8l-2-2")],
  },
  tyre_pressure: {
    name: "Tyre pressure",
    colour: "amber",
    symbol: [path("M6 19a8 8 0 0 1 0-14M18 5a8 8 0 0 1 0 14"), path("M5 19h14"), path("M12 7.5v6"), circle(12, 16.2, 0.9, { class: "awa-fill" })],
  },
  stability_control: {
    name: "Stability control",
    colour: "amber",
    symbol: [path("M5 11l2-4h10l2 4v3H5z"), circle(8, 14.5, 1.3, { class: "awa-fill" }), circle(16, 14.5, 1.3, { class: "awa-fill" }), path("M5 19c1.5-1.5 3-1.5 4.5 0M14.5 19c1.5-1.5 3-1.5 4.5 0")],
  },
  glow_plug: {
    name: "Glow plug",
    colour: "amber",
    symbol: [path("M4 14c0-3 2-3 2 0s2 3 2 0 2-3 2 0 2 3 2 0 2-3 2 0 2 3 2 0 2-3 2 0"), path("M3 8v3M21 8v3"), path("M3 8h18")],
  },
  rear_fog: {
    name: "Rear fog lamp",
    colour: "amber",
    symbol: [path("M9 5a7 7 0 0 1 0 14z", { class: "awa-fill" }), ...beams(18, 23, [7, 12, 17]), wave(20.5)],
  },
  turn_left: {
    name: "Turn left",
    colour: "green",
    symbol: [filled("M2 12l8-7v4h11v6H10v4z")],
  },
  turn_right: {
    name: "Turn right",
    colour: "green",
    symbol: [filled("M22 12l-8-7v4H3v6h11v4z")],
  },
  low_beam: {
    name: "Dipped beam",
    colour: "green",
    symbol: [path("M15 5a7 7 0 0 0 0 14z", { class: "awa-fill" }), ...beams(11, 3, [6.5, 10.5, 14.5, 18.5], 2.5)],
  },
  position_lamps: {
    name: "Position lamps",
    colour: "green",
    symbol: [path("M8 8a4 4 0 0 0 0 8z", { class: "awa-fill" }), path("M16 8a4 4 0 0 1 0 8z", { class: "awa-fill" }), ...beams(5, 1.5, [8.5, 12, 15.5]), ...beams(19, 22.5, [8.5, 12, 15.5])],
  },
  front_fog: {
    name: "Front fog lamp",
    colour: "green",
    symbol: [path("M15 5a7 7 0 0 0 0 14z", { class: "awa-fill" }), ...beams(11, 1.5, [7, 12, 17], 2), wave(6.5)],
  },
  cruise_control: {
    name: "Cruise control",
    colour: "green",
    symbol: [path("M4.5 17a8 8 0 1 1 15 0"), path("M12 13l4-4"), circle(12, 13, 1.3, { class: "awa-fill" }), path("M3 20h18")],
  },
  ready: {
    name: "Ready",
    colour: "green",
    symbol: [path("M3 7h18v10H3z"), text(12, 14.3, "READY", 5.2)],
  },
  high_beam: {
    name: "Main beam",
    colour: "blue",
    symbol: [path("M15 5a7 7 0 0 0 0 14z", { class: "awa-fill" }), ...beams(11, 3, [6.5, 10.5, 14.5, 18.5])],
  },
};

export type TellTaleState = "off" | "on" | "blinking";

/** Blink frequency of a blinking tell-tale, in Hz: within 1 to 2 Hz (TEL-007). */
export const BLINK_HZ = 1.5;
