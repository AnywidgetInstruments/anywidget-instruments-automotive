// The four dials of the catalog (DIAL-101 .. DIAL-108, SPD-001 .. SPD-003).
import { setAttr, svg } from "anywidget-instruments/js/src/core/dom.js";
import type { AnyModel } from "anywidget-instruments/js/src/core/model.js";
import { polar } from "anywidget-instruments/js/src/core/scale.js";
import { convert } from "../core/units.js";
import type { FuelGaugeTraits, SpeedometerTraits, TachometerTraits, TemperatureGaugeTraits } from "../generated/contract.js";
import { DialView, dialTellTale, SMALL, type Zone } from "./dial.js";

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

export class SpeedometerView extends DialView<SpeedometerTraits> {
  constructor(model: AnyModel<SpeedometerTraits>, el: HTMLElement) {
    super(model, el, ["limit"]);
  }

  // SPD-001: a speed is never shown lower than it is given
  override roundsUp(): boolean {
    return true;
  }

  protected override extraStaticKey(): unknown {
    return this.get("limit");
  }

  // SPD-003: the limit, a mark across the scale
  protected override drawStaticExtra(layer: SVGElement, frac: (v: number) => number, from: string, to: string): void {
    const limit = num(this.get("limit"));
    if (limit === null) return;
    const f = frac(convert(limit, from, to));
    if (!(f >= 0 && f <= 1)) return;
    const { cx, cy } = this.g;
    const a = this.angle(f);
    const [x0, y0] = polar(cx, cy, this.g.major - 6, a);
    const [x1, y1] = polar(cx, cy, this.g.tick + 6, a);
    layer.appendChild(svg("line", { class: "awa-limit", x1: x0.toFixed(2), y1: y0.toFixed(2), x2: x1.toFixed(2), y2: y1.toFixed(2) }));
  }

  override drawDecor(v: number): void {
    const limit = num(this.get("limit"));
    this.root.classList.toggle("awa-over-limit", limit !== null && Number.isFinite(v) && v > limit);
  }
}

export class TachometerView extends DialView<TachometerTraits> {
  readonly shift: SVGElement;
  readonly readyText: SVGElement;

  constructor(model: AnyModel<TachometerTraits>, el: HTMLElement) {
    super(model, el, ["redline", "shift_light", "ready"]);
    const { cx, cy } = this.g;
    this.shift = svg("circle", { class: "awa-shift", cx, cy: cy - 42, r: 6 });
    this.readyText = svg("text", { class: "awa-ready", x: cx, y: cy + 26, "text-anchor": "middle" });
    this.readyText.textContent = "READY";
    this.decor.append(this.shift, this.readyText);
  }

  override ownZones(): Zone[] {
    const red = num(this.get("redline"));
    return red === null ? [] : [{ from: red, to: Math.max(red, Number(this.get("max"))), kind: "danger" }];
  }

  /** Thousands of rpm on the scale when the scale reaches them, as a vehicle shows them. */
  private get thousands(): boolean {
    return Number(this.get("max")) >= 2000;
  }

  override tickLabel(v: number, step: number): string {
    return this.thousands ? String(Number((v / 1000).toPrecision(6))) : super.tickLabel(v, step);
  }

  override scaleNote(): string {
    return this.thousands ? "×1000" : "";
  }

  override drawDecor(v: number): void {
    const shift = num(this.get("shift_light"));
    // DIAL-103
    this.shift.style.display = shift === null ? "none" : "";
    this.shift.classList.toggle("awa-lit", shift !== null && Number.isFinite(v) && v >= shift);
    // DIAL-104: a stopped engine of a vehicle able to move is not read as off
    const ready = !!this.get("ready") && v === 0;
    this.readyText.style.display = ready ? "" : "none";
    this.note.style.display = ready ? "none" : "";
  }
}

export class FuelGaugeView extends DialView<FuelGaugeTraits> {
  readonly pump: SVGElement;
  readonly arrow: SVGElement;

  constructor(model: AnyModel<FuelGaugeTraits>, el: HTMLElement) {
    super(model, el, ["reserve", "filler_side"], SMALL);
    const { cx, cy } = this.g;
    this.pump = dialTellTale(this.decor, "low_fuel", cx, cy - 32, 22);
    this.arrow = svg("path", { class: "awa-filler" });
    this.decor.appendChild(this.arrow);
  }

  override ownZones(): Zone[] {
    const min = Number(this.get("min"));
    const reserve = Number(this.get("reserve"));
    return reserve > min ? [{ from: min, to: reserve, kind: "warning" }] : [];
  }

  // E and F at the ends, a half mark in the middle: a fuel gauge is read as a fraction
  override tickLabel(v: number, _step: number): string {
    const min = Number(this.get("min"));
    const max = Number(this.get("max"));
    const f = (v - min) / (max - min);
    if (Math.abs(f) < 1e-9) return "E";
    if (Math.abs(f - 1) < 1e-9) return "F";
    if (Math.abs(f - 0.5) < 1e-9) return "½";
    return "";
  }

  override drawDecor(v: number): void {
    // DIAL-105: the pump symbol lights amber in the reserve
    this.pump.classList.toggle("awa-lit", Number.isFinite(v) && v <= Number(this.get("reserve")));
    // DIAL-106: a small triangle on the side of the filler flap
    const side = this.get("filler_side");
    const { cx, cy } = this.g;
    const y = cy - 32;
    const d = side === "left" ? `M${cx - 16} ${y}l5 -4v8z` : side === "right" ? `M${cx + 16} ${y}l-5 -4v8z` : "";
    setAttr(this.arrow, "d", d || null);
    this.arrow.style.display = d ? "" : "none";
  }
}

export class TemperatureGaugeView extends DialView<TemperatureGaugeTraits> {
  readonly lamp: SVGElement;

  constructor(model: AnyModel<TemperatureGaugeTraits>, el: HTMLElement) {
    super(model, el, ["cold", "hot"], SMALL);
    const { cx, cy } = this.g;
    this.lamp = dialTellTale(this.decor, "coolant_temperature", cx, cy - 32, 22);
  }

  override ownZones(): Zone[] {
    const min = Number(this.get("min"));
    const max = Number(this.get("max"));
    const cold = num(this.get("cold"));
    const hot = num(this.get("hot"));
    const out: Zone[] = [];
    if (cold !== null && cold > min) out.push({ from: min, to: cold, kind: "cold" });
    if (hot !== null && hot < max) out.push({ from: hot, to: max, kind: "danger" });
    return out;
  }

  override drawDecor(v: number): void {
    const hot = num(this.get("hot"));
    // DIAL-108: the temperature tell-tale lights red in the hot zone
    this.lamp.classList.toggle("awa-lit", hot !== null && Number.isFinite(v) && v >= hot);
  }
}
