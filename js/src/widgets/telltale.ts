// TellTale and TellTaleCluster (TEL-001 .. TEL-008).
import { html, setAttr, setText, svg, svgText } from "anywidget-instruments/js/src/core/dom.js";
import type { AnyModel } from "anywidget-instruments/js/src/core/model.js";
import { STATE_TEXT, type ValueState } from "../core/state.js";
import { AutomotiveView } from "../core/view.js";
import type { TellTaleClusterTraits, TellTaleTraits } from "../generated/contract.js";
import { BLINK_HZ, COLOUR_ORDER, FUNCTIONS, type TellTaleFunction, type TellTaleState } from "./telltales.js";

/** A tell-tale as drawn: its function, and a state or the reason there is none. */
export interface Lamp {
  fn: TellTaleFunction | undefined;
  function: string;
  state: TellTaleState | Exclude<ValueState, "ok">;
  label: string;
}

const STATES = new Set(["off", "on", "blinking"]);

export const lit = (l: Lamp): boolean => l.state === "on" || l.state === "blinking";

/**
 * Order of a cluster (TEL-006): the lit tell-tales first, red, then amber, then
 * green and blue, each colour in the order given; then the others, in the order
 * given, so that nothing moves among them when one lights up.
 */
export function orderLamps(lamps: Lamp[]): Lamp[] {
  const on = lamps.filter(lit).map((l, i) => ({ l, i }));
  on.sort((a, b) => COLOUR_ORDER[a.l.fn!.colour] - COLOUR_ORDER[b.l.fn!.colour] || a.i - b.i);
  return [...on.map((x) => x.l), ...lamps.filter((l) => !lit(l))];
}

/** Accessible text of a tell-tale: its name and its state. */
export function lampText(l: Lamp): string {
  const state = l.state === "invalid" || l.state === "missing" || l.state === "stale" ? STATE_TEXT[l.state].toLowerCase() : l.state;
  return `${l.label}: ${state}`;
}

/** Tile of one tell-tale: a dark ground, the symbol, a flag for a state colour cannot give. */
function tile(): { el: HTMLElement; svgEl: SVGElement; sym: SVGElement; flag: HTMLElement; name: HTMLElement } {
  const svgEl = svg("svg", { class: "awa-tt-svg", viewBox: "0 0 24 24", "aria-hidden": "true" });
  svgEl.appendChild(svg("rect", { class: "awa-tt-ground", x: 0, y: 0, width: 24, height: 24, rx: 3 }));
  const sym = svg("g", { class: "awa-sym" });
  svgEl.appendChild(sym);
  const flag = html("div", { cls: "awa-tt-flag" });
  const name = html("div", { cls: "awa-tt-name" });
  const el = html("div", { cls: "awa-tt" }, [html("div", { cls: "awa-tt-tile" }, [svgEl, flag]), name]);
  return { el, svgEl, sym, flag, name };
}

/** Draw a tell-tale into a tile; the symbol is redrawn only when the function changes. */
function paint(t: ReturnType<typeof tile>, l: Lamp): void {
  const el = t.el;
  if (el.dataset.function !== l.function) {
    el.dataset.function = l.function;
    while (t.sym.firstChild) t.sym.removeChild(t.sym.firstChild);
    for (const [tag, attrs, content] of l.fn?.symbol ?? []) t.sym.appendChild(tag === "text" ? svgText(content ?? "", { ...attrs, "text-anchor": "middle" }) : svg(tag, attrs));
  }
  for (const c of ["red", "amber", "green", "blue"]) el.classList.toggle(`awa-${c}`, l.fn?.colour === c);
  for (const s of ["off", "on", "blinking", "invalid", "missing", "stale"]) el.classList.toggle(`awa-tt-${s}`, l.state === s);
  // TEL-007: the period is set here, from the one constant tested against 1 to 2 Hz
  el.style.setProperty("--awa-blink-period", `${(1 / BLINK_HZ).toFixed(3)}s`);
  const flag = l.state === "invalid" || l.state === "missing" || l.state === "stale" ? STATE_TEXT[l.state] : l.state === "blinking" ? "BLINKING" : "";
  setText(t.flag, flag);
  t.flag.hidden = !flag;
  setText(t.name, l.label);
  setAttr(el, "aria-label", lampText(l));
  setAttr(el, "data-state", l.state);
}

function lampOf(fnName: unknown, state: unknown, label: unknown, fallback: Exclude<ValueState, "ok"> | null): Lamp {
  const fn = typeof fnName === "string" ? FUNCTIONS[fnName] : undefined;
  const name = typeof label === "string" && label ? label : (fn?.name ?? String(fnName ?? ""));
  let s: Lamp["state"];
  if (fallback) s = fallback;
  else if (!fn) s = "invalid";
  else if (state === null || state === undefined) s = "missing";
  else s = STATES.has(state as string) ? (state as TellTaleState) : "invalid";
  return { fn, function: typeof fnName === "string" ? fnName : "", state: s, label: name };
}

export class TellTaleView extends AutomotiveView<TellTaleTraits> {
  readonly t: ReturnType<typeof tile>;

  constructor(model: AnyModel<TellTaleTraits>, el: HTMLElement) {
    super(model, el, ["function"]);
    this.t = tile();
    this.body.appendChild(this.t.el);
    this.body.setAttribute("role", "img");
  }

  lamp(): Lamp {
    const state = this.valueState();
    return lampOf(this.get("function"), this.get("value"), this.get("label"), state === "ok" ? null : state);
  }

  override renderCommon(): void {
    super.renderCommon();
    const l = this.lamp();
    // TEL-003: the name as text as well as the symbol
    setText(this.labelEl, l.label);
    this.labelEl.hidden = !l.label;
    this.t.name.hidden = true;
    paint(this.t, l);
    setAttr(this.body, "aria-label", lampText(l));
  }
}

export class TellTaleClusterView extends AutomotiveView<TellTaleClusterTraits> {
  readonly list: HTMLElement;
  /** State of the whole row, when it is not a state of one tell-tale (HOST-004, ROB-001). */
  readonly flag: HTMLElement;
  private _tiles: Array<ReturnType<typeof tile>> = [];

  constructor(model: AnyModel<TellTaleClusterTraits>, el: HTMLElement) {
    super(model, el);
    this.list = html("div", { cls: "awa-tt-list", attrs: { role: "list" } });
    this.flag = html("div", { cls: "awa-row-flag", attrs: { role: "status" } });
    this.body.append(this.flag, this.list);
    this.body.setAttribute("aria-labelledby", this.labelEl.id);
  }

  /** The raw items: the array schema drops rejected items, a cluster shows them invalid. */
  lamps(): Lamp[] {
    const raw = (this.model as unknown as AnyModel<Record<string, unknown>>).get("value");
    const state = this.valueState();
    const whole = state === "stale" ? "stale" : null;
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => {
      if (typeof item !== "object" || item === null || Array.isArray(item)) return lampOf("", null, "", "invalid");
      const { function: fn, state: s, label, ...extra } = item as Record<string, unknown>;
      const bad = Object.keys(extra).length > 0 || (label !== undefined && typeof label !== "string") || !("state" in item);
      return lampOf(fn, s, label, bad ? "invalid" : whole);
    });
  }

  /** An array of items is shown item by item: a rejected item does not make the whole row invalid. */
  override invalidTraits(): string[] {
    const raw = (this.model as unknown as AnyModel<Record<string, unknown>>).get("value");
    return super.invalidTraits().filter((n) => n !== "value" || !Array.isArray(raw));
  }

  override valueState(now = Date.now()): ValueState {
    const s = super.valueState(now);
    // an empty row is a row, not a missing value
    return s === "missing" ? "ok" : s;
  }

  override renderCommon(): void {
    super.renderCommon();
    const [w, h] = (this.get("size") as [number, number] | undefined) || [56, 56];
    // size is the size of one tell-tale; the row wraps within the output
    this.body.style.width = "";
    this.body.style.height = "";
    this.root.style.setProperty("--awa-tile", `${Math.min(w, h)}px`);
    const state = this.valueState();
    const invalidRow = state === "invalid";
    setText(this.flag, state === "ok" || state === "missing" ? "" : STATE_TEXT[state]);
    this.flag.hidden = !this.flag.textContent;
    const lamps = orderLamps(this.lamps().map((l) => (invalidRow ? { ...l, state: "invalid" as const } : l)));
    while (this._tiles.length < lamps.length) {
      const t = tile();
      t.el.setAttribute("role", "listitem");
      this._tiles.push(t);
    }
    while (this._tiles.length > lamps.length) this._tiles.pop()!.el.remove();
    lamps.forEach((l, i) => {
      const t = this._tiles[i];
      paint(t, l);
      if (this.list.children[i] !== t.el) this.list.insertBefore(t.el, this.list.children[i] ?? null);
    });
    const count = lamps.filter(lit).length;
    setAttr(this.body, "aria-description", `${count} lit of ${lamps.length}`);
  }
}
