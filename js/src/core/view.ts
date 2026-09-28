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

export class AutomotiveView<T extends object = Traits> extends BaseView<T> {
  /** Time of the last update of `value` (ms), null before the first one. */
  protected _updated: number | null;
  private _warned = new Set<string>();
  private _stateNow: ValueState = "missing";

  constructor(model: AnyModel<T>, el: HTMLElement, traits: string[] = []) {
    super(model, el, [...traits, "value", "max_age", "_value_seq"]);
    // the base view looks the kind up in the contract of anywidget-instruments;
    // ours extends it, with the same shape
    (this as unknown as { contract: WidgetContract | undefined }).contract = BY_KIND[this.kind];
    this.root.classList.add("awa-root", this.kind);
    const raw = (model as unknown as AnyModel<Traits>).get("value");
    this._updated = raw === null || raw === undefined ? null : Date.now();
    const touch = () => {
      this._updated = Date.now();
    };
    this.listen("change:value", touch);
    this.listen("change:_value_seq", touch);
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
      console.warn(`anywidget-automotives: ${this.kind}.${name}: invalid value ${JSON.stringify(raw)}`);
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
    return valueState({ invalid: this.invalidTraits(), value: this.get("value"), maxAge: Number(this.get("max_age")) || 0, updated: this._updated, now });
  }

  override renderCommon(): void {
    super.renderCommon();
    const state = this.valueState();
    this._stateNow = state;
    for (const s of ["invalid", "missing", "stale"]) this.root.classList.toggle(`awa-${s}`, state === s);
  }
}
