# API reference

The Python host binding, generated from its docstrings (DOC-001). The binding only sets
traits: what a widget shows is computed by its front end, the same from every host.

## Base classes

::: anywidget_automotives.AutomotiveWidget
::: anywidget_automotives.QuantityWidget
::: anywidget_automotives.DialWidget

## Dials

::: anywidget_automotives.Speedometer
::: anywidget_automotives.Tachometer
::: anywidget_automotives.FuelGauge
::: anywidget_automotives.TemperatureGauge

## Tell-tales

::: anywidget_automotives.TellTale
::: anywidget_automotives.TellTaleCluster

## Digital displays

::: anywidget_automotives.TripComputer
::: anywidget_automotives.Odometer
::: anywidget_automotives.GearIndicator

## Electric and hybrid drivetrains

::: anywidget_automotives.PowerMeter
::: anywidget_automotives.StateOfChargeGauge
::: anywidget_automotives.PowerFlow

## Layout

::: anywidget_automotives.Cluster

## Names from the trait contract

| Name | Content |
|---|---|
| `TELLTALE_FUNCTIONS` | Every tell-tale function |
| `TELLTALE_STATES` | `"off"`, `"on"`, `"blinking"` |
| `UNITS` | Every unit name the front end accepts (UNIT-017) |
| `UNIT_SYSTEMS` | `"metric"`, `"imperial"`, `"us"` |
| `GEARS` | The gears of a `GearIndicator` |
| `TRIP_FIELDS` | The raw figures of a trip |
