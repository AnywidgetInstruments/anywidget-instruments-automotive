// Digital displays: TripComputer, Odometer, GearIndicator (DIG-001 .. DIG-007).
import { html, setAttr, setText, svg } from "anywidget-instruments/js/src/core/dom.js";
import type { AnyModel } from "anywidget-instruments/js/src/core/model.js";
import { STATE_TEXT } from "../core/state.js";
import { electricRows, readTrip, type Row, tripRows } from "../core/trip.js";
import { convert, quantityOf, type UnitSystem, resolveUnits } from "../core/units.js";
import { AutomotiveView } from "../core/view.js";
import type { GearIndicatorTraits, OdometerTraits, TripComputerTraits } from "../generated/contract.js";

const system = (v: unknown): UnitSystem => (v === "imperial" || v === "us" ? v : "metric");

/** A line of text saying why a widget shows no figure, or nothing (HOST-004, ROB-001, ROB-002). */
function stateLine(parent: HTMLElement): HTMLElement {
  const el = html("div", { cls: "awa-state-line", attrs: { role: "status" } });
  parent.appendChild(el);
  return el;
}

export class TripComputerView extends AutomotiveView<TripComputerTraits> {
  readonly list: HTMLElement;
  readonly state: HTMLElement;
  private _rows = new Map<string, { dt: HTMLElement; num: HTMLElement; unit: HTMLElement; why: HTMLElement }>();

  constructor(model: AnyModel<TripComputerTraits>, el: HTMLElement) {
    super(model, el, ["unit", "unit_system", "energy"]);
    this.state = stateLine(this.body);
    this.list = html("dl", { cls: "awa-trip" });
    this.body.appendChild(this.list);
    this.body.setAttribute("role", "group");
    this.body.setAttribute("aria-labelledby", this.labelEl.id);
  }

  private electric(): boolean {
    return this.get("energy") === "electric";
  }

  protected override extraInvalid(): string[] {
    const out = readTrip(this._held.raw) === undefined ? ["value"] : [];
    // a consumption unit of the other energy is not a unit of this display
    const unit = String(this.get("unit") || "");
    if (unit && (quantityOf(unit) === "energy_economy") !== this.electric()) out.push("unit");
    return out;
  }

  rows(): Row[] {
    const trip = readTrip(this._held.raw) ?? {};
    const unit = String(this.get("unit") || "");
    return (this.electric() ? electricRows : tripRows)(trip, system(this.get("unit_system")), unit);
  }

  override renderCommon(): void {
    super.renderCommon();
    const state = this.valueState();
    setText(this.state, state === "ok" ? "" : STATE_TEXT[state]);
    this.state.hidden = state === "ok";
    const rows = state === "invalid" || state === "missing" ? [] : this.rows();
    const keep = new Set<string>(rows.map((r) => r.key));
    for (const [k, r] of this._rows) {
      if (!keep.has(k)) {
        r.dt.remove();
        r.num.parentElement!.remove();
        this._rows.delete(k);
      }
    }
    for (const row of rows) {
      let r = this._rows.get(row.key);
      if (!r) {
        const dt = html("dt");
        const num = html("span", { cls: "awa-trip-num" });
        const unit = html("span", { cls: "awa-trip-unit" });
        const why = html("span", { cls: "awa-trip-why" });
        const dd = html("dd", {}, [num, unit, why]);
        this.list.append(dt, dd);
        r = { dt, num, unit, why };
        this._rows.set(row.key, r);
      }
      setText(r.dt, row.label);
      // a figure that cannot be given is a dash with its reason, never a zero (DIG-003, UNIT-016)
      setText(r.num, row.text ?? "—");
      setText(r.unit, row.text === null ? "" : row.unit);
      setText(r.why, row.text === null && row.why ? row.why : row.key === "instant" && row.why ? row.why : "");
      setAttr(r.num.parentElement!, "data-key", row.key);
    }
  }
}

export class OdometerView extends AutomotiveView<OdometerTraits> {
  readonly total: HTMLElement;
  readonly trip: HTMLElement;
  readonly totalUnit: HTMLElement;
  readonly tripUnit: HTMLElement;
  readonly state: HTMLElement;

  constructor(model: AnyModel<OdometerTraits>, el: HTMLElement) {
    super(model, el, ["trip", "digits", "unit", "input_unit", "unit_system"]);
    this.state = stateLine(this.body);
    this.total = html("span", { cls: "awa-drums" });
    this.totalUnit = html("span", { cls: "awa-odo-unit" });
    this.trip = html("span", { cls: "awa-drums awa-drums-trip" });
    this.tripUnit = html("span", { cls: "awa-odo-unit" });
    this.body.append(
      html("div", { cls: "awa-odo-row" }, [this.total, this.totalUnit]),
      html("div", { cls: "awa-odo-row awa-odo-trip" }, [html("span", { cls: "awa-odo-tag", text: "TRIP" }), this.trip, this.tripUnit]),
    );
    this.body.setAttribute("role", "img");
  }

  units(): { from: string; to: string } | undefined {
    return resolveUnits("distance", { unit: this.get("unit"), input_unit: this.get("input_unit"), unit_system: this.get("unit_system") });
  }

  protected override extraInvalid(): string[] {
    return this.units() ? [] : ["unit"];
  }

  /** Drums of a counter: whole units of the distance covered, never rounded up. */
  static drums(v: number, digits: number, decimals: number): string {
    const scaled = Math.floor(v * 10 ** decimals + 1e-9);
    return String(Math.max(0, scaled)).padStart(digits + decimals, "0");
  }

  private fill(el: HTMLElement, text: string, decimals: number): void {
    const chars = [...text];
    while (el.children.length > chars.length) el.lastElementChild!.remove();
    while (el.children.length < chars.length) el.appendChild(html("span", { cls: "awa-drum" }));
    chars.forEach((c, i) => {
      const d = el.children[i] as HTMLElement;
      setText(d, c);
      d.classList.toggle("awa-drum-tenth", i >= chars.length - decimals);
    });
  }

  override renderCommon(): void {
    super.renderCommon();
    const state = this.valueState();
    const units = this.units();
    setText(this.state, state === "ok" ? "" : STATE_TEXT[state]);
    this.state.hidden = state === "ok";
    const to = units?.to ?? "";
    setText(this.totalUnit, to);
    setText(this.tripUnit, to);
    const digits = Number(this.get("digits")) || 6;
    const raw = this.shown();
    const total = typeof raw === "number" && units && (state === "ok" || state === "stale") ? convert(raw, units.from, units.to) : NaN;
    this.fill(this.total, Number.isFinite(total) ? OdometerView.drums(total, digits, 0) : "-".repeat(digits), 0);
    const tripRaw = this.get("trip");
    const trip = typeof tripRaw === "number" && units && state !== "invalid" ? convert(tripRaw, units.from, units.to) : NaN;
    this.trip.parentElement!.hidden = tripRaw === null;
    this.fill(this.trip, Number.isFinite(trip) ? OdometerView.drums(trip, 4, 1) : "-----", 1);
    const text = Number.isFinite(total) ? `${Math.floor(total + 1e-9)} ${to}` : STATE_TEXT[state === "ok" ? "missing" : (state as "invalid")].toLowerCase();
    setAttr(this.body, "aria-label", `${String(this.get("label") || "Odometer")}: ${text}${Number.isFinite(trip) ? `, trip ${(Math.floor(trip * 10 + 1e-9) / 10).toFixed(1)} ${to}` : ""}`);
  }
}

export class GearIndicatorView extends AutomotiveView<GearIndicatorTraits> {
  readonly gear: HTMLElement;
  readonly arrow: SVGElement;
  readonly arrowPath: SVGElement;

  constructor(model: AnyModel<GearIndicatorTraits>, el: HTMLElement) {
    super(model, el, ["suggestion"]);
    this.arrowPath = svg("path", { class: "awa-shift-arrow" });
    this.arrow = svg("svg", { class: "awa-gear-arrow", viewBox: "0 0 20 20", "aria-hidden": "true" }, [this.arrowPath]);
    this.gear = html("div", { cls: "awa-gear" });
    this.body.append(this.arrow as unknown as HTMLElement, this.gear);
    this.body.setAttribute("role", "img");
  }

  override renderCommon(): void {
    super.renderCommon();
    const state = this.valueState();
    const g = this.shown();
    const gear = state === "ok" || state === "stale" ? String(g) : state === "missing" ? "–" : "?";
    setText(this.gear, gear);
    this.root.classList.toggle("awa-gear-reverse", g === "R" && state === "ok");
    const s = this.get("suggestion");
    // DIG-007: an arrow up or down, beside the gear
    setAttr(this.arrowPath, "d", s === "up" ? "M10 2L18 12H13V18H7V12H2Z" : s === "down" ? "M10 18L18 8H13V2H7V8H2Z" : null);
    (this.arrow as unknown as HTMLElement).style.visibility = s ? "visible" : "hidden";
    const what = state === "ok" || state === "stale" ? `gear ${String(g)}` : STATE_TEXT[state].toLowerCase();
    setAttr(this.body, "aria-label", `${String(this.get("label") || "Gear")}: ${what}${s ? `, shift ${s}` : ""}${state === "stale" ? ", stale" : ""}`);
  }
}
