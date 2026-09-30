// Dials: Speedometer, Tachometer, FuelGauge, TemperatureGauge (DIAL, SPD).
//
// A dial reads its value, scale and zones in `input_unit` and draws them in
// the displayed unit (UNIT-002, UNIT-010, UNIT-013). What it shows is decided
// here, in the front end, so that every host shows the same figures (GEN-004).
import { clear, setAttr, setText, svg, svgText } from "anywidget-instruments/js/src/core/dom.js";
import type { AnyModel, Traits } from "anywidget-instruments/js/src/core/model.js";
import { polar, sectorPath, ticks } from "anywidget-instruments/js/src/core/scale.js";
import { STATE_TEXT } from "../core/state.js";
import { convert, convertScale, decimalsOf, type Quantity, resolveUnits, roundUp } from "../core/units.js";
import { AutomotiveView } from "../core/view.js";
import { QUANTITY_OF_KIND } from "../generated/contract.js";
import { FUNCTIONS } from "./telltales.js";

export type ZoneKind = "danger" | "warning" | "cold" | "charge";
export interface Zone {
  from: number;
  to: number;
  kind: ZoneKind;
}

/** Geometry of a dial in its own viewBox; angles in degrees clockwise from 12 o'clock. */
export interface Geometry {
  vb: [number, number];
  cx: number;
  cy: number;
  sweep: number;
  face: number | null;
  tick: number;
  major: number;
  minor: number;
  label: number;
  needle: number;
  readout: number;
}

export const ROUND: Geometry = { vb: [200, 200], cx: 100, cy: 100, sweep: 240, face: 97, tick: 90, major: 78, minor: 84, label: 65, needle: 78, readout: 154 };
export const SMALL: Geometry = { vb: [160, 130], cx: 80, cy: 96, sweep: 100, face: null, tick: 80, major: 70, minor: 74, label: 58, needle: 70, readout: 122 };

const KINDS = new Set(["danger", "warning", "cold", "charge"]);

/** Zones as the schema describes them; `undefined` when an item is rejected (HOST-004). */
export function readZones(raw: unknown): Zone[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: Zone[] = [];
  for (const z of raw) {
    if (typeof z !== "object" || z === null || Array.isArray(z)) return undefined;
    const { from, to, kind, ...extra } = z as Record<string, unknown>;
    if (Object.keys(extra).length || typeof from !== "number" || typeof to !== "number" || !Number.isFinite(from) || !Number.isFinite(to) || !KINDS.has(kind as string)) return undefined;
    out.push({ from, to, kind: kind as ZoneKind });
  }
  return out;
}

/** What the readout of a dial says (DIAL-002, SPD-001, UNIT-015). */
export function readoutNumber(v: number, resolution: number, up: boolean): string {
  const r = up ? roundUp(v, resolution) : Math.round(v / resolution) * resolution + 0;
  return r.toFixed(decimalsOf(resolution));
}

export class DialView<T extends object = Traits> extends AutomotiveView<T> {
  readonly svgEl: SVGElement;
  readonly staticLayer: SVGElement;
  readonly needle: SVGElement;
  readonly over: SVGElement;
  readonly under: SVGElement;
  readonly readout: SVGElement;
  readonly unitText: SVGElement;
  readonly note: SVGElement;
  readonly decor: SVGElement;
  readonly quantity: Quantity;
  readonly g: Geometry;
  private _staticKey = "";
  private _angle: number | null = null;

  constructor(model: AnyModel<T>, el: HTMLElement, traits: string[] = [], geometry: Geometry = ROUND) {
    super(model, el, ["min", "max", "unit", "input_unit", "unit_system", "ticks", "minor_ticks", "zones", "resolution", "animate", ...traits]);
    this.g = geometry;
    this.quantity = QUANTITY_OF_KIND[this.kind];
    const [w, h] = geometry.vb;
    this.svgEl = svg("svg", { class: "awi-svg awa-dial", viewBox: `0 0 ${w} ${h}`, "aria-hidden": "true" });
    this.staticLayer = svg("g", { class: "awa-static" });
    this.decor = svg("g", { class: "awa-decor" });
    const { cx, cy } = geometry;
    this.needle = svg("g", { class: "awa-needle" }, [
      svg("path", { class: "awa-needle-shape", d: `M${cx - 2.5} ${cy + 10}L${cx - 1} ${cy - geometry.needle}L${cx + 1} ${cy - geometry.needle}L${cx + 2.5} ${cy + 10}Z` }),
      svg("circle", { class: "awa-hub", cx, cy, r: 6 }),
    ]);
    this.needle.style.transformOrigin = `${cx}px ${cy}px`;
    this.over = svg("path", { class: "awa-oor awa-oor-over" });
    this.under = svg("path", { class: "awa-oor awa-oor-under" });
    this.readout = svgText("", { class: "awa-readout", x: cx, y: geometry.readout, "text-anchor": "middle" });
    this.unitText = svgText("", { class: "awa-unit", x: cx, y: geometry.readout + 15, "text-anchor": "middle" });
    // under the hub on a round dial; above it on a small gauge, whose readout is just below
    this.note = svgText("", { class: "awa-note", x: cx, y: geometry === ROUND ? cy + 24 : cy - 13, "text-anchor": "middle" });
    this.svgEl.append(this.staticLayer, this.decor, this.over, this.under, this.needle, this.readout, this.unitText, this.note);
    this.body.appendChild(this.svgEl);
    this.body.setAttribute("role", "meter");
    this.body.setAttribute("aria-labelledby", this.labelEl.id);
  }

  /** Units of the widget, or undefined when a unit is not one of its quantity. */
  units(): { from: string; to: string } | undefined {
    return resolveUnits(this.quantity, { unit: this.get("unit"), input_unit: this.get("input_unit"), unit_system: this.get("unit_system") });
  }

  protected override extraInvalid(): string[] {
    const out: string[] = [];
    if (!this.units()) out.push("unit");
    if (!(Number(this.get("min")) < Number(this.get("max")))) out.push("max");
    if (!readZones((this.model as unknown as AnyModel<Traits>).get("zones"))) out.push("zones");
    return out;
  }

  /** Zones the widget adds from its own traits (a red zone, a reserve...), in input_unit. */
  ownZones(): Zone[] {
    return [];
  }

  /** Text of a major tick, in the displayed unit; "" for none. */
  tickLabel(v: number, step: number): string {
    return (Math.round(v / step) * step).toFixed(decimalsOf(step));
  }

  /** Readout rounds up (the speedometer, SPD-001) or to the nearest step. */
  roundsUp(): boolean {
    return false;
  }

  /** Text under the scale, such as a multiplier ("×1000"). */
  scaleNote(): string {
    return "";
  }

  /** Extra drawing that depends on the value (shift light, tell-tale...). `v` is in input_unit, NaN when unknown. */
  drawDecor(_v: number): void {}

  angle(f: number): number {
    return -this.g.sweep / 2 + f * this.g.sweep;
  }

  private drawStatic(lo: number, hi: number, from: string, to: string, zones: Zone[]): void {
    const { cx, cy } = this.g;
    const key = JSON.stringify([lo, hi, to, zones, this.get("ticks"), this.get("minor_ticks"), this.g.sweep, this.extraStaticKey()]);
    if (key === this._staticKey) return;
    this._staticKey = key;
    const layer = this.staticLayer;
    clear(layer);
    if (this.g.face) layer.appendChild(svg("circle", { class: "awa-face", cx, cy, r: this.g.face }));
    const frac = (v: number) => (v - lo) / (hi - lo);
    for (const z of zones) {
      const a = convert(z.from, from, to);
      const b = convert(z.to, from, to);
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      const f0 = Math.max(0, Math.min(1, frac(Math.min(a, b))));
      const f1 = Math.max(0, Math.min(1, frac(Math.max(a, b))));
      if (f1 <= f0) continue;
      layer.appendChild(svg("path", { class: `awa-zone awa-zone-${z.kind}`, d: sectorPath(cx, cy, this.g.minor, this.g.tick, this.angle(f0), this.angle(f1)) }));
    }
    const t = ticks(lo, hi, Number(this.get("ticks")) || 6, Number(this.get("minor_ticks")) || 0);
    const step = t.major.length > 1 ? t.major[1] - t.major[0] : hi - lo;
    const line = (v: number, r0: number, cls: string) => {
      const a = this.angle(frac(v));
      const [x0, y0] = polar(cx, cy, r0, a);
      const [x1, y1] = polar(cx, cy, this.g.tick, a);
      layer.appendChild(svg("line", { class: cls, x1: x0.toFixed(2), y1: y0.toFixed(2), x2: x1.toFixed(2), y2: y1.toFixed(2) }));
    };
    for (const v of t.minor) line(v, this.g.minor, "awa-tick-minor");
    for (const v of t.major) {
      line(v, this.g.major, "awa-tick-major");
      const text = this.tickLabel(v, step);
      if (!text) continue;
      const [x, y] = polar(cx, cy, this.g.label, this.angle(frac(v)));
      layer.appendChild(svgText(text, { class: "awa-tick-label", x: x.toFixed(2), y: (y + 4).toFixed(2), "text-anchor": "middle" }));
    }
    this.drawStaticExtra(layer, frac, from, to);
    // out-of-range markers at both ends (DIAL-003)
    const end = (f: number) => {
      const a = this.angle(f);
      const [x0, y0] = polar(cx, cy, this.g.tick + 1, a);
      const d = f === 0 ? -7 : 7;
      const [x1, y1] = polar(cx, cy, this.g.tick + 10, a - d / 2);
      const [x2, y2] = polar(cx, cy, this.g.tick + 10, a + d / 2);
      return `M${x0.toFixed(2)} ${y0.toFixed(2)}L${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}Z`;
    };
    setAttr(this.over, "d", end(1));
    setAttr(this.under, "d", end(0));
    setText(this.note, this.scaleNote());
  }

  /** More of the static layer (a limit marker...), and what its key depends on. */
  protected drawStaticExtra(_layer: SVGElement, _frac: (v: number) => number, _from: string, _to: string): void {}
  protected extraStaticKey(): unknown {
    return null;
  }

  override renderCommon(): void {
    super.renderCommon();
    const state = this.valueState();
    const units = this.units() ?? { from: "", to: "" };
    const zones = readZones((this.model as unknown as AnyModel<Traits>).get("zones")) ?? [];
    this.root.classList.toggle("awa-animate", !!this.get("animate"));
    // ROB-001: a stale figure says so in text, not only by its dimmed drawing
    setText(this.unitText, state === "stale" ? `${units.to} · STALE` : units.to);
    const raw = this.shown();
    let v = typeof raw === "number" ? raw : NaN;
    if (state === "invalid") v = NaN;
    if (units.from) {
      const s = convertScale(Number(this.get("min")), Number(this.get("max")), units.from, units.to);
      if (Number.isFinite(s.min) && Number.isFinite(s.max) && s.min < s.max) this.drawStatic(s.min, s.max, units.from, units.to, [...this.ownZones(), ...zones]);
      const shown = Number.isFinite(v) ? convert(v, units.from, units.to) : NaN;
      const f = Number.isFinite(shown) ? (shown - s.min) / (s.max - s.min) : NaN;
      if (Number.isFinite(f)) this._angle = this.angle(Math.max(0, Math.min(1, f)));
      // DIAL-004: an invalid value leaves the needle where it was; no value hides it (ROB-002)
      this.needle.style.transform = this._angle === null ? "" : `rotate(${this._angle.toFixed(2)}deg)`;
      this.needle.style.visibility = state === "missing" || this._angle === null ? "hidden" : "";
      const over = Number.isFinite(f) && f > 1;
      const under = Number.isFinite(f) && f < 0;
      this.over.style.visibility = over ? "visible" : "hidden";
      this.under.style.visibility = under ? "visible" : "hidden";
      const text = state === "invalid" || state === "missing" || !Number.isFinite(shown) ? (state === "ok" || state === "stale" ? "—" : STATE_TEXT[state]) : readoutNumber(shown, Number(this.get("resolution")) || 1, this.roundsUp());
      // a small gauge has no room for a unit line: the unit goes with the figure (DIAL-002, UNIT-005)
      setText(this.readout, this.g === SMALL && /\d/.test(text) ? `${text} ${units.to}` : text);
      this.root.classList.toggle("awa-over", over);
      this.root.classList.toggle("awa-under", under);
      const aria = Number.isFinite(shown) && (state === "ok" || state === "stale") ? `${text} ${units.to}${over ? ", above the scale" : under ? ", below the scale" : ""}${state === "stale" ? ", stale" : ""}` : state === "ok" ? "no value" : STATE_TEXT[state].toLowerCase();
      setAttr(this.body, "aria-valuetext", aria);
      setAttr(this.body, "aria-valuemin", Number.isFinite(s.min) ? String(s.min) : null);
      setAttr(this.body, "aria-valuemax", Number.isFinite(s.max) ? String(s.max) : null);
      setAttr(this.body, "aria-valuenow", Number.isFinite(shown) ? String(Math.max(s.min, Math.min(s.max, shown))) : null);
    } else {
      setText(this.readout, STATE_TEXT.invalid);
      setAttr(this.body, "aria-valuetext", "invalid");
    }
    this.drawDecor(state === "ok" || state === "stale" ? v : NaN);
  }
}

/** A tell-tale drawn inside a dial, lit or not (DIAL-105, DIAL-108). */
export function dialTellTale(parent: SVGElement, fn: string, x: number, y: number, size: number): SVGElement {
  const g = svg("g", { class: `awa-dial-tt awa-${FUNCTIONS[fn].colour}`, transform: `translate(${x - size / 2} ${y - size / 2}) scale(${size / 24})` });
  const sym = svg("g", { class: "awa-sym" });
  for (const [tag, attrs, content] of FUNCTIONS[fn].symbol) sym.appendChild(tag === "text" ? svgText(content ?? "", { ...attrs, "text-anchor": "middle" }) : svg(tag, attrs));
  g.appendChild(sym);
  parent.appendChild(g);
  return g;
}
