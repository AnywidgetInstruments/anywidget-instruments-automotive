// The views a Cluster can hold, keyed by `_kind`: every widget but the Cluster.
import type { AnyModel } from "anywidget-instruments/js/src/core/model.js";
import type { AutomotiveView } from "./core/view.js";
import { FuelGaugeView, PowerMeterView, SpeedometerView, StateOfChargeGaugeView, TachometerView, TemperatureGaugeView } from "./widgets/dials.js";
import { PowerFlowView } from "./widgets/powerflow.js";
import { GearIndicatorView, OdometerView, TripComputerView } from "./widgets/digital.js";
import { TellTaleClusterView, TellTaleView } from "./widgets/telltale.js";

export type ViewClass = new (model: AnyModel<any>, el: HTMLElement) => AutomotiveView<any>;

export const WIDGET_VIEWS: Record<string, ViewClass> = {
  "awa-telltale": TellTaleView,
  "awa-telltalecluster": TellTaleClusterView,
  "awa-speedometer": SpeedometerView,
  "awa-tachometer": TachometerView,
  "awa-fuelgauge": FuelGaugeView,
  "awa-temperaturegauge": TemperatureGaugeView,
  "awa-tripcomputer": TripComputerView,
  "awa-odometer": OdometerView,
  "awa-gearindicator": GearIndicatorView,
  "awa-stateofchargegauge": StateOfChargeGaugeView,
  "awa-powermeter": PowerMeterView,
  "awa-powerflow": PowerFlowView,
};

/** Where a Cluster puts a widget (CLU-001): dials on the sides, tell-tales between, digital displays below. */
export const PLACE: Record<string, "dial" | "telltale" | "digital"> = {
  "awa-speedometer": "dial",
  "awa-tachometer": "dial",
  "awa-fuelgauge": "dial",
  "awa-temperaturegauge": "dial",
  "awa-telltale": "telltale",
  "awa-telltalecluster": "telltale",
  "awa-tripcomputer": "digital",
  "awa-odometer": "digital",
  "awa-gearindicator": "digital",
  "awa-stateofchargegauge": "dial",
  "awa-powermeter": "dial",
  "awa-powerflow": "digital",
};
