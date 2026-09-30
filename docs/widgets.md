# Widget catalog

Every widget of the catalog is **available**; each has a page saying what it shows and
which convention it follows, with its example. Each is a TypeScript front-end module
extending anywidget-instruments, with its common traits (`value`, `label`, `unit`, `min`,
`max`, `theme`, `size`, `disabled`, `visible`, `tooltip`). The examples use the Python
host binding; from Julia, Rust or a web page, the same widgets take the same traits.

!!! tip "Every picture opens a notebook"
    On the page of a widget, click its picture to drive it in a [marimo](https://marimo.io)
    notebook, in your browser, with no installation.

All widgets are **indicators**: the value is set by the kernel and only displayed. A
vehicle display is read, not operated, while driving.

## Dials

<div class="grid cards" markdown>

-   **[`Speedometer`](widgets/speedometer.md)**

    ---

    [![Speedometer, day theme](img/widgets/speedometer-light.png#only-light){ width="200" }](widgets/speedometer.md)
    [![Speedometer, night theme](img/widgets/speedometer-dark.png#only-dark){ width="200" }](widgets/speedometer.md)

    Vehicle speed, rounded up after conversion, never down; a speed limit marked on the scale.

-   **[`Tachometer`](widgets/tachometer.md)**

    ---

    [![Tachometer, day theme](img/widgets/tachometer-light.png#only-light){ width="200" }](widgets/tachometer.md)
    [![Tachometer, night theme](img/widgets/tachometer-dark.png#only-dark){ width="200" }](widgets/tachometer.md)

    Engine speed in thousands of rpm, red zone, shift light, and the ready state of a hybrid.

-   **[`FuelGauge`](widgets/fuel-gauge.md)**

    ---

    [![FuelGauge, day theme](img/widgets/fuel-gauge-light.png#only-light){ width="160" }](widgets/fuel-gauge.md)
    [![FuelGauge, night theme](img/widgets/fuel-gauge-dark.png#only-dark){ width="160" }](widgets/fuel-gauge.md)

    Fuel from E to F, the reserve zone, and the fuel pump symbol lit in it, towards the filler flap.

-   **[`TemperatureGauge`](widgets/temperature-gauge.md)**

    ---

    [![TemperatureGauge, day theme](img/widgets/temperature-gauge-light.png#only-light){ width="160" }](widgets/temperature-gauge.md)
    [![TemperatureGauge, night theme](img/widgets/temperature-gauge-dark.png#only-dark){ width="160" }](widgets/temperature-gauge.md)

    Coolant temperature, cold and hot zones, and its tell-tale lit red when hot.

</div>

## Tell-tales

<div class="grid cards" markdown>

-   **[`TellTale`](widgets/tell-tale.md)**

    ---

    [![TellTale, day theme](img/widgets/tell-tale-light.png#only-light){ width="60" }](widgets/tell-tale.md)
    [![TellTale, night theme](img/widgets/tell-tale-dark.png#only-dark){ width="60" }](widgets/tell-tale.md)

    One tell-tale: the symbol of its function, lit in the colour of its meaning, never of the theme.

-   **[`TellTaleCluster`](widgets/tell-tale-cluster.md)**

    ---

    [![TellTaleCluster, day theme](img/widgets/tell-tale-cluster-light.png#only-light){ width="280" }](widgets/tell-tale-cluster.md)
    [![TellTaleCluster, night theme](img/widgets/tell-tale-cluster-dark.png#only-dark){ width="280" }](widgets/tell-tale-cluster.md)

    A row of tell-tales: the direction indicators side by side, then the lit ones by colour.

</div>

## Digital displays

<div class="grid cards" markdown>

-   **[`TripComputer`](widgets/trip-computer.md)**

    ---

    [![TripComputer, day theme](img/widgets/trip-computer-light.png#only-light){ width="220" }](widgets/trip-computer.md)
    [![TripComputer, night theme](img/widgets/trip-computer-dark.png#only-dark){ width="220" }](widgets/trip-computer.md)

    Instant and average consumption, fuel or energy used, distance, time, range — per hour below 5 km/h.

-   **[`Odometer`](widgets/odometer.md)**

    ---

    [![Odometer, day theme](img/widgets/odometer-light.png#only-light){ width="200" }](widgets/odometer.md)
    [![Odometer, night theme](img/widgets/odometer-dark.png#only-dark){ width="200" }](widgets/odometer.md)

    Total and trip distance on drums, never rounded up.

-   **[`GearIndicator`](widgets/gear-indicator.md)**

    ---

    [![GearIndicator, day theme](img/widgets/gear-indicator-light.png#only-light){ width="90" }](widgets/gear-indicator.md)
    [![GearIndicator, night theme](img/widgets/gear-indicator-dark.png#only-dark){ width="90" }](widgets/gear-indicator.md)

    The engaged gear, and an up or down shift arrow.

</div>

## Electric and hybrid

A vehicle driven by an electric motor, alone or with an engine, is read through the
charge of its battery, the power it draws or regenerates, and an energy consumption
(EV-001 .. EV-008). Power is positive when the drivetrain drives the wheels, negative
when it regenerates.

<div class="grid cards" markdown>

-   **[`PowerMeter`](widgets/power-meter.md)**

    ---

    [![PowerMeter, day theme](img/widgets/power-meter-light.png#only-light){ width="200" }](widgets/power-meter.md)
    [![PowerMeter, night theme](img/widgets/power-meter-dark.png#only-dark){ width="200" }](widgets/power-meter.md)

    Power in kW, the regeneration zone below zero, REGEN and READY.

-   **[`StateOfChargeGauge`](widgets/state-of-charge-gauge.md)**

    ---

    [![StateOfChargeGauge, day theme](img/widgets/state-of-charge-gauge-light.png#only-light){ width="160" }](widgets/state-of-charge-gauge.md)
    [![StateOfChargeGauge, night theme](img/widgets/state-of-charge-gauge-dark.png#only-dark){ width="160" }](widgets/state-of-charge-gauge.md)

    Battery charge, the low zone and its symbol, CHARGING.

-   **[`PowerFlow`](widgets/power-flow.md)**

    ---

    [![PowerFlow, day theme](img/widgets/power-flow-light.png#only-light){ width="240" }](widgets/power-flow.md)
    [![PowerFlow, night theme](img/widgets/power-flow-dark.png#only-dark){ width="240" }](widgets/power-flow.md)

    Engine, battery and wheels: where the power goes, by arrows and in words.

</div>

## Layout

<div class="grid cards" markdown>

-   **[`Cluster`](widgets/cluster.md)**

    ---

    [![Cluster, day theme](img/cluster-light.png#only-light)](widgets/cluster.md)
    [![Cluster, night theme](img/cluster-dark.png#only-dark)](widgets/cluster.md)

    An instrument panel of any of them, with the head-up display mode.

</div>

## Units

Every widget reads its value in metric units by default and shows it in the unit system
chosen for it — `metric`, `imperial` (UK) or `us` — or in a unit of its own:

```python
aa.Speedometer(87.3, unit_system="us")                # 87.3 km/h in, 55 mph shown
aa.TemperatureGauge(90, unit_system="us", unit="°C")  # one quantity in a unit of its own
```

Fuel economy is the quantity to watch: L/100 km and mpg are reciprocal, so a scale
converted from one to the other is turned round — its better end stays marked as better
— and a figure that would be infinite, at a standstill, is not shown.

## Day and night

`theme` takes the values of anywidget-instruments — `"auto"`, `"light"`, `"dark"`,
`"system"` — and `"day"` and `"night"` (LEG-003): the day theme is the light one; the
night theme is dark, dimmer than the dark theme, with no large bright area (LEG-004).
Tell-tale colours do not change with the theme. The pictures of this catalog show the
day theme, or the night theme with a dark reading preference.

```python
aa.Speedometer(87.3, theme="night")
```

## What every dial does

Every dial reads its value, its scale, its zones and its limits in `input_unit` (the
metric unit of its quantity by default) and draws them in the unit of its unit system,
or in its own `unit`. Common traits:

* `min`, `max` — the scale, with major and minor ticks on round values (DIAL-001);
* `zones` — coloured arcs, `{"from", "to", "kind"}` with `kind` one of `"danger"`,
  `"warning"`, `"cold"`, `"charge"` (DIAL-005);
* `resolution` — the step of the readout, the value as text below the needle (DIAL-002);
* `animate` — the needle glides to a new value; never under the reduced-motion
  preference (DIS-003, A11Y-002);
* `max_age` — a value older than this is marked *STALE* (ROB-001).

A value above or below the scale stops the needle at its end and lights a marker there
(DIAL-003); NaN or an infinity leaves the needle where it was and reads *INVALID*
(DIAL-004); no value yet reads *NO VALUE*, with no needle (ROB-002). A value changing
more than twice a second is held half a second at a time rather than flicker (DIS-002).

[![Dials with no value, above the scale and invalid, day theme](img/dial-states-light.png#only-light)![Dials with no value, above the scale and invalid, night theme](img/dial-states-dark.png#only-dark)](../marimo/dials/ "Open it in marimo, in your browser")
