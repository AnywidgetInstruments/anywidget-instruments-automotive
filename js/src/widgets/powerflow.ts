// PowerFlow (EV-007): which of the engine, the battery and the wheels deliver
// and receive power in a hybrid drivetrain, by arrows and in text.
import { html, setAttr, setText, svg, svgText } from "anywidget-instruments/js/src/core/dom.js";
import type { AnyModel } from "anywidget-instruments/js/src/core/model.js";
import { STATE_TEXT } from "../core/state.js";
import { AutomotiveView } from "../core/view.js";
import type { PowerFlowTraits } from "../generated/contract.js";

export type Node = "engine" | "battery" | "wheels";
export interface Flow {
  from: Node;
  to: Node;
}
export interface Powers {
  engine?: number | null;
  battery?: number | null;
  wheels?: number | null;
}

/** Below this power (kW) a node is taken as idle: sensor noise is not a flow. */
export const IDLE_KW = 0.1;

const NAMES: Record<Node, string> = { engine: "Engine", battery: "Battery", wheels: "Wheels" };

/** The flows between the nodes, from the power of each. */
export function flows(p: Powers): Flow[] {
  const on = (v: number | null | undefined, sign: 1 | -1) => typeof v === "number" && Number.isFinite(v) && sign * v > IDLE_KW;
  const out: Flow[] = [];
  if (on(p.engine, 1) && on(p.wheels, 1)) out.push({ from: "engine", to: "wheels" });
  if (on(p.engine, 1) && on(p.battery, -1)) out.push({ from: "engine", to: "battery" });
  if (on(p.battery, 1) && !on(p.wheels, -1)) out.push({ from: "battery", to: "wheels" });
  // regeneration: braking wheels charge the battery
  if (on(p.wheels, -1) && !on(p.battery, 1)) out.push({ from: "wheels", to: "battery" });
  return out;
}

/** The mode a driver reads: EV, HYBRID, ENGINE, CHARGING, REGEN or IDLE. */
export function mode(f: Flow[]): string {
  const has = (from: Node, to: Node) => f.some((x) => x.from === from && x.to === to);
  if (has("wheels", "battery")) return "REGEN";
  if (has("engine", "wheels") && has("battery", "wheels")) return "HYBRID";
  if (has("battery", "wheels")) return "EV";
  if (has("engine", "wheels")) return has("engine", "battery") ? "ENGINE + CHARGING" : "ENGINE";
  if (has("engine", "battery")) return "CHARGING";
  return "IDLE";
}

/** A powers dictionary as the schema describes it; `undefined` when a field is rejected (HOST-004). */
export function readPowers(raw: unknown): Powers | undefined {
  if (raw === null) return {};
  if (typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: Powers = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (k !== "engine" && k !== "battery" && k !== "wheels") return undefined;
    if (v !== null && (typeof v !== "number" || !Number.isFinite(v) || (k === "engine" && v < 0))) return undefined;
    out[k] = v as number | null;
  }
  return out;
}

const POS: Record<Node, [number, number]> = { engine: [40, 30], battery: [40, 110], wheels: [200, 70] };

export class PowerFlowView extends AutomotiveView<PowerFlowTraits> {
  readonly svgEl: SVGElement;
  readonly arrows: Record<string, SVGElement> = {};
  readonly nodes: Record<Node, SVGElement>;
  readonly kw: Record<Node, SVGElement>;
  readonly modeEl: HTMLElement;
  readonly text: HTMLElement;

  constructor(model: AnyModel<PowerFlowTraits>, el: HTMLElement) {
    super(model, el);
    this.svgEl = svg("svg", { class: "awi-svg awa-flow", viewBox: "0 0 240 140", "aria-hidden": "true" });
    const defs = svg("defs", {}, [svg("marker", { id: `${this.id}-head`, viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 5, markerHeight: 5, orient: "auto-start-reverse" }, [svg("path", { d: "M0 0L10 5L0 10z", class: "awa-flow-head" })])]);
    this.svgEl.appendChild(defs);
    const pairs: Array<[Node, Node]> = [["engine", "wheels"], ["engine", "battery"], ["battery", "wheels"], ["wheels", "battery"]];
    for (const [a, b] of pairs) {
      const [x0, y0] = POS[a];
      const [x1, y1] = POS[b];
      // two arrows between battery and wheels, one each way, side by side
      const off = a === "wheels" ? 7 : b === "wheels" && a === "battery" ? -7 : 0;
      const shrink = (t: number) => [x0 + (x1 - x0) * t, y0 + off + (y1 - y0) * t];
      const [sx, sy] = shrink(0.25);
      const [ex, ey] = shrink(0.75);
      const d = a === "engine" && b === "battery" ? `M${x0 + 12} ${y0 + 22}L${x1 + 12} ${y1 - 22}` : `M${sx.toFixed(1)} ${sy.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}`;
      const path = svg("path", { class: "awa-flow-arrow", d });
      this.arrows[`${a}>${b}`] = path;
      this.svgEl.appendChild(path);
    }
    const node = (n: Node) => {
      const [x, y] = POS[n];
      const g = svg("g", { class: `awa-flow-node awa-flow-${n}` }, [svg("rect", { x: x - 34, y: y - 16, width: 68, height: 32, rx: 6 }), svgText(NAMES[n], { x, y: y - 2, "text-anchor": "middle", class: "awa-flow-name" })]);
      this.svgEl.appendChild(g);
      return g;
    };
    this.nodes = { engine: node("engine"), battery: node("battery"), wheels: node("wheels") };
    const kw = (n: Node) => {
      const [x, y] = POS[n];
      const t = svgText("", { x, y: y + 11, "text-anchor": "middle", class: "awa-flow-kw" });
      this.svgEl.appendChild(t);
      return t;
    };
    this.kw = { engine: kw("engine"), battery: kw("battery"), wheels: kw("wheels") };
    this.modeEl = html("div", { cls: "awa-flow-mode" });
    this.text = html("div", { cls: "awa-flow-text" });
    this.body.append(this.modeEl, this.svgEl as unknown as HTMLElement, this.text);
    this.body.setAttribute("role", "img");
  }

  protected override extraInvalid(): string[] {
    return readPowers(this._held.raw) === undefined ? ["value"] : [];
  }

  override renderCommon(): void {
    super.renderCommon();
    this.body.style.height = "";
    const state = this.valueState();
    const p = state === "ok" || state === "stale" ? (readPowers(this._held.raw) ?? {}) : {};
    const f = flows(p);
    for (const [key, el] of Object.entries(this.arrows)) {
      const on = f.some((x) => `${x.from}>${x.to}` === key);
      el.classList.toggle("awa-on", on);
      // a head only on a live flow: an idle path has no direction
      setAttr(el, "marker-end", on ? `url(#${this.id}-head)` : null);
    }
    for (const n of ["engine", "battery", "wheels"] as Node[]) {
      const v = p[n];
      setText(this.kw[n], typeof v === "number" ? `${(Math.round(v * 10) / 10 + 0).toFixed(1)} kW` : "—");
      this.nodes[n].classList.toggle("awa-on", f.some((x) => x.from === n || x.to === n));
    }
    const m = state === "ok" || state === "stale" ? mode(f) : STATE_TEXT[state];
    setText(this.modeEl, m);
    // the flows in words, so that the arrows are never the only cue
    const words = f.map((x) => `${NAMES[x.from]} → ${NAMES[x.to].toLowerCase()}`).join(", ");
    setText(this.text, words);
    setAttr(this.body, "aria-label", `${String(this.get("label") || "Power flow")}: ${m.toLowerCase()}${words ? `; ${words}` : ""}${state === "stale" ? ", stale" : ""}`);
  }
}
