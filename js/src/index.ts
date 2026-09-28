// anywidget-automotives front-end entry point (AFM module, GEN-003).
// One bundle serves every widget; the `_kind` trait selects the view.
import { watchModel } from "anywidget-instruments/js/src/core/liveness.js";
import type { AnyModel } from "anywidget-instruments/js/src/core/model.js";
import type { AutomotiveView } from "./core/view.js";
import { TellTaleClusterView, TellTaleView } from "./widgets/telltale.js";

type ViewClass = new (model: AnyModel<any>, el: HTMLElement) => AutomotiveView<any>;

export const VIEWS: Record<string, ViewClass> = {
  "awa-telltale": TellTaleView,
  "awa-telltalecluster": TellTaleClusterView,
};

function render({ model, el }: { model: AnyModel; el: HTMLElement }): (() => void) | undefined {
  const View = VIEWS[String(model.get("_kind"))];
  if (!View) {
    el.textContent = `anywidget-automotives: unknown widget kind "${String(model.get("_kind"))}"`;
    return undefined;
  }
  const view = new View(model, el);
  return () => view.destroy();
}

// Once per model, even when no view is displayed: kernel heartbeats (ROB-003).
function initialize({ model }: { model: AnyModel }): void {
  watchModel(model);
}

export default { initialize, render };
