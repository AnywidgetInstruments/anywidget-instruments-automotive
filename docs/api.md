# API reference

The Python host binding, generated from its docstrings (DOC-001). The binding only sets
traits: what a widget shows is computed by its front end, the same from every host.

## Base classes

::: anywidget_instruments_automotive.AutomotiveWidget
::: anywidget_instruments_automotive.QuantityWidget
::: anywidget_instruments_automotive.DialWidget

## Dials

::: anywidget_instruments_automotive.Speedometer
::: anywidget_instruments_automotive.Tachometer
::: anywidget_instruments_automotive.FuelGauge
::: anywidget_instruments_automotive.TemperatureGauge

## Tell-tales

::: anywidget_instruments_automotive.TellTale
::: anywidget_instruments_automotive.TellTaleCluster

## Digital displays

::: anywidget_instruments_automotive.TripComputer
::: anywidget_instruments_automotive.Odometer
::: anywidget_instruments_automotive.GearIndicator

## Electric and hybrid drivetrains

::: anywidget_instruments_automotive.PowerMeter
::: anywidget_instruments_automotive.StateOfChargeGauge
::: anywidget_instruments_automotive.PowerFlow

## Layout

::: anywidget_instruments_automotive.Cluster

## Names from the trait contract

| Name | Content |
|---|---|
| `TELLTALE_FUNCTIONS` | Every tell-tale function |
| `TELLTALE_STATES` | `"off"`, `"on"`, `"blinking"` |
| `UNITS` | Every unit name the front end accepts (UNIT-017) |
| `UNIT_SYSTEMS` | `"metric"`, `"imperial"`, `"us"` |
| `GEARS` | The gears of a `GearIndicator` |
| `TRIP_FIELDS` | The raw figures of a trip |
