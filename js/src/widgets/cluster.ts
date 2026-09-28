// Cluster (CLU-001 .. CLU-003, DIS-001, HUD-001 .. HUD-006, UNIT-004).
//
// The cluster draws the widgets it holds itself, from their trait
// dictionaries (section 7 of the specification): each gets a model of its own
// in memory, as a host without a kernel would give it, and the cluster sets
// on it the traits that are the cluster's to decide — theme, unit system,
// animation in head-up display mode.
import { html, setAttr, setText } from "anywidget-instruments/js/src/core/dom.js";
import type { AnyModel, Handler, Traits } from "anywidget-instruments/js/src/core/model.js";
import { AutomotiveView } from "../core/view.js";
import { BY_KIND, type ClusterTraits } from "../generated/contract.js";
import { PLACE, WIDGET_VIEWS } from "../registry.js";

/** Widgets a cluster shows when max_items is not set (DIS-001). */
export const DEFAULT_MAX_ITEMS = 8;

/** A model over a dictionary of traits, set by the cluster. */
export class SubModel implements AnyModel<Traits> {
  private handlers: Record<string, Handler[]> = {};
  constructor(private traits: Traits) {}
  get(name: string): unknown {
    return this.traits[name];
  }
  set(name: string, value: unknown): void {
    if (JSON.stringify(this.traits[name]) === JSON.stringify(value)) return;
    this.traits[name] = value;
    this.fire(`change:${name}`);
  }
  save_changes(): void {}
  on(event: string, cb: Handler): void {
    (this.handlers[event] ||= []).push(cb);
  }
  off(event?: string | null, cb?: Handler | null): void {
    if (!event) this.handlers = {};
    else this.handlers[event] = cb ? (this.handlers[event] || []).filter((h) => h !== cb) : [];
  }
  send(): void {}
  fire(event: string, ...args: unknown[]): void {
    for (const h of (this.handlers[event] || []).slice()) h(...args);
  }
}

interface Cell {
  kind: string;
  el: HTMLElement;
  model: SubModel | null;
  destroy: () => void;
}

const isItem = (v: unknown): v is Traits & { _kind: string } => typeof v === "object" && v !== null && !Array.isArray(v) && typeof (v as Traits)._kind === "string";

/** Defaults of a widget from the contract, as a host reads them. */
function defaultsOf(kind: string): Traits {
  return Object.fromEntries(Object.entries(BY_KIND[kind].traits).map(([k, s]) => [k, s.default]));
}

/**
 * The widgets a cluster shows, in order (DIS-001, HUD-004): in head-up display
 * mode the speed and the widgets marked `hud`; at most `max` of them.
 */
export function visibleItems(items: unknown[], hud: boolean, max: number): { shown: unknown[]; hidden: unknown[] } {
  const eligible = hud ? items.filter((it) => isItem(it) && (it._kind === "awa-speedometer" || it.hud === true)) : items;
  return { shown: eligible.slice(0, max), hidden: eligible.slice(max) };
}

export class ClusterView extends AutomotiveView<ClusterTraits> {
  readonly panel: HTMLElement;
  readonly areas: Record<"left" | "mid" | "right" | "bottom", HTMLElement>;
  readonly note: HTMLElement;
  private _cells: Cell[] = [];

  constructor(model: AnyModel<ClusterTraits>, el: HTMLElement) {
    super(model, el, ["unit_system", "brightness", "max_items", "hud"]);
    const area = (name: string) => html("div", { cls: `awa-area awa-area-${name}` });
    this.areas = { left: area("left"), mid: area("mid"), right: area("right"), bottom: area("bottom") };
    this.panel = html("div", { cls: "awa-panel" }, [this.areas.left, this.areas.mid, this.areas.right, this.areas.bottom]);
    this.note = html("div", { cls: "awa-cluster-note", attrs: { role: "status" } });
    this.body.append(this.panel, this.note);
    this.body.setAttribute("role", "group");
    this.body.setAttribute("aria-labelledby", this.labelEl.id);
    // heartbeats of the host reach the widgets held (ROB-003)
    this.listen("msg:custom", (msg: unknown) => {
      for (const c of this._cells) c.model?.fire("msg:custom", msg);
    });
  }

  /** The cluster shows its widgets as they are set, each holding its own value (DIS-002). */
  override shown(): unknown {
    return (this.model as unknown as AnyModel<Traits>).get("value");
  }

  override invalidTraits(): string[] {
    // an item is shown invalid in its place; the list itself is invalid only if it is not a list
    const raw = (this.model as unknown as AnyModel<Traits>).get("value");
    return super.invalidTraits().filter((n) => n !== "value" || !Array.isArray(raw));
  }

  /** Traits the cluster decides for every widget it holds (CLU-002, UNIT-004, HUD-005). */
  private imposed(): Traits {
    const hud = !!this.get("hud");
    const out: Traits = {
      unit_system: this.get("unit_system"),
      _session: (this.model as unknown as AnyModel<Traits>).get("_session") ?? "",
      _heartbeat: (this.model as unknown as AnyModel<Traits>).get("_heartbeat") ?? 0,
    };
    if (this.get("theme") !== "auto") out.theme = this.get("theme");
    if (hud) out.animate = false;
    return out;
  }

  private place(kind: string, dialIndex: number): HTMLElement {
    const p = PLACE[kind];
    if (p === "dial") return dialIndex % 2 === 0 ? this.areas.left : this.areas.right;
    if (p === "telltale") return this.areas.mid;
    return this.areas.bottom;
  }

  private cell(item: unknown): Cell {
    const el = html("div", { cls: "awa-cell" });
    if (!isItem(item) || !WIDGET_VIEWS[item._kind]) {
      el.classList.add("awa-cell-invalid");
      setText(el, "INVALID");
      el.setAttribute("role", "status");
      return { kind: "", el, model: null, destroy: () => el.remove() };
    }
    const model = new SubModel({ ...defaultsOf(item._kind), ...item, ...this.imposed() });
    const view = new WIDGET_VIEWS[item._kind](model as unknown as AnyModel<any>, el);
    return {
      kind: item._kind,
      el,
      model,
      destroy: () => {
        view.destroy();
        el.remove();
      },
    };
  }

  override renderCommon(): void {
    super.renderCommon();
    this.body.style.width = "";
    this.body.style.height = "";
    const hud = !!this.get("hud");
    this.root.classList.toggle("awa-hud-on", hud);
    const b = Number(this.get("brightness"));
    this.panel.style.filter = b < 1 ? `brightness(${b})` : "";
    const raw = (this.model as unknown as AnyModel<Traits>).get("value");
    const items = Array.isArray(raw) ? raw : [];
    const maxItems = this.get("max_items");
    const { shown, hidden } = visibleItems(items, hud, typeof maxItems === "number" ? maxItems : DEFAULT_MAX_ITEMS);
    const imposed = this.imposed();
    let dials = 0;
    shown.forEach((item, i) => {
      let c = this._cells[i];
      const kind = isItem(item) && WIDGET_VIEWS[item._kind] ? item._kind : "";
      if (!c || c.kind !== kind || !kind) {
        c?.destroy();
        c = this.cell(item);
        this._cells[i] = c;
      } else if (c.model) {
        const traits: Traits = { ...defaultsOf(kind), ...(item as Traits), ...imposed };
        for (const [k, v] of Object.entries(traits)) c.model.set(k, v);
      }
      const area = this.place(kind, PLACE[kind] === "dial" ? dials++ : 0);
      if (c.el.parentElement !== area || area.children[area.children.length - 1] !== c.el) area.appendChild(c.el);
    });
    for (const c of this._cells.splice(shown.length)) c.destroy();
    // DIS-001: the widgets left out are named, not silently dropped
    const names = hidden.map((it) => (isItem(it) ? String(it.label || BY_KIND[it._kind]?.className || it._kind) : "?"));
    setText(this.note, names.length ? `${names.length} more not shown: ${names.join(", ")}` : "");
    this.note.hidden = !names.length;
    setAttr(this.body, "aria-description", hud ? "head-up display, mirrored" : null);
  }

  override destroy(): void {
    for (const c of this._cells) c.destroy();
    this._cells = [];
    super.destroy();
  }
}
