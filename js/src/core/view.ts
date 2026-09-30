// Base view of every automotive widget. It derives from the base view of
// anywidget-instruments, whose common traits, render scheduling, themes and
// kernel liveness it keeps (GEN-001, API-001), and adds what a vehicle display
// needs: the trait contract of this library, indicators only (API-002, API-003),
// the state of the value (ROB-001, ROB-002) and the invalid state for rejected
// traits (HOST-004).
import type { WidgetContract } from "anywidget-instruments/js/src/contract/spec.js";
import { readTrait, readValue } from "anywidget-instruments/js/src/contract/traits.js";
import type { AnyModel, Traits } from "anywidget-instruments/js/src/core/model.js";
import { BaseView } from "anywidget-instruments/js/src/core/view.js";
import { BY_KIND } from "../generated/contract.js";
import { type ValueState, valueState } from "./state.js";

/** Period of the check of max_age while a widget is displayed (ms). */
export const AGE_CHECK_MS = 250;

/** Shortest time a displayed value is held when the value changes faster (ms, DIS-002). */
export const HOLD_MS = 500;

export class AutomotiveView<T extends object = Traits> extends BaseView<T> {
  /** Time of the last update of `value` (ms), null before the first one. */
  protected _updated: number | null;
  private _warned = new Set<string>();
  private _stateNow: ValueState = "missing";
  /** The value on display and when it was put there (DIS-002). */
  protected _held: { raw: unknown; t: number };
  private _holdTimer: ReturnType<typeof setTimeout> | 0 = 0;

  constructor(model: AnyModel<T>, el: HTMLElement, traits: string[] = []) {
    super(model, el, [...traits, "value", "max_age", "_value_seq"]);
    // the base view looks the kind up in the contract of anywidget-instruments;
    // ours extends it, with the same shape
    (this as unknown as { contract: WidgetContract | undefined }).contract = BY_KIND[this.kind];
    this.root.classList.add("awa-root", this.kind);
    const raw = (model as unknown as AnyModel<Traits>).get("value");
    this._updated = raw === null || raw === undefined ? null : Date.now();
    // the first value is shown at once; later ones at most every HOLD_MS
    this._held = { raw, t: -Infinity };
    const touch = () => {
      this._updated = Date.now();
    };
    this.listen("change:value", () => {
      touch();
      this.hold();
    });
    this.listen("change:_value_seq", touch);
    this._disposers.push(() => this._holdTimer && clearTimeout(this._holdTimer));
    // max_age is a matter of time, not of trait changes
    const timer = setInterval(() => {
      if (Number(this.get("max_age")) > 0 && this.valueState() !== this._stateNow) this.schedule();
    }, AGE_CHECK_MS);
    this._disposers.push(() => clearInterval(timer));
    // API-003: nothing typed or clicked in a widget changes its value
    for (const ev of ["keydown", "wheel", "pointerdown"]) {
      const stop = (e: Event) => e.stopPropagation();
      this.body.addEventListener(ev, stop);
      this._disposers.push(() => this.body.removeEventListener(ev, stop));
    }
    // first drawing, one frame later: the subclass has built its elements by then
    this.schedule();
  }

  /**
   * DIS-002: a value changing more than twice a second is shown for at least
   * HOLD_MS each time, the latest one when the time is up, rather than flicker.
   */
  private hold(): void {
    const now = Date.now();
    const due = this._held.t + HOLD_MS;
    const take = () => {
      this._held = { raw: (this.model as unknown as AnyModel<Traits>).get("value"), t: Date.now() };
    };
    if (now >= due) take();
    else if (!this._holdTimer) {
      this._holdTimer = setTimeout(() => {
        this._holdTimer = 0;
        take();
        this.schedule();
      }, due - now);
    }
  }

  /** The value on display, read through the contract (DIS-002). */
  shown(): unknown {
    const spec = this.contract?.traits.value;
    return spec ? readTrait(spec, this._held.raw) : this._held.raw;
  }

  /**
   * Trait value read through the contract of this library: a value of the
   * wrong type gives the default, a number is clamped to the schema bounds.
   * The widget does not show that default as a figure: `invalidTraits()`
   * names the rejected traits and the view shows its invalid state.
   */
  override get<K extends keyof T & string>(name: K): T[K];
  override get(name: string): unknown;
  override get(name: string): unknown {
    const raw = (this.model as unknown as AnyModel<Traits>).get(name);
    const spec = this.contract?.traits[name];
    if (!spec) return raw;
    return readTrait(spec, raw, () => {
      if (this._warned.has(name)) return;
      this._warned.add(name);
      console.warn(`anywidget-instruments-automotive: ${this.kind}.${name}: invalid value ${JSON.stringify(raw)}`);
    });
  }

  /** Traits whose raw value the schema rejects (HOST-004). */
  invalidTraits(): string[] {
    const out: string[] = [];
    const traits = this.contract?.traits ?? {};
    for (const [name, spec] of Object.entries(traits)) {
      const raw = (this.model as unknown as AnyModel<Traits>).get(name);
      if (raw !== undefined && readValue(spec, raw) === undefined) out.push(name);
    }
    for (const name of this.extraInvalid()) if (!out.includes(name)) out.push(name);
    return out;
  }

  /** Traits a widget rejects beyond their schema (a unit of another quantity...). */
  protected extraInvalid(): string[] {
    return [];
  }

  /** State of the value now (ROB-001, ROB-002, HOST-004). */
  valueState(now = Date.now()): ValueState {
    return valueState({ invalid: this.invalidTraits(), value: this.shown(), maxAge: Number(this.get("max_age")) || 0, updated: this._updated, now });
  }

  override renderCommon(): void {
    super.renderCommon();
    const state = this.valueState();
    this._stateNow = state;
    for (const s of ["invalid", "missing", "stale"]) this.root.classList.toggle(`awa-${s}`, state === s);
    // LEG-003: the day theme is the light one; the night theme, the dark one at a
    // lower luminance (LEG-004)
    const theme = this.get("theme");
    if (theme === "day" || theme === "night") {
      this.root.classList.toggle("awi-theme-light", theme === "day");
      this.root.classList.toggle("awi-theme-dark", theme === "night");
    }
    this.root.classList.toggle("awa-night", theme === "night");
  }
}
