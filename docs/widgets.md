# Widget catalog

Every widget below is **planned**: this page describes what it will show and which
convention it follows, so that the specification can be reviewed before any code is
written. Each is a TypeScript front-end module extending anywidget-instruments, with its
common traits (`value`, `label`, `unit`, `min`, `max`, `theme`, `size`, `disabled`,
`visible`, `tooltip`). The examples use the Python host binding; from Julia, Rust or a
web page, the same widgets take the same traits.

All widgets are **indicators**: the value is set by the kernel and only displayed. A
vehicle display is read, not operated, while driving.

## Units

Every widget reads its value in metric units by default and shows it in the unit system
chosen for it — `metric`, `imperial` (UK) or `us` — or in a unit of its own:

```python
aa.Cluster([speed, economy], unit_system="us")        # mph, mpg (US), °F
aa.TripComputer(6.2, unit="mpg (imperial)")           # one widget in its own unit
```

Fuel economy is the quantity to watch: L/100 km and mpg are reciprocal, so a scale
converted from one to the other is turned round — its better end stays marked as better
— and a figure that would be infinite, at a standstill, is not shown.

The pictures are previews, drawn with anywidget-instruments widgets by the
[cluster preview](examples.md), until the widgets are written.

## Dials

<div class="grid cards" markdown>

-   **[`Speedometer`](widgets/speedometer.md)**

    ---

    [![Speedometer preview](img/widgets/speedometer-light.png#only-light){ width="168" }](widgets/speedometer.md)
    [![Speedometer preview](img/widgets/speedometer-dark.png#only-dark){ width="168" }](widgets/speedometer.md)

    Vehicle speed on a dial, with a digital readout.

-   **[`Tachometer`](widgets/tachometer.md)**

    ---

    [![Tachometer preview](img/widgets/tachometer-light.png#only-light){ width="168" }](widgets/tachometer.md)
    [![Tachometer preview](img/widgets/tachometer-dark.png#only-dark){ width="168" }](widgets/tachometer.md)

    Engine speed, in rpm or thousands of rpm.

-   **[`FuelGauge`](widgets/fuel-gauge.md)**

    ---

    [![FuelGauge preview](img/widgets/fuel-gauge-light.png#only-light){ width="128" }](widgets/fuel-gauge.md)
    [![FuelGauge preview](img/widgets/fuel-gauge-dark.png#only-dark){ width="128" }](widgets/fuel-gauge.md)

    Fuel level as a fraction, from empty to full, with the reserve zone and the fuel pump symbol (ISO 2575) on the side of the filler flap when it is known.

-   **[`TemperatureGauge`](widgets/temperature-gauge.md)**

    ---

    [![TemperatureGauge preview](img/widgets/temperature-gauge-light.png#only-light){ width="108" }](widgets/temperature-gauge.md)
    [![TemperatureGauge preview](img/widgets/temperature-gauge-dark.png#only-dark){ width="108" }](widgets/temperature-gauge.md)

    Coolant or oil temperature, cold and hot zones, and the temperature tell-tale when the hot zone is reached.

</div>

## Tell-tales

<div class="grid cards" markdown>

-   **[`TellTale`](widgets/tell-tale.md)**

    ---

    [![TellTale preview](img/widgets/tell-tale-light.png#only-light){ width="56" }](widgets/tell-tale.md)
    [![TellTale preview](img/widgets/tell-tale-dark.png#only-dark){ width="56" }](widgets/tell-tale.md)

    One warning light: a symbol from the ISO 2575 set and a state (`off`, `on`, `blinking`). Its colour follows its meaning, not the page's theme (TEL-001):

-   **[`TellTaleCluster`](widgets/tell-tale-cluster.md)**

    ---

    [![TellTaleCluster preview](img/widgets/tell-tale-cluster-light.png#only-light){ width="240" }](widgets/tell-tale-cluster.md)
    [![TellTaleCluster preview](img/widgets/tell-tale-cluster-dark.png#only-dark){ width="240" }](widgets/tell-tale-cluster.md)

    A row of tell-tales, ordered by priority (red before amber before green) when several are lit at once.

</div>

## Digital displays

<div class="grid cards" markdown>

-   **[`TripComputer`](widgets/trip-computer.md)**

    ---

    [![TripComputer preview](img/widgets/trip-computer-light.png#only-light){ width="240" }](widgets/trip-computer.md)
    [![TripComputer preview](img/widgets/trip-computer-dark.png#only-dark){ width="240" }](widgets/trip-computer.md)

    The figures of a trip: instant and average consumption, fuel used, distance, elapsed time, range. Each figure says what it rests on — an average over 0.1 km is noise and is not shown — and a consumption at a standstill is given per hour, not per 100 km.

-   **[`Odometer`](widgets/odometer.md)**

    ---

    Total and trip distance, in a mechanical-counter style.

-   **[`GearIndicator`](widgets/gear-indicator.md)**

    ---

    The engaged gear (`P`, `R`, `N`, `D`, `1`–`8`), and an up or down shift suggestion.

</div>

## Layout

<div class="grid cards" markdown>

-   **[`Cluster`](widgets/cluster.md)**

    ---

    [![Cluster preview](img/cluster-preview-light.png#only-light)](widgets/cluster.md)
    [![Cluster preview](img/cluster-preview-dark.png#only-dark)](widgets/cluster.md)

    Arranges widgets as an instrument cluster: dials left and right, tell-tales between, and digital displays below. It carries the [head-up display mode](hud.md) and the day and night themes.

</div>
